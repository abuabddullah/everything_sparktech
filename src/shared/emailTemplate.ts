import { ICreateAccount, ICreateAdminAccount, IResetPassword } from '../types/emailTamplate';

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

const createAdminAccount = (values: ICreateAdminAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
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

const createDriverAccount = (values: ICreateAdminAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
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

export const emailTemplate = {
  createAccount,
  createAdminAccount,
  createDriverAccount,
  resetPassword,
};
