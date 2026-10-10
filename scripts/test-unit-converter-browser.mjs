import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root=path.resolve('site/public-route-patch');
const fixture=String.raw`<script>
window.addEventListener('load',()=>setTimeout(()=>{
 const errors=[];
 const $=id=>document.getElementById(id);
 const input=(id,value)=>{const node=$(id);node.value=value;node.dispatchEvent(new Event('input',{bubbles:true}))};
 const near=(actual,expected,tolerance,label)=>{if(!Number.isFinite(+actual)||Math.abs(+actual-expected)>tolerance)errors.push(label+': expected '+expected+', got '+actual)};
 try{
  input('c','25');near($('f').value,77,1e-8,'Celsius -> Fahrenheit');
  input('liters','10');near($('gallons').value,2.6417205236,1e-8,'Liters -> US gallons');
  input('c','');if($('f').value!=='')errors.push('Blank temperature must blank paired output');
  input('c','-274');if($('f').value!=='')errors.push('Below absolute zero must blank paired output');
  input('c','25');input('liters','-1');if($('gallons').value!=='')errors.push('Negative volume must blank paired output');
  input('liters','10');if(!document.querySelector('[aria-live]'))errors.push('Missing status announcement');
  if(!document.querySelector('svg[role="img"] title'))errors.push('Missing accessible instructional diagram');
 }catch(error){errors.push(error.message)}
 const node=document.createElement('output');node.id='smoke-test-result';node.textContent=errors.length?'FAIL: '+errors.join(' | '):'PASS: unit converter browser interactions';document.body.append(node);
},800));
</script>`;
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
const server=createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
 if(pathname==='/unit-converter/')pathname='/unit-converter/index.html';
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 try{
  let body=readFileSync(file);
  if(pathname==='/unit-converter/index.html')body=Buffer.from(body.toString().replace('</body>',fixture+'</body>'));
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(body)
 }catch{res.writeHead(404).end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const chrome=process.env.CHROME_BIN||'google-chrome';
try{
 const html=execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--virtual-time-budget=5000','--dump-dom','http://127.0.0.1:'+port+'/unit-converter/'],{encoding:'utf8',timeout:25000,stdio:['ignore','pipe','pipe']});
 assert.match(html,/PASS: unit converter browser interactions/,'Browser smoke assertions failed or did not complete');
 console.log('Headless Chrome Unit Converter smoke test passed.');
}finally{server.close()}
