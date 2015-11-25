app.controller('LoginCtrl', function($scope, $state, $cordovaToast, UserFactory){
  $scope.user={
    username: 'aaaa',
    password: 'aaaaaaaa'
  };
  
  $scope.login=function(){
    UserFactory.login($scope.user.username, $scope.user.password)
    .then(function(user){
      try{
        $cordovaToast.showShortBottom('Login successfull');
      }catch(e){}
      console.log(user);
      $state.go('temperatures');
    });
  };
});

app.controller('RegisterCtrl', function($scope, $state, $cordovaToast, UserFactory){
  $scope.user={
    username: null,
    email: null,
    password: null
  };
  
  $scope.register=function(){
    UserFactory.register($scope.user)
    .then(function(res){
      try{
        $cordovaToast.showShortBottom('Registration successfull');
      }catch(e){}
      console.log(res);
      $state.go('login', {}, {reload: true});
    });
  };
});


app.controller('LogoutCtrl', function($scope, $state, $cordovaToast, UserFactory){
  Promise.resolve(UserFactory.logout())
  .then(function(res){
    try{
      $cordovaToast.showShortBottom('Logout successfull');
      $state.go('login', {}, {reload: true});
    }catch(e){}
  }, function(){
    $state.go('login', {}, {reload: true});
  });
});
