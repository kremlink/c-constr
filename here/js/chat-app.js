(function(factory){
  factory(jQuery,app);
}(function($,mgr){
 'use strict';
 var items,
  cls,
  sts,
  body=$('body');

 mgr=mgr||{};

 $.extend(mgr,{
  //data object with params from src
  data:$.deparam(location.search.substring(1)),
  //min. chat height (when hidden)
  minH:0,
  //chat size
  size:{w:0,h:0},
  //chat state
  opened:false,
  //timeout ids
  time:{
   open:null,
   notify:null
  },
  bot:{
   //f - added message flag
   hi:{
    f:false,
    d:$.Deferred()
   },
   suggest:{
    f:false,
    d:$.Deferred()
   },
   //amount of unseen messages
   unseen:0
  },
  //user's messages
  msgs:[],
  //is set to true when the form has been successfully sent
  sent:false,
  init:function(){
   //css for outer wrap and block
   var css={wrap:{},block:{}},
    //rgba-ize the color
    rgba=parseInt(mgr.data['bg-c'].substring(1,3),16)+','+parseInt(mgr.data['bg-c'].substring(3,5),16)+','+parseInt(mgr.data['bg-c'].substring(5,7),16),
    //notifier bg color
    bg='none';

   if(mgr.data['p']=='l-b')
    css.wrap.left=mgr.data['sh']+'px';
   if(mgr.data['p']=='r-b')
    css.wrap.right=mgr.data['sh']+'px';

   if(mgr.data['th']=='theme1')
    css.block.borderRadius='22px 0 0 0';else
    css.block.borderRadius='6px 6px 0 0';

   if(mgr.data['th']=='theme2')
    bg='#78e883';
   if(mgr.data['th']=='theme3')
    bg='#6ed8ff';

   //for convenience
   items=mgr.items;
   cls=mgr.cls;
   sts=mgr.settings;

   mgr.size.w=354;
   mgr.size.h=450;

   items.uid.val(mgr.data['uid_']);

   body.addClass(mgr.data['th']).css({color:mgr.data['bg-c'],background:'linear-gradient(0deg,'+mgr.data['bg-c']+',rgba('+rgba+',0.7))'});

   items.face.css('background-image','url('+sts.images+mgr.data['ph']+')');
   items.name.text(mgr.data['n']).css('color',mgr.data['t-c']);
   items.job.text(mgr.data['j']).css('color',mgr.data['t-c']);

   //set min. chat height
   mgr.minH=items.hdr.innerHeight();
   //set outer data
   parent.postMessage({
    type:'chat',
    sovinformburo:true,
    action:'init',
    css:css,
    size:{width:mgr.size.w,height:mgr.size.h},
    minH:mgr.minH,
    notify:mgr.data['th']=='theme1'?'':'<div class="sovinformburo_chat-notify" style="background:'+bg+'"><span style="border-top-color:'+bg+'"></span>'+sts.notifyText+'</div>'
   },'*');

   //either input or textarea
   items.input=items.input.filter('.'+mgr.data['th']);

   mgr.setControls();
   mgr.setForm();
  },
  //set things for form
  setForm:function(){
   items.inps.on('focus',function(){
    $(this).removeClass(cls.err);
   });

   //send btn click
   items.next2.on('click',function(e){
    var v1=$.trim(items.inps.eq(0).val()),
     v2=$.trim(items.inps.eq(1).val()),
     v3=$.trim(items.inps.eq(2).val()),
     i1=true,
     i2=true,
     i3=true,
     m_data;

    //validate
    if(!v1||!v3)
    {
     !v1?i1=false:i3=false;
     items.inps.eq(!v1?0:2).addClass(cls.err);
    }
    if(!/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/.test(v2))
    {
     i2=false;
     items.inps.eq(1).addClass(cls.err);
    }

    if(i1&&i2&&i3)
    {
     items.step2.addClass(cls.loading);

     m_data=items.serialize.serializeArray();
     //add messages
     m_data.push({name:'sovinformburo_msg',value:mgr.msgs});
     //add special data
     m_data.push({name:'sovinformburo_from',value:mgr.data.from_});
     if(mgr.data.tduid_)
      m_data.push({name:'sovinformburo_tduid',value:mgr.data.tduid_});

     $.ajax({
      type:'POST',
      url:'http://crm.sov-inform-buro.ru/api/lead',
      data:m_data,
      dataType:'json',
      success:function(data){
       parent.postMessage({type:'chat',sovinformburo:true,msg:'chat-sent'},'*');
       items.step2.removeClass(cls.loading);
       if(data['status'] == "true"){
        body.addClass(cls.sent);
        mgr.sent=true;
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
  },
  /*scrollDim:function(){
   var div=$('<div style="position:absolute;overflow-y:scroll;"></div>').prependTo('body'),
    dim=div.width()-div.css('overflow-y','auto').width();

   div.remove();

   return dim;
  },*/
  //toggle state
  toggle:function(){
   parent.postMessage({
    type:'chat',
    sovinformburo:true,
    action:'resize',
    height:mgr.opened?mgr.minH:mgr.size.h
   },'*');
   body[(mgr.opened?'remove':'add')+'Class'](cls.opened);

   mgr.opened=!mgr.opened;

   mgr.botWrites('hi');

   if(mgr.opened)
   {
    //don't show notifications while mgr.opened
    body.removeClass(cls.hasNotif);
    //if bot already added his first message, set amount of unseen messages to 0
    if(mgr.bot['hi'].f)
     mgr.bot.unseen=0;

    //if bot added his final message while chat was closed
    if(mgr.bot['suggest'].f)
     mgr.bot['suggest'].d.resolve();
   }
  },
  botWrites:function(what){
   //if bot didn't add that message
   if(!mgr.bot[what].f)
   {
    mgr.bot[what].d=$.Deferred();
    //append message
    items.msgs.append(sts.msg.wait);
    setTimeout(function(){
     mgr.addMsg({type:what});
     sts.msg.wait.remove();
     //if chat is closed
     if(!mgr.opened)
     {
      body.addClass(cls.hasNotif);
      items.amt.text(++mgr.bot.unseen);
     }

     if(what=='hi'||what!='hi'&&mgr.opened)
      mgr.bot[what].d.resolve();
    },sts.time.wait);

    mgr.bot[what].f=true;
   }
  },
  //hide notification
  hideNotif:function(){
   parent.postMessage({
    type:'chat',
    sovinformburo:true,
    action:'notify',
    css:{opacity:0,visibility:'hidden'}
   },'*');
  },
  //set misc. controls
  setControls:function(){
   //show/hide the chat
   items.toggler.on('click',function(e){
    mgr.toggle();
    if(mgr.opened)
    {
     clearTimeout(mgr.time.open);
     clearTimeout(mgr.time.notify);
     mgr.hideNotif();
    }else
    {
     //if final form hasn't been sent show notification and open the chat after some time
     if(!mgr.sent)
     {
      mgr.time.open=setTimeout(function(){
       mgr.toggle();
       mgr.hideNotif();
      },sts.time.open);

      parent.postMessage({
       type:'chat',
       sovinformburo:true,
       action:'notify',
       css:{opacity:1,visibility:'visible'}
      },'*');
      mgr.time.notify=setTimeout(function(){
       mgr.hideNotif();
      },sts.time.notify);
     }
    }

    e.preventDefault();
   });

   //initial open
   mgr.time.open=setTimeout(function(){
    mgr.toggle();
   },sts.time.iniOpen);

   //var s=mgr.scrollDim();
   //block the scroll of the external page
   items.msgs/*.css({bottom:-s,right:-s})*/.on('mousewheel',function(e,d){
    var s=items.msgs.scrollTop();

    if(d>0&&s==0||d<0&&s+items.msgs.innerHeight()>=items.msgs[0].scrollHeight)
     e.preventDefault();
   });

   //add message
   items.next1.on('click',function(){
    mgr.addMsg({cls:cls.me,text:items.input.val()});
   });

   //add message
   items.input.on('keypress',function(e){
    if(e.which==13&&items.input.is('input'))
     mgr.addMsg({cls:cls.me,text:items.input.val()});
   });
  },
  //add message
  addMsg:function(opts){
   if(opts.text||opts.type)
   {
    //insert data into message
    items.msgs.append($(sts.msg.tmpl.replace('[h]',opts.cls?sts.msg.h:mgr.data['n'])
     .replace('[text]',opts.cls?opts.text:sts.msg.text[opts.type])).addClass(opts.cls));

    //if human
    if(opts.cls)
    {
     //save message
     mgr.msgs.push(opts.text);
     $.when(mgr.bot['hi'].d).then(function(){
      mgr.botWrites('suggest');
      $.when(mgr.bot['suggest'].d).then(function(){
       setTimeout(function(){
        body.addClass(cls.step2);
        parent.postMessage({type:'chat',sovinformburo:true,msg:'chat-shown'},'*');
       },sts.time.toForm);
      });
     });
    }

    items.msgs.stop().animate({scrollTop:items.msgs[0].scrollHeight},500);
   }
  }
 });

 app.init();
}));