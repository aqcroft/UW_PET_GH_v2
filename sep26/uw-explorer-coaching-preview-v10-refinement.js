(function(){
  if(document.documentElement.dataset.coachingPreviewV10Refinement==='1')return;
  document.documentElement.dataset.coachingPreviewV10Refinement='1';

  const style=document.createElement('style');
  style.textContent=`
    /* Keep the Fast Start award tile visually stable throughout its celebration.
       v9 already owns the timing; this removes the scale hand-off that could twitch
       when the state re-renders at the end of the pulse. */
    @keyframes v10FastStageStable{
      0%,100%{
        opacity:1;
        transform:none;
        background:#dbeaff;
        border-color:rgba(29,79,145,.58);
        box-shadow:0 0 0 rgba(29,79,145,0);
      }
      48%{
        opacity:1;
        transform:none;
        background:#cfe3ff;
        border-color:rgba(29,79,145,.72);
        box-shadow:0 0 0 .28rem rgba(29,79,145,.14);
      }
    }
    .bonus-faststart.v9-fast-stage,
    .bonus-faststart.pulse.v9-fast-stage{
      animation:v10FastStageStable 1.25s ease-in-out 1 both!important;
      transform:none!important;
      will-change:background-color,border-color,box-shadow;
    }
  `;
  document.head.appendChild(style);

  function refineCoach(root){
    const candidates=[];
    if(root?.nodeType===1){
      if(root.matches?.('.v9-coach'))candidates.push(root);
      root.querySelectorAll?.('.v9-coach').forEach(el=>candidates.push(el));
    }
    candidates.forEach(coach=>{
      if(coach.dataset.v10Refined==='1')return;
      if(!coach.textContent.includes('Your confidence is building!'))return;
      const line=coach.querySelector('.coach-line');
      if(line)line.textContent='Encouraging confidence, rewarding independence.';
      coach.dataset.v10Refined='1';
    });
  }

  refineCoach(document.body);
  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes)refineCoach(node);
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();