import express from "express";
import path from "path";
import swig from "swig";
import compression from "compression";
import expressSession from "express-session";
import sessionFileStore from "session-file-store";
import socketIoSession from "socket.io-express-session";
import WebSocket from "ws";
import IO from "socket.io";

const NUM_PLACES = 2;
const DEFAULT_WS_ADDR = "ws://localhost:9000/api/ws/robot";
const LOCALHOST_ADDR = "http://localhost:8080/";
const KALY_PING_INTERVAL_MS = 5000;

const SessionStore = sessionFileStore(expressSession);

const session = expressSession({
  store: new SessionStore({
    path: __dirname + "/tmp/sessions"
  }),
  secret: process.env.SES_SECRET || "devSecret",
  saveUninitialized: true,
  resave: true
});

const cdn = process.env.NODE_ENV === "production" ? "/" : LOCALHOST_ADDR;
swig.setDefaults({
  locals: {
    cdn: cdn
  }
});
const app = express();

app.use(
  compression({
    filter: shouldCompress
  })
);

app.engine("html", swig.renderFile);
app.set("view engine", "html");

app.use("/img", express.static(path.join(__dirname, "../img")));
app.use("/css", express.static(path.join(__dirname, "../css")));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/", express.static(path.join(__dirname, "../dist")));

app.get("/", (req, res) => {
  res.render("../src/index.html", {
    cdn: cdn
  });
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Express server listening on port " + server.address().port);
});

const io = IO(server);
io.use(socketIoSession(session));
io.on("connection", socket => {
  var kalyClientAccessable = true;

  // for now, always get an unspecified robot:
  const kalyClient = new WebSocket(process.env.WS_ADDR || DEFAULT_WS_ADDR);
  kalyClient.on("open", function open() {
    kalyClient.on("message", (data: any, flags: any) => {
      const lessPrecise: any = JSON.stringify(
        JSON.parse(data),
        (key, value) => {
          if (typeof value == "number") {
            return parseFloat(value.toFixed(NUM_PLACES));
          }
          return value;
        }
      );

      if (lessPrecise["msgType"] === "slamSettings") {
        console.log(
          "sending slamSettings from kaly2 to client: " + lessPrecise
        );
      }
      socket.emit("message", lessPrecise);
    });

    socket.on("message", (data, flags) => {
      console.log("server recieved from client: " + JSON.stringify(data));
      var validData: {
        msgType: String;
        sessionID?: number;
        msg: {};
      } = null;

      // Modify incoming data so that something valid is always sent
      // TODO: Validate using JSON schemas instead?
      if (data.msgType == "slamSettings") {
        validData = {
          msgType: "slamSettings",
          msg: {
            numParticles: Math.max(1, Math.min(100, data.msg.numParticles)),
            sensorDistconst: Math.max(0, data.msg.sensorDistconst),
            sensorAngconst: Math.max(0, data.msg.sensorAngconst)
          }
        };
        if (data.msg.sessionID) {
          validData.sessionID = Math.max(0, data.msg.sessionID);
        }
      } else if (data.msgType == "robotSessionSettings") {
        validData = {
          msgType: "robotSessionSettings",
          msg: {
            shouldRun: data.msg.shouldRun == true,
            shouldReset: data.msg.shouldReset == true
          }
        };
        if (data.msg.sessionID) {
          validData.sessionID = Math.max(0, data.msg.sessionID);
        }
      }

      if (validData != null) {
        console.log("server sending to kaly2: " + JSON.stringify(validData));
        kalyClient.send(JSON.stringify(validData));
      }
    });

    // ensure that websocket connection to kaly2 does not time out
    const kalyPingInterval = setInterval(() => {
      if (kalyClientAccessable === true) {
        kalyClient.ping();
      } else {
        clearInterval(kalyPingInterval);
      }
    }, KALY_PING_INTERVAL_MS);

    console.log("client connected");
    socket.on("disconnect", () => {
      kalyClientAccessable = false;
      kalyClient.close();
      console.log("client disconnected");
    });
  });
});

function shouldCompress(req: any, res: any) {
  return req.headers["x-no-compression"] ? false : compression.filter(req, res);
}
