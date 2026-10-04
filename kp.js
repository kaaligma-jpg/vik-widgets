const fs=require("fs");
const f="vik-mortgage-dashboard.html";
let s=fs.readFileSync(f,"utf8");
const start=s.indexOf(String.fromCharCode(60)+"div style=\"display:flex; gap:6px;\"><button class=\"btn small\" onclick=\"prospectToKeyPartner(");
if(start<0){console.log("MISS");process.exit(1);}
const endMark="Key Partner" + String.fromCharCode(60) + "/button>";
const end=s.indexOf(endMark,start)+endMark.length;
const OLD=s.substring(start,end);
const D=String.fromCharCode(36);
const Q=String.fromCharCode(96);
const NEW=String.fromCharCode(60)+"div style=\"display:flex; gap:6px; align-items:center;\">"+D+"{p.inKeyPartners ? "+Q+String.fromCharCode(60)+"span class=\\"note-meta\\" style=\\"color:#2e7d32;\\">Added in KP"+String.fromCharCode(60)+"/span>"+Q+" : "+Q+OLD.substring(OLD.indexOf(String.fromCharCode(60)+"button"))+Q+"}";
s=s.replace(OLD,NEW);
fs.writeFileSync(f,s);console.log("ok2");
