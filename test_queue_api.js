const https = require('https');

const queueId = 3; // Example ID from seed data
const options = {
    hostname: 'policycentre2.vercel.app',
    port: 443,
    path: `/api/message-queues/${queueId}`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log(`Testing GET ${options.path}...`);

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
