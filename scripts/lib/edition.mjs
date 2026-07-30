import fs from 'node:fs/promises';

export class EditionValidationError extends Error {
  constructor(errors){super(`Edition validation failed with ${errors.length} error${errors.length===1?'':'s'}.`);this.name='EditionValidationError';this.errors=errors}
}

const requiredEdition=['schema_version','edition','publication_date','display_date','theme','summary','reading_time','editor_note','sections','stories','radar','closing_thought'];
const requiredStory=['slug','section','category','headline','standfirst','body','sources','pull_quote','bottom_line','why_it_matters','image'];
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern=/^\d{4}-\d{2}-\d{2}$/;

export function validateEdition(value){
  const errors=[];const add=(path,message)=>errors.push({path,message});
  if(!value||typeof value!=='object'||Array.isArray(value))return {valid:false,errors:[{path:'$',message:'Edition must be a JSON object.'}]};
  for(const key of requiredEdition)if(!(key in value))add(`$.${key}`,'Required field is missing.');
  if(value.schema_version!==2)add('$.schema_version','Must equal 2.');
  if(typeof value.edition!=='string'||!/^\d{3}$/.test(value.edition||''))add('$.edition','Must be a three-digit string such as "003".');
  if(typeof value.publication_date!=='string'||!datePattern.test(value.publication_date)){add('$.publication_date','Must use YYYY-MM-DD.')}else{const d=new Date(`${value.publication_date}T12:00:00Z`);if(Number.isNaN(d.valueOf())||d.toISOString().slice(0,10)!==value.publication_date)add('$.publication_date','Date does not exist on the calendar.');}
  for(const key of ['display_date','theme','summary','reading_time','editor_note','closing_thought'])if(typeof value[key]!=='string'||!value[key].trim())add(`$.${key}`,'Must be a non-empty string.');
  if(value.reading_time&&!/^[1-9]\d* minutes?$/.test(value.reading_time))add('$.reading_time','Use a value such as "14 minutes".');
  if(!Array.isArray(value.stories)||value.stories.length===0)add('$.stories','Must contain at least one story.');
  const slugs=new Set();
  for(const [i,story] of (Array.isArray(value.stories)?value.stories:[]).entries()){
    const base=`$.stories[${i}]`;if(!story||typeof story!=='object'){add(base,'Story must be an object.');continue}
    for(const key of requiredStory)if(!(key in story))add(`${base}.${key}`,'Required field is missing.');
    if(typeof story.slug!=='string'||!slugPattern.test(story.slug||''))add(`${base}.slug`,'Use lowercase words separated by hyphens.');else if(slugs.has(story.slug))add(`${base}.slug`,'Story slug is duplicated.');else slugs.add(story.slug);
    for(const key of ['section','category','headline','standfirst','bottom_line'])if(typeof story[key]!=='string'||!story[key].trim())add(`${base}.${key}`,'Must be a non-empty string.');
    if(!Array.isArray(story.body)||story.body.length===0)add(`${base}.body`,'Must contain at least one paragraph.');else story.body.forEach((p,j)=>{if(typeof p!=='string'||!p.trim())add(`${base}.body[${j}]`,'Paragraph must be a non-empty string.')});
    if(!Array.isArray(story.sources))add(`${base}.sources`,'Must be an array; use [] when there are no sources.');else story.sources.forEach((source,j)=>{if(!source?.title)add(`${base}.sources[${j}].title`,'Source title is required.');try{const u=new URL(source?.url);if(u.protocol!=='https:')throw new Error()}catch{add(`${base}.sources[${j}].url`,'Source URL must be a complete https:// URL.')}});
    if(!story.why_it_matters||typeof story.why_it_matters!=='object')add(`${base}.why_it_matters`,'Must contain providers and patients strings.');else for(const k of ['providers','patients'])if(typeof story.why_it_matters[k]!=='string')add(`${base}.why_it_matters.${k}`,'Must be a string; use "" when not applicable.');
    if(!story.image||typeof story.image!=='object')add(`${base}.image`,'Must contain src, caption, credit, and alt.');else{for(const k of ['src','caption','credit','alt'])if(typeof story.image[k]!=='string')add(`${base}.image.${k}`,'Must be a string.');if(!story.image.alt?.trim())add(`${base}.image.alt`,'Alt text is required, including when the image URL is blank.');if(story.image.src){try{new URL(story.image.src)}catch{add(`${base}.image.src`,'Image URL must be complete or blank.')}}}
  }
  if(!Array.isArray(value.sections)||value.sections.length===0)add('$.sections','Must contain at least one section.');else{const referenced=new Set();value.sections.forEach((section,i)=>{const base=`$.sections[${i}]`;if(!section?.name)add(`${base}.name`,'Section name is required.');if(!Array.isArray(section?.story_slugs)||section.story_slugs.length===0)add(`${base}.story_slugs`,'Section must reference at least one story.');else section.story_slugs.forEach((slug,j)=>{if(!slugs.has(slug))add(`${base}.story_slugs[${j}]`,`Unknown story slug "${slug}".`);if(referenced.has(slug))add(`${base}.story_slugs[${j}]`,`Story "${slug}" appears in more than one section.`);referenced.add(slug)})});for(const slug of slugs)if(!referenced.has(slug))add('$.sections',`Story "${slug}" is not assigned to a section.`)}
  if(!Array.isArray(value.radar)||value.radar.length===0)add('$.radar','Must contain at least one Radar item.');else value.radar.forEach((r,i)=>{if(!r?.title?.trim())add(`$.radar[${i}].title`,'Radar title is required.');if(!r?.detail?.trim())add(`$.radar[${i}].detail`,'Radar detail is required.')});
  return {valid:errors.length===0,errors};
}

export async function loadEdition(file){let text;try{text=await fs.readFile(file,'utf8')}catch(e){throw new Error(`Could not read edition file: ${file}`)}let value;try{value=JSON.parse(text)}catch(e){throw new Error(`Malformed JSON in ${file}: ${e.message}`)}const result=validateEdition(value);if(!result.valid)throw new EditionValidationError(result.errors);return value}
export function formatErrors(errors){return errors.map(e=>`- ${e.path}: ${e.message}`).join('\n')}
