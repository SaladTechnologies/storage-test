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
exports.Test = Test;
const test_rclone_1 = require("./test_rclone");
const test_typescript_1 = require("./test_typescript");
const test_python_1 = require("./test_python");
function Test(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tool, direction, task, remote, source, target, bucket, folder, ID, chunk_size_mbtype, concurrency } = params;
        if (tool === "rclone") {
            if (direction === "upload") {
                return yield (0, test_rclone_1.uploadTestRC)({
                    task, remote, source, bucket, folder, ID, target,
                    chunk_size_mbtype, concurrency
                });
            }
            else if (direction === "download") {
                return yield (0, test_rclone_1.downloadTestRC)({
                    task, remote, bucket, folder, ID, source, target,
                    chunk_size_mbtype, concurrency
                });
            }
            else {
                return { [`${task}_error_direction`]: `Invalid direction: ${direction}` };
            }
        }
        else if (tool === "python") {
            if (direction === "upload") {
                return yield (0, test_python_1.uploadTestPY)({
                    task, remote, source, bucket, folder, ID, target,
                    chunk_size_mbtype, concurrency
                });
            }
            else if (direction === "download") {
                return yield (0, test_python_1.downloadTestPY)({
                    task, remote, bucket, folder, ID, source, target,
                    chunk_size_mbtype, concurrency
                });
            }
            else {
                return { [`${task}_error_direction`]: `Invalid direction: ${direction}` };
            }
        }
        else if (tool === "typescript") {
            if (direction === "upload") {
                return yield (0, test_typescript_1.uploadTestTS)({
                    task, remote, source, bucket, folder, ID, target,
                    chunk_size_mbtype, concurrency
                });
            }
            else if (direction === "download") {
                return yield (0, test_typescript_1.downloadTestTS)({
                    task, remote, bucket, folder, ID, source, target,
                    chunk_size_mbtype, concurrency
                });
            }
            else {
                return { [`${task}_error_direction`]: `Invalid direction: ${direction}` };
            }
        }
        else {
            return { [`${task}_error_tool`]: `Invalid tool: ${tool}` };
        }
    });
}
//# sourceMappingURL=test_all.js.map