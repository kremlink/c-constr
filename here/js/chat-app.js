(function(factory){
  factory(jQuery,app);
}(function($,mgr){
 'use strict';
 var items,
  cls,
  body=$('body');

 mgr=mgr||{};

 $.extend(mgr,{
  data:$.deparam(location.search.substring(1)),
  init:function(){
   items=mgr.items;
   cls=mgr.cls;

   items.uid.val(mgr.data['uid_']);

   body.addClass(mgr.data['th']);

   mgr.setControls();
  },
  setControls:function(){

  }
 });

 app.init();
}));