(function(){
  /*
    v12 - make both Fast Start Mentor criteria use the same full modal
    fade-away rhythm. The first criterion now fades completely out while
    its behind-modal animation plays, then fades back in for criterion two.
    The second criterion keeps the existing full fade into the £400 award.
  */

  function currentQdBackdropV12(){
    return document.querySelector('.qd-backdrop');
  }

  async function fadeQdV12(opacity,duration=1800){
    const el=currentQdBackdropV12();
    if(!el)return;
    el.style.transition=`opacity ${duration}ms cubic-bezier(.4,0,.2,1)`;
    el.style.pointerEvents='none';
    void el.offsetWidth;
    el.style.opacity=String(opacity);
    await wait(duration+60);
  }

  completeFastStartStep=async function(step){
    if(state.qdBusy||state.qdComplete)return;
    if(step==='partner'&&state.introducedPartner)return;
    if(step==='own'&&state.linkedOwnAccount)return;

    state.qdBusy=true;

    /* Show the tick first, just as the existing mentor sequence does. */
    if(step==='partner')state.introducedPartner=true;
    else state.linkedOwnAccount=true;
    render();
    await wait(325);

    const secondStep=fastStartStepsComplete();

    /* Every criterion now uses the same complete 1.8s fade-away. */
    await fadeQdV12(0,1800);
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

    if(secondStep){
      /* Existing final Fast Start award sequence. */
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
      return;
    }

    /* First criterion only: bring the modal back with the same 1.8s rhythm. */
    render();
    const el=currentQdBackdropV12();
    if(el){
      el.style.opacity='0';
      el.style.transition='opacity 1.8s cubic-bezier(.4,0,.2,1)';
      el.style.pointerEvents='none';
      void el.offsetWidth;
      el.style.opacity='1';
      await wait(1860);
    }

    state.qdModalGone=false;
    state.qdModalFaded=false;
    state.qdBusy=false;
    render();
  };
})();
