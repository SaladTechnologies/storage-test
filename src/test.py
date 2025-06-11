import os
import time
import boto3
import sys
import json
from boto3.s3.transfer import TransferConfig
import speedtest
from pythonping import ping
from dotenv import load_dotenv
 
load_dotenv()

SALAD_MACHINE_ID =  os.getenv("SALAD_MACHINE_ID")
g_DLSPEED = int(os.getenv("DLSPEED", "50")) # Mbps
g_ULSPEED = int(os.getenv("ULSPEED", "20")) # Mbps
g_RTT     = int(os.getenv("RTT","499"))     # ms

UH_EU0_ID                  = os.getenv("UH_EU0_ID", "")
UH_EU0_KEY                 = os.getenv("UH_EU0_KEY", "")
UH_EU0_ENDPOINT_URL        = os.getenv("UH_EU0_ENDPOINT_URL", "")

# Make sure to set the environment variables for Backblaze B2
# AWS_REQUEST_CHECKSUM_CALCULATION=when_required
# AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
# https://www.backblaze.com/docs/cloud-storage-use-the-aws-sdk-for-python-with-backblaze-b2
# https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html#using-environment-variables

B2_UW4_ID                  = os.getenv("B2_UW4_ID", "")
B2_UW4_KEY                 = os.getenv("B2_UW4_KEY", "")
B2_UW4_ENDPOINT_URL        = os.getenv("B2_UW4_ENDPOINT_URL", "")
B2_UW4_REGION              = os.getenv("B2_UW4_REGION", "")

B2_UE5_ID                  = os.getenv("B2_UE5_ID", "")
B2_UE5_KEY                 = os.getenv("B2_UE5_KEY", "")
B2_UE5_ENDPOINT_URL        = os.getenv("B2_UE5_ENDPOINT_URL", "")
B2_UE5_REGION              = os.getenv("B2_UE5_REGION", "")

B2_EC3_ID                  = os.getenv("B2_EC3_ID", "")
B2_EC3_KEY                 = os.getenv("B2_EC3_KEY", "")
B2_EC3_ENDPOINT_URL        = os.getenv("B2_EC3_ENDPOINT_URL", "")
B2_EC3_REGION              = os.getenv("B2_EC3_REGION", "")

CLOUDFLARE_ID              = os.getenv("CLOUDFLARE_ID", "")
CLOUDFLARE_KEY             = os.getenv("CLOUDFLARE_KEY", "")
CLOUDFLARE_US_ENDPOINT_URL = os.getenv("CLOUDFLARE_US_ENDPOINT_URL", "")
CLOUDFLARE_EU_ENDPOINT_URL = os.getenv("CLOUDFLARE_EU_ENDPOINT_URL", "")

AWS_ID                     = os.getenv("AWS_ID", "")
AWS_KEY                    = os.getenv("AWS_KEY", "")
AWS_UE2_REGION             = os.getenv("AWS_UE2_REGION", "")
AWS_EC1_REGION             = os.getenv("AWS_EC1_REGION", "")

S3Client_UHEU0 = boto3.client(
    "s3",
    endpoint_url=UH_EU0_ENDPOINT_URL,
    aws_access_key_id=UH_EU0_ID,
    aws_secret_access_key=UH_EU0_KEY,
)

S3Client_B2UW4 = boto3.client(
    "s3",
    endpoint_url=B2_UW4_ENDPOINT_URL,
    aws_access_key_id=B2_UW4_ID,
    aws_secret_access_key=B2_UW4_KEY,
    region_name=B2_UW4_REGION,
)

S3Client_B2UE5 = boto3.client(
    "s3",
    endpoint_url=B2_UE5_ENDPOINT_URL,
    aws_access_key_id=B2_UE5_ID,
    aws_secret_access_key=B2_UE5_KEY,
    region_name=B2_UE5_REGION,
)

S3Client_B2EC3 = boto3.client(
    "s3",
    endpoint_url=B2_EC3_ENDPOINT_URL,
    aws_access_key_id=B2_EC3_ID,
    aws_secret_access_key=B2_EC3_KEY,
    region_name=B2_EC3_REGION,
)

S3Client_R2UE2 = boto3.client(
    "s3",
    endpoint_url=CLOUDFLARE_US_ENDPOINT_URL,
    aws_access_key_id=CLOUDFLARE_ID,
    aws_secret_access_key=CLOUDFLARE_KEY,
    region_name="auto",
)

S3Client_R2EC1 = boto3.client(
    "s3",
    endpoint_url=CLOUDFLARE_EU_ENDPOINT_URL,
    aws_access_key_id=CLOUDFLARE_ID,
    aws_secret_access_key=CLOUDFLARE_KEY,
    region_name="auto",
)

S3Client_S3UE2 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ID,
    aws_secret_access_key=AWS_KEY,
    region_name=AWS_UE2_REGION
)

S3Client_S3EC1 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ID,
    aws_secret_access_key=AWS_KEY,
    region_name=AWS_EC1_REGION
)

# Test network bandwdith
# Not output any messages to stdout
def network_test():
    # print("Test the network speed ....................", flush=True)
    try:
        speed_test = speedtest.Speedtest()
        bserver    = speed_test.get_best_server()
        dlspeed    = int(speed_test.download() / (1000 * 1000))  # Convert to Mbps, not Mib
        ulspeed    = int(speed_test.upload() / (1000 * 1000))  # Convert to Mbps, not Mib
        latency    = bserver['latency'] # the RTT to the selected test server
        country    = bserver['country'] 
        location   = bserver['name']
    except Exception as e:  
        # Some ISPs may block speed test traffic; in such cases, we fall back to the default network performance for the node.
        return "none", "none", g_RTT, g_DLSPEED, g_ULSPEED
    
    return country, location, latency, dlspeed, ulspeed    

# Test network latency
# Not output any messages to stdout
# Only the root user can run this code - no issue in containers
def ping_test(tCount=10):
    if tCount ==0:
        return g_RTT, g_RTT, g_RTT
    try:
        # print("To: ec2.us-west-1.amazonaws.com")
        temp = ping('ec2.us-west-1.amazonaws.com', interval=1, count=tCount, verbose=False)
        latency_uswest1 = temp.rtt_avg_ms # average of successful pings only     
    
        # print("To: ec2.us-east-2.amazonaws.com")
        temp = ping('ec2.us-east-2.amazonaws.com', interval=1, count=tCount, verbose=False)
        latency_useast2 = temp.rtt_avg_ms # average of successful pings only     

        # print("To: ec2.eu-central-1.amazonaws.com")  
        temp = ping('ec2.eu-central-1.amazonaws.com', interval=1, count=tCount,verbose=False)
        latency_eucentral1 = temp.rtt_avg_ms # average of successful pings only.
    except Exception as e:  
        return g_RTT, g_RTT, g_RTT
    
    return latency_uswest1, latency_useast2, latency_eucentral1

# Not output any messages to stdout
def Initial_Check():    

    if SALAD_MACHINE_ID == "LOCAL" or SALAD_MACHINE_ID == "local":       # Skip the initial checks if run locally    
        environment= { "pass": str(True) }   
    else:
        # Network test: bandwidth
        country, location, latency, dlspeed, ulspeed = network_test() 
  
        # Network test: latency to some locations; should reallocate if ping fails
        latency_us_w, latency_us_e, latency_eu = ping_test(tCount = 10) 

        if ulspeed < g_ULSPEED or dlspeed < g_DLSPEED or latency_us_w > g_RTT or latency_us_e > g_RTT or latency_eu > g_RTT:
            Pass = False
        else:
            Pass = True

        environment = { "pass":               str(Pass),
                        "country":            country,
                        "location":           location,
                        "rtt_ms":             str(latency),
                        "upload_Mbps":        str(ulspeed),
                        "download_Mbps":      str(dlspeed), 
                        "rtt_to_us_west1_ms": str(latency_us_w),                        
                        "rtt_to_us_east2_ms": str(latency_us_e),
                        "rtt_to_eu_cent1_ms": str(latency_eu),
        }

    return environment

# Upload from source to bucket/folder/ID/target/target
# Not output any messages to stdout
def uploadTestPY(
    task, 
    remote, 
    source, 
    bucket, folder, ID, target,
    chunk_size_mbtype, # e.g., "10M"
    concurrency        #  e.g., "10"
):
    
    # The size of source file in MB
    try:
        fileSize = os.path.getsize(source)
        fileSizeMB = fileSize / 1_000_000
    except Exception as e:
        return {f"{task}_error_filesize": str(e)}

    if remote == "r2ue2":
        s3 = S3Client_R2UE2
    elif remote == "r2ec1":
        s3 = S3Client_R2EC1
    elif remote == "s3ue2":
        s3 = S3Client_S3UE2
    elif remote == "s3ec1":
        s3 = S3Client_S3EC1
    elif remote == "b2uw4":
        s3 = S3Client_B2UW4
    elif remote == "b2ue5":
        s3 = S3Client_B2UE5
    elif remote == "b2ec3":
        s3 = S3Client_B2EC3
    elif remote == "uheu0":
        s3 = S3Client_UHEU0    
    else:
        return { f"{task}_error_remote": "Invalid remote specified" }
    
    chunk_size_mb = int(''.join(filter(str.isdigit, chunk_size_mbtype)))
    multipart_chunksize = chunk_size_mb * 1_000_000
    max_concurrency = int(concurrency)
    key = f"{folder}/{ID}/{target}"

    config = TransferConfig(
        multipart_chunksize=multipart_chunksize,
        max_concurrency=max_concurrency, # ignored if use_threads is False
        use_threads=True
    )

    # Start
    startTime = time.time()
    
    try:
        s3.upload_file(
            Filename=source,
            Bucket=bucket,
            Key=key,
            Config=config
        )
    except Exception as e:
        return { f"{task}_error_upload": str(e) }
    
    # End
    timeSec = time.time() - startTime
    throughputMbps = (fileSizeMB * 8) / timeSec 

    return {
        # f"{task}_size_MB": f"{fileSizeMB:.3f}",
        f"{task}_time_second": f"{timeSec:.3f}",
        f"{task}_throughput_Mbps": f"{throughputMbps:.3f}"
    }

# Download from bucket/folder/ID/source to target
# Not output any messages to stdout
def downloadTestPY(
    task,
    remote,
    bucket, folder, ID, source,
    target,
    chunk_size_mbtype,  # e.g., "10M"
    concurrency         # e.g., "10"
):
    
    if remote == "r2ue2":
        s3 = S3Client_R2UE2
    elif remote == "r2ec1":
        s3 = S3Client_R2EC1
    elif remote == "s3ue2":
        s3 = S3Client_S3UE2
    elif remote == "s3ec1":
        s3 = S3Client_S3EC1
    elif remote == "b2uw4":
        s3 = S3Client_B2UW4
    elif remote == "b2ue5":
        s3 = S3Client_B2UE5
    elif remote == "b2ec3":
        s3 = S3Client_B2EC3
    elif remote == "uheu0":
        s3 = S3Client_UHEU0    
    else:
        return { f"{task}_error_remote": "Invalid remote specified" }

    chunk_size_mb = int(''.join(filter(str.isdigit, chunk_size_mbtype)))
    multipart_chunksize = chunk_size_mb * 1_000_000
    max_concurrency = int(concurrency)
    key = f"{folder}/{ID}/{source}"

    config = TransferConfig(
        multipart_chunksize=multipart_chunksize,
        max_concurrency=max_concurrency,  # ignored if use_threads is False
        use_threads=True
    )

    # Start
    startTime = time.time()

    try:
        s3.download_file(
            Bucket=bucket,
            Key=key,
            Filename=target,
            Config=config
        )
    except Exception as e:
        return { f"{task}_error_download": str(e) }

    # Check the size of the downloaded file
    try:
        fileSize = os.path.getsize(target)
        fileSizeMB = fileSize / 1_000_000
    except Exception as e:
        return { f"{task}_error_filesize": str(e) }

    # End
    timeSec = time.time() - startTime
    throughputMbps = (fileSizeMB * 8) / timeSec 

    return {
        # f"{task}_size_MB": f"{fileSizeMB:.3f}",
        f"{task}_time_second": f"{timeSec:.3f}",
        f"{task}_throughput_Mbps": f"{throughputMbps:.3f}"
    }

if __name__ == "__main__":

    if len(sys.argv) == 1: # Network Test
        results=Initial_Check()
        print(json.dumps(results))  # return the stdout to the caller, test_python.ts
        sys.exit(0)

    elif len(sys.argv) == 11: # Upload or Download Test
        _, direction, task, remote, source, target, bucket, folder, ID, chunk_size_mbtype, concurrency = sys.argv
        if direction == "upload":
            results = uploadTestPY(
                task, 
                remote, 
                source, bucket, folder, ID, target,
                chunk_size_mbtype, 
                concurrency
            )
        else:          # download
            results = downloadTestPY(
                task, 
                remote, 
                bucket, folder, ID, source, 
                target,
                chunk_size_mbtype, 
                concurrency
            )

        print(json.dumps(results)) # return the stdout to the caller, test_python.ts
        sys.exit(0)
    else: # Invalid arguments
        sys.exit(1)
    

'''
Local Test:

result = uploadTestPY(  
        'b2uw4_py_ul_10MB',
        'b2uw4', 
        '10MB',  
        'integration-testing', 'LAB', 'LOCAL', '10MB.b2uw4.python.file',     
        '10M','10' )
    print(result)

    
result = uploadTestPY(  
        'py_r2_ue1_50MB',
        'r2', 
        '50MB.file',  
        'transcripts', 'async', 'LOCAL', '50MB.file.py1',     
        '10M','10'  )
print(result)

result = downloadTestPY(  
        'py_r2_ue1_50MB',
        'r2',  
        'transcripts', 'async', 'LOCAL', '50MB.file.py1',     
        '50MB.file.py2', 
        '10M','10')
print(json.dumps(result))   
'''
    

'''
bucket = "transcripts"


local_file = "50MB.file"
key = "async/local/50MB.file.py1"

with open(local_file, "rb") as f:
    S3Client_R2.upload_fileobj(f, bucket, key)

download_key = "async/local/50MB.file.py1"
download_target = "50MB.file.py2"

with open(download_target, "wb") as f:
    S3Client_R2.download_fileobj(bucket, download_key, f)
'''
