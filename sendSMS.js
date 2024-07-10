const { getDb } = require('./database');
const { ObjectId } = require('mongodb');
const Twilio = require('twilio');

// Function to replace placeholders in the template with actual contact values
function parseAndReplace(template, contact) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, p1) => contact[p1] || '');
}

async function sendSMS(messageData, contact) {
    const db = getDb();
    const contactsCollection = db.collection('contacts');
    const chatsCollection = db.collection('chats');

    // Find user by contact.ownerId
    const user = await db.collection('users').findOne({ _id: new ObjectId(contact.ownerId) });
    if (!user) {
        console.error('User not found');
        return;
    }

    // Find agency by user.agencyId
    const agency = await db.collection('agencies').findOne({ _id: new ObjectId(user.agencyId) });
    if (!agency || !agency.smsPhoneConfig) {
        console.error('Agency or SMS configuration not found');
        return;
    }

    // Setup Twilio client with agency's SMS configuration
    const twilioClient = Twilio(agency.smsPhoneConfig.twilioAccountSid, agency.smsPhoneConfig.twilioAuthToken);

    // Personalize message text using parseAndReplace function
    const personalizedText = parseAndReplace(messageData.text, contact);

    // Ensure contact's phone number is in E.164 format
    const to = contact.mobile; // Assume contact.mobile is correctly formatted
    const from = agency.smsPhoneConfig.twilioNumber;

    // Send SMS through Twilio
    try {
        const twilioResponse = await twilioClient.messages.create({
            body: personalizedText,
            to: to,
            from: from
        });

        console.log(`SMS sent successfully to ${to}: ${twilioResponse.sid}`);

        // Date and time formatting
        const now = new Date();
        const hours = now.getHours() % 12 || 12; // converts 0 to 12 for midnight
        const minutes = now.getMinutes();
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        const month = now.getMonth() + 1; // January is 0!
        const date = now.getDate();
        const year = now.getFullYear().toString().substr(-2); // Just the last two digits

        const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        const formattedDate = `${month}/${date}/${year}`;
        const unix = Math.floor(Date.now() / 1000)

        // Check for existing chat session
        const existingChat = await chatsCollection.findOne({
            contactId: new ObjectId(contact._id),
            owner: new ObjectId(user._id)
        });

        let messageId = 1;
        if (existingChat && existingChat.messages && existingChat.messages.length > 0) {
            messageId = existingChat.messages[existingChat.messages.length - 1].id + 1;
        }

        // Prepare message data for logging
        const newMessageData = {
            id: messageId,
            from: from,
            to: to,
            text: personalizedText,
            time: formattedTime,
            date: formattedDate,
            unixDateTime: unix
        };

        // Update or create chat session
        if (existingChat) {
            await chatsCollection.updateOne(
                { _id: existingChat._id },
                { $push: { messages: newMessageData } }
            );
        } else {
            await chatsCollection.insertOne({
                contactId: contact._id,
                owner: user._id,
                messages: [newMessageData]
            });
        }

        // Update contact's last communication details
        await contactsCollection.updateOne(
            { _id: contact._id },
            {
                $set: {
                    'communication.lastMessage': `${formattedTime} on ${formattedDate}`,
                    'communication.unixDateTime': unix
                },
            }
        );

    } catch (error) {
        console.error('Failed to send SMS:', error);
    }
}

module.exports = { sendSMS };
