var express = require('express');
var path = require('path');
var swig = require('swig');
var compression = require('compression')
var cdn = (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:8080/');

swig.setDefaults({
    locals: { cdn: cdn }
});
var app = express();

app.use(compression({filter: shouldCompress}))

app.engine('html', swig.renderFile);
app.set('view engine', 'html');

app.use('/static/img', express.static(path.join(__dirname, 'img')));
app.use('/static/css', express.static(path.join(__dirname, 'css')));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index.html', {
      cdn: cdn
  });
});

var server = app.listen(process.env.PORT || 3000, () => {
  console.log('Express server listening on port ' + server.address().port);
});

function shouldCompress(req, res) {
  return (req.headers['x-no-compression']) ? false : compression.filter(req, res)
}
