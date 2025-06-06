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
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTestResults = saveTestResults;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const { CLOUDFLARE_RESULT_ID, CLOUDFLARE_RESULT_KEY, CLOUDFLARE_RESULT_ENDPOINT_URL, CLOUDFLARE_RESULT_BUCKET, CLOUDFLARE_RESULT_FOLDER, } = process.env;
if (!CLOUDFLARE_RESULT_ID || !CLOUDFLARE_RESULT_KEY || !CLOUDFLARE_RESULT_ENDPOINT_URL
    || !CLOUDFLARE_RESULT_BUCKET || !CLOUDFLARE_RESULT_FOLDER) {
    throw new Error("Missing credentials!");
}
const S3Client_RESULT = new client_s3_1.S3Client({
    region: "auto",
    endpoint: CLOUDFLARE_RESULT_ENDPOINT_URL,
    credentials: {
        accessKeyId: CLOUDFLARE_RESULT_ID,
        secretAccessKey: CLOUDFLARE_RESULT_KEY,
    },
    forcePathStyle: true,
});
function saveTestResults(localFileName, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucket = CLOUDFLARE_RESULT_BUCKET;
        const folder = CLOUDFLARE_RESULT_FOLDER;
        const key = `${folder}/${ID}.txt`;
        const fileStream = fs.createReadStream(localFileName);
        try {
            yield S3Client_RESULT.send(new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: fileStream,
            }));
            console.log(`Successfully uploaded ${localFileName} to r2://${bucket}/${key}`);
        }
        catch (err) {
            console.error(`Failed to upload ${localFileName}:`, err);
            throw err;
        }
    });
}
//# sourceMappingURL=save_results.js.map