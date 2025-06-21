import { IConfirmBookingEmail, IContact, ICreateAccount, IHelpContact, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Toothlens Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const createTeamMemberAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,  // User's email address
    subject: `Hi! ${values.name}, Your Account Credentials`,  // Email subject
    html: `
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Toothlens Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
            <p style="color: #555; font-size: 14px; line-height: 1.5;">Your account details:</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">Designation: ${values.designation}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">Email: ${values.email}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">Password: ${values.password}</p>
        </div>
      </div>
    </body>`,
  };
  return data;
};

const createAdminAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: `Hi! ${values.name}, Your Account Credentials`,  // Email subject
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width: 150px;" />
    
    <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">
      Welcome, ${values.name}! Your Admin Account Has Been Created
    </h2>
    
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
      Your admin account for Toothlens has been successfully created. Below are your login credentials:
    </p>

    <div style="background-color: #f2f2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 8px 0;"><strong>Email:</strong> ${values.email}</p>
      <p style="margin: 8px 0;"><strong>Password:</strong> ${values.password}</p>
    </div>

    <p style="font-size: 14px; color: #888; margin-bottom: 0;">
      For security, please log in and change your password as soon as possible.
    </p>
    
    <p style="font-size: 14px; color: #888;">
      If you did not request this account or believe it was created in error, please contact support immediately.
    </p>
  </div>
</body>
`,
  };
  return data;
};

const createManagerAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: `Hi! ${values.name}, Your Account Credentials`,  // Email subject
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width: 150px;" />
    
    <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">
      Welcome, ${values.name}! Your Manager Account Has Been Created
    </h2>
    
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
      Your Manager account for Toothlens has been successfully created. Below are your login credentials:
    </p>

    <div style="background-color: #f2f2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 8px 0;"><strong>Email:</strong> ${values.email}</p>
      <p style="margin: 8px 0;"><strong>Password:</strong> ${values.password}</p>
    </div>

    <p style="font-size: 14px; color: #888; margin-bottom: 0;">
      For security, please log in and change your password as soon as possible.
    </p>
    
    <p style="font-size: 14px; color: #888;">
      If you did not request this account or believe it was created in error, please contact support immediately.
    </p>
  </div>
</body>
`,
  };
  return data;
};

const createDriverAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: `Hi! ${values.name}, Your Account Credentials`,  // Email subject
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width: 150px;" />
    
    <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">
      Welcome, ${values.name}! Your Driver Account Has Been Created
    </h2>
    
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
      Your driver account for Toothlens has been successfully created. Below are your login credentials:
    </p>

    <div style="background-color: #f2f2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 8px 0;"><strong>Email:</strong> ${values.email}</p>
      <p style="margin: 8px 0;"><strong>Password:</strong> ${values.password}</p>
    </div>

    <p style="font-size: 14px; color: #888; margin-bottom: 0;">
      For security, please log in and change your password as soon as possible.
    </p>
    
    <p style="font-size: 14px; color: #888;">
      If you did not request this account or believe it was created in error, please contact support immediately.
    </p>
  </div>
</body>
`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};



const confirmBookingEmail = (values: IConfirmBookingEmail) => {
  const data = {
    to: values.email,
    subject: `Booking Confirmation - ${values.bookingId}`,
    html: `
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hi ${values.name},</h2>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Thank you for booking with Toothlens Car Rental! Your booking has been confirmed. Here are your booking details:
          </p>
          <div style="background-color: #f2f2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Booking ID:</strong> ${values.bookingId}</p>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${values.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${values.email}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${values.phone}</p>
            <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${values.vehicle}</p>
            <p style="margin: 8px 0;"><strong>Pickup Location:</strong> ${values.pickupLocation}</p>
            <p style="margin: 8px 0;"><strong>Return Location:</strong> ${values.returnLocation}</p>
            <p style="margin: 8px 0;"><strong>Pickup Time:</strong> ${values.pickupTime}</p>
            <p style="margin: 8px 0;"><strong>Return Time:</strong> ${values.returnTime}</p>
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> $${values.amount}</p>
          </div>
          <p style="font-size: 14px; color: #888;">
            If you have any questions or need to make changes to your booking, please contact our support team.
          </p>
          <p style="font-size: 14px; color: #0a9c00;">
            For getting updates about your booking, please use your booking ID: <strong>${values.bookingId}</strong> and email : <strong>${values.email}</strong> in our website.
          </p>
          <p style="font-size: 14px; color: #888;">
            Thank you for choosing Toothlens Car Rental!
          </p>
        </div>
      </body>
    `,
  };
  return data;
};


const contact = (values: IContact) => {
  const data = {
    to: values.email,
    subject: 'We’ve Received Your Message – Thank You!',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">      
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="https://res.cloudinary.com/ddhhyc6mr/image/upload/v1742293522/buzzy-box-logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px; text-align: center;">Thank You for Contacting Us, ${values.name}!</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
              We have received your message and our team will get back to you as soon as possible.
          </p>
          
          <div style="padding: 15px; background-color: #f4f4f4; border-radius: 8px; margin: 20px 0;">
              <p style="color: #333; font-size: 16px; font-weight: bold;">Your Message Details:</p>
              <p><strong>Name:</strong> ${values.name}</p>
              <p><strong>Email:</strong> ${values.email}</p>
              <p><strong>Subject:</strong> ${values.subject}</p>
              <br/>
              <p><strong>Message:</strong> ${values.message}</p>
          </div>

          <p style="color: #555; font-size: 14px; text-align: center;">
              If your inquiry is urgent, feel free to reach out to us directly at 
              <a href="mailto:support@yourdomain.com" style="color: #277E16; text-decoration: none;">support@yourdomain.com</a>.
          </p>

          <p style="color: #555; font-size: 14px; text-align: center; margin-top: 20px;">
              Best Regards, <br/>
              The [Your Company Name] Team
          </p>
      </div>
  </body>`,
  };
  return data;
};


const contactFormTemplate = (values: IHelpContact) => {
  const data = {
    to: values.email,
    subject: 'Thank you for reaching out to us',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hello ${values.name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for reaching out to us. We have received your message:</p>
            <div style="background-color: #f1f1f1; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px;">
                <p style="color: #555; font-size: 16px; line-height: 1.5;">"${values.message}"</p>
            </div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We will get back to you as soon as possible. Below are the details you provided:</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Email: ${values.email}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Phone: ${values.phone}</p>
            <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you need immediate assistance, please feel free to contact us directly at our support number.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  createTeamMemberAccount,
  createAdminAccount,
  createManagerAccount,
  createDriverAccount,
  resetPassword,
  confirmBookingEmail,
  contact,
  contactFormTemplate
};
