const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: "naver",
    prot: 465,
    host: 'smtp.naver.com',
    secure: false,  
    requireTLS: true,
    auth: {
        user: "3142314@naver.com",
        pass: "rlagusdn1011"
    },
    tls: {
        rejectUnauthorized: false
    }
  });

  module.exports={
      smtpTransport
  }