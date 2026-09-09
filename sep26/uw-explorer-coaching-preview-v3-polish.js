(function(){
  if(document.documentElement.dataset.coachingPreviewV3Polish==='1')return;
  document.documentElement.dataset.coachingPreviewV3Polish='1';

  const COACH_HOLD=4500;
  const COACH_FADE=450;
  const ui={secondHabCoachStarted:false};

  const style=document.createElement('style');
  style.textContent=`
    /* Restore the original strong row pulse, and synchronise the matching bonus tile to it. */
    .customer-row-hab-pulse{animation:habPulse 1.15s ease both!important}
    .bonus-hab.pulse{animation:habPulse 1.15s ease both!important}
    .customer-row-momentum-pulse{animation:momentumPulse 1.15s ease both!important}
    .bonus-momentum.pulse{animation:momentumPulse 1.15s ease both!important}
  `;
  document.head.appendChild(style);

  function pendingMomentumExists(){
    const result=R.calculateEarnings(buildContext());
    return result.customers.some(row=>row.momentumGatheringPartner>0&&!state.momentumAppliedIds.includes(row.id));
  }

  function showTimedCoach(html){
    const old=document.querySelector('.coach-whisper');
    if(old)old.remove();
    const el=document.createElement('div');
    el.className='coach-whisper';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML=html;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    window.setTimeout(()=>el.classList.remove('show'),COACH_HOLD);
    window.setTimeout(()=>el.remove(),COACH_HOLD+COACH_FADE);
  }

  function polishVisibleCopy(){
    const momentum=Array.from(document.querySelectorAll('.notice-popup')).find(el=>el.textContent.includes('Momentum Bonus unlocked'));
    if(momentum){
      const paras=momentum.querySelectorAll('p.muted');
      if(paras[0]){
        paras[0].innerHTML='This rewards unsupported<br><strong>3+ service homeowner customer sign-ups</strong><br>with an <strong>extra £125</strong><br>in days 31-60.';
      }
      if(paras[1])paras[1].style.display='none';
    }

    const finalPopup=document.querySelector('.notice-final');
    if(finalPopup){
      const p=finalPopup.querySelector('p.muted');
      if(p)p.textContent='Get registered below or book a no-commitment chat.';
    }

    document.querySelectorAll('.coach-whisper').forEach(el=>{
      if(el.textContent.includes('£1,000')&&el.textContent.includes('£1,400')){
        const money=el.querySelector('.coach-money');
        if(money)money.textContent='£1,000 ➡️ £1,400';
      }
    });
  }

  const observer=new MutationObserver(polishVisibleCopy);
  observer.observe(document.body,{childList:true,subtree:true});

  const renderBeforePolish=render;
  render=function(){
    const shouldCoachSecondHab=!ui.secondHabCoachStarted && !state.month2HabIntroDismissed &&
      state.month2.length>=4 && !state.month2HabRevealComplete && !state.habRevealInProgress &&
      !state.momentumRevealInProgress && !pendingMomentumExists();

    let suppress=false;
    if(shouldCoachSecondHab){
      suppress=true;
      state.month2HabIntroDismissed=true;
    }

    renderBeforePolish();

    if(suppress){
      ui.secondHabCoachStarted=true;
      /* Leave the full modal suppressed; use the same timed-coach language instead. */
      showTimedCoach('🔥 <strong>And yes...</strong><span class="coach-line">High Activity Bonus kicks in again.</span>');
      window.setTimeout(()=>{
        if(!state.month2HabRevealComplete&&!state.habRevealInProgress){
          state.month2HabIntroDismissed=true;
          startHabReveal(2);
        }
      },COACH_HOLD+COACH_FADE+450);
    }

    polishVisibleCopy();
  };

  if(typeof resetExplorer==='function'){
    const resetBeforePolish=resetExplorer;
    resetExplorer=function(){
      ui.secondHabCoachStarted=false;
      resetBeforePolish();
    };
  }

  polishVisibleCopy();
})();
