import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// S3 Client Setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  }
});

// Aapka exact Bucket Name jo upload me use hua hai
const BUCKET_NAME = "myawakevault-data-mumbai-123";

// GET: User ki saari uploaded files lana
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    // Exact folder prefix as per your upload route
    const folderPrefix = `secrets/${email}/`; 

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: folderPrefix,
    });

    const data = await s3Client.send(command);

    // S3 response se prefix hata kar file ka naam nikalna
    const files = data.Contents?.map(item => ({
      name: item.Key?.replace(folderPrefix, ''), // Taki UI par sirf file ka naam dikhe
      size: item.Size,
    })).filter(file => file.name !== '') || [];

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    console.error("GET Files Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch files" }, { status: 500 });
  }
}

// DELETE: S3 se specific file delete karna
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { email, fileName } = body;

    if (!email || !fileName) {
      return NextResponse.json({ success: false, message: "Email and File Name are required" }, { status: 400 });
    }

    // Wahi exact path create karna jahan file save hui thi
    const fileKey = `secrets/${email}/${fileName}`;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, message: "File deleted securely" });
  } catch (error: any) {
    console.error("DELETE File Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete file" }, { status: 500 });
  }
}