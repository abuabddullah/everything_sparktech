const { emailWithNodemailer } = require("../../helpers/email");
const Load = require("../Load/load.model");
const findLoadByIds = async (ids) => {
  const loads = await Load.find({ _id: { $in: ids } });
  return loads;
};

const sendMailToReceiver = async (emailBody) => {
  const { name, sentTo, receiverName, navigateTo, receiverType } = emailBody;

  // sending email if receiverType is email
  if (receiverType === "email") {
    const emailData = {
      email: sentTo,
      subject: `${name} has created a load please check it out`,
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4A90E2;">Hello, ${receiverName}</h2>
        <p><strong>${name}</strong> has created a new load. Please check it out on <strong>OOTMS</strong>.</p>
        <p>You can view the details by clicking the link below:</p>
        <p>
            <a href="${navigateTo}" style="color: #4A90E2; text-decoration: none; font-weight: bold;">
                View Details
            </a>
        </p>
        <p style="color: #999; font-size: 0.9em;">If you have any questions, feel free to reach out to support.</p>
    </div>`,
    };
    await emailWithNodemailer(emailData);
  }
};

module.exports = {
  findLoadByIds,
  sendMailToReceiver,
};
