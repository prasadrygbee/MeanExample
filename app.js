var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
/*var routes          = require('./routes/index');
var users           = require('./routes/users');*/
var Db              = require('mongodb').Db;
var Server          = require('mongodb').Server;
var assert          = require('assert');

var db              = new Db('testdbprasad', new Server('localhost', 27017));

var app = express();

var http            = require('http').Server(app);
var io              = require('socket.io')(http);

http.listen(3001, function(){
  console.log('listening on *:3001');
});

io.on('connection', function(socket){
    io.emit('welcome message', "Hello");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use('/', routes);
app.use('/users', users);*/

app.get('/',function(req,res){
    res.render('index', { title: 'Ok' });
});

app.get('/users', function (req, res) {
    db.open(function(err, db) {
        db.collection('usercollection', function(err, collection) {
            collection.find().toArray(function(err, items) {
                res.json(items);
                db.close();
            });
        });
    });
});

app.get('/posts', function (req, res) {
    db.open(function(err, db) {
        db.collection('postcollection', function(err, collection) {
            collection.find().toArray(function(err, items) {
                res.json(items);
                db.close();
            });
        });
    });
});

app.post('/newpost', function (req, res) {
     db.open(function(err, db) {
        var postcollection  = db.collection('postcollection')
        var jsondata        = JSON.parse(req.body.mydata);
        postcollection.insert(jsondata);

        setTimeout( function(){
            postcollection.findOne(jsondata, function(err, item) {
                if(err == null && item.post == jsondata.post) {
                    io.emit('updateMessage', "newPost");
                    res.end("success")
                }
                db.close();
            });
        },100); 
    });
});

app.post('/updatepost', function (req, res) {
     db.open(function(err, db) {
        var postcollection  = db.collection('postcollection')
        var jsondata        = JSON.parse(req.body.mydata);

        var newObj = jsondata[0].newData;
        var oldObj = jsondata[1].oldData;

        postcollection.update(oldObj, {$set:newObj});

        setTimeout(function() {
            // Fetch the document that we modified
            postcollection.findOne(newObj, function(err, item) {
                if(err == null && item.upvotes == newObj.upvotes) {
                    io.emit('updateMessage', "updatePost");
                    res.end("success");
                }
                db.close();
            });
        }, 1000);
    });
});

app.post('/removepost', function (req, res) {
     db.open(function(err, db) {
        var postcollection  = db.collection('postcollection')
        var jsondata        = JSON.parse(req.body.mydata);
        postcollection.remove(jsondata,{w:1},function(err,numberOfRemovedDocs){
            if(err == null && numberOfRemovedDocs == 1) {
                io.emit('updateMessage', "removedPost");
                res.send("success");
                db.close();
            }
        });
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
