const path = require('path');
const fs = require('fs');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const logFile = path.join(__dirname, 'server.log');
const logLine = (message) => {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(logFile, line, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
};

const requiredEnv = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_TO',
  'HCAPTCHA_SECRET'
];

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, phone, message, hcaptchaToken } = req.body;

  if (!firstName || !lastName || !email || !message || !hcaptchaToken) {
    logLine('Contact form rejected: missing required fields.');
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }

  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  if (missingEnv.length > 0) {
    logLine(`Contact form rejected: missing env ${missingEnv.join(', ')}`);
    return res.status(500).json({ ok: false, error: 'Server is not configured.' });
  }

  try {
    const verifyParams = new URLSearchParams();
    verifyParams.append('secret', process.env.HCAPTCHA_SECRET);
    verifyParams.append('response', hcaptchaToken);

    const verifyResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString()
    });

    const verifyData = await verifyResponse.json();
    if (!verifyData.success) {
      const codes = Array.isArray(verifyData['error-codes'])
        ? verifyData['error-codes'].join(', ')
        : 'unknown';
      logLine(`Contact form rejected: hCaptcha verification failed (${codes}).`);
      return res.status(400).json({
        ok: false,
        error: 'hCaptcha verification failed.',
        codes
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const safePhone = phone ? phone : 'Not provided';
    const mailTo = process.env.MAIL_TO;

    await transporter.sendMail({
      from: `Vansh Bisht <${process.env.SMTP_USER}>`,
      to: mailTo,
      replyTo: email,
      subject: `New Portfolio Message from ${firstName} ${lastName}`,
      text: [
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Phone: ${safePhone}`,
        '',
        message
      ].join('\n')
    });

    logLine(`Contact form sent: ${email}`);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    logLine(`Contact form error: ${error.message || 'unknown error'}`);
    return res.status(500).json({ ok: false, error: 'Failed to send message.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'vansh_portfolio.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
