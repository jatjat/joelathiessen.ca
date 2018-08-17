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
const KALY2_SERVICE_WS_ADDR = kaly2ServiceName =>
  `ws://${kaly2ServiceName}/api/ws/robot`;
const KALY_PING_INTERVAL_MS = 15000;
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

  console.log(__dirname);
  app.use("/img", express.static(path.join(__dirname, "../img/")));
  app.use("/css", express.static(path.join(__dirname, "../css/")));
  app.use("/public", express.static(path.join(__dirname, "../public/")));
  app.use("/", express.static(path.join(__dirname, "../dist/")));

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
  const kalyWS = new WebSocket(
    getKaly2ServiceAddr(process.env.KALY2_SERVICE_NAME) ||
      process.env.WS_ADDR ||
      DEFAULT_WS_ADDR
  );
  kalyWS.on("open", () => onKalyWSOpen(kalyWS, clientSocket));
}

function getKaly2ServiceAddr(serviceDNSName: string): string {
  return !!serviceDNSName ? KALY2_SERVICE_WS_ADDR(serviceDNSName) : null;
}

function onKalyWSOpen(kalyWS: WebSocket, clientSocket: SocketIO.Socket) {
  console.log("Client connected");
  kalyWS.on("error", error =>
    console.log("Websocket Error encountered in connection to kaly2: ", error)
  );

  closeIfKalyWsTimeout(kalyWS, clientSocket);

  kalyWS.on("message", (data: string) => onKalyWSMessage(data, clientSocket));

  clientSocket.on("message", (data: {}) => onClientMessage(data, kalyWS));

  clientSocket.on("disconnect", () => {
    kalyWS.terminate();
    console.log("Client disconnected");
  });
}

function closeIfKalyWsTimeout(kalyWS, clientSocket) {
  var isAlive = true;
  const kalyPingInterval = setInterval(() => {
    if (
      kalyWS.readyState === WebSocket.CLOSING ||
      kalyWS.readyState === WebSocket.CLOSED
    ) {
      console.log(
        "Websocket connection to kaly2 is closing or closed; terminating client connection"
      );
      clearInterval(kalyPingInterval);
      return clientSocket.disconnect();
    } else if (isAlive === false) {
      console.log(
        "Websocket timeout encountered in connection to kaly2; terminating it, and client connection"
      );
      clearInterval(kalyPingInterval);
      clientSocket.disconnect();
      return kalyWS.terminate();
    } else {
      isAlive = false;
      kalyWS.ping(() => null);
    }
  }, KALY_PING_INTERVAL_MS);

  kalyWS.on("pong", () => {
    isAlive = true;
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
    console.log("Sending slamSettings from kaly2 to client: " + lessPrecise);
  }
  clientSocket.emit("message", lessPrecise);
}

function onClientMessage(data: any, kalyWS: WebSocket) {
  console.log("Server recieved from client: " + JSON.stringify(data));
  if (kalyWS.readyState === WebSocket.OPEN) {
    const validated = validatedClientMessage(data);
    if (validated.isValid) {
      const validDataStr = JSON.stringify(validated.data);
      console.log("Server sending to kaly2: " + validDataStr);
      kalyWS.send(validDataStr, err => {
        if (err) {
          console.log("Error sending to kaly2: ", err);
        }
      });
    }
  } else {
    console.log("Not sending to kaly2; connection is not open");
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
        sensorDistVar: Math.max(0, data.msg.sensorDistVar),
        sensorAngVar: Math.max(0, data.msg.sensorAngVar)
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
