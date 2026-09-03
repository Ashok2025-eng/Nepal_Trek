import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}
// Explicitly add <void> to the Promise type
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // 1) Create a transporter using Mailtrap credentials from .env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "2525"),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define the email delivery options
  const mailOptions = {
    from: "Auth Support [noreply@yourapp.com](mailto:noreply@yourapp.com)",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
};
