(function(){
  const style=document.createElement('style');
  style.textContent=`
    .qd-backdrop{transition:opacity 1.05s cubic-bezier(.4,0,.2,1)!important}
    .qd-backdrop.coaching-fade{opacity:.10!important;pointer-events:none}
    .qd-backdrop.coaching-gone{opacity:0!important;pointer-events:none}
    .gentle-modal-in{animation:gentleBackdropIn .9s ease both}
    .gentle-modal-in .notice-popup{animation:gentlePopupIn .9s cubic-bezier(.22,.61,.36,1) both}
    @keyframes gentleBackdropIn{from{opacity:0}to{opacity:1}}
    @keyframes gentlePopupIn{from{opacity:0;transform:scale(.965) translateY(7px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes momentumArrive{0%{opacity:.35;transform:translateY(6px) scale(.99)}38%{opacity:1;transform:translateY(0) scale(1.035);background:#c9edd7;box-shadow:0 0 0 3px rgba(20,122,74,.28)}100%{opacity:1;transform:translateY(0) scale(1);box-shadow:none}}
    .customer-row-arrive.mentor-momentum-pulse{animation:momentumArrive .95s ease both!important}
    @keyframes mentorBonusPop{0%{transform:scale(1)}35%{transform:scale(1.08);box-shadow:0 0 0 4px rgba(201,142,32,.22)}100%{transform:scale(1);box-shadow:none}}
    .bonus-badge.pulse{animation:mentorBonusPop 1.15s ease both!important;transform:none!important}
  `;
  document.head.appendChild(style);

  state.qdModalGone=false;

  qdModal=function(){
    if(state.customers.length!==5||state.qdComplete)return '';
    const fadeClass=state.qdModalGone?'coaching-gone':state.qdModalFaded?'coaching-fade':'';
    return `<div class="notice-backdrop qd-backdrop ${fadeClass}"><section class="notice-popup notice-blue notice-celebration qd-popup" onclick="event.stopPropagation()"><div class="notice-emoji">🎯</div><div class="eyebrow">Fast Start Mentor Bonus</div><h2>Helping them reach QD*</h2><p class="muted">When achieved in their first 30 days, you earn a <strong>£400 bonus</strong>.</p><div class="qd-step-status">${fastStartStepButton(state.introducedPartner,'Upgrading 1 customer to Partner','partner')}${fastStartStepButton(state.linkedOwnAccount,'Linking their own account','own')}</div></section></div>`;
  };

  momentumIntroModal=function(){
    if(!state.qdComplete||state.momentumIntroDismissed)return '';
    return `<div class="notice-backdrop gentle-modal-in"><section class="notice-popup notice-green notice-celebration" onclick="event.stopPropagation()">${celebrationGlitter()}<div class="notice-emoji">🎓⚡</div><div class="eyebrow milestone-heading">Mentor Momentum begins</div><p class="compact-copy">In days 31-60, supporting bonuses are replaced with Momentum bonuses.</p><p class="compact-copy">These reward <strong>3+ service customers from unsupported appointments</strong>.</p><p class="key-line">Both the new Partner and the mentor are paid £125.</p><p class="muted">That's up to <strong>£500</strong> for their next four customers.</p><button class="button green" onclick="buildMomentumFour()">See Mentor Momentum build</button></section></div>`;
  };

  completeFastStartStep=async function(step){
    if(state.qdBusy||state.qdComplete)return;
    if(step==='partner'&&state.introducedPartner)return;
    if(step==='own'&&state.linkedOwnAccount)return;

    state.qdBusy=true;
    state.qdModalGone=false;
    state.qdModalFaded=true;
    render();
    await wait(1120);

    if(step==='partner'){
      state.introducedPartner=true;
      state.mentorPartnerBadgeApplied=true;
      state.mentorMilestonePulseId='m3';
    }else{
      state.linkedOwnAccount=true;
      state.mentorAccountBadgeApplied=true;
      state.mentorAccountPulse=true;
    }
    render();
    await wait(1450);

    state.mentorMilestonePulseId=null;
    state.mentorAccountPulse=false;

    if(fastStartStepsComplete()){
      state.qdModalGone=true;
      state.qdModalFaded=false;
      render();
      await wait(1120);

      state.mentorBonusApplied=true;
      state.mentorBonusPulse=true;
      state.qdComplete=true;
      state.qdBusy=false;
      render();
      await wait(1200);
      state.mentorBonusPulse=false;
      render();
    }else{
      state.qdModalFaded=false;
      render();
      await wait(1120);
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
    render();
    await wait(260);

    for(let n=6;n<=9;n++){
      addMomentumCustomerTogether();
      await wait(1000);
      state.momentumPulseId=null;
      state.lastAddedId=null;
      render();
      await wait(260);
    }

    state.momentumBusy=false;
    state.month2HabReady=true;
    render();
  };

  addFinalCustomer=async function(){
    if(state.momentumBusy||state.customers.length!==9)return;
    state.month2HabReady=false;
    state.momentumBusy=true;
    render();
    await wait(220);

    addMomentumCustomerTogether();
    await wait(1050);
    state.momentumPulseId=null;
    state.lastAddedId=null;
    state.momentumBusy=false;
    render();
  };

  const originalReset=resetExplorer;
  resetExplorer=function(){
    originalReset();
    state.qdModalGone=false;
  };

  function markV3(){
    const top=document.querySelector('.topbar .eyebrow span');
    if(top && top.textContent!=='v3')top.textContent='v3';
  }
  const app=document.getElementById('app');
  if(app)new MutationObserver(markV3).observe(app,{childList:true,subtree:true});
  markV3();
})();
