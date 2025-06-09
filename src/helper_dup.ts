
import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';

       
// Create a test file with random data if it does not exist.
// The file size is specified in MB, e.g., "10M", "20MB" (only M or MB, not KB, GB, MiB or Mi).
async function generateFileIfNotExisted(fileSizeMB: string): Promise<void> {
       
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

// Rename a file from 'a' to 'b'
export async function renameFile(a: string, b: string): Promise<void> {
    await fs.rename(a, b);
}


// Append the contents of file2 to file1 and write to a new file (outputFile)
async function appendFiles(file1: string, file2: string, outputFile: string): Promise<void> {
    const data1 = await fs.readFile(file1);
    const data2 = await fs.readFile(file2);
    await fs.writeFile(outputFile, Buffer.concat([data1, data2]));
}


async function main() {
    /*
    await generateFileIfNotExisted("10MB"); 
    await renameFile("10MB", "10MB_2");

    await generateFileIfNotExisted("10MB"); 
    await renameFile("10MB", "10MB_3");

    await generateFileIfNotExisted("10MB"); 
    await renameFile("10MB", "10MB_4");

    await generateFileIfNotExisted("10MB"); 
    await renameFile("10MB", "10MB_5");

    await generateFileIfNotExisted("10MB"); 
    await appendFiles("10MB", "10MB_2", "20MB")
    await appendFiles("20MB", "10MB_3", "30MB")
    await appendFiles("30MB", "10MB_4", "40MB")
    await appendFiles("40MB", "10MB_5", "50MB")
    */

    await generateFileIfNotExisted("100MB"); 
    await renameFile("100MB", "100MB_2");

    await generateFileIfNotExisted("100MB"); 
    await renameFile("100MB", "100MB_3");

    await generateFileIfNotExisted("100MB"); 
    await appendFiles("100MB", "100MB_2", "200MB")
    await appendFiles("200MB", "100MB_3", "300MB")

}


main().catch((err) => {
    console.error('Error running main:', err);
});
