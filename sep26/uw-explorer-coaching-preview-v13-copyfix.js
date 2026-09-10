(function(){
  if(document.documentElement.dataset.coachingPreviewV13Copyfix==='1')return;
  document.documentElement.dataset.coachingPreviewV13Copyfix='1';

  function refine(root){
    const nodes=[];
    if(root?.nodeType===1){
      if(root.matches?.('.v9-coach'))nodes.push(root);
      root.querySelectorAll?.('.v9-coach').forEach(el=>nodes.push(el));
    }
    for(const coach of nodes){
      if(coach.dataset.v13Customer1==='1')continue;
      const text=coach.textContent.replace(/\s+/g,' ').trim();
      if(!text.includes('First customer added'))continue;
      coach.innerHTML='<strong>First customer added 🎉</strong><span class="coach-line">That’s <strong>£250 earned.</strong></span>';
      coach.dataset.v13Customer1='1';
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