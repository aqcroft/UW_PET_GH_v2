(function(){
  const style=document.createElement('style');
  style.textContent=`
    .qd-backdrop{transition:opacity 1.8s cubic-bezier(.4,0,.2,1)!important}
    .qd-backdrop.coaching-fade{opacity:.10!important;pointer-events:none}
    .qd-backdrop.coaching-gone{opacity:0!important;pointer-events:none}
    .gentle-modal-in{animation:gentleBackdropIn 1.15s ease both}
    .gentle-modal-in .notice-popup{animation:gentlePopupIn 1.15s cubic-bezier(.22,.61,.36,1) both}
    @keyframes gentleBackdropIn{from{opacity:0}to{opacity:1}}
    @keyframes gentlePopupIn{from{opacity:0;transform:scale(.965) translateY(7px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes momentumArrive{0%{opacity:.35;transform:translateY(6px) scale(.99)}38%{opacity:1;transform:translateY(0) scale(1.035);background:#c9edd7;box-shadow:0 0 0 3px rgba(20,122,74,.28)}100%{opacity:1;transform:translateY(0) scale(1);box-shadow:none}}
    .customer-row-arrive.mentor-momentum-pulse{animation:momentumArrive .95s ease both!important}
    @keyframes mentorBonusPop{0%{transform:scale(1)}35%{transform:scale(1.08);box-shadow:0 0 0 4px rgba(201,142,32,.22)}100%{transform:scale(1);box-shadow:none}}
    .bonus-badge.pulse{animation:mentorBonusPop 1.25s ease both!important;transform:none!important}
    .customer-summary-row{height:3.2rem;min-height:3.2rem!important}
    .row-badges{min-height:1.8rem;align-content:center}
    body.first-five-running .add-customer-solo-row{display:none!important}

    .mentor-confetti-screen{position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden}
    .mentor-confetti-screen span{position:absolute;top:-8vh;left:var(--x);font-size:clamp(1rem,2.4vw,1.7rem);opacity:0;animation:mentorConfettiFall 1.65s cubic-bezier(.2,.7,.2,1) var(--d) both;transform:translateX(-50%) rotate(var(--r)) scale(var(--s))}
    @keyframes mentorConfettiFall{0%{opacity:0;top:-8vh}10%{opacity:1}85%{opacity:1}100%{opacity:0;top:108vh;transform:translateX(calc(-50% + var(--drift))) rotate(calc(var(--r) + 420deg)) scale(var(--s))}}
    .splash-card.splash-v6 .splash-body{padding:1rem 1.05rem 1.05rem}
    .splash-card.splash-v6 .splash-body>p{margin:.55rem 0}
    .splash-card.splash-v6 .income-chip-grid{margin:.6rem 0}
    .splash-card.splash-v6 .income-chip{grid-template-columns:auto 1fr auto}
    .splash-card.splash-v6 .splash-mantra{font-weight:950;color:#1f2937;margin:.72rem 0 .25rem}
  `;
  document.head.appendChild(style);

  state.qdModalGone=false;
  state.qdReady=false;
  state.fastStartCelebrate=false;
  state.momentumReady=false;

  function currentQdBackdrop(){return document.querySelector('.qd-backdrop');}
  async function fadeExistingQdTo(opacity,duration=1800){
    const el=currentQdBackdrop();
    if(!el)return;
    el.style.transition=`opacity ${duration}ms cubic-bezier(.4,0,.2,1)`;
    el.style.pointerEvents='none';
    void el.offsetWidth;
    el.style.opacity=String(opacity);
    await wait(duration+60);
  }

  function fullScreenConfetti(){
    if(!state.fastStartCelebrate)return '';
    const pieces=Array.from({length:48},(_,i)=>{
      const x=(i*37)%100;
      const d=((i%12)*0.035).toFixed(3)+'s';
      const s=(.72+(i%8)*.07).toFixed(2);
      const r=((i*53)%360)+'deg';
      const drift=(((i%9)-4)*7)+'vw';
      return `<span style="--x:${x}%;--d:${d};--s:${s};--r:${r};--drift:${drift}">${i%4===0?'🎉':i%3===0?'✨':'🎊'}</span>`;
    }).join('');
    return `<div class="mentor-confetti-screen" aria-hidden="true">${pieces}</div>`;
  }

  qdModal=function(){
    if(!state.qdReady||state.customers.length!==5||state.qdComplete)return '';
    const fadeClass=state.qdModalGone?'coaching-gone':state.qdModalFaded?'coaching-fade':'';
    return `<div class="notice-backdrop qd-backdrop ${fadeClass}"><section class="notice-popup notice-blue notice-celebration qd-popup" onclick="event.stopPropagation()"><div class="notice-emoji">🎯</div><div class="eyebrow">Fast Start Mentor Bonus</div><h2>Helping them reach QD*</h2><p class="muted">When achieved in their first 30 days, you earn a <strong>£400 bonus</strong>.</p><div class="qd-step-status">${fastStartStepButton(state.introducedPartner,'Upgrading 1 customer to Partner','partner')}${fastStartStepButton(state.linkedOwnAccount,'Linking their own account','own')}</div></section></div>`;
  };

  momentumIntroModal=function(){
    if(!state.qdComplete||!state.momentumReady||state.momentumIntroDismissed)return '';
    return `<div class="notice-backdrop gentle-modal-in"><section class="notice-popup notice-green notice-celebration" onclick="event.stopPropagation()"><div class="notice-emoji">🎓⚡</div><div class="eyebrow milestone-heading">Mentor Momentum begins</div><p class="compact-copy">In days 1-30, you earned <strong>Supporting Bonuses</strong>.</p><p class="compact-copy">By days 31-60, you earn <strong>Momentum Bonus</strong> as they become more confident without your support.</p><p class="key-line">Now each 3+ service customer creates <strong>£125 extra income for both of you.</strong></p><button class="button green" onclick="buildMomentumFour()">See Momentum in action</button></section></div>`;
  };

  supportFirstFour=async function(){
    if(state.firstFourBusy||state.customers.length!==0)return;
    state.firstFourBusy=true;
    state.qdReady=false;
    document.body.classList.add('first-five-running');
    for(let i=0;i<5;i++){
      addOneCustomer();
      await wait(1000);
      state.lastAddedId=null;
      render();
      if(i<4)await wait(300);
    }
    await wait(850);
    state.firstFourBusy=false;
    state.qdReady=true;
    document.body.classList.remove('first-five-running');
    render();
  };
  supportFifth=function(){};

  completeFastStartStep=async function(step){
    if(state.qdBusy||state.qdComplete)return;
    if(step==='partner'&&state.introducedPartner)return;
    if(step==='own'&&state.linkedOwnAccount)return;

    state.qdBusy=true;
    if(step==='partner')state.introducedPartner=true;
    else state.linkedOwnAccount=true;
    render();
    await wait(325);

    const secondStep=fastStartStepsComplete();

    if(secondStep){
      await fadeExistingQdTo(0,1800);
      state.qdModalGone=true;
      state.qdModalFaded=false;

      if(step==='partner'){
        state.mentorPartnerBadgeApplied=true;
        state.mentorMilestonePulseId='m3';
      }else{
        state.mentorAccountBadgeApplied=true;
        state.mentorAccountPulse=true;
      }
      render();
      await wait(1450);
      state.mentorMilestonePulseId=null;
      state.mentorAccountPulse=false;

      state.mentorBonusApplied=true;
      state.mentorBonusPulse=true;
      state.qdComplete=true;
      state.fastStartCelebrate=true;
      state.momentumReady=false;
      state.qdBusy=false;
      render();

      await wait(1750);
      state.fastStartCelebrate=false;
      state.mentorBonusPulse=false;
      state.momentumReady=true;
      render();
    }else{
      await fadeExistingQdTo(.10,1800);
      state.qdModalFaded=true;

      if(step==='partner'){
        state.mentorPartnerBadgeApplied=true;
        state.mentorMilestonePulseId='m3';
      }else{
        state.mentorAccountBadgeApplied=true;
        state.mentorAccountPulse=true;
      }
      render();
      await wait(1450);
      state.mentorMilestonePulseId=null;
      state.mentorAccountPulse=false;
      render();

      const el=currentQdBackdrop();
      if(el){
        el.style.opacity='.10';
        el.style.transition='opacity 1.8s cubic-bezier(.4,0,.2,1)';
        void el.offsetWidth;
        el.style.opacity='1';
        await wait(1860);
      }
      state.qdModalFaded=false;
      state.qdBusy=false;
      render();
    }
  };

  function addMomentumCustomerTogether(){
    if(state.customers.length>=10)return null;
    const customer=makeCustomer(state.customers.length+1);
    state.customers.push(customer);
    if(!state.momentumAppliedIds.includes(customer.id))state.momentumAppliedIds.push(customer.id);
    state.momentumPulseId=customer.id;
    state.lastAddedId=customer.id;
    state.bonusPreview=null;
    render();
    return customer;
  }

  buildMomentumFour=async function(){
    if(state.momentumBusy||state.momentumIntroDismissed)return;
    state.momentumIntroDismissed=true;
    state.momentumBusy=true;
    state.month2HabReady=false;
    render();
    await wait(300);

    for(let n=6;n<=10;n++){
      addMomentumCustomerTogether();
      await wait(1000);
      state.momentumPulseId=null;
      state.lastAddedId=null;
      render();
      await wait(n===10?220:300);
    }

    state.momentumBusy=false;
    state.month2HabReady=false;
    render();
  };

  habReminderModal=function(){return '';};

  finalModal=function(split){
    if(state.customers.length<10||state.momentumBusy||state.finalDismissed)return '';
    const registerButton=`<a class="button blue register-link tall-action" target="_blank" rel="noopener" href="${registerUrl}"><span>🎯 Ready to earn? Register here!</span><small>(new tab)</small></a>`;
    const chatButton=`<a class="button secondary register-link tall-action" target="_blank" rel="noopener" href="${CONTACT.calendarUrl}"><span>🗓️ Got questions? Book a chat</span><small>(new tab)</small></a>`;
    return `<div class="notice-backdrop"><section class="notice-popup notice-green notice-celebration notice-final" onclick="event.stopPropagation()"><button class="notice-close" onclick="dismissFinal()" aria-label="Close">×</button><div class="notice-emoji">🚀</div><div class="eyebrow">Mentor Journey Complete</div><p class="muted">You helped one new Partner earn <strong>${money(split.partnerTotal)}</strong> across this 60-day example</p><p class="muted">You earned <strong>${money(split.total)}</strong> yourself.</p><p><strong>That's just one Partner.</strong></p><div class="notice-actions notice-actions-stacked">${registerButton}${chatButton}<div class="or-divider">OR</div><button class="button secondary tall-action" onclick="dismissFinal()"><span>🔍 Continue to explore</span></button></div></section></div>`;
  };

  const originalRenderStarted=renderStarted;
  renderStarted=function(){
    originalRenderStarted();
    const app=document.getElementById('app');
    if(app&&state.fastStartCelebrate)app.insertAdjacentHTML('beforeend',fullScreenConfetti());
  };

  renderWelcome=function(){
    document.body.classList.remove('explorer-independent');
    document.getElementById('app').innerHTML=`${contactMarkup()}<section class="splash-card splash-v6" style="margin-top:10vh"><div class="splash-top"><div class="splash-wave">🤝</div><h1>What happens when you support a new Partner?</h1></div><div class="splash-body"><p>Let's look at the three mentor Bonuses:</p><div class="income-chip-grid"><div class="income-chip"><span>🤝</span><strong>Supporting bonuses</strong><em>Days 1-30</em></div><div class="income-chip"><span>🎓</span><strong>30 Day Fast Start Mentor</strong><em>£400</em></div><div class="income-chip"><span>🎓⚡</span><strong>Mentor Momentum</strong><em>Days 31-60</em></div></div><p class="splash-mantra">Support - Momentum - Success 🏆</p><button class="button splash-start" onclick="start()">Let's take a look</button></div></section>${howPaidMarkup()}`;
  };

  const originalReset=resetExplorer;
  resetExplorer=function(){
    originalReset();
    state.qdModalGone=false;
    state.qdReady=false;
    state.fastStartCelebrate=false;
    state.momentumReady=false;
    state.month2HabReady=false;
    document.body.classList.remove('first-five-running');
  };

  function markV6(){
    const top=document.querySelector('.topbar .eyebrow span');
    if(top&&top.textContent!=='v6')top.textContent='v6';

    if(state.customers.length===0){
      const button=document.querySelector('.add-customer-solo');
      if(button){
        const main=button.querySelector('.add-label-main');
        const sub=button.querySelector('.add-label-sub');
        if(main&&main.textContent!=='Support their first 5')main.textContent='Support their first 5';
        if(sub&&sub.textContent!=='customers')sub.textContent='customers';
      }
    }
  }
  const app=document.getElementById('app');
  if(app)new MutationObserver(markV6).observe(app,{childList:true,subtree:true});
  markV6();
})();