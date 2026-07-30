/* Backward-compatible importer for cached Beacon Studio releases. Keep this file
   available because GitHub Pages may serve HTML and JavaScript from different
   deployment cache windows. The current Studio uses markdown-parser.mjs. */
(function(){
  const clean=s=>String(s||'').trim(),norm=s=>clean(s).toLowerCase().replace(/[’']/g,"'").replace(/[—–]/g,'-').replace(/\s+/g,' '),slugify=s=>norm(s).replace(/'/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'story';
  const toISO=value=>{const d=new Date(value);return Number.isNaN(d.valueOf())?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10)};
  function readingTime(stories){const words=stories.reduce((n,s)=>n+[s.standfirst,...s.paragraphs].join(' ').split(/\s+/).filter(Boolean).length,0);return `${Math.max(1,Math.ceil(words/220))} minutes`}
  function parse(input){
    const lines=String(input||'').replace(/\r/g,'').split('\n'),stories=[],radar=[],meta={};let section='',current=null,mode='metadata',field='body',summary=[],editor=[],closing=[];
    const finish=()=>{if(!current)return;current.standfirst=current.standfirst||current.paragraphs[0]?.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim()||current.paragraphs[0]||'';stories.push(current);current=null};
    const start=headline=>{finish();current={slug:slugify(headline),section,headline,standfirst:'',paragraphs:[],pull_quote:'',bottom_line:'',provider_impact:'',patient_impact:'',image:{src:'',caption:'',credit:'',alt:`Editorial image for ${headline}`}};field='body'};
    for(const raw of lines){if(/^\s*---+\s*$/.test(raw)||!raw.trim())continue;const h=raw.match(/^\s*(#{1,3})\s+(.+?)\s*#*\s*$/),text=clean(h?h[2]:raw),n=norm(text);
      if(h&&h[1]==='#'&&n==='the beacon')continue;
      if(mode==='metadata'&&h&&h[1]==='##'){meta.date=text;continue}
      if(mode==='metadata'&&h&&h[1]==='###'){const m=text.match(/Edition\s+(\d+).*?([0-9]+)\s*[- ]?minute/i);if(m){meta.edition=m[1];meta.reading_time=`${m[2]} minutes`}continue}
      if(h&&h[1]==='#'&&!meta.theme){meta.theme=text;mode='summary';continue}
      if(h&&h[1]==='##'&&/^editor'?s note$/.test(n)){finish();mode='editor';section='';continue}
      if(h&&h[1]==='#'){finish();if(n==='already on our radar'){mode='radar';section='';continue}if(n==='closing thought'){mode='closing';section='';continue}section=text;mode='section';continue}
      if(h&&h[1]==='##'&&section){start(text);mode='story';continue}
      if(h&&h[1]==='###'&&current){if(n==='the bottom line')field='bottom_line';else if(n==='why it matters - providers')field='provider_impact';else if(n==='why it matters - patients')field='patient_impact';else field='body';continue}
      if(mode==='summary'){summary.push(text);continue}if(mode==='editor'){editor.push(text);continue}if(mode==='radar'){const p=text.split(/:\s+/);radar.push({title:p.shift(),detail:p.join(': ')});continue}if(mode==='closing'){closing.push(text);continue}
      if(current){if(field==='body')current.paragraphs.push(text);else current[field]=current[field]?`${current[field]}\n\n${text}`:text}
    }finish();const date=toISO(meta.date);const edition={schema_version:1,status:'draft',edition:String(meta.edition||'001').padStart(3,'0'),date,date_display:meta.date||date,theme:meta.theme||'Untitled Edition',summary:summary.join('\n\n'),editor_note:editor.join('\n\n'),reading_time:meta.reading_time||readingTime(stories),stories,radar,closing_thought:closing.join('\n\n')};return {edition,warnings:validate(edition)}}
  function validate(d){const warnings=[];if(!d.editor_note)warnings.push('Editor’s note is missing.');d.stories.forEach((s,i)=>{if(!s.bottom_line)warnings.push(`Story ${i+1} has no Bottom Line.`)});return warnings}
  window.BeaconParser={parse,validate,slugify,readingTime};
})();
