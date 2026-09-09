(function(){
  if(document.documentElement.dataset.coachingPreviewV8==='1')return;
  document.documentElement.dataset.coachingPreviewV8='1';

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const COACH_PRE_DELAY=2200;
  const COACH_HOLD=3500;
  const COACH_FADE=450;
  const MAIN_MODAL_DELAY=1200;
  const MAIN_MODAL_FADE=500;
  const FAST_START_REWARD_PAUSE=1000;
  const FINAL_PAUSE=5000;

  const core={
    render,
    addCustomer,
    resetExplorer,
    startHabReveal,
    startMomentumReveal,
    completeFirst30Step,
    dismissNextIntro,
    dismissEndIntro,
  };

  const ui={
    gate:false,
    gateDim:true,
    firstCustomerCoachShown:false,
    customer2CoachShown:false,
    customer3CoachShown:false,
    firstHabDelayScheduled:false,
    firstHabReady:false,
    firstHabButtonPulseScheduled:false,
    postHabCoachShown:false,
    fastSetupDelayScheduled:false,
    fastSetupReady:false,
    fastStep1PulseScheduled:false,
    fastStep2PulseScheduled:false,
    fastChoreography:false,
    momentumPreCoachShown:false,
    momentumModalDelayScheduled:false,
    momentumModalReady:false,
    customer7CoachShown:false,
    batchReady:false,
    batchRunning:false,
    secondHabCoachScheduled:false,
    secondHabRevealStarted:false,
    final10CoachShown:false,
    finalDelayScheduled:false,
    finalReady:false,
    modalKey:null,
  };

  const ownTimers=new Set();
  const undoStack=[];
  let internalCustomerAdd=false;
  let last={count:0,m1Hab:false,m2Hab:false,momentumIds:'',fast:false};

  const style=document.createElement('style');
  style.textContent=`
    @keyframes v8ActionPulse{
      0%,100%{transform:scale(1);box-shadow:0 0 0 rgba(42,96,170,0)}
      45%{transform:scale(1.035);box-shadow:0 0 0 .32rem rgba(42,96,170,.12)}
    }
    @keyframes v8ResultPulse{
      0%,100%{transform:scale(1)}
      45%{transform:scale(1.075)}
    }
    @keyframes v8StepPulse{
      0%,100%{opacity:.42;transform:scale(1);box-shadow:0 0 0 rgba(29,79,145,0)}
      45%{opacity:.80;transform:scale(1.018);box-shadow:0 0 0 .32rem rgba(29,79,145,.14)}
    }
    @keyframes v8SectionPulse{
      0%,100%{opacity:.70;box-shadow:0 0 0 rgba(43,130,79,0)}
      48%{opacity:1;box-shadow:0 0 0 .42rem rgba(43,130,79,.13)}
    }
    @keyframes v8FastStage{
      0%,100%{opacity:.72;transform:scale(1);box-shadow:0 0 0 rgba(29,79,145,0)}
      45%{opacity:1;transform:scale(1.055);box-shadow:0 0 0 .3rem rgba(29,79,145,.14)}
    }
    @keyframes v8ModalBackdropIn{from{opacity:0}to{opacity:1}}
    @keyframes v8ModalIn{
      from{opacity:0;transform:translateY(12px) scale(.985)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }

    .v8-action-pulse{animation:v8ActionPulse 1.05s ease-in-out 1 both!important;position:relative;z-index:3}
    .v8-result-pulse{animation:v8ResultPulse .95s ease-in-out 1 both!important;position:relative;z-index:3}
    .v8-section-pulse{animation:v8SectionPulse 1.45s ease-in-out 1 both!important;position:relative;z-index:2}
    .bonus-faststart.v8-fast-stage{animation:v8FastStage 1.25s ease-in-out 1 both!important;background:#dbeaff!important;border-color:rgba(29,79,145,.58)!important;opacity:1!important}

    .v8-step-current{opacity:.42!important;filter:none!important}
    .v8-step-current.v8-step-pulse{animation:v8StepPulse 1.25s ease-in-out 1 both!important;transform-origin:center!important}
    .v8-step-locked{opacity:.18!important;filter:saturate(.28);pointer-events:none!important}
    .v8-step-done,.step-button.done.v8-step-done{opacity:1!important;filter:none!important;background:linear-gradient(145deg,#173c78,var(--blue))!important;border-color:var(--blue)!important;color:#fff!important}

    /* Restore the original, stronger row pulses and mirror them on the bonus tiles. */
    .customer-row-hab-pulse{animation:habPulse 1.15s ease both!important}
    .bonus-hab.pulse{animation:habPulse 1.15s ease both!important}
    .customer-row-momentum-pulse{animation:momentumPulse 1.15s ease both!important}
    .bonus-momentum.pulse{animation:momentumPulse 1.15s ease both!important}
    .bonus-badge.pulse .bonus-sub{animation:none!important}

    .v8-gated-add{pointer-events:none!important}
    .v8-gated-add.v8-gated-dim{opacity:.52!important}
    .add-customer-main.button.hab:disabled{opacity:1!important;background:#d95500!important;color:#fff!important;filter:none!important}

    .v8-coach{
      position:fixed;left:50%;top:50%;transform:translateX(-50%);z-index:1500;
      width:min(21rem,calc(100vw - 1.6rem));background:#fff;border:1px solid rgba(40,80,130,.18);
      border-radius:1rem;box-shadow:0 14px 36px rgba(20,38,66,.18);padding:.92rem 1rem;
      text-align:center;line-height:1.36;opacity:0;transition:opacity .35s ease,transform .35s ease;
      pointer-events:none;color:#17233b
    }
    .v8-coach.show{opacity:1;transform:translate(-50%,-.16rem)}
    .v8-coach strong{font-weight:950}
    .v8-coach .coach-line{display:block;margin-top:.22rem;font-size:.95rem}
    .v8-coach .coach-money{display:block;margin-top:.32rem;font-size:1.02rem;font-weight:950}
    .v8-coach .coach-money.v8-normal-money{font-weight:600!important}

    .notice-popup{padding:1.55rem 1.5rem!important}
    .notice-popup .milestone-heading{margin-bottom:.55rem}
    .notice-popup .muted{line-height:1.48;margin:.65rem 0 1.15rem}
    .notice-faststart-setup .faststart-copy{line-height:1.48;margin:.7rem 0 1.2rem}
    .notice-faststart-setup .step-actions{gap:.72rem}
    .v8-unlock-copy{margin:.7rem 0 1rem;font-size:.98rem;line-height:1.42;text-align:center}
    .v8-unlock-copy strong{display:block;margin-bottom:.25rem}
    .v8-unlock-copy .unlock-line{display:block;font-weight:900}

    .notice-backdrop.v8-modal-enter{animation:v8ModalBackdropIn .48s ease both}
    .notice-backdrop.v8-modal-enter>.notice-popup{animation:v8ModalIn .48s cubic-bezier(.22,.8,.32,1) both}
    .notice-backdrop.v8-modal-exit{opacity:0!important;pointer-events:none!important;transition:opacity .5s ease!important}
    .notice-backdrop.v8-modal-exit>.notice-popup{opacity:0!important;transform:translateY(10px) scale(.985)!important;transition:opacity .5s ease,transform .5s cubic-bezier(.4,0,.2,1)!important}

    .add-customer-solo-row{gap:.48rem;align-items:stretch}
    .v8-back-step{
      min-height:3.55rem;width:4.7rem;border:1px solid rgba(29,79,145,.25);border-radius:.72rem;
      background:#fff;color:var(--blue);font-weight:900;cursor:pointer;box-shadow:0 8px 18px rgba(29,79,145,.08)
    }
    .v8-back-step:disabled{opacity:.32;cursor:not-allowed}

    @media(max-width:520px){
      .notice-popup{width:min(20rem,calc(100vw - 1.4rem))!important;padding:1.45rem 1.15rem!important}
      .notice-popup .muted,.notice-faststart-setup .faststart-copy{font-size:.94rem;line-height:1.46}
      .notice-faststart-setup .step-actions{gap:.55rem}
      .v8-back-step{width:4.2rem;padding:0 .35rem;font-size:.78rem}
    }
    @media(prefers-reduced-motion:reduce){
      .v8-action-pulse,.v8-result-pulse,.v8-section-pulse,.v8-step-pulse,.v8-fast-stage,
      .customer-row-hab-pulse,.bonus-hab.pulse,.customer-row-momentum-pulse,.bonus-momentum.pulse,
      .notice-backdrop.v8-modal-enter,.notice-backdrop.v8-modal-enter>.notice-popup{animation:none!important}
      .notice-backdrop.v8-modal-exit,.notice-backdrop.v8-modal-exit>.notice-popup{transition:none!important}
    }
  `;
  document.head.appendChild(style);

  function later(fn,ms){
    const id=window.setTimeout(()=>{ownTimers.delete(id);fn();},ms);
    ownTimers.add(id);
    return id;
  }
  function clearOwnTimers(){for(const id of ownTimers)clearTimeout(id);ownTimers.clear();}
  function clone(value){return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));}
  function totalCount(){return state.month1.length+state.month2.length;}
  function addButton(){return document.querySelector('.add-customer-main:not([disabled])')||document.querySelector('.add-customer-main');}
  function columns(){return Array.from(document.querySelectorAll('.customer-column'));}
  function columnTotals(){return Array.from(document.querySelectorAll('.column-total-blob'));}
  function snapshot(){return {count:totalCount(),m1Hab:state.month1HabRevealComplete,m2Hab:state.month2HabRevealComplete,momentumIds:[...state.momentumAppliedIds].sort().join(','),fast:state.fastStartRevealComplete};}
  function pendingMomentum(){
    const result=R.calculateEarnings(buildContext());
    return result.customers.some(row=>row.momentumGatheringPartner>0&&!state.momentumAppliedIds.includes(row.id));
  }
  function busy(){return !!(state.habRevealInProgress||state.momentumRevealInProgress||state.fastStartRevealInProgress||ui.batchRunning||document.querySelector('.v8-coach')||document.querySelector('.notice-backdrop:not(.howpaid-overlay)'));}

  function setGate(on,dim=true){
    ui.gate=!!on;
    ui.gateDim=!!dim;
    enhanceActions();
  }

  function pulse(el,type='action',delay=0){
    if(!el||reducedMotion)return;
    const cls=type==='result'?'v8-result-pulse':'v8-action-pulse';
    later(()=>{
      if(!el.isConnected)return;
      el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
      later(()=>el.classList.remove(cls),1200);
    },delay);
  }
  function pulseStep(el,delay=0){
    if(!el||reducedMotion)return;
    later(()=>{
      if(!el.isConnected)return;
      el.classList.remove('v8-step-pulse');void el.offsetWidth;el.classList.add('v8-step-pulse');
      later(()=>el.classList.remove('v8-step-pulse'),1300);
    },delay);
  }
  function pulseSection(){
    const target=columns()[1];
    if(!target||reducedMotion)return;
    target.classList.remove('v8-section-pulse');void target.offsetWidth;target.classList.add('v8-section-pulse');
    later(()=>target.classList.remove('v8-section-pulse'),1600);
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

  function scheduleCoach(html,{delay=COACH_PRE_DELAY,after=null,dim=true}={}){
    setGate(true,dim);
    later(()=>{
      document.querySelector('.v8-coach')?.remove();
      const el=document.createElement('div');
      el.className='v8-coach';
      el.setAttribute('role','status');
      el.setAttribute('aria-live','polite');
      el.innerHTML=html;
      document.body.appendChild(el);
      requestAnimationFrame(()=>{positionCoach(el);el.classList.add('show');});
      later(()=>el.classList.remove('show'),COACH_HOLD);
      later(()=>{
        el.remove();
        setGate(false,false);
        if(typeof after==='function')after();
      },COACH_HOLD+COACH_FADE);
    },delay);
  }
  window.addEventListener('resize',()=>document.querySelectorAll('.v8-coach').forEach(positionCoach));

  function captureUndo(){
    undoStack.push({state:clone(state),ui:clone(ui)});
    if(undoStack.length>20)undoStack.shift();
  }
  function restoreObject(target,source){
    for(const key of Object.keys(target))delete target[key];
    Object.assign(target,clone(source));
  }
  function undo(){
    if(!undoStack.length||busy())return;
    clearOwnTimers();
    document.querySelector('.v8-coach')?.remove();
    const snap=undoStack.pop();
    restoreObject(state,snap.state);
    restoreObject(ui,snap.ui);
    state.habRevealToken=(state.habRevealToken||0)+1;
    state.momentumRevealToken=(state.momentumRevealToken||0)+1;
    state.fastStartRevealToken=(state.fastStartRevealToken||0)+1;
    state.habRevealInProgress=false;
    state.momentumRevealInProgress=false;
    state.fastStartRevealInProgress=false;
    state.habPulseId=null;
    state.momentumPulseId=null;
    state.fastStartPulseId=null;
    state.fastStartAccountPulse=false;
    state.fastStartFlashPulse=false;
    last=snapshot();
    core.render();
    enhance();
  }

  function enhanceActions(){
    const btn=addButton();
    if(btn){
      btn.classList.toggle('v8-gated-add',ui.gate);
      btn.classList.toggle('v8-gated-dim',ui.gate&&ui.gateDim);
      if(state.habRevealInProgress&&btn.classList.contains('hab')){
        btn.style.opacity='1';btn.style.background='#d95500';btn.style.color='#fff';btn.style.filter='none';
      }
      if(totalCount()===7&&ui.batchReady&&!ui.batchRunning){
        const main=btn.querySelector('.add-label-main');
        const sub=btn.querySelector('.add-label-sub');
        const icon=btn.querySelector('.add-label-icon');
        if(main)main.textContent='Add a few customers';
        if(sub)sub.textContent='';
        if(icon)icon.textContent='👥';
      }
    }

    const row=document.querySelector('.add-customer-solo-row');
    if(row&&!row.querySelector('.v8-back-step')){
      const back=document.createElement('button');
      back.type='button';
      back.className='v8-back-step';
      back.textContent='↩ Back';
      back.onclick=undo;
      row.prepend(back);
    }
    const back=row?.querySelector('.v8-back-step');
    if(back)back.disabled=!undoStack.length||busy();
  }

  function modalKey(popup){
    if(!popup)return null;
    if(popup.classList.contains('notice-final'))return 'final';
    if(popup.classList.contains('notice-faststart-setup'))return state.fastStartRevealComplete?'fast-earned':'fast-setup';
    if(popup.classList.contains('notice-hab'))return 'hab-1';
    if(popup.textContent.includes('Momentum Bonus unlocked'))return 'momentum';
    return 'main';
  }
  function animateModalIn(backdrop,popup){
    if(!backdrop||!popup||ui.fastChoreography)return;
    const key=modalKey(popup);
    if(ui.modalKey===key)return;
    ui.modalKey=key;
    backdrop.classList.add('v8-modal-enter');
    later(()=>backdrop.classList.remove('v8-modal-enter'),650);
  }
  async function fadeOutMainModal(){
    const backdrop=document.querySelector('.notice-backdrop:not(.howpaid-overlay)');
    if(!backdrop)return;
    backdrop.classList.remove('v8-modal-enter');
    backdrop.classList.add('v8-modal-exit');
    await sleep(reducedMotion?0:MAIN_MODAL_FADE);
    ui.modalKey=null;
  }

  function rewriteHabModal(popup){
    const copy=popup.querySelector('.muted');
    if(copy)copy.innerHTML="Now you've introduced<br><strong>four 3-service homeowners</strong><br>in one calendar month<br><br>That's an <strong>extra £100</strong><br>on <em>every</em> qualifying customer.";
    const button=popup.querySelector('button.button.hab');
    if(button&&!ui.firstHabButtonPulseScheduled){
      ui.firstHabButtonPulseScheduled=true;
      pulse(button,'action',3400);
    }
  }

  function rewriteFastStartModal(popup){
    const steps=Array.from(popup.querySelectorAll('.fast-start-step-button'));
    if(!state.fastStartRevealComplete){
      const copy=popup.querySelector('.faststart-copy');
      if(copy)copy.innerHTML='Now reach <strong>1 Partner + 6 customers</strong><br>in your first 30 days.<br><br><strong>1 Partner</strong> can be<br>a customer who upgrades.<br><br><strong>Customer 6</strong> can be<br>your own linked UW account.<br><br><strong>Complete both steps:</strong>';
      steps.forEach(step=>step.classList.remove('v8-step-current','v8-step-locked','v8-step-done'));
      if(steps[0]){
        if(state.customerPartnerUpgraded){steps[0].classList.add('v8-step-done','done');steps[0].style.opacity='1';}
        else steps[0].classList.add('v8-step-current');
      }
      if(steps[1]){
        if(state.ownAccountLinked){steps[1].classList.add('v8-step-done','done');steps[1].style.opacity='1';}
        else if(!state.customerPartnerUpgraded){steps[1].classList.add('v8-step-locked');steps[1].setAttribute('disabled','disabled');}
        else {steps[1].classList.add('v8-step-current');if(!state.explorerCriteriaBusy)steps[1].removeAttribute('disabled');}
      }
      if(!state.customerPartnerUpgraded&&!state.explorerCriteriaBusy&&steps[0]&&!ui.fastStep1PulseScheduled){
        ui.fastStep1PulseScheduled=true;pulseStep(steps[0],3200);
      }
      if(state.customerPartnerUpgraded&&!state.ownAccountLinked&&!state.explorerCriteriaBusy&&steps[1]&&!ui.fastStep2PulseScheduled){
        ui.fastStep2PulseScheduled=true;pulseStep(steps[1],1200);
      }
    }else{
      const emoji=popup.querySelector('.notice-emoji');if(emoji)emoji.textContent='🏆';
      const h2=popup.querySelector('h2');if(h2)h2.textContent='£500 Fast Start earned!';
      const stepActions=popup.querySelector('.step-actions');if(stepActions)stepActions.style.display='none';
      if(!popup.querySelector('.v8-unlock-copy')){
        const block=document.createElement('div');
        block.className='v8-unlock-copy';
        block.innerHTML='<strong>First 30-day milestone achieved.</strong><span class="unlock-line">🔓 New income streams unlocked.</span>';
        const whatsNext=popup.querySelector('.whats-next-block');
        popup.insertBefore(block,whatsNext||null);
      }
    }
  }

  function rewriteMomentumModal(popup){
    const paras=popup.querySelectorAll('p.muted');
    if(paras[0])paras[0].innerHTML="That's an <strong>extra £125</strong><br>on this customer.";
    if(paras[1])paras[1].style.display='none';
  }
  function rewriteFinalModal(popup){
    const p=popup.querySelector('p.muted');
    if(p)p.textContent='Get registered below or book a no-commitment chat.';
  }

  function enhanceModal(){
    const backdrop=document.querySelector('.notice-backdrop:not(.howpaid-overlay)');
    const popup=backdrop?.querySelector(':scope > .notice-popup');
    if(!backdrop||!popup){ui.modalKey=null;return;}
    if(popup.classList.contains('notice-hab'))rewriteHabModal(popup);
    if(popup.classList.contains('notice-faststart-setup'))rewriteFastStartModal(popup);
    if(popup.textContent.includes('Momentum Bonus unlocked'))rewriteMomentumModal(popup);
    if(popup.classList.contains('notice-final'))rewriteFinalModal(popup);
    animateModalIn(backdrop,popup);
  }

  function enhance(){enhanceActions();enhanceModal();}

  function suppressForRender(){
    const restore=[];
    const count=totalCount();

    if(count===4&&!state.habIntroDismissed&&!state.month1HabRevealComplete&&!state.habRevealInProgress&&!ui.firstHabReady){
      if(!ui.firstHabDelayScheduled){
        ui.firstHabDelayScheduled=true;setGate(true,true);
        later(()=>{ui.firstHabReady=true;setGate(false,false);render();},MAIN_MODAL_DELAY);
      }
      restore.push(['habIntroDismissed',state.habIntroDismissed]);state.habIntroDismissed=true;
    }

    if(count>=5&&!state.fastStartRevealComplete&&!state.fastStartRevealInProgress&&!state.customerPartnerUpgraded&&!state.ownAccountLinked&&!ui.fastSetupReady){
      if(!ui.fastSetupDelayScheduled){
        ui.fastSetupDelayScheduled=true;
        later(()=>{ui.fastSetupReady=true;render();},MAIN_MODAL_DELAY);
      }
      restore.push(['fastStartRevealInProgress',state.fastStartRevealInProgress]);state.fastStartRevealInProgress=true;
    }

    if(count===6&&!state.momentumIntroDismissed&&!state.momentumAppliedIds.includes('c6')&&!state.momentumRevealInProgress&&!ui.momentumModalReady){
      if(!ui.momentumModalDelayScheduled){
        ui.momentumModalDelayScheduled=true;setGate(true,true);
        later(()=>{ui.momentumModalReady=true;setGate(false,false);render();},MAIN_MODAL_DELAY);
      }
      restore.push(['momentumIntroDismissed',state.momentumIntroDismissed]);state.momentumIntroDismissed=true;
    }

    if(count>=9&&!state.month2HabRevealComplete&&!state.habRevealInProgress&&!ui.secondHabRevealStarted){
      restore.push(['month2HabIntroDismissed',state.month2HabIntroDismissed]);state.month2HabIntroDismissed=true;
    }

    if(count>=10&&state.momentumAppliedIds.includes('c10')&&!state.momentumRevealInProgress&&!state.endIntroDismissed&&!ui.finalReady){
      if(!ui.finalDelayScheduled){
        ui.finalDelayScheduled=true;
        later(()=>{ui.finalReady=true;render();},FINAL_PAUSE);
      }
      restore.push(['endIntroDismissed',state.endIntroDismissed]);state.endIntroDismissed=true;
    }

    return ()=>{for(const [key,value] of restore)state[key]=value;};
  }

  function scheduleTransitionCoaches(before,after){
    if(after.count===1&&before.count===0&&!ui.firstCustomerCoachShown){
      ui.firstCustomerCoachShown=true;
      setGate(true,true);
      pulse(columnTotals()[0],'result',120);
      scheduleCoach('<strong>First customer added</strong><span class="coach-line">3 service homeowner</span><span class="coach-money">£250 Customer Bonus</span>',{
        after:()=>later(()=>{if(totalCount()===1)pulse(addButton(),'action');},1200)
      });
    }

    if(after.count===2&&before.count===1&&!ui.customer2CoachShown){
      ui.customer2CoachShown=true;
      setGate(true,true);
      pulse(columnTotals()[0],'result',120);
      scheduleCoach('<strong>Great stuff!</strong><span class="coach-line">Another £250 for your second customer</span>');
    }

    if(after.count===3&&before.count===2&&!ui.customer3CoachShown){
      ui.customer3CoachShown=true;
      setGate(true,true);
      scheduleCoach('🔥 <strong>One more 3-service homeowner...</strong><span class="coach-line">your <strong>4th this month</strong> unlocks a new bonus 👇</span>');
    }

    if(after.m1Hab&&!before.m1Hab&&!ui.postHabCoachShown){
      ui.postHabCoachShown=true;
      setGate(true,true);
      pulse(columnTotals()[0],'result',180);
      scheduleCoach('<strong>Yes, that\'s an extra £400!</strong><span class="coach-money v8-normal-money">£1,000 ➡️ £1,400</span>',{
        after:()=>later(()=>{if(totalCount()===4)pulse(addButton(),'action');},1200)
      });
    }

    const momentumNow=new Set(state.momentumAppliedIds);
    const momentumBefore=new Set((before.momentumIds||'').split(',').filter(Boolean));
    if(momentumNow.has('c6')&&!momentumBefore.has('c6')){
      later(()=>{if(totalCount()===6)pulse(addButton(),'action');},2500);
    }

    if(momentumNow.has('c7')&&!momentumBefore.has('c7')&&!ui.customer7CoachShown){
      ui.customer7CoachShown=true;
      setGate(true,true);
      scheduleCoach('<strong>Your confidence is building!</strong><span class="coach-line">Let\'s add a few more Momentum customers</span>',{
        after:()=>{
          ui.batchReady=true;render();
          later(()=>{if(totalCount()===7)pulse(addButton(),'action');},1100);
        }
      });
    }

    if(after.m2Hab&&!before.m2Hab&&!ui.final10CoachShown){
      ui.final10CoachShown=true;
      setGate(true,true);
      pulse(columnTotals()[1],'result',220);
      scheduleCoach('🏁 <strong>One more to go</strong><span class="coach-line">Your <strong>5th customer this month</strong><br>will be your <strong>10th since starting.</strong></span>',{
        after:()=>later(()=>{if(totalCount()===9)pulse(addButton(),'action');},1100)
      });
    }
  }

  render=function(){
    const before=last;
    const current=snapshot();

    /* Gate before the DOM paints when a timed teaching moment has just been triggered. */
    if((current.count===1&&before.count===0)||(current.count===2&&before.count===1)||(current.count===3&&before.count===2)||
       (current.m1Hab&&!before.m1Hab)||(current.m2Hab&&!before.m2Hab)){
      ui.gate=true;ui.gateDim=true;
    }
    const momentumBefore=new Set((before.momentumIds||'').split(',').filter(Boolean));
    const momentumNow=new Set(state.momentumAppliedIds);
    if(momentumNow.has('c7')&&!momentumBefore.has('c7')){ui.gate=true;ui.gateDim=true;}

    const restore=suppressForRender();
    core.render();
    restore();
    enhance();
    const after=snapshot();
    scheduleTransitionCoaches(before,after);
    last=after;
  };

  addCustomer=function(){
    if(ui.gate||busy())return;
    const before=totalCount();

    if(before===7&&ui.batchReady&&!ui.batchRunning){
      captureUndo();
      runBatch89();
      return;
    }

    if(!internalCustomerAdd)captureUndo();
    core.addCustomer();
  };

  async function waitForMomentum(id){
    for(let i=0;i<160;i++){
      if(state.momentumAppliedIds.includes(id)&&!state.momentumRevealInProgress)return true;
      await sleep(100);
    }
    return false;
  }

  async function runBatch89(){
    ui.batchRunning=true;ui.batchReady=false;setGate(true,true);render();
    internalCustomerAdd=true;
    core.addCustomer();
    await waitForMomentum('c8');
    await sleep(700);
    core.addCustomer();
    await waitForMomentum('c9');
    internalCustomerAdd=false;
    ui.batchRunning=false;
    if(!ui.secondHabCoachScheduled){
      ui.secondHabCoachScheduled=true;
      setGate(true,true);
      scheduleCoach('🔥 <strong>And yes...</strong><span class="coach-line">High Activity Bonus kicks in again.</span>',{
        after:()=>{
          ui.secondHabRevealStarted=true;
          state.month2HabIntroDismissed=true;
          setGate(false,false);
          core.startHabReveal(2);
        }
      });
    }
    render();
  }

  startHabReveal=async function(month){
    if(month===2){core.startHabReveal(2);return;}
    await fadeOutMainModal();
    core.startHabReveal(1);
  };

  startMomentumReveal=async function(){
    await fadeOutMainModal();
    core.startMomentumReveal();
  };

  dismissNextIntro=async function(){
    await fadeOutMainModal();
    state.nextIntroDismissed=true;
    render();
    if(!ui.momentumPreCoachShown){
      ui.momentumPreCoachShown=true;
      setGate(true,true);
      scheduleCoach('⚡ <strong>A new bonus is now in play</strong><span class="coach-line">Unsupported <strong>3+ service homeowner customers</strong><br>can earn an <strong>extra £125</strong> in days 31-60 👇</span>',{
        after:()=>{
          pulseSection();
          later(()=>{if(totalCount()===5)pulse(addButton(),'action');},1850);
        }
      });
    }
  };

  dismissEndIntro=async function(){await fadeOutMainModal();core.dismissEndIntro();};

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
  function pulseFastStage(){
    const tile=document.querySelector('.bonus-faststart');
    if(!tile||reducedMotion)return;
    tile.classList.remove('v8-fast-stage');void tile.offsetWidth;tile.classList.add('v8-fast-stage');
    later(()=>tile.classList.remove('v8-fast-stage'),1400);
  }

  completeFirst30Step=async function(step){
    if(state.explorerCriteriaBusy||state.fastStartRevealInProgress||state.fastStartRevealComplete)return;
    if(step==='own'&&state.ownAccountLinked)return;
    if(step==='partner'&&state.customerPartnerUpgraded)return;

    state.explorerCriteriaBusy=true;ui.fastChoreography=true;
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
      ui.fastChoreography=false;ui.modalKey=null;
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
    state.explorerCriteriaBusy=false;ui.fastChoreography=false;ui.modalKey=null;
    render();
  };

  resetExplorer=function(){
    clearOwnTimers();undoStack.length=0;document.querySelector('.v8-coach')?.remove();
    Object.assign(ui,{
      gate:false,gateDim:true,firstCustomerCoachShown:false,customer2CoachShown:false,customer3CoachShown:false,
      firstHabDelayScheduled:false,firstHabReady:false,firstHabButtonPulseScheduled:false,postHabCoachShown:false,
      fastSetupDelayScheduled:false,fastSetupReady:false,fastStep1PulseScheduled:false,fastStep2PulseScheduled:false,
      fastChoreography:false,momentumPreCoachShown:false,momentumModalDelayScheduled:false,momentumModalReady:false,
      customer7CoachShown:false,batchReady:false,batchRunning:false,secondHabCoachScheduled:false,secondHabRevealStarted:false,
      final10CoachShown:false,finalDelayScheduled:false,finalReady:false,modalKey:null
    });
    core.resetExplorer();
    last=snapshot();enhance();
  };

  window.CoachingPreviewV8={
    setGate,
    pulseFirstAction(){if(totalCount()===0)pulse(addButton(),'action',80);},
    undo,
  };

  last=snapshot();
  enhance();
})();