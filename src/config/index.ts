import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  admin: {
    password: process.env.DEFAULT_ADMIN_PASSWORD,
  },
  company: {
    name: process.env.COMPANY_NAME,
    domain: process.env.COMPANY_DOMAIN,
    default_password: process.env.COMPANY_DEFAULT_PASSWORD,
  },
  stripe: {
    stripe_api_key: process.env.STRIPE_API_KEY,
    stripe_api_secret: process.env.STRIPE_API_SECRET,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCLE_URL,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    home_url: process.env.HOME_CALLBACK_URL,
  },
  generic:{
    otp_time:process.env.OTP_TIME
  }
};
