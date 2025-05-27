export type ICreateAccount = {
  name: string;
  email?: string;
  otp?: number;
  password?: string;
  designation?: string;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export interface IConfirmBookingEmail {
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  returnLocation: string;
  vehicle: string;
  pickupTime?: string;
  returnTime?: string;
  amount: string;
  bookingId: string;
}
