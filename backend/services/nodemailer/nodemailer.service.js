import { transporter } from "../../config/nodemailer.js";

export const sendOtpEmail = async ({ toEmail, otp, subject, type = 'OTP' }) => {
  try {
    const otpSendTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 10px 0;
          border-bottom: 2px solid #f4f4f4;
        }
        .header h1 {
          color: #333333;
        }
        .content {
          margin: 20px 0;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          color: #666666;
        }
        .otp {
          display: inline-block;
          font-size: 24px;
          color: #ffffff;
          background-color: #4CAF50;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          letter-spacing: 2px;
        }
        .copy-btn {
          margin-top: 10px;
          display: inline-block;
          padding: 10px 20px;
          font-size: 14px;
          background-color: #007BFF;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          border: none;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #999999;
        }
        .footer a {
          color: #4CAF50;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Verification Code</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Your OTP for verification is:</p>
          <div onclick="navigator.clipboard.writeText('${otp}')" class="otp">${otp}</div>
          <p>Please use this code within the next 5 minutes to complete your verification.</p>
        </div>
        <div class="footer">
          <p>If you didn’t request this code, please ignore this email or contact us.</p>
          <p>Thanks, <br> The Team</p>
          <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    const forgotPasswordTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 10px 0;
          border-bottom: 2px solid #f4f4f4;
        }
        .header h1 {
          color: #333333;
        }
        .content {
          margin: 20px 0;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          color: #666666;
        }
        .reset-link {
          display: inline-block;
          font-size: 16px;
          color: #ffffff;
          background-color: #4CAF50;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #999999;
        }
        .footer a {
          color: #4CAF50;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${otp}" class="reset-link">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
        </div>
        <div class="footer">
          <p>If you didn’t request this password reset, please ignore this email or contact us.</p>
          <p>Thanks, <br> The Team</p>
          <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.NODEMAILER_AUTH_USER,
      to: toEmail,
      subject: subject || (type === 'OTP' ? 'Your One-Time Password (OTP)' : 'Password Reset Request'),
      html: type === 'OTP' ? otpSendTemplate : forgotPasswordTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("sendOtpEmail ---> ", { info });
    return true;

  } catch (error) {
    console.error('sendOtpEmail :: Error sending email:', error);
    return false;
  }
};
