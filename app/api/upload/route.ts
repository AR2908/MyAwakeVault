import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const email = formData.get("email") as string;

    if (!file || !email) {
      return NextResponse.json({ success: false, message: "Missing file or user email" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFileName = `${Date.now()}-${file.name}`;

    // Har user ka apna private folder banega
    const command = new PutObjectCommand({
      Bucket: "myawakevault-data-mumbai-123", 
      Key: `secrets/${email}/${uniqueFileName}`, 
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    return NextResponse.json({ success: true, message: "File securely locked in your private S3 Vault!" });
  }catch (error) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}