export const OTPmailSubject = 'This Is Your OTP Code';

export const OTPmailBody = (value: number) => {
  const data = `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <img src="https://img.freepik.com/premium-vector/black-white-drawing-tree-with-arrows-pointing-right_788759-6719.jpg?semt=ais_hybrid&w=740" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
    <div style="text-align: center;">
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use OTP code is:</p>
      <div style="background-color:rgb(33, 34, 33); width: 100px; padding: 12px 0; text-align: center; border-radius: 8px; color: #fff; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 20px auto;">
        ${value}
      </div>
      <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for <strong>2 minutes</strong>.</p>
      <p style="color: #b9b4b4; font-size: 14px; line-height: 1.5; margin-bottom: 0; text-align: left;">
        If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
      </p>
    </div>
  </div>
</body>`;
  return data;
};// https://img.freepik.com/premium-vector/black-white-drawing-tree-with-arrows-pointing-right_788759-6719.jpg?semt=ais_hybrid&w=740

export const resetLinkSubject = 'Reset your password within ten mins!';
export const resetLinkHTML = (resetUILink: string, name: string) => {
  const htmlBody = `
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding-top: 10px; padding-bottom: 10px;">
<div style="width: 100%; padding: 20px; background-color: #fff; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
<img src="https://res.cloudinary.com/dozeewhei/image/upload/v1725702879/suchorita%2B8801864742013.jpg" alt="Logo" style="width: 100%; margin-bottom: 20px;">
<div style="text-align: center; padding: 20px 0;">
<h2 style="margin: 0;">Reset Your Password</h2>
</div>
<div style="padding: 20px; text-align: center;">
<p>Dear ${name},</p>
<p>You requested a password reset. Please click the button below to reset your password:</p>
<a href="${resetUILink}" style="display: inline-block; padding: 10px 20px; margin-top: 20px; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Reset Password</a>
<p>If you did not request a password reset, please ignore this email.</p>
</div>
<div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
<p style="margin: 0;">&copy; ${new Date().getFullYear()} example.com. All rights reserved.</p>
</div>
</div>
</body>
`;
  return htmlBody;
};
