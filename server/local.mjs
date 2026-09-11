import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {createTutorHandler} from './tutor-handler.mjs';
const handler=createTutorHandler();
const server=createServer(async(req,res)=>{try{if(req.url!=='/api/tutor'){res.writeHead(404).end();return;}const request=new Request('http://localhost/api/tutor',{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})});const response=await handler(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500,{'Content-Type':'application/json'}).end('{"error":"service"}');}});
server.listen(Number(process.env.PORT||8788),'127.0.0.1',()=>console.log('Course tutor server ready on local port. Developer Daniel Xu.'));
