const base = document.querySelector('link[rel="stylesheet"]')?.getAttribute('href')?.replace(/assets\/[^/]+$/, '') || '/blog/';
const codeBlocks = [...document.querySelectorAll('pre code')];
let highlightPromise;
let katexPromise;
let mermaidPromise;
const loadScript = (url, globalName) => new Promise((resolve,reject) => {
  if (window[globalName]) return resolve(window[globalName]);
  const script=document.createElement('script'); script.src=url; script.async=true;
  script.onload=()=>window[globalName] ? resolve(window[globalName]) : reject(new Error(`${globalName} failed to load`));
  script.onerror=()=>reject(new Error(`${globalName} failed to load`)); document.head.append(script);
});
const showNotice = (node, text) => { const n=document.createElement('p'); n.textContent=text; n.setAttribute('role','status'); node.after(n); };
const mathPattern=/\$\$|\$[^$\n]+\$|\\\(|\\\[/;
const article=document.querySelector('article');
const mathNodes=[];
if(article){const walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT,{acceptNode(node){if(node.parentElement?.closest('pre,code,script,style'))return NodeFilter.FILTER_REJECT;return mathPattern.test(node.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});while(walker.nextNode())mathNodes.push(walker.currentNode)}

if (codeBlocks.some(node => !/language-mermaid/.test(node.className))) {
  highlightPromise=loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js','hljs').then(hljs=>{
    for(const node of codeBlocks) if(!node.classList.contains('language-mermaid')) hljs.highlightElement(node);
    const link=document.createElement('link'); link.rel='stylesheet'; link.href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css'; document.head.append(link);
  }).catch(()=>{});
}

if (codeBlocks.some(node => node.classList.contains('language-mermaid'))) {
  mermaidPromise=loadScript('https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.min.js','mermaid').then(async mermaid=>{
    const dark=matchMedia('(prefers-color-scheme: dark)').matches;
    mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:dark?'dark':'default'});
    for(const [i,node] of codeBlocks.filter(n=>n.classList.contains('language-mermaid')).entries()){
      const source=node.textContent, pre=node.closest('pre'), container=document.createElement('div'); container.className='mermaid-diagram';
      try { container.innerHTML=(await mermaid.render(`mermaid-${i}-${crypto.randomUUID()}`,source)).svg; const details=document.createElement('details'),summary=document.createElement('summary'),sourceBlock=document.createElement('pre'),sourceCode=document.createElement('code'); details.className='mermaid-source';summary.textContent='Diagram source';sourceCode.textContent=source;sourceBlock.append(sourceCode);details.append(summary,sourceBlock);container.append(details);pre.replaceWith(container); }
      catch { showNotice(pre,'Diagram rendering failed; the original source is shown.'); }
    }
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>location.reload());
  }).catch(()=>{ for(const node of codeBlocks.filter(n=>n.classList.contains('language-mermaid'))) showNotice(node.closest('pre'),'Mermaid could not load; the diagram source is shown.'); });
}

if (mathNodes.length) {
  katexPromise=(async()=>{
    const css=document.createElement('link'); css.rel='stylesheet'; css.href='https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'; document.head.append(css);
    const katex=await loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js','katex');
    for(const node of mathNodes){const fragment=document.createDocumentFragment(), text=node.nodeValue, regex=/\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g; let last=0,match; while((match=regex.exec(text))){fragment.append(document.createTextNode(text.slice(last,match.index))); const span=document.createElement('span'); try{katex.render(match[1]||match[2]||match[3]||match[4],span,{displayMode:!!(match[1]||match[4]),throwOnError:false,strict:'warn'});}catch{span.textContent=match[0]} fragment.append(span); last=regex.lastIndex;} fragment.append(document.createTextNode(text.slice(last))); node.replaceWith(fragment); }
  })().catch(()=>{});
}

for(const code of codeBlocks.filter(node=>node.classList.contains('language-python'))){
  const pre=code.closest('pre'),run=document.createElement('button'),cancel=document.createElement('button'),reset=document.createElement('button'),out=document.createElement('pre');
  run.type='button';run.textContent='Run Python';cancel.type='button';cancel.textContent='Cancel';cancel.hidden=true;reset.type='button';reset.textContent='Reset Python';out.className='python-output';out.setAttribute('aria-live','polite');pre.after(run,cancel,reset,out);
  let worker=null,request=0,running=false;
  run.addEventListener('click',()=>{if(running)return;const initializing=!worker;if(!worker){worker=new Worker(`${base}python.worker.js`);worker.onmessage=e=>{if(e.data.id!==request)return;const parts=[e.data.stdout,e.data.stderr&&`stderr:\n${e.data.stderr}`,e.data.result&&`Result:\n${e.data.result}`,e.data.error&&`Error:\n${e.data.error}`].filter(Boolean);out.textContent=parts.join('\n')||'[Completed with no output]';running=false;run.disabled=false;cancel.hidden=true};worker.onerror=e=>{out.textContent=e.message||'Python worker failed.';worker?.terminate();worker=null;running=false;run.disabled=false;cancel.hidden=true}}const id=++request;running=true;run.disabled=true;cancel.hidden=false;out.textContent=initializing?'Starting Python…':'Running Python…';worker.postMessage({id,code:code.textContent})});
  const resetWorker=message=>{worker?.terminate();worker=null;request++;running=false;run.disabled=false;cancel.hidden=true;out.textContent=message};
  cancel.addEventListener('click',()=>resetWorker('Execution cancelled. Worker terminated.'));
  reset.addEventListener('click',()=>resetWorker('Python worker reset.'));
}
