const nodemailer = require("nodemailer");
require("dotenv").config(); // Ensure you are loading environment variables

exports.sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const message = {
      from: `${process.env.USER} <${process.env.USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
