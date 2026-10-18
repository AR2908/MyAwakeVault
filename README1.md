# 🛡️ MyAwakeVault

> **A Secure, Serverless Dead-Man's Switch Protocol**

MyAwakeVault is a highly secure SaaS application built to protect and transfer your most critical digital assets. Users can upload confidential files, configure a countdown timer, and designate a trusted emergency contact. If the user fails to check in ("Awake") before the timer reaches zero, the system automatically dispatches time-limited, secure download links to the successor.

## 🚀 Key Features

*   **Secure Authentication:** Powered by AWS Cognito with a custom cyber-security UI protocol.
*   **Encrypted Vault Storage:** Files are securely stored in AWS S3 and accessed only via short-lived, signed URLs.
*   **Auto-Destruct Countdown:** Configurable trigger intervals (7, 30, 90, or 365 days) synced with an Amazon DynamoDB backend.
*   **Automated Emergency Dispatch:** Vercel Cron Jobs routinely monitor timer states and trigger Amazon SES to alert trusted contacts upon expiration.
*   **Futuristic UI/UX:** Built with Next.js and Tailwind CSS, featuring a sleek, responsive, dark-terminal aesthetic.

## 🛠️ Tech Stack

*   **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript
*   **Backend Logic:** Next.js API Route Handlers
*   **Database:** Amazon DynamoDB
*   **Storage:** Amazon S3
*   **Authentication:** Amazon Cognito
*   **Mailing System:** Amazon SES
*   **Deployment & Automation:** Vercel (Hosting & Automated Cron Jobs)

## ⚙️ Environment Variables

To run this project locally, create a `.env.local` file in the root directory and add the following keys:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
CRON_SECRET=your_secure_cron_trigger_secret
