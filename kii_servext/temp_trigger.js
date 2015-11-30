function checkTemp(params, context){
  var admin=context.getAppAdminContext();
  console.error("###########running");
  console.error(JSON.stringify(params));
  console.log("#############"+params.uri);
  //Kii.initializeWithSite();
  var temp=KiiObject.objectWithURI(params.uri);
  temp.refresh({
    success: function(obj){
    console.log("#################");
    console.log(JSON.stringify(temp));
    console.log("#############deg:"+obj.get('degree'));
    var triggerBucket = admin.bucketWithName("TriggerPool");
    if(parseInt(obj.get('degree'))>35){
      console.log("###############GREATER");
      var trigger=triggerBucket.createObject();
      trigger.set('seenBy', []);
      trigger.set('message', {message: "It's too hot"});
      trigger.save(
        {
          success:
            function(){
              console.log("##############saved");
            },
          failure:
            function(o, es){
              console.log("###############failed");
              console.log("############ES: "+es);
            }
      });
    }
  },
    failure: function(e, es){
      console.log("###ERROR");
      console.log("############ES: "+es);
      console.log(JSON.stringify(e));
    }
  });
}
