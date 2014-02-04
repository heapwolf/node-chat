
  var fs = require('fs'),
    path = require('path'),
    sio = require('socket.io'),
    static = require('node-static');

  var app = require('http').createServer(handler);
  app.listen(8000);

  var file = new static.Server(path.join(__dirname, '..', 'public'));

  function handler(req, res) {
    file.serve(req, res);
  }

  var io = sio.listen(app),
    nicknames = {};

  io.sockets.on('connection', function (socket) {

    socket.on('user message', function (msg) {
      socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('user image', function (msg) {
      console.log(msg);
      socket.broadcast.emit('user image', socket.nickname, msg);
    });

    socket.on('nickname', function (nick, fn) {
      if (nicknames[nick]) {

        fn(true);
      }
      else {

        fn(false);
        nicknames[nick] = socket.nickname = nick;
        socket.broadcast.emit('announcement', nick + ' connected');
        io.sockets.emit('nicknames', nicknames);
      }
    });

    socket.on('disconnect', function () {

      if (!socket.nickname) {

        return;
      }

      delete nicknames[socket.nickname];
      socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
      socket.broadcast.emit('nicknames', nicknames);
    });
  });
