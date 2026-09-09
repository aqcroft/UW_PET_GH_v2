(function(){
  if(document.documentElement.dataset.coachingPreviewV6==='1')return;
  document.documentElement.dataset.coachingPreviewV6='1';

  const sleep=(ms)=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const COACH_HOLD=3500;
  const COACH_FADE=450;
  const FAST_START_REWARD_PAUSE=3000;
  let customer3CoachShown=false;

  function totalCount(){return state.month1.length+state.month2.length;}
  function addButton(){return document.querySelector('.add-customer-main:not([disabled])')||document.querySelector('.add-customer-main');}

  function positionCoach(el){
    if(!el||!el.isConnected)return;
    const btn=addButton();
    const rect=btn?.getBoundingClientRect();
    const height=el.offsetHeight||90;
    let top=rect?rect.top-height-14:window.innerHeight-height-150;
    top=Math.max(110,Math.min(top,window.innerHeight-height-76));
    el.style.top=`${Math.round(top)}px`;
  }

  function showCustomer3Coach(){
    document.querySelector('.v6-customer3-coach')?.remove();
    window.CoachingPreviewV4?.setGate(true);
    const el=document.createElement('div');
    el.className='v4-coach v6-customer3-coach';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML='<strong>Your 4th 3-service homeowner</strong><span class="coach-line"><strong>this month unlocks a new bonus 👇</strong></span>';
    document.body.appendChild(el);
    requestAnimationFrame(()=>{
      positionCoach(el);
      el.classList.add('show');
    });
    window.setTimeout(()=>el.classList.remove('show'),COACH_HOLD);
    window.setTimeout(()=>{
      el.remove();
      window.CoachingPreviewV4?.setGate(false);
    },COACH_HOLD+COACH_FADE);
  }

  window.addEventListener('resize',()=>document.querySelectorAll('.v6-customer3-coach').forEach(positionCoach));

  /* Add the agreed coaching cue after customer 3, without any observer watching class changes. */
  const addCustomerV4=addCustomer;
  addCustomer=function(){
    const before=totalCount();
    addCustomerV4();
    const after=totalCount();
    if(before===2&&after===3&&!customer3CoachShown){
      customer3CoachShown=true;
      window.setTimeout(showCustomer3Coach,450);
    }
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

  /* Same three-stage Fast Start choreography as v4, with the shorter reward pause. */
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

  const resetV4=resetExplorer;
  resetExplorer=function(){
    customer3CoachShown=false;
    document.querySelector('.v6-customer3-coach')?.remove();
    resetV4();
  };
})();