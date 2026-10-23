// Checks the website server copes when kaly2 can't be reached. CI starts the website
// image on port 3102 with a kaly2 address that has nothing listening.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = "127.0.0.1:3102";

for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://${base}/`)).ok) break;
  } catch {}
  await sleep(500);
}

// A browser connects, so the website tries to reach kaly2 and fails
const ws = new WebSocket(`ws://${base}/socket.io/?EIO=3&transport=websocket`);
ws.onerror = () => {};
await sleep(3000);

let stillUp = false;
try {
  stillUp = (await fetch(`http://${base}/`)).ok;
} catch {}
console.log(`${stillUp ? "PASS" : "FAIL"}: the website keeps serving pages after it fails to reach kaly2`);
process.exit(stillUp ? 0 : 1);
