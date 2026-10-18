<div align="center">
  <img src="https://via.placeholder.com/150/020202/10b981?text=MAV" alt="MyAwakeVault Logo" width="120" />

  # 🛡️ MyAwake<span style="color: #10b981;">Vault</span>
  **The Ultimate Dead-Man's Switch Protocol**

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
    <a href="https://aws.amazon.com/"><img src="https://img.shields.io/badge/AWS-Serverless-232F3E?style=for-the-badge&logo=amazon-aws" alt="AWS"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel"></a>
  </p>

  > *“Securing your digital legacy, even when you are offline.”*
</div>

---

## 🌌 Overview

**MyAwakeVault** is a highly secure, serverless SaaS platform operating as a digital dead-man's switch. It allows users to store highly sensitive encrypted payloads (files) in the cloud. If the user fails to check-in (click the "I AM AWAKE" button) within their specified protocol countdown (e.g., 7, 30, or 90 days), the system assumes an emergency. It automatically unlocks the vault and dispatches secure, time-sensitive download links to designated trusted emergency contacts.

Designed with a premium dark cyber-security aesthetic, it provides absolute peace of mind for whistleblowers, journalists, crypto-holders, and anyone with critical digital assets.

---

## ✨ The Arsenal (Key Features)

- 🔐 **Military-Grade Authentication:** Powered by AWS Cognito with custom secure HTML email templates.
- 📂 **Encrypted S3 Storage:** Files are securely uploaded to AWS S3. No public access; strictly gated by time-limited signed URLs.
- ⏱️ **Auto-Destruct Countdown Timer:** Custom intervals (7, 30, 90, 365 days).
- 🤖 **Automated Cron Jobs:** Vercel-powered background tasks check vault status 24/7.
- ✉️ **Emergency Dispatch System:** AWS SES integration sends out immediate alerts and 48-hour secure download links to trusted successors if the timer hits zero.
- 🎨 **Cyber-Security UI:** A stunning, immersive dark mode interface with Emerald Green accents, built using Tailwind CSS.

---

## 🛠️ Tech Stack & Architecture

### **Frontend:**
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Custom futuristic styling, pulse animations, glassmorphism)
- **Language:** TypeScript

### **Backend (AWS Serverless):**
- **Authentication:** Amazon Cognito (User Pools)
- **Storage:** Amazon S3 (Bucket policies, Signed URLs)
- **Database:** Amazon DynamoDB (NoSQL for user settings & countdown states)
- **Email Service:** Amazon SES (Simple Email Service for OTPs and Emergency Alerts)
- **Automation:** Vercel Cron Jobs (`vercel.json`)

---

## 🚀 How It Works

1. **Initialize Protocol:** User creates an account and uploads critical files to the vault.
2. **Configure Successor:** User sets a countdown limit (e.g., 30 days) and adds an emergency contact's email.
3. **Stay Awake:** User must log in and click `[ I AM AWAKE ]` before the timer runs out to reset the countdown.
4. **Trigger Event:** If the timer reaches `00:00:00`, the daily Cron Job detects the breach.
5. **Dispatch:** AWS SES emails the trusted successor with temporary, secure AWS S3 download links to retrieve the vault contents.

---

## ⚙️ Local Setup & Installation

Follow these steps to run the secure terminal on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/MyAwakeVault.git
cd MyAwakeVault
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your AWS credentials:
```env
# AWS Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx

# AWS IAM Credentials (S3, DynamoDB, SES)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Vault Secret (For Cron Job Authorization)
CRON_SECRET=MY_VAULT_SECRET_123
```

### 4. Boot up the Mainframe
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Deployment

This project is optimized for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Add all the Environment Variables in the Vercel dashboard.
3. Deploy! Vercel will automatically read the `vercel.json` file and configure the daily cron job for the `/api/cron` route.

---

## 🔒 Security & Privacy Warning
*Do not expose your `.env` variables or AWS keys publicly. Ensure your IAM user has the principle of least privilege (only access to the specific S3 bucket, DynamoDB table, and SES identities required).*

---
<div align="center">
  <i>Initiated and Secured by <b>Arjun</b></i>
</div>