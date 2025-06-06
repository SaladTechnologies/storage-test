"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTestCasesFromFile = readTestCasesFromFile;
exports.generateAndSaveTestCases = generateAndSaveTestCases;
const fs_1 = require("fs");
// Reads testCases.txt and returns an array of test cases
function readTestCasesFromFile() {
    return __awaiter(this, arguments, void 0, function* (filename = "testCases.txt") {
        const content = yield fs_1.promises.readFile(filename, { encoding: "utf-8" });
        const lines = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0); // skip empty lines
        // Each line: remote, tool, direction, size, ...
        // Only take the first 4 columns for testCases
        const testCases = lines.map(line => {
            const parts = line.split(',').map(s => s.trim());
            return parts.slice(0, 4);
        });
        return testCases;
    });
}
// Helper to extract numeric value from size string like "10MB"
function getSizeMB(size) {
    const match = size.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}
// Function to generate test cases using 3 loops and save to a file (one test case per line, numbered)
function generateAndSaveTestCases() {
    return __awaiter(this, arguments, void 0, function* (filename = "testCases.txt", summaryFilename = "testCaseSummary.txt", size = "10MB") {
        const remotes = [
            "uheu0", "b2uw4", "b2ue5", "b2ec3", "r2ue2", "r2ec1", "s3ue2", "s3ec1"
        ];
        const tools = ["rclone", "python", "typescript"];
        const directions = ["upload", "download"];
        const lines = [];
        let lineNumber = 1;
        let bucketNumber = 1;
        let totalUploadMB = 0;
        let totalDownloadMB = 0;
        const uploadPerRemote = {};
        const downloadPerRemote = {};
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
                    }
                    else {
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
        yield fs_1.promises.writeFile(filename, lines.join('\n'), { encoding: "utf-8" });
        console.log(`Test cases saved to ${filename}`);
        // Prepare summary info
        const summaryLines = [];
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
        yield fs_1.promises.writeFile(summaryFilename, summaryLines.join('\n'), { encoding: "utf-8" });
        console.log(`Summary info saved to ${summaryFilename}`);
        console.log('\nSummary of test cases:');
        console.log(summaryLines.join('\n'));
    });
}
// Run the function if this file is executed directly
// It does NOT run if you: import './helper_create_testcases'
if (require.main === module) {
    const sizeArg = process.argv[2] || "100MB";
    generateAndSaveTestCases("testCases.txt", "testCaseSummary.txt", sizeArg).catch(err => {
        console.error('Error generating test cases:', err);
    });
}
//# sourceMappingURL=helper_create_testcases.js.map