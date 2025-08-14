import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account - 914 Unplugged',
    html: `<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 40px 20px; color: #333;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
            <img src="https://admin.914unplugged.com/assets/sidebarLogo-6d858a94.png" alt="914 Unplugged Logo" style="display: block; margin: 0 auto 20px; max-width: 180px; height: auto;" />
            <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to 914 Unplugged!</h1>
        </div>
        
        <!-- Content Section -->
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #1e40af; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Hey ${values.name}!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Thank you for joining our community. Please use the verification code below to activate your account:</p>
            
            <!-- OTP Code Box -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: inline-block; padding: 20px 30px; border-radius: 12px; margin: 20px 0; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);">
                <div style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">${values.otp}</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 20px;">⏰ This code will expire in 3 minutes for security purposes.</p>
            
            <!-- Call to Action -->
            <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.5;">If you didn't request this verification, please ignore this email or contact our support team.</p>
            </div>
        </div>
        
        <!-- Footer Section -->
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.4;">© 2024 914 Unplugged. All rights reserved.</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 5px 0 0 0;">This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Password Reset Request - 914 Unplugged',
    html: `<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 40px 20px; color: #333;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center;">
            <img src="https://admin.914unplugged.com/assets/sidebarLogo-6d858a94.png" alt="914 Unplugged Logo" style="display: block; margin: 0 auto 20px; max-width: 180px; height: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🔐 Password Reset</h1>
        </div>
        
        <!-- Content Section -->
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Reset Your Password</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">We received a request to reset your password. Use the verification code below to proceed with resetting your password:</p>
            
            <!-- OTP Code Box -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); display: inline-block; padding: 20px 30px; border-radius: 12px; margin: 20px 0; box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);">
                <div style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">${values.otp}</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 20px;">⏰ This code will expire in 3 minutes for security purposes.</p>
            
            <!-- Security Notice -->
            <div style="margin-top: 30px; padding: 20px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.5; font-weight: 500;">🛡️ Security Notice</p>
                <p style="color: #7f1d1d; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">If you didn't request a password reset, please ignore this email and consider changing your password as a precaution.</p>
            </div>
        </div>
        
        <!-- Footer Section -->
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.4;">© 2024 914 Unplugged. All rights reserved.</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 5px 0 0 0;">This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
