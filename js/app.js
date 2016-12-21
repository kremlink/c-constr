(function(factory){
  factory(jQuery,formConstructor);
}(function($,mgr){
 'use strict';

 var els,data,props;

 if(!mgr)
 {
  mgr={};
 }

 //set some vars for convenience
 els=mgr.config.elements;
 data=mgr.config.data;
 props=mgr.props={};

 //set app object
 $.extend(mgr,{
  index:-1,
  name:null,
  data:{},
  fullSels:[],
  fullInps:[],
  init:function(){
   //set all used DOM items
   props.url=$(els.url.item);
   props.type=$(els.type.item);
   props.blocks=$(els.blocks.items);
   props.position=$(els.position.item);
   props.way=$(els.way.item);
   props.shift=$(els.shift.item);
   props.color=$(els.color.item);
   props.name=$(els.name.item);
   props.job=$(els.job.item);
   props.h=$(els.h.item);
   props.subh=$(els.subh.item);
   props.photo=$(els.photo.item);
   props.photo1=$(els.photo1.item);
   props.into=$(els.dest.into);
   props.output=$(els.output);

   //fill mgr.fullSels and mgr.fullInps arrays with unique combined values from arrays in options in "type" select
   els[data.choose].options.forEach(function(o){
    o.selElems.forEach(function(o1){
     if(!~mgr.fullSels.indexOf(o1))
      mgr.fullSels.push(o1);
    });

    o.inpElems.forEach(function(o1){
     if(!~mgr.fullInps.indexOf(o1))
      mgr.fullInps.push(o1);
    });
   });

   mgr.setIframe();
   mgr.setSelects();
   mgr.setInputs();
  },
  //add data into frame and in output block
  setIframe:function(){
   props.into.on('load',function(){
    var script,
     base=mgr.data[mgr.name]['base_'],
     iframe=mgr.data[mgr.name]['iframe_'],
     d,
     json;

    d=$.extend({},mgr.data[mgr.name]);
    delete d.url;
    json=JSON.stringify(d);

    if(iframe!=undefined)
    {
     props.into.contents().find('body')
      .append('<div style="position:fixed;z-index:1;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.5);" />')
      .append('<iframe src="'+iframe+encodeURIComponent(json)+'" style="width:600px;height:440px;display:block;z-index:1;position:absolute;left:50%;top:50%;margin:-220px 0 0 -300px;" frameborder="0"></iframe>');

     props.output.text('<div class="sovinformburo_iframe"></div>\n<script src="'+base+encodeURIComponent(json)+'"></script>');
    }else
    {
     script=props.into.contents()[0].createElement("script");
     script.type="text/javascript";
     script.src=base+json;
     props.into[0].contentWindow.document.body.appendChild(script);

     props.output.text('<script src="'+base+encodeURIComponent(json)+'"></script>');
    }

    props.into.contents().find(els.dest.external).attr('src',mgr.data[mgr.name]['url']);
   });
  },
  //return array of widget names where "name" is in selElems array
  getName:function(name){
   var arr=[];

   els[data.choose].options.forEach(function(o){
    if(~o.selElems.indexOf(name))
     arr.push(o.value);
   });

   return arr;
  },
  //set data from selects and their "change" event listeners
  setSelects:function(){
   //"type" select
   els[data.choose].options.forEach(function(o,i){
    props[data.choose].append('<option'+(i?'':' selected')+' value="'+o.value+'">'+o.text+'</option>');
    //set data object for each key (widget name)
    mgr.data[o.value]={baseUrl:data.baseUrl};
   });

   props[data.choose].on('change',function(){
    var s=props[data.choose].children(':selected');

    //set active widget name, index and data for it
    mgr.name=s.val();
    mgr.index=s.index();
    mgr.data[mgr.name]['base_']=els[data.choose].options[mgr.index].base;
    mgr.data[mgr.name]['iframe_']=els[data.choose].options[mgr.index].iframe;
    mgr.data[mgr.name]['userid_']=els[data.choose].options[mgr.index].userid;

    mgr.selectChange({name:data.choose});
   });
   //other selects
   mgr.fullSels.forEach(function(o){
    els[o].options.forEach(function(o1,i){
     props[o].append('<option'+(i?'':' selected')+' value="'+o1.value+'">'+o1.text+'</option>');

     //set data from every select for every widget (mgr.data[o2])
     if(!i)
     {
      mgr.getName(o).forEach(function(o2){
       mgr.data[o2][o]=o1.value;
      });
     }
    });

    props[o].on('change',function(){
     mgr.selectChange({name:o});
    });
   });

   //choose first widget
   props[data.choose].trigger('change');
  },
  //set inputs event listeners
  setInputs:function(){
   mgr.fullInps.forEach(function(o){
    props[o].on('focus',function(){
     props[o].removeClass(data.errCls);
    }).on('blur',function(){
     mgr.inputCheck(o);
     mgr.setOutput();
    });
   });
  },
  //inputs validation
  inputCheck:function(o){
   if(!(new RegExp(els[o].valid)).test($.trim(props[o].val())))
   {
    props[o].addClass(data.errCls);
    return false;
   }

   return true;
  },
  //depending on the name of select, do things
  selectChange:function(o){
   if(o.name=='type')
    props.blocks.css('display','none').filter('[data-type='+props[o.name].val()+']').css('display','block');else
    mgr.data[mgr.name][o.name]=props[o.name].val();

   mgr.setOutput();
  },
  //check data and load iframe
  setOutput:function(){
   var f=true;

   mgr.fullInps.forEach(function(o){
    if(~els['type'].options[mgr.index].inpElems.indexOf(o))
    {
     if(!mgr.inputCheck(o))
      f=false;else
      mgr.data[mgr.name][o]=props[o].val();
    }
   });

   if(f)
    props.into.attr('src',data.src);
  }
 });

 //start
 mgr.init();
}));