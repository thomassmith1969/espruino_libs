const RestCall=require('modules/rest-call');
//const thing1=new RestCall('/asd',()=>{});
//const thing2=new RestCall('/asd2',()=>{})
//console.log(`new restcall:${ thing2._handler.calls}`);
//console.log(`new restcall:${ thing2._handler.handleRequest}`);


const call2=new RestCall('/com/<a>/<b>',(a,b)=>{return {a,b};})

const call = new RestCall("/api/<param1>/another_seg<param2>/<last_one>",(param1,param2,last_one)=>{
  //  console.log('method called.');
  //  console.log(`param1:${param1} param2:${param2} last_one:${last_one}`);
  return {size:1,val:'d'};
  });

  //console.log(` call:${JSON.stringify(call)}`);
  //console.log(call.canHandleRequest({url:'/api/2/another_seg8/last_param'}));
  //console.log(call.canHandleRequest({url:'/api/sfd/2/another_seg8/last_param'}));
  //call._handler.handleRequest({url:'/api/2/another_seg8/last_param'},{writeHead:(code)=>{},end:(val)=>{console.log(val);}});
  call._handler.handleRequest({url:'/com/r/q'},{writeHead:(code)=>{},end:(val)=>{console.log(val);}});

