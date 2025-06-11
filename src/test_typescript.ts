import { S3Client, HeadObjectCommand, GetObjectCommand, S3  } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
 
dotenv.config();
  
/*
This module is loaded once, even if is is imported multiple times by other files.
So, the varaibles are initialized only once.
The scope of these variables is only this module, unless they are exported.
*/ 

const {
  CLOUDFLARE_ID, CLOUDFLARE_KEY, CLOUDFLARE_US_ENDPOINT_URL, CLOUDFLARE_EU_ENDPOINT_URL,
  AWS_ID, AWS_KEY,AWS_UE2_REGION, AWS_EC1_REGION,
  B2_UW4_ID, B2_UW4_KEY, B2_UW4_ENDPOINT_URL,B2_UW4_REGION,
  B2_UE5_ID, B2_UE5_KEY, B2_UE5_ENDPOINT_URL,B2_UE5_REGION,
  B2_EC3_ID, B2_EC3_KEY, B2_EC3_ENDPOINT_URL,B2_EC3_REGION,
  UH_EU0_ID, UH_EU0_KEY, UH_EU0_ENDPOINT_URL
} = process.env;
 
if (!CLOUDFLARE_ID || !CLOUDFLARE_KEY || !CLOUDFLARE_US_ENDPOINT_URL || !CLOUDFLARE_EU_ENDPOINT_URL
    || !AWS_ID || !AWS_KEY || !AWS_UE2_REGION || !AWS_EC1_REGION
    || !B2_UW4_ID || !B2_UW4_KEY || !B2_UW4_ENDPOINT_URL || !B2_UW4_REGION
    || !B2_UE5_ID || !B2_UE5_KEY || !B2_UE5_ENDPOINT_URL || !B2_UE5_REGION
    || !B2_EC3_ID || !B2_EC3_KEY || !B2_EC3_ENDPOINT_URL || !B2_EC3_REGION
    || !UH_EU0_ID || !UH_EU0_KEY || !UH_EU0_ENDPOINT_URL) {
  throw new Error("Missing credentials!");
}

const S3Client_UHEU0 = new S3Client({
  endpoint: UH_EU0_ENDPOINT_URL,
  region: "eu-central-1", // fails without this setting
  credentials: {
    accessKeyId: UH_EU0_ID,
    secretAccessKey: UH_EU0_KEY,
  },
  forcePathStyle: true, 
});

// Make sure to set the parameters for Backblaze B2
// requestChecksumCalculation: "WHEN_REQUIRED"
// responseChecksumValidation: "WHEN_REQUIRED"
// https://www.backblaze.com/docs/cloud-storage-use-the-aws-sdk-for-javascript-v3-with-backblaze-b2
// https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/

const S3Client_B2UW4 = new S3Client({
  endpoint: B2_UW4_ENDPOINT_URL,
  region: B2_UW4_REGION, 
  credentials: {
    accessKeyId: B2_UW4_ID,
    secretAccessKey: B2_UW4_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",  
});

const S3Client_B2UE5 = new S3Client({
  endpoint: B2_UE5_ENDPOINT_URL,
  region: B2_UE5_REGION, 
  credentials: {
    accessKeyId: B2_UE5_ID,
    secretAccessKey: B2_UE5_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",  
});

const S3Client_B2EC3 = new S3Client({
  endpoint: B2_EC3_ENDPOINT_URL,
  region: B2_EC3_REGION, 
  credentials: {
    accessKeyId: B2_EC3_ID,
    secretAccessKey: B2_EC3_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",  
});

const S3Client_R2UE2 = new S3Client({
  region: "auto", // Cloudflare R2 uses 'auto' region
  endpoint: CLOUDFLARE_US_ENDPOINT_URL,
  credentials: {
    accessKeyId: CLOUDFLARE_ID,
    secretAccessKey: CLOUDFLARE_KEY,
  },
  forcePathStyle: true, // Required for R2 compatibility
});

const S3Client_R2EC1 = new S3Client({
  region: "auto", // Cloudflare R2 uses 'auto' region
  endpoint: CLOUDFLARE_EU_ENDPOINT_URL,
  credentials: {
    accessKeyId: CLOUDFLARE_ID,
    secretAccessKey: CLOUDFLARE_KEY,
  },
  forcePathStyle: true, // Required for R2 compatibility
});

const S3Client_S3UE2 = new S3Client({
  region: AWS_UE2_REGION, 
  credentials: {
    accessKeyId: AWS_ID,
    secretAccessKey: AWS_KEY,
  }
});

const S3Client_S3EC1 = new S3Client({
  region: AWS_EC1_REGION, 
  credentials: {
    accessKeyId: AWS_ID,
    secretAccessKey: AWS_KEY,
  }
});

// Upload from source to bucket/folder/ID/target
export async function uploadTestTS(params: {
    task: string,
    remote: string,
    source: string, 
    bucket: string, folder: string, ID: string, target: string,
    chunk_size_mbtype: string, // e.g., "10M"
    concurrency: string        // e.g., "10"
}): Promise<Record<string, string>> {

    const { task, remote, source, bucket, folder, ID, target, chunk_size_mbtype, concurrency } = params;
    
    // The size of source file in MB
    let fileSizeMB : number = 0;
    try {
        const stat = await fs.promises.stat(source);
        fileSizeMB = stat.size / 1_000_000;
    } catch (e) {
        // console.error(`Failed to stat file:`, e);
        return { [`${task}_error_filesize`]: String(e) };
    }

    let s3: S3Client;
    if (remote === "r2ue2") {
        s3 = S3Client_R2UE2;
    } else if (remote === "r2ec1"){
        s3 = S3Client_R2EC1;
    } else if (remote === "s3ue2"){
        s3 = S3Client_S3UE2;
    } else if (remote === "s3ec1"){
        s3 = S3Client_S3EC1;
    } else if (remote === "b2uw4"){
        s3 = S3Client_B2UW4;
    } else if (remote === "b2ue5"){
        s3 = S3Client_B2UE5;
    } else if (remote === "b2ec3"){
        s3 = S3Client_B2EC3;
    } else if (remote === "uheu0"){
        s3 = S3Client_UHEU0;
    } else {
        return { [`${task}_error_remote`]: `Unknown remote: ${remote}` };
    }

    const chunkSizeMB = parseInt(chunk_size_mbtype.replace(/[^0-9]/g, ""), 10); // 10 means decimal number
    const partSize = chunkSizeMB * 1_000_000; // MB to bytes
    const queueSize = parseInt(concurrency, 10);
    const key = path.posix.join(folder, ID, target);
    
    // Start
    const startTime = Date.now();

    try {
        const upload = new Upload({
            client: s3,
            params: {
                Bucket: bucket,
                Key: key,
                Body: fs.createReadStream(source),
            },
            queueSize, // concurrency
            partSize,  // chunk size in bytes
            leavePartsOnError: false,
        });
        await upload.done();
    } catch (e) {
        // console.error(`Error during upload:`, e);
        return { [`${task}_error_upload`]: String(e) };
    }

    // End (we don't check the uploaded result)
    const timeSec = (Date.now() - startTime) / 1000;
    const throughputMbps = (fileSizeMB * 8) / timeSec;

    return {
        // [`${task}_size_MB`]: fileSizeMB.toFixed(3),
        [`${task}_time_second`]: timeSec.toFixed(3),
        [`${task}_throughput_Mbps`]: throughputMbps.toFixed(3)
    };
}

// Helper to convert stream to buffer: read an entire stream into a single buffer
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks); // Concatenate all chunks into a single buffer
}

// Download from bucket/folder/ID/source to target
export async function downloadTestTS(params: {
    task: string,
    remote: string,
    bucket: string, folder: string, ID: string, source: string, 
    target: string,
    chunk_size_mbtype: string, // e.g., "10M"
    concurrency: string        // e.g., "10"
}): Promise<Record<string, string>> {
    
    const { task, remote, bucket, folder, ID, source, target, chunk_size_mbtype, concurrency } = params;

    let s3: S3Client;
    if (remote === "r2ue2") {
        s3 = S3Client_R2UE2;
    } else if (remote === "r2ec1"){
        s3 = S3Client_R2EC1;
    } else if (remote === "s3ue2"){
        s3 = S3Client_S3UE2;
    } else if (remote === "s3ec1"){
        s3 = S3Client_S3EC1;
    } else if (remote === "b2uw4"){
        s3 = S3Client_B2UW4;
    } else if (remote === "b2ue5"){
        s3 = S3Client_B2UE5;
    } else if (remote === "b2ec3"){
        s3 = S3Client_B2EC3;
    } else if (remote === "uheu0"){
        s3 = S3Client_UHEU0;
    } else {
        return { [`${task}_error_remote`]: `Unknown remote: ${remote}` };
    }

    const chunkSizeMB = parseInt(chunk_size_mbtype.replace(/[^0-9]/g, ""), 10); // 10 means decimal number
    const chunkSize = chunkSizeMB * 1_000_000; // MB to bytes
    const concurrencyNum = parseInt(concurrency, 10);
    const key = path.posix.join(folder, ID, source);

    // Get the object size first from cloud storage
    let headRes;
    try {
        headRes = await s3.send(new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
    } catch (e) {
        // console.error(`HeadObjectCommand failed:`, e);
        return { [`${task}_error_headobject`]: String(e) }; 
    }

    const tempFileSize = headRes.ContentLength;
    if (!tempFileSize) // if undefined or null
        return { [`${task}_error_headobject_filesize`]: "underfined or null" }; // Return empty object if fail to read the size
    //const tempFileSizeMB = tempFileSize / 1_000_000;
    const partCount = Math.ceil(tempFileSize / chunkSize);

    // Start
    const startTime = Date.now();

    const fd = await fs.promises.open(target, "w"); 
    // zero length, no need to be pre-sized
    // Node can write a chunk at the specified offset, regardless of the file's current length.
    // If you write beyond the current end of the file, the file will be automatically extended, and any unwritten bytes in between will be filled with zeros.
    
    try {
        let nextPart = 0;
 
        // Called 10 times in parallel
        async function downloadNext(): Promise<void> {
            while (true) {
                const partNumber = nextPart++; // safe for parallel execution, which happens sequentially

                if (partNumber >= partCount) break; // for protection, if partNumber is larger than partCount, break the loop
                
                const start = partNumber * chunkSize;    // type assertion
                const end = Math.min(start + chunkSize, tempFileSize as number) - 1;

                const range = `bytes=${start}-${end}`;
                // console.log(range);

                const res = await s3.send(new GetObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Range: range
                }));
                const chunk = await streamToBuffer(res.Body as NodeJS.ReadableStream);
                
                await fd.write(chunk, 0, chunk.length, start);
            }
        }
        
        // Create an array with 10 slots; for each slot, call downloadNext() in parallel; 
        // 10 downloadNext functions start at the same time, 
        // Each downloadNext function keeps grabbing the next available chunk index until partNumber >= partCount (30).
        // 'anything' is just a placeholder, it can be any value which will be replaced by the actual promise returned by downloadNext()
        await Promise.all(Array(concurrencyNum).fill('anything').map( () => downloadNext() ));
    
    } catch (e) {
        //console.error(`Error during download:`, e);
        return { [`${task}_error_download`]: String(e) }; // Return empty object if any part fails
    }  finally {
        await fd.close();
    }

    // Check the size of the downloaded file
    let fileSizeMB: number = 0;
    try {
        const stat = await fs.promises.stat(target);
        fileSizeMB = stat.size / 1_000_000;
    } catch (e) {
        // console.error(`Failed to get file size:`, e);
        return { [`${task}_error_filesize`]: String(e) };
    }

    // End
    const timeSec = (Date.now() - startTime) / 1000; // Time in seconds
    const throughputMbps = (fileSizeMB  * 8) / timeSec;

    return {
        // [`${task}_size_MB`]: fileSizeMB.toFixed(3),
        [`${task}_time_second`]: timeSec.toFixed(3),
        [`${task}_throughput_Mbps`]: throughputMbps.toFixed(3)
    };
}

