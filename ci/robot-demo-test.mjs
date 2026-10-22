// End-to-end test: talk to the website like the browser does (socket.io v2 over a raw
// WebSocket), start a robot, change its SLAM settings and check it keeps running.
// The base can include a path prefix, e.g. wss://example.com/share/website/my-branch
const base = process.argv[2] || "ws://localhost:3000";
const headers = {};
if (process.env.SITE_KEY) headers["x-site-key"] = process.env.SITE_KEY;
if (process.env.COOKIE) headers["cookie"] = process.env.COOKIE;
const ws = new WebSocket(`${base}/socket.io/?EIO=3&transport=websocket`, { headers });
const send = (m) => ws.send("42" + JSON.stringify(["message", m]));

let failed = false;
const check = (ok, what) => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${what}`);
  if (!ok) failed = true;
};
setTimeout(() => {
  check(false, "the test finished within 60 s");
  process.exit(1);
}, 60000);

let sessionID = null;
let slamInfos = 0;
let truePose = null;
let oldWayTimer = null;

ws.onmessage = async (e) => {
  const d = String(e.data);
  if (d.startsWith("0")) setInterval(() => ws.send("2"), 20000); // engine.io ping
  if (d === "40") {
    // The page waits for kaly2 to say its connection is open before starting a robot.
    // Without that message, start one the way the older page did, so the settings
    // check below still runs
    oldWayTimer = setTimeout(() => {
      check(false, "kaly2 says the connection is open (the page waits for this to start)");
      const start = () => send({ msgType: "robotSessionSettings", msg: { shouldRun: true, shouldReset: false } });
      start();
      oldWayTimer = setInterval(() => slamInfos === 0 && start(), 2000);
    }, 10000);
  }
  if (!d.startsWith("42")) return;
  const raw = JSON.parse(d.slice(2))[1];
  const msg = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (msg.msgType === "connectionOpen") {
    clearTimeout(oldWayTimer);
    check(true, "kaly2 says the connection is open");
    // The page has no session ID yet, so it sends none, which asks kaly2 for a new robot
    send({ msgType: "robotSessionSubscribe", msg: {} });
  } else if (msg.msgType === "robotSessionSubscribe" && msg.msg.success) {
    sessionID = msg.msg.sessionID;
    // Like the page, whose first start still has no session ID (it reads it before setState applies)
    send({ msgType: "robotSessionSettings", msg: { shouldRun: true, shouldReset: false } });
  } else if (msg.msgType === "slamInfo" && (truePose = msg.msg.truePose) && ++slamInfos === 1) {
    check(true, "the robot starts and its SLAM data arrives");
    const firstAt = Date.now();
    const start = truePose;
    setTimeout(() => {
      // The demo should move smoothly, not crawl at a step every few seconds or stand still
      const perSecond = (slamInfos - 1) / ((Date.now() - firstAt) / 1000);
      check(perSecond >= 2, `the robot takes at least 2 steps a second (${perSecond.toFixed(1)} a second)`);
      const moved = Math.hypot(truePose.x - start.x, truePose.y - start.y);
      check(moved >= 10, `the robot travels at least 10 units in 5 s (${moved.toFixed(1)})`);
    }, 5000);
    // What the page sends when Apply is pressed with the form's defaults, after measuring speed
    await new Promise((r) => setTimeout(r, 5100));
    const settings = { numParticles: 20, sensorDistVar: 0.5, sensorAngVar: 0.01 };
    if (sessionID !== null) settings.sessionID = sessionID;
    send({ msgType: "slamSettings", msg: settings });
    // Allow up to 20 s for the next step
    const before = slamInfos;
    const appliedAt = Date.now();
    const waitForNext = setInterval(() => {
      const waited = (Date.now() - appliedAt) / 1000;
      if (slamInfos > before || waited > 20) {
        clearInterval(waitForNext);
        check(slamInfos > before, `the robot keeps running after its SLAM settings change (next step after ${waited.toFixed(1)} s)`);
        process.exit(failed ? 1 : 0);
      }
    }, 100);
  }
};
ws.onerror = (e) => console.log("websocket error:", e.message);
ws.onclose = () => console.log("websocket closed");
