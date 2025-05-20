const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true,
        index: true
    },
    otp: { 
        type: String, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true,
        index: { expires: '5m' } // Auto delete after 5 minutes
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create index for automatic expiration
// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);