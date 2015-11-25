app.controller('MainCtrl', function($scope, $rootScope){
  $rootScope.$on('tigger:message');
});