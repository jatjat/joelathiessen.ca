const NUM_PLACES = 2;
var DEFAULT_WS_ADDR = 'ws://localhost:9000/api/ws/robot';
var LOCALHOST_ADDR = 'http://localhost:8080/';

var express = require('express');
var path = require('path');
var swig = require('swig');
var compression = require('compression');
var expressSession = require('express-session');
var sessionStore = require('session-file-store')(expressSession);
var session = expressSession({
  store: sessionStore({
    path: __dirname + '/tmp/sessions'
  }),
  secret: (process.env.SES_SECRET || "devSecret"),
  saveUninitialized: true,
  resave: true
});
var socketIoSession = require('socket.io-express-session');
var WebSocket = require('ws');
var IO = require('socket.io')

var cdn = (process.env.NODE_ENV === 'production' ? '/' : LOCALHOST_ADDR);
swig.setDefaults({
  locals: {
    cdn: cdn
  }
});

var app = express();

app.use(compression({
  filter: shouldCompress
}))

app.engine('html', swig.renderFile);
app.set('view engine', 'html');

app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index.html', {
    cdn: cdn
  });
});

var server = app.listen(process.env.PORT || 3000, () => {
  console.log('Express server listening on port ' + server.address().port);
});

var io = IO(server);
io.use(socketIoSession(session));
io.on('connection', (socket) => {
  var ses = socket.handshake.session;

  // for now, always get an unspecified robot:
  ses.kalyClient = new WebSocket(process.env.WS_ADDR || DEFAULT_WS_ADDR);
  ses.kalyClient.on('open', function open() {

    ses.kalyClient.on('message', (data, flags) => {
      var lessPrecise = JSON.stringify(JSON.parse(data), (key, value) => {
        if (typeof value == "number") {
          return parseFloat(value.toFixed(NUM_PLACES))
        }
        return value;
      });

      if (lessPrecise["msgType"] === "slamSettings") {
        console.log('sending slamSettings from kaly2 to client: ' + lessPrecise)
      }
      socket.emit('message', lessPrecise);
    });

    socket.on('message', (data, flags) => {
      console.log('server recieved from client: ' + JSON.stringify(data));
      var validData = null;

      // Modify incoming data so that something valid is always sent
      // TODO: Validate using JSON schemas instead? 
      if (data.msgType == "slamSettings") {
        validData = {
          "msgType": "slamSettings",
          "msg": {
            numParticles: Math.max(1, Math.min(100, data.msg.numParticles)),
            sensorDistVar: Math.max(0, data.msg.sensorDistVar),
            sensorAngVar: Math.max(0, data.msg.sensorAngVar),
          }
        }
        if (data.msg.sessionID) {
          validData.sessionID = Math.max(0, data.msg.sessionID)
        }
      } else if (data.msgType == "robotSessionSettings") {
        validData = {
          "msgType": "robotSessionSettings",
          "msg": {
            shouldRun: data.msg.shouldRun == true,
            shouldReset: data.msg.shouldReset == true
          }
        }
        if (data.msg.sessionID) {
          validData.sessionID = Math.max(0, data.msg.sessionID)
        }
      }

      if (validData != null) {
        console.log('server sending to kaly2: ' + JSON.stringify(validData))
        ses.kalyClient.send(JSON.stringify(validData));
      }
    });


    console.log('client connected');
    socket.on('disconnect', () => {
      ses.kalyClient.close();
      console.log('client disconnected');
    });
  });
});


function shouldCompress(req, res) {
  return (req.headers['x-no-compression']) ? false : compression.filter(req, res)
}
