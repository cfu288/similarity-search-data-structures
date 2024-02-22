(function(l,o){typeof exports=="object"&&typeof module<"u"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(l=typeof globalThis<"u"?globalThis:l||self,o(l.data_structures={}))})(this,function(l){"use strict";function x(s=.5){return Math.random()<s}function f(s=32){let n=1;for(;x()&&n<s;)n++;return n}class d{constructor(n,e){this.value=n,this.next=new Array(e)}}var a;class c{constructor(n=32){this.maxLengthOfValue=()=>{let e=this.headerNode;for(;e.next[0];)e=e.next[0];return`${e.value}`.length},this[a]=function*(){let e=this.headerNode.next[0];for(;e;)yield e.value,e=e.next[0]},this.headerNode=new d(Number.MIN_SAFE_INTEGER,32),this.maxLevels=n}insert(n){const e=f(),t=new d(n,e);let i=this.headerNode;for(let r=e-1;r>=0;r--){for(;i.next[r]&&i.next[r].value<n;)i=i.next[r];t.next[r]=i.next[r],i.next[r]=t}}delete(n){let e=this.headerNode,t=!1;for(let i=this.maxLevels-1;i>=0;i--){for(;e.next[i]!==void 0&&e.next[i].value<n;)e=e.next[i];e.next[i]!==void 0&&e.next[i].value===n&&(t=!0,e.next[i]=e.next[i].next[i])}return t}contains(n){let e=this.headerNode;for(let t=this.maxLevels-1;t>=0;t--){for(;e.next[t]!==void 0&&e.next[t].value<n;)e=e.next[t];if(e.next[t]!==void 0&&e.next[t].value===n)return!0}return!1}get(n){let e=this.headerNode;for(let t=this.maxLevels-1;t>=0;t--){for(;e.next[t]!==void 0&&e.next[t].value<n;)e=e.next[t];if(e.next[t]!==void 0&&e.next[t].value===n)return e.next[t].value}}indexOf(n){let e=this.headerNode,t=0;for(;e.next[0]&&e.next[0].value<n;)t++,e=e.next[0];return e.next[0]&&e.next[0].value===n?t:-1}size(){let n=this.headerNode,e=0;for(;n.next[0];)e++,n=n.next[0];return e}toPrettyString(){let n="";const e=this.maxLengthOfValue();for(let t=this.maxLevels-1;t>=0;t--){let i=[],r=this.headerNode.next[t];for(;r;)i.push(r.value),r=r.next[t];if(i.length>0){let v=this.size(),h=Array(v).fill(" ".repeat(e));i.forEach(u=>{const L=this.indexOf(u);h[L]=`${u}`.padStart(e," ")}),n+=`${t+1}:	[${h.join(" ")}]
`}}return n.trim()}}a=Symbol.iterator,l.SkipList=c,Object.defineProperty(l,Symbol.toStringTag,{value:"Module"})});
