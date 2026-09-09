(function(){
  if(document.documentElement.dataset.coachingPreviewV4==='1')return;
  document.documentElement.dataset.coachingPreviewV4='1';

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const COACH_HOLD=3500;
  const COACH_FADE=450;
  const SHORT_PAUSE=1200;
  const FAST_START_REWARD_PAUSE=5000;
  const FINAL_PAUSE=5000;

  const ui={
    gate:false,
    firstCustomerCoachShown:false,
    firstHabDelayStarted:false,
    firstHabButtonScheduled:false,
    firstHabResultCoachShown:false,
    fastSetupDelayStarted:false,
    fastSetupReady:false,
    fastStep1Scheduled:false,
    fastStep2Scheduled:false,
    days3160CueScheduled:false,
    secondHabCoachStarted:false,
    finalDelayPending:false,
    finalDelayDone:false,
  };

  const style=document.createElement('style');
  style.textContent=`
    @keyframes v4ActionPulse{
      0%,100%{transform:scale(1);box-shadow:0 0 0 rgba(42,96,170,0)}
      45%{transform:scale(1.035);box-shadow:0 0 0 .32rem rgba(42,96,170,.12)}
    }
    @keyframes v4ResultPulse{
      0%,100%{transform:scale(1)}
      45%{transform:scale(1.075)}
    }
    @keyframes v4StepPulse{
      0%,100%{opacity:.50;transform:scale(1);box-shadow:0 0 0 rgba(29,79,145,0)}
      45%{opacity:.82;transform:scale(1.018);box-shadow:0 0 0 .32rem rgba(29,79,145,.14)}
    }
    @keyframes v4SectionPulse{
      0%,100%{opacity:.70;box-shadow:0 0 0 rgba(43,130,79,0)}
      48%{opacity:1;box-shadow:0 0 0 .42rem rgba(43,130,79,.13)}
    }
    @keyframes v4FastStage{
      0%,100%{opacity:.72;transform:scale(1);box-shadow:0 0 0 rgba(29,79,145,0)}
      45%{opacity:1;transform:scale(1.055);box-shadow:0 0 0 .3rem rgba(29,79,145,.14)}
    }

    .v4-action-pulse{animation:v4ActionPulse 1.05s ease-in-out 1 both!important;position:relative;z-index:3}
    .v4-result-pulse{animation:v4ResultPulse .95s ease-in-out 1 both!important;position:relative;z-index:3}
    .v4-step-current{opacity:.50!important;filter:none!important}
    .v4-step-current.v4-step-pulse{animation:v4StepPulse 1.25s ease-in-out 1 both!important;transform-origin:center!important}
    .v4-step-locked{opacity:.20!important;filter:saturate(.28);pointer-events:none!important}
    .v4-step-done{opacity:1!important;filter:none!important}
    .step-button.done.v4-step-done{opacity:1!important;background:linear-gradient(145deg,#173c78,var(--blue))!important;border-color:var(--blue)!important;color:#fff!important}
    .v4-section-pulse{animation:v4SectionPulse 1.45s ease-in-out 1 both!important;position:relative;z-index:2}
    .bonus-faststart.v4-fast-stage{animation:v4FastStage 1.25s ease-in-out 1 both!important;background:#dbeaff!important;border-color:rgba(29,79,145,.58)!important;opacity:1!important}

    /* Original strong customer-row animations, mirrored exactly on the matching bonus tiles. */
    .customer-row-hab-pulse{animation:habPulse 1.15s ease both!important}
    .bonus-hab.pulse{animation:habPulse 1.15s ease both!important}
    .customer-row-momentum-pulse{animation:momentumPulse 1.15s ease both!important}
    .bonus-momentum.pulse{animation:momentumPulse 1.15s ease both!important}
    .bonus-badge.pulse .bonus-sub{animation:none!important}

    .v4-gated-add{opacity:.58!important;pointer-events:none!important}
    .notice-popup{padding:1.55rem 1.5rem!important}
    .notice-popup .milestone-heading{margin-bottom:.55rem}
    .notice-popup .muted{line-height:1.48;margin:.65rem 0 1.15rem}
    .notice-faststart-setup .faststart-copy{line-height:1.48;margin:.7rem 0 1.2rem}
    .notice-faststart-setup .step-actions{gap:.72rem}
    .v4-unlock-copy{margin:.7rem 0 1rem;font-size:.98rem;line-height:1.42;text-align:center}
    .v4-unlock-copy strong{display:block;margin-bottom:.25rem}
    .v4-unlock-copy .unlock-line{display:block;font-weight:900}

    .v4-coach{
      position:fixed;left:50%;top:50%;transform:translateX(-50%);z-index:1500;
      width:min(21rem,calc(100vw - 1.6rem));background:#fff;border:1px solid rgba(40,80,130,.18);
      border-radius:1rem;box-shadow:0 14px 36px rgba(20,38,66,.18);padding:.88rem 1rem;
      text-align:center;line-height:1.34;opacity:0;transition:opacity .35s ease,transform .35s ease;
      pointer-events:none;color:#17233b
    }
    .v4-coach.show{opacity:1;transform:translate(-50%,-.16rem)}
    .v4-coach strong{font-weight:950}
    .v4-coach .coach-line{display:block;margin-top:.18rem;font-size:.94rem}
    .v4-coach .coach-money{display:block;margin-top:.28rem;font-size:1.02rem;font-weight:950}

    @media(max-width:520px){
      .notice-popup{width:min(20rem,calc(100vw - 1.4rem))!important;padding:1.45rem 1.15rem!important}
      .notice-popup .muted,.notice-faststart-setup .faststart-copy{font-size:.94rem;line-height:1.46}
      .notice-faststart-setup .step-actions{gap:.55rem}
    }
    @media(prefers-reduced-motion:reduce){
      .v4-action-pulse,.v4-result-pulse,.v4-step-pulse,.v4-section-pulse,.v4-fast-stage,
      .customer-row-hab-pulse,.bonus-hab.pulse,.customer-row-momentum-pulse,.bonus-momentum.pulse{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  function totalCount(){return state.month1.length+state.month2.length;}
  function addButton(){return document.querySelector('.add-customer-main:not([disabled])')||document.querySelector('.add-customer-main');}
  function columnTotals(){return Array.from(document.querySelectorAll('.column-total-blob'));}
  function columns(){return Array.from(document.querySelectorAll('.customer-column'));}

  function setGate(on){
    ui.gate=!!on;
    const btn=addButton();
    if(btn)btn.classList.toggle('v4-gated-add',ui.gate);
  }

  const baseAddCustomer=addCustomer;
  addCustomer=function(){
    if(ui.gate)return;
    baseAddCustomer();
  };

  function pulse(el,type='action',delay=0){
    if(!el||reducedMotion)return;
    const cls=type==='result'?'v4-result-pulse':'v4-action-pulse';
    window.setTimeout(()=>{
      if(!el.isConnected)return;
      el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
      window.setTimeout(()=>el.classList.remove(cls),1150);
    },delay);
  }

  function pulseStep(el,delay=0){
    if(!el||reducedMotion)return;
    window.setTimeout(()=>{
      if(!el.isConnected)return;
      el.classList.remove('v4-step-pulse');void el.offsetWidth;el.classList.add('v4-step-pulse');
      window.setTimeout(()=>el.classList.remove('v4-step-pulse'),1300);
    },delay);
  }

  function positionCoach(el){
    if(!el||!el.isConnected)return;
    const btn=addButton();
    const rect=btn?.getBoundingClientRect();
    const height=el.offsetHeight||90;
    let top=rect?rect.top-height-14:window.innerHeight-height-150;
    top=Math.max(110,Math.min(top,window.innerHeight-height-76));
    el.style.top=`${Math.round(top)}px`;
  }

  function showCoach(html,{after=null}={}){
    document.querySelector('.v4-coach')?.remove();
    setGate(true);
    const el=document.createElement('div');
    el.className='v4-coach';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML=html;
    document.body.appendChild(el);
    requestAnimationFrame(()=>{positionCoach(el);el.classList.add('show');});
    window.setTimeout(()=>el.classList.remove('show'),COACH_HOLD);
    window.setTimeout(()=>{
      el.remove();
      setGate(false);
      if(typeof after==='function')after();
    },COACH_HOLD+COACH_FADE);
  }

  window.addEventListener('resize',()=>document.querySelectorAll('.v4-coach').forEach(positionCoach));

  function delayBackdrop(popup,key,onReveal){
    if(!popup||ui[key])return false;
    ui[key]=true;
    const backdrop=popup.closest('.notice-backdrop');
    if(!backdrop)return false;
    setGate(true);
    backdrop.style.transition='none';
    backdrop.style.opacity='0';
    backdrop.style.pointerEvents='none';
    window.setTimeout(()=>{
      if(!backdrop.isConnected){setGate(false);return;}
      backdrop.style.transition='opacity .42s ease';
      void backdrop.offsetWidth;
      backdrop.style.opacity='1';
      backdrop.style.pointerEvents='auto';
      setGate(false);
      if(typeof onReveal==='function')onReveal(popup);
    },SHORT_PAUSE);
    return true;
  }

  function rewriteFirstHabModal(){
    const popup=Array.from(document.querySelectorAll('.notice-popup.notice-hab')).find(el=>!el.textContent.includes('unlocked again'));
    if(!popup)return;
    const copy=popup.querySelector('.muted');
    if(copy){
      copy.innerHTML="Now you've introduced<br><strong>four 3-service homeowners</strong><br>in one calendar month<br><br>That's an <strong>extra £100</strong><br>on <em>every</em> qualifying customer.";
    }
    const delayed=delayBackdrop(popup,'firstHabDelayStarted',()=>{
      const button=popup.querySelector('button.button.hab');
      if(button&&!ui.firstHabButtonScheduled){
        ui.firstHabButtonScheduled=true;
        pulse(button,'action',2300);
      }
    });
    if(!delayed&&!ui.firstHabButtonScheduled){
      ui.firstHabButtonScheduled=true;
      pulse(popup.querySelector('button.button.hab'),'action',2300);
    }
  }

  function rewriteFastStartModal(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup)return;

    if(!state.fastStartRevealComplete){
      const copy=popup.querySelector('.faststart-copy');
      if(copy){
        copy.innerHTML='Now reach <strong>1 Partner + 6 customers</strong><br>in your first 30 days.<br><br><strong>1 Partner</strong> can be<br>a customer who upgrades.<br><br><strong>Customer 6</strong> can be<br>your own linked UW account.<br><br><strong>Complete both steps:</strong>';
      }

      const steps=Array.from(popup.querySelectorAll('.fast-start-step-button'));
      steps.forEach(step=>step.classList.remove('v4-step-current','v4-step-locked','v4-step-done'));
      if(steps[0]){
        if(state.customerPartnerUpgraded){steps[0].classList.add('v4-step-done','done');steps[0].style.opacity='1';}
        else steps[0].classList.add('v4-step-current');
      }
      if(steps[1]){
        if(state.ownAccountLinked){steps[1].classList.add('v4-step-done','done');steps[1].style.opacity='1';}
        else if(!state.customerPartnerUpgraded){steps[1].classList.add('v4-step-locked');steps[1].setAttribute('disabled','disabled');}
        else {steps[1].classList.add('v4-step-current');if(!state.explorerCriteriaBusy)steps[1].removeAttribute('disabled');}
      }

      if(!ui.fastSetupDelayStarted&&state.month1.length>=5&&!state.customerPartnerUpgraded&&!state.ownAccountLinked){
        delayBackdrop(popup,'fastSetupDelayStarted',()=>{
          ui.fastSetupReady=true;
          if(steps[0]&&!ui.fastStep1Scheduled){ui.fastStep1Scheduled=true;pulseStep(steps[0],2850);}
        });
        return;
      }

      if(state.customerPartnerUpgraded&&!state.ownAccountLinked&&!state.explorerCriteriaBusy&&steps[1]&&!ui.fastStep2Scheduled){
        ui.fastStep2Scheduled=true;
        pulseStep(steps[1],1050);
      }else if(!state.customerPartnerUpgraded&&!state.explorerCriteriaBusy&&ui.fastSetupReady&&steps[0]&&!ui.fastStep1Scheduled){
        ui.fastStep1Scheduled=true;
        pulseStep(steps[0],2850);
      }
    }else{
      const emoji=popup.querySelector('.notice-emoji');
      if(emoji)emoji.textContent='🏆';
      const h2=popup.querySelector('h2');
      if(h2)h2.textContent='£500 Fast Start earned!';
      const stepActions=popup.querySelector('.step-actions');
      if(stepActions)stepActions.style.display='none';
      if(!popup.querySelector('.v4-unlock-copy')){
        const block=document.createElement('div');
        block.className='v4-unlock-copy';
        block.innerHTML='<strong>First 30-day milestone achieved.</strong><span class="unlock-line">🔓 New income streams unlocked.</span>';
        const whatsNext=popup.querySelector('.whats-next-block');
        popup.insertBefore(block,whatsNext||null);
      }
    }
  }

  function rewriteMomentumModal(){
    const popup=Array.from(document.querySelectorAll('.notice-popup')).find(el=>el.textContent.includes('Momentum Bonus unlocked'));
    if(!popup)return;
    const paras=popup.querySelectorAll('p.muted');
    if(paras[0])paras[0].innerHTML='This rewards unsupported<br><strong>3+ service homeowner customer sign-ups</strong><br>with an <strong>extra £125</strong><br>in days 31-60.';
    if(paras[1])paras[1].style.display='none';
  }

  function rewriteFinalModal(){
    const popup=document.querySelector('.notice-final');
    if(!popup)return;
    const p=popup.querySelector('p.muted');
    if(p)p.textContent='Get registered below or book a no-commitment chat.';
  }

  function pulseFastStage(){
    const tile=document.querySelector('.bonus-faststart');
    if(!tile||reducedMotion)return;
    tile.classList.remove('v4-fast-stage');void tile.offsetWidth;tile.classList.add('v4-fast-stage');
    window.setTimeout(()=>tile.classList.remove('v4-fast-stage'),1400);
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
    void el.offsetWidth;el.style.opacity=String(opacity);
    await sleep(duration+60);
  }
  function keepFastStartBackdropHidden(){
    const el=currentFastStartBackdrop();
    if(!el)return null;
    el.style.transition='none';el.style.opacity='0';el.style.pointerEvents='none';
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
    render();keepFastStartBackdropHidden();

    await sleep(1450);
    state.fastStartPulseId=null;state.fastStartAccountPulse=false;

    if(secondStep){
      state.fastStartRevealComplete=true;
      state.fastStartRevealInProgress=true;
      state.nextIntroDismissed=false;
      state.fastStartFlashPulse=true;
      render();keepFastStartBackdropHidden();pulseFastStage();

      await sleep(1450);
      state.fastStartFlashPulse=false;
      render();keepFastStartBackdropHidden();

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
      void el.offsetWidth;el.style.opacity='1';
      await sleep(1860);
    }
    state.explorerCriteriaBusy=false;
    render();
  };

  function pendingMomentumExists(){
    const result=R.calculateEarnings(buildContext());
    return result.customers.some(row=>row.momentumGatheringPartner>0&&!state.momentumAppliedIds.includes(row.id));
  }

  function enhance(){
    setGate(ui.gate);
    rewriteFirstHabModal();
    rewriteFastStartModal();
    rewriteMomentumModal();
    rewriteFinalModal();
  }

  function snapshot(){return {
    count:totalCount(),
    m1HabDone:state.month1HabRevealComplete,
    fastDone:state.fastStartRevealComplete,
    momentum:state.momentumAppliedIds.length,
    m2HabDone:state.month2HabRevealComplete,
  };}

  let last=snapshot();
  const baseRender=render;
  render=function(){
    const before=last;

    const shouldSecondHab=!ui.secondHabCoachStarted&&!state.month2HabIntroDismissed&&state.month2.length>=4&&
      !state.month2HabRevealComplete&&!state.habRevealInProgress&&!state.momentumRevealInProgress&&!pendingMomentumExists();
    if(shouldSecondHab){
      ui.secondHabCoachStarted=true;
      state.month2HabIntroDismissed=true;
    }

    let suppressFinal=false;
    const journeyComplete=totalCount()>=10;
    if(journeyComplete&&!state.endIntroDismissed&&!ui.finalDelayDone){
      suppressFinal=true;
      state.endIntroDismissed=true;
      if(!ui.finalDelayPending){
        ui.finalDelayPending=true;
        window.setTimeout(()=>{
          ui.finalDelayPending=false;ui.finalDelayDone=true;render();
        },FINAL_PAUSE);
      }
    }

    baseRender();
    if(suppressFinal)state.endIntroDismissed=false;
    enhance();
    const now=snapshot();

    if(now.count===1&&before.count===0&&!ui.firstCustomerCoachShown){
      ui.firstCustomerCoachShown=true;
      pulse(columnTotals()[0],'result',120);
      window.setTimeout(()=>{
        showCoach('<strong>First customer added</strong><span class="coach-line">3 service homeowner</span><span class="coach-money">£250 Customer Bonus</span>',{
          after:()=>window.setTimeout(()=>{if(totalCount()===1)pulse(addButton(),'action');},1400)
        });
      },900);
    }

    if(now.count===2&&before.count===1){
      pulse(columnTotals()[0],'result',120);
      /* Deliberately no Add 3rd customer pulse. */
    }

    if(now.m1HabDone&&!before.m1HabDone&&!ui.firstHabResultCoachShown){
      ui.firstHabResultCoachShown=true;
      pulse(columnTotals()[0],'result',180);
      window.setTimeout(()=>{
        showCoach('<strong>Yes, that\'s an extra £400!</strong><span class="coach-money">£1,000 ➡️ £1,400</span>',{
          after:()=>window.setTimeout(()=>{if(totalCount()===4)pulse(addButton(),'action');},1400)
        });
      },850);
    }

    if(now.momentum>0&&before.momentum===0){
      window.setTimeout(()=>{if(totalCount()===6)pulse(addButton(),'action');},3000);
    }

    if(shouldSecondHab){
      showCoach('🔥 <strong>And yes...</strong><span class="coach-line">High Activity Bonus kicks in again.</span>',{
        after:()=>window.setTimeout(()=>{
          if(!state.month2HabRevealComplete&&!state.habRevealInProgress)startHabReveal(2);
        },450)
      });
    }

    if(now.m2HabDone&&!before.m2HabDone){
      pulse(columnTotals()[1],'result',250);
      window.setTimeout(()=>{if(totalCount()===9)pulse(addButton(),'action');},1900);
    }

    if(suppressFinal){
      pulse(document.querySelector('.hero-progress-caption'),'result',300);
    }

    last=now;
  };

  const baseDismissNextIntro=dismissNextIntro;
  dismissNextIntro=function(){
    baseDismissNextIntro();
    if(ui.days3160CueScheduled)return;
    ui.days3160CueScheduled=true;
    window.setTimeout(()=>{
      const target=columns()[1];
      if(target&&!reducedMotion){
        target.classList.remove('v4-section-pulse');void target.offsetWidth;target.classList.add('v4-section-pulse');
        window.setTimeout(()=>target.classList.remove('v4-section-pulse'),1600);
      }
      window.setTimeout(()=>{if(totalCount()===5)pulse(addButton(),'action');},1850);
    },1400);
  };

  const baseResetExplorer=resetExplorer;
  resetExplorer=function(){
    Object.assign(ui,{
      gate:false,firstCustomerCoachShown:false,firstHabDelayStarted:false,firstHabButtonScheduled:false,
      firstHabResultCoachShown:false,fastSetupDelayStarted:false,fastSetupReady:false,fastStep1Scheduled:false,
      fastStep2Scheduled:false,days3160CueScheduled:false,secondHabCoachStarted:false,finalDelayPending:false,finalDelayDone:false
    });
    document.querySelector('.v4-coach')?.remove();
    baseResetExplorer();
    last=snapshot();
  };

  window.CoachingPreviewV4={
    setGate,
    pulseFirstAction(){if(totalCount()===0)pulse(addButton(),'action',80);}
  };

  enhance();
})();
