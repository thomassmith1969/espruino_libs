const parent={calls:[],handleRequest:function(req,res){
 for (var i=0;i<parent.calls.length;i++)
  {
    const handler=parent.calls[i];
    const canHandle=handler.canHandleRequest(req);
    if(canHandle._status)
    {
      return handler.handleRequest(req,res);
    }
  }
  res.writeHead(404);
  res.end();
}};

function RestCall(path,func,mime){
  if(!path||!func)throw 'illegal rest initializer';
  this._path=path;
  this._mime=mime;
  if(this._mime==undefined)this._mime='application/json';
  this._func=func;
  this.params=[];
  this._regex='';
  this._lastSeg=this._path.charAt(this._path.length-1)=='>';//likely will usually be true
  if(path.charAt(0)=='<')throw ('Illegal path format');
  const segs = this._path.split('<');
  this._segments=[];
  this._segments.push(segs[0]);

  for (let i=0;i<segs.length;i++)
  {
    const seg=segs[i];
    const pair=seg.split('>');
    if(seg.charAt(0)=='>')
    {
      throw ('Illegal path format');
    }
    if(i>0){this.params.push(pair[0]);}
    if(pair.length==2&&pair[1].length>0)
    {
      this._segments.push(pair[1]);
    }
  }
  this.canHandleRequest=((request)=>{
    vals=[];
    let workingSeg=request.url;
    for(let i=0;i<this._segments.length;i++)
    {
      const seg=this._segments[i];
      const pos=workingSeg.lastIndexOf(seg);
      if (pos==-1)return {_status:false};
      let val=workingSeg.substr(0,pos);
      if(pos == 0)
      {
        val=undefined;
      }
      if(val&&val.indexOf('/')>0)return {_status:false};
      workingSeg=workingSeg.substr(pos+(seg.length));
      const paramIndex=i-1;
      if(paramIndex>=0)
      {
        vals[paramIndex]=val;
      }
    }
    if(this._lastSeg)
    {
      vals[this.params.length-1]=workingSeg;
    }
    else{
      if(workingSeg&&workingSeg.trim().length>0)
      {
        return{_status:false};
      }
    }
    return {_status:true,params:vals};
  }).bind(this);
  this.handleRequest=((request,response,contentType)=>{
    if(!contentType)contentType='application/json';
    const canHandle=this.canHandleRequest(request);
    if (!canHandle._status) throw 'Invalid request';
    try{
//      response.writeHead(200, {'Content-Type': this._mime});
this.request=request;
const params=JSON.parse(JSON.stringify((canHandle.params)?canHandle.params:[]));
const theRequest=request;
if(this.request&&this.request.read && this.request&&request.headers&&request.headers["Content-Type"]&&request.headers["Content-Type"] == 'application/json')
{
  if(request)
  var receivedData = request.read();
  try{
    theRequest['json'] = JSON.parse(receivedData)
    params.push(theRequest['json']);
  }
  catch(parseError){
  }
}
var proc=undefined;
switch (params.length)
{
  case 1:{
    proc=this._func(params[0]);
    break;
  }
  case 2:{
    proc=this._func(params[0],params[1]);
    break;
  }
  case 3:{
    proc=this._func(params[0],params[1],params[2]);
    break;
  }
  case 4:{
    proc=this._func(params[0],params[1],params[2],params[3]);
    break;
  }
  case 5:{
    proc=this._func(params[0],params[1],params[2],params[3],params[4]);
    break;
  }
  case 6:{
    proc=this._func(params[0],params[1],params[2],params[3],params[4],params[5]);
    break;
  }
  case 7:{
    proc=this._func(params[0],params[1],params[2],params[3],params[4],params[5],params[6]);
    break;
  }
  case 8:{
    proc=this._func(params[0],params[1],params[2],params[3],params[4],params[5],params[6],params[7]);
    break;
  }
  default:
{
  proc=this._func();
}
}
response.writeHead(200,{'Content-Type': this._mime});
if(this._mime=='application.JSON'|| (!(typeof proc === 'string' || proc instanceof String))){
  response.end(JSON.stringify(proc));
}
 else 
 if(proc instanceof StorageFile)
 {
  proc.pipe(response);
 }
  else {
    response.end(proc);
  }
    }
    catch(err)
    {
      console.log(`error:${err}`);
      try{
          response.writeHead(500);
          response.end(JSON.stringify({status:'error',msg:err}));
      }catch(respErr)
      {
        console.log(`error:${respErr}`);
      }
    }
  }).bind(this);
  return this;
}

module.exports=function(path,func,mime){
  const restCall=new RestCall(path,func,mime);
  restCall.handler=parent;
  restCall.handleRequest=restCall.handleRequest.bind(restCall);
  restCall.canHandleRequest=restCall.canHandleRequest.bind(restCall);
  parent.calls.push(restCall);
  return restCall;
}