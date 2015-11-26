app.controller('MainCtrl', function($scope, $cordovaToast, $rootScope){
  $rootScope.$on('trigger:message', function(event, message){
    console.log("received:");
    console.log(message);
    try{
      $cordovaToast.showShortBottom(message.message);
    }catch(e){}
    console.log(message.message);
  });
});
