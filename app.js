const $ = (s) => document.querySelector(s);
const safe = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function node(tag, cls, text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function bottomLine(text){const box=node('div','bottom');box.append(node('strong','', 'The Bottom Line'),node('span','',text));return box;}
async function loadEdition(){const response=await fetch('./content/edition-002.json',{cache:'no-store'});if(!response.ok)throw new Error(`Edition load failed: ${response.status}`);renderEdition(await response.json());}
function renderEdition(data){
  document.title=`The Beacon — Edition ${data.edition}`;
  $('#edition-date').textContent=data.date; $('#edition-number').textContent=`Edition ${data.edition}`; $('#reading-time').textContent=`Estimated reading time: ${data.reading_time}`;
  $('#editorial-note').textContent=data.editorial_note; $('#theme-title').textContent=data.theme; $('#theme-summary').textContent=data.theme_summary;
  $('#cover-date').textContent=data.date; $('#cover-edition').textContent=data.edition; $('#cover-theme').textContent=data.theme; $('#cover-deck').textContent=data.theme_summary;
  $('#five-list').replaceChildren(...data.five_things.map(x=>node('li','',x)));
  const f=data.feature; $('#feature-headline').textContent=f.headline; $('#feature-deck').textContent=f.deck;
  const body=$('#feature-body'); body.replaceChildren(); f.paragraphs.forEach((p,i)=>{body.append(node('p','',p));if(i===1&&f.pull_quote)body.append(node('div','pull',f.pull_quote));});
  if(f.why_it_matters){body.append(node('h3','', 'Why it matters'),node('p','',f.why_it_matters));} body.append(bottomLine(f.bottom_line));
  const stories=$('#stories'); stories.replaceChildren(); data.stories.forEach(s=>{const sec=node('section','story');if(s.id)sec.id=s.id;sec.append(node('div','kicker',s.section),node('h2','',s.headline),node('p','',s.body));if(s.provider_impact||s.patient_impact){const grid=node('div','impact-grid');const provider=node('div','impact');provider.append(node('h3','', 'Why it matters for providers'),node('p','',s.provider_impact||''));const patient=node('div','impact');patient.append(node('h3','', 'Why it matters for patients'),node('p','',s.patient_impact||''));grid.append(provider,patient);sec.append(grid);}sec.append(bottomLine(s.bottom_line));stories.append(sec);});
  $('#radar-intro').textContent=data.radar.intro; $('#radar-features').replaceChildren(...data.radar.features.map(x=>node('li','',x))); $('#radar-events').replaceChildren(...data.radar.events.map(x=>node('li','',x)));
}
window.addEventListener('scroll',()=>{const d=document.documentElement,max=d.scrollHeight-d.clientHeight;$('#progress').style.width=`${max>0?(d.scrollTop/max)*100:0}%`;});
$('#theme-toggle').addEventListener('click',()=>{document.documentElement.classList.toggle('dark');$('#theme-toggle').textContent=document.documentElement.classList.contains('dark')?'Light':'Dark';});
$('#print-button').addEventListener('click',()=>window.print());
loadEdition().catch(err=>{console.error(err);const p=node('p','', 'The edition could not load. Open this site through GitHub Pages, Cloudflare Pages, Netlify, or a local web server—not by double-clicking index.html.');p.style.padding='2rem';document.body.prepend(p);});
