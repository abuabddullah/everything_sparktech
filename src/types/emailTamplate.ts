export type ICreateAccount = {
  name: string;
  email?: string;
  otp?: number;
  password?: string;
  designation?: string;
};
export type ICreateAdminAccount = {
  name: string;
  email: string;
  password: string;
};

export type IResetPassword = {
  email: string;
  otp: number;
};
