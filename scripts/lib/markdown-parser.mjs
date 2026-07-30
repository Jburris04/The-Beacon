const clean=s=>s.replace(/\r/g,'').trim();
const slugify=s=>s.toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'untitled-story';
const normalize=s=>s.toLowerCase().replace(/[’']/g,"'").replace(/[—–]/g,'-').replace(/\s+/g,' ').trim();
const plain=s=>s.replace(/\*\*|__|\*|_/g,'').trim();
const firstSentence=s=>{const m=plain(s).match(/^(.+?[.!?])(?:\s|$)/);return(m?.[1]||plain(s)).slice(0,260)};
const dateIso=value=>{const d=new Date(value);return Number.isNaN(d.valueOf())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};

export function tokenizeMarkdown(markdown){
  const lines=markdown.replace(/\r/g,'').split('\n'),blocks=[];let paragraph=[];
  const flush=()=>{const text=clean(paragraph.join('\n'));if(text)blocks.push({kind:'paragraph',text});paragraph=[]};
  for(const line of lines){if(/^\s*---+\s*$/.test(line)){flush();continue}const h=line.match(/^\s*(#{1,3})\s+(.+?)\s*#*\s*$/);if(h){flush();blocks.push({kind:'heading',level:h[1].length,text:plain(h[2])})}else if(!line.trim())flush();else paragraph.push(line.trim())}flush();return blocks;
}

export function classifyMarkdown(markdown){
  const raw=tokenizeMarkdown(markdown),blocks=[];let phase='metadata',section='',story=-1,subfield='body',themeSeen=false;
  const push=(b,target,extra={})=>blocks.push({...b,target,...extra});
  for(const b of raw){const n=normalize(b.text);
    if(b.kind==='heading'&&b.level===1&&n==='the beacon'){push(b,'masthead');continue}
    if(phase==='metadata'&&b.kind==='heading'&&b.level===2){push(b,'publication_date');continue}
    if(phase==='metadata'&&b.kind==='heading'&&b.level===3&&/^edition\s+\d+/.test(n)){push(b,'edition_meta');continue}
    if(b.kind==='heading'&&b.level===2&&/^editor'?s note$/.test(n)){phase='editor';section='';story=-1;push(b,'label');continue}
    if(b.kind==='heading'&&b.level===1){
      if(!themeSeen){themeSeen=true;phase='summary';push(b,'theme');continue}
      if(n==='already on our radar'){phase='radar';section='';story=-1;push(b,'label');continue}
      if(n==='closing thought'){phase='closing';section='';story=-1;push(b,'label');continue}
      phase='section';section=b.text;story=-1;push(b,'section',{section});continue
    }
    if(b.kind==='heading'&&b.level===2&&section){story++;subfield='body';push(b,'story',{section,story});continue}
    if(b.kind==='heading'&&b.level===3&&story>=0){
      if(n==='the bottom line')subfield='bottom_line';else if(n==='why it matters - providers')subfield='providers';else if(n==='why it matters - patients')subfield='patients';else if(n==='why it matters')subfield='why_general';else if(n==='the chain reaction')subfield='chain_reaction';else subfield='body';push(b,'label',{section,story});continue
    }
    if(b.kind==='paragraph'){
      const target=phase==='editor'?'editor_note':phase==='summary'?'summary':phase==='radar'?'radar':phase==='closing'?'closing_thought':story>=0?subfield:'unclassified';push(b,target,{section,story});
    }else push(b,'unclassified');
  }return blocks;
}

export function compileMarkdownBlocks(blocks){
  const edition={schema_version:2,edition:'',publication_date:'',display_date:'',theme:'',summary:'',reading_time:'',editor_note:'',sections:[],stories:[],radar:[],closing_thought:''};let currentSection='',currentStory=null;
  const append=(old,text)=>old?`${old}\n\n${text}`:text;
  for(const b of blocks){switch(b.target){
    case'publication_date':edition.display_date=b.text;edition.publication_date=dateIso(b.text);break;
    case'edition_meta':{const m=b.text.match(/Edition\s+(\d+).*?([0-9]+)\s*[- ]?minute/i);if(m){edition.edition=m[1].padStart(3,'0');edition.reading_time=`${m[2]} minutes`}}break;
    case'theme':edition.theme=b.text;break;case'summary':edition.summary=append(edition.summary,b.text);break;case'editor_note':edition.editor_note=append(edition.editor_note,b.text);break;
    case'section':currentSection=b.text;edition.sections.push({name:currentSection,story_slugs:[]});currentStory=null;break;
    case'story':{currentSection=b.section||currentSection||'News';let slug=slugify(b.text),suffix=2;while(edition.stories.some(s=>s.slug===slug))slug=`${slugify(b.text)}-${suffix++}`;currentStory={slug,section:currentSection,category:currentSection,headline:b.text,standfirst:'',body:[],sources:[],pull_quote:'',bottom_line:'',why_it_matters:{general:'',providers:'',patients:''},chain_reaction:'',image:{src:'',caption:'',credit:'',alt:`Editorial image for ${b.text}`}};edition.stories.push(currentStory);let sec=edition.sections.find(s=>s.name===currentSection);if(!sec){sec={name:currentSection,story_slugs:[]};edition.sections.push(sec)}sec.story_slugs.push(slug);break}
    case'body':if(currentStory){currentStory.body.push(b.text);if(!currentStory.standfirst)currentStory.standfirst=firstSentence(b.text)}break;
    case'why_general':if(currentStory)currentStory.why_it_matters.general=append(currentStory.why_it_matters.general,b.text);break;
    case'providers':if(currentStory)currentStory.why_it_matters.providers=append(currentStory.why_it_matters.providers,b.text);break;
    case'patients':if(currentStory)currentStory.why_it_matters.patients=append(currentStory.why_it_matters.patients,b.text);break;
    case'bottom_line':if(currentStory)currentStory.bottom_line=append(currentStory.bottom_line,b.text);break;
    case'chain_reaction':if(currentStory)currentStory.chain_reaction=append(currentStory.chain_reaction,b.text);break;
    case'radar':{const [title,...rest]=b.text.split(/:\s+/);edition.radar.push({title:plain(title),detail:plain(rest.join(': ')||b.text)});break}
    case'closing_thought':edition.closing_thought=append(edition.closing_thought,b.text);break;
  }}
  edition.sections=edition.sections.filter(s=>s.story_slugs.length);return edition;
}

export function parseMarkdown(markdown){const blocks=classifyMarkdown(markdown);return {blocks,edition:compileMarkdownBlocks(blocks)}}
