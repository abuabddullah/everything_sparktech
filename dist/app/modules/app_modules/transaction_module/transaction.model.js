"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
const mongoose_1 = require("mongoose");
const transaction_1 = require("../../../../enums/transaction");
const TransactionSchema = new mongoose_1.Schema({
    bookingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(transaction_1.TransactionStatus), default: transaction_1.TransactionStatus.PENDING, required: true },
    transactionNumber: { type: String, required: true }
}, { timestamps: true });
exports.TransactionModel = (0, mongoose_1.model)('Transaction', TransactionSchema);
