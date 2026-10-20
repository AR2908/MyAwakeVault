import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Data fetch karne ke liye GET method
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
      const days = data.customDays ? parseInt(data.customDays) : 30;
      
      let deadlineToSave;

      // Agar frontend se Test Mode ka overrideDeadline aaya hai
      if (data.overrideDeadline) {
        deadlineToSave = data.overrideDeadline;
      } else {
        // Normal "I AM AWAKE" button ke liye
        const nextAwakeDeadline = new Date();
        nextAwakeDeadline.setDate(nextAwakeDeadline.getDate() + days);
        deadlineToSave = nextAwakeDeadline.toISOString();
      }

      // UpdateCommand use kar rahe hain taaki Email/SMS ke contacts delete na hon
      const command = new UpdateCommand({
        TableName: "VaultTimers",
        Key: { userID: data.email },
        UpdateExpression: "SET lastAwakeTime = :lastAwake, deadlineTime = :deadline, timerDuration = :duration, #status = :statusVal",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":lastAwake": new Date().toISOString(),
          ":deadline": deadlineToSave,
          ":duration": days,
          ":statusVal": "ACTIVE"
        }
      });

      await docClient.send(command);

      return NextResponse.json(
        { 
          success: true, 
          message: data.overrideDeadline ? "Test deadline locked in DB!" : `Vault locked for the next ${days} days!` 
        },
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
