const nodemailer = require("nodemailer");

module.exports = async (email, subject, url) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const html = `
            <p>Please verify your email by clicking the link below:</p>
            <a href="${url}" target="_blank" rel="noopener noreferrer">Verify Email</a>
        `;

        const info = await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html: html,
        });

        console.log("Email sent: %s", info.messageId);
        console.log("Verification URL: %s", url);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; 
    }
};
