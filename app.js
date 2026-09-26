// ---- UI layer: wires DOM to Engine + MOVIES/MOODS ----
let activeGenres = new Set();
let activeMoodId = null;
let liked = new Set(JSON.parse(localStorage.getItem('mr_liked') || '[]'));
let query = "";

const els = {
  moodRow: document.getElementById('moodRow'),
  genreRow: document.getElementById('genreRow'),
  mainGrid: document.getElementById('mainGrid'),
  forYouSection: document.getElementById('forYouSection'),
  forYouGrid: document.getElementById('forYouGrid'),
  forYouSub: document.getElementById('forYouSub'),
  countSub: document.getElementById('countSub'),
  emptyMsg: document.getElementById('emptyMsg'),
  statLine: document.getElementById('statLine'),
  overlay: document.getElementById('overlay'),
  modalBody: document.getElementById('modalBody'),
  searchInput: document.getElementById('searchInput'),
};

function saveLiked(){ localStorage.setItem('mr_liked', JSON.stringify([...liked])); }
function posterStyle(m){ return `background:linear-gradient(160deg, ${m.c1}, ${m.c2}22 70%, ${m.c1});`; }

function cardHTML(m, mini=false){
  const isLiked = liked.has(m.t);
  return `<div class="card ${mini?'rec-mini':''}" data-title="${m.t.replace(/"/g,'&quot;')}">
    <div class="poster" style="${posterStyle(m)}">
      <div class="rating">★ ${m.r}</div>
      <div class="glyph">${m.icon}</div>
      <span class="yr">${m.y}</span>
      ${mini?'':`<div class="like-btn ${isLiked?'liked':''}" data-like="${m.t.replace(/"/g,'&quot;')}">${isLiked?'♥':'♡'}</div>`}
    </div>
    <div class="meta"><h3>${m.t}</h3><div class="g">${m.g.join(' · ')}</div></div>
  </div>`;
}

function renderMoods(){
  els.moodRow.innerHTML = MOODS.map(m=>
    `<button class="mood-btn ${activeMoodId===m.id?'active':''}" data-mood="${m.id}">${m.label}</button>`
  ).join('');
}

function renderGenres(){
  els.genreRow.innerHTML = Engine.ALL_GENRES(MOVIES).map(g=>
    `<button class="chip ${activeGenres.has(g)?'active':''}" data-genre="${g}">${g}</button>`
  ).join('');
}

function currentMoodTags(){
  const mood = MOODS.find(m=>m.id===activeMoodId);
  return mood ? mood.tags : null;
}

function renderMain(){
  const list = Engine.filter(MOVIES, {genres:activeGenres, moodTags:currentMoodTags(), query});
  els.mainGrid.innerHTML = list.map(m=>cardHTML(m)).join('');
  els.emptyMsg.style.display = list.length ? 'none' : 'block';
  els.countSub.textContent = `${list.length} of ${MOVIES.length} titles`;
  attachCardEvents(els.mainGrid);
}

function renderForYou(){
  if(liked.size===0){ els.forYouSection.style.display='none'; return; }
  els.forYouSection.style.display='block';
  const recs = Engine.recommendFor(MOVIES, liked, 4);
  els.forYouGrid.innerHTML = recs.map(m=>cardHTML(m)).join('');
  els.forYouSub.textContent = `based on ${liked.size} title${liked.size>1?'s':''} you liked`;
  attachCardEvents(els.forYouGrid);
}

function renderStat(){
  els.statLine.innerHTML = `<b>${liked.size}</b> liked · engine tuned to your taste`;
}

function toggleLike(title){
  if(liked.has(title)) liked.delete(title); else liked.add(title);
  saveLiked(); renderStat(); renderForYou(); renderMain();
}

function attachCardEvents(container){
  container.querySelectorAll('.like-btn').forEach(btn=>{
    btn.onclick = (e)=>{ e.stopPropagation(); toggleLike(btn.getAttribute('data-like')); };
  });
  container.querySelectorAll('.card').forEach(card=>{
    card.onclick = ()=> openModal(card.getAttribute('data-title'));
  });
}

function openModal(title){
  const m = MOVIES.find(x=>x.t===title);
  if(!m) return;
  const isLiked = liked.has(m.t);
  const similar = Engine.similarTo(MOVIES, m, 5);

  els.modalBody.innerHTML = `
    <div class="modal-top">
      <button class="modal-close" id="closeModal">✕</button>
      <h2>${m.t}</h2>
      <div class="yrline">${m.y} · dir. ${m.dir} · ${m.rt} min · ★ ${m.r}</div>
      <div class="modal-tags">${m.g.map(g=>`<span class="tagpill">${g}</span>`).join('')}</div>
      <p class="blurb">${m.blurb}</p>
      <div class="modal-actions">
        <button class="btn primary" id="likeToggle">${isLiked?'♥ In your liked list':'♡ Like this title'}</button>
        <button class="btn ghost" id="closeModal2">Close</button>
      </div>
    </div>
    ${similar.length?`<div class="rec-block"><h4>Because you're looking at ${m.t}</h4>
      <div class="rec-row">${similar.map(r=>cardHTML(r,true)).join('')}</div></div>`:''}
  `;
  els.overlay.classList.add('show');
  document.getElementById('closeModal').onclick = closeModal;
  document.getElementById('closeModal2').onclick = closeModal;
  document.getElementById('likeToggle').onclick = ()=>{ toggleLike(m.t); openModal(m.t); };
  attachCardEvents(els.modalBody);
}
function closeModal(){ els.overlay.classList.remove('show'); }

els.overlay.addEventListener('click', e=>{ if(e.target === els.overlay) closeModal(); });
els.moodRow.addEventListener('click', e=>{
  const b = e.target.closest('[data-mood]'); if(!b) return;
  const id = b.getAttribute('data-mood');
  activeMoodId = activeMoodId===id ? null : id;
  renderMoods(); renderMain();
});
els.genreRow.addEventListener('click', e=>{
  const b = e.target.closest('[data-genre]'); if(!b) return;
  const g = b.getAttribute('data-genre');
  if(activeGenres.has(g)) activeGenres.delete(g); else activeGenres.add(g);
  renderGenres(); renderMain();
});
els.searchInput.addEventListener('input', e=>{ query = e.target.value.trim(); renderMain(); });

function init(){
  try{ renderMoods(); renderGenres(); renderMain(); renderForYou(); renderStat(); }
  catch(err){ console.error('Init failed:', err); }
}
init();
