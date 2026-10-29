import {allVerses,reference} from "./data.js";
import {fold} from "./numerals.js";
import {resultHTML} from "./view.js";
export function wireSearch(api){
 const input=document.getElementById("textSearch"),dialog=document.getElementById("searchDialog");
 const results=document.getElementById("searchResults");
 input.onkeydown=e=>{
  if(e.key!=="Enter")return;
  e.preventDefault();const term=input.value.trim();if(!term)return;
  if(/^\d+$/.test(term)){
   document.getElementById("numberSearch").value=term;
   document.getElementById("numberForm").requestSubmit();
   return;
  }
  let m=/^(\d{1,3}):(\d+)$/.exec(term);
  if(m){api.flipCorpus("quran");api.navigate(m[1],1,Number(m[2]));return}
  m=/^(gen|exod|lev|num|deut)\s+(\d+):(\d+)$/i.exec(term);
  if(m){
   const id=m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();
   api.flipCorpus("torah");api.navigate(id,Number(m[2]),Number(m[3]));return;
  }
  const q=fold(term),hits=[];let n=0;
  for(const v of allVerses()){
   if(fold(v.text).includes(q)){n++;if(hits.length<100)hits.push(v)}
  }
  document.getElementById("searchTitle").textContent=n+" matches for "+term;
  results.innerHTML=hits.map(v=>resultHTML(v,reference(v.corpus,v.id,v.chapter,v.verse))).join("")||"<p>No matching text in this edition.</p>";
  dialog.showModal();
 };
 results.onclick=e=>{
  const x=e.target.closest("[data-go-id]");if(!x)return;
  dialog.close();
  if(x.dataset.goCorpus!==api.state.corpus)api.flipCorpus(x.dataset.goCorpus);
  api.navigate(x.dataset.goId,Number(x.dataset.goCh),Number(x.dataset.goVerse));
 };
}
