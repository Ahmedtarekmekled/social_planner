// require('dotenv').config({ path: '.env.example' });
// const { PublerService } = require('./src/lib/publer');

// Mock fetch for Node environment as Next.js polyfills are not available here
// Or better, just use the browser tool? The user has no browser open.
// I'll assume Node 18+ which has global fetch, or I might need to mock it if using older node.
// Given previous scripts used 'https', I should probably stick to that or assume 'fetch' is available if Node version is high enough.
// The user environment is Windows, Node version not specified but 'next: 16.1.1' implies Node 18+.
// However, `src/lib/publer.ts` is TS. I can't run it directly with `node`.

// Instead, I'll create a new test file `verify-publer-fix.js` that basically does what `publer.ts` does but in JS, OR I try to use `ts-node` if available?
// `ts-node` is not in package.json.
// I will just use the `debug-publer-transaction.js` logic I verified earlier, but adapted to match the FINAL logic I implemented in `publer.ts`, to ensure my logic is sound.
// Actually, I should probably rely on the manual verification step since running TS directly is tricky without setup.

// But I can write a small JS script that IMPORTS the same logic structure to verify it works one last time with the exact same steps.

const https = require('https');
const API_KEY = '4c4d4d8488bfe64a42ebfd22d85f8c3796a5b3e2090f8253';
const PUBLER_API_URL = 'https://app.publer.io/api/v1';

// Re-implementing the helper for verification script
async function request(endpoint, method, body, wsId) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer-API ${API_KEY}`,
                'Content-Type': 'application/json',
                ...(wsId ? { 'Publer-Workspace-Id': wsId } : {})
            }
        };

        const req = https.request(`${PUBLER_API_URL}${endpoint}`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function mapType(type) {
    if (type.startsWith('ig_')) return 'instagram';
    if (type.startsWith('fb_')) return 'facebook';
    return type;
}

async function run() {
    console.log("Verifying Fix Logic...");

    // 1. Get Workspace
    const wsRes = await request('/workspaces', 'GET');
    const wsId = JSON.parse(wsRes.data)[0].id;

    // 2. Get Account (to simulate passed IDs)
    const accRes = await request('/accounts', 'GET', null, wsId);
    const accounts = JSON.parse(accRes.data);
    const targetAccount = accounts[0];
    const mappedType = mapType(targetAccount.type);

    console.log(`Target: ${targetAccount.name} (${targetAccount.type} -> ${mappedType})`);

    // 3. Upload Media
    console.log("Uploading Media...");
    const mediaRes = await request('/media/from-url', 'POST', { media: [{ url: "https://placehold.co/600x400.jpg" }] }, wsId);
    const jobId = JSON.parse(mediaRes.data).job_id;
    console.log("Job ID:", jobId);

    // 4. Poll
    let mediaId = null;
    while (!mediaId) {
        console.log("Polling...");
        const jobRes = await request(`/job_status/${jobId}`, 'GET', null, wsId);
        // console.log("Raw Job Response:", jobRes.data); // Debug logging
        try {
            const job = JSON.parse(jobRes.data);
            if (job.status === 'complete' || job.status === 'completed') {
                mediaId = job.payload[0].id;
                console.log("Media ID:", mediaId);
            } else if (job.status === 'failed') {
                console.error("Job Failed");
                return;
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.log("Raw Response was:", jobRes.data);
            // If it returns HTML, it might be 404 or 500 from Publer not handled? 
            // Or rate limit?
            return;
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    // 5. Create Post
    console.log("Creating Post...");
    const networks = {};
    networks[mappedType] = {
        text: "Verified Fix " + new Date().toISOString(),
        media_ids: [mediaId]
    };

    const payload = {
        bulk: { state: "draft" },
        posts: [{
            accounts: [targetAccount.id],
            networks: networks
        }]
    };

    const postRes = await request('/posts/schedule', 'POST', payload, wsId);
    console.log("Post Status:", postRes.status);
    console.log("Response:", postRes.data);
}

run();
