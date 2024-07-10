const { getDb } = require('./database');
const { ObjectId } = require('mongodb');

async function updateContactInfo(updateData, contact) {
    const db = getDb();
    const collection = db.collection('contacts'); // Assuming 'Contacts' is the collection name

    // Prepare the update operations based on the contactSteps array
    let updateOps = {};
    console.log('Updating contact info:', contact._id); // Log the contact ID being updated
    updateData.contactSteps.forEach(step => {
        if (step.action === 'update') {
            updateOps[step.field] = step.value;
            console.log(`Preparing to update ${step.field} to ${step.value}`); // Log the field update detail
        }
        // Additional actions can be handled here as needed
    });

    console.log('Final update operations:', updateOps); // Log the complete update operations object
    // Execute the update command with the prepared operations
    const updateResult = await collection.updateOne({ _id: contact._id }, { $set: updateOps });
    console.log('Update result:', updateResult); // Log the result of the update operation
}

module.exports = { updateContactInfo };
