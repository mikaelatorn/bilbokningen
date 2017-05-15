var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var url = 'mongodb://grupp10:123123@ds133981.mlab.com:33981/bilbokning';

var index = require('./routes/index');
var login = require('./routes/login');

var app = express();

// if using pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/login', login);
var port = normalizePort(process.env.PORT || '3030');
app.set('port', port);


function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

// Database setup and commands
// Maybe move this later

mongoose.connect(url);
mongoose.connection.on('error', (error) => {
    console.log(error);
});
mongoose.Promise = global.Promise;

// user settings 
var user = require('./models/User.js');

app.get('/users', (req, res) => { // get all users
    user.find({}, (error, results) => {
        res.json(results);
    });
});

app.post('/users', (req, res) => { // on sign up - check if username already exsists 
    // req.body.email;
    // req.body.password;
    user.find({ email: req.body.email }, function(error, exsist) {
        if (exsist.length) {
            console.log('user already exsist');
        } else {
            var newUser = new user(req.body);
            newUser.save((error, results) => {
                if (error) res.send(error);
                res.send(results);
                console.log('New user added to database');
            });
        }
    });
});

app.post('/findUser', (req, res) => { // on log in - check if username and password is correct 
    user.find({ email: req.body.email, password: req.body.password }, function(error, exsist) {
        if (exsist.length) { // if username and password match 
            console.log(exsist, 32);
        } else {
            console.log('Wrong username or password');
        }
    });
});

// car settings
var car = require('./models/Car.js');

app.get('/cars', (req, res) => { // get all cars 
    car.find({}, (error, results) => {
        res.json(results);
        console.log('Fetched all cars');
    });
});

app.post('/cars', (req, res) => { // add new car
    var newCar = new car(req.body);
    newCar.save((error, results) => {
        if (error) res.send(error);
        res.send(results);
        console.log('New car added to database');
    });
});

app.delete('/cars', (req, res) => { // delete car
    car.findByIdAndRemove({ _id: req.body.id }, (error, results) => {
        if (error) res.send(error);
        console.log('Car Removed Successfully');
    });
});

// update car with booking (route here will be for that page whatever page the user books a car from)
// client need to supply id of car 
app.post('/booking', (req, res) => {
    console.log(req.body)
    car.findByIdAndUpdate(req.body.id, { $push: { booking: { endDate: req.body.endDate, startDate: req.body.startDate, email: req.body.email } } }, { new: true }, (error, results) => { // change req.body.id to the right car id later
        if (error) res.send(error);
        res.send(results);
        console.log('Successfully booked a car');
    });
});


// need one for unbook 
//  TODO: when user clicks to unbook : 
//  client need to send id of unbooked car 
//  - loop through user id (email) in cars booking to find his/her booking
// remove it from object


// END of Database setup and commands

var server = http.createServer(app);
server.listen(port);

// localhost:3030