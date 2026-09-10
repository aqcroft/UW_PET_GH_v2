(function(){
  if(document.documentElement.dataset.coachingPreviewV17Flow==='1')return;
  document.documentElement.dataset.coachingPreviewV17Flow='1';

  const baseSetTimeout=window.setTimeout.bind(window);
  let momentumTransitionComplete=false;
  let momentumTransitionScheduled=false;

  const style=document.createElement('style');
  style.textContent=`
    .v9-coach.v17-hab-again{padding-bottom:1.25rem!important}
    .v17-momentum-transition .v17-icon{display:block;font-size:2rem;line-height:1;margin-bottom:.55rem;text-align:center}
    .v17-momentum-transition .v17-line{display:block;margin-top:.42rem;line-height:1.38}
    .v17-momentum-transition .v17-pointer{display:block;font-size:1.85rem;line-height:1;margin-top:.55rem}
  `;
  document.head.appendChild(style);

  function totalCount(){return state.month1.length+state.month2.length;}

  function enforceFastStartCta(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup||!state.fastStartRevealComplete)return;
    const explore=Array.from(popup.querySelectorAll('button')).find(b=>/Supporting Bonuses|Explore days 31-60/i.test(b.textContent));
    if(!explore)return;
    let main=explore.querySelector('span');
    if(!main){main=document.createElement('span');explore.prepend(main);}
    if(main.textContent!=='🔍 Explore days 31-60')main.textContent='🔍 Explore days 31-60';
    let small=explore.querySelector('small');
    if(!small){small=document.createElement('small');explore.appendChild(small);}
    if(small.textContent!=='See Supporting Bonuses in action')small.textContent='See Supporting Bonuses in action';
  }

  function enforcePreTransitionButton(){
    if(momentumTransitionComplete||totalCount()!==6||!state.momentumAppliedIds?.includes('c6'))return;
    const btn=document.querySelector('.add-customer-main');
    if(!btn)return;
    const main=btn.querySelector('.add-label-main');
    const sub=btn.querySelector('.add-label-sub');
    const icon=btn.querySelector('.add-label-icon');
    if(main&&main.textContent!=='Add 6th')main.textContent='Add 6th';
    if(sub&&sub.textContent!=='customer')sub.textContent='customer';
    if(icon&&icon.textContent!=='🏡')icon.textContent='🏡';
    btn.classList.add('v16-hold-action');
  }

  function refineAfterRender(){
    enforceFastStartCta();
    enforcePreTransitionButton();
  }

  const existingRender=render;
  render=function(){
    existingRender();
    refineAfterRender();
  };

  function showMomentumTransition(){
    if(momentumTransitionComplete||document.querySelector('.v17-momentum-transition'))return;
    const coach=document.createElement('div');
    coach.className='v9-coach v9-coach-green v17-momentum-transition';
    coach.setAttribute('role','status');
    coach.setAttribute('aria-live','polite');
    coach.innerHTML='<span class="v17-icon">🚀</span><strong>You’re really flying!</strong><span class="v17-line"><strong>Customer Bonus + Momentum</strong><br>as we add a few customers</span><span class="v17-pointer">👇</span>';
    document.body.appendChild(coach);
    requestAnimationFrame(()=>coach.classList.add('show'));

    baseSetTimeout(()=>coach.classList.add('fade-out'),3500);
    baseSetTimeout(()=>{
      coach.remove();
      momentumTransitionComplete=true;
      render();
    },3950);
  }

  async function waitForMomentumApplied(){
    const started=Date.now();
    while(Date.now()-started<7000){
      if(state.momentumAppliedIds?.includes('c6')&&!state.momentumRevealInProgress){
        baseSetTimeout(showMomentumTransition,500);
        return;
      }
      await new Promise(resolve=>baseSetTimeout(resolve,100));
    }
  }

  document.addEventListener('click',event=>{
    const apply=event.target.closest?.('button');
    if(apply&&/Apply Momentum Bonus/i.test(apply.textContent)&&!momentumTransitionScheduled){
      momentumTransitionScheduled=true;
      waitForMomentumApplied();
    }
  },true);

  /* Coach-only observer: it never scans or rewrites buttons/modals, so it cannot form the
     observer -> refineActions -> innerHTML -> observer loop that caused the v15 hang. */
  const coachObserver=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1||!node.matches?.('.v9-coach'))continue;
        const text=node.textContent.replace(/\s+/g,' ').trim();
        if(text.includes('Momentum Bonus unlocked!')||text.includes('A new bonus is now in play')){
          if(node.dataset.v17MomentumReveal!=='1'){
            node.dataset.v17MomentumReveal='1';
            node.innerHTML='<span class="v16-icon">⚡</span><strong>Momentum Bonus unlocked!</strong>';
          }
        }
        if(text.includes('High Activity Bonus unlocks again')||text.includes('High Activity Bonus kicks in again')){
          node.classList.add('v17-hab-again');
        }
      }
    }
  });
  coachObserver.observe(document.body,{childList:true});

  refineAfterRender();
})();
