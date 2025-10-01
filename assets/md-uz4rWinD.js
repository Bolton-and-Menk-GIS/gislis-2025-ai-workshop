import{_ as p}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-DmGY_wV2.js";import{b as c,o,w as a,g as s,e as u,m,af as n,v as d,x as f,X as l}from"./modules/vue-BuL0xg91.js";import{_}from"./default.vue_vue_type_style_index_0_lang-C_FYlQgg.js";import{x as h,a6 as k}from"./index-4lMyux5v.js";import"./modules/unplugin-icons-B6DqK1lQ.js";import"./monaco/bundled-types-BuXtdBa6.js";import"./modules/file-saver-BzOOqXCn.js";import"./BrandLogo-BRLSAWkw.js";import"./modules/shiki-_fi6NckE.js";const v={__name:"natural_language_query.md__slidev_89",setup(g){const{$clicksContext:t,$frontmatter:r}=h();return t.setup(),(E,e)=>{const i=p;return o(),c(_,d(f(l(k)(l(r),88))),{default:a(()=>[e[1]||(e[1]=s("h4",null,"💬 Example Interaction",-1)),u(i,m({},{title:"",ranges:[]}),{default:a(()=>e[0]||(e[0]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-text"},[s("span",{class:"line"},[s("span",null,"user: show me the parcels on the 8000 block of 91st st s")]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,'→ backend detects intent: "query_data"')]),n(`
`),s("span",{class:"line"},[s("span",null,'→ guesses layer: "Parcels" (confidence: 100)')]),n(`
`),s("span",{class:"line"},[s("span",null,'→ current layerInfo = "MS4 Structure Inspections"')]),n(`
`),s("span",{class:"line"},[s("span",null,"→ mismatch detected → triggers re-enrichment")]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,'client fetches schema + samples for "Parcels" layer')]),n(`
`),s("span",{class:"line"},[s("span",null,"→ sends new context.layerInfo")]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,"→ backend generates:")]),n(`
`),s("span",{class:"line"},[s("span",null,"   WHERE clause:")]),n(`
`),s("span",{class:"line"},[s("span",null,`   "CAST(BLDG_NUM AS INT) BETWEEN 8000 AND 8999 AND SITUS_ADDRESS LIKE '%91ST ST S%'"`)]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,"user: ok, now show only ones owned by smith")]),n(`
`),s("span",{class:"line"},[s("span")]),n(`
`),s("span",{class:"line"},[s("span",null,'→ layerInfo is already "Parcels"')]),n(`
`),s("span",{class:"line"},[s("span",null,"→ backend reuses it")]),n(`
`),s("span",{class:"line"},[s("span",null,`→ WHERE clause: "OWNER_NAME LIKE '%SMITH%'"`)])])],-1)])),_:1,__:[0]},16)]),_:1,__:[1]},16)}}};export{v as default};
