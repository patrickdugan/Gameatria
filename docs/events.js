export function wireEvents(api){
 const $=id=>document.getElementById(id);
 $("torahTab").onclick=()=>api.flipCorpus("torah");
 $("quranTab").onclick=()=>api.flipCorpus("quran");
 $("collectionList").onclick=e=>{const el=e.target.closest("[data-collection]");if(el)api.navigate(el.dataset.collection,1,1)};
 $("collectionFilter").oninput=api.renderCollectionList;
 $("chapterSelect").onchange=e=>{const p=api.chapters()[Number(e.target.value)];if(p)api.navigate(p.id,p.chapter,1)};
 $("prevChapter").onclick=()=>api.nextPage(-1);
 $("nextChapter").onclick=()=>api.nextPage(1);
 $("methodSelect").onchange=e=>api.updateMethod(e.target.value);
 $("toggleMarks").onclick=api.toggleMarks;
 $("loadMore").onclick=api.appendChapter;
 $("chapterBlocks").onclick=e=>{const el=e.target.closest(".verse-card");if(el)api.selectVerse(el.dataset.id,Number(el.dataset.ch),Number(el.dataset.verse))};
 const about=$("aboutDialog");
 $("aboutButton").onclick=()=>about.showModal();
 $("footnoteAbout").onclick=()=>about.showModal();
 $("closeAbout").onclick=()=>about.close();
 $("doneAbout").onclick=()=>about.close();
 $("closeSearch").onclick=()=>$("searchDialog").close();
}
