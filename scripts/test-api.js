
const fetch = require('node-fetch');

async function testApi() {
    const validId = '6936c98be004c3f179f776fa'; // Valid ID from DB
    const invalidId = 'invalid-id';

    console.log('--- Testing with Valid ID ---');
    try {
        const res = await fetch('http://localhost:3000/api/sec/support/my-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secId: validId })
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error with valid ID:', e);
    }

    console.log('\n--- Testing with Invalid ID ---');
    try {
        const res = await fetch('http://localhost:3000/api/sec/support/my-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secId: invalidId })
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error with invalid ID:', e);
    }

    console.log('\n--- Testing with Missing ID ---');
    try {
        const res = await fetch('http://localhost:3000/api/sec/support/my-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error with missing ID:', e);
    }
}

testApi();
