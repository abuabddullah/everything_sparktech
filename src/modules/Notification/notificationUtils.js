const { emailWithNodemailer } = require("../../helpers/email");

const sendMailToWebUser = async (emailBody) => {
  const {
    subject,
    sentTo,
    description,
    receiverName,
    receiverType,
  } = emailBody;

  // sending email if receiverType is email
  if (receiverType === "email") {
    const emailData = {
      email: sentTo,
      subject: `${subject}`,
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4A90E2;">Hello, ${receiverName}</h2>
          <p><strong>${description}</strong></p>
          <p style="color: #999; font-size: 0.9em;">If you have any questions, feel free to reach out to support.</p>
      </div>`,
    };
    await emailWithNodemailer(emailData);
  }
};

module.exports = { sendMailToWebUser };
