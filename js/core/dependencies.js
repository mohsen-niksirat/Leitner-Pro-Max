// Lazy loader for heavy dependencies
let _deps={chartjs:null,pdfjs:null,jszip:null};
let _depLoading={};
export async function loadDep(name,url,globalCheck){
  if(globalCheck&&globalCheck())return _deps[name]=true;
  if(_depLoading[name])return _depLoading[name];
  _depLoading[name]=new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=url;
    s.onload=()=>{_deps[name]=true;resolve()};
    s.onerror=ev=>{reject(new Error('load failed: '+name+' — '+((ev&&ev.message)||ev.type||'network'))) };
    document.head.appendChild(s);
  });
  return _depLoading[name];
}
export function ensureChartJs(){return loadDep('chartjs','https://cdn.jsdelivr.net/npm/chart.js@4',()=>!!window.Chart)}
export function ensurePdfJs(){return loadDep('pdfjs','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>!!window.pdfjsLib)}
export function ensureJsZip(){return loadDep('jszip','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',()=>!!window.JSZip)}
