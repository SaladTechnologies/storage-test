import os from 'os';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

import * as dotenv from "dotenv";

dotenv.config();

/*
This module is loaded once, even if is is imported multiple times by other files.
So, the varaibles are initialized only once.
The scope of these variables is only this module, unless they are exported.
*/ 

const {
  CLOUDFLARE_ID, CLOUDFLARE_KEY, CLOUDFLARE_US_ENDPOINT_URL, CLOUDFLARE_EU_ENDPOINT_URL,
  AWS_ID, AWS_KEY, AWS_UE2_REGION, AWS_EC1_REGION,
  B2_UW4_ID, B2_UW4_KEY, B2_UW4_ENDPOINT_URL, B2_UW4_REGION,
  B2_UE5_ID, B2_UE5_KEY, B2_UE5_ENDPOINT_URL, B2_UE5_REGION,
  B2_EC3_ID, B2_EC3_KEY, B2_EC3_ENDPOINT_URL, B2_EC3_REGION,
  UH_EU0_ID, UH_EU0_KEY, UH_EU0_ENDPOINT_URL 
} = process.env;
 
export async function InitRcloneConfig(): Promise<void> {
    const filename = path.join(os.homedir(), ".config", "rclone", "rclone.conf");

    // Ensure the directory exists
    await fs.mkdir(path.dirname(filename), { recursive: true });

    const configContent = [
        "[r2ue2]",
        "type = s3",
        "provider = Cloudflare",
        `access_key_id = ${CLOUDFLARE_ID}`,
        `secret_access_key = ${CLOUDFLARE_KEY}`,
        `region = auto`,
        `endpoint = ${CLOUDFLARE_US_ENDPOINT_URL}`,
        "no_check_bucket = true",
        "",

        "[r2ec1]",
        "type = s3",
        "provider = Cloudflare",
        `access_key_id = ${CLOUDFLARE_ID}`,
        `secret_access_key = ${CLOUDFLARE_KEY}`,
        `region = auto`,
        `endpoint = ${CLOUDFLARE_EU_ENDPOINT_URL}`,
        "no_check_bucket = true",
        "",

        "[s3ue2]",
        "type = s3",
        "provider = AWS",
        `access_key_id = ${AWS_ID}`,
        `secret_access_key = ${AWS_KEY}`,
        `region = ${AWS_UE2_REGION}`,
        "no_check_bucket = true",
        "",

        "[s3ec1]",
        "type = s3",
        "provider = AWS",
        `access_key_id = ${AWS_ID}`,
        `secret_access_key = ${AWS_KEY}`,
        `region = ${AWS_EC1_REGION}`,
        "no_check_bucket = true",
        "",

        "[b2uw4]",
        "type = s3",
        "provider = Other",
        `access_key_id = ${B2_UW4_ID}`,
        `secret_access_key = ${B2_UW4_KEY}`,
        `endpoint = ${B2_UW4_ENDPOINT_URL}`,
        "",

        "[b2ue5]",
        "type = s3",
        "provider = Other",
        `access_key_id = ${B2_UE5_ID}`,
        `secret_access_key = ${B2_UE5_KEY}`,
        `endpoint = ${B2_UE5_ENDPOINT_URL}`,
        "",
        
        "[b2ec3]",
        "type = s3",
        "provider = Other",
        `access_key_id = ${B2_EC3_ID}`,
        `secret_access_key = ${B2_EC3_KEY}`,
        `endpoint = ${B2_EC3_ENDPOINT_URL}`,   
        "",

        "[uheu0]",
        "type = s3",
        "provider = Other",
        `access_key_id = ${UH_EU0_ID}`,
        `secret_access_key = ${UH_EU0_KEY}`,
        `endpoint = ${UH_EU0_ENDPOINT_URL}`,

    ].join("\n");
    
    //console.log(configContent);

    await fs.writeFile(filename, configContent, { encoding: "utf-8" });
    //console.log(`rclone config written to ${filename}`);
}

// Upload from source to bucket/folder/ID/target
export async function uploadTestRC(params: {
    task: string,
    remote: string,
    source: string,
    bucket: string, folder: string, ID: string, target: string,
    chunk_size_mbtype: string, // e.g., "10M"
    concurrency: string        // e.g., "10"
}): Promise<Record<string, string>> {

    const {task, remote, source, bucket, folder, ID, target, chunk_size_mbtype, concurrency} = params;

    // The size of source file in MB
    let fileSizeMB : number = 0;
    try {
        const stat = await fs.stat(source);
        fileSizeMB = stat.size / 1_000_000;
    } catch (e) {
        //console.error(`${task}_Failed to stat file:`, e);
        return { [`${task}_error_filesize`]: String(e) };
    }
    
    // Build rclone command
    const tempTarget = `${remote}:${bucket}/${folder}/${ID}/${target}`;
    const cmd = `rclone copyto ${source} ${tempTarget} --s3-chunk-size=${chunk_size_mbtype} --transfers=${concurrency} --ignore-times`; // --ignore-times, forces the copy
    //console.log(`Executing rclone command: ${cmd}`);

    // Start
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                // console.error(`rclone error:`, stderr || error);
                resolve({ [`${task}_error_upload`]: String(stderr || error) });
            } else {
                
                // End (we don't check the uploaded result)
                const timeSec = (Date.now() - startTime) / 1000; // Time in seconds
                const throughputMbps = (fileSizeMB * 8) / timeSec;

                resolve({          
                    // [`${task}_size_MB`]: fileSizeMB.toFixed(3),
                    [`${task}_time_second`]: timeSec.toFixed(3),
                    [`${task}_throughput_Mbps`]: throughputMbps.toFixed(3)
                });
            }
        });
    });
}

// Download from bucket/folder/ID/source to target
export async function downloadTestRC(params: {
    task: string,
    remote: string,
    bucket: string, folder: string, ID: string, source: string,
    target: string,
    chunk_size_mbtype: string, // e.g., "10M"
    concurrency: string        // e.g., "10"
}): Promise<Record<string, string>> {

    const {task, remote, bucket, folder, ID, source, target, chunk_size_mbtype, concurrency} = params;    

    // Build rclone command
    const tempSource = `${remote}:${bucket}/${folder}/${ID}/${source}`;
    const cmd = `rclone copyto ${tempSource} ${target} --s3-chunk-size=${chunk_size_mbtype} --transfers=${concurrency} --ignore-times`; // --ignore-times, forces the copy
    //console.log(`Executing rclone command: ${cmd}`);

    // Start
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {        
            if (error) {
                //console.error(`rclone error:`, stderr || error);
                resolve({ [`${task}_error_download`]: String(stderr || error) });
            } else { 
                (async () => {
                    try {

                        // The size of target file in MB
                        const stat = await fs.stat(target);
                        const fileSizeMB = stat.size / 1_000_000;

                        // End
                        const timeSec = (Date.now() - startTime) / 1000; // Time in seconds
                        const throughputMbps = (fileSizeMB * 8) / timeSec;

                        resolve({
                            // [`${task}_size_MB`]: fileSizeMB.toFixed(3),
                            [`${task}_time_second`]: timeSec.toFixed(3),
                            [`${task}_throughput_Mbps`]: throughputMbps.toFixed(3)
                        });

                    } catch (e) {
                        // console.error(`Failed to stat file:`, e);
                        resolve({ [`${task}_error_filesize`]: String(e) });
                    }
                })();
            }
        });
    });
}
