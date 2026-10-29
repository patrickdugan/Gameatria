import {METHODS,sum} from "./numerals.js";
import {books,db,loadLibrary,collections,sequence,chapterVerses,lookup,label,reference} from "./data.js";
import {safe,chapterHTML,inspectorHTML,optionHTML} from "./view.js";
import {wireEvents} from "./events.js";
import {wireSearch} from "./search.js";
import {wireNumeric} from "./numeric.js";
const $=id=>document.getElementById(id);
export const state={corpus:"torah",id:"Gen",chapter:1,verse:1,method:"standard",marks:true,index:0,next:0,selected:null};
function notify(text){$("loadStatus").textContent=text;$("loadStatus").classList.toggle("visible",!!text)}
function getMethod(corpus){return corpus==="torah"?"standard":"eastern"}
function setCorpus(corpus){
  if(!collections(corpus).length){notify(corpus+" text could not be loaded. See source links under Methods & sources.");return}
  state.corpus=corpus;
  if(METHODS[state.method].corpus!==corpus)state.method=getMethod(corpus);
  const first=collections(corpus)[0];
  state.id=first.id;state.chapter=1;
  $("torahTab").classList.toggle("active",corpus==="torah");
  $("quranTab").classList.toggle("active",corpus==="quran");
  $("torahTab").setAttribute("aria-pressed",corpus==="torah");
  $("quranTab").setAttribute("aria-pressed",corpus==="quran");
  $("collectionKind").textContent=corpus==="torah"?"THE FIVE BOOKS":"THE 114 SURAHS";
  $("collectionCount").textContent=String(collections(corpus).length).padStart(2,"0");
  $("collectionFilter").value="";
  renderCollectionList();
  renderModes();
  navigate(state.id,1,1);
}
function renderCollectionList(){
  const filter=$("collectionFilter").value.toLowerCase();
  const cs=collections(state.corpus);
  $("collectionList").innerHTML=cs.filter(x=>(x.name+" "+x.subtitle+" "+x.id).toLowerCase().includes(filter))
    .map(x=>optionHTML(x,cs.indexOf(x),x.id===state.id)).join("");
}
function renderModes(){
  $("methodSelect").innerHTML=Object.entries(METHODS).filter(([,x])=>x.corpus===state.corpus)
    .map(([k,v])=>'<option value="'+k+'">'+safe(v.name)+'</option>').join("");
  $("methodSelect").value=state.method;
}
function renderHeader(){
  const c=label(state.corpus,state.id);if(!c)return;
  $("collectionTitle").textContent=c.name;
  $("collectionSubtitle").textContent=state.corpus==="torah"?c.subtitle+" · "+c.hebrew:c.subtitle;
  $("corpusLabel").textContent=state.corpus==="torah"?"THE HEBREW TORAH / FIVE BOOKS OF MOSES":"THE ARABIC QURAN / UTHMANI SCRIPT";
  $("verseCount").textContent=state.corpus==="torah"?"5,853":"6,236";
  $("editionName").textContent=state.corpus==="torah"?"Westminster Leningrad Codex":"Tanzil · Uthmani 1.1";
  const seq=sequence(state.corpus);
  $("chapterSelect").innerHTML=seq.map((p,i)=>{
    const a=label(state.corpus,p.id);
    return '<option value="'+i+'">'+safe(state.corpus==="torah"?a.name+" "+p.chapter:p.id+" · "+a.name)+'</option>';
  }).join("");
  $("chapterSelect").value=state.index;
  $("prevChapter").disabled=state.index===0;
  $("nextChapter").disabled=state.index>=seq.length-1;
  renderCollectionList();
}
function appendChapter(){
  const seq=sequence(state.corpus);if(state.next>=seq.length){$("loadMore").hidden=true;return}
  const p=seq[state.next++],v=chapterVerses(state.corpus,p.id,p.chapter),name=label(state.corpus,p.id)?.name||p.id;
  $("chapterBlocks").insertAdjacentHTML("beforeend",chapterHTML(state.corpus,p.id,p.chapter,v,name,state.method,state.marks));
  $("loadMore").hidden=state.next>=seq.length;
}
export function navigate(id,chapter=1,verse=1){
  const seq=sequence(state.corpus),idx=seq.findIndex(x=>x.id===String(id)&&x.chapter===Number(chapter));if(idx<0)return;
  state.id=String(id);state.chapter=Number(chapter);state.index=idx;state.next=idx;state.selected=null;
  $("chapterBlocks").innerHTML="";appendChapter();appendChapter();renderHeader();
  $("reader").scrollTop=0;
  selectVerse(state.id,state.chapter,verse,true);
}
export function selectVerse(id,ch,verse,scroll=false){
  const v=lookup(state.corpus,id,ch,verse);if(!v)return;
  state.id=String(id);state.chapter=Number(ch);state.verse=Number(verse);state.selected=v;
  $("inspector").innerHTML=inspectorHTML(state.corpus,id,ch,v,state.method);
  $("numberSearch").placeholder=String(sum(v.text,state.method));
  for(const el of $("chapterBlocks").querySelectorAll(".verse-card.selected"))el.classList.remove("selected");
  const selector='.verse-card[data-id="'+id+'"][data-ch="'+ch+'"][data-verse="'+verse+'"]';
  const el=$("chapterBlocks").querySelector(selector);if(el){el.classList.add("selected");if(scroll)el.scrollIntoView({block:"center"})}
  const params=new URLSearchParams({corpus:state.corpus,book:state.id,chapter:String(state.chapter),verse:String(state.verse),method:state.method});
  history.replaceState(null,"","?"+params.toString());
}
export function updateMethod(method){
  if(METHODS[method]?.corpus!==state.corpus)return;
  state.method=method;renderModes();
  for(const block of $("chapterBlocks").querySelectorAll(".chapter-unit")){
    const id=block.dataset.book,ch=Number(block.dataset.chapter);
    block.outerHTML=chapterHTML(state.corpus,id,ch,chapterVerses(state.corpus,id,ch),label(state.corpus,id)?.name||id,method,state.marks);
  }
  if(state.selected)selectVerse(state.id,state.chapter,state.verse,false);
}
export function toggleMarks(){
  state.marks=!state.marks;$("toggleMarks").textContent=state.marks?"Marks on":"Marks off";$("toggleMarks").setAttribute("aria-pressed",String(state.marks));
  updateMethod(state.method);
}
export function flipCorpus(corpus){setCorpus(corpus)}
export function nextPage(delta){
  const p=sequence(state.corpus)[state.index+delta];if(p)navigate(p.id,p.chapter,1);
}
function startScroll(){
  $("reader").addEventListener("scroll",()=>{
    const el=$("reader");if(el.scrollTop+el.clientHeight>el.scrollHeight-340)appendChapter();
  },{passive:true});
}
async function start(){
  notify("Loading Torah and Quran source editions…");
  await loadLibrary();
  if(!collections("torah").length&&!collections("quran").length){notify("Could not load scripture texts. Check the network connection.");return}
  notify(db.warnings.length?"Some texts unavailable: "+db.warnings.join(" · "):"");
  const p=new URLSearchParams(location.search),corpus=p.get("corpus")==="quran"?"quran":"torah";
  setCorpus(collections(corpus).length?corpus:(collections("torah").length?"torah":"quran"));
  const id=p.get("book"),chapter=Number(p.get("chapter")||1),verse=Number(p.get("verse")||1);
  if(id&&Number.isSafeInteger(chapter)&&chapter>0)navigate(id,chapter,Math.max(1,verse));
  const method=p.get("method");if(method&&METHODS[method]?.corpus===state.corpus)updateMethod(method);
  startScroll();
  const api={state,flipCorpus,navigate,selectVerse,updateMethod,toggleMarks,nextPage,appendChapter,renderCollectionList,chapters:()=>sequence(state.corpus)};
  wireEvents(api);wireSearch(api);wireNumeric(api);
  $("inspector").onclick=async e=>{
    if(e.target.id!=="copyRef"&&e.target.id!=="copySum")return;
    const v=e.target.id==="copyRef"?location.href:String(sum(state.selected?.text||"",state.method));
    try{await navigator.clipboard.writeText(v);e.target.textContent="Copied";}catch{window.prompt("Copy",v)}
  };
}
start();
