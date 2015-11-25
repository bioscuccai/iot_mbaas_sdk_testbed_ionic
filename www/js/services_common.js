app.factory('TempMockupFactory', function(TemperatureFactory, $interval, GlobalSettings){
  var handle;
  
  var growing=_.random()>0.5;
  var streak=_.random(2,4);
  var value=_.random(-10, 35);
  
  var start=function(interval){
    $interval(handler, interval||1000);
  };
  
  var handler=function(){
    if(streak===0){
      streak=_.random(2,4);
      growing=(_.random()>0.5);
    }
    
    var diff=_.random(1,3);
    if(growing){
      value+=diff;
    } else {
      value-=diff;
    }
    streak--;
    GlobalSettings.temp.degree=value;
    if(GlobalSettings.temp.autoUpload){
      TemperatureFactory.sendTemperature(value);
    }
  };
  
  var stop=function(){
    $interval.cancel(handle);
  };
  
  return {
    start: start,
    stop: stop
  };
});