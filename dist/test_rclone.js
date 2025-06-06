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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitRcloneConfig = InitRcloneConfig;
exports.uploadTestRC = uploadTestRC;
exports.downloadTestRC = downloadTestRC;
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/*
This module is loaded once, even if is is imported multiple times by other files.
So, the varaibles are initialized only once.
The scope of these variables is only this module, unless they are exported.
*/
const { CLOUDFLARE_ID, CLOUDFLARE_KEY, CLOUDFLARE_US_ENDPOINT_URL, CLOUDFLARE_EU_ENDPOINT_URL, AWS_ID, AWS_KEY, AWS_UE2_REGION, AWS_EC1_REGION, B2_UW4_ID, B2_UW4_KEY, B2_UW4_ENDPOINT_URL, B2_UW4_REGION, B2_UE5_ID, B2_UE5_KEY, B2_UE5_ENDPOINT_URL, B2_UE5_REGION, B2_EC3_ID, B2_EC3_KEY, B2_EC3_ENDPOINT_URL, B2_EC3_REGION, UH_EU0_ID, UH_EU0_KEY, UH_EU0_ENDPOINT_URL } = process.env;
function InitRcloneConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = path_1.default.join(os_1.default.homedir(), ".config", "rclone", "rclone.conf");
        // Ensure the directory exists
        yield fs_1.promises.mkdir(path_1.default.dirname(filename), { recursive: true });
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
        yield fs_1.promises.writeFile(filename, configContent, { encoding: "utf-8" });
        //console.log(`rclone config written to ${filename}`);
    });
}
// Upload from source to bucket/folder/ID/target
function uploadTestRC(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { task, remote, source, bucket, folder, ID, target, chunk_size_mbtype, concurrency } = params;
        // The size of source file in MB
        let fileSizeMB = 0;
        try {
            const stat = yield fs_1.promises.stat(source);
            fileSizeMB = stat.size / 1000000;
        }
        catch (e) {
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
            (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
                if (error) {
                    // console.error(`rclone error:`, stderr || error);
                    resolve({ [`${task}_error_upload`]: String(stderr || error) });
                }
                else {
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
    });
}
// Download from bucket/folder/ID/source to target
function downloadTestRC(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { task, remote, bucket, folder, ID, source, target, chunk_size_mbtype, concurrency } = params;
        // Build rclone command
        const tempSource = `${remote}:${bucket}/${folder}/${ID}/${source}`;
        const cmd = `rclone copyto ${tempSource} ${target} --s3-chunk-size=${chunk_size_mbtype} --transfers=${concurrency} --ignore-times`; // --ignore-times, forces the copy
        //console.log(`Executing rclone command: ${cmd}`);
        // Start
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
                if (error) {
                    //console.error(`rclone error:`, stderr || error);
                    resolve({ [`${task}_error_download`]: String(stderr || error) });
                }
                else {
                    (() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // The size of target file in MB
                            const stat = yield fs_1.promises.stat(target);
                            const fileSizeMB = stat.size / 1000000;
                            // End
                            const timeSec = (Date.now() - startTime) / 1000; // Time in seconds
                            const throughputMbps = (fileSizeMB * 8) / timeSec;
                            resolve({
                                // [`${task}_size_MB`]: fileSizeMB.toFixed(3),
                                [`${task}_time_second`]: timeSec.toFixed(3),
                                [`${task}_throughput_Mbps`]: throughputMbps.toFixed(3)
                            });
                        }
                        catch (e) {
                            // console.error(`Failed to stat file:`, e);
                            resolve({ [`${task}_error_filesize`]: String(e) });
                        }
                    }))();
                }
            });
        });
    });
}
//# sourceMappingURL=test_rclone.js.map