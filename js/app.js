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
  inserted:null,
  init:function(){
   //set all used DOM items
   props=mgr.props;
   props.blocks=$(els.blocks.items);

   props.into=$(els.dest.into);
   props.ext=$(els.dest.external);
   props.output=$(els.output);

   mgr.inps.filter(function(){
    return $(this).data(els.ctrls.data).color;
   }).spectrum({
    color:this.value,
    showInput:true,
    preferredFormat:"hex",
    change:function(){
     mgr.setOutput();
    }
   });

   mgr.setSelects();
   mgr.setInputs();
  },
  //render data
  render:function(){
   var script,
    base=mgr.data[mgr.name]['b_'],
    d,
    param;

   d=$.extend({},mgr.data[mgr.name]);
   delete d['u'];
   delete d['b_'];
   param=$.param(d);

   if(mgr.inserted)
    mgr.inserted.remove();

   if(mgr.name=='chat')
   {
    props.output.text('<script src="'+mgr.data[mgr.name]['bU']+base+param+'"></script>');
   }
   if(mgr.name=='form')
   {
    mgr.inserted=$('<div style="position:absolute;z-index:1;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.5);" />\
    <iframe src="'+mgr.data[mgr.name]['bU']+'form.html?'+param+'" style="width:600px;height:440px;display:block;z-index:1;position:absolute;left:50%;top:50%;margin:-220px 0 0 -300px;" frameborder="0"></iframe>').appendTo(props.into);

    props.output.text('<div class="sovinformburo_iframe"></div>\n<script src="'+mgr.data[mgr.name]['bU']+base+param+'"></script>');
   }

   props.ext.attr('src',mgr.data[mgr.name]['u']);
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

    obj.on('change',function(){
     mgr.selectChange(obj);
    });
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