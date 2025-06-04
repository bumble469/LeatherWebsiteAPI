require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {createAccessToken,createRefreshToken} = require('../services/jwtservice');

const otpStore = {};

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASS
    }
});

exports.sendOtp = async(req,res) => {
    const {email} = req.body;
    if(!email){
        return res.status(400).json({message:"Email is required!"});
    }
    const otp = crypto.randomInt(100000,999999).toString();
    otpStore[email] = otp;

    const mailOptipns = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP for JollyLeathers Admin Login",
        html: `<p>Do not share with anyone: <b>${otp}</b></p>`
    };

    try{
        await transporter.sendMail(mailOptipns);
        res.json({message:"OTP Sent!"})
    }
    catch(error){
        res.status(500).json({message:"Error sending OTP ", error})
    }
};

exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    const payload = { email };

    if (otpStore[email] && otpStore[email] == otp) {
        delete otpStore[email];

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        res.cookie('accessToken',accessToken,{
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            secure: false,     
            sameSite: 'lax',
        });

        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'lax'
        });

        return res.json({
            message: "OTP Verified Successfully!",
        });
    } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
    }
};
