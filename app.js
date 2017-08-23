const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const User = require('./models/user');

// Connect To Database
mongoose.connect(config.database);

// On Connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + config.database);
});

// On Error
mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});

const app = express();
// CORS Middleware
app.use(cors());
const users = require('./routes/users');
const authentication = require('./routes/authentication');

// Port Number
const port = process.env.PORT || 3000;



// Set Static Folder
app.use(express.static(path.join(__dirname, 'uploads/abc')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport').JWT(passport);

app.use('/users', users);
app.use('/', authentication);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

var server = require('http').Server(app);
var io = require('socket.io')(server);

// Start Server
server.listen(port, () => {
    console.log('Server started on port ' + port);
});

io.on('connection', function(socket) {
    socket.on('add-message', function(data) {
    	User.saveNotification(data);
        socket.broadcast.emit('news', data);
    });
});