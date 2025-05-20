const nodemailer = require('nodemailer');


require('dotenv').config();



const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {

    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_PASS);
    
    const mailOptions = {
        from: `"Admin System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Admin Login OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Admin Login OTP</h2>
                <p>Your one-time password (OTP) for admin login is:</p>
                <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; margin: 20px 0; text-align: center;">
                    ${otp}
                </div>
                <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
                <p style="color: #888; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendOTPEmail };