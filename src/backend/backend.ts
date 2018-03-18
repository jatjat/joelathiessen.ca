import express from "express";
import path from "path";
import compression from "compression";
import expressSession from "express-session";
import sessionFileStore from "session-file-store";
import socketIoSession from "socket.io-express-session";
import WebSocket from "ws";
import IO from "socket.io";

const OUTGOING_FRACTION_DIGITS = 2; // limit length of number strings sent from kaly2 to client
const DEFAULT_WS_ADDR = "ws://localhost:9000/api/ws/robot";
const KALY_PING_INTERVAL_MS = 5000;
const DEFAULT_PORT = 3000;
const MAX_ALLOWED_PARTICLES = 100;

run();

function run() {
  const SessionStore = sessionFileStore(expressSession);

  const session = expressSession({
    store: new SessionStore({
      path: __dirname + "/tmp/sessions"
    }),
    secret: process.env.SES_SECRET || "devSecret",
    saveUninitialized: true,
    resave: true
  });

  const app = express();

  app.use(
    compression({
      filter: shouldCompress
    })
  );

  app.use("/img", express.static(path.join(__dirname, "../img")));
  app.use("/css", express.static(path.join(__dirname, "../css")));
  app.use("/public", express.static(path.join(__dirname, "../public")));
  app.use("/", express.static(path.join(__dirname, "../dist")));

  const server = app.listen(process.env.PORT || DEFAULT_PORT, () => {
    console.log("Express server listening on port " + server.address().port);
  });

  const io = IO(server);
  io.use(socketIoSession(session));
  io.on("connection", onClientConnection);
}

function shouldCompress(req: express.Request, res: express.Response): boolean {
  return req.headers["x-no-compression"] ? false : compression.filter(req, res);
}

function onClientConnection(clientSocket: SocketIO.Socket) {
  const kalyWS = new WebSocket(process.env.WS_ADDR || DEFAULT_WS_ADDR);
  kalyWS.on("open", () => onKalyWSOpen(kalyWS, clientSocket));
}

function onKalyWSOpen(kalyWS: WebSocket, clientSocket: SocketIO.Socket) {
  console.log("client connected");

  const kalyPingInterval = setInterval(() => {
    if (
      clientSocket.disconnected ||
      kalyWS.readyState === WebSocket.CLOSING ||
      kalyWS.readyState === WebSocket.CLOSED
    ) {
      clearInterval(kalyPingInterval);
    }
    kalyWS.ping();
  }, KALY_PING_INTERVAL_MS);

  kalyWS.on("message", (data: string) => {
    onKalyWSMessage(data, clientSocket);
  });

  clientSocket.on("message", (data: {}) => {
    onClientMessage(data, kalyWS);
  });

  clientSocket.on("disconnect", () => {
    kalyWS.close();
    console.log("client disconnected");
  });
}

function onKalyWSMessage(data: string, clientSocket: SocketIO.Socket) {
  const lessPrecise: any = JSON.stringify(JSON.parse(data), (key, value) => {
    if (typeof value == "number") {
      return parseFloat(value.toFixed(OUTGOING_FRACTION_DIGITS));
    }
    return value;
  });

  if (lessPrecise["msgType"] === "slamSettings") {
    console.log("sending slamSettings from kaly2 to client: " + lessPrecise);
  }
  clientSocket.emit("message", lessPrecise);
}

function onClientMessage(data: any, kalyWS: WebSocket) {
  console.log("server recieved from client: " + JSON.stringify(data));

  const validated = validatedClientMessage(data);
  if (validated.isValid) {
    const validDataStr = JSON.stringify(validated.data);
    console.log("server sending to kaly2: " + validDataStr);
    kalyWS.send(validDataStr);
  }
}

type ValidClientData = {
  msgType: String;
  sessionID?: number;
  msg: {};
};

function validatedClientMessage(
  data: any
): { isValid: Boolean; data?: ValidClientData } {
  var validData: ValidClientData;

  // Modify incoming data so that something valid is always sent
  // TODO: Validate using JSON schemas instead?
  if (data.msgType == "slamSettings") {
    validData = {
      msgType: "slamSettings",
      msg: {
        numParticles: Math.max(
          1,
          Math.min(MAX_ALLOWED_PARTICLES, data.msg.numParticles)
        ),
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
  return { isValid: validData != undefined, data: validData };
}
