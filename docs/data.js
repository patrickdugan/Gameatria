export const books=[
  {id:"Gen",name:"Genesis",hebrew:"בראשית",subtitle:"Bereshit"},
  {id:"Exod",name:"Exodus",hebrew:"שמות",subtitle:"Shemot"},
  {id:"Lev",name:"Leviticus",hebrew:"ויקרא",subtitle:"Vayikra"},
  {id:"Num",name:"Numbers",hebrew:"במדבר",subtitle:"Bemidbar"},
  {id:"Deut",name:"Deuteronomy",hebrew:"דברים",subtitle:"Devarim"}
];
export const db={torah:new Map(),quran:new Map(),surahs:[],warnings:[]};
const origins={
  torah:"https://raw.githubusercontent.com/midvash/bible-data/main/versions/he/wlc/books/",
  quran:"https://raw.githubusercontent.com/acfatah/tanzil/main/data/quran-uthmani.txt"
};
async function readOne(urls){
  let error;
  for(const url of urls){
    try{const r=await fetch(url);if(!r.ok)throw Error("HTTP "+r.status);return await r.text()}
    catch(e){error=e}
  }
  throw error;
}
export async function loadLibrary(){
  const tasks=books.map(async b=>{
    const path=b.id+".json";
    const urls=[b.id==="Deut"?null:"./data/torah-"+path,origins.torah+path,
      "https://cdn.jsdelivr.net/gh/midvash/bible-data@main/versions/he/wlc/books/"+path].filter(Boolean);
    try{const j=JSON.parse(await readOne(urls));db.torah.set(b.id,j)}
    catch(e){db.warnings.push(b.name+": "+e.message)}
  });
  tasks.push((async()=>{
    try{
      const text=await readOne([origins.quran,"https://cdn.jsdelivr.net/gh/acfatah/tanzil@main/data/quran-uthmani.txt"]);
      for(const line of text.split(/\r?\n/)){
        const m=/^(\d+)\|(\d+)\|(.*)$/.exec(line);
        if(!m)continue;
        const surah=Number(m[1]),verse=Number(m[2]),raw=m[3];
        let entry={verse,text:raw,raw,opening:null};
        if(verse===1&&surah!==1&&surah!==9){
          const parts=raw.split(" ");
          if(parts.length>=5){entry.opening=parts.slice(0,4).join(" ");entry.text=parts.slice(4).join(" ")}
          else db.warnings.push("Unexpected opening in surah "+surah);
        }
        if(!db.quran.has(surah))db.quran.set(surah,[]);
        db.quran.get(surah).push(entry);
      }
      const total=[...db.quran.values()].reduce((n,a)=>n+a.length,0);
      if(total!==6236)db.warnings.push("Quran count "+total+" differs from 6,236");
    }catch(e){db.warnings.push("Quran: "+e.message)}
  })());
  tasks.push((async()=>{
    try{db.surahs=JSON.parse(await readOne(["./data/surahs.json"]))}
    catch(e){db.warnings.push("Surah metadata: "+e.message)}
  })());
  await Promise.all(tasks);
  const tcount=[...db.torah.values()].reduce((n,b)=>n+b.chapters.reduce((x,c)=>x+c.verses.length,0),0);
  if(db.torah.size===5&&tcount!==5853)db.warnings.push("Torah count "+tcount+" differs from 5,853");
  return db;
}
export function collections(corpus){
  if(corpus==="torah")return books.filter(b=>db.torah.has(b.id)).map(b=>({...b,chapters:db.torah.get(b.id).chapters.length}));
  return db.surahs.filter(s=>db.quran.has(s.n)).map(s=>({id:String(s.n),name:s.name,subtitle:s.english,chapters:1}));
}
export function sequence(corpus){
  if(corpus==="quran")return collections("quran").map(s=>({id:s.id,chapter:1}));
  return collections("torah").flatMap(b=>Array.from({length:b.chapters},(_,i)=>({id:b.id,chapter:i+1})));
}
export function chapterVerses(corpus,id,ch){
  if(corpus==="torah")return db.torah.get(id)?.chapters[ch-1]?.verses.map(v=>({verse:v.number,text:v.text,raw:v.text,opening:null}))||[];
  return db.quran.get(Number(id))||[];
}
export function lookup(corpus,id,ch,verse){return chapterVerses(corpus,id,ch).find(v=>v.verse===Number(verse))||null}
export function label(corpus,id){return collections(corpus).find(b=>b.id===String(id))}
export function reference(corpus,id,ch,verse){
  return corpus==="torah"?id+" "+ch+":"+verse:id+":"+verse;
}
export function allVerses(){
  const result=[];
  for(const b of books){
    const chapters=db.torah.get(b.id)?.chapters||[];
    for(const c of chapters)for(const v of c.verses)result.push({corpus:"torah",id:b.id,chapter:c.chapter,verse:v.number,text:v.text});
  }
  for(const [id,verses] of db.quran)for(const v of verses)result.push({corpus:"quran",id:String(id),chapter:1,verse:v.verse,text:v.text});
  return result;
}
