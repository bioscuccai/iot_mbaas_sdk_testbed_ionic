'use strict';
var dotenv = require('dotenv').load();
var _ = require('lodash');
var express = require('express');
var cors = require('cors');
var request = require('request');

var app=express();
app.use(cors());
var http=require("http").Server(app);
var io = require('socket.io')(http);
var IBMIoTF = require('ibm-iotf');


var deviceConfig = {
    "org" : process.env.ORG,
    "id" : process.env.DEVICE_ID,
    "type" : process.env.DEVICE_TYPE,
    "auth-method" : "token",
    "auth-token" : process.env.TOKEN
};

var deviceClient = new IBMIoTF.DeviceClient(deviceConfig);

var appConfig = {
    "org" : process.env.ORG,
    "id" : "appid1",
    "auth-key" : process.env.API_KEY,
    "auth-token" : process.env.API_TOKEN
};


var appClient = new IBMIoTF.ApplicationClient(appConfig);


deviceClient.connect();
appClient.connect();

deviceClient.on('connect', ()=>{
  console.log("device connected");
});

deviceClient.on('command', (commandName, format, payload, topic) => {
  console.log("################################");
  console.log(commandName);
  console.log(format);
  console.log(payload);
  console.log(topic);
  io.sockets.emit("command", {
    commandName: commandName,
    format: format,
    payload: payload,
    message: payload,
    topic: topic
  }, payload);
});

appClient.on('connect', ()=>{
  console.log("app connected");
  appClient.subscribeToDeviceEvents();
  
  appClient.on('deviceEvent', (deviceType, deviceId, eventType, format, payload) => {
    
    console.log(deviceType);
    console.log(deviceId);
    console.log(eventType);
    console.log(format);
    console.log(payload);
    
  });

  /*appClient.getAllHistoricalEvents()
  .then(events=>{
    console.log(events);
  });*/
  /*appClient.getAllHistoricalEvents().then (function onSuccess (response) {
            console.log("Success");
            console.log(response);
    }, function onError (error) {

            console.log("Fail");
            console.log(error);
    });*/
});




io.on("connect", (socket)=>{
  socket.on("status", (message)=>{
    console.log(message);
    deviceClient.publish('status', 'json', JSON.stringify({d: message}));
  });
});

app.get("/history/:type", (req, res) => {
  let data=[];
  appClient.getAllHistoricalEvents()
  .then(evts=>{
    console.log(JSON.stringify(evts.events, null, 2));
    if(req.params.type==='temp'){
      let temps=evts.events.filter(item=>item.evt.temp);
      data=temps.map(item=>{
        return {
          id: item.timestamp.$date,
          createdAt: new Date(item.timestamp.$date),
          degree: item.evt.temp,
          sensor: item.device_id
        };
      });
    } else if(req.params.type==='loc'){
      let temps=evts.events.filter(item=>item.evt.lon);
      data=temps.map(item=>{
        return {
          id: item.timestamp.$date,
          createdAt: new Date(item.timestamp.$date),
          lat: item.evt.lat,
          lon: item.evt.lon,
          sensor: item.device_id
        };
      });
    }
    res.json(data);
  });
});

http.listen(5678, "0.0.0.0");
