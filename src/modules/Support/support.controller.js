const response = require("../../helpers/response");
const catchAsync = require("../../helpers/catchAsync");
const { supportEmailWithNodemailer } = require("../../helpers/email");

const sentSupportMessage = catchAsync(async (req, res) => {
  const { title, content } = req.body;
  const emailData = {
    email: req.User.email,
    subject: `Support Message: ${title}`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4A90E2; text-align: center; margin-bottom: 20px;">New Support Message</h2>
            <p><strong>From:</strong> ${req.User.email}</p>
            <p><strong>Subject:</strong> ${title}</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #ddd;">
                <p style="margin: 0; white-space: pre-wrap;">${content}</p>
            </div>
            <p style="margin-top: 20px; font-size: 0.9em; color: #777;">This message was sent from the OOTMS website or mobile app by a user seeking assistance. Please address their query promptly.</p>
        </div>`,
  };

  await supportEmailWithNodemailer(emailData);

  return res.status(201).json(
    response({
      status: "Success",
      statusCode: "201",
      type: "support",
      message: "Support message sent successfully",
    })
  );
});

const contactUs = catchAsync(async (req, res) => {
  const { fullName, message, email } = req.body;
  const emailData = {
    email: email,
    subject: `${fullName} has contacted you`,
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4A90E2; text-align: center; margin-bottom: 20px;">New contact Message</h2>
            <p><strong>From:</strong> ${email}</p>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #ddd;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 20px; font-size: 0.9em; color: #777;">This message was sent from the OOTMS website or mobile app by a user seeking assistance. Please address their query promptly.</p>
        </div>`,
  };

  await supportEmailWithNodemailer(emailData);

  return res.status(201).json(
    response({
      status: "Success",
      statusCode: "201",
      type: "contact",
      message: "contact message sent successfully",
    })
  );
});

module.exports = { sentSupportMessage, contactUs };
