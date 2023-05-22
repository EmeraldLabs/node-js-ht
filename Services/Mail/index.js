const nodemailer = require('nodemailer');
const TEMPLATE = require('./template');
const { NODEMAILER, isDevelopmentEnv } = require('../../config');

const sendMail = async (to, templateName, extraParams) => {
  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: NODEMAILER.USER,
      pass: NODEMAILER.PASSWORD
    }
  });

  const mailTemplate = TEMPLATE[templateName](extraParams);

  const mailOptions = {
    from: NODEMAILER.USER,
    to,
    subject: mailTemplate.SUBJECT,
    text: mailTemplate.TEXT
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(`Cannot send ${templateName} mail to ${to}...`);
      return;
    }
    if (isDevelopmentEnv) {
      console.log('Mail sent successfully...\n', info);
    }
  });
};

module.exports = {
  MAIL_TEMPLATES: {
    TWO_FA: 'TWO_FA',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD'
  },
  sendMail
};
