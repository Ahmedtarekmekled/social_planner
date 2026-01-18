
const https = require('https');

const API_KEY = '4c4d4d8488bfe64a42ebfd22d85f8c3796a5b3e2090f8253';
const PUBLER_API_URL = 'https://api.publer.io/v1';

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

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testUrl(url, label) {
    console.log(`\n--- Testing ${label} ---`);
    console.log(`URL: '${url}'`);

    try {
        // 1. Get Workspace
        const wsRes = await request('/workspaces', 'GET');
        if (wsRes.status !== 200) throw new Error("WS Fetch Failed");
        const wsId = JSON.parse(wsRes.data)[0].id;
        // console.log("WS ID:", wsId);

        // 2. Upload Media
        const mediaRes = await request('/media/from-url', 'POST', { media: [{ url }] }, wsId);
        // console.log("Upload Status:", mediaRes.status);
        const mediaData = JSON.parse(mediaRes.data);

        if (!mediaData.job_id) {
            console.log("No Job ID returned:", mediaRes.data);
            return;
        }

        const jobId = mediaData.job_id;
        console.log("Job ID:", jobId);

        // 3. Poll
        let attempts = 0;
        while (attempts < 20) {
            attempts++;
            const jobRes = await request(`/job_status/${jobId}`, 'GET', null, wsId);
            const job = JSON.parse(jobRes.data);

            if (job.status === 'complete' || job.status === 'completed' || job.status === 'failed') {
                console.log("Final Status:", job.status);
                console.log("Payload:", JSON.stringify(job.payload));
                if (job.error) console.log("Error:", JSON.stringify(job.error));
                return;
            }
            process.stdout.write(".");
            await new Promise(r => setTimeout(r, 1000));
        }
        console.log("\nTimed out");

    } catch (e) {
        console.error("Crash:", e);
    }
}

async function run() {
    // Test 1: Known working Image
    await testUrl("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png", "Google Logo");

    // Test 2: Placehold.co (which user might be using)
    await testUrl("https://placehold.co/600x400.jpg", "Placehold.co");

    // Test 3: Malformed similar to error
    // await testUrl("https://example.com:https", "Bad Port");
}

run();
