import WebSocket from "ws";

import validatedClientMessage from "./validator";

const POST_DECIMAL_DIGITS = 2; // limit length of number strings sent from kaly2 to client
const DEFAULT_WS_ADDR = "ws://localhost:9000/api/ws/robot";
const KALY2_SERVICE_WS_ADDR = kaly2ServiceName =>
  `ws://${kaly2ServiceName}:9000/api/ws/robot`;
const KALY_PING_INTERVAL_MS = 15000;

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
    const serviceAddr = !!serviceDNSName
      ? KALY2_SERVICE_WS_ADDR(serviceDNSName)
      : DEFAULT_WS_ADDR;
    console.log("Using kaly2 server address: ", serviceAddr);
    return serviceAddr;
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

    //console.log("Server sending from kaly2 to client: ", lessPrecise);
    clientSocket.emit("message", lessPrecise);
  }

  function makeLessPrecise(data): string {
    return JSON.stringify(JSON.parse(data), (key, value) => {
      if (typeof value == "number") {
        return parseFloat(value.toFixed(POST_DECIMAL_DIGITS));
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

export default mediateClientSocketWithKaly2;
