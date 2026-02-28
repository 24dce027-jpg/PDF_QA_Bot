const axios = require('axios');

// Configuration constants
const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const ASK_RATE_LIMIT = 20;
const TEST_REQUEST_COUNT = ASK_RATE_LIMIT + 1; // Send one more than limit to trigger 429

/**
 * Tests the /ask endpoint rate limiter
 * Sends more requests than the limit allows and verifies rate limiting kicks in
 * @async
 * @returns {Promise<void>}
 */
async function testAskLimiter() {
    console.log(`Testing /ask rate limiter (Limit: ${ASK_RATE_LIMIT}/min)...`);

    const requests = [];
    // Send more requests than the limit allows
    for (let i = 1; i <= TEST_REQUEST_COUNT; i++) {
        requests.push(
            axios.post(`${API_BASE}/ask`, { question: 'test' })
                .then(res => ({ status: res.status, i: i, data: res.data }))
                .catch(err => ({ status: err.response ? err.response.status : err.code, i: i, data: err.response ? err.response.data : null }))
        );
    }

    const results = await Promise.all(requests);

    results.forEach(r => console.log(`Request ${r.i}: Status ${r.status}`));

    const successful = results.filter(r => r.status === 200).length;
    const rateLimited = results.filter(r => r.status === 429).length;

    console.log(`Summary: ${successful} successful (200), ${rateLimited} rate limited (429).`);

    if (rateLimited > 0) {
        console.log('✅ Rate limiting is working on /ask!');
        const sample429 = results.find(r => r.status === 429);
        console.log(`Sample 429 response index: ${sample429.i}`);
        // Log the error message if it's a 429
        console.log('429 Response Body:', results.find(r => r.status === 429).data);
    } else {
        console.log('❌ Rate limiting NOT working or limit too high for this test.');
    }
}

async function run() {
    try {
        await testAskLimiter();
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

run();
