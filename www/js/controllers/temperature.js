app.controller('TemperaturesCtrl', function($scope, $cordovaToast, $ionicModal, TemperatureFactory, temperatures){
  $scope.temperatures=temperatures;
  
  $scope.temperature={
    degree: 25
  };
  
  $scope.newReading=function(){
    $ionicModal.fromTemplateUrl('modals/temperature/new.html', {scope: $scope})
    .then(function(modal){
      modal.show();
    });
  };
  
  $scope.reloadRecent=function(){
    TemperatureFactory.recentTemperatures()
    .then(function(temps){
      $scope.temperatures=temps;
    });
  };
  
  $scope.sendTemperature=function(){
    TemperatureFactory.sendTemperature($scope.temperature.degree)
    .then(function(res){
      $scope.reloadRecent();
      try{
        $cordovaToast.showShortBottom('Temperature reading uploaded');
      }catch(e){}
      $scope.reloadRecent();
    });
  };
});