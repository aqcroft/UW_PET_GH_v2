(function(){
  if(document.documentElement.dataset.coachingPreviewV16Refinement==='1')return;
  document.documentElement.dataset.coachingPreviewV16Refinement='1';

  const baseSetTimeout=window.setTimeout.bind(window);
  const sleep=(ms)=>new Promise(resolve=>baseSetTimeout(resolve,ms));
  let schedulingThirdCustomerCoach=false;
  let hab1ResultCleared=false;
  let momentumTeachingApplied=false;
  let batchDisplayActive=false;
  let stableFastStartBusy=false;

  /* Keep the normal v12 1.5s coaching rhythm, but give the post-customer-3 cue 3s.
     Also suppress the now-redundant post-Momentum timed coach without leaving a dead pause. */
  window.setTimeout=function(fn,delay,...args){
    if(schedulingThirdCustomerCoach&&delay===2200)return baseSetTimeout(fn,3000,...args);
    if(state?.momentumAppliedIds?.includes('c6')&&state?.month2?.length===1){
      if(delay===3500)return baseSetTimeout(fn,80,...args);
      if(delay===3950)return baseSetTimeout(fn,140,...args);
    }
    return baseSetTimeout(fn,delay,...args);
  };

  const style=document.createElement('style');
  style.textContent=`
    .v16-icon{display:block;font-size:2rem;line-height:1;margin-bottom:.55rem;text-align:center}
    .v16-roomy{display:block;margin-top:.72rem;line-height:1.48}
    .v16-stack-homes{position:relative;display:inline-block;width:2.05rem;height:1.5rem;vertical-align:middle}
    .v16-stack-homes span{position:absolute;font-size:1.12rem;line-height:1}
    .v16-stack-homes span:first-child{left:.08rem;top:.18rem;opacity:.82}
    .v16-stack-homes span:last-child{left:.62rem;top:0}

    .v9-coach:not(.v9-coach-green):not(.v16-hab-coach){background:#eef6ff!important;border-color:#b8d4f2!important;color:#14233b!important}
    .v9-coach.v9-coach-green:not(.v16-hab-coach){background:#edf8f1!important;border-color:rgba(20,122,74,.28)!important;color:#173d2b!important}
    .v9-coach.v16-hab-coach{background:#fff5e9!important;border-color:rgba(214,142,32,.38)!important;color:#7b4b06!important}

    .add-customer-main.v16-hold-action{
      opacity:.38!important;filter:saturate(.18)!important;background:#aeb7c4!important;
      border-color:#aeb7c4!important;color:#fff!important;pointer-events:none!important;box-shadow:none!important
    }
    .add-customer-main.v16-batch-processing{
      opacity:1!important;filter:none!important;background:#4f8f73!important;border-color:#4f8f73!important;
      color:#fff!important;pointer-events:none!important;box-shadow:none!important
    }

    .notice-green.v16-momentum-teaching .notice-emoji{font-size:2.35rem!important;line-height:1!important;margin-bottom:.72rem!important}
    .notice-green.v16-momentum-teaching .milestone-heading{margin-bottom:1rem!important}
    .notice-green.v16-momentum-teaching .v16-momentum-rule{margin:.15rem 0 1rem!important;line-height:1.55!important}
    .notice-green.v16-momentum-teaching .v16-momentum-why{margin:.95rem 0 1.25rem!important;line-height:1.5!important}

    .utility-row .sneaky-mentor-shortcut.v16-mentor-shortcut{
      margin:0 .45rem!important;padding:.45rem .7rem!important;white-space:nowrap!important;
      font-size:.78rem!important;line-height:1.1!important;text-align:center!important
    }

    @media(max-width:520px){
      .utility-row .sneaky-mentor-shortcut.v16-mentor-shortcut{font-size:.72rem!important;padding:.42rem .52rem!important}
      .v16-icon{font-size:1.9rem}
    }
  `;
  document.head.appendChild(style);

  const count=()=>state.month1.length+state.month2.length;
  const addButton=()=>document.querySelector('.add-customer-main');
  const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text;};

  function setAddLabel(main,sub,iconHtml){
    const btn=addButton();
    if(!btn)return;
    setText(btn.querySelector('.add-label-main'),main);
    setText(btn.querySelector('.add-label-sub'),sub);
    const icon=btn.querySelector('.add-label-icon');
    if(icon&&icon.innerHTML!==iconHtml)icon.innerHTML=iconHtml;
  }

  function refineCoach(coach){
    if(!coach||coach.dataset.v16Refined==='1')return;
    const text=coach.textContent.replace(/\s+/g,' ').trim();

    if(text.includes('First customer added')){
      coach.innerHTML='<span class="v16-icon">🎉</span><strong>First customer added</strong><span class="coach-line">That’s <strong>£250 earned.</strong></span>';
    }else if(text.includes('Great stuff!')&&text.includes('second customer')){
      coach.innerHTML='<span class="v16-icon">👏</span><strong>Great stuff!</strong><span class="coach-line">Another £250 for<br>your second customer</span>';
    }else if(text.includes('One more 3-service homeowner')){
      coach.innerHTML='<strong>One more 3-service homeowner</strong><span class="coach-line">unlocks a new bonus</span><span class="v12-pointer">👇</span>';
    }else if(text.includes('£1,000')&&text.includes('£1,400')){
      coach.classList.add('v16-hab-coach');
      coach.innerHTML='<span class="v16-icon">🔥</span><strong>High Activity Bonus Applied</strong><span class="coach-line"><strong>£1,000 ➡️ £1,400</strong></span>';
      if(!coach.dataset.v16HabClearScheduled){
        coach.dataset.v16HabClearScheduled='1';
        baseSetTimeout(()=>{hab1ResultCleared=true;refineActions();},3950);
      }
    }else if(text.includes('A new bonus is now in play')||text.includes('Momentum Bonus unlocked!')){
      coach.innerHTML='<span class="v16-icon">⚡</span><strong>Momentum Bonus unlocked!</strong><span class="coach-line">For <strong>all unsupported appointments</strong></span>';
    }else if(text.includes('Your confidence is building!')||text.includes('Momentum Bonus awarded')||text.includes('Encouraging confidence')){
      /* The tap-away Momentum modal now carries the teaching. This third coach is intentionally invisible. */
      coach.style.display='none';
      coach.setAttribute('aria-hidden','true');
    }else if(text.includes('High Activity Bonus kicks in again')||text.includes('High Activity Bonus unlocks again')){
      coach.classList.add('v16-hab-coach');
      coach.innerHTML='<span class="v16-icon">🔥</span><strong>High Activity Bonus unlocks again</strong>';
      batchDisplayActive=false;
    }else if(text.includes('One more to go')){
      coach.innerHTML='<strong>One more to go</strong><span class="coach-line">Complete the demo</span><span class="v12-pointer">👇</span>';
    }
    coach.dataset.v16Refined='1';
  }

  function refineMomentumModal(){
    const popup=document.querySelector('.notice-backdrop:not(.howpaid-overlay) > .notice-popup');
    if(!popup)return;
    const button=Array.from(popup.querySelectorAll('button')).find(b=>b.textContent.includes('Apply Momentum Bonus'));
    if(!button||popup.dataset.v16MomentumTeaching==='1')return;
    popup.dataset.v16MomentumTeaching='1';
    popup.classList.add('v16-momentum-teaching');
    const emoji=popup.querySelector('.notice-emoji');if(emoji)emoji.textContent='⚡';
    const heading=popup.querySelector('.milestone-heading');if(heading)heading.textContent='Momentum Bonus';
    const paras=popup.querySelectorAll('p.muted');
    if(paras[0]){
      paras[0].classList.add('v16-momentum-rule');
      paras[0].innerHTML='An extra <strong>£125</strong> on <strong>unsupported appointments</strong><br>when customers take <strong>3+ services</strong>';
    }
    if(paras[1]){
      paras[1].classList.add('v16-momentum-why');
      paras[1].innerHTML='<strong>Encouraging confidence<br>and rewarding independence.</strong>';
      paras[1].style.display='block';
    }
    momentumTeachingApplied=true;
  }

  function refineFastStartAward(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup)return;
    if(state.fastStartRevealComplete&&popup.textContent.includes('£500 Fast Start earned')){
      const unlock=popup.querySelector('.unlock-line');
      if(unlock&&unlock.textContent!=='🔓 New income stream unlocked.')unlock.textContent='🔓 New income stream unlocked.';
      const explore=Array.from(popup.querySelectorAll('button')).find(b=>/Explore days 31-60/i.test(b.textContent)||/See Supporting Bonuses/i.test(b.textContent));
      if(explore){
        const main=explore.querySelector('span');
        if(main)main.textContent='🔍 See Supporting Bonuses in action';
        explore.querySelector('small')?.remove();
      }
    }
  }

  function refineMentorShortcut(){
    const link=document.querySelector('.sneaky-mentor-shortcut');
    const row=document.querySelector('.utility-row');
    if(!link||!row)return;
    if(link.textContent!=='Skip to Mentor story')link.textContent='Skip to Mentor story';
    link.classList.add('v16-mentor-shortcut');
    const startAgain=Array.from(row.querySelectorAll('button')).find(b=>b.textContent.includes('Start again'));
    if(startAgain&&link.parentElement!==row)row.insertBefore(link,startAgain);
    else if(startAgain&&link.nextElementSibling!==startAgain)row.insertBefore(link,startAgain);
  }

  function refineActions(){
    const btn=addButton();
    if(!btn)return;
    btn.classList.remove('v16-hold-action','v16-batch-processing');
    const n=count();

    if(n===4&&!state.habRevealInProgress&&!hab1ResultCleared){
      setAddLabel('Add 4th','customer','🏡');
      btn.classList.add('v16-hold-action');
      return;
    }

    /* Keep the pre-Momentum action label until the teaching modal has been applied and cleared. */
    if(n===6&&!state.momentumRevealInProgress&&!state.momentumAppliedIds.includes('c6')){
      setAddLabel('Add 6th','customer','🏡');
      btn.classList.add('v16-hold-action');
      return;
    }

    if(n===6&&state.momentumAppliedIds.includes('c6')&&!batchDisplayActive){
      setAddLabel('Add a few','customers','<span class="v16-stack-homes"><span>🏠</span><span>🏠</span></span>');
      return;
    }

    if(batchDisplayActive&&n>=6&&n<=9&&!state.month2HabRevealComplete){
      const text=btn.querySelector('.add-label-text');
      const desired='<span class="add-label-main">Adding customers 🏠</span><span class="add-label-sub">Applying Momentum ⚡</span>';
      if(text&&text.innerHTML!==desired)text.innerHTML=desired;
      const icon=btn.querySelector('.add-label-icon');if(icon&&icon.innerHTML!=='')icon.innerHTML='';
      btn.classList.add('v16-batch-processing');
    }
  }

  function refineAll(){
    refineMomentumModal();
    refineFastStartAward();
    refineMentorShortcut();
    refineActions();
  }

  const existingAddCustomer=addCustomer;
  addCustomer=function(){
    const before=count();
    schedulingThirdCustomerCoach=before===2;
    try{return existingAddCustomer();}
    finally{schedulingThirdCustomerCoach=false;}
  };

  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('.add-customer-main');
    if(btn&&count()===6&&state.momentumAppliedIds.includes('c6')&&/Add a few/i.test(btn.textContent)){
      batchDisplayActive=true;
      baseSetTimeout(refineActions,0);
    }
  },true);

  /* Stable Fast Start Step 1 hand-off: enable Step 2 in the same visible modal instance. */
  async function stablePartnerStep(){
    if(stableFastStartBusy||state.explorerCriteriaBusy||state.customerPartnerUpgraded||state.fastStartRevealComplete)return;
    stableFastStartBusy=true;
    state.explorerCriteriaBusy=true;
    state.customerPartnerUpgraded=true;
    render();
    await sleep(325);

    let backdrop=document.querySelector('.notice-faststart-setup')?.closest('.notice-backdrop');
    if(backdrop){
      backdrop.style.transition='opacity 1.8s cubic-bezier(.4,0,.2,1)';
      backdrop.style.pointerEvents='none';
      void backdrop.offsetWidth;backdrop.style.opacity='0';
      await sleep(1860);
    }

    state.fastStartPartnerBadgeApplied=true;
    state.fastStartPulseId='c3';
    render();
    backdrop=document.querySelector('.notice-faststart-setup')?.closest('.notice-backdrop');
    if(backdrop){backdrop.style.transition='none';backdrop.style.opacity='0';backdrop.style.pointerEvents='none';}
    await sleep(1450);

    state.fastStartPulseId=null;
    render();
    backdrop=document.querySelector('.notice-faststart-setup')?.closest('.notice-backdrop');
    if(backdrop){backdrop.style.transition='none';backdrop.style.opacity='0';backdrop.style.pointerEvents='none';}

    state.explorerCriteriaBusy=false;
    const steps=Array.from(document.querySelectorAll('.notice-faststart-setup .fast-start-step-button'));
    const step2=steps[1];
    if(step2){
      step2.removeAttribute('disabled');
      step2.classList.remove('v9-step-locked');
      step2.classList.add('v9-step-current');
    }

    if(backdrop){
      backdrop.style.transition='opacity 1.8s cubic-bezier(.4,0,.2,1)';
      void backdrop.offsetWidth;backdrop.style.opacity='1';backdrop.style.pointerEvents='auto';
      await sleep(1860);
    }
    if(step2&&step2.isConnected){
      step2.classList.remove('v9-step-pulse');void step2.offsetWidth;step2.classList.add('v9-step-pulse');
      baseSetTimeout(()=>step2.classList.remove('v9-step-pulse'),1300);
    }
    stableFastStartBusy=false;
  }

  document.addEventListener('click',event=>{
    const step=event.target.closest?.('.notice-faststart-setup .fast-start-step-button');
    if(!step)return;
    const onclick=step.getAttribute('onclick')||'';
    if(onclick.includes("'partner'")){
      event.preventDefault();
      event.stopImmediatePropagation();
      stablePartnerStep();
    }
  },true);

  const existingRender=render;
  render=function(){existingRender();refineAll();};

  /* Narrow observer: only newly-added coach containers are touched.
     Child nodes created inside a refined coach are ignored, so this cannot self-loop. */
  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches?.('.v9-coach'))refineCoach(node);
        node.querySelectorAll?.('.v9-coach').forEach(refineCoach);
      }
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});

  refineAll();
})();
