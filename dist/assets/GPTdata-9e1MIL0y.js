import{j as e,a as p,r as a,c as h,b as x}from"./index-lGblRe-B.js";import{a as m}from"./axios-G2rPRu76.js";const f=({data:i})=>{const n=t=>t.charAt(0).toUpperCase()+t.slice(1),c=t=>{if(!t)return"";const s=t.split("@")[0];return n(s)},l=t=>{if(!t)return"";const s=t.split("@");return s.length<2?"":s[1].split(".")[0]},d=t=>t?"Investor Email":"Non-investor Email";return e.jsx("table",{style:{textAlign:"left"},children:e.jsxs("tbody",{children:[e.jsx("tr",{children:e.jsx("th",{children:"Inbound Email Interactions: "})}),i.map(t=>{const s=c(t.sender),r=c(t.toRecipients);return l(t.toRecipients),d(t.isInvestorEmail),e.jsxs("tr",{children:[e.jsxs("td",{children:[s," connected with ",r," about ",t.subject]}),e.jsx("td",{})]},t.id)})]})})};function E(){const i=p(o=>o.token),[n,c]=a.useState(""),[l,d]=a.useState([]),[t,s]=a.useState([]);a.useState([]),a.useState([]),a.useState([]);const r=h(o=>o.user);return a.useEffect(()=>{const o=async()=>{const u=await m.get(`http://${x}:5001?q=${n}`,{headers:{"Content-Type":"application/json",Authorization:i,email:r==null?void 0:r.email}});d(u.data),s(u.data)};(n.length===0||n.length>2)&&i&&o()},[n,i]),e.jsx("div",{className:"app",children:e.jsx("div",{className:"main-content",children:e.jsx(f,{data:t})})})}export{E as default};
