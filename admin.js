// Host-only page. Data protected by Supabase RLS (authenticated read only).
// Hiding this URL is tidiness — RLS is the real security.
const SUPABASE_URL = "https://xuspoyamjsggryhoiyim.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3BveWFtanNnZ3J5aG9peWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTU4MTIsImV4cCI6MjEwNDAzMTgxMn0.Tl70JJ7m7RRPIPq9z8loRMTQO6ETX82Vzxnd_fL0Fv0";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let cloudRsvps = [];

function paintAdmin(list){
  const yes=list.filter(r=>r.attending==="yes");
  const adults=yes.reduce((s,r)=>s+(+r.adults||1),0);
  const kids=yes.reduce((s,r)=>s+(+r.kids||0),0);
  document.getElementById("rsvp-stats").textContent =
    `${list.length} RSVPs • ${yes.length} attending • ${adults} adults • ${kids} kids`;
  const box=document.getElementById("admin-rsvps"); box.innerHTML="";
  if(!list.length) box.innerHTML='<p class="muted">No RSVPs yet — share your link!</p>';
  list.slice().reverse().forEach(r=>{
    const d=document.createElement("div"); d.className="rsvp-row";
    d.textContent=`${r.name} (${r.contact}) — ${r.attending} — ${r.adults}A/${r.kids}K ${r.message?"· “"+r.message+"”":""}`;
    box.append(d);
  });
}
function setHostUI(on, email){
  document.getElementById("admin-panel").classList.toggle("hidden", !on);
  document.getElementById("export-csv").classList.toggle("hidden", !on);
  document.getElementById("host-logout").classList.toggle("hidden", !on);
  document.getElementById("host-status").textContent = on ? `Logged in as ${email}.` : "Log in with your email to view the guest list.";
}
async function refreshAdmin(){
  try{
    const {data, error} = await sb.from("rsvps").select("*").order("created_at",{ascending:false}).limit(500);
    if(error) throw error;
    cloudRsvps = data||[];
    paintAdmin(cloudRsvps);
  }catch(err){ document.getElementById("host-status").textContent="Fetch failed: "+err.message; }
}
document.getElementById("host-login").onclick=async ()=>{
  const email=document.getElementById("host-email").value.trim();
  const status=document.getElementById("host-status");
  if(!email || !email.includes("@")){ status.textContent="Enter your email first."; return; }
  const {error}=await sb.auth.signInWithOtp({email, options:{emailRedirectTo:location.href}});
  status.textContent = error ? "Login failed: "+error.message : "Check your email for the login link, then reopen this page.";
};
document.getElementById("host-logout").onclick=async ()=>{ await sb.auth.signOut(); setHostUI(false); };
document.getElementById("export-csv").onclick=()=>{
  if(!cloudRsvps.length){ alert("No RSVPs yet"); return; }
  const cols=["name","contact","attending","adults","kids","message","created_at"];
  const csv=[cols.join(",")].concat(cloudRsvps.map(r=>cols.map(c=>`"${(r[c]??"").toString().replace(/"/g,'""')}"`).join(","))).join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="rsvps.csv"; a.click();
};
(async ()=>{
  const {data:{session}} = await sb.auth.getSession();
  if(session){ setHostUI(true, session.user.email); refreshAdmin(); }
})();
sb.auth.onAuthStateChange((_ev, session)=>{ if(session){ setHostUI(true, session.user.email); refreshAdmin(); } });
