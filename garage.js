const $=id=>document.getElementById(id);
const KEY="myGarage.v1";
let cars=JSON.parse(localStorage.getItem(KEY)||"[]");
function money(n){return new Intl.NumberFormat("uk-UA").format(n||0)+" ₴"}
function save(){localStorage.setItem(KEY,JSON.stringify(cars));render()}
function render(){
  $("carCount").textContent=cars.length;
  $("totalCost").textContent=money(cars.reduce((s,c)=>s+(c.works||[]).reduce((a,w)=>a+(+w.cost||0),0),0));
  $("cars").innerHTML=cars.map(c=>`<article class="car" data-id="${c.id}"><div class="car-head"><div><div class="eyebrow">${c.owner||"ВЛАСНИК"}</div><h2>${c.name}</h2><span class="muted">${[c.year,c.engine,c.gearbox].filter(Boolean).join(" · ")}</span></div><span class="badge">${(c.works||[]).length} роб.</span></div><div class="mileage">${new Intl.NumberFormat("uk-UA").format(c.mileage||0)} <small>км</small></div><span class="muted">поточний пробіг</span><div class="stats"><span>Витрати<br><b>${money((c.works||[]).reduce((s,w)=>s+(+w.cost||0),0))}</b></span><span>Остання робота<br><b>${c.works?.length?new Intl.NumberFormat("uk-UA").format(Math.max(...c.works.map(w=>+w.mileage||0)))+" км":"—"}</b></span></div></article>`).join("");
  $("empty").classList.toggle("hidden",cars.length>0);
  document.querySelectorAll(".car").forEach(x=>x.onclick=()=>view(x.dataset.id));
}
function view(id){const c=cars.find(x=>x.id===id);$("carView").innerHTML=`<div class="eyebrow">${c.owner||"ВЛАСНИК"}</div><h2>${c.name}</h2><div class="mileage">${new Intl.NumberFormat("uk-UA").format(c.mileage||0)} км</div><p class="muted">${[c.year,c.engine,c.gearbox].filter(Boolean).join(" · ")}</p><h3>Історія робіт</h3><div class="history">${(c.works||[]).sort((a,b)=>(b.mileage||0)-(a.mileage||0)).map(w=>`<div class="work"><b>${w.title}</b><span class="muted">${w.date||""} · ${new Intl.NumberFormat("uk-UA").format(w.mileage||0)} км</span><br>${w.cost?money(w.cost):""} ${w.note||""}</div>`).join("")||'<p class="muted">Поки немає записів.</p>'}</div>`;$("carViewDialog").showModal()}
$("addCar").onclick=$("addCarEmpty").onclick=()=>$("carDialog").showModal();
$("closeCar").onclick=()=>$("carDialog").close();
$("closeView").onclick=()=>$("carViewDialog").close();
$("carForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);cars.push({id:crypto.randomUUID(),name:f.get("name"),year:f.get("year"),mileage:+f.get("mileage")||0,engine:f.get("engine"),gearbox:f.get("gearbox"),owner:f.get("owner"),works:[]});save();e.target.reset();$("carDialog").close()};
render();