const nodemailer = require('nodemailer');

const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
} = process.env;

const createTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS are required to send email. Set them in backend/.env.');
  }

  const transporterConfig = EMAIL_HOST && EMAIL_PORT ? {
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: EMAIL_SECURE === 'true',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  } : {
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  };

  return nodemailer.createTransport(transporterConfig);
};

exports.sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: EMAIL_FROM || EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};
