const fs=require('fs');const f='vik-mortgage-dashboard.html';let s=fs.readFileSync(f,'utf8');
const o1=`      <button class="btn small danger" onclick="removeProspect('\${r.id}','\${p.id}')">Remove</button>`;
const n1=`      <div style="display:flex; gap:6px;"><button class="btn small" onclick="prospectToKeyPartner('\${r.id}','\${p.id}')">Key Partner</button><button class="btn small danger" onclick="removeProspect('\${r.id}','\${p.id}')">Remove</button></div>`;
if(s.indexOf(o1)<0){console.log('MISS 1');process.exit(1);}
s=s.replace(o1,n1);
const o2=`function removeProspect(recruitId, prospectId){
  const r = mortgageRecruits.find(x=>x.id===recruitId);
  if(!r) return;
  r.prospects = r.prospects.filter(p=>p.id!==prospectId);`;
const n2=`function prospectToKeyPartner(recruitId, prospectId){
  const r = mortgageRecruits.find(x=>x.id===recruitId);
  if(!r) return;
  const p = r.prospects.find(x=>x.id===prospectId);
  if(!p) return;
  const nm = (p.firstName+' '+p.lastName).trim();
  const dup = vikKeyPartners.find(k=>(k.email&&p.email&&k.email.toLowerCase()===p.email.toLowerCase())||(k.phone&&p.phone&&k.phone.replace(/\\D/g,'')===p.phone.replace(/\\D/g,'')));
  if(dup){ showToast(nm+' is already in Key Partners'); return; }
  if(!confirm('Add '+nm+' to your Key
cd ~/vik-widgets && cat > p1.js << 'EOF'
const fs=require('fs');const f='vik-mortgage-dashboard.html';let s=fs.readFileSync(f,'utf8');
const A="  r.prospects = r.prospects.filter(p=>p.id!==prospectId);";
const B="  const px = r.prospects.find(x=>x.id===prospectId);\n  if(px && !confirm('Remove '+(px.firstName+' '+px.lastName).trim()+' from this list?')) return;\n" + A;
if(s.indexOf(A)<0){console.log('MISS');process.exit(1);}
s=s.replace(A,B);fs.writeFileSync(f,s);console.log('ok');
