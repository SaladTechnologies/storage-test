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
exports.getNetworkInfo = getNetworkInfo;
exports.uploadTestPY = uploadTestPY;
exports.downloadTestPY = downloadTestPY;
const child_process_1 = require("child_process");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const { PYTHON_PATH } = process.env;
// Need to be replaced with the Python in the container image
// '/home/ubuntu/storage-test/.venv/bin/python';
// '/opt/conda/bin/python'
const pythonExe = PYTHON_PATH || '/opt/conda/bin/python';
const pythonScript = './src/test.py';
// Run the initial check
function getNetworkInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`${pythonExe} ${pythonScript}`, { cwd: process.cwd() }, (error, stdout) => {
                if (error) {
                    console.error(`Error running ${pythonScript}:`, error); // should not happen
                    resolve({});
                    return;
                }
                try {
                    const result = JSON.parse(stdout.trim()); // should alway return {}  
                    resolve(result);
                }
                catch (e) {
                    console.error(`Error parsing ${pythonScript} output:`, e);
                    resolve({});
                }
            });
        });
    });
}
// Upload from source to bucket/folder/ID/target
function uploadTestPY(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { task, remote, source, bucket, folder, ID, target, chunk_size_mbtype, concurrency } = params;
        const cmd = `${pythonExe} ${pythonScript} upload ${task} ${remote} ${source} ${target} ${bucket} ${folder} ${ID} ${chunk_size_mbtype} ${concurrency}`;
        //console.log(cmd)
        return new Promise((resolve) => {
            (0, child_process_1.exec)(cmd, { cwd: process.cwd() }, (error, stdout) => {
                if (error) {
                    console.error(`Error running ${pythonScript}:`, error); // should not happen
                    resolve({});
                    return;
                }
                try {
                    const result = JSON.parse(stdout.trim()); // should alway return {}
                    resolve(result);
                }
                catch (e) {
                    console.error(`Error parsing ${pythonScript} output:`, e);
                    resolve({});
                }
            });
        });
    });
}
// Download from bucket/folder/ID/source to target
function downloadTestPY(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { task, remote, bucket, folder, ID, source, target, chunk_size_mbtype, concurrency } = params;
        const cmd = `${pythonExe} ${pythonScript} download ${task} ${remote} ${source} ${target} ${bucket} ${folder} ${ID} ${chunk_size_mbtype} ${concurrency}`;
        //console.log(cmd)
        return new Promise((resolve) => {
            (0, child_process_1.exec)(cmd, { cwd: process.cwd() }, (error, stdout) => {
                if (error) {
                    console.error(`Error running ${pythonScript}:`, error); // should not happen
                    resolve({});
                    return;
                }
                try {
                    const result = JSON.parse(stdout.trim()); // should alway return {}
                    resolve(result);
                }
                catch (e) {
                    console.error(`Error parsing ${pythonScript} output:`, e);
                    resolve({});
                }
            });
        });
    });
}
//# sourceMappingURL=test_python.js.map