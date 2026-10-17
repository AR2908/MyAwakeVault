import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// AWS Credentials aur Region .env.local se aayenge
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, customDays, trustedEmail, whatsappNumber } = data;

    if (!email) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 400 });
    }

    // Naya deadline calculate karein custom din ke hisaab se
    const nextAwakeDeadline = new Date();
    nextAwakeDeadline.setDate(nextAwakeDeadline.getDate() + Number(customDays));

    const command = new PutCommand({
      TableName: "VaultTimers", // Ensure yeh table DynamoDB mein pehle se bani ho
      Item: {
        userID: email,
        timerDuration: customDays,
        trustedEmail: trustedEmail,
        whatsappNumber: whatsappNumber,
        lastAwakeTime: new Date().toISOString(),
        deadlineTime: nextAwakeDeadline.toISOString(),
        status: "ACTIVE"
      },
    });

    await docClient.send(command);

    return NextResponse.json(
      { success: true, message: "Vault settings securely saved to database!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to connect to database" },
      { status: 500 }
    );
  }
}