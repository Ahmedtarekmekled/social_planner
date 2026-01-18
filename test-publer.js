const https = require('https');

const API_KEY = '4c4d4d8488bfe64a42ebfd22d85f8c3796a5b3e2090f8253';

function makeRequest(url, method, headers, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method, headers }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ status: res.statusCode, data: data }));
        });
        if (body) req.write(body);
        req.end();
    });
}

async function runTests() {
    try {
        console.log("1. Fetching Workspaces...");
        const wsRes = await makeRequest(
            'https://app.publer.io/api/v1/workspaces', 
            'GET', 
            { 'Authorization': `Bearer-API ${API_KEY}`, 'Content-Type': 'application/json' }
        );
        console.log("Workspaces Status:", wsRes.status);
        if (wsRes.status !== 200) throw new Error("Failed to fetch workspaces");
        
        const workspaces = JSON.parse(wsRes.data);
        const wsId = workspaces[0].id;
        console.log("Workspace ID:", wsId);
        
        console.log("\n2. Testing POST /posts...");
        const postRes = await makeRequest(
            'https://app.publer.io/api/v1/posts',
            'POST',
            { 
                'Authorization': `Bearer-API ${API_KEY}`, 
                'Content-Type': 'application/json',
                'Publer-Workspace-Id': wsId
            },
            JSON.stringify({
                text: "Test Post from API Integration Probe",
                account_ids: [] // Intentionally empty to see if we get a validation error (400) or 404
            })
        );
        console.log("POST Status:", postRes.status);
        console.log("POST Body:", postRes.data.substring(0, 300));

    } catch (e) {
        console.error("Error:", e);
    }
}

runTests();
