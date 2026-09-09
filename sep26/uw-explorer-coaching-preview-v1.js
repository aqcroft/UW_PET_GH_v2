(function(){
  if(document.documentElement.dataset.coachingPreviewPatch==='v1')return;
  document.documentElement.dataset.coachingPreviewPatch='v1';

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const ui={
    firstActionPulsed:false,
    firstCustomerCoachShown:false,
    firstHabButtonScheduled:false,
    fastStep1Scheduled:false,
    fastStep2Scheduled:false,
    secondHabAutoStarted:false,
    days3160Shown:false,
    finalDelayStarted:false,
  };

  const style=document.createElement('style');
  style.textContent=`
    @keyframes coachBreathe{
      0%,100%{transform:scale(1);box-shadow:0 0 0 rgba(42,96,170,0)}
      45%{transform:scale(1.035);box-shadow:0 0 0 .32rem rgba(42,96,170,.12)}
    }
    @keyframes coachResult{
      0%,100%{transform:scale(1)}
      45%{transform:scale(1.11)}
    }
    @keyframes coachSection{
      0%,100%{box-shadow:0 0 0 rgba(43,130,79,0)}
      45%{box-shadow:0 0 0 .42rem rgba(43,130,79,.13)}
    }
    .coach-action-pulse{animation:coachBreathe 1.05s ease-in-out 1 both!important;position:relative;z-index:3}
    .coach-result-pulse{animation:coachResult .95s ease-in-out 1 both!important;position:relative;z-index:3}
    .coach-section-pulse{animation:coachSection 1.45s ease-in-out 1 both!important;position:relative;z-index:2}
    .coach-step-locked{opacity:.28!important;filter:saturate(.35);pointer-events:none!important}
    .notice-popup{padding:1.55rem 1.5rem!important}
    .notice-popup .milestone-heading{margin-bottom:.55rem}
    .notice-popup .muted{line-height:1.48;margin:.65rem 0 1.15rem}
    .notice-faststart-setup .faststart-copy{line-height:1.48;margin:.7rem 0 1.2rem}
    .notice-faststart-setup .step-actions{gap:.72rem}
    .coach-unlock-copy{margin:.7rem 0 1rem;font-size:.98rem;line-height:1.42;text-align:center}
    .coach-unlock-copy strong{display:block;margin-bottom:.25rem}
    .coach-unlock-copy .unlock-line{font-weight:900}
    .customer-row-hab-pulse .row-badge.activity,
    .customer-row-momentum-pulse .row-badge.momentum,
    .fast-start-flash.pulse strong,
    .bonus-badge.pulse .bonus-sub{animation:coachResult .95s ease-in-out 1 both!important}
    .coach-whisper{
      position:fixed;left:50%;top:1rem;transform:translateX(-50%);z-index:1500;
      width:min(21rem,calc(100vw - 2rem));background:#fff;border:1px solid rgba(40,80,130,.18);
      border-radius:1rem;box-shadow:0 14px 36px rgba(20,38,66,.18);padding:.9rem 1rem;
      text-align:center;line-height:1.38;opacity:0;transition:opacity .35s ease,transform .35s ease;
      pointer-events:none;color:#17233b
    }
    .coach-whisper.show{opacity:1;transform:translate(-50%,.2rem)}
    .coach-whisper strong{font-weight:950}
    .coach-whisper .coach-small{display:block;margin-top:.28rem;font-size:.9rem}
    .notice-final.coach-final-delayed{opacity:0;pointer-events:none;transition:opacity .65s ease!important}
    .notice-final.coach-final-delayed.coach-final-show{opacity:1;pointer-events:auto}
    @media(max-width:520px){
      .notice-popup{width:min(20rem,calc(100vw - 1.4rem))!important;padding:1.45rem 1.15rem!important}
      .notice-popup .muted,.notice-faststart-setup .faststart-copy{font-size:.94rem;line-height:1.46}
      .notice-faststart-setup .step-actions{gap:.55rem}
    }
    @media(prefers-reduced-motion:reduce){
      .coach-action-pulse,.coach-result-pulse,.coach-section-pulse,
      .customer-row-hab-pulse .row-badge.activity,
      .customer-row-momentum-pulse .row-badge.momentum,
      .fast-start-flash.pulse strong,.bonus-badge.pulse .bonus-sub{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  function pulse(el,type='action',delay=0){
    if(!el||reducedMotion)return;
    const cls=type==='result'?'coach-result-pulse':type==='section'?'coach-section-pulse':'coach-action-pulse';
    window.setTimeout(()=>{
      if(!el.isConnected)return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
      window.setTimeout(()=>el.classList.remove(cls),type==='section'?1600:1150);
    },delay);
  }

  function addButton(){return document.querySelector('.add-customer-main:not([disabled])');}
  function columnTotals(){return Array.from(document.querySelectorAll('.column-total-blob'));}
  function columns(){return Array.from(document.querySelectorAll('.customer-column'));}
  function bonusBadges(){return Array.from(document.querySelectorAll('.bonus-badge'));}

  function showWhisper(html,duration=3300){
    const old=document.querySelector('.coach-whisper');
    if(old)old.remove();
    const el=document.createElement('div');
    el.className='coach-whisper';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML=html;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    window.setTimeout(()=>el.classList.remove('show'),duration);
    window.setTimeout(()=>el.remove(),duration+420);
  }

  function rewriteFirstHabModal(){
    const popup=document.querySelector('.notice-popup.notice-hab');
    if(!popup||popup.textContent.includes('unlocked again'))return;
    const heading=popup.querySelector('.milestone-heading');
    if(!heading||!heading.textContent.includes('High Activity Bonus unlocked'))return;
    const copy=popup.querySelector('.muted');
    if(copy&&!copy.dataset.coachCopy){
      copy.dataset.coachCopy='1';
      copy.innerHTML='<strong>4+ 3-service homeowners</strong><br>in one calendar month<br><br>unlocks an extra <strong>£100</strong><br>on every qualifying customer.';
    }
    const button=popup.querySelector('button.button.hab');
    if(button&&!ui.firstHabButtonScheduled){
      ui.firstHabButtonScheduled=true;
      pulse(button,'action',2300);
    }
  }

  function rewriteFastStartModal(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup)return;
    const steps=Array.from(popup.querySelectorAll('.fast-start-step-button'));

    if(!state.fastStartRevealComplete){
      const copy=popup.querySelector('.faststart-copy');
      if(copy&&!copy.dataset.coachCopy){
        copy.dataset.coachCopy='1';
        copy.innerHTML='Now reach <strong>1 Partner + 6 customers</strong><br>in your first 30 days.<br><br><strong>1 Partner</strong> can be a customer who upgrades.<br><strong>Customer #6</strong> can be your own linked UW account.<br><br>Complete both steps:';
      }
      if(steps[1]){
        const shouldLock=!state.customerPartnerUpgraded;
        steps[1].classList.toggle('coach-step-locked',shouldLock);
        if(shouldLock)steps[1].setAttribute('disabled','disabled');
        else if(!state.ownAccountLinked&&!state.explorerCriteriaBusy)steps[1].removeAttribute('disabled');
      }
      if(!state.customerPartnerUpgraded&&!state.explorerCriteriaBusy&&steps[0]&&!ui.fastStep1Scheduled){
        ui.fastStep1Scheduled=true;
        pulse(steps[0],'action',2850);
      }
      if(state.customerPartnerUpgraded&&!state.ownAccountLinked&&!state.explorerCriteriaBusy&&steps[1]&&!ui.fastStep2Scheduled){
        ui.fastStep2Scheduled=true;
        pulse(steps[1],'action',950);
      }
    }else{
      const emoji=popup.querySelector('.notice-emoji');
      if(emoji)emoji.textContent='🔓';
      const h2=popup.querySelector('h2');
      if(h2)h2.textContent='£500 Fast Start earned!';
      const stepActions=popup.querySelector('.step-actions');
      if(stepActions)stepActions.style.display='none';
      if(!popup.querySelector('.coach-unlock-copy')){
        const block=document.createElement('div');
        block.className='coach-unlock-copy';
        block.innerHTML='<strong>First 30-day milestone achieved.</strong><span class="unlock-line">🔓 New income streams unlocked.</span>';
        const whatsNext=popup.querySelector('.whats-next-block');
        popup.insertBefore(block,whatsNext||null);
      }
    }
  }

  function replaceSecondHabModal(){
    const popup=Array.from(document.querySelectorAll('.notice-popup.notice-hab')).find(el=>el.textContent.includes('High Activity Bonus unlocked again'));
    if(!popup||ui.secondHabAutoStarted)return;
    ui.secondHabAutoStarted=true;
    window.setTimeout(async()=>{
      if(state.month2HabIntroDismissed)return;
      state.month2HabIntroDismissed=true;
      render();
      await sleep(160);
      const habs=bonusBadges().filter(el=>el.classList.contains('bonus-hab'));
      const month2Hab=habs[habs.length-1];
      pulse(month2Hab,'action',100);
      await sleep(reducedMotion?300:1550);
      if(!state.habRevealInProgress&&!state.month2HabRevealComplete)startHabReveal(2);
    },0);
  }

  function delayFinalModal(){
    const popup=document.querySelector('.notice-final');
    if(!popup||ui.finalDelayStarted)return;
    ui.finalDelayStarted=true;
    popup.classList.add('coach-final-delayed');
    const hero=document.querySelector('.hero-progress-caption');
    pulse(hero,'result',250);
    window.setTimeout(()=>{
      if(popup.isConnected)popup.classList.add('coach-final-show');
    },5000);
  }

  function enhance(){
    rewriteFirstHabModal();
    rewriteFastStartModal();
    replaceSecondHabModal();
    delayFinalModal();
  }

  function snapshot(){
    return {
      count:state.month1.length+state.month2.length,
      m1Hab:state.month1HabAppliedIds.length,
      m2Hab:state.month2HabAppliedIds.length,
      m1HabDone:state.month1HabRevealComplete,
      m2HabDone:state.month2HabRevealComplete,
      fastDone:state.fastStartRevealComplete,
      momentum:state.momentumAppliedIds.length,
      nextIntroDismissed:state.nextIntroDismissed,
    };
  }

  let last=snapshot();
  const baseRender=render;
  render=function(){
    const before=last;
    baseRender();
    enhance();
    const now=snapshot();

    if(now.count===1&&before.count===0){
      const total=columnTotals()[0];
      pulse(total,'result',120);
      if(!ui.firstCustomerCoachShown){
        ui.firstCustomerCoachShown=true;
        window.setTimeout(()=>showWhisper('🏡 <strong>1st customer added</strong><span class="coach-small">3-service homeowner = <strong>£250 Customer Bonus</strong></span>',3000),1150);
        window.setTimeout(()=>pulse(addButton(),'action'),4550);
      }
    }
    if(now.count===2&&before.count===1){
      pulse(columnTotals()[0],'result',120);
      window.setTimeout(()=>pulse(addButton(),'action'),1450);
    }
    if(now.m1Hab>0&&before.m1Hab===0){
      const row=document.querySelector('.customer-row-hab-pulse .row-badge.activity');
      pulse(row,'result',80);
    }
    if(now.m1HabDone&&!before.m1HabDone){
      pulse(columnTotals()[0],'result',220);
      window.setTimeout(()=>pulse(addButton(),'action'),1550);
    }
    if(now.fastDone&&!before.fastDone){
      const fast=document.querySelector('.fast-start-flash')||document.querySelector('.bonus-faststart');
      pulse(fast,'result',420);
    }
    if(now.momentum>0&&before.momentum===0){
      const row=document.querySelector('.customer-row-momentum-pulse .row-badge.momentum');
      pulse(row,'result',80);
      window.setTimeout(()=>pulse(addButton(),'action'),1750);
    }
    if(now.m2Hab>0&&before.m2Hab===0){
      const row=document.querySelector('.customer-row-hab-pulse .row-badge.activity');
      pulse(row,'result',80);
    }
    if(now.m2HabDone&&!before.m2HabDone){
      pulse(columnTotals()[1],'result',250);
      window.setTimeout(()=>pulse(addButton(),'action'),1550);
    }

    last=now;
  };

  if(typeof dismissNextIntro==='function'){
    const baseDismissNextIntro=dismissNextIntro;
    dismissNextIntro=function(){
      baseDismissNextIntro();
      if(ui.days3160Shown)return;
      ui.days3160Shown=true;
      window.setTimeout(()=>{
        const cols=columns();
        pulse(cols[1],'section',180);
        window.setTimeout(()=>pulse(addButton(),'action'),2050);
      },80);
    };
  }

  if(typeof resetExplorer==='function'){
    const baseResetExplorer=resetExplorer;
    resetExplorer=function(){
      ui.firstCustomerCoachShown=false;
      ui.firstHabButtonScheduled=false;
      ui.fastStep1Scheduled=false;
      ui.fastStep2Scheduled=false;
      ui.secondHabAutoStarted=false;
      ui.days3160Shown=false;
      ui.finalDelayStarted=false;
      last={count:0,m1Hab:0,m2Hab:0,m1HabDone:false,m2HabDone:false,fastDone:false,momentum:0,nextIntroDismissed:false};
      baseResetExplorer();
    };
  }

  window.CoachingPreview={
    pulseFirstAction(){
      if(ui.firstActionPulsed)return;
      ui.firstActionPulsed=true;
      pulse(addButton(),'action',80);
    }
  };

  enhance();
})();
