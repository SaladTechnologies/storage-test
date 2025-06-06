import { exec } from 'child_process';
import * as dotenv from "dotenv";

dotenv.config();

const {
  PYTHON_PATH
} = process.env;

// Need to be replaced with the Python in the container image
// '/home/ubuntu/storage-test/.venv/bin/python';
// '/opt/conda/bin/python'

const pythonExe = PYTHON_PATH || '/opt/conda/bin/python';
const pythonScript = './src/test.py';

// Run the initial check
export async function getNetworkInfo(): Promise<Record<string, string>> {

    return new Promise((resolve) => {
        exec(`${pythonExe} ${pythonScript}`, { cwd: process.cwd() }, (error, stdout) => {
            if (error) {
                console.error(`Error running ${pythonScript}:`, error); // should not happen
                resolve({});
                return;
            }
            try {
                const result = JSON.parse(stdout.trim()); // should alway return {}  
                resolve(result);
            } catch (e) {
                console.error(`Error parsing ${pythonScript} output:`, e);
                resolve({});
            }
        });
    });
}

// Upload from source to bucket/folder/ID/target
export async function uploadTestPY(params: {
    task: string,
    remote: string,
    source: string, 
    bucket: string, folder: string, ID: string, target: string,
    chunk_size_mbtype: string, // e.g., "10M"
    concurrency: string        // e.g., "10"
}): Promise<Record<string, string>> {
    
    const { task, remote, source, bucket, folder, ID, target, chunk_size_mbtype, concurrency } = params;
    const cmd = `${pythonExe} ${pythonScript} upload ${task} ${remote} ${source} ${target} ${bucket} ${folder} ${ID} ${chunk_size_mbtype} ${concurrency}`
    //console.log(cmd)

    return new Promise((resolve) => {
        exec(cmd, { cwd: process.cwd() }, (error, stdout) => {
            if (error) {
                console.error(`Error running ${pythonScript}:`, error); // should not happen
                resolve({});
                return;
            }
            try {
                const result = JSON.parse(stdout.trim()); // should alway return {}
                resolve(result);
            } catch (e) {
                console.error(`Error parsing ${pythonScript} output:`, e);
                resolve({});
            }
        });
    });

}

// Download from bucket/folder/ID/source to target
export async function downloadTestPY(params: {
    task: string,
    remote: string,
    bucket: string, folder: string, ID: string, source: string, 
    target: string,
    chunk_size_mbtype: string, // e.g., "10M"
    concurrency: string        // e.g., "10"
}): Promise<Record<string, string>> {

    const { task, remote, bucket, folder, ID, source, target, chunk_size_mbtype, concurrency } = params;
    const cmd = `${pythonExe} ${pythonScript} download ${task} ${remote} ${source} ${target} ${bucket} ${folder} ${ID} ${chunk_size_mbtype} ${concurrency}`
    //console.log(cmd)
    
    return new Promise((resolve) => {
        exec(cmd, { cwd: process.cwd() }, (error, stdout) => {
            if (error) {
                console.error(`Error running ${pythonScript}:`, error); // should not happen
                resolve({});
                return;
            }
            try {
                const result = JSON.parse(stdout.trim()); // should alway return {}
                resolve(result);
            } catch (e) {
                console.error(`Error parsing ${pythonScript} output:`, e);
                resolve({});
            }
        });
    });
}