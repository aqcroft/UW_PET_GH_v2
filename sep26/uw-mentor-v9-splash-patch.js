(function(){
  const style=document.createElement('style');
  style.textContent=`
    .splash-card.splash-v9{
      width:min(100%,30rem);
      margin-left:auto!important;
      margin-right:auto!important;
    }
    .splash-card.splash-v9 .splash-body{padding:1rem 1.05rem 1.05rem}
    .splash-card.splash-v9 .splash-body>p{margin:.65rem 0}
    .splash-card.splash-v9 .income-chip-grid{margin:.7rem 0;gap:.5rem}
    .splash-card.splash-v9 .income-chip{
      display:grid;
      grid-template-columns:minmax(0,1fr) 1.4rem auto;
      align-items:center;
      gap:.45rem;
      text-align:left;
      padding:.62rem .7rem;
    }
    .splash-card.splash-v9 .bonus-name{
      font-size:.92rem;
      font-weight:950;
      text-align:left;
      min-width:0;
    }
    .splash-card.splash-v9 .bonus-gap{display:block}
    .splash-card.splash-v9 .bonus-meta{
      font-size:.86rem;
      font-weight:950;
      text-align:right;
      color:var(--blue);
      white-space:nowrap;
    }
    .splash-card.splash-v9 .splash-mantra-button{
      width:100%;
      margin-top:.72rem;
      border:none;
      border-radius:.7rem;
      padding:.82rem 1rem;
      background:linear-gradient(135deg,var(--blue),var(--green));
      color:#fff;
      font-weight:950;
      font-size:.96rem;
      cursor:pointer;
      box-shadow:0 8px 22px rgba(29,79,145,.22);
    }
    .add-customer-solo .add-label-main,
    .add-customer-solo .add-label-sub{display:none!important}
    .add-customer-solo .add-label-text::before{
      content:'Support their first five';
      display:block;
      font-size:.92rem;
      font-weight:950;
      line-height:1.08;
    }
    .add-customer-solo .add-label-text::after{
      content:'homeowners';
      display:block;
      margin-top:.08rem;
      font-size:.72rem;
      font-weight:800;
      line-height:1.08;
      opacity:.82;
    }
  `;
  document.head.appendChild(style);

  renderWelcome=function(){
    document.body.classList.remove('explorer-independent');
    document.getElementById('app').innerHTML=`${contactMarkup()}<section class="splash-card splash-v9" style="margin-top:10vh"><div class="splash-top"><h1>What happens when you support a new Partner?</h1></div><div class="splash-body"><p>Let's look at the three mentor Bonuses:</p><div class="income-chip-grid"><div class="income-chip"><span class="bonus-name">🤝Supporting bonuses</span><span class="bonus-gap"></span><span class="bonus-meta">Days 1-30</span></div><div class="income-chip"><span class="bonus-name">🎓30 Day Fast Start Mentor</span><span class="bonus-gap"></span><span class="bonus-meta">£400</span></div><div class="income-chip"><span class="bonus-name">🎓⚡Mentor Momentum</span><span class="bonus-gap"></span><span class="bonus-meta">Days 31-60</span></div></div><button class="splash-mantra-button" onclick="start()">Support - Momentum - Success🏆</button></div></section>${howPaidMarkup()}`;
  };

  // Deliberately no MutationObserver here. The v6 behaviour layer already owns
  // the topbar version marker; a second observer caused an infinite v6/v9 rewrite loop.
  if(!state.started)render();
})();