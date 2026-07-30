(function () {
  const root = document.documentElement;
  const base = document.body.dataset.base || './';
  const $ = (s, scope = document) => scope.querySelector(s);
  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const editionPath = n => `${base}content/editions/edition-${n}.json`;
  const link = p => `${base}${p}`;
  const formatDate = iso => new Intl.DateTimeFormat('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(new Date(`${iso}T12:00:00`));

  const savedTheme = localStorage.getItem('beacon-theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  $('.theme-toggle')?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('beacon-theme', root.dataset.theme);
  });
  $('.menu-button')?.addEventListener('click', e => {
    const nav = $('.site-nav'); const open = nav.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') $('.site-nav')?.classList.remove('open'); });
  $('.print-button')?.addEventListener('click', () => print());
  $('.subscribe-form')?.addEventListener('submit', e => { e.preventDefault(); $('.form-message').textContent = 'You’re on the list. The Beacon will meet you in your inbox.'; e.currentTarget.reset(); });

  function storyCard(s, edition, featured = false) {
    return `<article class="story-card${featured?' story-card--lead':''}"><p class="eyebrow">${esc(s.section)}</p><h3><a href="${link(`article/${s.slug}/index.html`)}">${esc(s.headline)}</a></h3><p>${esc(s.standfirst)}</p><a class="text-link" href="${link(`article/${s.slug}/index.html`)}">Read story <span aria-hidden="true">→</span></a></article>`;
  }
  function impact(s) {
    if (!s.provider_impact && !s.patient_impact) return '';
    return `<section class="impact-section"><p class="eyebrow">Healthcare Impact</p><div class="impact-grid"><article><span>01</span><h2>For Providers</h2><p>${esc(s.provider_impact)}</p></article><article><span>02</span><h2>For Patients</h2><p>${esc(s.patient_impact)}</p></article></div></section>`;
  }
  function bottomLine(text) { return text ? `<aside class="bottom-line"><p class="eyebrow">The Bottom Line</p><p>${esc(text)}</p></aside>` : ''; }
  function radar(items) { return `<section class="radar" id="radar"><div class="section-intro"><p class="eyebrow">Already on Our Radar</p><h2>What we’re watching next.</h2></div><div class="radar-grid">${items.map((r,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><div><h3>${esc(r.title)}</h3><p>${esc(r.detail)}</p></div></article>`).join('')}</div></section>`; }
  function readingTime(d){ return d.reading_time || `${Math.max(1,Math.ceil(d.stories.reduce((n,s)=>n+s.paragraphs.join(' ').split(/\s+/).length,0)/220))} minutes`; }

  async function json(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); }
  async function latest(){ const items=await json(`${base}content/editions/index.json`); return json(editionPath(items[0].edition)); }

  async function renderHome(){
    const d=await latest(), lead=d.stories[0], rest=d.stories.slice(1);
    $('#home-edition').textContent=`Edition ${d.edition} · ${d.date_display || formatDate(d.date)}`;
    $('#home-theme').textContent=d.theme; $('#home-summary').textContent=d.summary;
    $('#home-edition-link').href=link(`edition/${d.edition}/index.html`); $('#home-feature-link').href=link(`article/${lead.slug}/index.html`);
    $('#lead-story').innerHTML=storyCard(lead,d.edition,true);
    $('#story-grid').innerHTML=rest.map(s=>storyCard(s,d.edition)).join('');
    $('#home-radar').innerHTML=radar(d.radar);
  }
  async function renderEdition(){
    const n=document.body.dataset.edition, d=await json(editionPath(n));
    document.title=`Edition ${d.edition}: ${d.theme} — The Beacon`;
    $('#edition-number').textContent=`Edition ${d.edition}`; $('#edition-date').textContent=d.date_display||formatDate(d.date);
    $('#edition-theme').textContent=d.theme; $('#edition-summary').textContent=d.summary; $('#editor-note').textContent=d.editor_note;
    $('#reading-time').textContent=readingTime(d); $('#edition-stories').innerHTML=d.stories.map((s,i)=>storyCard(s,d.edition,i===0)).join('');
    $('#edition-radar').innerHTML=radar(d.radar);
  }
  async function renderArticle(){
    const slug=document.body.dataset.slug, indexes=await json(`${base}content/editions/index.json`); let d,s;
    for(const item of indexes){ d=await json(editionPath(item.edition)); s=d.stories.find(x=>x.slug===slug); if(s)break; }
    if(!s) throw new Error('Story not found');
    document.title=`${s.headline} — The Beacon`; $('meta[name="description"]').content=s.standfirst;
    $('#article-section').textContent=s.section; $('#article-headline').textContent=s.headline; $('#article-standfirst').textContent=s.standfirst;
    $('#article-byline').textContent=`The Beacon Editorial Desk · ${d.date_display||formatDate(d.date)}`;
    $('#article-back').href=link(`edition/${d.edition}/index.html`); $('#article-back').textContent=`← Edition ${d.edition}`;
    $('#article-theme').textContent=d.theme; $('#article-theme-link').href=link(`edition/${d.edition}/index.html`);
    $('#article-body').innerHTML=s.paragraphs.map((p,i)=>`${i===1&&s.pull_quote?`<blockquote>${esc(s.pull_quote)}</blockquote>`:''}<p>${esc(p)}</p>`).join('') + (s.paragraphs.length<2&&s.pull_quote?`<blockquote>${esc(s.pull_quote)}</blockquote>`:'') + impact(s) + bottomLine(s.bottom_line);
  }
  async function renderArchive(){
    const items=await json(`${base}content/editions/index.json`);
    $('#archive-list').innerHTML=items.map((d,i)=>`<a class="archive-row" href="${link(`edition/${d.edition}/index.html`)}"><span class="archive-number">${d.edition}</span><div><p class="eyebrow">${esc(d.date_display||formatDate(d.date))}</p><h2>${esc(d.theme)}</h2><p>${esc(d.summary)}</p></div><span class="archive-arrow">→</span></a>`).join('');
  }
  const view=document.body.dataset.view;
  const renderers={home:renderHome,edition:renderEdition,article:renderArticle,archive:renderArchive};
  if(renderers[view]) renderers[view]().catch(err=>{ console.error(err); const el=$('#page-status'); if(el) el.innerHTML='<strong>We could not load this page.</strong><br>Please refresh or return to the homepage.'; });
})();
