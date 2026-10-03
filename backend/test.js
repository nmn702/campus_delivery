

const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
    console.log('Testing Campus Pickup API...');

    const reqUser = {
        headers: { 'Authorization': 'Bearer test_user_req_123' },
        method: 'GET'
    };

    const runUser = {
        headers: { 'Authorization': 'Bearer test_user_run_123' },
        method: 'GET'
    };

    const runUser2 = {
        headers: { 'Authorization': 'Bearer test_user_run_456' },
        method: 'GET'
    };

    try {
        // 1. Get/Create Users
        const r1 = await fetch(`${BASE_URL}/me`, reqUser);
        console.log('Requester /me:', r1.status);
        
        await fetch(`${BASE_URL}/me`, runUser);
        await fetch(`${BASE_URL}/me`, runUser2);

        // 2. Get Stores
        const s = await fetch(`${BASE_URL}/stores`, reqUser);
        const stores = await s.json();
        console.log('Stores:', stores.length);
        const store_id = stores[0].id;

        // 3. Runner creates session
        const sessRes = await fetch(`${BASE_URL}/runner/sessions`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer test_user_run_123', 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_id, latitude: 40.7, longitude: -74.0 })
        });
        const session = await sessRes.json();
        console.log('Runner Session:', session.id);

        // 4. Requester creates request
        const reqRes = await fetch(`${BASE_URL}/requests`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer test_user_req_123', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                store_id,
                items: "2 Milk, 1 Bread",
                estimated_amount: 150.00,
                pickup_location: "Dorm A",
                notes: "Please get skim milk"
            })
        });
        const request = await reqRes.json();
        console.log('Pickup Request:', request.id);

        // 5. Test Race Condition on ACCEPT
        // Both runners try to accept at the same time
        const reqId = request.id;
        const [accept1, accept2] = await Promise.all([
            fetch(`${BASE_URL}/requests/${reqId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer test_user_run_123' }
            }),
            fetch(`${BASE_URL}/requests/${reqId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer test_user_run_456' }
            })
        ]);

        console.log('Accept 1 status:', accept1.status); // Expect 200
        console.log('Accept 2 status:', accept2.status); // Expect 409

        console.log('Tests finished!');
    } catch (e) {
        console.error(e);
    }
}

runTests();
