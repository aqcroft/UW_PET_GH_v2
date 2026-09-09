(function(){
  if(document.documentElement.dataset.coachingPreviewV7==='1')return;
  document.documentElement.dataset.coachingPreviewV7='1';

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const COACH_HOLD=3500;
  const COACH_FADE=450;
  const FAST_START_REWARD_PAUSE=2000;
  const MAIN_MODAL_FADE=500;
  const FIRST_MODAL_DELAY=1200;
  let customer3CoachShown=false;
  let lastModalKey=null;

  const style=document.createElement('style');
  style.textContent=`
    /* Softer static Fast Start hierarchy. Completed steps remain fully solid. */
    .v4-step-current{opacity:.42!important;filter:none!important}
    .v4-step-locked{opacity:.18!important;filter:saturate(.28);pointer-events:none!important}
    @keyframes v7StepPulse{
      0%,100%{opacity:.42;transform:scale(1);box-shadow:0 0 0 rgba(29,79,145,0)}
      45%{opacity:.80;transform:scale(1.018);box-shadow:0 0 0 .32rem rgba(29,79,145,.14)}
    }
    .v4-step-current.v4-step-pulse{animation:v7StepPulse 1.25s ease-in-out 1 both!important}
    .v4-step-done,.step-button.done.v4-step-done{opacity:1!important;filter:none!important}

    /* Main modal entrance/exit motion. Timed coaching cards are intentionally excluded. */
    @keyframes v7BackdropIn{from{opacity:0}to{opacity:1}}
    @keyframes v7PopupIn{
      from{opacity:0;transform:translateY(12px) scale(.985)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }
    .notice-backdrop.v7-modal-enter{animation:v7BackdropIn .48s ease both}
    .notice-backdrop.v7-modal-enter>.notice-popup{animation:v7PopupIn .48s cubic-bezier(.22,.8,.32,1) both}
    .notice-backdrop.v7-delayed-enter>.notice-popup{
      opacity:0;transform:translateY(12px) scale(.985);
      transition:opacity .48s ease,transform .48s cubic-bezier(.22,.8,.32,1)
    }
    .notice-backdrop.v7-delayed-enter.v7-delayed-enter-show>.notice-popup{
      opacity:1;transform:translateY(0) scale(1)
    }
    .notice-backdrop.v7-modal-exit{
      opacity:0!important;pointer-events:none!important;
      transition:opacity .5s ease!important
    }
    .notice-backdrop.v7-modal-exit>.notice-popup{
      opacity:0!important;transform:translateY(10px) scale(.985)!important;
      transition:opacity .5s ease,transform .5s cubic-bezier(.4,0,.2,1)!important
    }
    @media(prefers-reduced-motion:reduce){
      .notice-backdrop.v7-modal-enter,.notice-backdrop.v7-modal-enter>.notice-popup,
      .notice-backdrop.v7-delayed-enter>.notice-popup,.notice-backdrop.v7-modal-exit,
      .notice-backdrop.v7-modal-exit>.notice-popup,.v4-step-current.v4-step-pulse{animation:none!important;transition:none!important}
    }
  `;
  document.head.appendChild(style);

  function totalCount(){return state.month1.length+state.month2.length;}
  function addButton(){return document.querySelector('.add-customer-main:not([disabled])')||document.querySelector('.add-customer-main');}
  function columns(){return Array.from(document.querySelectorAll('.customer-column'));}

  function pulseAction(el){
    if(!el||reducedMotion)return;
    el.classList.remove('v4-action-pulse');
    void el.offsetWidth;
    el.classList.add('v4-action-pulse');
    window.setTimeout(()=>el.classList.remove('v4-action-pulse'),1200);
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

  function showTimedCoach(html,{after=null}={}){
    document.querySelector('.v7-coach')?.remove();
    window.CoachingPreviewV4?.setGate(true);
    const el=document.createElement('div');
    el.className='v4-coach v7-coach';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML=html;
    document.body.appendChild(el);
    requestAnimationFrame(()=>{positionCoach(el);el.classList.add('show');});
    window.setTimeout(()=>el.classList.remove('show'),COACH_HOLD);
    window.setTimeout(()=>{
      el.remove();
      window.CoachingPreviewV4?.setGate(false);
      if(typeof after==='function')after();
    },COACH_HOLD+COACH_FADE);
  }

  window.addEventListener('resize',()=>document.querySelectorAll('.v7-coach').forEach(positionCoach));

  function showCustomer3Coach(){
    showTimedCoach('🔥 <strong>One more 3-service homeowner...</strong><span class="coach-line"><strong>your 4th this month unlocks a new bonus 👇</strong></span>');
  }

  function showMomentumPreCoach(){
    showTimedCoach('⚡ <strong>A new bonus is now in play</strong><span class="coach-line">Unsupported <strong>3+ service homeowner customers</strong><br>can earn an extra bonus in days 31-60 👇</span>',{
      after:()=>{
        const target=columns()[1];
        if(target&&!reducedMotion){
          target.classList.remove('v4-section-pulse');
          void target.offsetWidth;
          target.classList.add('v4-section-pulse');
          window.setTimeout(()=>target.classList.remove('v4-section-pulse'),1600);
        }
        window.setTimeout(()=>{if(totalCount()===5)pulseAction(addButton());},1850);
      }
    });
  }

  /* Explicit safety: no customer can be added whilst any timed coach is visible. */
  const addCustomerV4=addCustomer;
  addCustomer=function(){
    if(document.querySelector('.v4-coach,.v7-coach'))return;
    const before=totalCount();
    addCustomerV4();
    const after=totalCount();
    if(before===2&&after===3&&!customer3CoachShown){
      customer3CoachShown=true;
      window.setTimeout(showCustomer3Coach,450);
    }
  };

  function modalKey(popup){
    if(!popup)return null;
    if(popup.classList.contains('notice-final'))return 'final';
    if(popup.classList.contains('notice-faststart-setup'))return state.fastStartRevealComplete?'fast-earned':'fast-setup';
    if(popup.classList.contains('notice-hab'))return popup.textContent.includes('again')?'hab-2':'hab-1';
    if(popup.textContent.includes('Momentum Bonus unlocked'))return 'momentum';
    return 'main';
  }

  function rewriteMomentumRewardModal(){
    const popup=Array.from(document.querySelectorAll('.notice-popup')).find(el=>el.textContent.includes('Momentum Bonus unlocked'));
    if(!popup)return;
    const paras=popup.querySelectorAll('p.muted');
    if(paras[0])paras[0].innerHTML="That's an <strong>extra £125</strong><br>on this customer.";
    if(paras[1])paras[1].style.display='none';
  }

  function decorateModal(){
    rewriteMomentumRewardModal();
    const backdrop=document.querySelector('.notice-backdrop:not(.howpaid-overlay)');
    const popup=backdrop?.querySelector(':scope > .notice-popup');
    if(!backdrop||!popup){lastModalKey=null;return;}
    const key=modalKey(popup);
    if(key===lastModalKey)return;
    lastModalKey=key;

    /* First HAB and first Fast Start setup are already deliberately delayed by v4. Float the card up at the reveal point. */
    const delayed=(key==='hab-1'||key==='fast-setup')&&backdrop.style.opacity==='0';
    if(delayed){
      backdrop.classList.add('v7-delayed-enter');
      window.setTimeout(()=>{
        if(backdrop.isConnected)backdrop.classList.add('v7-delayed-enter-show');
      },FIRST_MODAL_DELAY);
    }else{
      backdrop.classList.add('v7-modal-enter');
      window.setTimeout(()=>backdrop.classList.remove('v7-modal-enter'),600);
    }
  }

  async function fadeOutMainModal(){
    const backdrop=document.querySelector('.notice-backdrop:not(.howpaid-overlay)');
    if(!backdrop)return;
    backdrop.classList.remove('v7-modal-enter');
    backdrop.classList.add('v7-modal-exit');
    await sleep(reducedMotion?0:MAIN_MODAL_FADE);
  }

  /* Give main action modals the same deliberate fade-away motion before their state changes. */
  const startHabRevealV4=startHabReveal;
  startHabReveal=async function(month){
    await fadeOutMainModal();
    startHabRevealV4(month);
  };

  const startMomentumRevealV4=startMomentumReveal;
  startMomentumReveal=async function(){
    await fadeOutMainModal();
    startMomentumRevealV4();
  };

  const dismissEndIntroV4=dismissEndIntro;
  dismissEndIntro=async function(){
    await fadeOutMainModal();
    dismissEndIntroV4();
  };

  const dismissFastStartAwardV4=dismissFastStartAward;
  dismissFastStartAward=async function(){
    await fadeOutMainModal();
    dismissFastStartAwardV4();
  };

  /* Replace v4's immediate Days 31-60 cue with a short pre-Momentum teaching card. */
  dismissNextIntro=async function(){
    await fadeOutMainModal();
    state.nextIntroDismissed=true;
    render();
    window.setTimeout(showMomentumPreCoach,650);
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
    tile.classList.remove('v4-fast-stage');
    void tile.offsetWidth;
    tile.classList.add('v4-fast-stage');
    window.setTimeout(()=>tile.classList.remove('v4-fast-stage'),1400);
  }

  /* Same three-stage Fast Start sequence, now with a 2-second reward pause. */
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

  /* Decorate newly rendered main modals after v4 has rewritten their content/state. */
  const renderV4=render;
  render=function(){
    renderV4();
    decorateModal();
  };

  const resetV4=resetExplorer;
  resetExplorer=function(){
    customer3CoachShown=false;
    lastModalKey=null;
    document.querySelector('.v7-coach')?.remove();
    resetV4();
  };

  decorateModal();
})();
