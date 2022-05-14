const storage=require('Storage');
const wifi = require('Wifi');
const http=require("http");
const RestRelax=require('rest-relax');

const indFile=storage.open('index.html','r');
const root=new RestRelax("/",indFile);

const styles=new RestRelax('/styles.27.css',storage.open('styles.27.css','r'));
const runtime=new RestRelax('/runtime.27.js',storage.open('runtime.27.js','r'));
const polyfills=new RestRelax('/polyfills.27.js',storage.open('polyfills.27.js','r'));
const main=new RestRelax('/main.27.js',storage.open('main.27.js','r'));
const favicon=new RestRelax('/favicon.ico',storage.open('favicon.ico','r'));
const testHTML=new RestRelax("/index.html",()=>{
  return storage.open('index.html','r');},'text/html');

const servo1={pos:50};
const digitalReadWrite=new RestRelax('/dio/pin/<pin>',(pin,json)=>{
    console.log(`processing:${JSON.stringify(json)}`);
  const thePin=Pin(pin);
  if(!thePin)return {exception:'undefined pin'};
  if(json)
  {
    val=Boolean(json.value);
    console.log(`processing:${val}`);
  thePin.write(val);
  }
  return { pin:pin,value:thePin.read()};
});
const holder=new RestRelax('/servo1/<pos>/set',(pos,json)=>{
  servo1.pos=pos;return servo1;});
holder2=new RestRelax('/servo1',()=>{return servo1;});


new RestRelax('/gimbal/<x>/<y>',(x,y)=>{
  console.log(`positioning to ${x},${y}`);
  return {x:x,y:y};
});

function onInit(){
  if("connected"==wifi.getDetails().status)
  {
    startServer();
  }
  else
  {
    wifi.connect('<<SSID>>',{password:'<<WPA2>>'},(server)=>{
    startServer();
  });
  }
}
function startServer() {

  console.log(`connected as ${wifi.getIP().ip}`);
 
const server = require('ws').createServer(root.globalHandler);
  server.listen(80);

  server.on("websocket", function(ws) {
    ws.on('message',function(msg) { print("[WS] "+JSON.stringify(msg)); });
    ws.send("Hello from Espruino!");
});
  
server.on('message', function(msg) {
  console.log("MSG: " + msg);
});
  
server.on('rawData', function(msg) {
  console.log("RAW: " + msg);
});




