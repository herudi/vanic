"use strict";function e(e,t){return e.getAttribute?e.getAttribute(t):""}function t(t,n){return n?n in t&&"string"==typeof t[n]&&"href"!==n?t[n]:e(t,n):t.childNodes&&t.childNodes.length>0?null:t.textContent}function n(o,r){const c=r.childNodes,i=o.childNodes;let s=c.length-i.length;if(s>0)for(;s>0;s--)c[c.length-s].parentNode.removeChild(c[c.length-s]);i.forEach(((o,i)=>{if(!c[i])return void r.appendChild(o.cloneNode(!0));if(o.attributes&&o.attributes.length){let e=0;const n=o.attributes.length;for(;e<n;){const n=o.attributes[e];if(n.name){const e=n.name,r=t(o,e);r!==t(c[i],e)&&(e in c[i]?c[i][e]=r:c[i].setAttribute?.(e,r))}e++}}if(o.nodeType!==c[i].nodeType||o.tagName!==c[i].tagName||e(o,"style")!==e(c[i],"style"))return void c[i].parentNode.replaceChild(o.cloneNode(!0),c[i]);const s=t(o);if(s&&s!==t(c[i])&&(c[i].textContent=s),c[i].childNodes.length>0&&o.childNodes.length<1)c[i].innerHTML="";else{if(c[i].childNodes.length<1&&o.childNodes.length>0){const e=document.createDocumentFragment();return n(o,e),void c[i].appendChild(e)}o.childNodes.length>0&&n(o,c[i])}}))}let o,r;Object.defineProperty(exports,"__esModule",{value:!0});let c,i=[],s=0,l=0,u=0,f=[],a=[],d={};const p="dangerouslySetInnerHTML",h=e=>"function"==typeof e,g=(e,t)=>r.querySelector(`[c-${e}="${t}"]`),m=()=>c&&c.t.length;function y(e){if(h(e)&&(e=e()),"object"!=typeof e||null===e)return e;const t=e=>{const t=[];for(let n=0;n<e.length;n++)t.push(y(e[n]));return m()&&(c.t=[]),t.flat().join("")};if(Array.isArray(e))return t(e);if(!e.__c)return e;const n=A(e.comp)(e.props);return n.__c?y(n):Array.isArray(n)?t(n):n}function v(e){const t=A(e.comp?e.comp:e)(e.props||{}),c=document.createElement("div");c.innerHTML=t,n(c,r),i.forEach(((e,t)=>{const{key:n,value:o}=e;if("ref"!==n){const e=g(n,t);e&&(e[n]=o)}}));const l=f.map((e=>e.c));a.forEach((e=>{-1===l.indexOf(e.c)&&d[e.c]&&(d[e.c].s.forEach((e=>b(e,!0))),d[e.c]=void 0)})),f.forEach((e=>{var t;(t=d[e.c])&&(t.y.splice(0).forEach(x),t.e.length&&setTimeout((()=>t.e.splice(0).forEach(x)))),e.fn.i=0})),a=f,f=[],i=[],s=0,o=e}function b(e,t){h(e.c)&&(e.c(),e.c=void 0,e.f=t)}function x(e){b(e),e.c=e.v()}const N=(e,t)=>(n,o)=>{if(!r)return t?n():void 0;const{i:i,s:s,e:l,y:u}=c;o||(o=s.map((e=>e.st)).filter((e=>void 0!==e)));const f=i>=s.length;var a,d;if(f&&(s[i]={d:o,v:n,f:!1}),(f||s[i].f||(a=s[i].d,d=o,!a||d.some(((e,t)=>e!==a[t]))))&&(t?s[i]={v:n(),d:o}:(e?l:u).push(s[i])),c.i++,t)return s[i].v;s[i].v=n,s[i].d=o,s[i].f=!1};function $(e){const{s:t,i:n}=c,r=void 0===t[n]?e:t[n].st;return n>=t.length&&t.push({st:r}),c.i++,[r,e=>{t[n].st=h(e)?e(r):e,v(o)},()=>t[n].st]}const C=N(1),_=N(0),j=N(1,1);function E(e){void 0===e.i&&(e.i=0,e.m=u++)}function A(e){E(e);const{i:t,m:n}=e,o=""+n+(e.name||e.toString().length)+t,r=d[o]||{s:[],i:0,e:[],y:[],t:[]};return e.i++,t=>{m()&&(r.t=c.t),c=r,r.i=0;const n=y(e(void 0===t?{}:t));return d[o]||(d[o]=r),f.push({c:o,fn:e}),n}}exports.Fragment=({children:e})=>e,exports.comp=A,exports.createContext=e=>{const t=l++;return{Provider:({value:n,children:o})=>(c&&(c.t[t]=void 0!==n?n:e),o),i:t}},exports.h=function(e,t){if(t=t||{},!e)return"";const n=[].slice.call(arguments,2).map((e=>"number"==typeof e?String(e):e)).filter(Boolean);if(h(e))return t.children=n,E(e),{comp:e,props:t,__c:!0};let o=`<${e}`;for(let e in t){const n=t[e];if(r&&null==n&&(n=""),null!=n&&e!==p&&"children"!==e){const t=typeof n;if("function"===t||"boolean"===t||"object"===t){const c=n,l=e.toLowerCase();if("object"===t&&"ref"!==l)o+=` ${e}="${Object.keys(n).reduce(((e,t)=>e+t.split(/(?=[A-Z])/).join("-").toLowerCase()+":"+("number"==typeof n[t]?n[t]+"px":n[t])+";"),"")}"`;else if(r){const e=s++;"ref"===l&&(n.ref=()=>g(l,e)),i[e]={key:l,value:c},o+=` c-${l}="${e}"`}else!0===n?o+=` ${e}`:!1===n&&(o+="")}else o+=` ${e}="${n}"`}}if(o+=">",/area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr/.test(e))return o;if(t[p])o+=t[p].__html;else for(let e=0;e<n.length;e++){const t=y(n[e]);"string"==typeof t&&(o+=t)}return o+(e?`</${e}>`:"")},exports.html=function(e){const t=[].slice.call(arguments,1);return e.reduce(((e,n,o)=>{let c=t[o-1];null==c&&(c=""),Array.isArray(c)&&(c=c.join(""));const l=typeof c;if("function"===l||"boolean"===l||"object"===l){const t=e.match(/[^ ]+/g)||[],n=c,o=(t[t.length-1]||"").replace(/=|"/g,"").toLowerCase(),l=s++,u=`c-${o}="${l}`;"ref"===o&&(c.ref=()=>r.querySelector(`[${u}"]`)),i[l]={key:o,value:n},e=t.slice(0,-1).join(" ")+` ${u}`,c=""}return e+String(c)+n}))},exports.isValidElement=function(e){return"object"==typeof e&&e.__c&&e.comp&&e.props},exports.render=function(e,t){c=void 0,o=void 0,d={},a=[],f=[],i=[],s=0,l=0,u=0,r=t,v(e)},exports.renderToString=y,exports.useCallback=(e,t)=>j((()=>e),t),exports.useContext=function(e){return c?c.t[e.i]:void 0},exports.useEffect=C,exports.useLayoutEffect=_,exports.useMemo=j,exports.useReducer=function(e,t,n){const o=$(void 0!==n?n(t):t);return[o[0],t=>o[1](e(o[0],t))]},exports.useRef=e=>j((()=>({current:e,ref:()=>e})),[]),exports.useState=$;
