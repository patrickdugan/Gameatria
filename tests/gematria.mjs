import test from "node:test";
import assert from "node:assert/strict";
import {sum,letters,valueOf,fold} from "../docs/numerals.js";
import {readFileSync} from "node:fs";
test("Genesis 1:1 standard gematria is 2701",()=>assert.equal(sum("בראשית ברא אלהים את השמים ואת הארץ","standard"),2701));
test("final Hebrew forms have explicit alternate values",()=>{
  assert.equal(sum("שלום","standard"),376);
  assert.equal(sum("שלום","gadol"),936);
});
test("opening formula eastern abjad is 786",()=>{
  assert.equal(sum("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ","eastern"),786);
});
test("muqattaat alif lam mim is 71",()=>assert.equal(sum("الٓمٓ","eastern"),71));
test("eastern and western variants differ",()=>{
  assert.equal(valueOf("ش","eastern").value,300);
  assert.equal(valueOf("ش","western").value,1000);
});
test("combining hamza on tatweel counts",()=>assert.equal(valueOf("\u0654","eastern").value,1));
test("diacritics do not change a total",()=>{
  assert.equal(sum("שָׁלוֹם","standard"),sum("שלום","standard"));
  assert.equal(fold("שָׁלוֹם"),fold("שלום"));
});
test("bundled WLC sections contain expected counts",()=>{
  const expected={Gen:1533,Exod:1213,Lev:859,Num:1289};
  for(const [id,n] of Object.entries(expected)){
    const d=JSON.parse(readFileSync(new URL("../docs/data/torah-"+id+".json",import.meta.url),"utf8"));
    assert.equal(d.chapters.reduce((s,c)=>s+c.verses.length,0),n);
  }
  const names=JSON.parse(readFileSync(new URL("../docs/data/surahs.json",import.meta.url),"utf8"));
  assert.equal(names.length,114);
});
