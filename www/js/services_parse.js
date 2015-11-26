app.factory("UserFactory", function($q, GlobalSettings){
  var login=function(username, password){
    var def=$q.defer();
    Parse.User.logIn(username, password)
    .then(function(user){
      GlobalSettings.user.username=username;
      GlobalSettings.user.id=user.id;
      return def.resolve(user);
    }, function(err){
      return def.reject(err);
    });
    
    return def.promise;
  };
  
  var setUser=function(username, id){
    GlobalSettings.user.username=username;
    GlobalSettings.user.id=id;
  };
  
  var logout=function(){
    var def=$q.defer();
    Parse.User.logOut()
    .then(function(){
      setUser(null, null);
      def.resolve();
    }, function(){
      setUser(null, null);
      def.resolve();
    });
    return def.promise;
  };
  
  var currentUser=function(){
    return Parse.User.currentUser();
  };
  
  var register=function(userData){
    var user=new Parse.User();
    user.set('username', userData.username);
    user.set('password', userData.password);
    //user.set('email', userData.email);
    return user.signUp();
  };
  
  return {
    login: login,
    logout: logout,
    register: register,
    currentUser: currentUser
  };
});

app.factory("LocationFactory", function($q, GlobalSettings){
  var sendLocation=function(coords){
    var Location=Parse.Object.extend('Location');
    var location=new Location();
    location.set('location', new Parse.GeoPoint(coords.lon, coords.lat));
    location.set('sensor', GlobalSettings.device.id);
    return location.save();
  };
  
  var recentLocations=function(lim){
    var def=$q.defer();
    var Location=Parse.Object.extend('Location');
    var query=new Parse.Query(Location);
    query.limit(lim || 100);
    query.descending("createdAt");
    query.find()
    .then(function(results){
      var res=results.map(function(item){
        return {
          id: item.get('objectId'),
          createdAt: item.get('createdAt'),
          updatedAt: item.get('updatedAt'),
          sensor: item.get('sensor'),
          lon: item.get('location').longitude,
          lat: item.get('location').latitude,
          rawLocation: item.get('location')
        };
      });
      return def.resolve(res);
    });
    
    return def.promise;
  };
  
  return {
    sendLocation: sendLocation,
    recentLocations: recentLocations
  };
});

app.factory("TemperatureFactory", function($q, GlobalSettings){
  var sendTemperature=function(degree){
    var Temperature=Parse.Object.extend('Temperature');
    var temp=new Temperature();
    temp.set('degree', degree);
    temp.set('sensor', GlobalSettings.device.id);
    return temp.save();
  };
  
  var recentTemperatures=function(lim){
    var def=$q.defer();
    var Temperature=Parse.Object.extend('Temperature');
    var query=new Parse.Query(Temperature);
    query.limit(lim || 100);
    query.descending("createdAt");
    query.find()
    .then(function(results){
      var res=results.map(function(item){
        return {
          id: item.get('objectId'),
          degree: item.get('degree'),
          createdAt: item.get('createdAt'),
          updatedAt: item.get('updatedAt'),
          sensor: item.get('sensor')
        };
      });
      return def.resolve(res);
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
    var def=$q.defer();
    var Photo=Parse.Object.extend('Photo');
    var query=new Parse.Query(Photo);
    query.descending("createdAt");
    query.limit(lim || 3);
    query.find()
    .then(function(results){
      var res=results.map(function(item){
        return {
          id: item.get('objectId'),
          createdAt: item.get('createdAt'),
          updatedAt: item.get('updatedAt'),
          photoUrl: item.get('photo').url(),
          rawPhoto: item.get('photo'),
          sensor: item.get('sensor')
        };
      });
      return def.resolve(res);
    });
    
    return def.promise;
  };
  
  var sendPhoto=function(base64){
    var file=new Parse.File("upload.jpg", {base64: base64});
    return file.save()
    .then(function(uploadedFile){
      var Photo=Parse.Object.extend('Photo');
      var photo=new Photo();
      photo.set('photo', file);
      photo.set('sensor', GlobalSettings.device.id);
      return photo.save();
    });
  };
  
  return {
    recentPhotos: recentPhotos,
    sendPhoto: sendPhoto
  };
});

var gth;

app.factory('TriggerFactory', function($interval, $rootScope, GlobalSettings){
  var handle;
  
  var start=function(interval){
    handle=$interval(handler, (interval || 3000));
  };
  
  var stop=function(){
    $interval.cancel(handle);
  };
  
  var handler=function(){
    if(!GlobalSettings.trigger.enabled) return;
    var TriggerPool=Parse.Object.extend('TriggerPool');
    var query=new Parse.Query(TriggerPool);
    query.notEqualTo('seenBy', GlobalSettings.device.id);
    query.find()
    .then(function(results){
      console.log(results);
      results.forEach(function(item){
        var seenBy=item.get('seenBy');
        seenBy.push(GlobalSettings.device.id);
        item.set('seenBy', seenBy);
        item.save();
        console.log("sending:");
        console.log(item.get('message'));
        $rootScope.$broadcast('trigger:message', item.get('message'));
      });
    });
  };
  
  return {
    start: start,
    stop: stop
  };
});