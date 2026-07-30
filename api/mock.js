(function(){
  const drafts=new Map();
  const latestUrl=new URL('../content/editions/index.json',document.currentScript.src);
  async function request(method,path,body){
    if(method==='POST'&&path==='/api/import'){const parsed=window.BeaconParser.parse(body.markdown||body.text||'');drafts.set(parsed.edition.edition,parsed.edition);return parsed}
    if(method==='POST'&&path==='/api/publish'){const edition=body.edition||drafts.get(body.edition_number);if(!edition)throw new Error('Edition not found.');return {status:'mocked',edition:edition.edition,message:'The static mock prepared the publish request. Browser authorization is required to write to GitHub.'}}
    if(method==='GET'&&path==='/api/edition/latest')return fetch(latestUrl).then(r=>r.json()).then(x=>x[0]);
    throw new Error(`Mock route not found: ${method} ${path}`)
  }
  window.BeaconAPI={request};
})();
