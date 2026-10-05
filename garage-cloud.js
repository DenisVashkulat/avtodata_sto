(() => {
  const REPO = "DenisVashkulat/avtodata_sto";
  const BRANCH = "main";
  const PATH = "garage-data.enc";
  const KEY = "myGarage.v1";
  const $ = id => document.getElementById(id);

  function status(msg, error=false) {
    const el = $("syncStatus");
    if (el) { el.textContent = msg; el.className = "sync-status" + (error ? " error" : ""); }
  }

  function b64(bytes) {
    let s = "";
    const a = new Uint8Array(bytes);
    for (let i=0;i<a.length;i+=0x8000) s += String.fromCharCode(...a.subarray(i,i+0x8000));
    return btoa(s);
  }
  function unb64(s) {
    const bin = atob(s), a = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i);
    return a;
  }

  async function derive(password, salt) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      {name:"PBKDF2",salt,iterations:120000,hash:"SHA-256"},
      base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]
    );
  }

  async function encrypt(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await derive(password,salt);
    const plain = new TextEncoder().encode(JSON.stringify(data));
    const cipher = await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plain);
    return JSON.stringify({v:1,salt:b64(salt),iv:b64(iv),data:b64(cipher)});
  }

  async function decrypt(payload, password) {
    const o = JSON.parse(payload);
    if (o.v !== 1) throw new Error("Невідома версія файлу");
    const key = await derive(password,unb64(o.salt));
    const plain = await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(o.iv)},key,unb64(o.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }

  async function gh(path, options={}, token) {
    const r = await fetch("https://api.github.com/repos/"+REPO+"/contents/"+path, {
      ...options,
      headers: {
        "Accept":"application/vnd.github+json",
        "Authorization":"Bearer "+token,
        "X-GitHub-Api-Version":"2022-11-28",
        ...(options.headers||{})
      }
    });
    if (!r.ok) {
      let msg = r.status+" "+r.statusText;
      try { const j=await r.json(); if(j.message) msg += ": "+j.message; } catch {}
      const e=new Error(msg); e.status=r.status; throw e;
    }
    return r.json();
  }

  async function upload() {
    const token=$("ghToken").value.trim(), password=$("ghPassword").value;
    if(!token || !password) return status("Введи token і пароль.",true);
    try {
      status("Шифрую та зберігаю…");
      const cars=JSON.parse(localStorage.getItem(KEY)||"[]");
      const content=await encrypt(cars,password);
      let existing=null;
      try { existing=await gh(PATH,{},token); } catch(e) { if(e.status!==404) throw e; }
      const body={message:"Update My Garage data",content:btoa(unescape(encodeURIComponent(content))),branch:BRANCH};
      if(existing?.sha) body.sha=existing.sha;
      await gh(PATH,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)},token);
      status("✓ Дані збережено в GitHub.");
    } catch(e) {
      status("Помилка: "+e.message,true);
    }
  }

  async function download() {
    const token=$("ghToken").value.trim(), password=$("ghPassword").value;
    if(!token || !password) return status("Введи token і пароль.",true);
    try {
      status("Завантажую з GitHub…");
      const file=await gh(PATH,{},token);
      const content=decodeURIComponent(escape(atob(file.content.replace(/\n/g,""))));
      const cars=await decrypt(content,password);
      if(!Array.isArray(cars)) throw new Error("Неправильний формат даних");
      localStorage.setItem(KEY,JSON.stringify(cars));
      status("✓ Дані завантажено. Оновлюю гараж…");
      setTimeout(()=>location.reload(),500);
    } catch(e) {
      status(e.status===404 ? "Файл даних ще не створений. Спочатку натисни «Зберегти в GitHub»." : "Помилка: "+e.message,true);
    }
  }

  $("syncGithub").onclick=()=>{$("syncDialog").showModal();status("")};
  $("closeSync").onclick=()=>{$("syncDialog").close()};
  $("uploadGithub").onclick=upload;
  $("downloadGithub").onclick=download;
})();