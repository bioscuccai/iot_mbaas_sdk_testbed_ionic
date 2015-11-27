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

app.factory("LocationFactory", function($q, $http, GlobalSettings){
  var sendLocation=function(coords){
    return $http.post("http://api.carriots.com/streams/", {
        protocol: 'v2',
        //device: `Thermometer_1@getatowel.getatowel`,
        device: credentials.carriots.gps_name+"@"+credentials.carriots.namespace,
        data: {
          lon: coords.lon,
          lat: coords.lat
        },
        at: 'now'
      },{
      headers:{
        'carriots.apikey': credentials.carriots.key
      }
    });
  };
  
  var recentLocations=function(lim){
    var def=$q.defer();
    $http.get("http://api.carriots.com/streams/?device="+credentials.carriots.gps_name+"@"+credentials.carriots.namespace,
    {
      headers:{
        'carriots.apikey': credentials.carriots.key
      }
    })
    .then(function(tempsData){
      console.log(tempsData.data);
      var temps=_.sortBy(tempsData.data.result.map(function(item){
        return {
          id: item._id,
          lon: item.data.lon,
          lat: item.data.lat,
          createdAt: new Date(item.created_at*1000),
          sensor: credentials.carriots.gps_name+"@"+credentials.carriots.namespace
        };
      }), 'created_at').reverse();
      def.resolve(temps);
    }).finally(function(){
      def.resolve([]);
    });
    return def.promise;
  };
  
  return {
    sendLocation: sendLocation,
    recentLocations: recentLocations
  };
});

app.factory("TemperatureFactory", function($q, $http, GlobalSettings){
  var sendTemperature=function(degree){
    return $http.post("http://api.carriots.com/streams/", {
        protocol: 'v2',
        //device: `Thermometer_1@getatowel.getatowel`,
        device: credentials.carriots.thermometer_name+"@"+credentials.carriots.namespace,
        data: {
          temp: degree
        },
        at: 'now'
      },{
      headers:{
        'carriots.apikey': credentials.carriots.key
      }
    });
  };
  
  var recentTemperatures=function(lim){
    var def=$q.defer();
    $http.get("http://api.carriots.com/streams/?device="+credentials.carriots.thermometer_name+"@"+credentials.carriots.namespace,
    {
      headers:{
        'carriots.apikey': credentials.carriots.key
      }
    })
    .then(function(tempsData){
      console.log(tempsData.data);
      var temps=tempsData.data.result.map(function(item){
        return {
          id: item._id,
          degree: item.data.temp,
          createdAt: new Date(item.created_at*1000),
          sensor: credentials.carriots.thermometer_name+"@"+credentials.carriots.namespace
        };
      });
      def.resolve(temps);
    }).finally(function(){
      def.resolve([]);
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

app.factory('TriggerFactory', function($interval, $rootScope, $http, GlobalSettings){
  var handle;
  var lastCheck=parseInt((new Date()).getTime()/1000);
  var start=function(interval){
    handle=$interval(handler, (interval || 3000));
  };
  
  var stop=function(){
    $interval.cancel(handle);
  };
  
  var handler=function(){
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
        $rootScope.$broadcast('trigger:message', {message: item.description});
      });
    });
    lastCheck=parseInt((new Date()).getTime()/1000);
  };
  
  return {
    start: start,
    stop: stop
  };
});
