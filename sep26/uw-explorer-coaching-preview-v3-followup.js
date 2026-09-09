(function(){
  if(document.documentElement.dataset.coachingPreviewV3Followup==='1')return;
  document.documentElement.dataset.coachingPreviewV3Followup='1';

  const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pulseAction(el){
    if(!el||reducedMotion)return;
    el.classList.remove('coach-action-pulse');
    void el.offsetWidth;
    el.classList.add('coach-action-pulse');
    window.setTimeout(()=>el.classList.remove('coach-action-pulse'),1200);
  }

  dismissNextIntro=function(){
    state.nextIntroDismissed=true;
    render();

    window.setTimeout(()=>{
      const cols=Array.from(document.querySelectorAll('.customer-column'));
      const target=cols[1];
      if(target){
        target.style.transition='opacity .45s ease, filter .45s ease, box-shadow .45s ease';
        const current=parseFloat(getComputedStyle(target).opacity)||.4;
        target.style.opacity=String(Math.min(1,current+.30));
        target.style.boxShadow='0 0 0 .42rem rgba(43,130,79,.13)';
        window.setTimeout(()=>{
          if(!target.isConnected)return;
          target.style.opacity='';
          target.style.boxShadow='';
        },1450);
      }

      window.setTimeout(()=>{
        const button=document.querySelector('.add-customer-main:not([disabled])');
        pulseAction(button);
      },1850);
    },1400);
  };
})();
