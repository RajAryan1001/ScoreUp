const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    otp: { 
        code: String,
        expiresAt: Date 
    },
    isSuperAdmin: { type: Boolean, default: false },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate and store OTP
adminSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    this.otp = {
        code: otp,
        expiresAt: expiresAt
    };
    
    return otp;
};

// Method to verify OTP
adminSchema.methods.verifyOTP = function(enteredOTP) {
    if (!this.otp || !this.otp.code) return false;
    
    const isMatch = this.otp.code === enteredOTP;
    const isValid = this.otp.expiresAt > new Date();
    
    // Clear OTP regardless of match result
    this.otp = undefined;
    
    return isMatch && isValid;
};

module.exports = mongoose.model('Admin', adminSchema);