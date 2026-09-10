(function(){
  if(document.documentElement.dataset.coachingPreviewV19Polish==='1')return;
  document.documentElement.dataset.coachingPreviewV19Polish='1';

  const style=document.createElement('style');
  style.textContent=`
    /* Both High Activity timed coaches get a little more room to breathe. */
    .v9-coach.v19-hab-roomy{
      padding:1.12rem 1.08rem 1.28rem!important;
      line-height:1.44!important;
    }
    .v9-coach.v19-hab-result .v19-hab-title{
      display:block;
      margin-bottom:.82rem;
    }
    .v9-coach.v19-hab-result .v19-hab-amount{
      display:block;
      margin-top:0;
      font-size:1rem;
      font-weight:600;
      line-height:1.4;
    }
    .v9-coach.v19-hab-again{
      padding-bottom:1.4rem!important;
    }

    .v9-coach.v19-momentum-cue .v19-lightning{
      display:block;
      font-size:2.05rem;
      line-height:1;
      margin-bottom:.52rem;
      text-align:center;
    }
    .v9-coach.v19-momentum-cue .v19-cue-line{
      display:block;
      margin-top:.28rem;
      line-height:1.38;
    }
    .v9-coach.v19-momentum-cue .v19-pointer{
      display:block;
      font-size:1.95rem;
      line-height:1;
      margin-top:.62rem;
      text-align:center;
    }
  `;
  document.head.appendChild(style);

  function refineHabTeachingModal(){
    const popup=document.querySelector('.notice-popup.notice-hab');
    if(!popup||popup.dataset.v19HabTeaching==='1')return;
    const heading=popup.querySelector('.milestone-heading')?.textContent||'';
    if(!/High Activity Bonus unlocked!/i.test(heading)||/again/i.test(heading))return;
    const p=popup.querySelector('p.muted');
    if(!p)return;
    p.innerHTML="Now you've introduced<br><strong>FOUR 3-service homeowners</strong>";
    popup.dataset.v19HabTeaching='1';
  }

  function refineFastStartAward(){
    const popup=document.querySelector('.notice-faststart-setup');
    if(!popup||!state.fastStartRevealComplete)return;

    const unlock=popup.querySelector('.unlock-line');
    if(unlock&&unlock.textContent!=='🔓 New income stream unlocked: Momentum Bonus'){
      unlock.textContent='🔓 New income stream unlocked: Momentum Bonus';
    }

    const explore=Array.from(popup.querySelectorAll('button')).find(b=>/Explore days 31-60/i.test(b.textContent));
    if(explore){
      const main=explore.querySelector('span');
      if(main&&main.textContent!=='🔍 Explore days 31-60')main.textContent='🔍 Explore days 31-60';
      let small=explore.querySelector('small');
      if(!small){small=document.createElement('small');explore.appendChild(small);}
      if(small.textContent!=='See Momentum Bonus in action')small.textContent='See Momentum Bonus in action';
    }
  }

  function refineBatchButton(){
    const btn=document.querySelector('.add-customer-main');
    if(!btn)return;
    const main=btn.querySelector('.add-label-main');
    const sub=btn.querySelector('.add-label-sub');
    const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
    if(/Adding customers/i.test(text)&&/Applying Momentum/i.test(text)){
      if(main&&main.textContent!=='Adding customers')main.textContent='Adding customers';
      if(sub&&sub.textContent!=='Applying Momentum')sub.textContent='Applying Momentum';
      const icon=btn.querySelector('.add-label-icon');
      if(icon&&icon.innerHTML!=='')icon.innerHTML='';
    }
  }

  function refineAfterRender(){
    refineHabTeachingModal();
    refineFastStartAward();
    refineBatchButton();
  }

  const previousRender=render;
  render=function(){
    previousRender();
    refineAfterRender();
  };

  function refineCoach(node){
    if(!node||node.nodeType!==1||!node.matches?.('.v9-coach'))return;
    const text=node.textContent.replace(/\s+/g,' ').trim();

    if(text.includes('High Activity Bonus Applied')&&text.includes('£1,000')&&text.includes('£1,400')){
      node.classList.add('v19-hab-roomy','v19-hab-result');
      if(node.dataset.v19HabResult!=='1'){
        node.dataset.v19HabResult='1';
        node.innerHTML='<span class="v16-icon">🔥</span><span class="v19-hab-title"><strong>High Activity Bonus Applied</strong></span><span class="v19-hab-amount">£1,000 ➡️ £1,400</span>';
      }
      return;
    }

    if(text.includes('High Activity Bonus unlocks again')||text.includes('High Activity Bonus kicks in again')){
      node.classList.add('v19-hab-roomy','v19-hab-again');
      return;
    }

    if(text.includes('Momentum Bonus unlocked!')||text==='Momentum Bonus'){
      if(node.dataset.v19MomentumCue==='1')return;
      node.dataset.v19MomentumCue='1';
      node.classList.add('v19-momentum-cue');
      node.innerHTML='<span class="v19-lightning">⚡</span><strong>Momentum Bonus</strong><span class="v19-cue-line">Add 6th customer</span><span class="v19-pointer">👇</span>';
    }
  }

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches?.('.v9-coach'))refineCoach(node);
      }
    }
  });
  observer.observe(document.body,{childList:true});

  refineAfterRender();
})();
