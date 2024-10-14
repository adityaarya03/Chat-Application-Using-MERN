const mongoose = require("mongoose");
const emailTempelate = require('../config/emailTempelate');
const mailSender = require('../middlewares/mailSender');

const OTPSchema = new mongoose.Schema({
    email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5,
	},
})

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification Email",emailTempelate(otp));
        console.log("Mail send successfully",mailResponse);
    }catch(error){
        console.log("Error occurred while sending email: ", error);
    }
}

OTPSchema.pre("save",async function(next){
    console.log("New document is saved  to database");

    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
})

const OTP = mongoose.model("OTP",OTPSchema);
module.exports = OTP;