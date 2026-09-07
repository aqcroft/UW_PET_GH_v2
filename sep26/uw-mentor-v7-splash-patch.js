(function(){
  const style=document.createElement('style');
  style.textContent=`
    .splash-card.splash-v7 .splash-body{padding:1rem 1.05rem 1.05rem}
    .splash-card.splash-v7 .splash-body>p{margin:.65rem 0}
    .splash-card.splash-v7 .income-chip-grid{margin:.7rem 0;gap:.5rem}
    .splash-card.splash-v7 .income-chip{grid-template-columns:1fr;text-align:center;padding:.62rem .7rem}
    .splash-card.splash-v7 .income-chip strong{font-size:.92rem}
    .splash-card.splash-v7 .splash-mantra-button{width:100%;margin-top:.72rem;border:none;border-radius:.7rem;padding:.82rem 1rem;background:linear-gradient(135deg,var(--blue),var(--green));color:#fff;font-weight:950;font-size:.96rem;cursor:pointer;box-shadow:0 8px 22px rgba(29,79,145,.22)}
  `;
  document.head.appendChild(style);

  renderWelcome=function(){
    document.body.classList.remove('explorer-independent');
    document.getElementById('app').innerHTML=`${contactMarkup()}<section class="splash-card splash-v7" style="margin-top:10vh"><div class="splash-top"><h1>What happens when you support a new Partner?</h1></div><div class="splash-body"><p>Let's look at the three mentor Bonuses:</p><div class="income-chip-grid"><div class="income-chip"><strong>🤝Supporting bonuses Days 1-30</strong></div><div class="income-chip"><strong>🎓30 Day Fast Start Mentor <em>£400</em></strong></div><div class="income-chip"><strong>🎓⚡Mentor Momentum <em>Days 31-60</em></strong></div></div><button class="splash-mantra-button" onclick="start()">Support - Momentum - Success🏆</button></div></section>${howPaidMarkup()}`;
  };

  function markV7(){
    const top=document.querySelector('.topbar .eyebrow span');
    if(top&&top.textContent!=='v7')top.textContent='v7';
  }
  const app=document.getElementById('app');
  if(app)new MutationObserver(markV7).observe(app,{childList:true,subtree:true});
  markV7();
  if(!state.started)render();
})();
