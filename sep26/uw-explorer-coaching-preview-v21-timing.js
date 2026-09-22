(function(){
  if(document.documentElement.dataset.coachingPreviewV21Timing==='1')return;
  document.documentElement.dataset.coachingPreviewV21Timing='1';

  const previousSetTimeout=window.setTimeout.bind(window);
  function count(){
    try{return state.month1.length+state.month2.length;}catch(error){return -1;}
  }

  window.setTimeout=function(fn,delay,...args){
    const n=count();

    // Progressive coaching pace for the first three customer transitions.
    // v12 has already reduced the original 2200ms pre-delay to 1500ms.
    if(delay===1500&&!document.querySelector('.v9-coach')){
      if(n===1)delay=900;
      else if(n===2)delay=650;
      else if(n===3)delay=450;
    }

    // Once the coach is on screen, shorten its hold progressively whilst
    // retaining the existing 450ms fade. These values apply only while the
    // first-three-customer coach is actually present.
    if(document.querySelector('.v9-coach')&&n>=1&&n<=3){
      const hold=n===1?2400:n===2?1900:1500;
      if(delay===3500)delay=hold;
      else if(delay===3950)delay=hold+350;
    }

    return previousSetTimeout(fn,delay,...args);
  };
})();
