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
// relative to the location of main.ts, not the process's working directory; same for the compiled JS files 
const helper_1 = require("./helper");
const helper_create_testcases_1 = require("./helper_create_testcases");
const test_python_1 = require("./test_python");
const test_rclone_1 = require("./test_rclone");
const test_all_1 = require("./test_all");
const save_results_1 = require("./save_results"); // Assuming you have a function to save results
const fs_1 = require("fs");
const toolMap = {
    rclone: "rc", python: "py", typescript: "ts"
};
const bucketMap = {
    uheu0: "sc-storage-test-eu0", // UltiHash
    b2uw4: "sc-storage-test-uw4", // Backblaze B2, US West 4
    b2ue5: "sc-storage-test-ue5", // Backblaze B2, US East 5
    b2ec3: "sc-storage-test-ec3", // Backblaze B2, EU Central 3
    r2ue2: "sc-storage-test-ue2", // Cloudflare R2, US East 2
    r2ec1: "sc-storage-test-ec1", // Cloudflare R2, EU Central 1
    s3ue2: "sc-storage-test-ue2", // AWS S3, US East 2
    s3ec1: "sc-storage-test-ec1", // AWS S3, EU Central 1
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Record start time
        const startTime = new Date();
        const RESULTS_FILE = 'results.txt';
        let result = {};
        // Remove results.txt if it exists
        try {
            yield fs_1.promises.unlink(RESULTS_FILE);
        }
        catch (_a) { }
        // Initialize rclone config
        yield (0, test_rclone_1.InitRcloneConfig)();
        // Read environment variables from SaladCloud 
        const env = yield (0, helper_1.getSaladCloud)();
        const localRun = env['salad_machine_id'].toLowerCase().includes('local');
        yield (0, helper_1.appendObjectToFile)(env, RESULTS_FILE);
        const myIP = yield (0, helper_1.getMyIP)();
        yield (0, helper_1.appendObjectToFile)(myIP, RESULTS_FILE);
        const networkInfo = yield (0, test_python_1.getNetworkInfo)();
        if (networkInfo.pass === 'True') {
            //const { Pass, ...restNetworkInfo } = networkInfo; // Remove 'Pass' key before appending
            //await appendObjectToFile(restNetworkInfo, RESULTS_FILE);
            yield (0, helper_1.appendObjectToFile)(networkInfo, RESULTS_FILE);
        }
        else {
            yield (0, helper_1.reallocate)(`Network test failed: ${JSON.stringify(networkInfo)}`, localRun);
        }
        const cudaVersion = yield (0, helper_1.getCUDAVersion)();
        yield (0, helper_1.appendObjectToFile)(cudaVersion, RESULTS_FILE);
        const gpuInfo = yield (0, helper_1.getGPU)();
        yield (0, helper_1.appendObjectToFile)(gpuInfo, RESULTS_FILE);
        const testCases = yield (0, helper_create_testcases_1.readTestCasesFromFile)("testCases.txt");
        console.log(`Loaded ${testCases.length} test cases from testCases.txt`);
        //console.log(testCases); 
        for (const testCase of testCases) {
            // If upload, generate the file if it does not exist; 
            // Download must follow upload, so no need to generate file for download
            if (testCase[2] === 'upload')
                yield (0, helper_1.generateFileIfNotExisted)(testCase[3]);
            // "Remote", "Tool", "Direction",  "Size 
            const tempBucket = bucketMap[testCase[0]] || "unknown-bucket"; // Bucket 
            const tempTool = toolMap[testCase[1]]; // rc, py, ts
            const tempDirection = (testCase[2] === 'upload') ? 'ul' : 'dl'; // ul, dl
            const tempTask = testCase[0] + '_' + tempTool + '_' + tempDirection + '_' + testCase[3];
            const tempTarget = testCase[3] + '.' + testCase[0] + '.' + testCase[1] + '.file';
            const tempSource = (testCase[2] === 'upload') ? testCase[3] : tempTarget;
            // "tool", "direction", "task", "remote", "source", "target", "bucket", "folder", "ID", "chunk_size_mbtype" "concurrency"
            const inputs = {
                tool: testCase[1], // rclone, typescript, python
                direction: testCase[2], // upload, download
                task: tempTask,
                remote: testCase[0], // r2ue2, r2ec1, s3ue2, s3ec1
                source: tempSource,
                target: tempTarget,
                bucket: tempBucket, // Bucket name
                folder: env['salad_container_group_id'],
                ID: env['salad_machine_id'],
                chunk_size_mbtype: "10M", // M -> MB, not MiB
                concurrency: "10" // Number of Parallel transfers
            };
            // console.log(inputs)
            const result = yield (0, test_all_1.Test)(inputs);
            if (Object.keys(result).length <= 1) {
                console.error(result);
                console.error(`Failed test case: ${JSON.stringify(inputs)}`);
            }
            yield (0, helper_1.appendObjectToFile)(result, RESULTS_FILE);
        }
        // Record end time and duration
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationSec = (durationMs / 1000).toFixed(3);
        const timingInfo = {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration_second: durationSec
        };
        yield (0, helper_1.appendObjectToFile)(timingInfo, RESULTS_FILE);
        yield (0, save_results_1.saveTestResults)(RESULTS_FILE, env['salad_machine_id']);
        yield (0, helper_1.reallocate)("The test has been finsihed, and allocate a new node!", localRun);
        /*
        await printFileLines(RESULTS_FILE);
    
        const results =  await readFileAsJson(RESULTS_FILE);
        console.log('Results:', results);
        for (const [key, value] of Object.entries(results)) {
            console.log(`"${key}":"${value}"`);
        }
        */
    });
}
main().catch((err) => {
    console.error('Error running main:', err);
});
//# sourceMappingURL=main.js.map