(function(){
  /* Explorer Fast Start criteria fade patch.
     Mirrors the mentor flow: tick -> 1.8s full fade -> reveal the
     matching behind-modal animation -> fade back after criterion one;
     criterion two flows into the £500 Fast Start award. */

  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  state.explorerCriteriaBusy=false;

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

  first30StepButton=function(done,label,step,number){
    const icon=step==='own'?'🔗':'🏅';
    const disabled=done||state.fastStartRevealInProgress||state.explorerCriteriaBusy;
    return `<button class="step-button fast-start-step-button ${done?'done':''}" ${disabled?'disabled':''} onclick="completeFirst30Step('${step}')">
      <span>${done?'Done':`Step ${number}`}</span>
      <strong><span class="step-main-icon">${icon}</span>${label}</strong>
      <span class="step-check" aria-hidden="true">${done?'✓':''}</span>
    </button>`;
  };

  completeFirst30Step=async function(step){
    if(state.explorerCriteriaBusy||state.fastStartRevealInProgress||state.fastStartRevealComplete)return;
    if(step==='own'&&state.ownAccountLinked)return;
    if(step==='partner'&&state.customerPartnerUpgraded)return;

    state.explorerCriteriaBusy=true;

    /* Show the selected criterion as ticked before the fade begins. */
    if(step==='own')state.ownAccountLinked=true;
    if(step==='partner')state.customerPartnerUpgraded=true;
    render();
    await sleep(325);

    const secondStep=first30StepsComplete();

    /* Same full fade and timing as the mentor criteria modal. */
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

    /* Let the relevant badge/account animation be clearly visible behind it. */
    await sleep(1450);
    state.fastStartPulseId=null;
    state.fastStartAccountPulse=false;

    if(secondStep){
      /* Criterion two completes Fast Start and hands over to the existing award modal. */
      state.fastStartRevealComplete=true;
      state.nextIntroDismissed=false;
      state.explorerCriteriaBusy=false;
      render();

      await sleep(450);
      state.fastStartFlashPulse=true;
      render();
      await sleep(950);
      state.fastStartFlashPulse=false;
      render();
      return;
    }

    /* Criterion one: return the setup modal with the same 1.8s rhythm. */
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

  const originalResetExplorer=resetExplorer;
  resetExplorer=function(){
    state.explorerCriteriaBusy=false;
    originalResetExplorer();
  };
})();
