const nodemailer = require('nodemailer');
const { getDb } = require('./database');
const { ObjectId } = require('mongodb');
const draftToHtml = require('draftjs-to-html');
const { convertFromRaw } = require('draft-js');

async function sendEmail(emailData, contact) {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(contact.ownerId) });

    if (!user || !user.emailConfig) {
        console.error('No email configuration available for the user.');
        return;
    }

    let transporter = nodemailer.createTransport({
        host: user.emailConfig.provider === 'outlook' ? 'smtp.office365.com' : 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
            user: user.emailConfig.username,
            pass: user.emailConfig.password
        }
    });

    // Convert Draft.js content state to HTML directly from raw state
    const rawContentState = JSON.parse(emailData.description);
    const htmlContent = draftToHtml(rawContentState); // directly use rawContentState

    // Replace template variables in the subject and HTML content
    const subjectContent = parseAndReplace(emailData.subject, contact);
    const finalHtmlContent = parseAndReplace(htmlContent, contact);

    let mailOptions = {
        from: `"${user.firstName} ${user.lastName}" <${user.emailConfig.username}>`,
        to: contact.email,
        subject: subjectContent,
        html: finalHtmlContent // Final HTML content with variables replaced
    };

    await transporter.sendMail(mailOptions);
}

function parseAndReplace(template, contact) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, p1) => contact[p1] || '');
}

module.exports = { sendEmail };
