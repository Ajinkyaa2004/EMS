import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee', 'client', 'freelancer', 'trainee'], required: true },
    phone: String,
    avatar: String,
    isActive: { type: Boolean, default: true },
    isTrainee: { type: Boolean, default: false },
}, { timestamps: true });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export const User = mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map