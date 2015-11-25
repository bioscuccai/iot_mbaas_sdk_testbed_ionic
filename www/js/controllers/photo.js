app.controller('PhotosCtrl', function($scope, $cordovaToast, $cordovaCamera, PhotoFactory, photos){
  $scope.photos=photos;
  
  $scope.imageData={
    raw: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg=="
  };
  
  $scope.takePhoto=function(){
    var cameraOptions={
       destinationType: Camera.DestinationType.DATA_URL,
       //destinationType: Camera.DestinationType.FILE_URI,
       //sourceType: fromAlbum ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA,
       //sourceType: Camera.PictureSourceType.CAMERA,
       encodingType: Camera.EncodingType.JPEG,
       saveToPhotoAlbum: true
     };
     $cordovaCamera.getPicture(cameraOptions).then(function(data){
       $scope.imageData.raw="data:image/jpeg;base64,"+data;
     });
  };
  
  $scope.sendPhoto=function(){
    PhotoFactory.sendPhoto($scope.imageData.raw)
    .then(function(res){
      console.log(res);
      try{
        $cordovaToast.showShortBottom('Upload successfull');
      } catch(e){}
    },
    function(err){
      console.log(err);
      try{
        $cordovaToast.showShortBottom('Upload failed: '+JSON.stringify(err));
      }catch(e){}
    }); //catch isn't supported in Parse
  };
});