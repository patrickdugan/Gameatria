import {sum,words,letters,METHODS} from "./numerals.js";
import {reference} from "./data.js";
export function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
export function displayed(s,marks){return safe(marks?s:String(s).normalize("NFD").replace(/\p{Mark}/gu,"").normalize("NFC"))}
export function chapterHTML(corpus,id,ch,verses,name,method,marks){
  const n=verses.reduce((acc,v)=>acc+sum(v.text,method),0);
  let html='<section class="chapter-unit" data-book="'+safe(id)+'" data-chapter="'+ch+'">';
  html+='<header class="chapter-title"><strong>'+safe(corpus==="torah"?"Chapter "+ch:name)+'</strong><span class="rule"></span><span class="chapter-total">'+n.toLocaleString()+" total</span></header>";
  if(corpus==="quran"&&verses[0]?.opening){
    const open=verses[0].opening;
    html+='<div class="opening-block"><div class="opening-title"><span>Unnumbered opening · source formula</span><span>'+sum(open,method).toLocaleString()+'</span></div><div class="opening-text" lang="ar" dir="rtl">'+displayed(open,marks)+'</div></div>';
  }
  for(const v of verses){
    html+='<button type="button" class="verse-card" data-corpus="'+corpus+'" data-id="'+safe(id)+'" data-ch="'+ch+'" data-verse="'+v.verse+'" aria-label="'+safe(reference(corpus,id,ch,v.verse))+'">';
    html+='<span class="verse-index">'+v.verse+'</span><span class="verse-text '+(corpus==="torah"?"hebrew":"")+'" lang="'+(corpus==="torah"?"he":"ar")+'" dir="rtl">'+displayed(v.text,marks)+'</span>';
    html+='<span class="verse-sum">'+sum(v.text,method).toLocaleString()+'<small>VALUE</small></span></button>';
  }
  return html+"</section>";
}
export function inspectorHTML(corpus,id,ch,verse,method){
  const total=sum(verse.text,method),l=letters(verse.text,method),w=words(verse.text,method);
  const ref=reference(corpus,id,ch,verse.verse),lang=corpus==="torah"?"he":"ar";
  let html='<div class="detail-kicker">SELECTED PASSAGE</div><div class="detail-ref">'+safe(ref)+'</div>';
  html+='<div class="big-number">'+total.toLocaleString()+'</div><div class="big-number-label">'+safe(METHODS[method].name)+' · '+l.length+' counted letters</div>';
  html+='<div class="detail-text" lang="'+lang+'" dir="rtl">'+safe(verse.text)+'</div>';
  html+='<div class="detail-actions"><button type="button" id="copyRef">Copy link</button><button type="button" id="copySum">Copy value</button></div>';
  if(verse.opening)html+='<p class="aside-copy">The source places an unnumbered opening formula before this verse. Its sum is '+sum(verse.opening,method).toLocaleString()+'.</p>';
  html+='<div class="breakdown-heading">WORDS / '+w.length+'</div><div class="word-list">';
  html+=w.map(x=>'<div class="word-row"><span class="word" lang="'+lang+'">'+safe(x.word)+'</span><span class="word-value">'+x.sum+'</span></div>').join("");
  html+='</div><div class="breakdown-heading">COUNTED LETTERS / '+l.length+'</div><div class="letter-list">';
  html+=l.map(x=>'<span class="letter-token" title="'+safe(x.char+' → '+x.base+' = '+x.value)+'"><span class="glyph">'+safe(x.char)+'</span><span class="number">'+x.value+'</span></span>').join("");
  return html+'</div>';
}
export function optionHTML(c,index,active){
  return '<button type="button" class="collection-option '+(active?"active":"")+'" data-collection="'+safe(c.id)+'" aria-current="'+(active?"page":"false")+'"><span class="collection-num">'+String(index+1).padStart(2,"0")+'</span><span class="collection-name"><strong>'+safe(c.name)+'</strong><small>'+safe(c.subtitle||"")+'</small></span></button>';
}
export function resultHTML(item,description){
  return '<button type="button" class="search-result" data-go-corpus="'+item.corpus+'" data-go-id="'+safe(item.id)+'" data-go-ch="'+item.chapter+'" data-go-verse="'+item.verse+'"><strong>'+safe(description)+'</strong><span lang="'+(item.corpus==="torah"?"he":"ar")+'">'+safe(item.text.slice(0,180))+'</span></button>';
}
