// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app=angular.module('starter', ['ionic', 'ngCordova', 'chart.js']);

app.value("GlobalSettings", {
  user: {
    id: null,
    email: null,
    username: null,
    allowLocation: true,
    allowTemperature: true,
    allowPhoto: true
  },
  device: {
    id: 'browser'
  },
  temp:{
    degree: 25,
    autoUpload: false
  },
  trigger: {
    enabled: false
  }
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
app.config(function($stateProvider, $urlRouterProvider){

  $urlRouterProvider.otherwise('/login');
  $stateProvider.state('login', {
    url: '/login',
    cache: false,
    views: {
      main: {
        controller: 'LoginCtrl',
        templateUrl: 'templates/user/login.html'
      }, menuBar: {
        controller: 'MenuCtrl',
        templateUrl: 'templates/menu/main.html'
      }
    }
  });
  
  $stateProvider.state('register', {
    url: '/register',
    cache: false,
    views: {
      main: {
        controller: 'RegisterCtrl',
        templateUrl: 'templates/user/register.html'
      }, menuBar: {
        controller: 'MenuCtrl',
        templateUrl: 'templates/menu/main.html'
      }
    }
  });
  
  $stateProvider.state('logout', {
    url: '/logout',
    cache: false,
    views: {
      main: {
        controller: 'LogoutCtrl'/*,
        templateUrl: 'templates/user/register.html'*/
      }, menuBar: {
        controller: 'MenuCtrl',
        templateUrl: 'templates/menu/main.html'
      }
    }
  });
  
  $stateProvider.state('temperatures', {
    url: '/temperatures',
    cache: false,
    views: {
      main: {
        controller: 'TemperaturesCtrl',
        templateUrl: 'templates/temperature/index.html',
        resolve: {
          temperatures: function(TemperatureFactory){
            return TemperatureFactory.recentTemperatures();
          }
        }
      }, menuBar: {
        controller: 'MenuCtrl',
        templateUrl: 'templates/menu/main.html'
      }
    }
  });
  
  $stateProvider.state('temperature_chart', {
    url: '/temperature_chart',
    cache: false,
    views: {
      main: {
        controller: 'TemperatureChartCtrl',
        templateUrl: 'templates/temperature/chart.html',
        resolve: {
          temperatures: function(TemperatureFactory){
            return TemperatureFactory.recentTemperatures();
          }
        }
      }, menuBar: {
        controller: 'MenuCtrl',
        templateUrl: 'templates/menu/main.html'
      }
    }
  });
  
  $stateProvider.state('locations', {
    url: '/locations',
    cache: false,
    views: {
      main: {
        controller: 'LocationsCtrl',
        templateUrl: 'templates/location/index.html',
        resolve: {
          locations: function(LocationFactory){
            return LocationFactory.recentLocations();
          }
        }
      }, menuBar: {
        controller: 'MenuCtrl',
        templateUrl: 'templates/menu/main.html'
      }
    }
  });
  
  $stateProvider.state('photos', {
    url: '/photos',
    cache: false,
    views: {
      main: {
        controller: 'PhotosCtrl',
        templateUrl: 'templates/photo/index.html',
        resolve: {
          photos: function(PhotoFactory){
            return PhotoFactory.recentPhotos();
          }
        }
      }, menuBar: {
        controller: 'MenuCtrl',
        templateUrl: 'templates/menu/main.html'
      }
    }
  });
});
app.run(function($rootScope,$ionicPlatform, $ionicHistory){
  $ionicPlatform.registerBackButtonAction(function(e){
    if($ionicHistory.backView()){
      $ionicHistory.goBack();
    }
    e.preventDefault();
    return false;
  }, 101);
});

app.run(function(TempMockupFactory, TriggerFactory){
  Parse.initialize(credentials.parse.id, credentials.parse.token);
  Kii.initialize(credentials.kii.id, credentials.kii.key, KiiSite.US);
  TempMockupFactory.start();
  TriggerFactory.start();
});

app.run(function(GlobalSettings, $cordovaDevice){
  document.addEventListener("deviceready",function(){
    console.log("ready");
    try{
      GlobalSettings.device.id="mobile_"+$cordovaDevice.getUUID();
      console.log("device: "+$cordovaDevice.getUUID());
    }catch(e){
      console.error(e);
    }
  });
  
});
