const https = require('https');

// Key from test-publer.js
const API_KEY = '4c4d4d8488bfe64a42ebfd22d85f8c3796a5b3e2090f8253';
const PUBLER_API_URL = 'https://app.publer.com/api/v1';

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
    if (type === 'telegram') return 'telegram';
    return type;
}

async function run() {
    console.log("Debugging Telegram 404 (Forced)...");

    // 1. Get Workspace
    const wsRes = await request('/workspaces', 'GET');
    const wsId = JSON.parse(wsRes.data)[0].id;

    // 2. Get Accounts
    const accRes = await request('/accounts', 'GET', null, wsId);
    const accounts = JSON.parse(accRes.data);

    // Fallback if no telegram
    const targetAccount = accounts[0];

    // FORCE TELEGRAM MAPPING regardless of actual account type
    const mappedType = 'telegram';
    console.log(`Target: ${targetAccount.name} (${targetAccount.type} -> ${mappedType} FORCED)`);

    // 3. Upload Media 
    const mediaRes = await request('/media/from-url', 'POST', { media: [{ url: "https://placehold.co/600x400.jpg" }] }, wsId);
    let mediaId = null;
    if (mediaRes.status === 200) {
        const jobId = JSON.parse(mediaRes.data).job_id;
        let attempts = 0;
        while (!mediaId && attempts < 10) {
            attempts++;
            const jobRes = await request(`/job_status/${jobId}`, 'GET', null, wsId);
            const job = JSON.parse(jobRes.data);
            if (job.status === 'complete' || job.status === 'completed') {
                mediaId = job.payload[0].id;
            }
            if (!mediaId) await new Promise(r => setTimeout(r, 1000));
        }
    }

    // 5. Create Post
    console.log("5. Creating Post (Immediate)...");
    const networks = {};
    networks[mappedType] = {
        text: "Debug Telegram 404 " + new Date().toISOString(),
        type: mediaId ? 'photo' : 'status'
    };

    if (mediaId) {
        networks[mappedType].media_ids = [mediaId];
    }

    const payload = {
        bulk: { state: "scheduled" },
        posts: [{
            accounts: [targetAccount.id],
            networks: networks,
            scheduled_at: new Date().toISOString()
        }]
    };

    const postRes = await request('/posts/schedule', 'POST', payload, wsId);
    console.log(`Post Status: ${postRes.status}`);
    console.log("Response:", postRes.data); // This should print the 404 HTML if it happens
}

run();
