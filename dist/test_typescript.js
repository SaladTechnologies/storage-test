"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTestTS = uploadTestTS;
exports.downloadTestTS = downloadTestTS;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/*
This module is loaded once, even if is is imported multiple times by other files.
So, the varaibles are initialized only once.
The scope of these variables is only this module, unless they are exported.
*/
const { CLOUDFLARE_ID, CLOUDFLARE_KEY, CLOUDFLARE_US_ENDPOINT_URL, CLOUDFLARE_EU_ENDPOINT_URL, AWS_ID, AWS_KEY, AWS_UE2_REGION, AWS_EC1_REGION, B2_UW4_ID, B2_UW4_KEY, B2_UW4_ENDPOINT_URL, B2_UW4_REGION, B2_UE5_ID, B2_UE5_KEY, B2_UE5_ENDPOINT_URL, B2_UE5_REGION, B2_EC3_ID, B2_EC3_KEY, B2_EC3_ENDPOINT_URL, B2_EC3_REGION, UH_EU0_ID, UH_EU0_KEY, UH_EU0_ENDPOINT_URL } = process.env;
if (!CLOUDFLARE_ID || !CLOUDFLARE_KEY || !CLOUDFLARE_US_ENDPOINT_URL || !CLOUDFLARE_EU_ENDPOINT_URL
    || !AWS_ID || !AWS_KEY || !AWS_UE2_REGION || !AWS_EC1_REGION
    || !B2_UW4_ID || !B2_UW4_KEY || !B2_UW4_ENDPOINT_URL || !B2_UW4_REGION
    || !B2_UE5_ID || !B2_UE5_KEY || !B2_UE5_ENDPOINT_URL || !B2_UE5_REGION
    || !B2_EC3_ID || !B2_EC3_KEY || !B2_EC3_ENDPOINT_URL || !B2_EC3_REGION
    || !UH_EU0_ID || !UH_EU0_KEY || !UH_EU0_ENDPOINT_URL) {
    throw new Error("Missing credentials!");
}
const S3Client_UHEU0 = new client_s3_1.S3Client({
    endpoint: UH_EU0_ENDPOINT_URL,
    region: "eu-central-1", // fails without this setting
    credentials: {
        accessKeyId: UH_EU0_ID,
        secretAccessKey: UH_EU0_KEY,
    },
    forcePathStyle: true,
});
const S3Client_B2UW4 = new client_s3_1.S3Client({
    endpoint: B2_UW4_ENDPOINT_URL,
    region: B2_UW4_REGION,
    credentials: {
        accessKeyId: B2_UW4_ID,
        secretAccessKey: B2_UW4_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});
const S3Client_B2UE5 = new client_s3_1.S3Client({
    endpoint: B2_UE5_ENDPOINT_URL,
    region: B2_UE5_REGION,
    credentials: {
        accessKeyId: B2_UE5_ID,
        secretAccessKey: B2_UE5_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});
const S3Client_B2EC3 = new client_s3_1.S3Client({
    endpoint: B2_EC3_ENDPOINT_URL,
    region: B2_EC3_REGION,
    credentials: {
        accessKeyId: B2_EC3_ID,
        secretAccessKey: B2_EC3_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});
const S3Client_R2UE2 = new client_s3_1.S3Client({
    region: "auto", // Cloudflare R2 uses 'auto' region
    endpoint: CLOUDFLARE_US_ENDPOINT_URL,
    credentials: {
        accessKeyId: CLOUDFLARE_ID,
        secretAccessKey: CLOUDFLARE_KEY,
    },
    forcePathStyle: true, // Required for R2 compatibility
});
const S3Client_R2EC1 = new client_s3_1.S3Client({
    region: "auto", // Cloudflare R2 uses 'auto' region
    endpoint: CLOUDFLARE_EU_ENDPOINT_URL,
    credentials: {
        accessKeyId: CLOUDFLARE_ID,
        secretAccessKey: CLOUDFLARE_KEY,
    },
    forcePathStyle: true, // Required for R2 compatibility
});
const S3Client_S3UE2 = new client_s3_1.S3Client({
    region: AWS_UE2_REGION,
    credentials: {
        accessKeyId: AWS_ID,
        secretAccessKey: AWS_KEY,
    }
});
const S3Client_S3EC1 = new client_s3_1.S3Client({
    region: AWS_EC1_REGION,
    credentials: {
        accessKeyId: AWS_ID,
        secretAccessKey: AWS_KEY,
    }
});
// Upload from source to bucket/folder/ID/target
function uploadTestTS(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { task, remote, source, bucket, folder, ID, target, chunk_size_mbtype, concurrency } = params;
        // The size of source file in MB
        let fileSizeMB = 0;
        try {
            const stat = yield fs.promises.stat(source);
            fileSizeMB = stat.size / 1000000;
        }
        catch (e) {
            // console.error(`Failed to stat file:`, e);
            return { [`${task}_error_filesize`]: String(e) };
        }
        let s3;
        if (remote === "r2ue2") {
            s3 = S3Client_R2UE2;
        }
        else if (remote === "r2ec1") {
            s3 = S3Client_R2EC1;
        }
        else if (remote === "s3ue2") {
            s3 = S3Client_S3UE2;
        }
        else if (remote === "s3ec1") {
            s3 = S3Client_S3EC1;
        }
        else if (remote === "b2uw4") {
            s3 = S3Client_B2UW4;
        }
        else if (remote === "b2ue5") {
            s3 = S3Client_B2UE5;
        }
        else if (remote === "b2ec3") {
            s3 = S3Client_B2EC3;
        }
        else if (remote === "uheu0") {
            s3 = S3Client_UHEU0;
        }
        else {
            return { [`${task}_error_remote`]: `Unknown remote: ${remote}` };
        }
        const chunkSizeMB = parseInt(chunk_size_mbtype.replace(/[^0-9]/g, ""), 10); // 10 means decimal number
        const partSize = chunkSizeMB * 1000000; // MB to bytes
        const queueSize = parseInt(concurrency, 10);
        const key = path.posix.join(folder, ID, target);
        // Start
        const startTime = Date.now();
        try {
            const upload = new lib_storage_1.Upload({
                client: s3,
                params: {
                    Bucket: bucket,
                    Key: key,
                    Body: fs.createReadStream(source),
                },
                queueSize, // concurrency
                partSize, // chunk size in bytes
                leavePartsOnError: false,
            });
            yield upload.done();
        }
        catch (e) {
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
    });
}
// Helper to convert stream to buffer: read an entire stream into a single buffer
function streamToBuffer(stream) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, stream_1, stream_1_1;
        var _b, e_1, _c, _d;
        const chunks = [];
        try {
            for (_a = true, stream_1 = __asyncValues(stream); stream_1_1 = yield stream_1.next(), _b = stream_1_1.done, !_b; _a = true) {
                _d = stream_1_1.value;
                _a = false;
                const chunk = _d;
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_a && !_b && (_c = stream_1.return)) yield _c.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Buffer.concat(chunks); // Concatenate all chunks into a single buffer
    });
}
// Download from bucket/folder/ID/source to target
function downloadTestTS(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { task, remote, bucket, folder, ID, source, target, chunk_size_mbtype, concurrency } = params;
        let s3;
        if (remote === "r2ue2") {
            s3 = S3Client_R2UE2;
        }
        else if (remote === "r2ec1") {
            s3 = S3Client_R2EC1;
        }
        else if (remote === "s3ue2") {
            s3 = S3Client_S3UE2;
        }
        else if (remote === "s3ec1") {
            s3 = S3Client_S3EC1;
        }
        else if (remote === "b2uw4") {
            s3 = S3Client_B2UW4;
        }
        else if (remote === "b2ue5") {
            s3 = S3Client_B2UE5;
        }
        else if (remote === "b2ec3") {
            s3 = S3Client_B2EC3;
        }
        else if (remote === "uheu0") {
            s3 = S3Client_UHEU0;
        }
        else {
            return { [`${task}_error_remote`]: `Unknown remote: ${remote}` };
        }
        const chunkSizeMB = parseInt(chunk_size_mbtype.replace(/[^0-9]/g, ""), 10); // 10 means decimal number
        const chunkSize = chunkSizeMB * 1000000; // MB to bytes
        const concurrencyNum = parseInt(concurrency, 10);
        const key = path.posix.join(folder, ID, source);
        // Get the object size first from cloud storage
        let headRes;
        try {
            headRes = yield s3.send(new client_s3_1.HeadObjectCommand({
                Bucket: bucket,
                Key: key,
            }));
        }
        catch (e) {
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
        const fd = yield fs.promises.open(target, "w");
        // zero length, no need to be pre-sized
        // Node can write a chunk at the specified offset, regardless of the file's current length.
        // If you write beyond the current end of the file, the file will be automatically extended, and any unwritten bytes in between will be filled with zeros.
        try {
            let nextPart = 0;
            // Called multiple times in parallel
            function downloadNext() {
                return __awaiter(this, void 0, void 0, function* () {
                    while (true) {
                        const partNumber = nextPart++; // safe for parallel execution, which happens sequentially
                        if (partNumber >= partCount)
                            break; // for protection, if partNumber is larger than partCount, break the loop
                        const start = partNumber * chunkSize; // type assertion
                        const end = Math.min(start + chunkSize, tempFileSize) - 1;
                        const range = `bytes=${start}-${end}`;
                        // console.log(range);
                        const res = yield s3.send(new client_s3_1.GetObjectCommand({
                            Bucket: bucket,
                            Key: key,
                            Range: range
                        }));
                        const chunk = yield streamToBuffer(res.Body);
                        yield fd.write(chunk, 0, chunk.length, start);
                    }
                });
            }
            // Create an array with some slots, 
            // For each slot, call downloadNext() in parallel
            // 'anything' is just a placeholder, it can be any value which will be replaced by the actual promise returned by downloadNext()
            yield Promise.all(Array(concurrencyNum).fill('anything').map(() => downloadNext()));
        }
        catch (e) {
            //console.error(`Error during download:`, e);
            return { [`${task}_error_download`]: String(e) }; // Return empty object if any part fails
        }
        finally {
            yield fd.close();
        }
        // Check the size of the downloaded file
        let fileSizeMB = 0;
        try {
            const stat = yield fs.promises.stat(target);
            fileSizeMB = stat.size / 1000000;
        }
        catch (e) {
            // console.error(`Failed to get file size:`, e);
            return { [`${task}_error_filesize`]: String(e) };
        }
        // End
        const timeSec = (Date.now() - startTime) / 1000; // Time in seconds
        const throughputMbps = (fileSizeMB * 8) / timeSec;
        return {
            // [`${task}_size_MB`]: fileSizeMB.toFixed(3),
            [`${task}_time_second`]: timeSec.toFixed(3),
            [`${task}_throughput_Mbps`]: throughputMbps.toFixed(3)
        };
    });
}
//# sourceMappingURL=test_typescript.js.map