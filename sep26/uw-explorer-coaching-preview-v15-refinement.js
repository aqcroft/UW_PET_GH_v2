(function(){
  if(document.documentElement.dataset.coachingPreviewV15Refinement==='1')return;
  document.documentElement.dataset.coachingPreviewV15Refinement='1';

  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const previousSetTimeout=window.setTimeout.bind(window);
  let schedulingThirdCustomerCoach=false;
  let hab1ResultCleared=false;
  let momentumAwardCleared=false;
  let batchDisplayActive=false;
  let stableFastStartBusy=false;

  /* Keep the general v12 1.5s coach rhythm, but deliberately give the
     post-customer-3 pre-HAB coach a full 3s pause before it arrives. */
  window.setTimeout=function(fn,delay,...args){
    if(schedulingThirdCustomerCoach&&delay===2200)return previousSetTimeout(fn,3000,...args);
    return previousSetTimeout(fn,delay,...args);
  };

  const style=document.createElement('style');
  style.textContent=`
    .v15-icon{display:block;font-size:2rem;line-height:1;margin-bottom:.5rem;text-align:center}
    .v15-roomy-line{display:block;margin-top:.52rem;line-height:1.42}
    .v15-stack-homes{position:relative;display:inline-block;width:2.05rem;height:1.5rem;vertical-align:middle}
    .v15-stack-homes span{position:absolute;font-size:1.12rem;line-height:1}
    .v15-stack-homes span:first-child{left:.08rem;top:.18rem;opacity:.82}
    .v15-stack-homes span:last-child{left:.62rem;top:0}

    /* Timed coaching colour grammar. */
    .v9-coach:not(.v9-coach-green):not(.v15-hab-coach){background:#eef6ff!important;border-color:#b8d4f2!important;color:#14233b!important}
    .v9-coach.v9-coach-green:not(.v15-hab-coach){background:#edf8f1!important;border-color:rgba(20,122,74,.28)!important;color:#173d2b!important}
    .v9-coach.v15-hab-coach{background:#fff5e9!important;border-color:rgba(214,142,32,.38)!important;color:#7b4b06!important}

    /* Hold a completed customer action visually until its result teaching is finished. */
    .add-customer-main.v15-hold-action{
      opacity:.38!important;filter:saturate(.18)!important;background:#aeb7c4!important;
      border-color:#aeb7c4!important;color:#fff!important;pointer-events:none!important;box-shadow:none!important
    }
    .add-customer-main.v15-batch-processing{
      opacity:1!important;filter:none!important;background:#4f8f73!important;border-color:#4f8f73!important;
      color:#fff!important;pointer-events:none!important;box-shadow:none!important
    }

    /* Compact mentor shortcut belongs inside the utility row. */
    .utility-row .sneaky-mentor-shortcut.v15-mentor-shortcut{
      margin:0 .45rem!important;padding:.45rem .7rem!important;white-space:nowrap!important;
      font-size:.78rem!important;line-height:1.1!important;text-align:center!important
    }

    /* Keep the Fast Start step-2 hand-off visually stable. */
    .notice-faststart-setup.v15-stable-step-transition{will-change:opacity,transform}

    @media(max-width:520px){
      .utility-row .sneaky-mentor-shortcut.v15-mentor-shortcut{font-size:.72rem!important;padding:.42rem .52rem!important}
      .v15-icon{font-size:1.9rem}
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

  function coachNodes(root){
    const out=[];
    if(root?.nodeType===1){
      if(root.matches?.('.v9-coach'))out.push(root);
      root.querySelectorAll?.('.v9-coach').forEach(el=>out.push(el));
    }
    return out;
  }

  function refineCoach(coach){
    if(!coach||coach.dataset.v15Refined==='1')return;
    const text=coach.textContent.replace(/\s+/g,' ').trim();

    if(text.includes('First customer added')){
      coach.innerHTML='<span class="v15-icon">🎉</span><strong>First customer added</strong><span class="coach-line">That’s <strong>£250 earned.</strong></span>';
    }else if(text.includes('Great stuff!')&&text.includes('second customer')){
      coach.innerHTML='<span class="v15-icon">👏</span><strong>Great stuff!</strong><span class="coach-line">Another £250 for<br>your second customer</span>';
    }else if(text.includes('One more 3-service homeowner')){
      coach.innerHTML='<strong>One more 3-service homeowner</strong><span class="coach-line">unlocks a new bonus</span><span class="v12-pointer">👇</span>';
    }else if(text.includes('£1,000')&&text.includes('£1,400')){
      coach.classList.add('v15-hab-coach');
      coach.innerHTML='<span class="v15-icon">🔥</span><strong>High Activity Bonus Applied</strong><span class="coach-line"><strong>£1,000 ➡️ £1,400</strong></span>';
      if(!coach.dataset.v15HabClearScheduled){
        coach.dataset.v15HabClearScheduled='1';
        previousSetTimeout(()=>{hab1ResultCleared=true;refineActions();},3950);
      }
    }else if(text.includes('Momentum Bonus')&&text.includes('A new bonus is unlocked')){
      coach.innerHTML='<span class="v15-icon">⚡</span><strong>Momentum Bonus unlocked!</strong><span class="coach-line">For <strong>all unsupported appointments</strong><br>when customers take 3+ services</span>';
    }else if(text.includes('Momentum Bonus awarded')||text.includes('Encouraging confidence')){
      coach.innerHTML='<span class="v15-icon">⚡</span><strong>Momentum Bonus awarded</strong><span class="v15-roomy-line">Encouraging confidence<br>and rewarding independence.</span>';
      if(!coach.dataset.v15MomentumClearScheduled){
        coach.dataset.v15MomentumClearScheduled='1';
        previousSetTimeout(()=>{momentumAwardCleared=true;window.__v12BatchReadyVisual=true;refineActions();},3950);
      }
    }else if(text.includes('High Activity Bonus kicks in again')||text.includes('High Activity Bonus unlocks again')){
      coach.classList.add('v15-hab-coach');
      coach.innerHTML='<span class="v15-icon">🔥</span><strong>High Activity Bonus unlocks again</strong>';
      batchDisplayActive=false;
    }else if(text.includes('One more to go')){
      coach.innerHTML='<strong>One more to go</strong><span class="coach-line">Complete the demo</span><span class="v12-pointer">👇</span>';
    }
    coach.dataset.v15Refined='1';
  }

  function refineMomentumModal(){
    const popup=document.querySelector('.notice-backdrop:not(.howpaid-overlay) > .notice-popup');
    if(!popup||!popup.textContent.includes('Momentum Bonus'))return;
    const button=Array.from(popup.querySelectorAll('button')).find(b=>b.textContent.includes('Apply Momentum Bonus'));
    if(!button)return;
    if(popup.dataset.v15MomentumModal==='1')return;
    popup.dataset.v15MomentumModal='1';
    const heading=popup.querySelector('.milestone-heading');
    if(heading)heading.textContent='Momentum Bonus';
    const paras=popup.querySelectorAll('p.muted');
    if(paras[0])paras[0].innerHTML='An <strong>extra £125 for</strong><br><strong>every 3-service customer</strong>';
    if(paras[1])paras[1].style.display='none';
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
        const small=explore.querySelector('small');
        if(small)small.remove();
      }
    }
  }

  function refineMentorShortcut(){
    const link=document.querySelector('.sneaky-mentor-shortcut');
    const row=document.querySelector('.utility-row');
    if(!link||!row)return;
    if(link.textContent!=='Skip to Mentor story')link.textContent='Skip to Mentor story';
    link.classList.add('v15-mentor-shortcut');
    const startAgain=Array.from(row.querySelectorAll('button')).find(b=>b.textContent.includes('Start again'));
    if(startAgain&&link.parentElement!==row)row.insertBefore(link,startAgain);
    else if(startAgain&&link.nextElementSibling!==startAgain)row.insertBefore(link,startAgain);
  }

  function refineActions(){
    const btn=addButton();
    if(!btn)return;
    btn.classList.remove('v15-hold-action','v15-batch-processing');
    const n=count();

    /* Customer 4: keep the completed action copy visible until the HAB result coach clears.
       The orange Applying Bonus state is intentionally preserved during the HAB animation. */
    if(n===4&&!state.habRevealInProgress&&!hab1ResultCleared){
      setAddLabel('Add 4th','customer','🏡');
      btn.classList.add('v15-hold-action');
      return;
    }

    /* Customer 6: do not reveal the batch action before Momentum has been applied AND
       the Momentum-awarded coach has completed. Preserve the previous customer copy. */
    if(n===6&&!state.momentumRevealInProgress&&!momentumAwardCleared){
      setAddLabel('Add 6th','customer','🏡');
      btn.classList.add('v15-hold-action');
      return;
    }

    if(n===6&&momentumAwardCleared&&!batchDisplayActive){
      setAddLabel('Add a few','customers','<span class="v15-stack-homes"><span>🏠</span><span>🏠</span></span>');
      return;
    }

    if(batchDisplayActive&&n>=6&&n<=9&&!state.month2HabRevealComplete){
      const text=btn.querySelector('.add-label-text');
      if(text)text.innerHTML='<span class="add-label-main">Adding customers 🏠</span><span class="add-label-sub">Applying Momentum ⚡</span>';
      const icon=btn.querySelector('.add-label-icon');if(icon)icon.innerHTML='';
      btn.classList.add('v15-batch-processing');
    }
  }

  function refineAll(root=document.body){
    coachNodes(root).forEach(refineCoach);
    refineMomentumModal();
    refineFastStartAward();
    refineMentorShortcut();
    refineActions();
  }

  /* Give only the customer-3 transition the longer 3s breathing space. */
  const existingAddCustomer=addCustomer;
  addCustomer=function(){
    const before=count();
    schedulingThirdCustomerCoach=before===2;
    try{return existingAddCustomer();}
    finally{schedulingThirdCustomerCoach=false;}
  };

  /* Capture the start of the batch so its button can remain visually static while
     customers 7, 8 and 9 and their Momentum awards are being processed. */
  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('.add-customer-main');
    if(btn&&count()===6&&momentumAwardCleared&&/Add a few/i.test(btn.textContent)){
      batchDisplayActive=true;
      previousSetTimeout(refineActions,0);
    }
  },true);

  /* Stable Fast Start Step 1 transition. The visible modal is not rebuilt after its
     fade-back; Step 2 is enabled directly in that same DOM instance, then nudged. */
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
      previousSetTimeout(()=>step2.classList.remove('v9-step-pulse'),1300);
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
  render=function(){existingRender();refineAll(document.body);};

  const observer=new MutationObserver(records=>{
    let hasAddedNodes=false;
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        hasAddedNodes=true;
        coachNodes(node).forEach(refineCoach);
      }
    }
    if(hasAddedNodes)refineAll(document.body);
  });
  observer.observe(document.body,{childList:true,subtree:true});

  refineAll(document.body);
})();
