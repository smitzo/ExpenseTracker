// import nodemailer from "nodemailer";
// import * as dotenv from "dotenv";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "outlook",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export function sendEmail(to, subject, text, attachments) {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//     attachments,
//   };

//   return transporter.sendMail(mailOptions);
// }
import nodemailer from 'nodemailer';
import logger from './logger.js';

export const sendEmail = async (to, subject, text, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'outlook', // or other email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.response}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  } 
};
