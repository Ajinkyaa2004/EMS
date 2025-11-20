import mongoose, { Schema } from 'mongoose';
const clientSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    contactPerson: String,
    oneDriveLink: String,
    gitHubLink: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export const Client = mongoose.model('Client', clientSchema);
//# sourceMappingURL=Client.js.map