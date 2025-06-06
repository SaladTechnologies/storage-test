import { exec } from 'child_process';
import { promises as fs } from 'fs';
import axios from 'axios';
import * as dotenv from "dotenv";
import { randomBytes } from 'crypto';

dotenv.config();

// Create a test file with random data if it does not exist.
// The file size is specified in MB, e.g., "10M", "20MB" (only M or MB, not KB, GB, MiB or Mi).
export async function generateFileIfNotExisted(fileSizeMB: string): Promise<void> {

    const sizeMB : number = parseInt(fileSizeMB.replace(/[^0-9]/g, ""), 10); // replace non-numeric characters with '' to get the size in MB
    const filename = `${sizeMB}MB`;

    // If file exists, return immediately
    try {
        await fs.access(filename);
        return;
    } catch {} // File does not exist, continue to create
    
    const sizeBytes = sizeMB * 1_000_000; // 1 MB = 1,000,000 bytes
    const chunkSize = 1_000_000; // Write in 1MB chunks
    const handle = await fs.open(filename, 'w');
    try {
        let written = 0;
        while (written < sizeBytes) {
            const toWrite = Math.min(chunkSize, sizeBytes - written);
            const buffer = randomBytes(toWrite);
            await handle.write(buffer, 0, toWrite, written);
            written += toWrite;
        }
    } finally {
        await handle.close();
    }
}

// Save metrics to the local file
export async function appendObjectToFile(obj: Record<string, string>, filename: string): Promise<void>  {
    try {
        const lines = Object.entries(obj).map(([key, value]) => `"${key}":"${value}"\n`).join('');
        await fs.appendFile(filename, lines);
    } catch (e) {
        console.error(`Error writing to ${filename}:`, e);
    }
}

// Get SaladCloud environment info
export async function getSaladCloud(): Promise<Record<string, string>> {
    // The async function returns a Promise that wraps the return values
    const result: Record<string, string> = {};
    result['salad_machine_id'] = process.env.SALAD_MACHINE_ID || 'LOCAL';
    result['salad_container_group_id'] = process.env.SALAD_CONTAINER_GROUP_ID || 'LOCAL';
    return result;
}

// Get public IP address
export async function getMyIP(): Promise<Record<string, string>> {
    try {
        const response = await axios.get('https://wtfismyip.com/text');
        const ip = response.data.trim();
        return { 'ip_address': ip };
    } catch (e) {
        console.error('Error fetching public IP:', e);
        return { 'ip_address': '' };
    }
}

// Trigger node reallocation if a node is not suitable
export async function reallocate(reason: string, localRun: boolean): Promise<void> {
    console.log(reason);

    if (localRun) {
        console.log("Call the exit(0) ......");
        process.exit(0);
    } else {
        console.log("Call the IMDS reallocate ......");
        const url = "http://169.254.169.254/v1/reallocate";
        const headers = {
            'Content-Type': 'application/json',
            'Metadata': 'true'
        };
        const body = { Reason: reason };
        try {
            await axios.post(url, body, { headers });
        } catch (e) {
            console.error("Error calling IMDS reallocate:", e);
        }
        await new Promise(resolve => setTimeout(resolve, 10000)); // sleep 10 seconds
    }
}

// Read the supported CUDA RT Version
export async function getCUDAVersion(): Promise<Record<string, string>> {
    return new Promise((resolve) => {
        exec('nvidia-smi', (error, stdout) => {
            if (error) {
                resolve({});
                return;
            }
            const regex = /CUDA Version:\s+([0-9.]+)/;
            const match = stdout.match(regex);
            if (!match || match.length < 2) {
                resolve({});
                return;
            }
            const version = parseFloat(match[1]);
            resolve({
                'cuda_version': isNaN(version) ? '' : match[1]
            });
        });
    });
}

// Get the GPU info
export async function getGPU(): Promise<Record<string, string>> {
    // Call resolve only when manually create a new Promise
    return new Promise((resolve) => {
        const result: Record<string, string> = {};
        const cmd = 'nvidia-smi --query-gpu=gpu_name,memory.total,memory.used,memory.free,utilization.memory,temperature.gpu,utilization.gpu --format=csv,noheader';
        exec(cmd, (error, stdout) => {
            if (error) {
                resolve({});
                return;
            }
            try {
                const values = stdout.trim().split(', ');
                if (values.length !== 7) {
                    console.warn('Unexpected GPU data format');
                    resolve({});
                    return;
                }
                [result['gpu'], result['vram_total'], result['vram_used'], result['vram_free'], result['vram_utilization'], result['gpu_temperature'], result['gpu_utilization']] = values;
                resolve(result);
            } catch {
                resolve({});
            }
        });
    });
}

// Function to read and print a file line by line
export async function printFileLines(filename: string): Promise<void> {
    try {
        const data = await fs.readFile(filename, 'utf-8');
        data.split('\n').forEach(line => {
            if (line.trim()) {
                console.log(line);
            }
        });
    } catch (e) {
        console.error(`Error reading ${filename}:`, e);
    }
}

// Function to read a file and return a JSON object
export async function readFileAsJson(filename: string): Promise<Record<string, string>> {
    const result: Record<string, string> = {}; // Initialize an empty object to store key-value pairs
    try {
        const data = await fs.readFile(filename, 'utf-8');
        data.split('\n').forEach(line => {
            // Only parse lines that match the key-value pattern
            const match = line.match(/^"([^\"]+)":"([^\"]+)"$/);
            if (match) {
                result[match[1]] = match[2];
            }
        });
    } catch (e) {
        console.error(`Error reading ${filename}:`, e);
    }
    return result;
}
