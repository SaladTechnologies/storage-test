import { promises as fs } from 'fs';

// Reads testCases.txt and returns an array of test cases
export async function readTestCasesFromFile(filename: string = "testCases.txt"): Promise<string[][]> {
    const content = await fs.readFile(filename, { encoding: "utf-8" });
    const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0); // skip empty lines

    // Each line: remote, tool, direction, size, ...
    // Only take the first 4 columns for testCases
    const testCases: string[][] = lines.map(line => {
        const parts = line.split(',').map(s => s.trim());
        return parts.slice(0, 4);
    });

    return testCases;
}

// Helper to extract numeric value from size string like "10MB"
function getSizeMB(size: string): number {
    const match = size.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

// Function to generate test cases using 3 loops and save to a file (one test case per line, numbered)
export async function generateAndSaveTestCases(
    filename: string = "testCases.txt",
    summaryFilename: string = "testCaseSummary.txt",
    size: string = "10MB"

): Promise<void> {
    const remotes = [
        "uheu0", "b2uw4", "b2ue5", "b2ec3", "r2ue2", "r2ec1", "s3ue2", "s3ec1"
    ];
    const tools = ["rclone", "python", "typescript"];
    const directions = ["upload", "download"];

    const lines: string[] = [];
    let lineNumber = 1;
    let bucketNumber = 1;

    let totalUploadMB = 0;
    let totalDownloadMB = 0;
    const uploadPerRemote: Record<string, number> = {};
    const downloadPerRemote: Record<string, number> = {};

    for (const remote of remotes) {
        let remoteUploadMB = 0;
        let remoteDownloadMB = 0;
        for (const tool of tools) {
            for (const direction of directions) {
                lines.push(`${remote}, ${tool}, ${direction}, ${size}, Test_Case_${lineNumber}, Bucket_${bucketNumber}`);
                const sizeMB = getSizeMB(size);
                if (direction === "upload") {
                    totalUploadMB += sizeMB;
                    remoteUploadMB += sizeMB;
                } else {
                    totalDownloadMB += sizeMB;
                    remoteDownloadMB += sizeMB;
                }
                lineNumber++;
            }
        }
        lines.push(""); // Add an empty line after each remote
        uploadPerRemote[remote] = remoteUploadMB;
        downloadPerRemote[remote] = remoteDownloadMB;
        bucketNumber++;
    }

    // Write test cases to file
    await fs.writeFile(filename, lines.join('\n'), { encoding: "utf-8" });
    console.log(`Test cases saved to ${filename}`);

    // Prepare summary info
    const summaryLines: string[] = [];
    summaryLines.push(`Total upload size (MB): ${totalUploadMB}`);
    summaryLines.push(`Total download size (MB): ${totalDownloadMB}`);
    summaryLines.push("");
    summaryLines.push("Upload size (MB) per remote:");
    for (const remote of remotes) {
        summaryLines.push(`${remote}: ${uploadPerRemote[remote]}`);
    }
    summaryLines.push("");
    summaryLines.push("Download size (MB) per remote:");
    for (const remote of remotes) {
        summaryLines.push(`${remote}: ${downloadPerRemote[remote]}`);
    }

    // Write summary info to another file
    await fs.writeFile(summaryFilename, summaryLines.join('\n'), { encoding: "utf-8" });
    console.log(`Summary info saved to ${summaryFilename}`);
    console.log('\nSummary of test cases:');
    console.log(summaryLines.join('\n'));
    
}

// Run the function if this file is executed directly
// It does NOT run if you: import './helper_create_testcases'
if (require.main === module) {
    const sizeArg = process.argv[2] || "100MB";
    generateAndSaveTestCases("testCases.txt", "testCaseSummary.txt", sizeArg).catch(err => {
        console.error('Error generating test cases:', err);
    });
}
