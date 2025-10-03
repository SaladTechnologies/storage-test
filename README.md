# storage-test-2025

This repository contains code for running cloud-based storage tests on SaladCloud, gathering key metrics such as throughput and latency, etc.

For the final test results, see the [Cloud Storage Benchmarking on SaladCloud](https://docs.salad.com/container-engine/tutorials/performance/high-performance-storage-solutions#cloud-storage-benchmarking-on-saladcloud).

### Image and Code

The [image](https://github.com/SaladTechnologies/storage-test/blob/main/Dockerfile) includes rclone, Python with boto3, JavaScript/TypeScript with client-s3 and lib-storage pre-installed, ready for interacting with S3-compatible storage. 

On startup, [the main progress](https://github.com/SaladTechnologies/storage-test/blob/main/src/main.ts) will conduct 48 data transfer tests measuring time and throughput: 2 directions × 3 tools × 8 buckets. 

- Data Size per Test: 300 MB, random data ( chosen to balance accuracy and efficiency, not MiB )

- Buckets: 8 buckets distributed across US West (1), US East (3), and EU Central (4), provided by AWS S3 (2), Cloudflare R2 (2), Backblaze B2 (3), and UltiHash (1)

- Tools: Rclone (1.69.2), Python with Boto3 (1.38.28), JavaScript/TypeScript with client-s3 and lib-storage (3.821.0)

- Algorithm: chunked and parallel upload/download using a concurrency level of 10 and a chunk size of 10 MB

- Total Upload Volume: 7,200 MB (300 MB × 3 tools × 8 buckets)

- Total Download Volume: 7,200 MB (same as upload)


### Deployment on SaladCloud

Nodes: 200+ Salad consumer GPU nodes 
Node Selection Criteria: using Python Speedtest and ping
- Upload speed ≥ 20 Mbps, Download speed ≥ 50 Mbps
- RTT to US West, US East, and EU regions < 500 ms