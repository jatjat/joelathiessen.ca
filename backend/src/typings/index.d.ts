declare module "socket.io-express-session" {
  import express from "express";

  function socketIoSession(
    session: express.RequestHandler
  ): (socket: SocketIO.Socket, fn: (err?: any) => void) => void;

  export = socketIoSession;
}
