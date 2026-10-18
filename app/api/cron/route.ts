import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// AWS Region
const region = process.env.AWS_REGION as string;

// Clients initialize karein
const dbClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dbClient);
const sesClient = new SESClient({ region });
const s3Client = new S3Client({ region });

// SNS Client (Creds ke sath)
const snsClient = new SNSClient({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  }
});

const BUCKET_NAME = "myawakevault-data-mumbai-123";

// SMS bhejne ka function
async function sendEmergencySMS(phoneNumber: string, vaultOwnerName: string) {
  try {
    const command = new PublishCommand({
      Message: `URGENT (MyAwakeVault): ${vaultOwnerName}'s timer has expired. Emergency protocol activated. Please check your email for secure file links.`,
      PhoneNumber: phoneNumber, 
    });

    await snsClient.send(command);
    console.log(`SMS successfully sent to ${phoneNumber}`);
  } catch (error) {
    console.error("SMS bhejne mein error aaya:", error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== "MY_VAULT_SECRET_123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    const scanCommand = new ScanCommand({
      TableName: "VaultTimers",
      FilterExpression: "#status = :active AND deadlineTime <= :now",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":active": "ACTIVE", ":now": now }
    });

    const { Items } = await docClient.send(scanCommand);

    if (!Items || Items.length === 0) {
      return NextResponse.json({ message: "All users are safe. No timers reached zero today." });
    }

    let triggeredCount = 0;

    for (const user of Items) {
      if (!user.trustedEmail) {
        console.log(`Skipping user ${user.userID} because trustedEmail is missing.`);
        continue;
      }

      // 1. S3 bucket se is user ki saari files dhoondhein
      const listFilesCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME, 
        Prefix: `secrets/${user.userID}/`
      });
      
      const s3Objects = await s3Client.send(listFilesCommand);
      let fileLinksText = "";

      // 2. Har file ke liye 48-hour valid secure link banayein
      if (s3Objects.Contents && s3Objects.Contents.length > 0) {
        for (const item of s3Objects.Contents) {
          if (!item.Key) continue;
          
          const getObjCmd = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: item.Key
          });
          
          const url = await getSignedUrl(s3Client, getObjCmd, { expiresIn: 172800 });
          const fileName = item.Key.split('/').pop(); 
          
          fileLinksText += `📄 ${fileName}\nDownload Link: ${url}\n\n`;
        }
      } else {
        fileLinksText = "No files were found in the vault.\n";
      }

      // 3. Email bhejein (Links ke sath)
      const emailCommand = new SendEmailCommand({
        Source: "arjun.bathole.mawada@gmail.com", 
        Destination: { ToAddresses: [user.trustedEmail] },
        Message: {
          Subject: { Data: "🚨 URGENT: MyAwakeVault Auto-Destruct Triggered" },
          Body: {
            Text: { 
              Data: `Hello,\n\nThis is an automated emergency message from MyAwakeVault.\n\nThe user (${user.userID}) has not checked into their vault for the configured period of ${user.timerDuration} days.\n\nSince you are listed as their trusted emergency contact, their secure vault files have been unlocked for you.\n\nThese secure links will expire in 48 hours. Please download them immediately:\n\n${fileLinksText}\n\nStay safe,\nMyAwakeVault System` 
            }
          }
        }
      });

      await sesClient.send(emailCommand);

      // 3.5. SMS Bhejein (Using whatsappNumber column)
      let phoneToSend = user.whatsappNumber;
      
      if (phoneToSend) {
        // Agar number mein + nahi hai, toh India ka code (+91) automatically add kar do
        if (!phoneToSend.startsWith('+')) {
          phoneToSend = `+91${phoneToSend}`;
        }
        await sendEmergencySMS(phoneToSend, user.userID);
      } else {
        console.log(`No whatsappNumber found for user ${user.userID}, skipping SMS.`);
      }

      // 4. Status update karein
      const updateCommand = new UpdateCommand({
        TableName: "VaultTimers",
        Key: { userID: user.userID },
        UpdateExpression: "SET #status = :triggered",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":triggered": "TRIGGERED" }
      });
      await docClient.send(updateCommand);
      
      triggeredCount++;
    }

    return NextResponse.json({ message: `Successfully triggered ${triggeredCount} vaults. Emails and SMS sent.` });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}