import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// NAYA: Data fetch karne ke liye GET method
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const command = new GetCommand({
      TableName: "VaultTimers",
      Key: { userID: email }
    });

    const response = await docClient.send(command);

    if (response.Item) {
      return NextResponse.json({ success: true, data: response.Item }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "No timer found" }, { status: 404 });
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, message: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (data.status === 'AWAKE') {
      // User ke bheje gaye custom din (agar nahi bheja toh default 180)
      const days = data.customDays ? parseInt(data.customDays) : 180;
      
      const nextAwakeDeadline = new Date();
      nextAwakeDeadline.setDate(nextAwakeDeadline.getDate() + days);

      const command = new PutCommand({
        TableName: "VaultTimers",
        Item: {
          userID: data.email, // "user_123" ko data.email se replace kar diya
          lastAwakeTime: new Date().toISOString(),
          deadlineTime: nextAwakeDeadline.toISOString(),
          timerDuration: days,
          status: "ACTIVE"
        },
      });

      await docClient.send(command);

      return NextResponse.json(
        { success: true, message: `Vault locked for the next ${days} days!` },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: false, message: "Invalid Signal" }, { status: 400 });

  } catch (error) {
    console.error("AWS Error:", error);
    return NextResponse.json(
      { success: false, message: "Cloud connection failed" },
      { status: 500 }
    );
  }
}