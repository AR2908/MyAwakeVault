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

  > *"Securing your digital legacy, even when you are offline."*
</div>

---

## 🌌 Overview

**MyAwakeVault** is a highly secure, serverless SaaS platform operating as a digital dead-man's switch. It allows users to store highly sensitive encrypted payloads (files) in the cloud. If the user fails to check-in (click the "I AM AWAKE" button) within their specified protocol countdown (e.g., 7, 30, or 90 days), the system assumes an emergency. It automatically unlocks the vault and dispatches secure, time-sensitive download links to designated trusted emergency contacts.

Designed with a premium dark cyber-security aesthetic, it provides absolute peace of mind for whistleblowers, journalists, crypto-holders, and anyone with critical digital assets.

---

## ✨ The Arsenal (Key Features)

- 🔐 **Military-Grade Authentication:** Powered by AWS Cognito with custom secure HTML email templates.
- 📂 **Encrypted S3 Storage:** Files are securely uploaded to AWS S3. No public access; strictly gated by time-limited signed URLs.
- ⏱️ **Auto-Destruct Countdown Timer:** Custom intervals (7, 30, 90, 365 days) and manual override for testing.
- 🤖 **Fully Serverless Automation:** AWS EventBridge triggers AWS Lambda every minute to check vault status 24/7 without fail.
- ✉️ **Emergency Dispatch System:** AWS SES integration sends out immediate alerts and 48-hour secure download links to trusted successors if the timer hits zero.
- 📈 **System Observability:** Monitored via AWS CloudWatch alarms and SNS for real-time error tracking.
- 🎨 **Cyber-Security UI:** A stunning, immersive dark mode interface with Emerald Green accents, built using Tailwind CSS.

---

## 🛠️ Tech Stack & Architecture

### **Frontend (PaaS):**
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Custom futuristic styling, pulse animations, glassmorphism)
- **Deployment:** Vercel

### **Backend (AWS Cloud-Native Serverless):**
- **FaaS (Function as a Service):** AWS Lambda
- **Database (DBaaS):** Amazon DynamoDB (NoSQL for user settings & countdown states)
- **Storage:** Amazon S3 (Bucket policies, Presigned URLs)
- **Authentication (IDaaS):** Amazon Cognito (User Pools)
- **Communication:** Amazon SES (Simple Email Service)
- **Automation & Scheduling:** Amazon EventBridge (Scheduler)
- **Monitoring & Security:** Amazon CloudWatch (Alarms) & Amazon VPC (Network Architecture)

---

## 🚀 How It Works

1. **Initialize Protocol:** User creates an account and uploads critical files to the vault.
2. **Configure Successor:** User sets a countdown limit (e.g., 30 days) and adds an emergency contact's email.
3. **Stay Awake:** User must log in and click `[ I AM AWAKE ]` before the timer runs out to reset the countdown.
4. **Trigger Event:** If the timer reaches `00:00:00`, the AWS EventBridge scheduler triggers the AWS Lambda function.
5. **Dispatch:** Lambda verifies the database, generates 48-hour secure signed URLs from S3, and commands AWS SES to email the trusted successor.

---

## ⚙️ Local Setup & Installation

Follow these steps to run the secure terminal on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/MyAwakeVault.git](https://github.com/YOUR_USERNAME/MyAwakeVault.git)
cd MyAwakeVault
