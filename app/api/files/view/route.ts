import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  }
});

const BUCKET_NAME = "myawakevault-data-mumbai-123";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const fileName = searchParams.get('fileName');

    if (!email || !fileName) {
      return NextResponse.json({ success: false, message: "Missing info" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `secrets/${email}/${fileName}`,
    });

    // 5 Minute ke liye valid secure link banayega
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    
    // Nayi tab mein file ko open kar dega
    return NextResponse.redirect(signedUrl);

  } catch (error: any) {
    console.error("View File Error:", error);
    return NextResponse.json({ success: false, message: "Cannot view file" }, { status: 500 });
  }
}
