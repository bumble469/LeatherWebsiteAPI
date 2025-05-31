require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
    console.log("Sending OTP to:", email);
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

exports.verifyOtp = (req,res) => {
    const {email,otp} = req.body;
    if(otpStore[email] && otpStore[email] == otp){
        delete otpStore[email];
        res.json({message:"OTP Verified Successfully!"})
    }
    else{
        res.status(400).json({message:"Invalid or expired OTP"})
    }
}