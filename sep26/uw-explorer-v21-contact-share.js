(function(){
  if(document.documentElement.dataset.v21ContactShare==='1')return;
  document.documentElement.dataset.v21ContactShare='1';

  const hostParams=(()=>{try{return new URL(window.parent.location.href).searchParams;}catch(_){return new URLSearchParams();}})();
  const recipientMode=hostParams.has('shared');
  const presenterPrefill=(hostParams.get('pn')||'').trim();
  const firstName=value=>String(value||'').trim().replace(/\s+/g,' ').split(' ')[0].slice(0,40);
  const esc=value=>String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const WA_ICON='<svg viewBox="0 0 39 39" aria-hidden="true"><path fill="#00E676" d="M10.7 32.8l.6.3c2.5 1.5 5.3 2.2 8.1 2.2 8.8 0 16-7.2 16-16 0-4.2-1.7-8.3-4.7-11.3s-7-4.7-11.3-4.7c-8.8 0-16 7.2-15.9 16.1 0 3 .9 5.9 2.4 8.4l.4.6-1.6 5.9 6-1.5z"/><path fill="#fff" d="M32.4 6.4C29 2.9 24.3 1 19.5 1 9.3 1 1.1 9.3 1.2 19.4c0 3.2.9 6.3 2.4 9.1L1 38l9.7-2.5c2.7 1.5 5.7 2.2 8.7 2.2 10.1 0 18.3-8.3 18.3-18.4 0-4.9-1.9-9.5-5.3-12.9zM19.5 34.6c-2.7 0-5.4-.7-7.7-2.1l-.6-.3-5.8 1.5L6.9 28l-.4-.6c-4.4-7.1-2.3-16.5 4.9-20.9s16.5-2.3 20.9 4.9 2.3 16.5-4.9 20.9c-2.3 1.5-5.1 2.3-7.9 2.3zm8.8-11.1l-1.1-.5-2.6-1.2c-.3 0-.5.1-.7.2l-1.5 1.7c-.1.2-.3.3-.5.3-.2 0-.6-.2-.9-.4-1.5-.7-2.8-1.6-3.9-2.8-1-1.1-1.8-2.2-2.4-3.4-.2-.3 0-.6.2-.8l1-1.2c.2-.3.3-.7.2-1-.1-.5-1.3-3.2-1.6-3.8-.2-.3-.4-.4-.7-.5h-1.1c-.5.1-.9.3-1.3.7-1 .9-1.5 2.2-1.5 3.5 0 .8.2 1.6.5 2.3 1 2.2 2.5 4.1 4.3 5.8 2.2 2 4.8 3.4 7.7 4.1 1.1.3 2.4.2 3.4-.3 1-.5 1.8-1.3 2.2-2.3.2-.4.3-.9.4-1.4 0-.3-.1-.5-.4-.6z"/></svg>';
  const EMAIL_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.4" fill="#eef5ff" stroke="#2878d0" stroke-width="1.8"/><path d="M4.5 7l7.5 5.8L19.5 7" fill="none" stroke="#2878d0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CALL_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 3.6l2.4 4.2-2 1.8c.9 2.2 2.7 4 4.9 4.9l1.8-2 4.2 2.4-.7 4c-.2 1-1.1 1.7-2.1 1.6C9 19.8 4.2 15 3.5 8.4c-.1-1 .6-1.9 1.6-2.1l2-.7z" fill="#eaf8f3" stroke="#178b67" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  const SHARE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 12.5l7-4M8.5 11.5l7 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="6" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="7" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="17" r="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

  const style=document.createElement('style');
  style.textContent=`
    .v21-profile-actions{position:fixed;right:.78rem;top:4.8rem;z-index:1400;width:min(18.5rem,calc(100vw - 1.5rem));display:none;gap:.52rem;padding:.72rem;background:rgba(255,255,255,.98);border:1px solid rgba(38,22,79,.12);border-radius:1rem;box-shadow:0 16px 42px rgba(38,22,79,.18)}
    .profile-bubble-wrap .fab-actions.open{display:none!important}.profile-bubble-wrap.v21-open .v21-profile-actions{display:grid}
    .v21-profile-btn{min-height:2.9rem;border-radius:.78rem;border:1px solid rgba(38,22,79,.11);background:#fff;color:#26164f;text-decoration:none;font:850 .88rem/1.1 system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;gap:.55rem;text-align:center;cursor:pointer;padding:.65rem .8rem;box-shadow:0 3px 10px rgba(38,22,79,.045)}
    .v21-profile-btn.primary{background:linear-gradient(135deg,#7a42c8,#5e2fab);color:#fff;border-color:transparent}.v21-profile-btn.share{margin-top:.18rem;border-style:dashed;color:#6a39b0;background:#faf8ff}.v21-profile-btn svg{width:1.2rem;height:1.2rem;flex:0 0 auto}.v21-profile-btn .emoji{font-size:1.08rem}
    .v21-overlay{position:fixed;inset:0;z-index:5000;background:rgba(38,22,79,.46);display:grid;place-items:center;padding:1rem}.v21-modal{width:min(26rem,100%);max-height:calc(100vh - 2rem);overflow:auto;background:#fff;color:#26164f;border-radius:1rem;padding:1rem;box-shadow:0 22px 65px rgba(38,22,79,.28);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}.v21-modal h3{margin:.05rem 0 .28rem;font-size:1.08rem}.v21-modal p{margin:.25rem 0 .8rem;color:#6e6679;font-size:.82rem;line-height:1.42}.v21-modal-close{float:right;border:0;background:transparent;font-size:1.45rem;line-height:1;color:#6f6679;cursor:pointer;padding:.1rem .2rem}.v21-contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem;margin-top:.8rem}.v21-contact-route{display:grid;justify-items:center;gap:.35rem;text-decoration:none;color:#26164f;font-size:.76rem;font-weight:850;padding:.75rem .35rem;border:1px solid #e6e0ef;border-radius:.78rem;background:#fff}.v21-contact-route svg{width:1.65rem;height:1.65rem}.v21-field-label{display:block;font-size:.75rem;font-weight:850;margin:.72rem 0 .3rem}.v21-name-input{width:100%;box-sizing:border-box;border:1.5px solid #dfd8e9;border-radius:.72rem;padding:.72rem .78rem;font:700 .9rem system-ui;color:#26164f}.v21-contexts{display:grid;gap:.42rem;margin-top:.3rem}.v21-context{display:flex;gap:.55rem;align-items:flex-start;border:1px solid #e6e0ef;border-radius:.72rem;padding:.62rem .68rem;cursor:pointer;font-size:.8rem;font-weight:750;line-height:1.3}.v21-context input{margin:.14rem 0 0}.v21-share-actions{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin-top:.85rem}.v21-share-actions button,.v21-share-actions a{min-height:2.75rem;border-radius:.72rem;border:1px solid rgba(122,66,200,.24);background:#fff;color:#26164f;font:850 .82rem system-ui;display:flex;align-items:center;justify-content:center;gap:.45rem;text-decoration:none;cursor:pointer}.v21-share-actions .primary{background:#7a42c8;color:#fff;border-color:#7a42c8}.v21-share-actions svg{width:1.15rem;height:1.15rem}.v21-toast{position:fixed;left:50%;bottom:1.25rem;transform:translateX(-50%);z-index:7000;background:#26164f;color:#fff;border-radius:999px;padding:.62rem .9rem;font:800 .76rem system-ui;box-shadow:0 9px 28px rgba(38,22,79,.25)}
    @media(max-width:520px){.v21-profile-actions{right:.55rem;top:4.25rem;width:min(17rem,calc(100vw - 1.1rem))}.v21-contact-grid{gap:.4rem}.v21-modal{padding:.9rem}.v21-share-actions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function hostBase(){
    try{const u=new URL(window.parent.location.href);u.search='';u.hash='';return u;}catch(_){return new URL('https://aqcroft.github.io/UW_PET_GH_v2/sep26/earningstool-vfinal-coaching-preview-v21.html');}
  }
  function personalisedUrl(name,ctx){const u=hostBase();u.searchParams.set('shared','1');if(name)u.searchParams.set('n',firstName(name));u.searchParams.set('ctx',ctx||'together');return u.href;}
  function friendUrl(){const u=hostBase();u.searchParams.set('shared','friend');return u.href;}
  function copyText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);return new Promise((resolve,reject)=>{try{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy')?resolve():reject();t.remove();}catch(e){reject(e);}});}
  function toast(message){document.querySelector('.v21-toast')?.remove();const t=document.createElement('div');t.className='v21-toast';t.textContent=message;document.body.appendChild(t);setTimeout(()=>t.remove(),2000);}
  function closeModal(){document.querySelector('.v21-overlay')?.remove();}
  function modal(title,body){closeModal();const ov=document.createElement('div');ov.className='v21-overlay';ov.innerHTML=`<section class="v21-modal" role="dialog" aria-modal="true"><button class="v21-modal-close" type="button" aria-label="Close">×</button><h3>${title}</h3>${body}</section>`;ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.v21-modal-close'))closeModal();});document.body.appendChild(ov);return ov;}

  window.openV21Contact=function(){
    const ov=modal('Get in touch',`<p>Choose whichever is easiest.</p><div class="v21-contact-grid"><a class="v21-contact-route" href="${whatsappUrl()}" target="_blank" rel="noopener">${WA_ICON}<span>WhatsApp</span></a><a class="v21-contact-route" href="${emailUrl()}">${EMAIL_ICON}<span>Email</span></a><a class="v21-contact-route" href="${phoneUrl()}">${CALL_ICON}<span>Call</span></a></div>`);
    ov.querySelector('.v21-contact-route')?.focus?.();
  };

  const contextCopy={
    together:{label:'We looked at it together',wa:name=>`Hi ${name||'there'} 👋 Here’s the earnings tool we looked at earlier so you can have another play with it. If anything stands out, you can use the options in the tool to get registered, book a chat, or get in touch with any questions.`},
    familiar:{label:'They know UW / have seen other tools',wa:name=>`Hi ${name||'there'} 👋 Here’s another way of looking at how the UW Partner earnings can build. Have a play when you get a moment. You can use the options in the tool to get registered, book a chat, or get in touch with any questions.`},
    first:{label:'First look at Partner earnings',wa:name=>`Hi ${name||'there'} 👋 Thought this might be useful - it’s a simple interactive way to see how the UW Partner earnings can build over the first 60 days. You can use the options in the tool to get registered, book a chat, or get in touch with any questions.`}
  };

  window.openV21Share=function(){
    const pre=firstName(presenterPrefill);
    const ov=modal('Share this tool',`<p>Create a personalised recipient link. The name is editable.</p><label class="v21-field-label" for="v21ShareName">First name</label><input class="v21-name-input" id="v21ShareName" value="${esc(pre)}" placeholder="e.g. Sab" autocomplete="off"><label class="v21-field-label">Context</label><div class="v21-contexts">${Object.entries(contextCopy).map(([key,item],i)=>`<label class="v21-context"><input type="radio" name="v21ctx" value="${key}" ${i===0?'checked':''}><span>${item.label}</span></label>`).join('')}</div><div class="v21-share-actions"><button type="button" id="v21CopyShare">${SHARE_ICON}<span>Copy link</span></button><button type="button" class="primary" id="v21WhatsAppShare">${WA_ICON}<span>WhatsApp</span></button></div>`);
    const get=()=>{const name=firstName(ov.querySelector('#v21ShareName').value),ctx=ov.querySelector('input[name="v21ctx"]:checked')?.value||'together';return{name,ctx,url:personalisedUrl(name,ctx)};};
    ov.querySelector('#v21CopyShare').addEventListener('click',async()=>{const x=get();try{await copyText(x.url);toast('Personalised link copied');}catch(_){window.prompt('Copy this link:',x.url);}});
    ov.querySelector('#v21WhatsAppShare').addEventListener('click',()=>{const x=get(),text=contextCopy[x.ctx].wa(x.name);window.open(`https://wa.me/?text=${encodeURIComponent(text+'\n\n'+x.url)}`,'_blank','noopener');});
    setTimeout(()=>ov.querySelector('#v21ShareName')?.focus(),0);
  };

  window.openV21FriendShare=function(){
    const ov=modal('Share this with a friend',`<p>Send a fresh recipient copy. No personal details from this link are passed on.</p><label class="v21-field-label" for="v21FriendName">First name <span style="font-weight:600">(optional)</span></label><input class="v21-name-input" id="v21FriendName" placeholder="e.g. Sam" autocomplete="off"><div class="v21-share-actions"><button type="button" id="v21FriendCopy">${SHARE_ICON}<span>Copy link</span></button><button type="button" class="primary" id="v21FriendWa">${WA_ICON}<span>WhatsApp</span></button></div>`);
    const url=friendUrl();
    ov.querySelector('#v21FriendCopy').addEventListener('click',async()=>{try{await copyText(url);toast('Link copied');}catch(_){window.prompt('Copy this link:',url);}});
    ov.querySelector('#v21FriendWa').addEventListener('click',()=>{const name=firstName(ov.querySelector('#v21FriendName').value);const text=`Hi ${name||'there'} 👋 Thought you might find this interesting. It’s a simple interactive look at how the UW Partner earnings can build over the first 60 days.`;window.open(`https://wa.me/?text=${encodeURIComponent(text+'\n\n'+url)}`,'_blank','noopener');});
  };

  const originalToggle=window.toggleContact;
  window.toggleContact=function(){
    state.contactOpen=!state.contactOpen;
    if(!state.contactOpen)state.sayHiOpen=false;
    render();
  };

  window.contactMarkup=function(){
    const extra=state.contactOpen?' v21-open':'';
    return `<div class="profile-bubble-wrap${extra}">
      <button class="profile-photo-btn" onclick="toggleContact()" aria-label="${state.contactOpen?'Close contact menu':'Open contact menu'}">
        <img src="${CONTACT.photoUrl}" alt="${CONTACT.fullName}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
        <span class="initials">AC</span>
      </button>
      <div class="v21-profile-actions">
        <a href="${registerUrl}" target="_blank" rel="noopener" class="v21-profile-btn primary"><span class="emoji">✅</span><strong>Get registered</strong></a>
        <a href="${CONTACT.calendarUrl}" target="_blank" rel="noopener" class="v21-profile-btn"><span class="emoji">🗓️</span><strong>Book a chat</strong></a>
        <button class="v21-profile-btn" type="button" onclick="openV21Contact()"><span class="emoji">👋</span><strong>Get in touch</strong></button>
        <button class="v21-profile-btn share" type="button" onclick="${recipientMode?'openV21FriendShare()':'openV21Share()'}">${SHARE_ICON}<strong>${recipientMode?'Share this with a friend':'Share this tool'}</strong></button>
      </div>
    </div>`;
  };

  try{render();}catch(error){console.error('V21 contact/share render failed',error);}
})();
