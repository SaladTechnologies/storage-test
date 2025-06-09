import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const {
  CLOUDFLARE_RESULT_ID, CLOUDFLARE_RESULT_KEY, CLOUDFLARE_RESULT_ENDPOINT_URL,
  CLOUDFLARE_RESULT_BUCKET, CLOUDFLARE_RESULT_FOLDER,
} = process.env;

if (!CLOUDFLARE_RESULT_ID || !CLOUDFLARE_RESULT_KEY || !CLOUDFLARE_RESULT_ENDPOINT_URL
        || !CLOUDFLARE_RESULT_BUCKET || !CLOUDFLARE_RESULT_FOLDER       
    ) {
  throw new Error("Missing credentials!");
}

const S3Client_RESULT = new S3Client({
  region: "auto",
  endpoint: CLOUDFLARE_RESULT_ENDPOINT_URL,
  credentials: {
    accessKeyId: CLOUDFLARE_RESULT_ID,
    secretAccessKey: CLOUDFLARE_RESULT_KEY,
  },
  forcePathStyle: true,
});

export async function saveTestResults(localFileName: string, ID: string): Promise<void> {
    const bucket = CLOUDFLARE_RESULT_BUCKET!;
    const folder = CLOUDFLARE_RESULT_FOLDER!;
    const key = `${folder}/${ID}.txt`;

    const fileStream = fs.createReadStream(localFileName);

    try {
        await S3Client_RESULT.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: fileStream,
        }));
        
        console.log(`Successfully uploaded ${localFileName} to r2://${bucket}/${key}`);

    } catch (err) {
        console.error(`Failed to upload ${localFileName}:`, err);
        throw err;
    }
} 