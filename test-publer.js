const https = require('https');

const API_KEY = '4c4d4d8488bfe64a42ebfd22d85f8c3796a5b3e2090f8253';
const ENDPOINTS = [
    { url: 'https://app.publer.io/api/v1/workspaces', method: 'GET', header: `Bearer-API ${API_KEY}`, label: 'List Workspaces' },
];

function testEndpoint(idx) {
    if (idx >= ENDPOINTS.length) return;
    
    const config = ENDPOINTS[idx];
    console.log(`\nTesting ${config.label}...`);
    
    const req = https.request(config.url, {
        method: config.method,
        headers: {
            'Authorization': config.header,
            'Content-Type': 'application/json'
        }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log("SUCCESS! Data:", data);
                const workspaces = JSON.parse(data);
                if (workspaces.length > 0) {
                    console.log("Workspace ID:", workspaces[0].id);
                }
            } else {
                console.log("Error Body:", data.substring(0, 200)); // Show start of error
            }
            testEndpoint(idx + 1);
        });
    });
    
    req.on('error', (e) => {
        console.error(`Failed: ${e.message}`);
        testEndpoint(idx + 1);
    });
    
    req.end();
}

console.log("Starting Publer Connectivity Test...");
testEndpoint(0);
