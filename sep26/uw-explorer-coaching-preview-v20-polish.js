(function(){
  if(document.documentElement.dataset.coachingPreviewV20Polish==='1')return;
  document.documentElement.dataset.coachingPreviewV20Polish='1';

  const style=document.createElement('style');
  style.textContent=`
    /* Bring timed coach typography closer to the tap-away modal typography. */
    .v9-coach{
      font-family:inherit!important;
      font-size:.94rem!important;
      line-height:1.46!important;
      letter-spacing:normal!important;
    }
    .v9-coach strong{font-weight:900!important}
    .v9-coach .coach-line,
    .v9-coach .v19-cue-line,
    .v9-coach .v18-line,
    .v9-coach .v19-hab-amount{
      font-size:.94rem!important;
      line-height:1.46!important;
    }

    /* Fast Start earned teaching block. */
    .notice-faststart-setup .v20-unlock-icon{
      display:block;
      font-size:1.85rem;
      line-height:1;
      text-align:center;
      margin:.1rem 0 .55rem;
    }
    .notice-faststart-setup .v20-unlock-message{
      display:block;
      text-align:center;
      line-height:1.45;
      font-weight:900;
    }
    .notice-faststart-setup .v20-unlock-bonus{
      display:block;
      text-align:center;
      margin-top:.14rem;
      line-height:1.45;
      font-weight:900;
    }
  `;
  document.head.appendChild(style);

  function refineHabTeachingModal(){
    const popup=document.querySelector('.notice-popup.notice-hab');
    if(!popup)return;
    const heading=popup.querySelector('.milestone-heading')?.textContent||'';
    if(!/High Activity Bonus unlocked!/i.test(heading)||/again/i.test(heading))return;
    const p=popup.querySelector('p.muted');
    if(!p)return;
    const desired="Now you've introduced<br><strong>FOUR 3-service homeowners</strong><br>in one calendar month<br><br>That's an <strong>extra £100</strong><br>on <em>every</em> qualifying customer.";
    if(p.innerHTML!==desired)p.innerHTML=desired;
  }

  function refineFastStartEarned(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup||!state.fastStartRevealComplete)return;
    const block=popup.querySelector('.v9-unlock-copy');
    if(block&&block.dataset.v20Unlock!=='1'){
      block.dataset.v20Unlock='1';
      block.innerHTML='<strong>First 30-day milestone achieved.</strong><span class="v20-unlock-icon">🔓</span><span class="v20-unlock-message">New income stream unlocked:</span><span class="v20-unlock-bonus">Momentum Bonus</span>';
    }
  }

  function refineFinalModal(){
    const popup=document.querySelector('.notice-final');
    if(!popup)return;
    const p=popup.querySelector('p.muted');
    if(!p)return;
    p.innerHTML='This is just an example.<br><br><strong>What would another £4,000-£5,000<br>mean to you over the next 60 days?</strong>';
  }

  function refineAfterRender(){
    refineHabTeachingModal();
    refineFastStartEarned();
    refineFinalModal();
  }

  const previousRender=render;
  render=function(){
    previousRender();
    refineAfterRender();
  };

  const observer=new MutationObserver(records=>{
    let relevant=false;
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches?.('.notice-popup')||node.querySelector?.('.notice-popup'))relevant=true;
      }
    }
    if(relevant)refineAfterRender();
  });
  observer.observe(document.body,{childList:true});

  refineAfterRender();
})();
