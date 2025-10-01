import{_ as r}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-DmGY_wV2.js";import{b as o,o as c,w as e,g as n,e as u,m as d,af as s,v as m,x as f,X as a}from"./modules/vue-BuL0xg91.js";import{_}from"./default.vue_vue_type_style_index_0_lang-C_FYlQgg.js";import{x as g,a6 as h}from"./index-4lMyux5v.js";import"./modules/unplugin-icons-B6DqK1lQ.js";import"./monaco/bundled-types-BuXtdBa6.js";import"./modules/file-saver-BzOOqXCn.js";import"./BrandLogo-BRLSAWkw.js";import"./modules/shiki-_fi6NckE.js";const P={__name:"natural_language_query.md__slidev_87",setup(k){const{$clicksContext:p,$frontmatter:t}=g();return p.setup(),(x,l)=>{const i=r;return c(),o(_,m(f(a(h)(a(t),86))),{default:e(()=>[l[1]||(l[1]=n("h3",null,"🔄 Request Lifecycle",-1)),u(i,d({maxHeight:"450px"},{title:"",ranges:["*"]}),{default:e(()=>l[0]||(l[0]=[n("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[n("code",{class:"language-text"},[n("span",{class:"line"},[n("span",null,"user input")]),s(`
`),n("span",{class:"line"},[n("span",null,"   │")]),s(`
`),n("span",{class:"line"},[n("span",null,"   ▼")]),s(`
`),n("span",{class:"line"},[n("span",null,'[1] detect intent ───────────────▶ "query_data"?')]),s(`
`),n("span",{class:"line"},[n("span",null,"   │                                   │")]),s(`
`),n("span",{class:"line"},[n("span",null,"   ▼                                   ▼")]),s(`
`),n("span",{class:"line"},[n("span",null,"[2] guess target layer        [3] not query_data → fallback response")]),s(`
`),n("span",{class:"line"},[n("span",null,"   │")]),s(`
`),n("span",{class:"line"},[n("span",null,"   ▼")]),s(`
`),n("span",{class:"line"},[n("span",null,"[3] if layerInfo exists:")]),s(`
`),n("span",{class:"line"},[n("span",null,"   ├─ does guessed layer ≠ layerInfo.name?")]),s(`
`),n("span",{class:"line"},[n("span",null,"   │     ├─ YES → clear layerInfo and go to [4]")]),s(`
`),n("span",{class:"line"},[n("span",null,"   │     └─ NO  → proceed to [6]")]),s(`
`),n("span",{class:"line"},[n("span",null,"   │")]),s(`
`),n("span",{class:"line"},[n("span",null,"   ▼")]),s(`
`),n("span",{class:"line"},[n("span",null,"[4] requires enrichment:")]),s(`
`),n("span",{class:"line"},[n("span",null,'   → respond with "please hold while I prepare that..."')]),s(`
`),n("span",{class:"line"},[n("span",null,"   → frontend fetches fields + sample records")]),s(`
`),n("span",{class:"line"},[n("span",null,"   → sends back context.layerInfo")]),s(`
`),n("span",{class:"line"},[n("span",null,"   │")]),s(`
`),n("span",{class:"line"},[n("span",null,"   ▼")]),s(`
`),n("span",{class:"line"},[n("span",null,"[5] enrichment complete:")]),s(`
`),n("span",{class:"line"},[n("span",null,"   └─ re-enters flow with enriched context")]),s(`
`),n("span",{class:"line"},[n("span",null,"   │")]),s(`
`),n("span",{class:"line"},[n("span",null,"   ▼")]),s(`
`),n("span",{class:"line"},[n("span",null,"[6] generate query:")]),s(`
`),n("span",{class:"line"},[n("span",null,"   └─ model = detect_target_model(user_prompt, layerInfo)")]),s(`
`),n("span",{class:"line"},[n("span",null,"   └─ where clause + field selection built")]),s(`
`),n("span",{class:"line"},[n("span",null,"   └─ selection sent to map layer")])])],-1)])),_:1,__:[0]},16)]),_:1,__:[1]},16)}}};export{P as default};
