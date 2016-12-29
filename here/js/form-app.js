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
   var color=mgr.data['bg-c'];

   items=mgr.items;
   cls=mgr.cls;

   items.uid.val(mgr.data['uid_']);

   body.addClass(mgr.data['th'].split(':')[0]);

   if(color)
   {
    items.bg.css('background','linear-gradient(0deg,'+color+',rgba('+parseInt(color.substring(1,3),16)+','+parseInt(color.substring(3,5),16)+','+parseInt(color.substring(5,7),16)+',0.7))');
    items.img.css('border-color',mgr.data['bg-c']);
    items.btnColor.css('background',mgr.data['bg-c']);
    $('head').append('<style>.colorize{fill:'+mgr.data['bg-c']+'}</style>');
   }
   if(mgr.data['t-c'])
   {
    items.hdr.css('color',mgr.data['t-c']);
    items.next1.add(items.next2).css('color',mgr.data['t-c']);
   }
   items.img.attr('src',mgr.settings.images+mgr.data['ph']);
   items.h.text(mgr.data['h']);
   items.subH.text(mgr.data['s-h']);

   //set some listeners for interface
   items.ta.on('focus',function(){
    items.plh.addClass(cls.hidden);
   }).on('blur',function(){
    if(!$.trim(items.ta.val()))
     items.plh.removeClass(cls.hidden);
   }).add(items.inps).on('focus',function(){
    $(this).removeClass(cls.err);
   });

   mgr.setControls();
  },
  setControls:function(){
   //first btn click
   items.next1.on('click',function(e){
    var v=$.trim(items.ta.val());

    if(v&&v.length>2)
    {
     body.addClass(cls.step2);
     parent.postMessage({sovinformburo:true,msg:'form-shown'},'*');
    }else
    {
     items.ta.addClass(cls.err);
    }

    e.preventDefault();
   });
   //send btn click
   items.next2.on('click',function(e){
    var v1=$.trim(items.inps.eq(0).val()),
     v2=$.trim(items.inps.eq(1).val()),
     i1=true,
     i2=true,
     m_data;

    if(!v1)
    {
     i1=false;
     items.inps.eq(0).addClass(cls.err);
    }
    if(!/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/.test(v2))
    {
     i2=false;
     items.inps.eq(1).addClass(cls.err);
    }

    if(i1&&i2)
    {
     items.step2.addClass(cls.loading);

     m_data=$(':input').serializeArray();
     m_data.push({name:'sovinformburo_from',value:mgr.data.from_});
     if(mgr.data.tduid_)
      m_data.push({name:'sovinformburo_tduid',value:mgr.data.tduid_});

     $.ajax({
      type:'POST',
      url:'http://crm.sov-inform-buro.ru/api/lead',
      data:m_data,
      dataType:'json',
      success:function(data){
       parent.postMessage({sovinformburo:true,msg:'sent'},'*');
       items.step2.removeClass(cls.loading);
       if(data['status'] == "true"){
        body.addClass(cls.sent);
       }else
       {
        alert('Произошла ошибка при отправке!');
       }
      },
      error:function(){
       items.step2.removeClass(cls.loading);
       alert('Проблемы на сервере');
      }
     });
    }

    e.preventDefault();
   });
  }
 });

 app.init();
}));