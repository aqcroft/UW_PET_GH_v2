(function(){
  if(document.documentElement.dataset.coachingPreviewV12Refinement==='1')return;
  document.documentElement.dataset.coachingPreviewV12Refinement='1';

  const nativeSetTimeout=window.setTimeout.bind(window);
  window.setTimeout=function(fn,delay,...args){return nativeSetTimeout(fn,delay===2200?1500:delay,...args);};

  let initialReady=false;
  let earnedFastStartAnimated=false;
  const style=document.createElement('style');
  style.textContent=`
    .hero.v12-hero-passive{opacity:.60;filter:saturate(.72);transition:opacity .55s ease,filter .55s ease}
    .hero{transition:opacity .55s ease,filter .55s ease}
    .add-customer-main.v12-initial-passive,.add-customer-main.v12-forced-passive{opacity:.38!important;filter:saturate(.18)!important;background:#aeb7c4!important;border-color:#aeb7c4!important;color:#fff!important;pointer-events:none!important;box-shadow:none!important}
    .v12-pointer{display:block;font-size:1.85rem;line-height:1;margin-top:.48rem}
    .notice-faststart-setup .fast-start-step-button.v9-step-current:not([disabled]){opacity:1!important;filter:none!important;background:linear-gradient(145deg,#173c78,var(--blue))!important;border-color:var(--blue)!important;color:#fff!important;box-shadow:0 8px 18px rgba(29,79,145,.18)!important}
    .notice-faststart-setup .fast-start-step-button.v9-step-locked,.notice-faststart-setup .fast-start-step-button[disabled]:not(.done):not(.v9-step-done){opacity:.32!important;filter:saturate(.35)!important;background:#eef2f6!important;border-color:#cbd4df!important;color:#536477!important;box-shadow:none!important}
    @keyframes v12StepNudge{0%,100%{transform:scale(1);box-shadow:0 8px 18px rgba(29,79,145,.18)}48%{transform:scale(1.035);box-shadow:0 0 0 .34rem rgba(29,79,145,.18),0 10px 22px rgba(29,79,145,.18)}}
    .notice-faststart-setup .fast-start-step-button.v9-step-current.v9-step-pulse:not([disabled]){animation:v12StepNudge 1.2s ease-in-out 1 both!important;opacity:1!important}
    .notice-faststart-setup .fast-start-step-button.done,.notice-faststart-setup .fast-start-step-button.v9-step-done{opacity:1!important;filter:none!important}
    .notice-faststart-setup.v12-fast-earned{opacity:1!important;transform:none!important;animation:none!important}
    .notice-backdrop.v12-fast-earned-backdrop{opacity:1!important;animation:none!important}
    .notice-faststart-setup.v12-fast-earned a.v12-secondary-cta{background:#fff!important;color:var(--blue)!important;border-color:rgba(29,79,145,.28)!important}
    .notice-faststart-setup.v12-fast-earned button.v12-primary-explore{background:linear-gradient(145deg,#173c78,var(--blue))!important;border-color:var(--blue)!important;color:#fff!important;opacity:1!important}
    @media(prefers-reduced-motion:reduce){.hero,.v12-fast-earned{transition:none!important;animation:none!important}}
  `;
  document.head.appendChild(style);

  function totalCount(){return state.month1.length+state.month2.length;}
  function addButton(){return document.querySelector('.add-customer-main');}
  function pointer(){return '<span class="v12-pointer">👇</span>';}
  function coachNodes(root){const out=[];if(root?.nodeType===1){if(root.matches?.('.v9-coach'))out.push(root);root.querySelectorAll?.('.v9-coach').forEach(el=>out.push(el));}return out;}

  function refineCoach(coach){
    if(!coach||coach.dataset.v12Refined==='1')return;
    const text=coach.textContent.replace(/\s+/g,' ').trim();
    if(text.includes('First customer added'))coach.innerHTML='<strong>First customer added</strong>'+pointer();
    else if(text.includes('Great stuff!')&&text.includes('second customer'))coach.innerHTML='<strong>Great stuff!</strong><span class="coach-line">Another £250 for your second customer</span>';
    else if(text.includes('One more 3-service homeowner'))coach.innerHTML='<strong>One more 3-service homeowner</strong><span class="coach-line">unlocks a new bonus</span>'+pointer();
    else if(text.includes("extra £400")||text.includes('£1,000'))coach.innerHTML='<strong>£1,000 ➡️ £1,400</strong><span class="coach-line">Yes, that\'s an extra £400!</span>';
    else if(text.includes('A new bonus is now in play'))coach.innerHTML='<strong>Momentum Bonus</strong><span class="coach-line"><strong>A new bonus is unlocked</strong><br>For unsupported 3+ service customers</span>'+pointer();
    else if(text.includes('Your confidence is building!')||text.includes('Encouraging confidence, rewarding independence'))coach.innerHTML='<div style="font-size:1.55rem;line-height:1;margin-bottom:.35rem">⚡</div><strong>Momentum Bonus awarded</strong><span class="coach-line">Encouraging confidence, rewarding independence.</span>';
    else if(text.includes('One more to go'))coach.innerHTML='<strong>One more to go</strong><span class="coach-line">Complete the demo</span>'+pointer();
    coach.dataset.v12Refined='1';
  }

  function refineHero(){
    const hero=document.querySelector('.hero');
    if(hero)hero.classList.toggle('v12-hero-passive',totalCount()===0);
    const pill=document.querySelector('.hero-meta-pill');
    if(pill){for(const span of pill.querySelectorAll('span')){if(/3\s+service\s+homeowners/i.test(span.textContent))span.textContent='3-service homeowner';}}
  }

  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
  function refineActions(){
    const btn=addButton();
    if(btn){
      btn.classList.toggle('v12-initial-passive',totalCount()===0&&!initialReady);
      const blockingModal=!!document.querySelector('.notice-backdrop:not(.howpaid-overlay)');
      const beforeBatch=totalCount()===6&&!window.__v12BatchReadyVisual;
      btn.classList.toggle('v12-forced-passive',(blockingModal&&!state.habRevealInProgress&&!state.momentumRevealInProgress)||beforeBatch);
      if(totalCount()===6){
        setText(btn.querySelector('.add-label-main'),'Add a few customers');
        setText(btn.querySelector('.add-label-sub'),'');
        setText(btn.querySelector('.add-label-icon'),'👥');
      }
    }
    const back=document.querySelector('.v9-back-step');
    if(back){back.disabled=false;back.style.opacity='1';back.title='Go back to the previous available checkpoint';}
  }

  function refineMomentumModal(popup){
    if(popup.dataset.v12MomentumRefined==='1')return;
    popup.dataset.v12MomentumRefined='1';
    const heading=popup.querySelector('.milestone-heading');if(heading&&heading.textContent!=='Momentum Bonus')heading.textContent='Momentum Bonus';
    const paras=popup.querySelectorAll('p.muted');
    if(paras[0])paras[0].innerHTML='An <strong>extra £125</strong> for every <strong>3+ service customer.</strong>';
    if(paras[1])paras[1].style.display='none';
  }

  function refineFastStart(popup){
    const earned=state.fastStartRevealComplete&&popup.textContent.includes('£500 Fast Start earned');
    if(!earned)return;
    popup.classList.add('v12-fast-earned');popup.closest('.notice-backdrop')?.classList.add('v12-fast-earned-backdrop');
    if(!earnedFastStartAnimated&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      earnedFastStartAnimated=true;
      popup.animate([{opacity:0,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'none'}],{duration:480,easing:'cubic-bezier(.22,.8,.32,1)',fill:'forwards'}).finished.catch(()=>{});
    }
    const register=Array.from(popup.querySelectorAll('a')).find(el=>el.textContent.includes('Ready to earn'));
    if(register){register.classList.remove('blue');register.classList.add('secondary','v12-secondary-cta');}
    const explore=Array.from(popup.querySelectorAll('button')).find(el=>el.textContent.includes('Explore days 31-60'));
    if(explore){explore.classList.remove('secondary');explore.classList.add('blue','v12-primary-explore');}
  }

  function refineModal(){
    const popup=document.querySelector('.notice-backdrop:not(.howpaid-overlay) > .notice-popup');
    if(!popup)return;
    if(popup.textContent.includes('Momentum Bonus unlocked'))refineMomentumModal(popup);
    if(popup.classList.contains('notice-faststart-setup'))refineFastStart(popup);
  }

  function refineAll(root=document.body){refineHero();refineActions();refineModal();coachNodes(root).forEach(refineCoach);}

  const originalRender=render;
  render=function(){originalRender();refineAll(document.body);};

  const obs=new MutationObserver(records=>{
    let added=false;
    for(const record of records){
      for(const node of record.addedNodes){
        added=true;
        for(const coach of coachNodes(node)){
          refineCoach(coach);
          if(coach.textContent.includes('Momentum Bonus awarded'))nativeSetTimeout(()=>{window.__v12BatchReadyVisual=true;refineActions();},3950);
        }
      }
    }
    if(added)refineAll(document.body);
  });
  obs.observe(document.body,{childList:true,subtree:true});

  document.addEventListener('click',event=>{
    const back=event.target.closest?.('.v9-back-step');
    if(back){event.preventDefault();event.stopImmediatePropagation();window.CoachingPreviewV9?.undo?.();nativeSetTimeout(()=>refineAll(document.body),0);}
  },true);

  window.CoachingPreviewV12={
    setInitialReady(value){initialReady=!!value;refineAll(document.body);},
    activateFirstAction(){initialReady=true;refineAll(document.body);window.CoachingPreviewV9?.pulseFirstAction?.();}
  };

  initialReady=false;refineAll(document.body);
})();