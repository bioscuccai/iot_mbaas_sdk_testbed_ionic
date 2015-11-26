
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.afterSave("Temperature", function(request){
  if(request.object.get('degree')>35){
    var TriggerPool=Parse.Object.extend('TriggerPool');
    var triggerPool=new TriggerPool();
    triggerPool.set('seenBy', []);
    triggerPool.set('message', {message: "It's too hot"});
    triggerPool.set('recipents', []);
    triggerPool.save();
  }
});