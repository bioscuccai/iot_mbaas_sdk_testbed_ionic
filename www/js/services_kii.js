app.factory("UserFactory", function($q, GlobalSettings){
  var setUser=function(username, id){
    GlobalSettings.user.username=username;
    GlobalSettings.user.id=id;
  };
  
  var login=function(username, password){
    var def=$q.defer();
    KiiUser.authenticate(username, password)
    .then(function(user){
      console.log(user);
      setUser(username, user._uuid);
      def.resolve(user);
    }, function(e){
      def.reject(e);
    });
    
    return def.promise;
  };
  
  var logout=function(){
    KiiUser.logOut();
    setUser(null, null);
    return $q.when("ok");
  };

  var currentUser=function(){
    return KiiUser.getCurrentUser();
  };
  
  var register=function(userData){
    var user=KiiUser.userWithUsername(userData.username, userData.password);
    return user.register();
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
    var bucket=Kii.bucketWithName('Location');
    var location=bucket.createObject();
    location.set('location', KiiGeoPoint.geoPoint(coords.lon, coords.lat));
    location.set('sensor', GlobalSettings.device.id);
    return location.save();
  };
  
  var recentLocations=function(lim){
    var def=$q.defer();
    var bucket = Kii.bucketWithName("Location");
    var query = KiiQuery.queryWithClause();
    query.setLimit(lim||100);
    query.sortByDesc('_created');
    bucket.executeQuery(query)
    .then(function(resultsArr){
      var results=resultsArr[1];
      var res=results.map(function(item){
        return {
          id: item.getUUID(),
          createdAt: item.getCreated(),
          updatedAt: item.getModified(),
          sensor: item.get('sensor'),
          lon: item.get('location')._longitude,
          lat: item.get('location')._latitude,
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
    var temperatureBucket=Kii.bucketWithName('Temperature');
    var temperature=temperatureBucket.createObject();
    temperature.set('degree', degree);
    temperature.set('sensor', GlobalSettings.device.id);
    return temperature.save();
  };
  
  var recentTemperatures=function(lim){
    var def=$q.defer();
    var bucket = Kii.bucketWithName("Temperature");
    var query = KiiQuery.queryWithClause();
    query.setLimit(lim||100);
    query.sortByDesc('_created');
    bucket.executeQuery(query)
    .then(function(resultsArr){
      var results=resultsArr[1];
      var res=results.map(function(item){
        return {
          id: item.getUUID(),
          createdAt: item.getCreated(),
          updatedAt: item.getModified(),
          sensor: item.get('sensor'),
          degree: item.get('degree')
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
  //http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || 'image/jpeg';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  var recentPhotos=function(lim){
    var def=$q.defer();
    var bucket = Kii.bucketWithName("Photo");
    var query = KiiQuery.queryWithClause();
    query.setLimit(lim||3);
    query.sortByDesc('_created');
    bucket.executeQuery(query)
    .then(function(resultsArr){
      var results=resultsArr[1];
      var res=results.map(function(item){
        return {
          id: item.getUUID(),
          createdAt: item.getCreated(),
          updatedAt: item.getModified(),
          sensor: item.get('sensor'),
          photoUrl: item.get('url')
        };
      });
      return def.resolve(res);
    });
    
    return def.promise;
  };
  
  var sendPhoto=function(raw){
    var def=$q.defer();
    var base64=raw;
    base64=base64.replace("data:image/png;base64,", '');
    base64=base64.replace("data:image/jpg;base64,", '');
    base64=base64.replace("data:image/jpeg;base64,", '');
    var bucket=Kii.bucketWithName('Photo');
    var photo=bucket.createObject();
    photo.set('sensor', GlobalSettings.device.id);
    photo.save()
    .then(function(obj){
      var blob=b64toBlob(base64);
      return obj.uploadBody(blob);
    })
    .then(function(r){
      return r.publishBody();
    })
    .then(function(r){
      var o=r[0];
      var b=r[1];
      o.set('url', b);
      return o.save();
    })
    .then(function(r){
      return def.resolve(r);
    }, function(e){
      console.log(e);
      return def.reject(e);
    });
    return def.promise;
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