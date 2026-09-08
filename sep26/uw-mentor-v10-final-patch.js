(function(){
  const style=document.createElement('style');
  style.textContent=`
    .splash-card.splash-v9{width:min(100%,30rem);margin-left:auto!important;margin-right:auto!important}
  `;
  document.head.appendChild(style);

  function applyFinalCopy(){
    if(state.customers.length===0){
      const button=document.querySelector('.add-customer-solo');
      if(button){
        const main=button.querySelector('.add-label-main');
        const sub=button.querySelector('.add-label-sub');
        if(main&&main.textContent!=='Support their first five')main.textContent='Support their first five';
        if(sub&&sub.textContent!=='homeowners')sub.textContent='homeowners';
      }
    }
    const top=document.querySelector('.topbar .eyebrow span');
    if(top&&top.textContent!=='v10')top.textContent='v10';
  }

  const app=document.getElementById('app');
  if(app)new MutationObserver(applyFinalCopy).observe(app,{childList:true,subtree:true});
  applyFinalCopy();
})();
