// ======================
// DATOS
// ======================

const marcas = [
"Yamaha","Honda","Kawasaki","Suzuki",
"BMW Motorrad","Ducati","KTM",
"Harley-Davidson","Royal Enfield","Triumph"
];

const segmentos = {
"J":"Joven 18–25",
"A":"Adulto 26–40",
"E":"Experto",
"U":"Uso urbano",
"R":"Uso carretera"
};

const contextos = {
"V":"¿Cuál prefieres para VELOCIDAD?",
"E":"¿Cuál elegirías por ECONOMÍA?",
"C":"¿Cuál transmite más CONFIANZA?",
"D":"¿Cuál se ve más DEPORTIVA?"
};

// ======================
// CONFIGURACIÓN ELO
// ======================

const RATING_INICIAL = 1000;
const K = 32;
const STORAGE_KEY = "motomash_github_v1";

function defaultState(){
  const buckets = {};
  for(const s in segmentos){
    for(const c in contextos){
      const key = s+"__"+c;
      buckets[key]={};
      marcas.forEach(m=>buckets[key][m]=RATING_INICIAL);
    }
  }
  return {buckets};
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();

function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}

function expected(ra,rb){
  return 1/(1+Math.pow(10,(rb-ra)/400));
}

function updateElo(bucket,a,b,winner){
  const ra=bucket[a], rb=bucket[b];
  const ea=expected(ra,rb);
  const eb=expected(rb,ra);

  const sa=(winner==="A")?1:0;
  const sb=(winner==="B")?1:0;

  bucket[a]=ra+K*(sa-ea);
  bucket[b]=rb+K*(sb-eb);
}

function randomPair(){
  const a=marcas[Math.floor(Math.random()*marcas.length)];
  let b=a;
  while(b===a){
    b=marcas[Math.floor(Math.random()*marcas.length)];
  }
  return [a,b];
}

function bucketKey(s,c){ return s+"__"+c; }

function top10(bucket){
  return Object.entries(bucket)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10);
}

// ======================
// UI
// ======================

const segmentSelect=document.getElementById("segmentSelect");
const contextSelect=document.getElementById("contextSelect");
const question=document.getElementById("question");
const labelA=document.getElementById("labelA");
const labelB=document.getElementById("labelB");
const topBox=document.getElementById("topBox");

let currentA=null;
let currentB=null;

function fillSelect(select,obj){
  for(const k in obj){
    const opt=document.createElement("option");
    opt.value=k;
    opt.textContent=k+" — "+obj[k];
    select.appendChild(opt);
  }
}

fillSelect(segmentSelect,segmentos);
fillSelect(contextSelect,contextos);

segmentSelect.value="J";
contextSelect.value="V";

function newDuel(){
  [currentA,currentB]=randomPair();
  labelA.textContent=currentA;
  labelB.textContent=currentB;
  question.textContent=contextos[contextSelect.value];
}

function renderTop(){
  const key=bucketKey(segmentSelect.value,contextSelect.value);
  const bucket=state.buckets[key];
  const ranking=top10(bucket);

  topBox.innerHTML=ranking.map((r,i)=>`
    <div class="toprow">
      <div><b>${i+1}.</b> ${r[0]}</div>
      <div>${r[1].toFixed(1)}</div>
    </div>
  `).join("");
}

function vote(winner){
  const key=bucketKey(segmentSelect.value,contextSelect.value);
  const bucket=state.buckets[key];
  updateElo(bucket,currentA,currentB,winner);
  save();
  renderTop();
  newDuel();
}

document.getElementById("btnA").onclick=()=>vote("A");
document.getElementById("btnB").onclick=()=>vote("B");
document.getElementById("btnNewPair").onclick=newDuel;
document.getElementById("btnShowTop").onclick=renderTop;

document.getElementById("btnReset").onclick=()=>{
  if(confirm("¿Borrar ranking?")){
    state=defaultState();
    save();
    renderTop();
    newDuel();
  }
};

newDuel();
renderTop();
