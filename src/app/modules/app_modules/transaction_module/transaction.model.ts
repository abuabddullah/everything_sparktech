import { Schema, model, Document } from 'mongoose';
import { ITransaction } from './transaction.interface';
import { object } from 'zod';
import { TransactionStatus } from '../../../../enums/transaction';


const TransactionSchema = new Schema<ITransaction>({
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING, required: true },
    transactionNumber: { type: String, required: true }
},
    { timestamps: true });

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);