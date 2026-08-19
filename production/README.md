# Production Worker

This will hold the cloud rendering/asset-processing worker code.

Design rule: no workflow may assume the creator computer is available.

Input: a production manifest (JSON).
Output: a render manifest containing storage keys, duration, checksums and QC metadata.
