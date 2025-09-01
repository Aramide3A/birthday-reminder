import 'dotenv/config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendEmail = async (to: string, username: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: '🎉 Happy Birthday!',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #ff6f61;">Happy Birthday, ${username} 🎂</h2>
            <p style="font-size: 16px; color: #333;">
            We at <strong>Birthday Reminder</strong> wish you a wonderful day filled with love, laughter, and happiness.
            </p>
            <p style="font-size: 14px; color: #555;">
            Enjoy your special day 🎉
            </p>
        </div>
        `,
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`Birthday email sent to ${username} (${to})`)
    } catch (error) {
        console.error('Error sending birthday email:', error)
    }
}
