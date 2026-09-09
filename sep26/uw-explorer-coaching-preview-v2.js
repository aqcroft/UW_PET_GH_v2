(function(){
  if(document.documentElement.dataset.coachingPreviewPatch==='v2')return;
  document.documentElement.dataset.coachingPreviewPatch='v2';

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const AUTO_COACH_HOLD=4500;
  const AUTO_COACH_FADE=420;
  const MILESTONE_DELAY=5000;
  const ui={
    firstActionPulsed:false,
    firstCustomerCoachShown:false,
    firstHabButtonScheduled:false,
    firstHabResultShown:false,
    fastStep1Scheduled:false,
    fastStep2Scheduled:false,
    secondHabAutoStarted:false,
    secondHabPending:false,
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
      45%{transform:scale(1.075)}
    }
    @keyframes coachBonusSync{
      0%,100%{transform:scale(1);filter:brightness(1)}
      45%{transform:scale(1.045);filter:brightness(1.035)}
    }
    @keyframes coachSection{
      0%,100%{opacity:.70;box-shadow:0 0 0 rgba(43,130,79,0)}
      48%{opacity:1;box-shadow:0 0 0 .42rem rgba(43,130,79,.13)}
    }
    @keyframes coachStepOpacity{
      0%,100%{opacity:.50;box-shadow:0 0 0 rgba(42,96,170,0)}
      45%{opacity:.80;box-shadow:0 0 0 .28rem rgba(42,96,170,.12)}
    }
    @keyframes coachGhostBadge{
      0%,100%{opacity:.40;transform:scale(1)}
      45%{opacity:.72;transform:scale(1.045)}
    }
    .coach-action-pulse{animation:coachBreathe 1.05s ease-in-out 1 both!important;position:relative;z-index:3}
    .coach-result-pulse{animation:coachResult .95s ease-in-out 1 both!important;position:relative;z-index:3}
    .coach-section-pulse{animation:coachSection 1.45s ease-in-out 1 both!important;position:relative;z-index:2}
    .coach-step-current{opacity:.50!important}
    .coach-step-current.coach-step-opacity-pulse{animation:coachStepOpacity 1.15s ease-in-out 1 both!important;position:relative;z-index:3}
    .coach-step-locked{opacity:.20!important;filter:saturate(.28);pointer-events:none!important}
    .coach-step-done{opacity:.38!important}
    .coach-ghost-badge-pulse{animation:coachGhostBadge 1.15s ease-in-out 1 both!important}

    .customer-row-hab-pulse,.bonus-hab.pulse,
    .customer-row-momentum-pulse,.bonus-momentum.pulse{animation:coachBonusSync .92s ease-in-out 1 both!important}
    .customer-row-hab-pulse .row-badge.activity,
    .customer-row-momentum-pulse .row-badge.momentum,
    .bonus-badge.pulse .bonus-sub{animation:none!important}

    .notice-popup{padding:1.55rem 1.5rem!important}
    .notice-popup .milestone-heading{margin-bottom:.55rem}
    .notice-popup .muted{line-height:1.48;margin:.65rem 0 1.15rem}
    .notice-faststart-setup .faststart-copy{line-height:1.48;margin:.7rem 0 1.2rem}
    .notice-faststart-setup .step-actions{gap:.72rem}
    .coach-unlock-copy{margin:.7rem 0 1rem;font-size:.98rem;line-height:1.42;text-align:center}
    .coach-unlock-copy strong{display:block;margin-bottom:.25rem}
    .coach-unlock-copy .unlock-line{display:block;font-weight:900}

    .coach-whisper{
      position:fixed;left:50%;bottom:5.45rem;top:auto;transform:translateX(-50%);z-index:1500;
      width:min(21rem,calc(100vw - 1.6rem));background:#fff;border:1px solid rgba(40,80,130,.18);
      border-radius:1rem;box-shadow:0 14px 36px rgba(20,38,66,.18);padding:.88rem 1rem;
      text-align:center;line-height:1.34;opacity:0;transition:opacity .35s ease,transform .35s ease;
      pointer-events:none;color:#17233b
    }
    .coach-whisper.show{opacity:1;transform:translate(-50%,-.16rem)}
    .coach-whisper strong{font-weight:950}
    .coach-whisper .coach-line{display:block;margin-top:.18rem;font-size:.94rem}
    .coach-whisper .coach-money{display:block;margin-top:.28rem;font-size:1.02rem;font-weight:950}

    @media(max-width:520px){
      .notice-popup{width:min(20rem,calc(100vw - 1.4rem))!important;padding:1.45rem 1.15rem!important}
      .notice-popup .muted,.notice-faststart-setup .faststart-copy{font-size:.94rem;line-height:1.46}
      .notice-faststart-setup .step-actions{gap:.55rem}
      .coach-whisper{bottom:5.15rem}
    }
    @media(prefers-reduced-motion:reduce){
      .coach-action-pulse,.coach-result-pulse,.coach-section-pulse,.coach-step-opacity-pulse,.coach-ghost-badge-pulse,
      .customer-row-hab-pulse,.bonus-hab.pulse,.customer-row-momentum-pulse,.bonus-momentum.pulse{animation:none!important}
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

  function pulseStep(el,delay=0){
    if(!el||reducedMotion)return;
    window.setTimeout(()=>{
      if(!el.isConnected)return;
      el.classList.remove('coach-step-opacity-pulse');
      void el.offsetWidth;
      el.classList.add('coach-step-opacity-pulse');
      window.setTimeout(()=>el.classList.remove('coach-step-opacity-pulse'),1280);
    },delay);
  }

  function pulseGhostBadge(el,delay=0){
    if(!el||reducedMotion)return;
    window.setTimeout(()=>{
      if(!el.isConnected)return;
      el.classList.remove('coach-ghost-badge-pulse');
      void el.offsetWidth;
      el.classList.add('coach-ghost-badge-pulse');
      window.setTimeout(()=>el.classList.remove('coach-ghost-badge-pulse'),1280);
    },delay);
  }

  function addButton(){return document.querySelector('.add-customer-main:not([disabled])');}
  function columnTotals(){return Array.from(document.querySelectorAll('.column-total-blob'));}
  function columns(){return Array.from(document.querySelectorAll('.customer-column'));}
  function bonusBadges(){return Array.from(document.querySelectorAll('.bonus-badge'));}

  function showWhisper(html,duration=AUTO_COACH_HOLD){
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
    window.setTimeout(()=>el.remove(),duration+AUTO_COACH_FADE);
  }

  function rewriteFirstHabModal(){
    const popup=document.querySelector('.notice-popup.notice-hab');
    if(!popup||popup.textContent.includes('unlocked again'))return;
    const heading=popup.querySelector('.milestone-heading');
    if(!heading||!heading.textContent.includes('High Activity Bonus unlocked'))return;
    const copy=popup.querySelector('.muted');
    if(copy&&!copy.dataset.coachCopy){
      copy.dataset.coachCopy='2';
      copy.innerHTML='<strong>4+ 3-service homeowners</strong><br>in one calendar month<br><br>This unlocks an <strong>extra £100</strong><br>on <em>every</em> qualifying customer.';
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
        copy.dataset.coachCopy='2';
        copy.innerHTML='Now reach <strong>1 Partner + 6 customers</strong><br>in your first 30 days.<br><br><strong>1 Partner</strong> can be<br>a customer who upgrades.<br><br><strong>Customer 6</strong> can be<br>your own linked UW account.<br><br><strong>Complete both steps:</strong>';
      }

      steps.forEach(step=>step.classList.remove('coach-step-current','coach-step-locked','coach-step-done'));
      if(steps[0]){
        if(state.customerPartnerUpgraded)steps[0].classList.add('coach-step-done');
        else steps[0].classList.add('coach-step-current');
      }
      if(steps[1]){
        if(state.ownAccountLinked){
          steps[1].classList.add('coach-step-done');
        }else if(!state.customerPartnerUpgraded){
          steps[1].classList.add('coach-step-locked');
          steps[1].setAttribute('disabled','disabled');
        }else{
          steps[1].classList.add('coach-step-current');
          if(!state.explorerCriteriaBusy)steps[1].removeAttribute('disabled');
        }
      }

      if(!state.customerPartnerUpgraded&&!state.explorerCriteriaBusy&&steps[0]&&!ui.fastStep1Scheduled){
        ui.fastStep1Scheduled=true;
        pulseStep(steps[0],2850);
      }
      if(state.customerPartnerUpgraded&&!state.ownAccountLinked&&!state.explorerCriteriaBusy&&steps[1]&&!ui.fastStep2Scheduled){
        ui.fastStep2Scheduled=true;
        pulseStep(steps[1],1050);
      }
    }else{
      const emoji=popup.querySelector('.notice-emoji');
      if(emoji)emoji.textContent='🏆';
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

  function pendingMomentumExists(){
    const result=R.calculateEarnings(buildContext());
    return result.customers.some(row=>row.momentumGatheringPartner>0&&!state.momentumAppliedIds.includes(row.id));
  }

  function shouldAutoStartSecondHab(){
    return !ui.secondHabAutoStarted&&!state.month2HabIntroDismissed&&state.month2.length>=4&&
      !state.momentumRevealInProgress&&!pendingMomentumExists()&&!state.month2HabRevealComplete;
  }

  function shouldStartFinalDelay(){
    const allCount=state.month1.length+state.month2.length;
    return !ui.finalDelayStarted&&allCount>=10&&!state.endIntroDismissed&&!state.momentumRevealInProgress&&!pendingMomentumExists();
  }

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
      state.explorerCriteriaBusy=false;
      state.fastStartRevealInProgress=true;
      render();

      await sleep(MILESTONE_DELAY);

      state.fastStartRevealComplete=true;
      state.fastStartRevealInProgress=false;
      state.nextIntroDismissed=false;
      render();

      await sleep(450);
      state.fastStartFlashPulse=true;
      render();
      await sleep(950);
      state.fastStartFlashPulse=false;
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

  function enhance(){
    rewriteFirstHabModal();
    rewriteFastStartModal();
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
    };
  }

  let last=snapshot();
  const baseRender=render;
  render=function(){
    const before=last;

    if(shouldAutoStartSecondHab()){
      ui.secondHabAutoStarted=true;
      ui.secondHabPending=true;
      state.month2HabIntroDismissed=true;
    }

    let suppressFinal=false;
    if(shouldStartFinalDelay()){
      ui.finalDelayStarted=true;
      suppressFinal=true;
      state.endIntroDismissed=true;
    }

    baseRender();

    if(suppressFinal)state.endIntroDismissed=false;
    enhance();
    const now=snapshot();

    if(ui.secondHabPending){
      ui.secondHabPending=false;
      const habs=bonusBadges().filter(el=>el.classList.contains('bonus-hab'));
      const month2Hab=habs[habs.length-1];
      pulseGhostBadge(month2Hab,180);
      window.setTimeout(()=>{
        if(!state.habRevealInProgress&&!state.month2HabRevealComplete)startHabReveal(2);
      },1650);
    }

    if(suppressFinal){
      const hero=document.querySelector('.hero-progress-caption');
      pulse(hero,'result',300);
      window.setTimeout(()=>render(),MILESTONE_DELAY);
    }

    if(now.count===1&&before.count===0){
      pulse(columnTotals()[0],'result',120);
      if(!ui.firstCustomerCoachShown){
        ui.firstCustomerCoachShown=true;
        window.setTimeout(()=>showWhisper('<strong>First customer added</strong><span class="coach-line">3 service homeowner</span><span class="coach-money">£250 Customer Bonus</span>'),1050);
        window.setTimeout(()=>pulse(addButton(),'action'),1050+AUTO_COACH_HOLD+AUTO_COACH_FADE+1500);
      }
    }

    if(now.count===2&&before.count===1){
      pulse(columnTotals()[0],'result',120);
    }

    if(now.m1HabDone&&!before.m1HabDone){
      pulse(columnTotals()[0],'result',180);
      if(!ui.firstHabResultShown){
        ui.firstHabResultShown=true;
        window.setTimeout(()=>showWhisper('<strong>Yes, that\'s an extra £400!</strong><span class="coach-money">£1,000 → £1,400</span>'),950);
        window.setTimeout(()=>pulse(addButton(),'action'),950+AUTO_COACH_HOLD+AUTO_COACH_FADE+1400);
      }
    }

    if(now.fastDone&&!before.fastDone){
      const fast=document.querySelector('.fast-start-flash')||document.querySelector('.bonus-faststart');
      pulse(fast,'result',420);
    }

    if(now.momentum>0&&before.momentum===0){
      window.setTimeout(()=>pulse(addButton(),'action'),3000);
    }

    if(now.m2HabDone&&!before.m2HabDone){
      pulse(columnTotals()[1],'result',250);
      window.setTimeout(()=>pulse(addButton(),'action'),1900);
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
        const target=cols[1];
        if(target&&!reducedMotion){
          target.style.opacity='.70';
          pulse(target,'section',120);
          window.setTimeout(()=>{if(target.isConnected)target.style.opacity='';},1750);
        }
        window.setTimeout(()=>pulse(addButton(),'action'),2550);
      },80);
    };
  }

  if(typeof resetExplorer==='function'){
    const baseResetExplorer=resetExplorer;
    resetExplorer=function(){
      ui.firstActionPulsed=false;
      ui.firstCustomerCoachShown=false;
      ui.firstHabButtonScheduled=false;
      ui.firstHabResultShown=false;
      ui.fastStep1Scheduled=false;
      ui.fastStep2Scheduled=false;
      ui.secondHabAutoStarted=false;
      ui.secondHabPending=false;
      ui.days3160Shown=false;
      ui.finalDelayStarted=false;
      last={count:0,m1Hab:0,m2Hab:0,m1HabDone:false,m2HabDone:false,fastDone:false,momentum:0};
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
