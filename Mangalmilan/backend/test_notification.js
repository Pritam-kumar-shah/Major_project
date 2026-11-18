import fetch from 'node-fetch';

async function trigger() {
    const response = await fetch('http://localhost:5000/api/notification/test-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            role: 'user',
            title: 'Testing Backend Trigger',
            body: 'If you see this, the full notification pipeline is working!'
        })
    });
    const data = await response.json();
    console.log(data);
}

trigger();
