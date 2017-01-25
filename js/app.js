(function(factory){
  factory(jQuery,formConstructor);
}(function($,mgr){
 'use strict';

 var els,data,props;

 mgr=mgr||{};

 //set some vars for convenience
 els=mgr.config.elements;
 data=mgr.config.data;

 //set app object
 $.extend(mgr,{
  props:{},//different $DOM objects excluding controls (selects and inputs)
  index:-1,
  name:null,
  data:{},
  type:$(els.type.item),//type select
  sels:$(els.ctrls.items).filter('select'),
  inps:$(els.ctrls.items).filter('input'),
  colorInps:null,
  inserted:{},
  init:function(){
   //set localization for colorpicker
   $.extend($.fn.spectrum.defaults,$.spectrum.localization["ru"]={
    cancelText:"отмена",
    chooseText:"выбрать"
   });

   //set all used DOM items
   props=mgr.props;
   props.blocks=$(els.blocks.items);

   props.into=$(els.dest.into);
   props.ext=$(els.dest.external);
   props.output=$(els.output);

   mgr.colorInps=mgr.inps.filter(function(){
    return $(this).data(els.ctrls.data).color;
   }).spectrum({
    color:this.value,
    showInput:true,
    preferredFormat:"hex",
    change:function(){
     mgr.setOutput();
    }
   });

   mgr.setFrameListener();
   mgr.setSelects();
   mgr.setInputs();
  },
  //chat tells parent about its size change
  setFrameListener:function(){
   window.addEventListener("message",function(e){
    if(mgr.name=='chat'&&e.data&&e.data.sovinformburo)
    {
     switch(e.data.action)
     {
      case 'init':
       mgr.inserted.iframe.css('position','static').css(e.data.size);
       mgr.inserted.wrap.css(e.data.css.wrap).height(e.data.minH);
       mgr.inserted.block.css(e.data.css.block);
       mgr.inserted.notify=$(e.data.notify).appendTo(mgr.inserted.wrap);
       break;
      case 'resize':
       mgr.inserted.wrap.height(e.data.height);
       break;
      case 'notify':
       mgr.inserted.notify.css(e.data.css);
     }
    }
    if(mgr.name=='form'&&e.data&&e.data.sovinformburo)
    {
     switch(e.data.action)
     {
      case 'init':
       mgr.inserted.wrap.css(e.data.css).css('width',e.data.css.width=='100%'?600:e.data.css.width);
     }
    }
   },false);
  },
  //render data
  render:function(){
   var script,
    base=mgr.data[mgr.name]['b_'],
    d,
    param,
    x;

   d=$.extend({},mgr.data[mgr.name]);
   for(x in d)
    if(d.hasOwnProperty(x)&&~data.omit.indexOf(x))
     delete d[x];

   delete d['b_'];
   param=$.param(d);

   if(mgr.inserted.wrap&&mgr.inserted.wrap.length)
    mgr.inserted.wrap.remove();

   if(mgr.name=='chat')
   {
    mgr.inserted.wrap=$('<div class="sovinformburo_chat" />').appendTo(props.into);
    mgr.inserted.block=$('<div class="sovinformburo_chat-block" />').appendTo(mgr.inserted.wrap);
    mgr.inserted.iframe=$('<iframe src="'+mgr.data[mgr.name]['bU']+'chat.html?'+param+'" frameborder="0"></iframe></div>').appendTo(mgr.inserted.block);

    props.output.text('<script src="'+mgr.data[mgr.name]['bU']+base+param+'"></script>');
   }
   if(mgr.name=='form')
   {
    mgr.inserted.wrap=$('<iframe src="'+mgr.data[mgr.name]['bU']+'form.html?'+param+'" style="z-index:1;position:absolute;left:50%;top:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);" frameborder="0"></iframe>').appendTo(props.into);

    props.output.text('<div class="sovinformburo_form"></div>\n<script src="'+mgr.data[mgr.name]['bU']+base+param+'"></script>');
   }

   props.ext.attr('src',mgr.data[mgr.name]['u']?'http://'+mgr.data[mgr.name]['u']:'');
  },
  //set data from selects and their "change" event listeners
  setSelects:function(){
   //"type" select
   els.type.options.forEach(function(o,i){
    mgr.type.append('<option'+(i?'':' selected')+' value="'+o.value+'">'+o.text+'</option>');
    //set data object for each key (widget name)
    mgr.data[o.value]={bU:data.baseUrl};
   });

   mgr.type.on('change',function(){
    var s=mgr.type.children(':selected');

    //set active widget name, index and data for it
    mgr.name=s.val();
    mgr.index=s.index();
    mgr.data[mgr.name]['b_']=els.type.options[mgr.index]['base'];
    mgr.data[mgr.name]['uid_']=els.type.options[mgr.index]['uid'];

    mgr.selectChange(mgr.type);
   });

   //other selects
   mgr.sels.each(function(){
    var obj=$(this),
     d=obj.data(els.ctrls.data);

    els.sels[d.name].options.forEach(function(o,i){
     obj.append('<option'+(i?'':' selected')+' value="'+o.value+'">'+o.text+'</option>');
    });

    //set data from every select for every widget
    d.for.forEach(function(o1){
     mgr.data[o1][d.alias||d.name]=els.sels[d.name].options[0].value;
    });
   });

   mgr.sels.filter(function(){
    var d=$(this).data(els.ctrls.data);

    return ~data.ignore.indexOf(d.name);
   }).on('change',function(){
    var c=$(this).val().split(',');

    mgr.colorInps.each(function(i){
     $(this).spectrum('set',c[i]);
    });
   }).each(function(){
    $(this).trigger('change');
   });

   mgr.sels.on('change',function(){
    mgr.selectChange($(this));
   });

   //choose first widget
   mgr.type.trigger('change');
  },
  //set inputs event listeners
  setInputs:function(){
   mgr.inps.each(function(){
    var obj=$(this);

    obj.on('focus',function(){
     obj.removeClass(data.errCls);
    }).on('blur',function(){
     mgr.inputCheck(obj);
     mgr.setOutput();
    });
   });
  },
  //inputs validation
  inputCheck:function(obj){
   if(!(new RegExp(obj.data(els.ctrls.data).valid)).test($.trim(obj.val())))
   {
    obj.addClass(data.errCls);
    return false;
   }

   return true;
  },
  //depending on the name of select, do things
  selectChange:function(obj){
   var d=obj.data(els.ctrls.data);

   if(obj.is(mgr.type))
    props.blocks.css('display','none').filter('[data-type='+mgr.type.val()+']').css('display','block');else
    mgr.data[mgr.name][d.alias||d.name]=obj.val();

   mgr.setOutput();
  },
  //check data and load iframe
  setOutput:function(){
   var f=true;

   mgr.inps.each(function(){
    var obj=$(this),
     d=obj.data(els.ctrls.data);

    if(~d.for.indexOf(mgr.name))
    {
     if(!mgr.inputCheck(obj))
      f=false;else
      mgr.data[mgr.name][d.alias||d.name]=obj.val();
    }
   });

   if(f)
    mgr.render();
  }
 });

 //start
 mgr.init();
}));