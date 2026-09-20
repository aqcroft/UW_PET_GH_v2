(function(){
  if(document.documentElement.dataset.coachingPreviewV22Ux==='1')return;
  document.documentElement.dataset.coachingPreviewV22Ux='1';

  const previousSetTimeout=window.setTimeout.bind(window);
  const count=()=>state.month1.length+state.month2.length;
  let firstCueTimer=null;
  let firstCueBouncing=false;

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
    document.querySelectorAll('.v22-first-customer-cue').forEach(el=>{if(n>0)el.remove();});
    if(n!==0)return;

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
    row.classList.toggle('v22-row-suppressed',habResultCoachVisible());
  }

  function refineHabModal(){
    const popup=document.querySelector('.notice-popup.notice-hab');
    if(!popup)return;
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

  function refineAll(){
    removeBack();
    ensureFirstCue();
    refineHabModal();
    suppressActionDuringHabResult();
    refineAddButton();
  }

  const existingRender=render;
  render=function(){
    existingRender();
    refineAll();
  };

  document.addEventListener('click',event=>{
    const add=event.target.closest?.('.add-customer-main');
    if(add&&count()===0){
      firstCueBouncing=false;
      if(firstCueTimer){clearTimeout(firstCueTimer);firstCueTimer=null;}
      document.querySelectorAll('.v22-first-customer-cue').forEach(el=>el.remove());
    }
  },true);

  const observer=new MutationObserver(()=>refineAll());
  observer.observe(document.body,{childList:true,subtree:true});

  refineAll();
})();