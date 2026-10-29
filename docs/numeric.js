import {allVerses,reference} from "./data.js";
import {METHODS,sum} from "./numerals.js";
import {safe} from "./view.js";
export function wireNumeric(api){
 const box=document.getElementById("numberMatches");
 document.getElementById("numberForm").onsubmit=e=>{
  e.preventDefault();
  const n=Number(document.getElementById("numberSearch").value);
  if(!Number.isSafeInteger(n)||n<0)return;
  const a=METHODS[api.state.method].corpus==="quran"?api.state.method:"eastern";
  const h=METHODS[api.state.method].corpus==="torah"?api.state.method:"standard";
  let hits=0,html="";
  for(const v of allVerses()){
   if(sum(v.text,v.corpus==="torah"?h:a)!==n)continue;
   hits++;if(hits>75)continue;
   const ref=reference(v.corpus,v.id,v.chapter,v.verse);
   html+='<button class="match-result" data-go-corpus="'+v.corpus+'" data-go-id="'+safe(v.id)+'" data-go-ch="'+v.chapter+'" data-go-verse="'+v.verse+'"><strong>'+safe(ref)+'</strong><small>'+safe(v.text.slice(0,80))+'</small></button>';
  }
  box.innerHTML='<p class="no-results">'+hits+' matches for '+n+'.</p>'+html;
 };
 box.onclick=e=>{
  const v=e.target.closest("[data-go-id]");if(!v)return;
  if(v.dataset.goCorpus!==api.state.corpus)api.flipCorpus(v.dataset.goCorpus);
  api.navigate(v.dataset.goId,Number(v.dataset.goCh),Number(v.dataset.goVerse));
 };
}
