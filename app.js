// Config — edit these
const AMAZON_REGISTRY_URL = "https://www.amazon.com/baby-reg/raksha-patel-january-2027-boonton/315JG9NQI33SR";
const ADMIN_PASSWORD = "Swamiji0912"; // hosts only
const EVENT_DATE = new Date("2026-11-22T16:00:00-05:00");

// Registry is link-only — Amazon is source of truth (no mirror grid).
// See AMAZON_REGISTRY_URL above.

const store = {
  get(k, f){ try{ const v = localStorage.getItem(k); return v?JSON.parse(v):f; }catch{ return f; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

// Countdown
function tick(){
  const diff = EVENT_DATE - new Date();
  const el = (id,v)=>document.getElementById(id).textContent=v;
  if(diff<=0){ el("cd-d","0");el("cd-h","0");el("cd-m","0");el("cd-s","0"); return; }
  el("cd-d", Math.floor(diff/864e5));
  el("cd-h", Math.floor(diff/36e5)%24);
  el("cd-m", Math.floor(diff/6e4)%60);
  el("cd-s", Math.floor(diff/1e3)%60);
}
setInterval(tick,1000); tick();

// Amazon link
document.getElementById("amazon-full").href = AMAZON_REGISTRY_URL;

// Scroll reveal + confetti helpers (Cozy Paper)
function boom(opts){ try{ if(window.confetti) confetti(Object.assign({particleCount:90,spread:70,origin:{y:.7},colors:["#E07B2A","#F2A9B8","#8a9a5b","#ffd9a8"]},opts||{})); }catch{} }
document.querySelectorAll("main .card").forEach(c=>c.classList.add("reveal"));
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

function giftArt(i){
  const orange = i%2===0;
  const body = orange?"#E07B2A":"#F2A9B8", light = orange?"#f0a055":"#f8c3ce", dark = orange?"#c96a1e":"#dd8fa0";
  return `<svg class="gift-art" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="36" rx="22" ry="17" fill="${body}"/><ellipse cx="22" cy="36" rx="8" ry="15" fill="${light}"/><ellipse cx="42" cy="36" rx="8" ry="15" fill="${dark}"/><rect x="29" y="13" width="6" height="11" rx="3" fill="#6b8e4e"/></svg>`;
}

// RSVP
const form = document.getElementById("rsvp-form");
const done = document.getElementById("rsvp-done");
form.addEventListener("submit", e=>{
  e.preventDefault();
  const fd = new FormData(form);
  const r = Object.fromEntries(fd.entries());
  r.id = "r"+Date.now(); r.created_at = new Date().toISOString();
  r.adults = +r.adults||1; r.kids = +r.kids||0;
  const all = store.get("baby_rsvps",[]); all.push(r); store.set("baby_rsvps",all);
  // TODO production: also POST to Supabase (see README + supabase.sql)
  // fetch(SUPABASE_URL+"/rest/v1/rsvps",{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify(r)});
  form.classList.add("hidden"); done.classList.remove("hidden");
  boom({particleCount:140}); setTimeout(()=>boom({particleCount:60,origin:{y:.5}}),300);
  document.getElementById("rsvp-summary").textContent =
    `${r.name} • ${r.attending==="yes"?"Attending":"Can't make it"} • ${r.adults} adult(s), ${r.kids} kid(s)`;
  document.getElementById("rsvp-msg").textContent="";
  renderAdmin(false);
});
document.getElementById("rsvp-edit").onclick=()=>{ form.classList.remove("hidden"); done.classList.add("hidden"); };

// Keepsake wall — one combined guestbook: note + optional photo for baby girl.
function getNotes(){
  let notes = store.get("baby_notes", null);
  if(notes) return notes;
  // one-time migration from old split keys
  notes = [];
  store.get("baby_gb",[{gname:"Dhruvi Masi & Lina Masi",gtext:"Can't wait to meet our little pumpkin girl! 🎀"}])
    .forEach(m=>notes.push({gname:m.gname,gtext:m.gtext,src:null,at:m.at||new Date().toISOString()}));
  store.get("baby_photos",[]).forEach(p=>notes.push({gname:p.by||"Guest",gtext:p.note||"",src:p.src||null,at:p.at||new Date().toISOString()}));
  store.set("baby_notes",notes);
  return notes;
}
function renderGB(){
  const list = getNotes();
  const box = document.getElementById("gb-list"); box.innerHTML="";
  if(!list.length) box.innerHTML = `<div class="gb">Be the first to leave a note 💕</div>`;
  list.slice().reverse().forEach(m=>{
    const d=document.createElement("div"); d.className="gb keep-card";
    d.innerHTML = `${m.src?`<img src="${m.src}" alt="Keepsake photo" loading="lazy" />`:""}<p>${escapeHtml(m.gtext)}</p><b>${escapeHtml(m.gname)}</b>`;
    box.append(d);
  });
}
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
document.getElementById("gb-form").addEventListener("submit",e=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const file=fd.get("gphoto");
  const entry={gname:(fd.get("gname")||"Guest").toString().slice(0,40),gtext:(fd.get("gtext")||"").toString().slice(0,300),src:null,at:new Date().toISOString()};
  const save=()=>{ const all=getNotes(); all.push(entry); store.set("baby_notes",all.slice(-60)); e.target.reset(); renderGB(); boom({particleCount:40,spread:60}); };
  if(file && file.size){ const r=new FileReader(); r.onload=()=>{ entry.src=r.result; save(); }; r.readAsDataURL(file); }
  else save();
});
renderGB();

// Lightbox — tap any keepsake photo to view full size
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
function closeLb(){ lb.classList.add("hidden"); lbImg.src=""; }
document.getElementById("gb-list").addEventListener("click", e=>{
  const im = e.target.closest(".keep-card")?.querySelector("img");
  if(!im) return;
  lbImg.src = im.src; lb.classList.remove("hidden");
});
document.getElementById("lightbox-close").onclick = closeLb;
lb.addEventListener("click", e=>{ if(e.target===lb) closeLb(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeLb(); });

// Admin
let unlocked=false;
function renderAdmin(alertIfLocked=true){
  const all=store.get("baby_rsvps",[]);
  const yes=all.filter(r=>r.attending==="yes");
  const adults=yes.reduce((s,r)=>s+(+r.adults||1),0);
  const kids=yes.reduce((s,r)=>s+(+r.kids||0),0);
  document.getElementById("rsvp-stats").textContent =
    `${all.length} RSVPs • ${yes.length} attending • ${adults} adults • ${kids} kids`;
  const box=document.getElementById("admin-rsvps"); box.innerHTML="";
  if(!unlocked){ if(alertIfLocked) box.innerHTML='<p class="muted">Unlock to view guest list.</p>'; return; }
  if(!all.length) box.innerHTML='<p class="muted">No RSVPs yet — share your link!</p>';
  all.slice().reverse().forEach(r=>{
    const d=document.createElement("div"); d.className="rsvp-row";
    d.textContent=`${r.name} (${r.contact}) — ${r.attending} — ${r.adults}A/${r.kids}K ${r.message?"· “"+r.message+"”":""}`;
    box.append(d);
  });
}
document.getElementById("admin-login").onclick=()=>{
  const v=document.getElementById("admin-pass").value;
  if(v===ADMIN_PASSWORD){ unlocked=true; document.getElementById("admin-panel").classList.remove("hidden"); renderAdmin(); }
  else alert("Wrong password");
};
document.getElementById("export-csv").onclick=()=>{
  const all=store.get("baby_rsvps",[]);
  if(!all.length){ alert("No RSVPs yet"); return; }
  const cols=["name","contact","attending","adults","kids","message","created_at"];
  const csv=[cols.join(",")].concat(all.map(r=>cols.map(c=>`"${(r[c]??"").toString().replace(/"/g,'""')}"`).join(","))).join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="rsvps.csv"; a.click();
};
renderAdmin(false);
