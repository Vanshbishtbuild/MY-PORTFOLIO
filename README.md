# Vansh Portfolio

A personal portfolio site with a contact form backend (Express + Nodemailer + hCaptcha).

## Features
- 3D interactive hero background
- Animated sections and parallax cards
- Contact form with hCaptcha verification
- Email delivery via Gmail SMTP

## Tech Stack
- HTML/CSS/JS
- Tailwind (via CDN)
- Node.js + Express
- Nodemailer
- hCaptcha

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Copy the example file and fill in your secrets:
```bash
cp .env.example .env
```

Set these values in `.env`:
- `SMTP_PASS` (Gmail App Password)
- `HCAPTCHA_SECRET` (from hCaptcha dashboard)

### 3) Run the server
```bash
node server.js
```

Open:
```
http://localhost:3000
```

## Project Structure
- `index.html` - main HTML
- `styles.css` - custom styles
- `script.js` - frontend behavior
- `server.js` - backend server
- `.env.example` - environment template

## Notes
- The contact form posts to `/api/contact`.
- Logs are written to `server.log`.

## License
MIT
