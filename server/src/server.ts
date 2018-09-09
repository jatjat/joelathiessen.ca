import express from "express";
import path from "path";
import compression from "compression";
import expressSession from "express-session";
import sessionFileStore from "session-file-store";
import socketIoSession from "socket.io-express-session";
import IO from "socket.io";

import mediateClientSocketWithKaly2 from "./mediator";

const DEFAULT_PORT = 3000;

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
