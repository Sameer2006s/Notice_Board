/* script.js */
(function () {
  'use strict';

  const PASSWORD = "campus123";
  const STORAGE_KEY = "notices_secure_v2";


  let unlockBtn, lockBtn, addCard, addForm, addBtn, listEl;
  let pwdModal, pwdInput, pwdSubmit, pwdCancel, pwdErr;

  function $(id){ return document.getElementById(id); }

  function getData(){
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      console.warn("Corrupt storage, resetting.", e);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
  function setData(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }
  function sanitizeInput(str){
    return String(str || "").trim();
  }

  function render(){
    const arr = getData();
    listEl.innerHTML = "";
    if(arr.length === 0){
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent = "No notices yet.";
      listEl.appendChild(p);
      return;
    }

    arr.slice().reverse().forEach(function(n, idx){
      const item = document.createElement("div");
      item.className = "item";
      if(idx === 0) item.setAttribute("data-idx","new");

      const main = document.createElement("div");
      main.className = "item-main";

      const title = document.createElement("span");
      title.className = "item-title";
      title.textContent = n.title || "";

      const date = document.createElement("div");
      date.className = "item-date";
      date.textContent = n.date || "";

      const text = document.createElement("div");
      text.className = "item-text";
      text.textContent = n.text || "";

      main.appendChild(title);
      main.appendChild(date);
      main.appendChild(text);

      const actions = document.createElement("div");
      actions.className = "item-actions";
      const del = document.createElement("button");
      del.className = "btn delete";
      del.type = "button";
      del.textContent = "Delete";

      // compute real index in original array (not reversed)
      const realIndex = arr.length - 1 - idx;
      del.setAttribute("data-i", String(realIndex));

      actions.appendChild(del);
      item.appendChild(main);
      item.appendChild(actions);
      listEl.appendChild(item);
    });
  }

  function ensureWelcome(){
    if(!localStorage.getItem(STORAGE_KEY)){
      setData([{title:"Welcome", text:"Add your first notice. (No password needed to view notices.)", date: new Date().toLocaleString()}]);
    }
  }

  function openModal(){
    pwdErr.hidden = true;
    pwdInput.value = "";
    pwdModal.setAttribute("aria-hidden","false");
    pwdInput.focus();
  }
  function closeModal(){
    pwdModal.setAttribute("aria-hidden","true");
    pwdInput.value = "";
    pwdErr.hidden = true;
  }

  function initEvents(){
    unlockBtn.addEventListener("click", openModal);
    pwdCancel.addEventListener("click", closeModal);

    pwdSubmit.addEventListener("click", function(){
      const v = pwdInput.value || "";
      if(v === PASSWORD){
        addCard.classList.remove("locked");
        addCard.setAttribute("aria-hidden","false");
        closeModal();
        const titleEl = $("ntitle");
        if(titleEl) titleEl.focus();
        unlockBtn.textContent = "Unlocked ✓";
        unlockBtn.disabled = true;
        unlockBtn.classList.add("disabled");
      } else {
        pwdErr.hidden = false;
        pwdErr.textContent = "Invalid password — try again.";
        pwdInput.focus();
      }
    });

    pwdInput.addEventListener("keypress", function(e){
      if(e.key === "Enter") pwdSubmit.click();
    });

    lockBtn.addEventListener("click", function(){
      addCard.classList.add("locked");
      addCard.setAttribute("aria-hidden","true");
      unlockBtn.textContent = "Unlock Add Notice";
      unlockBtn.disabled = false;
      unlockBtn.classList.remove("disabled");
    });

    addBtn.addEventListener("click", function(){
      if(addCard.classList.contains("locked")){
        openModal();
        return;
      }
      const tEl = $("ntitle");
      const xEl = $("ntext");
      const title = sanitizeInput(tEl.value);
      const text  = sanitizeInput(xEl.value);
      if(!title || !text){
        alert("Fill title and content");
        return;
      }
      const arr = getData();
      arr.push({title: title, text: text, date: new Date().toLocaleString()});
      setData(arr);
      tEl.value = ""; xEl.value = "";
      render();
      tEl.focus();
    });

    listEl.addEventListener("click", function(e){
      const btn = e.target.closest("button[data-i]");
      if(!btn) return;
      const i = parseInt(btn.getAttribute("data-i"), 10);
      if(Number.isNaN(i)) return;
      const arr = getData();
      if(i >= 0 && i < arr.length){
        if(confirm("Delete this notice?")) {
          arr.splice(i,1);
          setData(arr);
          render();
        }
      }
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape"){
        if(pwdModal.getAttribute("aria-hidden") === "false") closeModal();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    // init refs
    unlockBtn = $("unlockBtn");
    lockBtn   = $("lockBtn");
    addCard   = $("addCard");
    addForm   = $("addForm");
    addBtn    = $("addBtn");
    listEl    = $("list");

    pwdModal  = $("pwdModal");
    pwdInput  = $("pwdInput");
    pwdSubmit = $("pwdSubmit");
    pwdCancel = $("pwdCancel");
    pwdErr    = $("pwdErr");

    ensureWelcome();
    render();
    initEvents();
  });

})();
