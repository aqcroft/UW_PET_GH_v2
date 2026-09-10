(function(){
  if(document.documentElement.dataset.coachingPreviewV14Copyfix==='1')return;
  document.documentElement.dataset.coachingPreviewV14Copyfix='1';

  function refine(root){
    const nodes=[];
    if(root?.nodeType===1){
      if(root.matches?.('.v9-coach'))nodes.push(root);
      root.querySelectorAll?.('.v9-coach').forEach(el=>nodes.push(el));
    }

    for(const coach of nodes){
      const text=coach.textContent.replace(/\s+/g,' ').trim();

      if(!coach.dataset.v14HabResult&&text.includes('£1,000')&&text.includes('£1,400')){
        coach.innerHTML='<div style="font-size:1.85rem;line-height:1;margin-bottom:.38rem">🔥</div><strong>£1,000 ➡️ £1,400</strong><span class="coach-line">Yes, that\'s an extra £400!</span>';
        coach.dataset.v14HabResult='1';
        continue;
      }

      if(!coach.dataset.v14MomentumIntro&&text.includes('Momentum Bonus')&&text.includes('A new bonus is unlocked')){
        coach.innerHTML='<strong>Momentum Bonus unlocked!</strong><span class="coach-line"><strong>Unsupported appointments</strong> when<br>customers take 3+ services</span>';
        coach.dataset.v14MomentumIntro='1';
      }
    }
  }

  refine(document.body);
  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes)refine(node);
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
