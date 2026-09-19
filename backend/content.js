"use strict";
const packs=[
  {id:"core-curriculum",title:"A1–C2 Core Curriculum",version:"14.0.2",required:true,kind:"core"},
  {id:"dictionary",title:"Internal Dictionary",version:"14.0.2",required:true,kind:"language"},
  {id:"migration",title:"Migration & Administration",version:"14.0.2",required:false,kind:"track"},
  {id:"career",title:"Career German",version:"14.0.2",required:false,kind:"track"},
  {id:"university",title:"University German",version:"14.0.2",required:false,kind:"track"},
  {id:"exams",title:"Goethe · telc · TestDaF · ÖSD",version:"14.0.2",required:false,kind:"exam"},
  {id:"human-audio",title:"Licensed Human Audio",version:"14.0.2",required:false,kind:"audio"},
  {id:"classroom",title:"Classroom Pro",version:"14.0.2",required:false,kind:"product"}
];
const manifest={format:"ghazal-content-manifest-v2",appVersion:"14.0.2",schema:2,generatedAt:"2026-09-20T00:00:00Z",packs};
function getPack(id){const p=packs.find(x=>x.id===id);return p?{format:"ghazal-server-pack-v1",...p,delivery:"bundled-client",downloadRequired:false}:null;}
module.exports={packs,manifest,getPack};
