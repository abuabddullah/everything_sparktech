import { Types } from 'mongoose';
import { TransactionStatus } from '../../../../enums/transaction';



export interface ITransaction {
    _id?: Types.ObjectId;
    bookingId: Types.ObjectId; // Reference to Booking model
    customerId: Types.ObjectId; // Reference to User model
    amount: number;
    status: TransactionStatus;
    transactionNumber: string; 
    createdAt?: Date;
    updatedAt?: Date;
}