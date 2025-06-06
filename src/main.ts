// relative to the location of main.ts, not the process's working directory; same for the compiled JS files 
import { generateFileIfNotExisted,
         appendObjectToFile, reallocate,
         getSaladCloud, getMyIP, 
         getCUDAVersion, getGPU, 
         printFileLines, readFileAsJson } from './helper'; 

import { readTestCasesFromFile } from './helper_create_testcases';
import { getNetworkInfo } from './test_python';
import { InitRcloneConfig } from './test_rclone';
import { Test } from './test_all'
import { saveTestResults } from './save_results'; // Assuming you have a function to save results
import { promises as fs } from 'fs';

const toolMap: Record<string, string> = {
        rclone: "rc", python: "py", typescript: "ts"
};

const bucketMap: Record<string, string> = {
        uheu0: "sc-storage-test-eu0",  // UltiHash
        b2uw4: "sc-storage-test-uw4",  // Backblaze B2, US West 4
        b2ue5: "sc-storage-test-ue5",  // Backblaze B2, US East 5
        b2ec3: "sc-storage-test-ec3",  // Backblaze B2, EU Central 3
        r2ue2: "sc-storage-test-ue2",  // Cloudflare R2, US East 2
        r2ec1: "sc-storage-test-ec1",  // Cloudflare R2, EU Central 1
        s3ue2: "sc-storage-test-ue2",  // AWS S3, US East 2
        s3ec1: "sc-storage-test-ec1",  // AWS S3, EU Central 1
};

async function main() {
    // Record start time
    const startTime = new Date();
    
    const RESULTS_FILE = 'results.txt';
    let result: Record<string, string> = {};

    // Remove results.txt if it exists
    try {
        await fs.unlink(RESULTS_FILE);
    } catch {}

    // Initialize rclone config
    await InitRcloneConfig();

    // Read environment variables from SaladCloud 
    const env = await getSaladCloud();
    const localRun : boolean =  env['salad_machine_id'].toLowerCase().includes('local');
    await appendObjectToFile(env, RESULTS_FILE);
     
    const myIP = await getMyIP();
    await appendObjectToFile(myIP, RESULTS_FILE);

    const networkInfo = await getNetworkInfo();
    if (networkInfo.pass === 'True') {
        //const { Pass, ...restNetworkInfo } = networkInfo; // Remove 'Pass' key before appending
        //await appendObjectToFile(restNetworkInfo, RESULTS_FILE);
        await appendObjectToFile(networkInfo, RESULTS_FILE);
    } else {
        await reallocate(`Network test failed: ${JSON.stringify(networkInfo)}`, localRun);
    }

    const cudaVersion = await getCUDAVersion();
    await appendObjectToFile(cudaVersion, RESULTS_FILE);

    const gpuInfo = await getGPU();
    await appendObjectToFile(gpuInfo, RESULTS_FILE);
    
    const testCases = await readTestCasesFromFile("testCases.txt");
    console.log(`Loaded ${testCases.length} test cases from testCases.txt`); 
    //console.log(testCases); 

    for (const testCase of testCases) {

        // If upload, generate the file if it does not exist; 
        // Download must follow upload, so no need to generate file for download
        if (testCase[2] === 'upload') 
            await generateFileIfNotExisted(testCase[3]); 

        // "Remote", "Tool", "Direction",  "Size 
        const tempBucket    = bucketMap[ testCase[0] ] || "unknown-bucket"; // Bucket 
        const tempTool      = toolMap[ testCase[1] ]; // rc, py, ts
        const tempDirection = (testCase[2] === 'upload') ? 'ul' : 'dl'; // ul, dl

        const tempTask      = testCase[0] + '_' + tempTool +  '_' + tempDirection + '_' + testCase[3]; 
        const tempTarget    = testCase[3] + '.'+ testCase[0] + '.' + testCase[1] +'.file' 
        const tempSource    = (testCase[2] === 'upload') ? testCase[3]: tempTarget

        // "tool", "direction", "task", "remote", "source", "target", "bucket", "folder", "ID", "chunk_size_mbtype" "concurrency"
        const inputs = {
            tool              : testCase[1], // rclone, typescript, python
            direction         : testCase[2], // upload, download
            task              : tempTask,
            remote            : testCase[0], // r2ue2, r2ec1, s3ue2, s3ec1
            source            : tempSource,
            target            : tempTarget,
            bucket            : tempBucket, // Bucket name
            folder            : env['salad_container_group_id'], 
            ID                : env['salad_machine_id'],
            chunk_size_mbtype : "10M", // M -> MB, not MiB
            concurrency       : "10"   // Number of Parallel transfers
        };

        // console.log(inputs)
        const result = await Test(inputs) ;
        
        if (Object.keys(result).length <= 1) {
            console.error(result)
            console.error(`Failed test case: ${JSON.stringify(inputs)}`);
        }
        await appendObjectToFile(result, RESULTS_FILE);
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
    await appendObjectToFile(timingInfo, RESULTS_FILE);

    await saveTestResults( RESULTS_FILE,env['salad_machine_id'] )
    
    await reallocate("The test has been finsihed, and allocate a new node!", localRun);
    
    /*
    await printFileLines(RESULTS_FILE);

    const results =  await readFileAsJson(RESULTS_FILE);
    console.log('Results:', results);
    for (const [key, value] of Object.entries(results)) {
        console.log(`"${key}":"${value}"`);
    }
    */
}


main().catch((err) => {
    console.error('Error running main:', err);
});
