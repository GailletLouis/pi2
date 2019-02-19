var url = 'http://localhost:3486/';
var epPredictGender = 'predictGender';
var epUpdateModel = 'updateModel';
var epAddNewInput = 'addNewInput';

var fs = require('fs');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);






app.get('/main.js', function (req, res) {
    res.sendFile(__dirname + '/main.js');
});
app.get('/socket.io/socket.io.js', function (req, res) {
    console.log('request socket .io');
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});



io.sockets.on('connection', function (socket) {

    console.log('Un client est connecté !');

    socket.on('predictGender', function () {

        console.log("Gender prediction request received");

        http.get(url + epPredictGender, function (res) {
            res.on('data', function (data) {
                var gender = data.toString('ascii');
                console.log('Gender : ' + gender);
                socket.emit('prediction', gender);
            });
            res.on('error', function (err) {
                console.log(err);
            });
        });
    });

    socket.on('updateModel', function () {

        console.log('Update model request received');

        http.get(url + epUpdateModel, function (res) {
            res.on('data', function (data) {
            });
            res.on('error', function (err) {
                socket.emit('serverError', err);
                console.log(err);
            });
        });
    });

    socket.on('addNewInput', function (gender) {

        console.log('Add new input request received (gender : ' + gender + ')');

        return;
        http.get(url + epAddNewInput + '/?gender=' + gender, function (res) {
            res.on('data', function (data) {
                var value = data.toString('ascii');
                socket.emit('nbrInputNotUsed', value);
            });
            res.on('error', function (err) {
                socket.emit('serverError', err);
                console.log(err);
            });
        });
    });

    socket.on('audioBlob', function (data) {

        console.log('blob received');

        fs.writeFile("recordingFolder/recording.wav", data, function (err) {
            if (err) {
                console.log("err", err);
            } else {
                console.log({ 'status': 'success' });
                socket.emit('ready');
            }
        });
    });
});



server.listen(8080);
