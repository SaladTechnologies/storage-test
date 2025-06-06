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
exports.generateFileIfNotExisted = generateFileIfNotExisted;
exports.appendObjectToFile = appendObjectToFile;
exports.getSaladCloud = getSaladCloud;
exports.getMyIP = getMyIP;
exports.reallocate = reallocate;
exports.getCUDAVersion = getCUDAVersion;
exports.getGPU = getGPU;
exports.printFileLines = printFileLines;
exports.readFileAsJson = readFileAsJson;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const crypto_1 = require("crypto");
dotenv.config();
// Create a test file with random data if it does not exist.
// The file size is specified in MB, e.g., "10M", "20MB" (only M or MB, not KB, GB, MiB or Mi).
function generateFileIfNotExisted(fileSizeMB) {
    return __awaiter(this, void 0, void 0, function* () {
        const sizeMB = parseInt(fileSizeMB.replace(/[^0-9]/g, ""), 10); // replace non-numeric characters with '' to get the size in MB
        const filename = `${sizeMB}MB`;
        // If file exists, return immediately
        try {
            yield fs_1.promises.access(filename);
            return;
        }
        catch (_a) { } // File does not exist, continue to create
        const sizeBytes = sizeMB * 1000000; // 1 MB = 1,000,000 bytes
        const chunkSize = 1000000; // Write in 1MB chunks
        const handle = yield fs_1.promises.open(filename, 'w');
        try {
            let written = 0;
            while (written < sizeBytes) {
                const toWrite = Math.min(chunkSize, sizeBytes - written);
                const buffer = (0, crypto_1.randomBytes)(toWrite);
                yield handle.write(buffer, 0, toWrite, written);
                written += toWrite;
            }
        }
        finally {
            yield handle.close();
        }
    });
}
// Save metrics to the local file
function appendObjectToFile(obj, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lines = Object.entries(obj).map(([key, value]) => `"${key}":"${value}"\n`).join('');
            yield fs_1.promises.appendFile(filename, lines);
        }
        catch (e) {
            console.error(`Error writing to ${filename}:`, e);
        }
    });
}
// Get SaladCloud environment info
function getSaladCloud() {
    return __awaiter(this, void 0, void 0, function* () {
        // The async function returns a Promise that wraps the return values
        const result = {};
        result['salad_machine_id'] = process.env.SALAD_MACHINE_ID || 'LOCAL';
        result['salad_container_group_id'] = process.env.SALAD_CONTAINER_GROUP_ID || 'LOCAL';
        return result;
    });
}
// Get public IP address
function getMyIP() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://wtfismyip.com/text');
            const ip = response.data.trim();
            return { 'ip_address': ip };
        }
        catch (e) {
            console.error('Error fetching public IP:', e);
            return { 'ip_address': '' };
        }
    });
}
// Trigger node reallocation if a node is not suitable
function reallocate(reason, localRun) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(reason);
        if (localRun) {
            console.log("Call the exit(0) ......");
            process.exit(0);
        }
        else {
            console.log("Call the IMDS reallocate ......");
            const url = "http://169.254.169.254/v1/reallocate";
            const headers = {
                'Content-Type': 'application/json',
                'Metadata': 'true'
            };
            const body = { Reason: reason };
            try {
                yield axios_1.default.post(url, body, { headers });
            }
            catch (e) {
                console.error("Error calling IMDS reallocate:", e);
            }
            yield new Promise(resolve => setTimeout(resolve, 10000)); // sleep 10 seconds
        }
    });
}
// Read the supported CUDA RT Version
function getCUDAVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            (0, child_process_1.exec)('nvidia-smi', (error, stdout) => {
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
    });
}
// Get the GPU info
function getGPU() {
    return __awaiter(this, void 0, void 0, function* () {
        // Call resolve only when manually create a new Promise
        return new Promise((resolve) => {
            const result = {};
            const cmd = 'nvidia-smi --query-gpu=gpu_name,memory.total,memory.used,memory.free,utilization.memory,temperature.gpu,utilization.gpu --format=csv,noheader';
            (0, child_process_1.exec)(cmd, (error, stdout) => {
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
                }
                catch (_a) {
                    resolve({});
                }
            });
        });
    });
}
// Function to read and print a file line by line
function printFileLines(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs_1.promises.readFile(filename, 'utf-8');
            data.split('\n').forEach(line => {
                if (line.trim()) {
                    console.log(line);
                }
            });
        }
        catch (e) {
            console.error(`Error reading ${filename}:`, e);
        }
    });
}
// Function to read a file and return a JSON object
function readFileAsJson(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {}; // Initialize an empty object to store key-value pairs
        try {
            const data = yield fs_1.promises.readFile(filename, 'utf-8');
            data.split('\n').forEach(line => {
                // Only parse lines that match the key-value pattern
                const match = line.match(/^"([^\"]+)":"([^\"]+)"$/);
                if (match) {
                    result[match[1]] = match[2];
                }
            });
        }
        catch (e) {
            console.error(`Error reading ${filename}:`, e);
        }
        return result;
    });
}
//# sourceMappingURL=helper.js.map