app.controller('MenuCtrl', function($scope, GlobalSettings){
  $scope.user=GlobalSettings.user;
  $scope.temp=GlobalSettings.temp;
  $scope.trigger=GlobalSettings.trigger;
});
