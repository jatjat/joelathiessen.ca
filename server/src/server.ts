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
  `ws://${kaly2ServiceName}:9000/api/ws/robot`;
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
  mediateClientSocketWithKaly2(clientSocket, process.env.KALY2_SERVICE_NAME);
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
        shouldReset: data.msg.shouldReset == true,
        sessionID: Math.max(0, data.msg.sessionID)
      }
    };
  } else if (data.msgType == "robotSessionSubscribe") {
    validData = {
      msgType: "robotSessionSubscribe",
      msg: {
        sessionID: Math.max(0, data.msg.sessionID)
      }
    };

    if (data.msg.sessionID) {
      validData.sessionID = Math.max(0, data.msg.sessionID);
    }
  }
  return { isValid: validData != undefined, data: validData };
}

function mediateClientSocketWithKaly2(
  clientSocket: SocketIO.Socket,
  kaly2ServiceDNSName: string
) {
  var kaly2WS: WebSocket = null;

  init();

  function init() {
    const addr = getKaly2ServiceAddr(kaly2ServiceDNSName);
    connectToNewKaly2Address(addr);
  }

  function getKaly2ServiceAddr(serviceDNSName?: string): string {
    console.log("serviceDNSName", serviceDNSName);
    return !!serviceDNSName
      ? KALY2_SERVICE_WS_ADDR(serviceDNSName)
      : DEFAULT_WS_ADDR;
  }

  function connectToNewKaly2Address(
    address: string,
    successListener: Function = null
  ) {
    if (kaly2WS) {
      console.log("terminating because old kaly2WS already exists");
      kaly2WS.terminate();
    }
    kaly2WS = new WebSocket(address);
    kaly2WS.on("error", error => {
      const errorText = "Websocket error encountered in connection to kaly2";
      console.log(errorText + ": ", error);
      const errorMsg = {
        msgType: "connectionToKaly2Error",
        msg: {
          errorDescription: errorText
        }
      };
      clientSocket.emit("message", errorMsg);
    });
    kaly2WS.on("message", (data: string) => onKalyWSMessage(data));

    kaly2WS.on("open", () => {
      console.log("Client connected");
      clientSocket.on("message", (data: {}) => onClientMessage(data));
      clientSocket.on("disconnect", () => {
        kaly2WS.terminate();
        console.log("Client disconnected");
      });

      closeIfKalyWsTimeout();
      if (successListener) {
        successListener();
      }
    });
  }

  function onKalyWSMessage(data) {
    const lessPrecise = makeLessPrecise(data);
    if (data.msgType === "slamSettings") {
      console.log("Sending slamSettings from kaly2 to client: " + lessPrecise);
    } else if (
      data.msgType === "robotSessionSubscribe" &&
      data.msg.success === false &&
      data.msg.alternateServerAddress
    ) {
      console.log(
        "Subscribing to new kaly2 server becasue got subscription failure: ",
        lessPrecise
      );
      connectToNewKaly2Address(data.msg.alternateServerAddress, () => {
        const subscribeMsg = {
          msgType: "robotSessionSubscribe",
          msg: {
            sessionID: data.msg.sessionID
          }
        };
        console.log(
          "Sending robotSessionSubscribe to new kaly2 server: " + subscribeMsg
        );
        kaly2WS.emit("message", subscribeMsg);
      });
      return;
    }

    clientSocket.emit("message", lessPrecise);
  }

  function makeLessPrecise(data): string {
    return JSON.stringify(JSON.parse(data), (key, value) => {
      if (typeof value == "number") {
        return parseFloat(value.toFixed(OUTGOING_FRACTION_DIGITS));
      }
      return value;
    });
  }

  function onClientMessage(data: any) {
    console.log("Server recieved from client: " + JSON.stringify(data));
    if (kaly2WS.readyState === WebSocket.OPEN) {
      const validated = validatedClientMessage(data);
      if (validated.isValid) {
        const validDataStr = JSON.stringify(validated.data);
        console.log("Server sending to kaly2: " + validDataStr);
        kaly2WS.send(validDataStr, err => {
          if (err) {
            console.log("Error sending to kaly2: ", err);
          }
        });
      }
    } else {
      console.log("Not sending to kaly2; connection is not open");
    }
  }

  function closeIfKalyWsTimeout() {
    var isAlive = true;
    const kalyPingInterval = setInterval(() => {
      if (
        kaly2WS.readyState === WebSocket.CLOSING ||
        kaly2WS.readyState === WebSocket.CLOSED
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
        return kaly2WS.terminate();
      } else {
        isAlive = false;
        kaly2WS.ping(() => null);
      }
    }, KALY_PING_INTERVAL_MS);

    kaly2WS.on("pong", () => {
      isAlive = true;
    });
  }
}
