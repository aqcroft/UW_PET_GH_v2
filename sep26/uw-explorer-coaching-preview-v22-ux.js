(function(){
  if(document.documentElement.dataset.coachingPreviewV22Ux==='1')return;
  document.documentElement.dataset.coachingPreviewV22Ux='1';

  const previousSetTimeout=window.setTimeout.bind(window);
  const count=()=>state.month1.length+state.month2.length;
  let firstCueTimer=null;
  let firstCueBouncing=false;
  let firstCueAllowed=false;
  let habPostCoachRefreshTimer=null;
  let firstCustomerStageActive=false;
  let firstCustomerStageTimer=null;
  let phase2BridgeRunning=false;

  window.setTimeout=function(fn,delay,...args){
    const n=count();
    const coach=document.querySelector('.v9-coach');

    // Slightly quicker coaching rhythm than v21.
    if(delay===2200&&!coach){
      if(n===1)delay=1150;
      else if(n===2)delay=950;
      else if(n===3)delay=800;
      else delay=1350;
    }

    if(coach&&delay===3500){
      if(n===1)delay=2750;
      else if(n===2)delay=2250;
      else if(n===3)delay=2050;
      else delay=3100;
    }
    if(coach&&delay===3950){
      if(n===1)delay=3200;
      else if(n===2)delay=2700;
      else if(n===3)delay=2500;
      else delay=3550;
    }

    // Bring the principal timed milestone modals in a touch sooner.
    if(delay===1200){
      const firstHab=n===4&&!state.habIntroDismissed&&!state.month1HabRevealComplete&&!state.habRevealInProgress;
      const fastStart=n>=5&&!state.fastStartRevealComplete&&!state.fastStartRevealInProgress&&!state.customerPartnerUpgraded&&!state.ownAccountLinked;
      const momentum=n===6&&!state.momentumIntroDismissed&&!state.momentumAppliedIds.includes('c6')&&!state.momentumRevealInProgress;
      if(firstHab||fastStart||momentum)delay=1000;
    }
    if(delay===5000&&n>=10)delay=4500;

    return previousSetTimeout(fn,delay,...args);
  };

  const style=document.createElement('style');
  style.textContent=`
    .v9-back-step{display:none!important}

    .add-customer-solo-row{position:relative}
    @keyframes v22FirstCueBounce{
      0%,100%{transform:translateX(-50%) translateY(0)}
      50%{transform:translateX(-50%) translateY(6px)}
    }
    .v22-first-customer-cue{
      position:absolute;left:50%;top:-2.55rem;z-index:8;
      text-align:center;font-size:2rem;line-height:1;
      transform:translateX(-50%);pointer-events:none
    }
    .v22-first-customer-cue.is-bouncing{
      animation:v22FirstCueBounce .9s ease-in-out infinite
    }
    .add-customer-solo-row.v22-row-suppressed{
      visibility:hidden!important;pointer-events:none!important
    }
    .customer-column-first.v22-initial-column-passive{
      opacity:.4!important;filter:saturate(.55)!important;pointer-events:none!important;
      transition:opacity .55s ease,filter .55s ease!important
    }
    .hero.v22-first-stage-awake{
      opacity:1!important;filter:none!important;
      transition:opacity .55s ease,filter .55s ease!important
    }
    .add-customer-main.v22-first-stage-wait{
      pointer-events:none!important;cursor:default!important
    }

    .notice-faststart-setup.v22-fast-earned-clean h2{
      margin:.28rem 0 0!important;
      font-size:1.42rem!important;
      line-height:1.14!important;
      font-weight:950!important
    }
    .notice-faststart-setup.v22-fast-earned-clean .v9-unlock-copy{
      margin:1.3rem 0 1.05rem!important;
      line-height:1.35!important
    }
    .notice-faststart-setup.v22-fast-earned-clean .v22-momentum-unlocked{
      display:block;
      font-size:1.04rem;
      line-height:1.3;
      font-weight:900;
      text-align:center
    }
    .notice-faststart-setup.v22-fast-earned-clean .whats-next-title{
      display:none!important
    }
    .notice-faststart-setup.v22-fast-earned-clean .whats-next-block{
      margin-top:.45rem!important
    }
    .notice-faststart-setup.v22-fast-earned-clean .or-divider{
      margin:.72rem 0 .62rem!important;
      text-transform:none!important;
      letter-spacing:0!important
    }

    .v22-auto-note{
      margin:.25rem auto .48rem;
      width:fit-content;max-width:calc(100% - 1rem);
      padding:.38rem .62rem;border-radius:.58rem;
      background:#f4f8fc;border:1px solid rgba(29,79,145,.16);
      color:#33445d;font-size:.78rem;font-weight:850;line-height:1.3;text-align:center
    }
    .notice-hab .v22-auto-note{background:#fff8ee;border-color:rgba(214,142,32,.24);color:#704716}
    .add-customer-main .add-label-sub.v22-watch{font-weight:850!important;opacity:.95!important}
    .add-customer-main.v22-auto-running{pointer-events:none!important;cursor:default!important}
    .add-customer-main.v22-phase2-wait{pointer-events:none!important;opacity:.52!important}
    .v22-momentum-bridge .v22-bridge-icon{
      display:block;font-size:2rem;line-height:1;margin-bottom:.55rem
    }
    .v22-momentum-bridge .v22-bridge-line{
      display:block;margin-top:.34rem;line-height:1.4
    }
    @media(prefers-reduced-motion:reduce){.v22-first-customer-cue.is-bouncing{animation:none!important}}
  `;
  document.head.appendChild(style);

  function setButtonCopy(btn,mainText,subText,iconText){
    const main=btn?.querySelector('.add-label-main');
    const sub=btn?.querySelector('.add-label-sub');
    const icon=btn?.querySelector('.add-label-icon');
    if(main&&main.textContent!==mainText)main.textContent=mainText;
    if(sub){
      if(sub.textContent!==subText)sub.textContent=subText;
      sub.classList.toggle('v22-watch',/watch|automatic/i.test(subText));
    }
    if(icon&&typeof iconText==='string'&&icon.textContent!==iconText)icon.textContent=iconText;
  }

  function ensureFirstCue(){
    const n=count();
    document.querySelectorAll('.v22-first-customer-cue').forEach(el=>{if(n>0||!firstCueAllowed)el.remove();});
    if(n!==0||!firstCueAllowed)return;

    const row=document.querySelector('.add-customer-solo-row');
    if(!row)return;
    let cue=row.querySelector(':scope > .v22-first-customer-cue');
    if(!cue){
      cue=document.createElement('div');
      cue.className='v22-first-customer-cue';
      cue.setAttribute('aria-hidden','true');
      cue.textContent='👇';
      row.appendChild(cue);
    }
    cue.classList.toggle('is-bouncing',firstCueBouncing);

    if(!firstCueTimer&&!firstCueBouncing){
      firstCueTimer=previousSetTimeout(()=>{
        firstCueTimer=null;
        firstCueBouncing=true;
        ensureFirstCue();
      },1400);
    }
  }

  function refineInitialColumn(){
    const column=document.querySelector('.customer-column-first');
    if(!column)return;
    column.classList.toggle('v22-initial-column-passive',count()===0&&!firstCustomerStageActive);
  }

  function setFirstCustomerStage(active){
    firstCustomerStageActive=!!active;
    const hero=document.querySelector('.hero');
    if(hero)hero.classList.toggle('v22-first-stage-awake',firstCustomerStageActive);
    refineInitialColumn();
    const btn=document.querySelector('.add-customer-main');
    if(btn)btn.classList.toggle('v22-first-stage-wait',firstCustomerStageActive);
  }

  function removeBack(){
    document.querySelectorAll('.v9-back-step').forEach(el=>el.remove());
  }

  function habResultCoachVisible(){
    const coach=document.querySelector('.v9-coach');
    if(!coach)return false;
    const text=(coach.textContent||'').replace(/\s+/g,' ').trim();
    return text.includes('High Activity Bonus Applied')&&text.includes('£1,000')&&text.includes('£1,400');
  }

  function suppressActionDuringHabResult(){
    const row=document.querySelector('.add-customer-solo-row');
    if(!row)return;
    const visible=habResultCoachVisible();
    row.classList.toggle('v22-row-suppressed',visible);

    if(visible&&!habPostCoachRefreshTimer){
      // v16 clears its internal HAB hold at 3950ms. Re-run v22 just after that
      // so the temporary "Getting bonus ready" state can never become sticky.
      habPostCoachRefreshTimer=previousSetTimeout(()=>{
        habPostCoachRefreshTimer=null;
        suppressActionDuringHabResult();
        refineAddButton();
      },4100);
    }
  }

  function simplifyFastStartSetup(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup||state.fastStartRevealComplete)return;

    const h2=popup.querySelector('h2');
    if(h2&&h2.textContent!=='In your first 30 days')h2.textContent='In your first 30 days';

    const copy=popup.querySelector('.faststart-copy');
    if(copy){
      const desired='<strong>6 customers + 1 Partner unlocks £500</strong><br><br>Complete these two steps:';
      if(copy.innerHTML!==desired)copy.innerHTML=desired;
    }
  }

  function simplifyFastStartEarned(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup||!state.fastStartRevealComplete)return;

    popup.classList.add('v22-fast-earned-clean');

    const h2=popup.querySelector('h2');
    if(h2&&h2.textContent!=='£500 earned!')h2.textContent='£500 earned!';

    const stepActions=popup.querySelector('.step-actions');
    if(stepActions)stepActions.style.display='none';

    let block=popup.querySelector('.v9-unlock-copy');
    if(!block){
      block=document.createElement('div');
      block.className='v9-unlock-copy';
      const whatsNext=popup.querySelector('.whats-next-block');
      popup.insertBefore(block,whatsNext||null);
    }
    const desired='<span class="v22-momentum-unlocked">⚡ <strong>Momentum Bonus unlocked</strong></span>';
    if(block.innerHTML!==desired)block.innerHTML=desired;

    const whatsNextTitle=popup.querySelector('.whats-next-title');
    if(whatsNextTitle)whatsNextTitle.style.display='none';

    const divider=popup.querySelector('.or-divider');
    if(divider&&divider.textContent!=='or keep exploring')divider.textContent='or keep exploring';

    const explore=Array.from(popup.querySelectorAll('button')).find(b=>/Explore days 31-60|Supporting Bonuses/i.test(b.textContent));
    if(explore){
      let main=explore.querySelector('span');
      if(!main){main=document.createElement('span');explore.prepend(main);}
      if(main.textContent!=='🔍 Explore days 31-60')main.textContent='🔍 Explore days 31-60';
      let small=explore.querySelector('small');
      if(!small){small=document.createElement('small');explore.appendChild(small);}
      if(small.textContent!=='See Momentum Bonus in action')small.textContent='See Momentum Bonus in action';
    }
  }

  function removeFourthCustomerCoachPointer(){
    if(count()!==3)return;
    document.querySelectorAll('.v9-coach').forEach(coach=>{
      const text=(coach.textContent||'').replace(/\s+/g,' ').trim();
      if(/One more 3-service homeowner|add (?:a |the )?4th|fourth customer/i.test(text)){
        coach.querySelectorAll('.v12-pointer').forEach(pointer=>pointer.remove());
      }
    });
  }

  function refineHabModal(){
    const popup=document.querySelector('.notice-popup.notice-hab');
    if(!popup)return;
    const heading=popup.querySelector('.milestone-heading');
    const copy=popup.querySelector('p.muted');
    const isFirst=heading&&/High Activity Bonus unlocked!/i.test(heading.textContent)&&!/again/i.test(heading.textContent);
    if(isFirst&&copy){
      const desired='<strong>4+ 3-service homeowners</strong><br>in one calendar month<br><br><strong>+£100 on every qualifying customer</strong>';
      if(copy.innerHTML!==desired)copy.innerHTML=desired;
    }

    const btn=Array.from(popup.querySelectorAll('button')).find(b=>/Apply High Activity Bonus/i.test(b.textContent));
    if(!btn)return;

    let note=popup.querySelector('.v22-auto-note');
    if(!note){
      note=document.createElement('div');
      note.className='v22-auto-note';
      note.textContent='▶️ Tap once - then just watch the bonus apply.';
      btn.parentNode.insertBefore(note,btn);
    }
  }

  function positionPhase2Coach(coach){
    const btn=document.querySelector('.add-customer-main');
    const rect=btn?.getBoundingClientRect();
    const height=coach.offsetHeight||100;
    let top=rect?rect.top-height-14:window.innerHeight-height-150;
    top=Math.max(110,Math.min(top,window.innerHeight-height-76));
    coach.style.top=`${Math.round(top)}px`;
  }

  async function runPhase2Bridge(){
    if(phase2BridgeRunning)return;
    phase2BridgeRunning=true;

    const backdrop=document.querySelector('.notice-backdrop:not(.howpaid-overlay)');
    if(backdrop){
      backdrop.classList.remove('v9-modal-enter');
      backdrop.classList.add('v9-modal-exit');
      await new Promise(resolve=>previousSetTimeout(resolve,420));
    }

    state.nextIntroDismissed=true;
    render();

    const btn=document.querySelector('.add-customer-main');
    if(btn)btn.classList.add('v22-phase2-wait');

    const coach=document.createElement('div');
    coach.className='v9-coach v9-coach-green v22-momentum-bridge';
    coach.setAttribute('role','status');
    coach.setAttribute('aria-live','polite');
    coach.innerHTML='<span class="v22-bridge-icon">⚡</span><strong>Momentum Bonus rewards independence</strong><span class="v22-bridge-line">Add your 6th customer<br>to see it in action</span>';
    document.body.appendChild(coach);
    requestAnimationFrame(()=>{positionPhase2Coach(coach);coach.classList.add('show');});

    previousSetTimeout(()=>coach.classList.remove('show'),2250);
    previousSetTimeout(()=>{
      coach.remove();
      phase2BridgeRunning=false;
      const liveBtn=document.querySelector('.add-customer-main');
      if(liveBtn)liveBtn.classList.remove('v22-phase2-wait');
      refineAll();
    },2650);
  }

  function refineAddButton(){
    const btn=document.querySelector('.add-customer-main');
    if(!btn)return;
    suppressActionDuringHabResult();
    if(habResultCoachVisible())return;
    const n=count();
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim();

    btn.classList.remove('v22-auto-running');

    if(state.habRevealInProgress){
      setButtonCopy(btn,'Applying High Activity Bonus…','Automatic - just watch 👀','🔥');
      btn.classList.add('v22-auto-running');
      return;
    }

    if(state.momentumRevealInProgress){
      setButtonCopy(btn,'Applying Momentum Bonus…','Automatic - just watch 👀','⚡');
      btn.classList.add('v22-auto-running');
      return;
    }

    if(btn.classList.contains('v16-batch-processing')||/Adding customers/i.test(text)){
      setButtonCopy(btn,'Adding customers automatically…','Just watch 👀','');
      btn.classList.add('v22-auto-running');
      return;
    }

    if(btn.classList.contains('v16-hold-action')){
      if(n===4){
        setButtonCopy(btn,'Getting bonus ready…','Just watch 👀','🔥');
        btn.classList.add('v22-auto-running');
        return;
      }
      if(n===6){
        setButtonCopy(btn,'Getting next step ready…','Just watch 👀','');
        btn.classList.add('v22-auto-running');
        return;
      }
    }

    if(/Add a few/i.test(text)||n===6&&state.momentumAppliedIds?.includes('c6')){
      setButtonCopy(btn,'Add a few customers','Tap once - next few are automatic','👥');
      let row=btn.closest('.add-customer-solo-row');
      if(row&&!row.previousElementSibling?.classList.contains('v22-auto-note')){
        const note=document.createElement('div');
        note.className='v22-auto-note';
        note.textContent='▶️ One tap starts the next sequence - then just watch.';
        row.parentNode.insertBefore(note,row);
      }
      return;
    }

    const row=btn.closest('.add-customer-solo-row');
    const prev=row?.previousElementSibling;
    if(prev?.classList.contains('v22-auto-note'))prev.remove();

    if(n===0){
      setButtonCopy(btn,'Add 1st','customer','🏡');
    }else if(n<10){
      setButtonCopy(btn,'Add next customer','','🏡');
    }
  }

  function installFirstCueGate(){
    const api=window.CoachingPreviewV12;
    if(!api||api.__v22CueGateInstalled)return;
    const original=api.activateFirstAction?.bind(api);
    if(typeof original!=='function')return;
    api.activateFirstAction=function(){
      const result=original();
      firstCueAllowed=true;
      firstCueBouncing=false;
      if(firstCueTimer){clearTimeout(firstCueTimer);firstCueTimer=null;}
      ensureFirstCue();
      return result;
    };
    api.__v22CueGateInstalled=true;
  }

  function refineAll(){
    installFirstCueGate();
    removeBack();
    refineInitialColumn();
    ensureFirstCue();
    removeFourthCustomerCoachPointer();
    refineHabModal();
    simplifyFastStartSetup();
    simplifyFastStartEarned();
    suppressActionDuringHabResult();
    refineAddButton();
  }

  const previousDismissNextIntroV22=dismissNextIntro;
  dismissNextIntro=function(){
    return runPhase2Bridge();
  };

  const existingAddCustomerV22=addCustomer;
  addCustomer=function(...args){
    if(count()===0&&!firstCustomerStageActive){
      setFirstCustomerStage(true);
      if(firstCustomerStageTimer)return;
      firstCustomerStageTimer=previousSetTimeout(()=>{
        firstCustomerStageTimer=null;
        const result=existingAddCustomerV22.apply(this,args);
        firstCustomerStageActive=false;
        const hero=document.querySelector('.hero');
        if(hero)hero.classList.remove('v22-first-stage-awake');
        refineAll();
        return result;
      },1000);
      return;
    }
    if(firstCustomerStageActive)return;
    return existingAddCustomerV22.apply(this,args);
  };

  const existingRender=render;
  render=function(){
    existingRender();
    refineAll();
  };

  document.addEventListener('click',event=>{
    const add=event.target.closest?.('.add-customer-main');
    if(add&&count()===0){
      firstCueBouncing=false;
      firstCueAllowed=false;
      if(firstCueTimer){clearTimeout(firstCueTimer);firstCueTimer=null;}
      document.querySelectorAll('.v22-first-customer-cue').forEach(el=>el.remove());
    }
  },true);

  const observer=new MutationObserver(()=>refineAll());
  observer.observe(document.body,{childList:true,subtree:true});

  refineAll();
})();