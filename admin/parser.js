(function(){
  const RESERVED=/^(editor'?s? note|from the editorial desk|already on our radar|radar|summary|edition summary|reading time|theme|date|edition)$/i;
  const clean=s=>String(s||'').replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/,'').replace(/^[_*]+|[_*]+$/g,'').trim();
  const slugify=s=>clean(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'story';
  const dateDisplay=iso=>new Intl.DateTimeFormat('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(new Date(`${iso}T12:00:00`));
  function toISO(value){const d=new Date(clean(value));return Number.isNaN(d.valueOf())?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10)}
  function heading(line){const m=line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);return m?{level:m[1].length,text:clean(m[2])}:null}
  function label(line){const m=line.match(/^\s*(?:\*\*)?([A-Za-z][A-Za-z ’'&/—–-]{1,55})(?:\*\*)?\s*:\s*(.*)$/);return m?{name:clean(m[1]),value:clean(m[2])}:null}
  function readingTime(stories){const words=stories.reduce((n,s)=>n+[s.standfirst,...s.paragraphs].join(' ').split(/\s+/).filter(Boolean).length,0),minutes=Math.max(1,Math.ceil(words/220));return `${minutes} minute${minutes===1?'':'s'}`}
  function parse(input){
    const text=String(input||'').replace(/\r/g,'').replace(/^---\n[\s\S]*?\n---\n/,'').trim();
    if(!text)throw new Error('Paste or upload an edition first.');
    const lines=text.split('\n'), meta={}, stories=[], radar=[];let editor=[],current=null,mode='',section='',radarItem=null;
    const finish=()=>{if(!current)return;current.headline=clean(current.headline);current.slug=current.slug||slugify(current.headline);current.standfirst=clean(current.standfirst||current.paragraphs.shift()||'');current.paragraphs=current.paragraphs.map(clean).filter(Boolean);if(!current.paragraphs.length&&current.standfirst)current.paragraphs=[current.standfirst];stories.push(current);current=null};
    const startStory=(headline,sec)=>{finish();current={slug:slugify(headline),section:clean(sec||section||'News'),headline:clean(headline),standfirst:'',paragraphs:[],pull_quote:'',bottom_line:'',provider_impact:'',patient_impact:'',image:{src:'',caption:'',credit:'',alt:''}};mode='body'};
    for(let i=0;i<lines.length;i++){
      const raw=lines[i], t=clean(raw), h=heading(raw), l=label(raw);if(!t){if(['standfirst','pull_quote','bottom_line','provider_impact','patient_impact'].includes(mode))mode='body';continue}
      const metaMatch=raw.match(/^\s*(?:\*\*)?(Edition(?: Number)?|Date|Theme|Summary|Edition Summary|Reading Time)(?:\*\*)?\s*[:#-]\s*(.+)$/i);
      if(metaMatch){const k=metaMatch[1].toLowerCase();meta[k.includes('edition')&&!k.includes('summary')?'edition':k.includes('summary')?'summary':k.replace(/\s+/g,'_')]=clean(metaMatch[2]);continue}
      if(h&&/already on our radar|^radar$/i.test(h.text)){finish();mode='radar';section='';continue}
      if(h&&/editor'?s? note|from the editorial desk/i.test(h.text)){finish();mode='editor';section='';continue}
      if(h&&/^summary$/i.test(h.text)){mode='summary';continue}
      if(h&&/^theme$/i.test(h.text)){mode='theme';continue}
      if(h&&!RESERVED.test(h.text)){
        const next=lines.slice(i+1).map((x,j)=>({x,j:i+1+j})).find(x=>clean(x.x));const nh=next&&heading(next.x);
        if(h.level<=2&&nh&&nh.level>h.level&&!RESERVED.test(nh.text)){section=h.text;startStory(nh.text,section);i=next.j;continue}
        if(h.level===1&&!meta.theme&&stories.length===0&&!current){meta.theme=h.text;continue}
        if(h.level<=3){startStory(h.text,section||'News');continue}
      }
      const key=(l?.name||'').toLowerCase().replace(/[’']/g,"'");const val=l?.value||'';
      if(l&&/^(headline|title)$/.test(key)){startStory(val,section);continue}
      if(l&&/^section$/.test(key)){section=val;if(current)current.section=val;continue}
      if(l&&/^(standfirst|deck|dek|subhead)$/.test(key)){if(!current)startStory('Untitled story',section);current.standfirst=val;mode='standfirst';continue}
      if(l&&/^(pull quote|quote)$/.test(key)){if(current)current.pull_quote=val;mode='pull_quote';continue}
      if(l&&/^(the )?bottom line$/.test(key)){if(current)current.bottom_line=val;mode='bottom_line';continue}
      if(l&&/(why it matters.*provider|provider impact|for providers)/.test(key)){if(current)current.provider_impact=val;mode='provider_impact';continue}
      if(l&&/(why it matters.*patient|patient impact|for patients)/.test(key)){if(current)current.patient_impact=val;mode='patient_impact';continue}
      if(l&&/^(hero image|image|image url)$/.test(key)){if(current)current.image.src=val;continue}
      if(l&&/^caption$/.test(key)){if(current)current.image.caption=val;continue}
      if(l&&/^credit$/.test(key)){if(current)current.image.credit=val;continue}
      if(l&&/^(alt|alt text)$/.test(key)){if(current)current.image.alt=val;continue}
      if(/^>/.test(raw)&&current){current.pull_quote=clean(raw.replace(/^\s*>\s?/,''));mode='pull_quote';continue}
      if(mode==='radar'){const lm=raw.match(/^\s*[-*+]\s+(.+)/);if(lm){const parts=lm[1].split(/\s+[—–-]\s+/);radar.push({title:clean(parts.shift()),detail:clean(parts.join(' — '))});radarItem=radar.at(-1)}else if(radarItem)radarItem.detail=clean(`${radarItem.detail} ${t}`);else radar.push({title:t,detail:''});continue}
      if(mode==='editor'){editor.push(t);continue}if(mode==='summary'){meta.summary=(meta.summary?meta.summary+' ':'')+t;continue}if(mode==='theme'){meta.theme=t;mode='';continue}
      if(current){if(['standfirst','pull_quote','bottom_line','provider_impact','patient_impact'].includes(mode)&&!l){current[mode]=clean(`${current[mode]} ${t}`)}else current.paragraphs.push(t);continue}
      if(!meta.summary&&t.length>80)meta.summary=t;else if(!meta.theme&&t.length<100)meta.theme=t;
    }
    finish();
    if(!stories.length)startStory(meta.theme||'Today’s Lead','News'),current.paragraphs=text.split(/\n\s*\n/).map(clean),finish();
    const edition=(meta.edition||text.match(/\bEdition\s+(\d{1,4})\b/i)?.[1]||'001').replace(/\D/g,'').padStart(3,'0');
    const date=toISO(meta.date||new Date().toISOString());
    const result={schema_version:1,status:'draft',edition,date,date_display:dateDisplay(date),theme:meta.theme||stories[0].headline,summary:meta.summary||stories.map(s=>s.headline).slice(0,3).join(' · '),editor_note:editor.join(' ')||'Here is what The Beacon is seeing today.',reading_time:meta.reading_time||readingTime(stories),stories,radar:radar.length?radar:[{title:'What develops next',detail:'The newsroom is monitoring the next turn in today’s defining stories.'}]};
    return {edition:result,warnings:validate(result)};
  }
  function validate(d){const w=[];if(!d.edition)w.push('Edition number was inferred.');if(!d.editor_note)w.push('Editor’s note is missing.');d.stories.forEach((s,i)=>{if(!s.bottom_line)w.push(`Story ${i+1} has no Bottom Line.`);if(!s.standfirst)w.push(`Story ${i+1} has no standfirst.`)});return w}
  window.BeaconParser={parse,validate,slugify,readingTime};
})();
