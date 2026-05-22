(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var t=e();function n(e){t=e}var r=/[&<>"']/,i=new RegExp(r.source,`g`),a=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,o=new RegExp(a.source,`g`),s={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},c=e=>s[e];function l(e,t){if(t){if(r.test(e))return e.replace(i,c)}else if(a.test(e))return e.replace(o,c);return e}var u=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;function d(e){return e.replace(u,(e,t)=>(t=t.toLowerCase(),t===`colon`?`:`:t.charAt(0)===`#`?t.charAt(1)===`x`?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):``))}var f=/(^|[^\[])\^/g;function p(e,t){let n=typeof e==`string`?e:e.source;t||=``;let r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(f,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}function m(e){try{e=encodeURI(e).replace(/%25/g,`%`)}catch{return null}return e}var h={exec:()=>null};function g(e,t){let n=e.replace(/\|/g,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(/ \|/),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``);for(;r<n.length;r++)n[r]=n[r].trim().replace(/\\\|/g,`|`);return n}function _(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function ee(e,t){if(e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return-1}function v(e,t,n,r){let i=t.href,a=t.title?l(t.title):null,o=e[1].replace(/\\([\[\]])/g,`$1`);if(e[0].charAt(0)!==`!`){r.state.inLink=!0;let e={type:`link`,raw:n,href:i,title:a,text:o,tokens:r.inlineTokens(o)};return r.state.inLink=!1,e}return{type:`image`,raw:n,href:i,title:a,text:l(o)}}function te(e,t){let n=e.match(/^(\s+)(?:```)/);if(n===null)return t;let r=n[1];return t.split(`
`).map(e=>{let t=e.match(/^\s+/);if(t===null)return e;let[n]=t;return n.length>=r.length?e.slice(r.length):e}).join(`
`)}var y=class{options;rules;lexer;constructor(e){this.options=e||t}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=t[0].replace(/^ {1,4}/gm,``);return{type:`code`,raw:t[0],codeBlockStyle:`indented`,text:this.options.pedantic?e:_(e,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=te(e,t[3]||``);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(/#$/.test(e)){let t=_(e,`#`);(this.options.pedantic||!t||/ $/.test(t))&&(e=t.trim())}return{type:`heading`,raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:t[0]}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=t[0].replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,`
    $1`);e=_(e.replace(/^ *>[ \t]?/gm,``),`
`);let n=this.lexer.state.top;this.lexer.state.top=!0;let r=this.lexer.blockTokens(e);return this.lexer.state.top=n,{type:`blockquote`,raw:t[0],tokens:r,text:e}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),r=n.length>1,i={type:`list`,raw:``,ordered:r,start:r?+n.slice(0,-1):``,loose:!1,items:[]};n=r?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=r?n:`[*+-]`);let a=RegExp(`^( {0,3}${n})((?:[\t ][^\\n]*)?(?:\\n|$))`),o=``,s=``,c=!1;for(;e;){let n=!1;if(!(t=a.exec(e))||this.rules.block.hr.test(e))break;o=t[0],e=e.substring(o.length);let r=t[2].split(`
`,1)[0].replace(/^\t+/,e=>` `.repeat(3*e.length)),l=e.split(`
`,1)[0],u=0;this.options.pedantic?(u=2,s=r.trimStart()):(u=t[2].search(/[^ ]/),u=u>4?1:u,s=r.slice(u),u+=t[1].length);let d=!1;if(!r&&/^ *$/.test(l)&&(o+=l+`
`,e=e.substring(l.length+1),n=!0),!n){let t=RegExp(`^ {0,${Math.min(3,u-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`),n=RegExp(`^ {0,${Math.min(3,u-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),i=RegExp(`^ {0,${Math.min(3,u-1)}}(?:\`\`\`|~~~)`),a=RegExp(`^ {0,${Math.min(3,u-1)}}#`);for(;e;){let c=e.split(`
`,1)[0];if(l=c,this.options.pedantic&&(l=l.replace(/^ {1,4}(?=( {4})*[^ ])/g,`  `)),i.test(l)||a.test(l)||t.test(l)||n.test(e))break;if(l.search(/[^ ]/)>=u||!l.trim())s+=`
`+l.slice(u);else{if(d||r.search(/[^ ]/)>=4||i.test(r)||a.test(r)||n.test(r))break;s+=`
`+l}!d&&!l.trim()&&(d=!0),o+=c+`
`,e=e.substring(c.length+1),r=l.slice(u)}}i.loose||(c?i.loose=!0:/\n *\n *$/.test(o)&&(c=!0));let f=null,p;this.options.gfm&&(f=/^\[[ xX]\] /.exec(s),f&&(p=f[0]!==`[ ] `,s=s.replace(/^\[[ xX]\] +/,``))),i.items.push({type:`list_item`,raw:o,task:!!f,checked:p,loose:!1,text:s,tokens:[]}),i.raw+=o}i.items[i.items.length-1].raw=o.trimEnd(),i.items[i.items.length-1].text=s.trimEnd(),i.raw=i.raw.trimEnd();for(let e=0;e<i.items.length;e++)if(this.lexer.state.top=!1,i.items[e].tokens=this.lexer.blockTokens(i.items[e].text,[]),!i.loose){let t=i.items[e].tokens.filter(e=>e.type===`space`);i.loose=t.length>0&&t.some(e=>/\n.*\n/.test(e.raw))}if(i.loose)for(let e=0;e<i.items.length;e++)i.items[e].loose=!0;return i}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:`html`,block:!0,raw:t[0],pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let e=t[1].toLowerCase().replace(/\s+/g,` `),n=t[2]?t[2].replace(/^<(.*)>$/,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:t[0],href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!/[:|]/.test(t[2]))return;let n=g(t[1]),r=t[2].replace(/^\||\| *$/g,``).split(`|`),i=t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,``).split(`
`):[],a={type:`table`,raw:t[0],header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)/^ *-+: *$/.test(e)?a.align.push(`right`):/^ *:-+: *$/.test(e)?a.align.push(`center`):/^ *:-+ *$/.test(e)?a.align.push(`left`):a.align.push(null);for(let e of n)a.header.push({text:e,tokens:this.lexer.inline(e)});for(let e of i)a.rows.push(g(e,a.header.length).map(e=>({text:e,tokens:this.lexer.inline(e)})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t)return{type:`heading`,raw:t[0],depth:t[2].charAt(0)===`=`?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:l(t[1])}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let e=t[2].trim();if(!this.options.pedantic&&/^</.test(e)){if(!/>$/.test(e))return;let t=_(e.slice(0,-1),`\\`);if((e.length-t.length)%2==0)return}else{let e=ee(t[2],`()`);if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let n=t[2],r=``;if(this.options.pedantic){let e=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);e&&(n=e[1],r=e[3])}else r=t[3]?t[3].slice(1,-1):``;return n=n.trim(),/^</.test(n)&&(n=this.options.pedantic&&!/>$/.test(e)?n.slice(1):n.slice(1,-1)),v(t,{href:n&&n.replace(this.rules.inline.anyPunctuation,`$1`),title:r&&r.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let e=t[(n[2]||n[1]).replace(/\s+/g,` `).toLowerCase()];if(!e){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return v(n,e,n[0],this.lexer)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(r&&!(r[3]&&n.match(/[\p{L}\p{N}]/u))&&(!(r[1]||r[2])||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=0,c=r[0][0]===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,t=t.slice(-1*e.length+n);(r=c.exec(t))!=null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i)continue;if(a=[...i].length,r[3]||r[4]){o+=a;continue}else if((r[5]||r[6])&&n%3&&!((n+a)%3)){s+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o+s);let t=[...r[0]][0].length,c=e.slice(0,n+r.index+t+a);if(Math.min(n,a)%2){let e=c.slice(1,-1);return{type:`em`,raw:c,text:e,tokens:this.lexer.inlineTokens(e)}}let l=c.slice(2,-2);return{type:`strong`,raw:c,text:l,tokens:this.lexer.inlineTokens(l)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(/\n/g,` `),n=/[^ ]/.test(e),r=/^ /.test(e)&&/ $/.test(e);return n&&r&&(e=e.substring(1,e.length-1)),e=l(e,!0),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e){let t=this.rules.inline.del.exec(e);if(t)return{type:`del`,raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=l(t[1]),n=`mailto:`+e):(e=l(t[1]),n=e),{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=l(t[0]),n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=l(t[0]),n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e;return e=this.lexer.state.inRawBlock?t[0]:l(t[0]),{type:`text`,raw:t[0],text:e}}}},ne=/^(?: *(?:\n|$))+/,re=/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,ie=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,b=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,ae=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,x=/(?:[*+-]|\d{1,9}[.)])/,S=p(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g,x).replace(/blockCode/g,/ {4}/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).getRegex(),C=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,oe=/^[^\n]+/,w=/(?!\s*\])(?:\\.|[^\[\]\\])+/,se=p(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/).replace(`label`,w).replace(`title`,/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),ce=p(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,x).getRegex(),T=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,E=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,le=p(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))`,`i`).replace(`comment`,E).replace(`tag`,T).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),D=p(C).replace(`hr`,b).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)]) `).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,T).getRegex(),O={blockquote:p(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace(`paragraph`,D).getRegex(),code:re,def:se,fences:ie,heading:ae,hr:b,html:le,lheading:S,list:ce,newline:ne,paragraph:D,table:h,text:oe},k=p(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,b).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,` {4}[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)]) `).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,T).getRegex(),ue={...O,table:k,paragraph:p(C).replace(`hr`,b).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,k).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace(`list`,` {0,3}(?:[*+-]|1[.)]) `).replace(`html`,`</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)`).replace(`tag`,T).getRegex()},de={...O,html:p(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace(`comment`,E).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:h,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:p(C).replace(`hr`,b).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,S).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},A=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,fe=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,j=/^( {2,}|\\)\n(?!\s*$)/,pe=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,M=`\\p{P}\\p{S}`,me=p(/^((?![*_])[\spunctuation])/,`u`).replace(/punctuation/g,M).getRegex(),he=/\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g,ge=p(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,`u`).replace(/punct/g,M).getRegex(),_e=p(`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])`,`gu`).replace(/punct/g,M).getRegex(),ve=p(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])`,`gu`).replace(/punct/g,M).getRegex(),ye=p(/\\([punct])/,`gu`).replace(/punct/g,M).getRegex(),be=p(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),xe=p(E).replace(`(?:-->|$)`,`-->`).getRegex(),Se=p(`^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,xe).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),N=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,Ce=p(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace(`label`,N).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace(`title`,/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),P=p(/^!?\[(label)\]\[(ref)\]/).replace(`label`,N).replace(`ref`,w).getRegex(),F=p(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,w).getRegex(),I={_backpedal:h,anyPunctuation:ye,autolink:be,blockSkip:he,br:j,code:fe,del:h,emStrongLDelim:ge,emStrongRDelimAst:_e,emStrongRDelimUnd:ve,escape:A,link:Ce,nolink:F,punctuation:me,reflink:P,reflinkSearch:p(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,P).replace(`nolink`,F).getRegex(),tag:Se,text:pe,url:h},we={...I,link:p(/^!?\[(label)\]\((.*?)\)/).replace(`label`,N).getRegex(),reflink:p(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,N).getRegex()},L={...I,escape:p(A).replace(`])`,`~|])`).getRegex(),url:p(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,`i`).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},Te={...L,br:p(j).replace(`{2,}`,`*`).getRegex(),text:p(L.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},R={normal:O,gfm:ue,pedantic:de},z={normal:I,gfm:L,breaks:Te,pedantic:we},B=class e{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||t,this.options.tokenizer=this.options.tokenizer||new y,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let n={block:R.normal,inline:z.normal};this.options.pedantic?(n.block=R.pedantic,n.inline=z.pedantic):this.options.gfm&&(n.block=R.gfm,this.options.breaks?n.inline=z.breaks:n.inline=z.gfm),this.tokenizer.rules=n}static get rules(){return{block:R,inline:z}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(/\r\n|\r/g,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[]){e=this.options.pedantic?e.replace(/\t/g,`    `).replace(/^ +$/gm,``):e.replace(/^( *)(\t+)/gm,(e,t,n)=>t+`    `.repeat(n.length));let n,r,i,a;for(;e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(r=>(n=r.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.space(e)){e=e.substring(n.raw.length),n.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(n);continue}if(n=this.tokenizer.code(e)){e=e.substring(n.raw.length),r=t[t.length-1],r&&(r.type===`paragraph`||r.type===`text`)?(r.raw+=`
`+n.raw,r.text+=`
`+n.text,this.inlineQueue[this.inlineQueue.length-1].src=r.text):t.push(n);continue}if(n=this.tokenizer.fences(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.heading(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.hr(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.blockquote(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.list(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.html(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.def(e)){e=e.substring(n.raw.length),r=t[t.length-1],r&&(r.type===`paragraph`||r.type===`text`)?(r.raw+=`
`+n.raw,r.text+=`
`+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=r.text):this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title});continue}if(n=this.tokenizer.table(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.lheading(e)){e=e.substring(n.raw.length),t.push(n);continue}if(i=e,this.options.extensions&&this.options.extensions.startBlock){let t=1/0,n=e.slice(1),r;this.options.extensions.startBlock.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(this.state.top&&(n=this.tokenizer.paragraph(i))){r=t[t.length-1],a&&r.type===`paragraph`?(r.raw+=`
`+n.raw,r.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=r.text):t.push(n),a=i.length!==e.length,e=e.substring(n.raw.length);continue}if(n=this.tokenizer.text(e)){e=e.substring(n.raw.length),r=t[t.length-1],r&&r.type===`text`?(r.raw+=`
`+n.raw,r.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=r.text):t.push(n);continue}if(e){let t=`Infinite loop on byte: `+e.charCodeAt(0);if(this.options.silent){console.error(t);break}else throw Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,r,i,a=e,o,s,c;if(this.tokens.links){let e=Object.keys(this.tokens.links);if(e.length>0)for(;(o=this.tokenizer.rules.inline.reflinkSearch.exec(a))!=null;)e.includes(o[0].slice(o[0].lastIndexOf(`[`)+1,-1))&&(a=a.slice(0,o.index)+`[`+`a`.repeat(o[0].length-2)+`]`+a.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(o=this.tokenizer.rules.inline.blockSkip.exec(a))!=null;)a=a.slice(0,o.index)+`[`+`a`.repeat(o[0].length-2)+`]`+a.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(o=this.tokenizer.rules.inline.anyPunctuation.exec(a))!=null;)a=a.slice(0,o.index)+`++`+a.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(s||(c=``),s=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(r=>(n=r.call({lexer:this},e,t))?(e=e.substring(n.raw.length),t.push(n),!0):!1))){if(n=this.tokenizer.escape(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.tag(e)){e=e.substring(n.raw.length),r=t[t.length-1],r&&n.type===`text`&&r.type===`text`?(r.raw+=n.raw,r.text+=n.text):t.push(n);continue}if(n=this.tokenizer.link(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(n.raw.length),r=t[t.length-1],r&&n.type===`text`&&r.type===`text`?(r.raw+=n.raw,r.text+=n.text):t.push(n);continue}if(n=this.tokenizer.emStrong(e,a,c)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.codespan(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.br(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.del(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.autolink(e)){e=e.substring(n.raw.length),t.push(n);continue}if(!this.state.inLink&&(n=this.tokenizer.url(e))){e=e.substring(n.raw.length),t.push(n);continue}if(i=e,this.options.extensions&&this.options.extensions.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(n=this.tokenizer.inlineText(i)){e=e.substring(n.raw.length),n.raw.slice(-1)!==`_`&&(c=n.raw.slice(-1)),s=!0,r=t[t.length-1],r&&r.type===`text`?(r.raw+=n.raw,r.text+=n.text):t.push(n);continue}if(e){let t=`Infinite loop on byte: `+e.charCodeAt(0);if(this.options.silent){console.error(t);break}else throw Error(t)}}return t}},V=class{options;constructor(e){this.options=e||t}code(e,t,n){let r=(t||``).match(/^\S*/)?.[0];return e=e.replace(/\n$/,``)+`
`,r?`<pre><code class="language-`+l(r)+`">`+(n?e:l(e,!0))+`</code></pre>
`:`<pre><code>`+(n?e:l(e,!0))+`</code></pre>
`}blockquote(e){return`<blockquote>\n${e}</blockquote>\n`}html(e,t){return e}heading(e,t,n){return`<h${t}>${e}</h${t}>\n`}hr(){return`<hr>
`}list(e,t,n){let r=t?`ol`:`ul`,i=t&&n!==1?` start="`+n+`"`:``;return`<`+r+i+`>
`+e+`</`+r+`>
`}listitem(e,t,n){return`<li>${e}</li>\n`}checkbox(e){return`<input `+(e?`checked="" `:``)+`disabled="" type="checkbox">`}paragraph(e){return`<p>${e}</p>\n`}table(e,t){return t&&=`<tbody>${t}</tbody>`,`<table>
<thead>
`+e+`</thead>
`+t+`</table>
`}tablerow(e){return`<tr>\n${e}</tr>\n`}tablecell(e,t){let n=t.header?`th`:`td`;return(t.align?`<${n} align="${t.align}">`:`<${n}>`)+e+`</${n}>\n`}strong(e){return`<strong>${e}</strong>`}em(e){return`<em>${e}</em>`}codespan(e){return`<code>${e}</code>`}br(){return`<br>`}del(e){return`<del>${e}</del>`}link(e,t,n){let r=m(e);if(r===null)return n;e=r;let i=`<a href="`+e+`"`;return t&&(i+=` title="`+t+`"`),i+=`>`+n+`</a>`,i}image(e,t,n){let r=m(e);if(r===null)return n;e=r;let i=`<img src="${e}" alt="${n}"`;return t&&(i+=` title="${t}"`),i+=`>`,i}text(e){return e}},H=class{strong(e){return e}em(e){return e}codespan(e){return e}del(e){return e}html(e){return e}text(e){return e}link(e,t,n){return``+n}image(e,t,n){return``+n}br(){return``}},U=class e{options;renderer;textRenderer;constructor(e){this.options=e||t,this.options.renderer=this.options.renderer||new V,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new H}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e,t=!0){let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){let e=i,t=this.options.extensions.renderers[e.type].call({parser:this},e);if(t!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`html`,`paragraph`,`text`].includes(e.type)){n+=t||``;continue}}switch(i.type){case`space`:continue;case`hr`:n+=this.renderer.hr();continue;case`heading`:{let e=i;n+=this.renderer.heading(this.parseInline(e.tokens),e.depth,d(this.parseInline(e.tokens,this.textRenderer)));continue}case`code`:{let e=i;n+=this.renderer.code(e.text,e.lang,!!e.escaped);continue}case`table`:{let e=i,t=``,r=``;for(let t=0;t<e.header.length;t++)r+=this.renderer.tablecell(this.parseInline(e.header[t].tokens),{header:!0,align:e.align[t]});t+=this.renderer.tablerow(r);let a=``;for(let t=0;t<e.rows.length;t++){let n=e.rows[t];r=``;for(let t=0;t<n.length;t++)r+=this.renderer.tablecell(this.parseInline(n[t].tokens),{header:!1,align:e.align[t]});a+=this.renderer.tablerow(r)}n+=this.renderer.table(t,a);continue}case`blockquote`:{let e=i,t=this.parse(e.tokens);n+=this.renderer.blockquote(t);continue}case`list`:{let e=i,t=e.ordered,r=e.start,a=e.loose,o=``;for(let t=0;t<e.items.length;t++){let n=e.items[t],r=n.checked,i=n.task,s=``;if(n.task){let e=this.renderer.checkbox(!!r);a?n.tokens.length>0&&n.tokens[0].type===`paragraph`?(n.tokens[0].text=e+` `+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&n.tokens[0].tokens[0].type===`text`&&(n.tokens[0].tokens[0].text=e+` `+n.tokens[0].tokens[0].text)):n.tokens.unshift({type:`text`,text:e+` `}):s+=e+` `}s+=this.parse(n.tokens,a),o+=this.renderer.listitem(s,i,!!r)}n+=this.renderer.list(o,t,r);continue}case`html`:{let e=i;n+=this.renderer.html(e.text,e.block);continue}case`paragraph`:{let e=i;n+=this.renderer.paragraph(this.parseInline(e.tokens));continue}case`text`:{let a=i,o=a.tokens?this.parseInline(a.tokens):a.text;for(;r+1<e.length&&e[r+1].type===`text`;)a=e[++r],o+=`
`+(a.tokens?this.parseInline(a.tokens):a.text);n+=t?this.renderer.paragraph(o):o;continue}default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}parseInline(e,t){t||=this.renderer;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e||``;continue}}switch(i.type){case`escape`:{let e=i;n+=t.text(e.text);break}case`html`:{let e=i;n+=t.html(e.text);break}case`link`:{let e=i;n+=t.link(e.href,e.title,this.parseInline(e.tokens,t));break}case`image`:{let e=i;n+=t.image(e.href,e.title,e.text);break}case`strong`:{let e=i;n+=t.strong(this.parseInline(e.tokens,t));break}case`em`:{let e=i;n+=t.em(this.parseInline(e.tokens,t));break}case`codespan`:{let e=i;n+=t.codespan(e.text);break}case`br`:n+=t.br();break;case`del`:{let e=i;n+=t.del(this.parseInline(e.tokens,t));break}case`text`:{let e=i;n+=t.text(e.text);break}default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},W=class{options;constructor(e){this.options=e||t}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}},G=class{defaults=e();options=this.setOptions;parse=this.#e(B.lex,U.parse);parseInline=this.#e(B.lexInline,U.parseInline);Parser=U;Renderer=V;TextRenderer=H;Lexer=B;Tokenizer=y;Hooks=W;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(n=n.concat(t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)n=n.concat(this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)n=n.concat(this.walkTokens(e.tokens,t));break}case`list`:{let e=r;n=n.concat(this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);n=n.concat(this.walkTokens(i,t))}):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new V(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if(n===`options`)continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n||``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new y(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new W;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if(n===`options`)continue;let r=n,i=e.hooks[r],a=t[r];W.passThroughHooks.has(n)?t[r]=e=>{if(this.defaults.async)return Promise.resolve(i.call(t,e)).then(e=>a.call(t,e));let n=i.call(t,e);return a.call(t,n)}:t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return B.lex(e,t??this.defaults)}parser(e,t){return U.parse(e,t??this.defaults)}#e(e,t){return(n,r)=>{let i={...r},a={...this.defaults,...i};this.defaults.async===!0&&i.async===!1&&(a.silent||console.warn(`marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored.`),a.async=!0);let o=this.#t(!!a.silent,!!a.async);if(n==null)return o(Error(`marked(): input parameter is undefined or null`));if(typeof n!=`string`)return o(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(n)+`, string expected`));if(a.hooks&&(a.hooks.options=a),a.async)return Promise.resolve(a.hooks?a.hooks.preprocess(n):n).then(t=>e(t,a)).then(e=>a.hooks?a.hooks.processAllTokens(e):e).then(e=>a.walkTokens?Promise.all(this.walkTokens(e,a.walkTokens)).then(()=>e):e).then(e=>t(e,a)).then(e=>a.hooks?a.hooks.postprocess(e):e).catch(o);try{a.hooks&&(n=a.hooks.preprocess(n));let r=e(n,a);a.hooks&&(r=a.hooks.processAllTokens(r)),a.walkTokens&&this.walkTokens(r,a.walkTokens);let i=t(r,a);return a.hooks&&(i=a.hooks.postprocess(i)),i}catch(e){return o(e)}}}#t(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+l(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}},K=new G;function q(e,t){return K.parse(e,t)}q.options=q.setOptions=function(e){return K.setOptions(e),q.defaults=K.defaults,n(q.defaults),q},q.getDefaults=e,q.defaults=t,q.use=function(...e){return K.use(...e),q.defaults=K.defaults,n(q.defaults),q},q.walkTokens=function(e,t){return K.walkTokens(e,t)},q.parseInline=K.parseInline,q.Parser=U,q.parser=U.parse,q.Renderer=V,q.TextRenderer=H,q.Lexer=B,q.lexer=B.lex,q.Tokenizer=y,q.Hooks=W,q.parse=q,q.options,q.setOptions,q.use,q.walkTokens,q.parseInline,U.parse,B.lex;var Ee=new G,J=[],De=document.getElementById(`sqlite-status`),Oe=document.getElementById(`sqlite-status-text`),Y=document.getElementById(`main-view`);function X(e,t){De.className=`engine-badge status-${e}`,Oe.textContent=t}function ke(e){return e?e.replace(/\$\$[\s\S]*?\$\$/g,``).replace(/\$[^\$]+\$/g,``).replace(/```[\s\S]*?```/g,``).replace(/`([^`]+)`/g,`$1`).replace(/\[([^\]]+)\]\([^\)]+\)/g,`$1`).replace(/[*_#\-+>]/g,` `).replace(/\s+/g,` `).trim():``}async function Z(){try{X(`loading`,`Index Booting...`);let e=new URL(`/blog/search_index.json`,window.location.origin).toString();console.log(`Connecting to remote search index: ${e}`);let t=await fetch(e);if(!t.ok)throw Error(`Failed to fetch search index: ${t.status} ${t.statusText}`);J=await t.json(),console.log(`Search index successfully loaded with ${J.length} posts.`),X(`connected`,`Index Active`),window.addEventListener(`hashchange`,Q),Q()}catch(e){console.error(`Failed to initialize search index:`,e),X(`error`,`Index Offline`),Y.innerHTML=`
      <div class="error-view">
        <div class="status-dot" style="background-color: hsl(0, 85%, 60%); width: 32px; height: 32px;"></div>
        <h2>Index Loading Failed</h2>
        <p>Could not fetch the pre-compiled search index JSON file. Please run the ingestion compiler script first or check browser console.</p>
        <button onclick="window.location.reload()" class="post-tag-badge" style="cursor: pointer; margin-top: 16px; padding: 10px 20px;">Retry Booting</button>
      </div>
    `}}function Q(){let e=window.location.hash||`#/`;document.querySelectorAll(`.nav-link`).forEach(e=>e.classList.remove(`active`)),e===`#/`||e===``?(document.getElementById(`nav-home`)?.classList.add(`active`),Ae()):e===`#/search`?(document.getElementById(`nav-search`)?.classList.add(`active`),je()):e===`#/about`?(document.getElementById(`nav-about`)?.classList.add(`active`),Pe()):e.startsWith(`#/post/`)?Ne(e.replace(`#/post/`,``)):$()}async function Ae(){Y.innerHTML=`
    <div class="loading-view">
      <div class="spinner"></div>
      <p>Fetching posts from JSON index...</p>
    </div>
  `;try{if(J.length===0){Y.innerHTML=`
        <div class="hero-section">
          <h1>Welcome to Cenz.Blog</h1>
          <p>A statically-compiled website using a client-side JSON index search.</p>
        </div>
        <div class="search-empty-state">
          <h3>No Posts Found</h3>
          <p>Run the content ingestion script to seed your articles database!</p>
        </div>
      `;return}Y.innerHTML=`
      <div class="hero-section">
        <h1>Welcome to Cenz.Blog</h1>
        <p>A statically-compiled website powered entirely by a client-side JSON search index.</p>
        <a href="#/about" class="symbiosis-hero-badge glass">
          <span class="pulse-dot"></span>
          <span class="badge-text">Distilled Knowledge from AI Collaboration &rarr;</span>
        </a>
      </div>
      
      <h2 class="section-title">Latest Articles</h2>
      <div class="posts-grid">
        ${J.map(e=>{let t=e.tags?e.tags.split(`,`)[0].trim():`Tech`;return`
        <a href="#/post/${e.slug}" class="post-card">
          <div>
            <div class="post-meta">
              <span class="post-date">${e.date}</span>
              <span class="post-tag">${t}</span>
            </div>
            <h3>${e.title}</h3>
            ${e.subtitle?`<h4 class="post-card-subtitle">${e.subtitle}</h4>`:``}
            <p>${e.description}</p>
          </div>
          <div class="post-readmore">
            Read Article <span>&rarr;</span>
          </div>
        </a>
      `}).join(``)}
      </div>
    `}catch(e){console.error(`Error loading home posts:`,e),Y.innerHTML=`<div class="error-view"><h2>Error Loading Posts</h2><p>${e.message}</p></div>`}}async function je(){Y.innerHTML=`
    <div class="search-page">
      <div class="search-header">
        <h1>Static Site Search</h1>
        <p>Query the pre-compiled in-memory index using direct client-side search.</p>
      </div>
      
      <div class="search-box-container">
        <!-- SVG Search Icon -->
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" id="search-box" class="search-input" placeholder="Type keywords (e.g. PySpark, Complexity, AQE)..." autocomplete="off">
      </div>
      
      <div id="search-stats" class="search-meta-results"></div>
      <div id="search-results" class="search-results-list">
        <div class="search-empty-state">
          <h3>Ready to Search</h3>
          <p>Start typing above to trigger real-time client-side keyword search.</p>
        </div>
      </div>
    </div>
  `;let e=document.getElementById(`search-box`),t=document.getElementById(`search-results`),n=document.getElementById(`search-stats`),r=null;e.focus(),e.addEventListener(`input`,e=>{clearTimeout(r);let i=e.target.value;r=setTimeout(()=>{Me(i,t,n)},150)})}async function Me(e,t,n){let r=e.trim().toLowerCase();if(!r){n.textContent=``,t.innerHTML=`
      <div class="search-empty-state">
        <h3>Ready to Search</h3>
        <p>Start typing above to trigger real-time client-side keyword search.</p>
      </div>
    `;return}let i=r.split(/\s+/).filter(e=>e.length>0);if(i.length!==0)try{let a=performance.now(),o=[];for(let e of J){let t=e.title.toLowerCase(),n=(e.subtitle||``).toLowerCase(),a=e.description.toLowerCase(),s=e.tags.toLowerCase(),c=ke(e.content),l=c.toLowerCase(),u=!0;for(let e of i)if(!t.includes(e)&&!n.includes(e)&&!a.includes(e)&&!s.includes(e)&&!l.includes(e)){u=!1;break}if(u){let u=0;i.forEach(e=>{t.startsWith(e)?u+=150:t.includes(e)&&(u+=100),n.includes(e)&&(u+=50),a.includes(e)&&(u+=30),s.includes(e)&&(u+=20);let r=l.split(e).length-1;u+=r*5}),t.includes(r)&&(u+=300),n.includes(r)&&(u+=200),a.includes(r)&&(u+=150),l.includes(r)&&(u+=80),o.push({post:e,contentStripped:c,score:u})}}o.sort((e,t)=>t.score-e.score);let s=(performance.now()-a).toFixed(1);if(o.length===0){n.textContent=`0 results found in ${s}ms`,t.innerHTML=`
        <div class="search-empty-state">
          <h3>No Results Found</h3>
          <p>We couldn't find any matches for "${e}". Try searching for other terms like 'PySpark' or 'Join'.</p>
        </div>
      `;return}n.textContent=`${o.length} result${o.length>1?`s`:``} found in ${s}ms`,t.innerHTML=o.map(({post:e,contentStripped:t})=>{let n=t.toLowerCase(),r=-1;for(let e of i){let t=n.indexOf(e);if(t!==-1){r=t;break}}let a=``;if(r!==-1){let e=Math.max(0,r-50);if(e>0){let n=t.indexOf(` `,e);n!==-1&&n<r&&(e=n+1)}let n=Math.min(t.length,r+110);if(n<t.length){let e=t.lastIndexOf(` `,n);e!==-1&&e>r&&(n=e)}a=t.substring(e,n),e>0&&(a=`...`+a),n<t.length&&(a+=`...`)}else a=e.description||t.substring(0,140)+`...`;let o=i.map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)),s=RegExp(`(${o.join(`|`)})`,`gi`);return a=a.replace(s,`<b>$1</b>`),`
        <a href="#/post/${e.slug}" class="search-result-card">
          <div class="post-meta" style="margin-bottom: 8px;">
            <span class="post-date">${e.date}</span>
            <span class="post-tag">${e.tags?e.tags.split(`,`)[0]:`Tech`}</span>
          </div>
          <h3>${e.title}</h3>
          ${e.subtitle?`<h4 class="post-card-subtitle">${e.subtitle}</h4>`:``}
          <p>${a}</p>
        </a>
      `}).join(``)}catch(e){console.error(`Search execution failed:`,e),n.textContent=`Error executing search`,t.innerHTML=`
      <div class="search-empty-state">
        <h3 style="color: hsl(0, 85%, 60%);">Search Error</h3>
        <p>${e.message}</p>
      </div>
    `}}async function Ne(e){Y.innerHTML=`
    <div class="loading-view">
      <div class="spinner"></div>
      <p>Fetching article content...</p>
    </div>
  `;try{let t=J.find(t=>t.slug===e);if(!t){$();return}let n=t.tags?t.tags.split(`,`).map(e=>e.trim()):[],r=t.format===`html`?t.content:Ee.parse(t.content);t.format!==`html`&&(r=r.replace(/\$\$(.*?)\$\$/gs,(e,t)=>{if(window.katex)try{return window.katex.renderToString(t.trim(),{displayMode:!0,throwOnError:!1})}catch(e){console.warn(`KaTeX error:`,e)}return`<div class="math-block">${t.trim()}</div>`}).replace(/\$(.*?)\$/g,(e,t)=>{if(window.katex)try{return window.katex.renderToString(t.trim(),{displayMode:!1,throwOnError:!1})}catch(e){console.warn(`KaTeX error:`,e)}return`<span class="math-inline">${t.trim().replace(/\\times/g,`×`).replace(/\\text\{([^}]+)\}/g,`$1`).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g,`($1/$2)`).replace(/\\log/g,`log`)}</span>`}));let i=``;i=t.author===`Cenz Wong & Gemini AI`?`
        <div class="meta-item author-block">
          <div class="author-avatars">
            <div class="avatar human" title="Cenz Wong">CW</div>
            <div class="avatar ai" title="Gemini AI">🤖</div>
          </div>
          <span class="author-names">Cenz &amp; Gemini AI</span>
          <span class="collaboration-badge" style="cursor: default;">
            <svg class="collab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            Distilled Dialogue
          </span>
        </div>
      `:`
        <div class="meta-item author-block">
          <span class="author-names" style="color: var(--text-secondary);">By ${t.author||`Cenz Wong`}</span>
        </div>
      `,Y.innerHTML=`
      <article class="post-view">
        <div class="post-header">
          <a href="#/" class="post-back-btn">
            &larr; Back to articles
          </a>
          <h1 class="post-title">${t.title}</h1>
          ${t.subtitle?`<h2 class="post-view-subtitle">${t.subtitle}</h2>`:``}
          <div class="post-header-meta">
            <div class="meta-item">
              <span><span class="date-label">Published on</span> ${t.date}</span>
            </div>
            ${i}
            <div class="post-tags" style="margin-left: auto;">
              ${n.map(e=>`<span class="post-tag-badge">${e}</span>`).join(``)}
            </div>
          </div>
        </div>
        
        <div class="post-body">
          ${r}
        </div>
      </article>
    `,window.hljs&&Y.querySelectorAll(`pre code`).forEach(e=>{window.hljs.highlightElement(e)}),window.scrollTo({top:0,behavior:`smooth`})}catch(e){console.error(`Error fetching article:`,e),Y.innerHTML=`<div class="error-view"><h2>Failed to Render Article</h2><p>${e.message}</p></div>`}}function Pe(){Y.innerHTML=`
    <div class="about-page">
      <h1>About Cenz.Blog</h1>
      <p>Cenz.Blog is a high-performance demonstration of zero-overhead serverless client-side search. In traditional static websites, searching is either offloaded to external paid APIs (e.g. Algolia) or handled by heavy JavaScript libraries that require downloading megabytes of bloated indices.</p>
      
      <p>This site solves that challenge by compiling a pre-rendered metadata and full-text index into a compact static JSON file at build time. During the initial application boot, this lightweight index is fetched and stored in-memory, enabling instant search queries directly in the user's browser.</p>
      
      <p>Because there is no heavy database compilation or runtime required in the client browser, the application loads instantaneously, runs with absolute zero server latency, and remains perfectly compatible with strict static hosting environments like <strong>GitHub Pages</strong>.</p>
      
      <h2 class="section-title">The Architecture Stack</h2>
      <div class="tech-grid">
        <div class="tech-card">
          <h3>JSON Indexing</h3>
          <p>Pre-rendered index generated during the build pipeline and loaded in-memory.</p>
        </div>
        <div class="tech-card">
          <h3>Weighted Search</h3>
          <p>Instant client-side prefix matching with weighted scoring across titles, tags, and content.</p>
        </div>
        <div class="tech-card">
          <h3>HTML Snippets</h3>
          <p>Real-time snippet extraction and bold highlights styled with premium CSS colors.</p>
        </div>
        <div class="tech-card">
          <h3>Vite & CSS</h3>
          <p>Vibrant styling with neon gradients, ambient glowing orbs, and glassmorphism elements.</p>
        </div>
      </div>
      
      <h2 class="section-title">Static Compilation Pipeline</h2>
      <p>At build-time, a Python compiler script runs, scanning all raw blog post Markdown files, parses the frontmatter metadata, structures the full-text body content, sorts posts chronologically, and compiles a single optimized <code>search_index.json</code> static asset. This file is deployed to GitHub Pages and served as a standard immutable asset, giving you rapid speeds and high search precision.</p>
      
      <h2 class="section-title" style="margin-top: 48px;">Distilled Knowledge from AI: The Dialogue Synthesis</h2>
      <p>Every deep-dive article on Cenz.Blog is not simply a solo creation or a generic AI output. Instead, they are high-density, rigorous summaries born from intensive <strong>human-AI dialectics</strong>. We challenge assumptions, stress-test execution logic, verify JVM thresholds, and refine computational complexities iteratively before compiling.</p>
      
      <div class="synthesis-pipeline">
        <div class="pipeline-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h3>Human Dialectic Spark</h3>
            <p>Identifying core distributed bottlenecks or algorithmic limits (e.g., Wide Join network limits, UDF JVM border serialization penalties).</p>
          </div>
        </div>
        
        <div class="pipeline-connector">
          <div class="connector-line"></div>
        </div>
        
        <div class="pipeline-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h3>Intense Dialogue Loop</h3>
            <p>Engaging in deep, recursive Q&A with Gemini to debug heap risks, GC footprints, AQE query adjustments, and mathematical Big-O bounds.</p>
          </div>
        </div>
        
        <div class="pipeline-connector">
          <div class="connector-line"></div>
        </div>
        
        <div class="pipeline-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h3>Stress Testing & Proofs</h3>
            <p>Formulating rigorous KaTeX formulas, comparing sort buffers, and ensuring accurate hardware behavior matching real-world systems.</p>
          </div>
        </div>
        
        <div class="pipeline-connector">
          <div class="connector-line"></div>
        </div>
        
        <div class="pipeline-step">
          <div class="step-num">4</div>
          <div class="step-content">
            <h3>Static Distillation</h3>
            <p>Structuring the messy raw dialogue into highly polished, Markdown-based documentation compiled directly into our client-side search index.</p>
          </div>
        </div>
      </div>
    </div>
  `}function $(){Y.innerHTML=`
    <div class="error-view">
      <h1 style="font-size: 5rem; font-weight: 800; color: var(--accent-primary);">404</h1>
      <h2>Article or Page Not Found</h2>
      <p>The page you are looking for does not exist or has been relocated.</p>
      <a href="#/" class="post-back-btn" style="margin-top: 16px;">
        &larr; Return to safety
      </a>
    </div>
  `}Z();