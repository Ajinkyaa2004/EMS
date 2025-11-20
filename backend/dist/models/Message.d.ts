import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "sent" | "delivered" | "read";
    recipientId: mongoose.Types.ObjectId;
    recipientType: "User" | "Client";
    senderId: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    app: "email" | "telegram" | "gmail" | "dashboard";
    readAt?: Date | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "sent" | "delivered" | "read";
    recipientId: mongoose.Types.ObjectId;
    recipientType: "User" | "Client";
    senderId: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    app: "email" | "telegram" | "gmail" | "dashboard";
    readAt?: Date | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "sent" | "delivered" | "read";
    recipientId: mongoose.Types.ObjectId;
    recipientType: "User" | "Client";
    senderId: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    app: "email" | "telegram" | "gmail" | "dashboard";
    readAt?: Date | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "sent" | "delivered" | "read";
    recipientId: mongoose.Types.ObjectId;
    recipientType: "User" | "Client";
    senderId: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    app: "email" | "telegram" | "gmail" | "dashboard";
    readAt?: Date | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "sent" | "delivered" | "read";
    recipientId: mongoose.Types.ObjectId;
    recipientType: "User" | "Client";
    senderId: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    app: "email" | "telegram" | "gmail" | "dashboard";
    readAt?: Date | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "sent" | "delivered" | "read";
    recipientId: mongoose.Types.ObjectId;
    recipientType: "User" | "Client";
    senderId: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    app: "email" | "telegram" | "gmail" | "dashboard";
    readAt?: Date | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
export default _default;
//# sourceMappingURL=Message.d.ts.map