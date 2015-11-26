app.controller('LocationsCtrl', function($scope, $cordovaToast, $cordovaGeolocation, $ionicModal, LocationFactory, locations){
  $scope.locations=locations;
  
  $scope.location={
    lon: 25,
    lat: 25
  };
  
  $scope.reloadRecent=function(){
    LocationFactory.recentLocations()
    .then(function(locs){
      $scope.locations=locs;
    });
  };
  
  $scope.newReading=function(){
    $ionicModal.fromTemplateUrl('modals/location/new.html', {scope: $scope})
    .then(function(modal){
      modal.show();
      return $cordovaGeolocation.getCurrentPosition({timeout: 3000});
    })
    .then(function(pos){
      $scope.location.lon=pos.coords.longitude;
      $scope.location.lat=pos.coords.latitude;
    });
  };
  
  $scope.sendLocation=function(){
    LocationFactory.sendLocation($scope.location)
    .then(function(res){
      console.log(res);
      try{
        $cordovaToast.showShortBottom("Location uploaded");
      }catch(e){}
      $scope.reloadRecent();
    });
  };
});