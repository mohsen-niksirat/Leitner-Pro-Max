// Lazy loader for heavy dependencies
window._deps={chartjs:null,pdfjs:null,jszip:null};
window._depLoading={};
async function loadDep(name,url,globalCheck){
  if(globalCheck&&globalCheck())return window._deps[name]=true;
  if(window._depLoading[name])return window._depLoading[name];
  window._depLoading[name]=new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=url;s.onload=()=>{window._deps[name]=true;resolve()};s.onerror=reject;
    document.head.appendChild(s);
  });
  return window._depLoading[name];
}
function ensureChartJs(){return loadDep('chartjs','https://cdn.jsdelivr.net/npm/chart.js@4',()=>!!window.Chart)}
function ensurePdfJs(){return loadDep('pdfjs','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>!!window.pdfjsLib)}
function ensureJsZip(){return loadDep('jszip','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',()=>!!window.JSZip)}
