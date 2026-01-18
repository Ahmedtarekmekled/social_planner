const https = require('https');

// Key from test-publer.js
const API_KEY = '4c4d4d8488bfe64a42ebfd22d85f8c3796a5b3e2090f8253';
const PUBLER_API_URL = 'https://app.publer.io/api/v1';

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

function mapType(type) {
    if (type.startsWith('ig_')) return 'instagram';
    if (type.startsWith('fb_')) return 'facebook';
    return type;
}

async function run() {
    try {
        console.log("1. Get Workspaces...");
        const wsRes = await request('/workspaces', 'GET');

        const workspaces = JSON.parse(wsRes.data);
        const wsId = workspaces[0].id;

        console.log("2. Get Accounts...");
        const accRes = await request('/accounts', 'GET', null, wsId);
        const accounts = JSON.parse(accRes.data);
        if (!accounts || accounts.length === 0) {
            console.log("No accounts found!");
            return;
        }
        const account = accounts[0];
        console.log("Account:", account.name, "Type:", account.type);

        console.log("3. Uploading Media...");
        const mediaPayload = {
            media: [
                { url: "https://placehold.co/600x400.jpg" }
            ]
        };

        const mediaRes = await request('/media/from-url', 'POST', mediaPayload, wsId);
        console.log("Media Status:", mediaRes.status);

        const mediaData = JSON.parse(mediaRes.data);
        const jobId = mediaData.job_id;
        console.log("Job ID:", jobId);

        if (!jobId) {
            console.log("No Job ID returned.");
            return;
        }

        // Poll for job completion
        let mediaId = null;
        let attempts = 0;
        while (attempts < 10) {
            attempts++;
            console.log(`Polling job (Attempt ${attempts})...`);
            const jobRes = await request(`/jobs/${jobId}`, 'GET', null, wsId);

            if (jobRes.status === 200) {
                const jobData = JSON.parse(jobRes.data);
                console.log("Job Status:", jobData.status);

                if (jobData.status === 'complete' || jobData.status === 'completed') {
                    console.log("Job Payload:", JSON.stringify(jobData.payload));
                    if (jobData.payload && jobData.payload.length > 0) {
                        mediaId = jobData.payload[0].id;
                    }
                    break;
                } else if (jobData.status === 'failed') {
                    console.log("Job Failed:", jobData.error);
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log("Final Media ID:", mediaId);

        if (!mediaId) {
            console.log("Could not get media ID, stopping.");
            return;
        }

        console.log("4. Create Post (With Media ID)...");

        const text = "Debug Post Test " + new Date().toISOString();
        const networks = {};
        const platform = mapType(account.type);

        // Use media_ids instead of media_urls
        networks[platform] = {
            text: text,
            media_ids: [mediaId]
        };

        const scheduled_at = new Date(Date.now() + 3600000).toISOString();

        const post = {
            accounts: [account.id],
            networks: networks,
            scheduled_at: scheduled_at
        };

        const requestBody = {
            bulk: {
                state: "scheduled"
            },
            posts: [post]
        };

        console.log("Sending Payload...", JSON.stringify(requestBody, null, 2));

        const postRes = await request('/posts/schedule', 'POST', requestBody, wsId);
        console.log("Post Status:", postRes.status);
        console.log("Post Response:", postRes.data);

    } catch (e) {
        console.error("Crash:", e);
    }
}

run();
