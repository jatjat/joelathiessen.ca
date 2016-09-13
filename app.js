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

var cdn = (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:8080/');
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

var io = require('socket.io')(server);
io.use(socketIoSession(session));
io.on('connection', (socket) => {

  console.log('client connected');
  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
});


function shouldCompress(req, res) {
  return (req.headers['x-no-compression']) ? false : compression.filter(req, res)
}
