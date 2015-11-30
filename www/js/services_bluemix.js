app.factory("UserFactory", function($q, GlobalSettings){
  var setUser=function(username, id){
    GlobalSettings.user.username=username;
    GlobalSettings.user.id=id;
  };
  
  var login=function(username, password){
    setUser("device", 0);
    return $q.when({});
  };
  
  var logout=function(){
    setUser(null, null);
    return $q.when({});
  };

  var currentUser=function(){
    return "device";
  };
  
  var register=function(userData){
    return $q.when({});
  };
  
  return {
    login: login,
    logout: logout,
    register: register,
    currentUser: currentUser
  };
});

app.factory("LocationFactory", function($q, $http, GlobalSettings, WsFactory){
  var sendLocation=function(coords){
    WsFactory.emit("status", coords);
    return $q.when({});
  };
  
  var recentLocations=function(){
    var def=$q.defer();
    $http.get("http://192.168.0.108:5678/history/loc")
    .then(function(locData){
      return def.resolve(locData.data);
    });
    return def.promise;
  };
  
  return {
    sendLocation: sendLocation,
    recentLocations: recentLocations
  };
});

app.factory("TemperatureFactory", function($q, $http, GlobalSettings, WsFactory){
  var sendTemperature=function(degree){
    WsFactory.emit("status", {temp: degree});
  };
  
  var recentTemperatures=function(lim){
    var def=$q.defer();
    $http.get("http://192.168.0.108:5678/history/loc")
    .then(function(locData){
      return def.resolve(locData.data);
    });
    return def.promise;
  };
  
  return {
    sendTemperature: sendTemperature,
    recentTemperatures: recentTemperatures
  };
});

app.factory("PhotoFactory", function($q, GlobalSettings){

  var recentPhotos=function(lim){
    return $q.when([]);
  };
  
  var sendPhoto=function(raw){
    return $q.when("ok");
  };
  
  return {
    recentPhotos: recentPhotos,
    sendPhoto: sendPhoto
  };
});

var gth;

app.factory('TriggerFactory', function($interval, $rootScope, $http, GlobalSettings, WsFactory){
  var handle;
  var lastCheck=parseInt((new Date()).getTime()/1000);
  var start=function(interval){
    WsFactory.on('command', handler);
  };
  
  var stop=function(){
    $interval.cancel(handle);
  };
  
  var handler=function(command){
    console.log("command");
    console.log(command);
    if(!GlobalSettings.trigger.enabled) return;
    $http.get("http://api.carriots.com/alarms/?created_at_from="+lastCheck,
    {
      headers:{
        'carriots.apikey': credentials.carriots.key
      }
    })
    .then(function(alarmsData){
      console.log(alarmsData.data);
      (alarmsData.data.result||[]).forEach(function(item){
        $rootScope.$broadcast('trigger:message', command);
      });
    });
    lastCheck=parseInt((new Date()).getTime()/1000);
  };
  
  return {
    start: start,
    stop: stop
  };
});
