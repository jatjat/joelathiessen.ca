// End-to-end test: talk to the website like a browser would (socket.io v2 over a
// raw WebSocket), start a robot session, and pass once kaly2's SLAM data arrives.
// Like the browser, it sends "start" only once, after kaly2 says the connection is open.
// The base can include a path prefix, e.g. wss://example.com/share/website/my-branch
const base = process.argv[2] || "ws://localhost:3000";
const headers = {};
if (process.env.SITE_KEY) headers["x-site-key"] = process.env.SITE_KEY;
if (process.env.COOKIE) headers["cookie"] = process.env.COOKIE;
const ws = new WebSocket(`${base}/socket.io/?EIO=3&transport=websocket`, { headers });
const start = { msgType: "robotSessionSettings", msg: { shouldRun: true, shouldReset: false } };

const fail = setTimeout(() => { console.log("FAIL: no slamInfo within 60s"); process.exit(1); }, 60000);
const seen = new Set();

ws.onmessage = (e) => {
  const d = String(e.data);
  if (d.startsWith("0")) setInterval(() => ws.send("2"), 20000); // engine.io ping
  if (!d.startsWith("42")) return;
  const msg = JSON.parse(JSON.parse(d.slice(2))[1]);
  if (!seen.has(msg.msgType)) { seen.add(msg.msgType); console.log("received", msg.msgType); }
  if (msg.msgType === "connectionOpen") ws.send("42" + JSON.stringify(["message", start]));
  if (msg.msgType === "slamInfo") {
    console.log("PASS: slamInfo arrived,", JSON.stringify(msg).length, "bytes");
    clearTimeout(fail);
    process.exit(0);
  }
};
ws.onerror = (e) => console.log("websocket error:", e.message);
ws.onclose = () => console.log("websocket closed");
