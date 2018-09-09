const MAX_ALLOWED_PARTICLES = 100;

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

export default validatedClientMessage;
