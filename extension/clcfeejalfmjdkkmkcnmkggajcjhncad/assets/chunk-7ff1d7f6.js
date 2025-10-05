import{g as $t,H as d,b as J,a as W,c as Y,d as Q,l as R,J as X,e as ee,f as te,O as jt,D as B,__tla as zt}from"./chunk-1fc6abaf.js";import{D as G,a as le,S as Bt,b as It,c as Zt,__tla as Dt}from"./chunk-52add7e1.js";import{C as ie,a as N,H as pe,b as Pt,l as A,c as I,d as se,e as Z,f as D,g as P,h as $,i as O,j,k as z,m as x,n as de,o as ce,p as E,q as Ot,r as Ae,s as Ce,t as ye,u as qe,v as me,w as _e,x as Rt}from"./chunk-821333de.js";import{H as U,a as fe,h as re,c as Gt}from"./chunk-863d424b.js";Promise.all([(()=>{try{return zt}catch{}})(),(()=>{try{return Dt}catch{}})()]).then(async()=>{const Ee=(r=!1)=>{r&&console.info("announcements handler")},$e=(r=!1)=>{r&&console.log("announcements injector")},ve="heyetsy-card-container",be={429:"#ea580c",401:"#dc2626",402:"#ca8a04",default:"#dc2626"},je={429:"#fed7aa",401:"#fecaca",402:"#fef08a",default:"#fecaca"},ze={429:'<svg xmlns="http://www.w3.org/2000/svg" style="width: 2.5rem; height: 2.5rem;" viewBox="0 0 24 24" fill="none"><path d="M15.22 6.55H5.78c-.28 0-.54.01-.78.02-2.37.14-3 1.01-3 3.71v.58c0 .55.45 1 1 1h15c.55 0 1-.45 1-1v-.58c0-2.98-.76-3.73-3.78-3.73ZM3 13.36c-.55 0-1 .45-1 1v2.91C2 20.25 2.76 21 5.78 21h9.44c2.97 0 3.75-.72 3.78-3.57v-3.07c0-.55-.45-1-1-1H3Zm3.96 5.2H5.25c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.72c.41 0 .75.34.75.75s-.34.75-.76.75Zm5.59 0H9.11c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3.44a.749.749 0 1 1 0 1.5Z" fill="#ea580c"></path><path d="M22.002 13.332v-5.24c0-3.13-1.79-4.49-4.49-4.49h-8.93c-.76 0-1.44.11-2.04.34-.47.17-.89.42-1.23.75-.18.17-.04.45.22.45h10.87c2.25 0 4.07 1.82 4.07 4.07v7.17c0 .25.27.39.45.21.69-.73 1.08-1.8 1.08-3.26Z" fill="#ea580c"></path></svg>',401:'<svg xmlns="http://www.w3.org/2000/svg" style="width: 2.5rem; height: 2.5rem;" viewBox="0 0 24 24" fill="none"><path d="M18.75 8v2.1c-.44-.06-.94-.09-1.5-.1V8c0-3.15-.89-5.25-5.25-5.25S6.75 4.85 6.75 8v2c-.56.01-1.06.04-1.5.1V8c0-2.9.7-6.75 6.75-6.75S18.75 5.1 18.75 8Z" fill="#dc2626"></path><path opacity=".4" d="M22 15v2c0 4-1 5-5 5H7c-4 0-5-1-5-5v-2c0-3.34.7-4.59 3.25-4.9.44-.06.94-.09 1.5-.1h10.5c.56.01 1.06.04 1.5.1C21.3 10.41 22 11.66 22 15Z" fill="#dc2626"></path><path d="M8 16.999c-.13 0-.26-.03-.38-.08-.13-.05-.23-.12-.33-.21-.18-.19-.29-.45-.29-.71 0-.13.03-.26.08-.38s.12-.23.21-.33c.1-.09.2-.16.33-.21.37-.16.81-.07 1.09.21.09.1.16.21.21.33.05.12.08.25.08.38 0 .26-.11.52-.29.71-.19.18-.45.29-.71.29ZM12 17c-.27 0-.52-.11-.71-.29-.09-.1-.16-.21-.21-.33A.995.995 0 0 1 11 16c0-.27.11-.52.29-.71.37-.37 1.04-.37 1.42 0 .18.19.29.44.29.71 0 .13-.03.26-.08.38s-.12.23-.21.33c-.19.18-.45.29-.71.29ZM16 17c-.26 0-.52-.11-.71-.29-.18-.19-.29-.44-.29-.71 0-.27.11-.52.29-.71.38-.37 1.05-.37 1.42 0 .04.05.08.1.12.16.04.05.07.11.09.17.03.06.05.12.06.18.01.07.02.14.02.2 0 .26-.11.52-.29.71-.19.18-.45.29-.71.29Z" fill="#dc2626"></path></svg>',402:'<svg xmlns="http://www.w3.org/2000/svg" style="width: 2.5rem; height: 2.5rem;" viewBox="0 0 24 24" fill="none"><path d="M15.22 6.55H5.78c-.28 0-.54.01-.78.02-2.37.14-3 1.01-3 3.71v.58c0 .55.45 1 1 1h15c.55 0 1-.45 1-1v-.58c0-2.98-.76-3.73-3.78-3.73ZM3 13.36c-.55 0-1 .45-1 1v2.91C2 20.25 2.76 21 5.78 21h9.44c2.97 0 3.75-.72 3.78-3.57v-3.07c0-.55-.45-1-1-1H3Zm3.96 5.2H5.25c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.72c.41 0 .75.34.75.75s-.34.75-.76.75Zm5.59 0H9.11c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3.44a.749.749 0 1 1 0 1.5Z" fill="#ca8a04"></path><path d="M22.002 13.332v-5.24c0-3.13-1.79-4.49-4.49-4.49h-8.93c-.76 0-1.44.11-2.04.34-.47.17-.89.42-1.23.75-.18.17-.04.45.22.45h10.87c2.25 0 4.07 1.82 4.07 4.07v7.17c0 .25.27.39.45.21.69-.73 1.08-1.8 1.08-3.26Z" fill="#ca8a04"></path></svg>',default:'<svg xmlns="http://www.w3.org/2000/svg" style="width: 2.5rem; height: 2.5rem;" viewBox="0 0 24 24" fill="none"><path opacity=".4" d="M21.76 15.92 15.36 4.4C14.5 2.85 13.31 2 12 2s-2.5.85-3.36 2.4l-6.4 11.52c-.81 1.47-.9 2.88-.25 3.99.65 1.11 1.93 1.72 3.61 1.72h12.8c1.68 0 2.96-.61 3.61-1.72.65-1.11.56-2.53-.25-3.99Z" fill="#dc2626"></path><path d="M12 14.75c-.41 0-.75-.34-.75-.75V9c0-.41.34-.75.75-.75s.75.34.75.75v5c0 .41-.34.75-.75.75ZM12 17.999c-.06 0-.13-.01-.2-.02a.636.636 0 0 1-.18-.06.757.757 0 0 1-.18-.09l-.15-.12c-.18-.19-.29-.45-.29-.71 0-.26.11-.52.29-.71l.15-.12c.06-.04.12-.07.18-.09.06-.03.12-.05.18-.06.13-.03.27-.03.39 0 .07.01.13.03.19.06.06.02.12.05.18.09l.15.12c.18.19.29.45.29.71 0 .26-.11.52-.29.71l-.15.12c-.06.04-.12.07-.18.09-.06.03-.12.05-.19.06-.06.01-.13.02-.19.02Z" fill="#dc2626"></path></svg>'},Be={429:"Too many requests",401:"Invalid API key",402:"Payment required",default:"Oops! Something went wrong"},Ie={429:"Oops! You've reached the maximum number of requests.",401:"Oops! It seems like your API key is invalid.",402:"Hey there! <br> Please upgrade to the paid plan to use it.",default:"Oops! Something went wrong."},Ze={429:`<a href="${fe}/pricing" target="_blank" style="font-weight: 700; text-decoration: underline; ">Upgrade</a>`,401:`<a href="${fe}/api-tokens" target="_blank" style="font-weight: 700; text-decoration: underline; ">Get licence</a>`,402:`<a href="${fe}/payment" target="_blank" style="font-weight: 700; text-decoration: underline; ">Upgrade</a>`,default:`<a href="${Pt}" target="_blank" style="font-weight: 700; text-decoration: underline; ">Contact us</a>`},ne={CREATED_AT:"Created",UPDATED_AT:"Updated",SIMILAR:"Similar",TAGS:"Tags",CATEGORIES:"Categories"},De={DAILY_VIEWS:"#e11d48",CREATED_AT:"#0d9488",UPDATED_AT:"#0d9488",SIMILAR:"#0d9488",TAGS:"#0d9488"},we={CREATED_AT:"original_creation",UPDATED_AT:"last_modified"},Pe={"#dc2626":"#fee2e2","#ca8a04":"#fef9c3","#0d9488":"#ccfbf1","#2563eb":"#dbeafe"},Oe={CREATED_AT:"The listing was created.",UPDATED_AT:"When it is sold, renewed, or updated."},V=(r,e={})=>{e.textColor||ie;const t=e.backgroundColor||N,s=document.createElement("div");return s.id=ve,s.innerHTML=`
    <div style="padding-top: 16px; cursor: default; position: relative;">
        <div style="border-width: 2px; border-color: #e5e7eb;background-color: ${t};border-radius: 0.375rem; padding: 16px;width: 100%;margin-left: auto;margin-right: auto;border-style: solid;">
            <div style="display: flex;" class="animate-pulse">
                <div style="padding-top: 0.25rem;padding-bottom: 0.25rem; flex: 1 1 0%; ">
                    <div style="background-color: #9ca3af; height: 1rem; border-radius: 0.375rem;"></div>
                    <div style="background-color: #9ca3af; height: 1rem; border-radius: 0.375rem; margin-top: 1rem;"></div>
                    <div style="background-color: #9ca3af; height: 1rem; border-radius: 0.375rem; margin-top: 1rem;"></div>
                    <div style="background-color: #9ca3af; height: 1rem; border-radius: 0.375rem; margin-top: 1rem;"></div>
                </div>
            </div>
        </div>
        <div style="position: absolute;right: 5px;top: 0;border-radius: 0.375rem;padding-top: 0.25rem;padding-bottom: 0.25rem;padding-left: 0.5rem;padding-right: 0.5rem;background-color: #0d9488;">
            <p style="color: #fff;font-weight: 500;">
                ${pe}
            </p>
        </div>
    </div>
    `,s},F=(r,e,t={})=>{var m,c,C,S,b;let s=(t==null?void 0:t.textColor)||"#2b3a49",p=(t==null?void 0:t.backgroundColor)||N,k=(t==null?void 0:t.borderColor)||"#e5e7eb";const y=(t==null?void 0:t.isHighlight)||!1;y&&(p=Pe[(t==null?void 0:t.highlightBackgroundColor)||G]||"#fee2e2",k=(t==null?void 0:t.highlightBackgroundColor)||G||"#dc2626");const w=document.createElement("div");w.id=ve;const T=(e==null?void 0:e.shop_sold)||0,h=Object.keys(ne).map(v=>{var H,i,f,n,u;if(!e[we[v]])switch(v){case"SIMILAR":return`
            <div style="display: flex;justify-content: space-between;padding-top: 0.5rem;padding-bottom: 0.5rem;align-items: center;">
                <dt style="color: #64748b !important;font-weight: 400;display: flex;align-items: center;font-size: 1.25rem;line-height: 1.5rem;">
                    <span>Conversion Rate</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 16px;height: 16px; margin-left: 8px;">
                        <path d="M12 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1ZM6.5 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6ZM2 9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Z" />
                    </svg>
                </dt>
                <dd style="font-weight: bold;color: ${s};">
                    <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;">
                        <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                            Estimated conversion rate of the listing.
                        </div>
                        <p style="margin-left: 0.25rem; font-weight: bold;color: #dc2626 !important;font-size: 1.25rem;line-height: 1.5rem;">
                            ${e!=null&&e.cr?`~${e==null?void 0:e.cr}%`:"-"}
                        </p>
                    </div>
                </dd>
            </div>`;case"TAGS":if((t==null?void 0:t.cardShowTags)===!1)return"";const a=((H=e==null?void 0:e.tags)==null?void 0:H.split(",").filter(Boolean))||[];if(a.length===0)return`
            <div style="display: flex; flex-direction: column; justify-content: space-between;padding-top: 0.5rem;padding-bottom: 0.5rem;">
                <dt style="color: ${s}; padding-bottom: 0.5rem;">
                    <span>${ne[v]}</span>
                </dt>
                <dd style="font-weight: bold;font-size: 11px;color: ${s} !important;">No tags found</dd>
            </div>`;const g=(f=(i=e==null?void 0:e.tags)==null?void 0:i.replace(/'/g,"\\'"))==null?void 0:f.replace(/"/g,'\\"');return`
            <div style="display: flex; flex-direction: column; justify-content: space-between;padding-top: 0.5rem;padding-bottom: 0.5rem;">
                <dt style="color: ${s}; padding-bottom: 0.5rem;">
                    <span>${ne[v]}</span>
                    <button onClick="navigator.clipboard.writeText('${g}').then((e)=>{this.innerText = 'Copied!';setTimeout(()=>{this.innerText = 'Copy'}, 1000);}).catch((e)=>{this.innerText = 'Error!';setTimeout(()=>{this.innerText = 'Copy'}, 1000);})"
                        type="button" style="margin-left: 8px; padding: 4px 8px; border-radius: 0.375rem; color: white; background-color: #0d9488; cursor: pointer;font-size: 12px; border: none; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
                    Copy
                    </button>
                    <span class="heyetsy-hover" style="color: white !important;">
                        <a href="https://heyetsy.com/suggestions?tags=${g}" target="_blank" style="margin-left: 8px; padding: 4px 8px; border-radius: 0.375rem; color: white !important; background-color: #2563eb; cursor: pointer;font-size: 12px; border: none; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
                            Suggestions
                        </a>
                    </span>
                </dt>
                <dd style="font-weight: bold;color: ${s} !important; padding-top: 0.5rem; padding-bottom: 0.5rem;">${a.map(l=>`<a href="https://www.etsy.com/search?q=${l==null?void 0:l.trim()}&ref=search_bar" target="_blank" style="text-decoration: none !important;text-transform: lowercase;display: inline-flex; align-items: center; gap: 0.5rem; margin: 2px; border-radius: 0.375rem; padding-left: 0.5rem; padding-right: 0.5rem; padding-top: 0.25rem; padding-bottom: 0.25rem; font-size: 11px; font-weight: 400; color: #1F2937 !important; border: 1px solid #E5E7EB; background-color: #FFFFFF;">
                                    <span class="heyetsy-hover">
                    ${l==null?void 0:l.trim()}
                    </span>
                </a>`).join("")}</dd>
            </div>`;case"CATEGORIES":return(t==null?void 0:t.cardShowCategories)===!1?"":`
                <div style="display: flex; flex-direction: column; justify-content: space-between;padding-top: 0.5rem;padding-bottom: 0.5rem;">
                    <dt style="color: ${s}; padding-bottom: 0.5rem;">
                        <span>${ne[v]}</span>
                        <button onClick="navigator.clipboard.writeText('${(u=(n=e==null?void 0:e.categories)==null?void 0:n.replace(/'/g,"\\'"))==null?void 0:u.replace(/"/g,'\\"')}').then((e)=>{this.innerText = 'Copied!';setTimeout(()=>{this.innerText = 'Copy'}, 1000);}).catch((e)=>{this.innerText = 'Error!';setTimeout(()=>{this.innerText = 'Copy'}, 1000);})"
                          type="button" style="margin-left: 8px; padding: 4px 8px; border-radius: 0.375rem; color: white; background-color: #0d9488; cursor: pointer;font-size: 12px; border: none; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
                    Copy
                    </button>
                    </dt>
                    <dd style="font-weight: bold;color: #0d9488 !important;padding-left: 10px;padding-right: 10px;padding-top: 5px;padding-bottom: 5px;background-color: #f1f5f9;border-radius: 0.375rem;font-size: 11px;">${(e==null?void 0:e.categories)||"No categories found"}</dd>
                </div>`;default:return`
            <div style="display: flex;justify-content: space-between;padding-top: 0.5rem;padding-bottom: 0.5rem;">
                <dt style="color: ${s};">${ne[v]}</dt>
                <dd style="font-weight: bold;color: ${y?s:De[v]||s};">0</dd>
            </div>`}return`
    <div style="display: flex;justify-content: space-between;padding-top: 0.5rem;padding-bottom: 0.5rem;align-items: center;">
        <dt style="font-weight: 400;color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">${ne[v]}</dt>
        <dd style="font-weight: bold;font-size: 1.25rem;line-height: 1.5rem;">
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                    ${Oe[v]||"-"}
                </div>
                <div>
                    ${e[we[v]]}
                </div>
            </div>
        </dd>
    </div>`});return w.innerHTML=`
  <div style="padding-top: 1.25rem; cursor: default; position: relative;">
    <div style="font-size: 14px !important; font-weight: bold; border-radius: 0.375rem; padding: 1rem 0.5rem; width: 100%; margin-left: auto;margin-right: auto;border: 2px solid; border-color: transparent; box-shadow: 0 0 0 ${k=="#e5e7eb"?"2px":"4px"} ${k}, 0 0 0 4px ${p};">
    <div style="display: flex;justify-content: space-between;padding-top: 0.5rem;padding-bottom: 0.5rem;align-items: center;">
                <div style="display: flex;align-items: center;color: ${s};">
                `+(e!=null&&e.shop_country?`
                <div class="heyetsy-icon heyetsy-icon__danger" style="display: flex;align-items: center;margin: 0.25rem;">
                    <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                        Seller's country: ${$t(e==null?void 0:e.shop_country)}
                    </div>
                    <img src="https://flagcdn.com/${(m=e==null?void 0:e.shop_country)==null?void 0:m.toLowerCase()}.svg" style="height: 22px;margin-right: 0.5rem;border: 1px solid #e5e7eb;border-radius: 0.375rem;">
                </div>
                `:"")+`<span class="heyetsy-hover"><a href="${U+"/r/s/"+(e==null?void 0:e.u)}" target="_blank" style="color: ${s} !important;font-weight: bold;font-size: 1.25rem;line-height: 1.5rem;">Go To Shop</a></span>
                </div>
                <div style="font-weight: bold;color: ${s} !important;display: flex;align-items: center;">
                    <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem; ${T>0?"":"display: none;"}">
                        <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                            Recent daily sales of the shop's items.
                        </div>
                        <div style="display: flex;align-items: center;position: relative;border-radius: 0.375rem;padding-top: 0.25rem;padding-bottom: 0.25rem;padding-left: 1rem;padding-right: 1rem;border: 1px solid #9ca3af;">
                            <p style="font-weight: bold;color: #16a34a !important;font-size: 1.25rem;line-height: 1.5rem;">
                                +${T}
                            </p>
                        </div>
                    </div>

                    <div class="heyetsy-dropdown" style="cursor: pointer; display: flex;align-items: center;">
                        <svg class="heyetsy-dropdown-button" onClick="document.querySelector('.heyetsy-dropdown-content-${r}').classList.toggle('heyetsy-show');"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 24px;height: 24px;" data-id="${r}">
                            <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
                        </svg>

                        <div class="heyetsy-dropdown-content heyetsy-dropdown-content-${r}" data-id="${r}">
                            <a style="display: flex;align-items: center;justify-content: space-between;" href="https://heyetsy.com/listing/${r}" target="_blank">
                                <span>Chart Listing</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 20px;height: 20px;">
                                  <path fill-rule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H18v8.75A2.75 2.75 0 0 1 15.25 15h-1.072l.798 3.06a.75.75 0 0 1-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 0 1-1.452-.38L5.823 15H4.75A2.75 2.75 0 0 1 2 12.25V3.5h-.25A.75.75 0 0 1 1 2.75ZM7.373 15l-.391 1.5h6.037l-.392-1.5H7.373Zm7.49-8.931a.75.75 0 0 1-.175 1.046 19.326 19.326 0 0 0-3.398 3.098.75.75 0 0 1-1.097.04L8.5 8.561l-2.22 2.22A.75.75 0 1 1 5.22 9.72l2.75-2.75a.75.75 0 0 1 1.06 0l1.664 1.663a20.786 20.786 0 0 1 3.122-2.74.75.75 0 0 1 1.046.176Z" clip-rule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));">
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style="font-size: 1.125rem;">
                    Total views of the listing
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">
                        Total Views
                    </span>
                    <span style="font-weight: bold;font-size: 1.25rem;line-height: 1.5rem;">
                        ${e==null?void 0:e.views}
                    </span>
                  </div>
            </div>
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                    This is the estimated average daily view
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">AVG View</span>
                    <span style="font-weight: bold;font-size: 1.25rem;line-height: 1.5rem;">
                        ${e==null?void 0:e.daily_views}
                    </span>
                  </div>
            </div>
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                    Views in the Last 24 Hours
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">Views 24H</span>
                    <span style="font-weight: bold;color: #16a34a !important;font-size: 1.25rem;line-height: 1.5rem;">
                        ${e!=null&&e.views_24h?(c=e==null?void 0:e.views_24h)==null?void 0:c.toLocaleString():"-"}
                    </span>
                  </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));">
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style="font-size: 1.125rem;">
                    Estimated Total Sales
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">
                        Total Sold
                    </span>
                    <span style="font-weight: bold;color: #2563eb !important;font-size: 1.25rem;line-height: 1.5rem;">
                        ${e!=null&&e.total_sold?(C=e==null?void 0:e.total_sold)==null?void 0:C.toLocaleString():"-"}
                    </span>
                  </div>
            </div>
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                    Estimated Revenue
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">
                        Revenue
                    </span>
                    <span style="font-weight: bold;color: #16a34a !important;font-size: 1.25rem;line-height: 1.5rem;">
                        ${(e==null?void 0:e.estimated_revenue)||"-"}
                    </span>
                  </div>
            </div>
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                    Sold in the Last 24 Hours
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">
                        Sold 24H
                    </span>
                    <span style="font-weight: bold;color: #16a34a !important;font-size: 1.25rem;line-height: 1.5rem;">
                        ${e!=null&&e.sold?(S=e==null?void 0:e.sold)==null?void 0:S.toLocaleString():"-"}
                    </span>
                  </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));">
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style="font-size: 1.125rem;">
                    Total number of favorites for this listing.
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">
                        Favorites
                    </span>
                    <span style="font-weight: bold;font-size: 1.25rem;line-height: 1.5rem;">
                        ${e!=null&&e.num_favorers?(b=e==null?void 0:e.num_favorers)==null?void 0:b.toLocaleString():"-"}
                    </span>
                  </div>
            </div>
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                    Search similar products on the market.
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;" class="heyetsy-hover">
                        <a href="https://www.etsy.com/listing/${r}/similar" target="_blank" style="font-weight: 400;color: #2563eb !important;">Market</a>
                    </span>
                    <span style="font-weight: bold;color: #16a34a !important;font-size: 1.25rem;line-height: 1.5rem;">

                    </span>
                  </div>
            </div>
            <div class="heyetsy-icon heyetsy-icon__danger" style="margin: 0.25rem;font-weight: 400;">
                <div class="heyetsy-tooltip heyetsy-tooltip__dang" style=" font-weight: 400;font-size: 1.125rem;">
                    This is the rate of favorites per 100 views.
                </div>
                <div style="display: flex;align-items: center;justify-content: center;flex-direction: column;">
                    <span style="color: #64748b;font-size: 1.25rem;line-height: 1.5rem;">
                        Favor. Rate
                    </span>
                    <span style="font-weight: bold;font-size: 1.25rem;line-height: 1.5rem;">
                        ${e!=null&&e.hey?`~${e==null?void 0:e.hey}%`:"-"}
                    </span>
                  </div>
            </div>
        </div>

        <dl style="margin-bottom: 0px; border-top: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-top: 0.5rem;">
            ${h.join("")}
        </dl>
    </div>
    <div style="position: absolute;right: 5px;top: 0;border-radius: 0.375rem;padding-top: 0.25rem;padding-bottom: 0.25rem;padding-left: 0.5rem;padding-right: 0.5rem;background-color: #0d9488;">
        <p style="color: #fff;font-weight: 500;">
            ${pe}
        </p>
    </div>
</div>`,w},K=r=>{let e=r.status||"default";const t=`
        <div style="display: flex; margin-left: auto;margin-right: auto; background-color: ${je[e]}; justify-content: center; align-items: center; width: 5rem; height: 5rem; border-radius: 0.375rem; ">
                ${ze[e]}
            </div>
                <div style="line-height: 1.625; text-align: center; color: ${be[e]};">
                    <p style="font-weight: bold;">${Be[e]}</p>
                    <p>${Ie[e]}</p>
                    ${Ze[e]}
                </div>`,s=document.createElement("div");return s.innerHTML=`
    <div style="padding-top: 16px; cursor: default; position: relative;">
        <div style="font-size: 14px !important; border-style: solid; border-width: 2px; border-color: ${be[e]}; border-radius: 0.375rem; padding: 16px; width: 100%; margin-left: auto;margin-right: auto;">
            <div style="display: flex; margin-top: 16px; color: #B45309; flex-direction: column; justify-content: center; align-items: center; ">
                ${t}
            </div>
        </div>
        <div style="position: absolute;right: 5px;top: 0;border-radius: 0.375rem;padding-top: 0.25rem;padding-bottom: 0.25rem;padding-left: 0.5rem;padding-right: 0.5rem;background-color: #0d9488;">
            <p style="color: #fff;font-weight: 500;">
                ${pe}
            </p>
        </div>
    </div>`,s},oe=()=>{document.addEventListener("click",r=>{if(!r.target.matches(".heyetsy-dropdown-button")&&!r.target.parentElement.matches(".heyetsy-dropdown-button")){const e=document.getElementsByClassName("heyetsy-dropdown-content");for(let t=0;t<e.length;t++){const s=e[t];s.classList.contains("heyetsy-show")&&s.classList.remove("heyetsy-show")}}})},ae=(r,e)=>{var k,y,w,T,h,m,c,C,S,b;try{const v=(w=(y=(k=r==null?void 0:r.querySelector(".listing-link"))==null?void 0:k.querySelector(".v2-listing-card__title"))==null?void 0:y.textContent)==null?void 0:w.trim(),H=(T=r==null?void 0:r.querySelector(".listing-link"))==null?void 0:T.getAttribute("href"),i=r==null?void 0:r.querySelector("img"),f=i!=null&&i.getAttribute("src")?i==null?void 0:i.getAttribute("src"):i==null?void 0:i.getAttribute("data-src");var t=r?(m=(h=r==null?void 0:r.textContent)==null?void 0:h.toLowerCase())==null?void 0:m.includes("Bestseller".toLowerCase()):!1,s=r?(C=(c=r==null?void 0:r.textContent)==null?void 0:c.toLowerCase())==null?void 0:C.includes("Popular now".toLowerCase()):!1,p=r?(b=(S=r==null?void 0:r.textContent)==null?void 0:S.toLowerCase())==null?void 0:b.includes("Etsy\u2019s Pick".toLowerCase()):!1;const n={title:v,listingUrl:H,imageUrl:f,bestSeller:t,popularNow:s,etsyPick:p,...e,listing_id:(e==null?void 0:e.listing_id)+""};chrome.runtime.sendMessage({type:"SAVED_LISTING",payload:n})}catch(v){console.log(v)}},Re=r=>{var w,T,h,m;try{const c=document.querySelector(".body-wrap");var e=c?c.textContent.toLowerCase().includes("Bestseller".toLowerCase()):!1,t=c?c.textContent.toLowerCase().includes("Popular now".toLowerCase()):!1,s=c?c.textContent.toLowerCase().includes("Etsy\u2019s Pick".toLowerCase()):!1,p=(T=(w=c==null?void 0:c.querySelector('h1[data-buy-box-listing-title="true"]'))==null?void 0:w.textContent)==null?void 0:T.trim(),k=(h=document==null?void 0:document.querySelector('meta[property="og:url"]'))==null?void 0:h.getAttribute("content"),y=(m=document==null?void 0:document.querySelector('meta[property="og:image"]'))==null?void 0:m.getAttribute("content");const C={title:p,listingUrl:k,imageUrl:y,bestSeller:e,popularNow:t,etsyPick:s,...r};chrome.runtime.sendMessage({type:"SAVED_LISTING",payload:C})}catch(c){console.log(c)}},Ge=25,Ne="ol[data-results-grid-container], ul.wt-grid",Ue="ol[data-results-grid-container] > li, ul.wt-grid > li",Ve=(r=!1)=>{r&&console.info("category handler"),oe()},Fe=async(r=!1)=>{r&&console.log("category injector"),(await A.get(I)==null||await A.get(I))&&(setTimeout(Se,2e3),new MutationObserver(e=>{e.forEach(t=>{t.type=="attributes"&&t.target==document.body&&setTimeout(Se,2e3)})}).observe(document.body,{attributes:!0,childList:!1,subtree:!1}))};function Ke(r){const e=/[https:\/\/www.etsy.com\/listing\/]([0-9]+)/;var t;return(t=e.exec(r))!==null?t[1]:!1}const Se=async()=>{const r=await A.get(se);if(!r)return;const e=await A.getKeys([Z,D,P,$,O,j,z]),t=e[Z]||x,s=e[D]||ie,p=e[P]||N,k=e[$]?JSON.parse(e[$]):le,y=e[O]||G,w=e[j]==null?de:e[j],T=e[z]==null?ce:e[z];if(document.querySelectorAll(Ne).length>0){var h=document.querySelectorAll(Ue);h=Array.from(h).filter(function(i){return i.querySelector("#"+d)===null});for(var m=[...new Set([...h].map(i=>i.hasAttribute("data-palette-listing-id")?i.getAttribute("data-palette-listing-id"):i.querySelector("[data-palette-listing-id]")?i.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):i.querySelectorAll(".listing-link").length>0?Ke(i.querySelectorAll(".listing-link")[0].getAttribute("href")):!1).filter(Boolean))],c=0;c<h.length;++c){var C=h[c],S=C,b=S.querySelector("[data-palette-listing-id]")?C.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):!1,v=S.hasAttribute("data-palette-listing-id")?S:S.querySelector('[data-palette-listing-id="'+b+'"]');if(v&&v.querySelector("#"+d)===null){const i=document.createElement("div");i.id=d,i.setAttribute("data-heyetsy-listing-id",b);const f={textColor:s,backgroundColor:p,cardShowCategories:w,cardShowTags:T};switch(t){case E:i.innerHTML=W(b,f).innerHTML;break;case x:i.innerHTML=V(b,f).innerHTML;break;default:i.innerHTML=J(b,f).innerHTML;break}v.insertAdjacentHTML("beforeend",i.outerHTML)}}for(var H=[];m.length>0;)H.push(m.splice(0,Ge));H.forEach(i=>{const f=i.toString();fetch(`${U}/bulk/listings/${f}`,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${r}`}}).then(n=>n.ok?n.json():Promise.reject(n)).then(n=>{var u=n.data;for(let l=0;l<u.length;l++){const o=u[l];var a=o==null?void 0:o.listing_id;if(a){const q=re(o,k),L={textColor:s,backgroundColor:p,isHighlight:q,highlightBackgroundColor:y,cardShowCategories:w,cardShowTags:T};var g=document.querySelectorAll('[data-palette-listing-id="'+a+'"]');for(let _=0;_<g.length;_++){const M=g[_];if(M.querySelector("#"+d)!==null){switch(t){case E:M.querySelector("#"+d).innerHTML=Q(a,o,L).innerHTML;break;case x:M.querySelector("#"+d).innerHTML=F(a,o,L).innerHTML;break;default:M.querySelector("#"+d).innerHTML=Y(a,o,L).innerHTML;break}ae(M,o)}}}}}).catch(n=>{n instanceof Error&&(console.log(n),R.trackEvent(X,{errorMessage:n.message,stack:n.stack}));for(let u=0;u<i.length;u++){const a=i[u];if(a){const g=document.querySelectorAll(`div[data-heyetsy-listing-id="${a}"]`)||[];for(let l=0;l<g.length;l++){const o=g[l];if(o)switch(t){case E:o.innerHTML=te(n).innerHTML;break;case x:o.innerHTML=K(n).innerHTML;break;default:o.innerHTML=ee(n).innerHTML;break}}}}})})}},Je=25,We=".responsive-listing-grid, div[data-appears-component-name='shop_home_listings_section']",Ye=".responsive-listing-grid > div, div[data-appears-component-name='shop_home_listings_section'] div.v2-listing-card, div[data-appears-component-name='shop_home_listings_section'] .v2-listing-card",Qe=(r=!1)=>{r&&console.info("shop handler"),oe()},Xe=async(r=!1)=>{r&&console.log("shop injector"),(await A.get(I)==null||await A.get(I))&&(setTimeout(Te,2e3),new MutationObserver(e=>{e.forEach(t=>{t.type=="attributes"&&t.target==document.body&&setTimeout(Te,2e3)})}).observe(document.body,{attributes:!0,childList:!1,subtree:!1}),await tt())};function et(r){const e=/[https:\/\/www.etsy.com\/listing\/]([0-9]+)/;var t;return(t=e.exec(r))!==null?t[1]:!1}const Te=async()=>{const r=await A.get(se);if(!r)return;const e=await A.getKeys([Z,D,P,$,O,j,z]),t=e[Z]||x,s=e[D]||ie,p=e[P]||N,k=e[$]?JSON.parse(e[$]):le,y=e[O]||G,w=e[j]==null?de:e[j],T=e[z]==null?ce:e[z];if(document.querySelectorAll(We).length>0){var h=document.querySelectorAll(Ye);h=Array.from(h).filter(function(i){return i.querySelector("#"+d)===null});for(var m=[...new Set([...h].map(i=>i.hasAttribute("data-palette-listing-id")?i.getAttribute("data-palette-listing-id"):i.querySelector("[data-palette-listing-id]")?i.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):i.querySelectorAll(".listing-link").length>0?et(i.querySelectorAll(".listing-link")[0].getAttribute("href")):!1).filter(Boolean))],c=0;c<h.length;++c){var C=h[c],S=C,b=S.querySelector("[data-palette-listing-id]")?C.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):!1,v=S.hasAttribute("data-palette-listing-id")?S:S.querySelector('[data-palette-listing-id="'+b+'"]');if(v&&v.querySelector("#"+d)===null){const i=document.createElement("div");i.id=d,i.setAttribute("data-heyetsy-listing-id",b);const f={textColor:s,backgroundColor:p,cardShowCategories:w,cardShowTags:T};switch(t){case E:i.innerHTML=W(b,f).innerHTML;break;case x:i.innerHTML=V(b,f).innerHTML;break;default:i.innerHTML=J(b,f).innerHTML;break}v.insertAdjacentHTML("beforeend",i.outerHTML)}}for(var H=[];m.length>0;)H.push(m.splice(0,Je));H.forEach(i=>{const f=i.toString();fetch(`${U}/bulk/listings/${f}`,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${r}`}}).then(n=>n.ok?n.json():Promise.reject(n)).then(n=>{var u=n.data;for(let l=0;l<u.length;l++){const o=u[l];var a=o==null?void 0:o.listing_id;if(a){const q=re(o,k),L={textColor:s,backgroundColor:p,isHighlight:q,highlightBackgroundColor:y,cardShowCategories:w,cardShowTags:T};var g=document.querySelectorAll('[data-palette-listing-id="'+a+'"]');for(let _=0;_<g.length;_++){const M=g[_];if(M.querySelector("#"+d)!==null){switch(t){case E:M.querySelector("#"+d).innerHTML=Q(a,o,L).innerHTML;break;case x:M.querySelector("#"+d).innerHTML=F(a,o,L).innerHTML;break;default:M.querySelector("#"+d).innerHTML=Y(a,o,L).innerHTML;break}ae(M,o)}}}}}).catch(n=>{n instanceof Error&&R.trackEvent(X,{errorMessage:n.message,stack:n.stack});for(let u=0;u<i.length;u++){const a=i[u];if(a){const g=document.querySelectorAll(`div[data-heyetsy-listing-id="${a}"]`)||[];for(let l=0;l<g.length;l++){const o=g[l];if(o)switch(t){case E:o.innerHTML=te(n).innerHTML;break;case x:o.innerHTML=K(n).innerHTML;break;default:o.innerHTML=ee(n).innerHTML;break}}}}})})}},tt=async()=>{var s,p;const r=await A.getKeys([Ot,Ae,Ce,ye]);if(!!(r[ye]===void 0||r[ye]))if((r[Ce]||Bt)===It)r[Ae]||Zt;else{const k=(p=(s=window.location.pathname.match(/\/shop\/(.*)/))==null?void 0:s[1])==null?void 0:p.trim();if(k){if(!document.getElementById("heyEtsyIframeShop")){var e=document.createElement("div");e.setAttribute("id","heyEtsyIframeShop"),e.style.maxWidth="1400px",e.style.margin="0 auto";var t=document.createElement("iframe");t.style.height="650px",t.style.width="100%",t.style.border="none",t.setAttribute("src","https://heyetsy.com/iframe/shops/"+k),e.appendChild(t);const y=document.querySelector("div.shop-home-header")||document.querySelector("div.shop-header")||document.querySelector('div[data-appears-component-name="shop_home_announcement_section"]');y&&y.insertAdjacentElement("afterend",e)}}else if(!document.getElementById("heyEtsyIframeShop")){var t=document.createElement("iframe");t.setAttribute("id","heyEtsyIframeShop"),t.style.height="650px",t.style.width="100%",t.style.border="none",t.setAttribute("src",chrome.runtime.getURL("popup.html#/shop-not-found"));const w=document.querySelector('div[data-appears-component-name="shop_home_announcement_section"]');w&&w.insertAdjacentElement("afterend",t)}}},it=25,rt=".responsive-listing-grid",nt=".responsive-listing-grid > li, .responsive-listing-grid > div",ot=".image-carousel-container",at="#listing-page-cart",lt=(r=!1)=>{r&&console.info("listing handler"),oe()},st=async(r=!1)=>{r&&console.log("listing injector"),(await A.get(I)==null||await A.get(I))&&(setTimeout(Le,2e3),new MutationObserver(e=>{e.forEach(t=>{t.type=="attributes"&&t.target==document.body&&setTimeout(Le,2e3)})}).observe(document.body,{attributes:!0,childList:!1,subtree:!1}),await dt())};function he(r){const e=/[https:\/\/www.etsy.com\/listing\/]([0-9]+)/;var t;return(t=e.exec(r))!==null?t[1]:!1}const Le=async()=>{const r=await A.get(se);if(!r)return;const e=await A.getKeys([Z,D,P,$,O,j,z]),t=e[Z]||x,s=e[D]||ie,p=e[P]||N,k=e[$]?JSON.parse(e[$]):le,y=e[O]||G,w=e[j]==null?de:e[j],T=e[z]==null?ce:e[z],h=he(window.location.href);let m=document.querySelector(ot);if((t===qe||t===x)&&(m=document.querySelector(at)),h&&m&&m.querySelector("#"+d)===null){const n=document.createElement("div");n.id=d,n.setAttribute("style","padding-top: 10px; padding-bottom: 10px;"),n.setAttribute("data-heyetsy-listing-id",h);const u={textColor:s,backgroundColor:p,cardShowCategories:w,cardShowTags:T};switch(t){case E:n.innerHTML=W(H,u).innerHTML;break;case x:n.innerHTML=V(H,u).innerHTML;break;default:n.innerHTML=J(H,u).innerHTML;break}t===qe||t===x?m.insertAdjacentHTML("afterbegin",n.outerHTML):m.insertAdjacentHTML("beforeend",n.outerHTML),fetch(`${U}/listings/${h}`,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${r}`}}).then(a=>a.ok?a.json():Promise.reject(a)).then(a=>{const g=a.data;var l=g==null?void 0:g.listing_id;if(l){const o=re(g,k),q={textColor:s,backgroundColor:p,isHighlight:o,highlightBackgroundColor:y,cardShowCategories:w,cardShowTags:T};if(m.querySelector("#"+d)!==null){switch(t){case E:m.querySelector("#"+d).innerHTML=Q(l,g,q).innerHTML;break;case x:m.querySelector("#"+d).innerHTML=F(l,g,q).innerHTML;break;default:m.querySelector("#"+d).innerHTML=Y(l,g,q).innerHTML;break}Re(g)}}}).catch(a=>{if(a instanceof Error&&R.trackEvent(X,{errorMessage:a.message,stack:a.stack}),m.querySelector("#"+d)!==null)switch(t){case E:m.querySelector("#"+d).innerHTML=te(a).innerHTML;break;case x:m.querySelector("#"+d).innerHTML=K(a).innerHTML;break;default:m.querySelector("#"+d).innerHTML=ee(a).innerHTML;break}})}if(document.querySelectorAll(rt).length>0){var c=document.querySelectorAll(nt);c=Array.from(c).filter(function(n){return n.querySelector("#"+d)===null});for(var C=[...new Set([...c].map(n=>n.hasAttribute("data-palette-listing-id")?n.getAttribute("data-palette-listing-id"):n.querySelector("[data-palette-listing-id]")?n.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):n.querySelectorAll(".listing-link").length>0?he(n.querySelectorAll(".listing-link")[0].getAttribute("href")):!1).filter(Boolean))],S=0;S<c.length;++S){var b=c[S],v=b,H=v.querySelector("[data-palette-listing-id]")?b.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):!1,i=v.hasAttribute("data-palette-listing-id")?v:v.querySelector('[data-palette-listing-id="'+H+'"]');if(i&&i.querySelector("#"+d)===null){const n=document.createElement("div");n.id=d,n.setAttribute("data-heyetsy-listing-id",H);const u={textColor:s,backgroundColor:p,cardShowCategories:w,cardShowTags:T};switch(t){case E:n.innerHTML=W(H,u).innerHTML;break;case x:n.innerHTML=V(H,u).innerHTML;break;default:n.innerHTML=J(H,u).innerHTML;break}i.insertAdjacentHTML("beforeend",n.outerHTML)}}for(var f=[];C.length>0;)f.push(C.splice(0,it));f.forEach(n=>{const u=n.toString();fetch(`${U}/bulk/listings/${u}`,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${r}`}}).then(a=>a.ok?a.json():Promise.reject(a)).then(a=>{var g=a.data;for(let q=0;q<g.length;q++){const L=g[q];var l=L==null?void 0:L.listing_id;if(l){const _=re(L,k),M={textColor:s,backgroundColor:p,isHighlight:_,highlightBackgroundColor:y,cardShowCategories:w,cardShowTags:T};var o=document.querySelectorAll('[data-palette-listing-id="'+l+'"]');for(let ue=0;ue<o.length;ue++){const ge=o[ue];if(ge.querySelector("#"+d)!==null){switch(t){case E:ge.querySelector("#"+d).innerHTML=Q(l,L,M).innerHTML;break;case x:ge.querySelector("#"+d).innerHTML=F(l,L,M).innerHTML;break;default:ge.querySelector("#"+d).innerHTML=Y(l,L,M).innerHTML;break}ae(ge,L)}}}}}).catch(a=>{a instanceof Error&&R.trackEvent(X,{errorMessage:a.message,stack:a.stack});for(let g=0;g<n.length;g++){const l=n[g];if(l){const o=document.querySelectorAll(`div[data-heyetsy-listing-id="${l}"]`)||[];for(let q=0;q<o.length;q++){const L=o[q];if(L)switch(t){case E:L.innerHTML=te(a).innerHTML;break;case x:L.innerHTML=K(a).innerHTML;break;default:L.innerHTML=ee(a).innerHTML;break}}}}})})}},dt=async()=>{const r=await A.getKeys([me]);if(!(r[me]===void 0||r[me]))return;const e=he(window.location.href);if(e&&!document.getElementById("heyEtsyIframeListing")){var t=document.createElement("div");t.setAttribute("id","heyEtsyIframeListing"),t.style.margin="0 auto";var s=document.createElement("iframe");s.style.height="200px",s.style.width="100%",s.style.border="none",s.setAttribute("src","https://heyetsy.com/iframe/listing/"+e),t.appendChild(s);const w=document.querySelector("div.listing-page-content-container-wider")||document.querySelector("body");w&&w.insertAdjacentElement("beforebegin",t);var p=document.createElement("div");p.style.display="flex",p.style.alignItems="center",p.style.justifyContent="start",p.style.padding="10px";var k=document.createElement("style");k.innerHTML=`
  #heyEtsyDownloadAllImages {
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background-color 0.3s ease, transform 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  #heyEtsyDownloadAllImages:hover {
    background-color: #1d4ed8;
  }
  #heyEtsyDownloadAllImages svg {
    fill: white;
  }
  #heyEtsyDownloadAllImages span {
    margin-left: 4px;
  }
`,document.head.appendChild(k);var y=document.createElement("button");y.id="heyEtsyDownloadAllImages",y.innerHTML=`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
    <path fill-rule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087ZM12 10.5a.75.75 0 0 1 .75.75v4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72v-4.94a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
  </svg>
  <span>Download All Images</span>
`,y.onclick=async function(){y.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                <path fill-rule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087ZM12 10.5a.75.75 0 0 1 .75.75v4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72v-4.94a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
              </svg>
                <span style="margin-left: 4px;">
                    Downloading...
                </span>`,y.disabled=!0,p.style.opacity=.5;try{var T=document.querySelectorAll("li[data-palette-listing-image] img[data-src-zoom-image]"),h=[];for(let c=0;c<T.length;c++){const C=T[c];h.push(C.getAttribute("data-src-zoom-image"))}console.log(h);const m=await Gt(h);ct(m)}catch(m){console.error(m)}y.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                <path fill-rule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087ZM12 10.5a.75.75 0 0 1 .75.75v4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72v-4.94a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
              </svg>
              <span style="margin-left: 4px;">
                Download All Images
              </span>`,y.disabled=!1,p.style.opacity=1},p.appendChild(y),t.appendChild(p)}},ct=function(r){const e=he(window.location.href),t=window.document.createElement("a");t.href=window.URL.createObjectURL(r),t.download=`listing-${e}-images.zip`,document.body.appendChild(t),t.click(),window.URL.revokeObjectURL(t.href),document.body.removeChild(t)},gt=25,ht=".responsive-listing-grid, ul[data-listings-grid], ul.favorites-landing-listing-card-row, ul.implicit-comparison-listing-card-row",ut=".responsive-listing-grid > li, .responsive-listing-grid > div, ul[data-listings-grid] > div, ul.favorites-landing-listing-card-row > li, ul.implicit-comparison-listing-card-row > li",pt=(r=!1)=>{r&&console.info("people handler"),oe()},yt=async(r=!1)=>{r&&console.log("people injector"),(await A.get(I)==null||await A.get(I))&&(setTimeout(ke,2e3),new MutationObserver(e=>{e.forEach(t=>{t.type=="attributes"&&t.target==document.body&&setTimeout(ke,2e3)})}).observe(document.body,{attributes:!0,childList:!1,subtree:!1}))};function Me(r){const e=/[https:\/\/www.etsy.com\/listing\/]([0-9]+)/;var t;return(t=e.exec(r))!==null?t[1]:!1}const ke=async()=>{const r=await A.get(se);if(!r)return;const e=await A.getKeys([Z,D,P,$,O,j,z]),t=e[Z]||x,s=e[D]||ie,p=e[P]||N,k=e[$]?JSON.parse(e[$]):le,y=e[O]||G,w=e[j]==null?de:e[j],T=e[z]==null?ce:e[z];if(document.querySelectorAll(ht).length>0){var h=document.querySelectorAll(ut);h=Array.from(h).filter(function(i){return i.querySelector("#"+d)===null});for(var m=[...new Set([...h].map(i=>{var n;if(i.hasAttribute("data-palette-listing-id"))return i.getAttribute("data-palette-listing-id");if(i.querySelector("[data-palette-listing-id]"))return i.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id");if(i.querySelectorAll(".listing-link").length>0)return i.querySelectorAll(".listing-link").length>0?Me(i.querySelectorAll(".listing-link")[0].getAttribute("href")):!1;var f=i.querySelectorAll("a").length>0?Me(i.querySelectorAll("a")[0].getAttribute("href")):!1;return f&&((n=i==null?void 0:i.querySelector(".wt-card__inner"))==null||n.setAttribute("data-palette-listing-id",f)),f}).filter(Boolean))],c=0;c<h.length;++c){var C=h[c],S=C,b=S.querySelector("[data-palette-listing-id]")?C.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):!1,v=S.hasAttribute("data-palette-listing-id")?S:S.querySelector('[data-palette-listing-id="'+b+'"]');if(v&&v.querySelector("#"+d)===null){const i=document.createElement("div");i.id=d,i.setAttribute("data-heyetsy-listing-id",b);const f={textColor:s,backgroundColor:p,cardShowCategories:w,cardShowTags:T};switch(t){case E:i.innerHTML=W(b,f).innerHTML;break;case x:i.innerHTML=V(b,f).innerHTML;break;default:i.innerHTML=J(b,f).innerHTML;break}v.insertAdjacentHTML("beforeend",i.outerHTML)}}for(var H=[];m.length>0;)H.push(m.splice(0,gt));H.forEach(i=>{const f=i.toString();fetch(`${U}/bulk/listings/${f}`,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${r}`}}).then(n=>n.ok?n.json():Promise.reject(n)).then(n=>{var u=n.data;for(let l=0;l<u.length;l++){const o=u[l];var a=o==null?void 0:o.listing_id;if(a){const q=re(o,k),L={textColor:s,backgroundColor:p,isHighlight:q,highlightBackgroundColor:y,cardShowCategories:w,cardShowTags:T};var g=document.querySelectorAll('[data-palette-listing-id="'+a+'"]');for(let _=0;_<g.length;_++){const M=g[_];if(M.querySelector("#"+d)!==null){switch(t){case E:M.querySelector("#"+d).innerHTML=Q(a,o,L).innerHTML;break;case x:M.querySelector("#"+d).innerHTML=F(a,o,L).innerHTML;break;default:M.querySelector("#"+d).innerHTML=Y(a,o,L).innerHTML;break}ae(M,o)}}}}}).catch(n=>{n instanceof Error&&(console.log(n),R.trackEvent(X,{errorMessage:n.message,stack:n.stack}));for(let u=0;u<i.length;u++){const a=i[u];if(a){const g=document.querySelectorAll(`div[data-heyetsy-listing-id="${a}"]`)||[];for(let l=0;l<g.length;l++){const o=g[l];if(o)switch(t){case E:o.innerHTML=te(n).innerHTML;break;case x:o.innerHTML=K(n).innerHTML;break;default:o.innerHTML=ee(n).innerHTML;break}}}}})})}},mt=25,ft="ul.wt-block-grid, .search-listings-group",vt="ul.wt-block-grid > li, .search-listings-group li",bt=(r=!1)=>{r&&console.info("search handler"),oe()},wt=async(r=!1)=>{r&&console.log("search injector"),(await A.get(I)==null||await A.get(I))&&(setTimeout(xe,2e3),new MutationObserver(e=>{e.forEach(t=>{t.type=="attributes"&&t.target==document.body&&setTimeout(xe,2e3)})}).observe(document.body,{attributes:!0,childList:!1,subtree:!1}))};function St(r){const e=/[https:\/\/www.etsy.com\/listing\/]([0-9]+)/;var t;return(t=e.exec(r))!==null?t[1]:!1}const xe=async()=>{const r=await A.get(se);if(!r)return;const e=await A.getKeys([Z,D,P,$,O,j,z]),t=e[Z]||x,s=e[D]||ie,p=e[P]||N,k=e[$]?JSON.parse(e[$]):le,y=e[O]||G,w=e[j]==null?de:e[j],T=e[z]==null?ce:e[z];if(document.querySelectorAll(ft).length>0){var h=document.querySelectorAll(vt);h=Array.from(h).filter(function(i){return i.querySelector("#"+d)===null});for(var m=[...new Set([...h].map(i=>i.hasAttribute("data-palette-listing-id")?i.getAttribute("data-palette-listing-id"):i.querySelector("[data-palette-listing-id]")?i.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):i.querySelectorAll(".listing-link").length>0?St(i.querySelectorAll(".listing-link")[0].getAttribute("href")):!1).filter(Boolean))],c=0;c<h.length;++c){var C=h[c],S=C,b=S.querySelector("[data-palette-listing-id]")?C.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):!1,v=S.hasAttribute("data-palette-listing-id")?S:S.querySelector('[data-palette-listing-id="'+b+'"]');if(v&&v.querySelector("#"+d)===null){const i=document.createElement("div");i.id=d,i.setAttribute("data-heyetsy-listing-id",b);const f={textColor:s,backgroundColor:p,cardShowCategories:w,cardShowTags:T};switch(t){case E:i.innerHTML=W(b,f).innerHTML;break;case x:i.innerHTML=V(b,f).innerHTML;break;default:i.innerHTML=J(b,f).innerHTML;break}v.insertAdjacentHTML("beforeend",i.outerHTML)}}for(var H=[];m.length>0;)H.push(m.splice(0,mt));H.forEach(i=>{const f=i.toString();fetch(`${U}/bulk/listings/${f}`,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${r}`}}).then(n=>n.ok?n.json():Promise.reject(n)).then(n=>{var u=n.data;for(let l=0;l<u.length;l++){const o=u[l];var a=o==null?void 0:o.listing_id;if(a){const q=re(o,k),L={textColor:s,backgroundColor:p,isHighlight:q,highlightBackgroundColor:y,cardShowCategories:w,cardShowTags:T};var g=document.querySelectorAll('[data-palette-listing-id="'+a+'"]');for(let _=0;_<g.length;_++){const M=g[_];if(M.querySelector("#"+d)!==null){switch(t){case E:M.querySelector("#"+d).innerHTML=Q(a,o,L).innerHTML;break;case x:M.querySelector("#"+d).innerHTML=F(a,o,L).innerHTML;break;default:M.querySelector("#"+d).innerHTML=Y(a,o,L).innerHTML;break}ae(M,o)}}}}}).catch(n=>{n instanceof Error&&R.trackEvent(X,{errorMessage:n.message,stack:n.stack});for(let u=0;u<i.length;u++){const a=i[u];if(a){const g=document.querySelectorAll(`div[data-heyetsy-listing-id="${a}"]`)||[];for(let l=0;l<g.length;l++){const o=g[l];if(o)switch(t){case E:o.innerHTML=te(n).innerHTML;break;case x:o.innerHTML=K(n).innerHTML;break;default:o.innerHTML=ee(n).innerHTML;break}}}}})})}},Tt=25,Lt='ul[id="search-results"], .responsive-listing-grid',Mt='ul[id="search-results"] > li, .responsive-listing-grid > div',kt=(r=!1)=>{r&&console.info("market handler"),oe()},xt=async(r=!1)=>{r&&console.log("market injector"),(await A.get(I)==null||await A.get(I))&&(setTimeout(He,2e3),new MutationObserver(e=>{e.forEach(t=>{t.type=="attributes"&&t.target==document.body&&setTimeout(He,2e3)})}).observe(document.body,{attributes:!0,childList:!1,subtree:!1}))};function Ht(r){const e=/[https:\/\/www.etsy.com\/listing\/]([0-9]+)/;var t;return(t=e.exec(r))!==null?t[1]:!1}const He=async()=>{const r=await A.get(se);if(!r)return;const e=await A.getKeys([Z,D,P,$,O,j,z]),t=e[Z]||x,s=e[D]||ie,p=e[P]||N,k=e[$]?JSON.parse(e[$]):le,y=e[O]||G,w=e[j]==null?de:e[j],T=e[z]==null?ce:e[z];if(document.querySelectorAll(Lt).length>0){var h=document.querySelectorAll(Mt);h=Array.from(h).filter(function(i){return i.querySelector("#"+d)===null});for(var m=[...new Set([...h].map(i=>i.hasAttribute("data-palette-listing-id")?i.getAttribute("data-palette-listing-id"):i.querySelector("[data-palette-listing-id]")?i.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):i.querySelectorAll(".listing-link").length>0?Ht(i.querySelectorAll(".listing-link")[0].getAttribute("href")):!1).filter(Boolean))],c=0;c<h.length;++c){var C=h[c],S=C,b=S.querySelector("[data-palette-listing-id]")?C.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):!1,v=S.hasAttribute("data-palette-listing-id")?S:S.querySelector('[data-palette-listing-id="'+b+'"]');if(v&&v.querySelector("#"+d)===null){const i=document.createElement("div");i.id=d,i.setAttribute("data-heyetsy-listing-id",b);const f={textColor:s,backgroundColor:p,cardShowCategories:w,cardShowTags:T};switch(t){case E:i.innerHTML=W(b,f).innerHTML;break;case x:i.innerHTML=V(b,f).innerHTML;break;default:i.innerHTML=J(b,f).innerHTML;break}v.insertAdjacentHTML("beforeend",i.outerHTML)}}for(var H=[];m.length>0;)H.push(m.splice(0,Tt));H.forEach(i=>{const f=i.toString();fetch(`${U}/bulk/listings/${f}`,{method:"GET",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${r}`}}).then(n=>n.ok?n.json():Promise.reject(n)).then(n=>{var u=n.data;for(let l=0;l<u.length;l++){const o=u[l];var a=o==null?void 0:o.listing_id;if(a){const q=re(o,k),L={textColor:s,backgroundColor:p,isHighlight:q,highlightBackgroundColor:y,cardShowCategories:w,cardShowTags:T};var g=document.querySelectorAll('[data-palette-listing-id="'+a+'"]');for(let _=0;_<g.length;_++){const M=g[_];if(M.querySelector("#"+d)!==null){switch(t){case E:M.querySelector("#"+d).innerHTML=Q(a,o,L).innerHTML;break;case x:M.querySelector("#"+d).innerHTML=F(a,o,L).innerHTML;break;default:M.querySelector("#"+d).innerHTML=Y(a,o,L).innerHTML;break}ae(M,o)}}}}}).catch(n=>{n instanceof Error&&(console.log(n),R.trackEvent(X,{errorMessage:n.message,stack:n.stack}));for(let u=0;u<i.length;u++){const a=i[u];if(a){const g=document.querySelectorAll(`div[data-heyetsy-listing-id="${a}"]`)||[];for(let l=0;l<g.length;l++){const o=g[l];if(o)switch(t){case E:o.innerHTML=te(n).innerHTML;break;case x:o.innerHTML=K(n).innerHTML;break;default:o.innerHTML=ee(n).innerHTML;break}}}}})})}},At="#favorite_listings_panel ul:first-child > li, #reorderable-listing-results > li, .listing-cards > li, .responsive-listing-grid > li, #search-results > li, .search-listings-group li, div[data-appears-component-name='shop_home_listings_section'] div.v2-listing-card, .responsive-listing-grid > div, ul.toolkit-carousel-inner > li, ul.wt-block-grid > li, ul[data-listings-grid] > div",Ct=(r=!1)=>{r&&console.info("metadata handler")},qt=async(r=!1)=>{r&&console.log("metadata injector");const e=document.querySelectorAll(At);var t=[...new Set([...e].map(s=>{var p=s,k=p.querySelector("[data-palette-listing-id]")?s.querySelector("[data-palette-listing-id]").getAttribute("data-palette-listing-id"):!1;if(!k)return!1;var y=p.hasAttribute("data-palette-listing-id")?p:p.querySelector('[data-palette-listing-id="'+k+'"]'),w=y?y.textContent.toLowerCase().includes("FREE shipping".toLowerCase()):!1,T=y?y.textContent.toLowerCase().includes("Bestseller".toLowerCase()):!1,h=y?y.textContent.toLowerCase().includes("Popular now".toLowerCase()):!1,m=y?y.textContent.toLowerCase().includes("Etsy\u2019s Pick".toLowerCase()):!1,c=y?y.querySelectorAll(".v2-listing-card__info div.text-danger.text-body-smaller").length>0:!1;return{listing_id:k,freeShipping:w,bestSeller:T,popularNow:h,etsyPick:m,lowStock:c}}).filter(Boolean))];chrome.runtime.sendMessage({type:"META_DATA",data:t})};(await A.get(_e)==null?!0:await A.get(_e))&&(window.location.href.match(/\/c\//)&&(Ve(B),Fe(B)),window.location.href.match(/\/shop\//)&&(Qe(B),Xe(B)),window.location.href.match(/\/listing\//)&&(lt(B),st(B)),window.location.href.match(/\/people\//)&&(pt(B),yt(B)),window.location.href.match(/\/search/)&&(bt(B),wt(B)),window.location.href.match(/\/market/)&&(kt(B),xt(B))),Ee(B),$e(B),Ct(B),qt(B),chrome.runtime.onMessage.addListener((r,e,t)=>{switch(r.type){case"RELOAD_PAGE":window.location.reload();break}}),R.trackEvent(jt);const _t=chrome.runtime?chrome.runtime.getManifest():{version:"N/A"},Et=_t.version;R.trackEvent(Rt,{version:Et})});
