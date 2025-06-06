import { uploadTestRC, downloadTestRC } from './test_rclone';
import { uploadTestTS, downloadTestTS } from './test_typescript';
import { uploadTestPY, downloadTestPY } from './test_python';

export async function Test(params: {
    tool: string, // rclone, python or typescript 
    direction: string, // upload or download   
    task: string,
    remote: string,
    source: string, target: string,
    bucket: string, folder: string, ID: string, 
    chunk_size_mbtype: string, // e.g., "10M", M -> MB, not MiB
    concurrency: string        // e.g., "10"
}): Promise<Record<string, string>> {

    const { tool, direction, task, remote, source, target, bucket, folder, ID,  chunk_size_mbtype, concurrency } = params;

    if (tool === "rclone") {
        if (direction === "upload") {
            return await uploadTestRC({
                task, remote, source, bucket, folder, ID, target,
                chunk_size_mbtype, concurrency
            });
        }
        else if (direction === "download") {
            return await downloadTestRC({
                task, remote, bucket, folder, ID, source, target,
                chunk_size_mbtype, concurrency
            });
        } else {
            return { [`${task}_error_direction`]: `Invalid direction: ${direction}` }; 
        }

    } else if (tool === "python") { 
        if (direction === "upload") {
            return await uploadTestPY({
                task, remote, source, bucket, folder, ID, target,
                chunk_size_mbtype, concurrency
            });
        }
        else if (direction === "download") {
            return await downloadTestPY({
                task, remote, bucket, folder, ID, source, target,
                chunk_size_mbtype, concurrency
            });
        } else {
            return { [`${task}_error_direction`]: `Invalid direction: ${direction}` }; 
        }  
    } else if (tool === "typescript") {
        if (direction === "upload") {
            return await uploadTestTS({
                task, remote, source, bucket, folder, ID, target,
                chunk_size_mbtype, concurrency
            });
        }
        else if (direction === "download") {
            return await downloadTestTS({
                task, remote, bucket, folder, ID, source, target,
                chunk_size_mbtype, concurrency
            });
        } else {
            return { [`${task}_error_direction`]: `Invalid direction: ${direction}` }; 
        }     
    } else {
        return { [`${task}_error_tool`]: `Invalid tool: ${tool}` }; 
    }  
}
