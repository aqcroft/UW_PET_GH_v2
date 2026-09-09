(function(){
  if(document.documentElement.dataset.coachingPreviewPatchV3==='v3')return;
  document.documentElement.dataset.coachingPreviewPatchV3='v3';

  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const SHORT_MILESTONE_PAUSE=1200;
  const FAST_START_REWARD_PAUSE=5000;
  const ui3={
    firstHabDelayDone:false,
    firstHabDelayTimer:null,
    fastSetupDelayDone:false,
    fastSetupDelayTimer:null,
    days3160DelayApplied:false,
  };

  const style=document.createElement('style');
  style.textContent=`
    @keyframes coachStepWhole{
      0%,100%{opacity:.50;transform:scale(1);box-shadow:0 0 0 rgba(29,79,145,0)}
      45%{opacity:.82;transform:scale(1.018);box-shadow:0 0 0 .32rem rgba(29,79,145,.14)}
    }
    @keyframes coachFastStage{
      0%,100%{opacity:.72;transform:scale(1);box-shadow:0 0 0 rgba(29,79,145,0)}
      45%{opacity:1;transform:scale(1.055);box-shadow:0 0 0 .3rem rgba(29,79,145,.14)}
    }
    .coach-step-current{opacity:.50!important;filter:none!important}
    .coach-step-current.coach-step-opacity-pulse{
      animation:coachStepWhole 1.25s ease-in-out 1 both!important;
      transform-origin:center!important;
    }
    .coach-step-done{opacity:1!important;filter:none!important}
    .step-button.done.coach-step-done{
      opacity:1!important;
      background:linear-gradient(145deg,#173c78,var(--blue))!important;
      border-color:var(--blue)!important;
      color:#fff!important;
    }
    .bonus-faststart.coach-fast-stage{
      animation:coachFastStage 1.25s ease-in-out 1 both!important;
      background:#dbeaff!important;
      border-color:rgba(29,79,145,.58)!important;
      opacity:1!important;
    }
    .coach-whisper{bottom:auto!important;margin:0!important}
    @media(prefers-reduced-motion:reduce){
      .coach-step-current.coach-step-opacity-pulse,.coach-fast-stage{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  function addButton(){return document.querySelector('.add-customer-main:not([disabled])');}

  function positionCoach(el){
    if(!el||!el.isConnected)return;
    const button=addButton();
    const rect=button?.getBoundingClientRect();
    const height=el.offsetHeight||90;
    let top=rect?rect.top-height-14:window.innerHeight-height-150;
    top=Math.max(110,Math.min(top,window.innerHeight-height-76));
    el.style.top=`${Math.round(top)}px`;
    el.style.bottom='auto';
  }

  function tidyCoach(el){
    if(!el)return;
    if(el.textContent.includes('£1,000 → £1,400')){
      el.innerHTML=el.innerHTML.replace('£1,000 → £1,400','£1,000 ➡️ £1,400');
    }
    requestAnimationFrame(()=>positionCoach(el));
  }

  function simplifyMomentumPopup(){
    const popup=Array.from(document.querySelectorAll('.notice-popup')).find(el=>el.textContent.includes('Momentum Bonus unlocked'));
    if(!popup)return;
    const paras=popup.querySelectorAll('p.muted');
    if(paras[0]&&!paras[0].dataset.v3Momentum){
      paras[0].dataset.v3Momentum='1';
      paras[0].innerHTML='This rewards unsupported<br><strong>3+ service homeowner customer sign-ups</strong><br>with an <strong>extra £125</strong><br>in days 31-60.';
      if(paras[1])paras[1].style.display='none';
    }
  }

  function strengthenStepStates(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup)return;
    const steps=Array.from(popup.querySelectorAll('.fast-start-step-button'));
    steps.forEach((step,index)=>{
      const done=index===0?state.customerPartnerUpgraded:state.ownAccountLinked;
      if(done){
        step.classList.remove('coach-step-current','coach-step-locked','coach-step-opacity-pulse');
        step.classList.add('coach-step-done','done');
        step.style.opacity='1';
        step.style.filter='none';
      }
    });
  }

  function enhanceV3(){
    simplifyMomentumPopup();
    strengthenStepStates();
    document.querySelectorAll('.coach-whisper').forEach(tidyCoach);
  }

  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(!(node instanceof Element))continue;
        if(node.matches?.('.coach-whisper'))tidyCoach(node);
        node.querySelectorAll?.('.coach-whisper').forEach(tidyCoach);
      }
    }
    simplifyMomentumPopup();
    strengthenStepStates();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>document.querySelectorAll('.coach-whisper').forEach(positionCoach));

  const renderV2=render;
  render=function(){
    let suppressedHab=false;
    let suppressedFastSetup=false;

    const shouldDelayHab=state.month1.length===4 && !state.habIntroDismissed &&
      !state.month1HabRevealComplete && !state.habRevealInProgress && !ui3.firstHabDelayDone;
    if(shouldDelayHab){suppressedHab=true;state.habIntroDismissed=true;}

    const shouldDelayFastSetup=state.month1.length>=5 && !state.fastStartRevealComplete &&
      !state.fastStartRevealInProgress && !state.customerPartnerUpgraded && !state.ownAccountLinked &&
      !ui3.fastSetupDelayDone;
    if(shouldDelayFastSetup){suppressedFastSetup=true;state.fastStartRevealInProgress=true;}

    renderV2();

    if(suppressedHab){
      state.habIntroDismissed=false;
      if(!ui3.firstHabDelayTimer){
        ui3.firstHabDelayTimer=window.setTimeout(()=>{
          ui3.firstHabDelayTimer=null;ui3.firstHabDelayDone=true;render();
        },SHORT_MILESTONE_PAUSE);
      }
    }

    if(suppressedFastSetup){
      state.fastStartRevealInProgress=false;
      if(!ui3.fastSetupDelayTimer){
        ui3.fastSetupDelayTimer=window.setTimeout(()=>{
          ui3.fastSetupDelayTimer=null;ui3.fastSetupDelayDone=true;render();
        },SHORT_MILESTONE_PAUSE);
      }
    }

    enhanceV3();
  };

  function currentFastStartBackdrop(){
    const popup=document.querySelector('.notice-faststart-setup');
    return popup?popup.closest('.notice-backdrop'):null;
  }

  async function fadeFastStartBackdropTo(opacity,duration=1800){
    const el=currentFastStartBackdrop();
    if(!el)return;
    el.style.transition=`opacity ${duration}ms cubic-bezier(.4,0,.2,1)`;
    el.style.pointerEvents='none';
    void el.offsetWidth;
    el.style.opacity=String(opacity);
    await sleep(duration+60);
  }

  function keepFastStartBackdropHidden(){
    const el=currentFastStartBackdrop();
    if(!el)return null;
    el.style.transition='none';
    el.style.opacity='0';
    el.style.pointerEvents='none';
    return el;
  }

  function pulseFastStage(){
    const tile=document.querySelector('.bonus-faststart');
    if(!tile)return;
    tile.classList.remove('coach-fast-stage');
    void tile.offsetWidth;
    tile.classList.add('coach-fast-stage');
    window.setTimeout(()=>tile.classList.remove('coach-fast-stage'),1400);
  }

  completeFirst30Step=async function(step){
    if(state.explorerCriteriaBusy||state.fastStartRevealInProgress||state.fastStartRevealComplete)return;
    if(step==='own'&&state.ownAccountLinked)return;
    if(step==='partner'&&state.customerPartnerUpgraded)return;

    state.explorerCriteriaBusy=true;
    if(step==='own')state.ownAccountLinked=true;
    if(step==='partner')state.customerPartnerUpgraded=true;
    render();
    await sleep(325);

    const secondStep=first30StepsComplete();
    await fadeFastStartBackdropTo(0,1800);

    if(step==='partner'){
      state.fastStartPartnerBadgeApplied=true;
      state.fastStartPulseId=`c${FAST_START_BADGE_CUSTOMER_NUMBER}`;
    }else{
      state.fastStartAccountBadgeApplied=true;
      state.fastStartAccountPulse=true;
    }
    render();
    keepFastStartBackdropHidden();

    await sleep(1450);
    state.fastStartPulseId=null;
    state.fastStartAccountPulse=false;

    if(secondStep){
      /* Stage 3: the £500 Fast Start tile itself is the third taught result. */
      state.fastStartRevealComplete=true;
      state.fastStartRevealInProgress=true;
      state.nextIntroDismissed=false;
      state.fastStartFlashPulse=true;
      render();
      keepFastStartBackdropHidden();
      pulseFastStage();

      await sleep(1450);
      state.fastStartFlashPulse=false;
      render();
      keepFastStartBackdropHidden();

      /* Five seconds of the bright tool before the reward explanation appears. */
      await sleep(FAST_START_REWARD_PAUSE);

      state.fastStartRevealInProgress=false;
      state.explorerCriteriaBusy=false;
      render();
      return;
    }

    render();
    const el=keepFastStartBackdropHidden();
    if(el){
      el.style.transition='opacity 1.8s cubic-bezier(.4,0,.2,1)';
      void el.offsetWidth;
      el.style.opacity='1';
      await sleep(1860);
    }
    state.explorerCriteriaBusy=false;
    render();
  };

  if(typeof resetExplorer==='function'){
    const resetV2=resetExplorer;
    resetExplorer=function(){
      if(ui3.firstHabDelayTimer)clearTimeout(ui3.firstHabDelayTimer);
      if(ui3.fastSetupDelayTimer)clearTimeout(ui3.fastSetupDelayTimer);
      ui3.firstHabDelayDone=false;ui3.firstHabDelayTimer=null;
      ui3.fastSetupDelayDone=false;ui3.fastSetupDelayTimer=null;
      ui3.days3160DelayApplied=false;
      resetV2();
    };
  }

  enhanceV3();
})();
