(function(factory){
  factory(jQuery,app);
}(function($,mgr){
 'use strict';
 var items,
  cls,
  body=$('body'),
  t=false;

 mgr=mgr||{};

 $.extend(mgr,{
  data:$.deparam(location.search.substring(1)),
  init:function(){
   var color=mgr.data['bg-c'];

   items=mgr.items;
   cls=mgr.cls;

   //items.uid.val(mgr.data['uid_']);

   body.addClass(mgr.data['th']);
   body.css('background','linear-gradient(0deg,'+color+',rgba('+parseInt(color.substring(1,3),16)+','+parseInt(color.substring(3,5),16)+','+parseInt(color.substring(5,7),16)+',0.7))');

   mgr.setControls();
  },
  setControls:function(){
   body.on('click',function(){
    parent.postMessage({sovinformburo:true,action:t?'minify':'restore'},'*');
    t=!t;
   });
  }
 });

 app.init();
}));