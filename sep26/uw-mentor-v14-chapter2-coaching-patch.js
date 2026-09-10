(function(){
  const style=document.createElement('style');
  style.textContent=`
    .mentor-timed-coach-wrap{position:fixed;inset:0;z-index:10020;display:grid;place-items:center;pointer-events:none;padding:1rem;background:rgba(38,22,79,.08)}
    .mentor-timed-coach{width:min(88vw,25rem);padding:1rem 1.05rem;border-radius:1rem;background:#fff;border:1px solid rgba(38,22,79,.14);box-shadow:0 18px 48px rgba(38,22,79,.18);text-align:center;color:#26164f}
    .mentor-timed-coach .coach-kicker{font-size:.76rem;font-weight:950;text-transform:uppercase;letter-spacing:.045em;margin-bottom:.35rem;color:#7a42c8}
    .mentor-timed-coach .coach-main{font-size:clamp(1rem,3.8vw,1.2rem);line-height:1.28;font-weight:850}
    .mentor-timed-coach.green .coach-kicker{color:#147a4a}
    .mentor-timed-coach.gold .coach-kicker{color:#b5730d}
    .mentor-coach-in{animation:mentorCoachCardIn .55s cubic-bezier(.22,.61,.36,1) both}
    .mentor-coach-out{animation:mentorCoachCardOut .55s ease both}
    @keyframes mentorCoachCardIn{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes mentorCoachCardOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-4px) scale(.985)}}
    .chapter2-label{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .65rem;margin-bottom:.55rem;border-radius:999px;background:#fff;color:#7a42c8;font-size:.76rem;font-weight:950;letter-spacing:.035em;text-transform:uppercase}
    .mentor-final-maths{display:grid;gap:.45rem;margin:.8rem 0 .7rem;padding:.8rem;border-radius:.9rem;background:#fffbe3;border:1px solid rgba(38,22,79,.13)}
    .mentor-final-maths-row{display:flex;justify-content:space-between;gap:.8rem;align-items:baseline;font-size:.92rem}
    .mentor-final-maths-row strong{white-space:nowrap}
    .mentor-final-maths-total{border-top:1px solid rgba(38,22,79,.16);padding-top:.5rem;margin-top:.05rem;font-size:1.05rem;font-weight:950;color:#26164f}
    .mentor-final-note{margin:.45rem 0 0;font-size:.72rem;line-height:1.3;color:#667085}
    .mentor-hero-grid>.mentor-side-stat{justify-self:start!important;text-align:left!important;margin-top:.42rem}

    /* Match Chapter 1 Fast Start layout: two side-by-side criterion cards. */
    .qd-popup.notice-faststart-setup .qd-step-status{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}
    .qd-popup.notice-faststart-setup .step-button{min-height:4.35rem;display:grid;grid-template-columns:1fr auto;align-items:center;gap:.52rem;text-align:left;padding:.65rem .68rem}
    .qd-popup.notice-faststart-setup .step-button>span:first-child{font-size:.7rem;font-weight:950;text-transform:uppercase;letter-spacing:.035em;color:#667085;white-space:nowrap}
    .qd-popup.notice-faststart-setup .step-button strong{grid-row:2;line-height:1.12;display:block}
    .qd-popup.notice-faststart-setup .step-main-icon{display:inline-block;margin-right:.3rem;font-size:1rem!important;vertical-align:.02rem}
    .qd-popup.notice-faststart-setup .step-check{grid-column:2;grid-row:1 / span 2;align-self:center;font-size:1.12rem;font-weight:950;min-width:1rem;text-align:center;color:#147a4a}

    .mentor-momentum-copy{margin:.28rem 0;line-height:1.34}
    @media (prefers-reduced-motion:reduce){.mentor-coach-in,.mentor-coach-out{animation:none!important}}
  `;
  document.head.appendChild(style);

  function removeMentorCoach(){document.querySelectorAll('.mentor-timed-coach-wrap').forEach(el=>el.remove());}

  async function showMentorCoach(kicker,main,tone='blue',hold=4000){
    removeMentorCoach();
    const wrap=document.createElement('div');
    wrap.className='mentor-timed-coach-wrap';
    wrap.setAttribute('aria-live','polite');
    wrap.innerHTML=`<div class="mentor-timed-coach mentor-coach-in ${tone}"><div class="coach-kicker">${kicker}</div><div class="coach-main">${main}</div></div>`;
    document.body.appendChild(wrap);
    await wait(hold);
    const card=wrap.querySelector('.mentor-timed-coach');
    if(card){card.classList.remove('mentor-coach-in');card.classList.add('mentor-coach-out');}
    await wait(560);
    wrap.remove();
  }

  function repositionPartnerEarns(){
    const grid=document.querySelector('.mentor-hero-grid');
    if(!grid)return;
    const stat=[...grid.querySelectorAll('.mentor-side-stat')].find(el=>/new Partner earns/i.test(el.textContent||''));
    if(!stat)return;
    const left=[...grid.children].find(el=>el!==stat&&!el.classList.contains('mentor-hero-right'));
    if(left&&stat.parentElement!==left)left.appendChild(stat);
  }

  const previousRenderStartedV14=renderStarted;
  renderStarted=function(){previousRenderStartedV14();requestAnimationFrame(repositionPartnerEarns);};

  renderWelcome=function(){
    document.body.classList.remove('explorer-independent');
    document.getElementById('app').innerHTML=`${contactMarkup()}<section class="splash-card splash-v6" style="margin-top:10vh"><div class="splash-top"><div class="chapter2-label">Chapter 2</div><div class="splash-wave">🤝</div><h1>Helping someone else build theirs</h1></div><div class="splash-body"><p>You've seen what your own first 60 days could look like.</p><p>Now see what happens when you support a new Partner through theirs.</p><button class="button splash-start" onclick="start()">Let's take a look</button></div></section>${howPaidMarkup()}`;
  };

  supportFirstFour=async function(){
    if(state.firstFourBusy||state.customers.length!==0)return;
    state.firstFourBusy=true;
    state.qdReady=false;
    document.body.classList.add('first-five-running');

    await showMentorCoach('🤝 Supporting Bonuses','In their first 30 days, support them to gather their first customers. You earn <strong>50% of their Customer Bonus</strong>.','blue',3900);
    await wait(250);

    for(let i=0;i<5;i++){
      addOneCustomer();
      await wait(1000);
      state.lastAddedId=null;
      render();
      if(i===3){
        await wait(350);
        await showMentorCoach('⭐ High Activity Bonus','Your new Partner just unlocked their <strong>£500 High Activity Bonus</strong> too.','gold',4500);
        await wait(250);
      }else if(i<4){
        await wait(300);
      }
    }

    await wait(850);
    state.firstFourBusy=false;
    state.qdReady=true;
    document.body.classList.remove('first-five-running');
    render();
  };
  supportFifth=function(){};

  fastStartStepButton=function(done,label,step){
    const number=step==='partner'?1:2;
    const icon=step==='partner'?'🏅':'🔗';
    const disabled=done||state.qdBusy;
    return `<button class="step-button fast-start-step-button ${done?'done':''}" ${disabled?'disabled':''} onclick="completeFastStartStep('${step}')"><span>${done?'Done':`Step ${number}`}</span><strong><span class="step-main-icon">${icon}</span>${label}</strong><span class="step-check" aria-hidden="true">${done?'✓':''}</span></button>`;
  };

  qdModal=function(){
    if(!state.qdReady||state.customers.length!==5||state.qdComplete)return '';
    const fadeClass=state.qdModalGone?'coaching-gone':state.qdModalFaded?'coaching-fade':'';
    return `<div class="notice-backdrop qd-backdrop ${fadeClass}"><section class="notice-popup notice-blue notice-celebration qd-popup notice-faststart-setup" onclick="event.stopPropagation()"><div class="notice-emoji">🎯</div><div class="eyebrow">Fast Start Mentor Bonus</div><h2>Helping them reach QD*</h2><p class="muted">When achieved in their first 30 days, you earn a <strong>£400 bonus</strong>.</p><div class="qd-step-status">${fastStartStepButton(state.introducedPartner,'Upgrading 1 customer to Partner','partner')}${fastStartStepButton(state.linkedOwnAccount,'Linking their own account','own')}</div></section></div>`;
  };

  function currentQdBackdropV14(){return document.querySelector('.qd-backdrop');}
  async function fadeQdV14(opacity,duration=1800){const el=currentQdBackdropV14();if(!el)return;el.style.transition=`opacity ${duration}ms cubic-bezier(.4,0,.2,1)`;el.style.pointerEvents='none';void el.offsetWidth;el.style.opacity=String(opacity);await wait(duration+60);}

  completeFastStartStep=async function(step){
    if(state.qdBusy||state.qdComplete)return;
    if(step==='partner'&&state.introducedPartner)return;
    if(step==='own'&&state.linkedOwnAccount)return;
    state.qdBusy=true;
    if(step==='partner')state.introducedPartner=true;else state.linkedOwnAccount=true;
    render();
    await wait(325);
    const secondStep=fastStartStepsComplete();
    await fadeQdV14(0,1800);
    state.qdModalGone=true;state.qdModalFaded=false;
    if(step==='partner'){state.mentorPartnerBadgeApplied=true;state.mentorMilestonePulseId='m3';}else{state.mentorAccountBadgeApplied=true;state.mentorAccountPulse=true;}
    render();
    await wait(1450);
    state.mentorMilestonePulseId=null;state.mentorAccountPulse=false;
    if(secondStep){
      state.mentorBonusApplied=true;state.mentorBonusPulse=true;state.qdComplete=true;state.fastStartCelebrate=true;state.momentumReady=false;state.qdBusy=false;render();
      await wait(1750);
      state.fastStartCelebrate=false;state.mentorBonusPulse=false;render();
      await showMentorCoach('🎓 Fast Start - double win',"You've earned <strong>£400</strong> - and helped them earn another <strong>£500</strong> too.",'gold',4000);
      await wait(250);
      state.momentumReady=true;render();return;
    }
    const el=currentQdBackdropV14();
    if(el){el.classList.remove('coaching-gone','coaching-fade');el.style.opacity='0';el.style.transition='opacity 1.8s cubic-bezier(.4,0,.2,1)';el.style.pointerEvents='none';void el.offsetWidth;el.style.opacity='1';await wait(1860);}
    state.qdModalGone=false;state.qdModalFaded=false;state.qdBusy=false;render();
  };

  momentumIntroModal=function(){
    if(!state.qdComplete||!state.momentumReady||state.momentumIntroDismissed)return '';
    return `<div class="notice-backdrop gentle-modal-in"><section class="notice-popup notice-green notice-celebration" onclick="event.stopPropagation()"><div class="notice-emoji">🎓⚡</div><div class="eyebrow milestone-heading">Mentor Momentum begins</div><p class="mentor-momentum-copy"><strong>Your new Partner is becoming more confident.</strong></p><p class="mentor-momentum-copy">For each 3+ service customer<br>they gather <strong>without your support</strong>,<br>you are <strong>both rewarded</strong> for their independence.</p><button class="button green" onclick="buildMomentumFour()">See Momentum in action</button></section></div>`;
  };

  finalModal=function(split){
    if(state.customers.length<10||state.momentumBusy||state.finalDismissed)return '';
    const registerButton=`<a class="button blue register-link tall-action" target="_blank" rel="noopener" href="${registerUrl}"><span>🎯 Ready to earn? Register here!</span><small>(new tab)</small></a>`;
    const chatButton=`<a class="button secondary register-link tall-action" target="_blank" rel="noopener" href="${CONTACT.calendarUrl}"><span>🗓️ Got questions? Book a chat</span><small>(new tab)</small></a>`;
    return `<div class="notice-backdrop"><section class="notice-popup notice-green notice-celebration notice-final" onclick="event.stopPropagation()"><button class="notice-close" onclick="dismissFinal()" aria-label="Close">×</button><div class="notice-emoji">🚀</div><div class="eyebrow">Mentor Journey Complete</div><p class="muted">You helped one new Partner earn <strong>${money(split.partnerTotal)}</strong> across this 60-day example.</p><p class="muted">Your Mentor income was <strong>${money(split.total)}</strong>.</p><div class="mentor-final-maths"><div class="mentor-final-maths-row"><span>Keep doing your own 10-customer activity*</span><strong>~£3,500</strong></div><div class="mentor-final-maths-row"><span>Mentor one new Partner as shown</span><strong>${money(split.total)}</strong></div><div class="mentor-final-maths-row mentor-final-maths-total"><span>Illustrative 60-day total</span><strong>~£5,150</strong></div></div><p class="mentor-final-note">*The Chapter 1 activity pattern without the £500 Fast Start and £625 Momentum launch boosts. This illustration only includes the bonuses shown in these journeys - other compensation-plan bonuses may apply.</p><div class="notice-actions notice-actions-stacked">${registerButton}${chatButton}<div class="or-divider">OR</div><button class="button secondary tall-action" onclick="dismissFinal()"><span>🔍 Continue to explore</span></button></div></section></div>`;
  };

  const originalResetV14=resetExplorer;
  resetExplorer=function(){removeMentorCoach();originalResetV14();};
})();