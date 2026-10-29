export const METHODS={
  standard:{corpus:"torah",name:"Standard"},
  gadol:{corpus:"torah",name:"Finals 500–900"},
  ordinal:{corpus:"torah",name:"Ordinal"},
  katan:{corpus:"torah",name:"Reduced"},
  eastern:{corpus:"quran",name:"Eastern abjad"},
  western:{corpus:"quran",name:"Western abjad"}
};
const hebrew="אבגדהוזחטיכלמנסעפצקרשת";
const hebNum=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400];
const finalLetters={"ך":"כ","ם":"מ","ן":"נ","ף":"פ","ץ":"צ"};
const largeFinals={"ך":500,"ם":600,"ן":700,"ף":800,"ץ":900};
const arabic="ابجدهوزحطيكلمنسعفصقرشتثخذضظغ";
const arabNum=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000];
const variants={"أ":"ا","إ":"ا","آ":"ا","ٱ":"ا","ء":"ا","ؤ":"و","ئ":"ي","ى":"ي","ة":"ه"};
const west={"س":300,"ص":60,"ش":1000,"ض":90,"ظ":800,"غ":900};
export function valueOf(char,method){
  if(METHODS[method]?.corpus==="torah"){
    const base=finalLetters[char]||char;const pos=hebrew.indexOf(base);if(pos<0)return null;
    let value=hebNum[pos];
    if(method==="gadol"&&largeFinals[char])value=largeFinals[char];
    if(method==="ordinal")value=pos+1;
    if(method==="katan")value=(value-1)%9+1;
    return {char,base,value};
  }
  if(METHODS[method]?.corpus==="quran"){
    if(char==="\u0654"||char==="\u0655")return {char,base:"ء",value:1};
    const base=variants[char]||char;const pos=arabic.indexOf(base);if(pos<0)return null;
    const value=method==="western"&&west[base]?west[base]:arabNum[pos];
    return {char,base,value};
  }
  return null;
}
export function letters(text,method){return Array.from(String(text).normalize("NFC")).map(c=>valueOf(c,method)).filter(Boolean)}
export function sum(text,method){return letters(text,method).reduce((acc,x)=>acc+x.value,0)}
export function words(text,method){return String(text).split(/[\s\u05BE\u05C0\u05C3،؛.,!?]+/u).filter(Boolean).map(word=>({word,sum:sum(word,method)}))}
export function fold(text){return String(text).normalize("NFKD").replace(/\p{Mark}/gu,"").replace(/[ךםןףץ]/gu,c=>finalLetters[c]).replace(/[أإآٱءؤئىة]/gu,c=>variants[c]||c).replace(/ـ/g,"").toLowerCase()}
