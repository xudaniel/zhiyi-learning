import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
// Evaluate only version-controlled course definitions, never user input.
const context=vm.createContext({SOURCES:JSON.parse(read('src/sources.json')),stems:[],branches:[]});
vm.runInContext(read('src/academy-core.js')+'\n'+read('src/mastery-core.js')+'\nthis.registry=Object.entries(EVIDENCE).map(([id,e])=>({id,title:e.title,location:e.location,kind:e.kind,text:evidenceText(id),condition:KNOWLEDGE.find(n=>n.id===id)?.condition||""}));',context);
export const corpus=JSON.parse(JSON.stringify(context.registry));
export const units=JSON.parse(read('src/curriculum.json'));
