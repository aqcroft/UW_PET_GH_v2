(function(root){
  const CUSTOMER_BONUS_TABLE={homeowner:{1:50,2:100,3:250,4:300},tenant:{1:0,2:0,3:0,4:0},renting:{1:0,2:0,3:0,4:0}};
  const HAB_THRESHOLD=4;
  const HAB_PER_QUALIFYING_CUSTOMER=100;
  const MOMENTUM_EFFECTIVE_DATE='2026-09-01';
  const MOMENTUM_MAX_GATHERED_CUSTOMER_NUMBER=10;
  const MOMENTUM_GATHERING_PARTNER_AMOUNT=125;
  const MOMENTUM_RECRUITER_AMOUNT=125;
  const ENHANCED_SUPPORT_END_DAY=30;
  const QD_BONUS=200;
  const FAST_STARTER_BONUS=300;
  const QD_MENTOR_BONUS=100;
  const FAST_STARTER_MENTOR_BONUS=300;

  const parseDate=(value)=>value?new Date(`${value}T00:00:00`):null;
  const toISODate=(date)=>date.toISOString().slice(0,10);
  const addDays=(iso,days)=>{const d=parseDate(iso);d.setDate(d.getDate()+days);return toISODate(d);};
  const getJourneyDay=(startDate,customerDate)=>{
    const start=parseDate(startDate), current=parseDate(customerDate);
    if(!start||!current)return null;
    return Math.floor((current-start)/86400000)+1;
  };
  const calendarMonthKey=(date)=>date?date.slice(0,7):'';
  const normalizeCustomer=(customer,index)=>({
    stableIndex:index,
    id:customer.id||`c${index+1}`,
    customerNumber:customer.customerNumber||index+1,
    dateGathered:customer.dateGathered||customer.date||'',
    type:customer.type==='renting'?'tenant':customer.type,
    services:Number(customer.services)||0,
    supported:!!customer.supported,
    isPartner:!!customer.isPartner,
  });
  const orderGatheredCustomers=(customers)=>
    customers
      .map(normalizeCustomer)
      .filter(c=>c.type&&c.type!=='own')
      .sort((a,b)=>{
        const ad=a.dateGathered||'9999-12-31', bd=b.dateGathered||'9999-12-31';
        if(ad===bd)return a.stableIndex-b.stableIndex;
        return ad.localeCompare(bd);
      })
      .map((c,index)=>({...c,customerNumber:index+1}));
  const calculateNormalCustomerBonus=(customer)=>CUSTOMER_BONUS_TABLE[customer.type]?.[Number(customer.services)]||0;
  const isHABQualifying=(customer)=>customer.type==='homeowner'&&(Number(customer.services)===3||Number(customer.services)===4);
  const calculateHighActivityBonusByCalendarMonth=(customers)=>{
    const grouped={};
    customers.forEach(customer=>{
      if(!isHABQualifying(customer)||!customer.dateGathered)return;
      const key=calendarMonthKey(customer.dateGathered);
      grouped[key]=grouped[key]||[];
      grouped[key].push(customer);
    });
    const perCustomer={};
    const months=Object.entries(grouped).reduce((acc,[month,items])=>{
      const unlocked=items.length>=HAB_THRESHOLD;
      const total=unlocked?items.length*HAB_PER_QUALIFYING_CUSTOMER:0;
      items.forEach(c=>{perCustomer[c.id]=unlocked?HAB_PER_QUALIFYING_CUSTOMER:0;});
      acc[month]={qualifyingCount:items.length,total,unlocked};
      return acc;
    },{});
    return {months,perCustomer,total:Object.values(months).reduce((sum,m)=>sum+m.total,0)};
  };
  const isMomentumEligible=(customer,context)=>{
    const journeyDay=getJourneyDay(context.startDate,customer.dateGathered);
    if(!customer.dateGathered||journeyDay===null)return false;
    if(customer.customerNumber<1||customer.customerNumber>MOMENTUM_MAX_GATHERED_CUSTOMER_NUMBER)return false;
    if(customer.dateGathered<MOMENTUM_EFFECTIVE_DATE)return false;
    if(journeyDay<1||journeyDay>60)return false;
    if(!(customer.services===3||customer.services===4))return false;
    if(!(customer.type==='homeowner'||customer.type==='tenant'))return false;
    if(customer.supported)return false;
    if(journeyDay<=30&&customer.customerNumber<=6)return false;
    return true;
  };
  const calculateMomentum=(customer,context)=>isMomentumEligible(customer,context)
    ?{gatheringPartner:MOMENTUM_GATHERING_PARTNER_AMOUNT,recruiter:MOMENTUM_RECRUITER_AMOUNT}
    :{gatheringPartner:0,recruiter:0};
  const allocateCustomerBonusForSupport=(customer,context)=>{
    const normal=calculateNormalCustomerBonus(customer);
    const journeyDay=getJourneyDay(context.startDate,customer.dateGathered);
    if(!customer.supported||normal===0)return {gatheringPartner:normal,recruiter:0,normal};
    if(journeyDay!==null&&journeyDay<=ENHANCED_SUPPORT_END_DAY)return {gatheringPartner:normal,recruiter:Math.round(normal*0.5),normal};
    return {gatheringPartner:Math.round(normal*0.5),recruiter:Math.round(normal*0.5),normal};
  };
  const calculateQDStatus=(context)=>{
    const customers=orderGatheredCustomers(context.gatheredCustomers||[]);
    const ownCounts=!!context.ownAccountQualifiesForFastStart;
    const ownDay=context.ownAccountDate?getJourneyDay(context.startDate,context.ownAccountDate):null;
    const ownEligible=ownCounts&&(!context.ownAccountDate||(ownDay!==null&&ownDay>=1&&ownDay<=30));
    const requiredGathered=ownEligible?5:6;
    const qualifyingCustomers=customers.filter(c=>{
      const day=getJourneyDay(context.startDate,c.dateGathered);
      return day!==null&&day>=1&&day<=30&&c.customerNumber<=requiredGathered;
    }).length;
    const introDay=context.introducedPartnerDate?getJourneyDay(context.startDate,context.introducedPartnerDate):null;
    const partnerIntroduced=!!context.partnerIntroduced&&(introDay===null||introDay>=1);
    const achieved=partnerIntroduced&&qualifyingCustomers>=requiredGathered;
    const achievedWithin30=achieved&&(introDay===null||introDay<=30);
    return {achieved,achievedWithin30,requiredGathered,qualifyingCustomers,ownEligible,partnerIntroduced};
  };
  const calculateEarnings=(context)=>{
    const ordered=orderGatheredCustomers(context.gatheredCustomers||[]);
    const hab=calculateHighActivityBonusByCalendarMonth(ordered);
    const qd=calculateQDStatus({...context,gatheredCustomers:ordered});
    const rows=ordered.map(customer=>{
      const journeyDay=getJourneyDay(context.startDate,customer.dateGathered);
      const support=allocateCustomerBonusForSupport(customer,context);
      const momentum=calculateMomentum(customer,context);
      const habAmount=hab.perCustomer[customer.id]||0;
      return {
        ...customer,
        journeyDay,
        calendarMonth:calendarMonthKey(customer.dateGathered),
        normalCustomerBonus:support.normal,
        customerBonusGatheringPartner:support.gatheringPartner,
        supportingCustomerBonus:support.recruiter,
        highActivityBonus:habAmount,
        momentumGatheringPartner:momentum.gatheringPartner,
        momentumRecruiter:momentum.recruiter,
      };
    });
    const gatheringBreakdown={
      customerBonus:rows.reduce((sum,r)=>sum+r.customerBonusGatheringPartner,0),
      highActivityBonus:hab.total,
      qdBonus:qd.achieved?QD_BONUS:0,
      fastStarterBonus:qd.achievedWithin30?FAST_STARTER_BONUS:0,
      momentumBonus:rows.reduce((sum,r)=>sum+r.momentumGatheringPartner,0),
      recurringResidualIncome:context.recurringResidualIncome||0,
    };
    gatheringBreakdown.total=Object.values(gatheringBreakdown).reduce((sum,val)=>sum+val,0);
    const recruiterBreakdown={
      supportingCustomerBonus:rows.reduce((sum,r)=>sum+r.supportingCustomerBonus,0),
      qdMentorBonus:qd.achieved?QD_MENTOR_BONUS:0,
      fastStarterMentorBonus:qd.achievedWithin30?FAST_STARTER_MENTOR_BONUS:0,
      momentumBonus:rows.reduce((sum,r)=>sum+r.momentumRecruiter,0),
    };
    recruiterBreakdown.total=Object.values(recruiterBreakdown).reduce((sum,val)=>sum+val,0);
    return {customers:rows,hab,qd,gatheringBreakdown,recruiterBreakdown};
  };
  const runAcceptanceTests=()=>{
    const makeCustomer=(number,date,type='homeowner',services=4,supported=false)=>({id:`c${number}`,dateGathered:date,type,services,supported});
    const assert=(name,condition,details='')=>{if(!condition)throw new Error(`${name}${details?`: ${details}`:''}`);};
    let ctx={startDate:'2026-09-01',ownAccountQualifiesForFastStart:true,ownAccountDate:'2026-09-01',partnerIntroduced:true,introducedPartnerDate:'2026-09-20',gatheredCustomers:[
      ...[1,2,3,4,5].map(n=>makeCustomer(n,`2026-09-${String(n+1).padStart(2,'0')}`,'homeowner',4,true)),
      ...[6,7,8,9,10].map(n=>makeCustomer(n,`2026-10-${String(n).padStart(2,'0')}`,'homeowner',4,false)),
    ]};
    let result=calculateEarnings(ctx);
    assert('TEST 1 gathering total',result.gatheringBreakdown.total===5125,result.gatheringBreakdown.total);
    assert('TEST 1 recruiter total',result.recruiterBreakdown.total===1775,result.recruiterBreakdown.total);
    ctx={startDate:'2026-09-01',ownAccountQualifiesForFastStart:false,partnerIntroduced:true,introducedPartnerDate:'2026-09-20',gatheredCustomers:[1,2,3,4,5,6,7].map(n=>makeCustomer(n,`2026-09-${String(n).padStart(2,'0')}`,'homeowner',3,false))};
    result=calculateEarnings(ctx);
    assert('TEST 2 QD without own account',result.qd.achievedWithin30&&result.customers[5].customerNumber===6&&result.customers[5].momentumGatheringPartner===0);
    ctx={startDate:'2026-09-01',ownAccountQualifiesForFastStart:true,ownAccountDate:'2026-09-01',partnerIntroduced:true,introducedPartnerDate:'2026-09-20',gatheredCustomers:[1,2,3,4,5,6,7].map(n=>makeCustomer(n,`2026-09-${String(n+1).padStart(2,'0')}`,'homeowner',3,false))};
    result=calculateEarnings(ctx);
    assert('TEST 3 own account does not advance momentum',result.customers[5].momentumGatheringPartner===0&&result.customers[6].momentumGatheringPartner===125);
    ctx={startDate:'2026-09-01',partnerIntroduced:false,gatheredCustomers:[1,2,3,4,5,6,7,8,9,10].map(n=>makeCustomer(n,`2026-09-${String(n).padStart(2,'0')}`,'tenant',3,false))};
    result=calculateEarnings(ctx);
    assert('TEST 4 early momentum tenants',result.gatheringBreakdown.momentumBonus===500&&result.recruiterBreakdown.momentumBonus===500);
    ctx={startDate:'2026-09-01',gatheredCustomers:[1,2,3].map(n=>makeCustomer(n,`2026-09-${String(n).padStart(2,'0')}`,'tenant',3,false)).concat([4,5,6,7,8,9,10].map(n=>makeCustomer(n,`2026-10-${String(n).padStart(2,'0')}`,'tenant',3,false)))};
    result=calculateEarnings(ctx);
    assert('TEST 5 slow starter',result.gatheringBreakdown.momentumBonus===875&&result.recruiterBreakdown.momentumBonus===875);
    ctx={startDate:'2026-09-01',gatheredCustomers:[1,2,3,4,5,6].map(n=>makeCustomer(n,`2026-09-${String(n).padStart(2,'0')}`,'tenant',3,false)).concat([makeCustomer(7,'2026-09-25','tenant',3,true),makeCustomer(8,'2026-09-26','tenant',3,false)])};
    result=calculateEarnings(ctx);
    assert('TEST 6 supported early momentum',result.customers[6].momentumGatheringPartner===0&&result.customers[7].momentumGatheringPartner===125);
    ctx={startDate:'2026-09-01',gatheredCustomers:[1,2,3,4,5,6,7,8].map(n=>makeCustomer(n,`2026-09-${String(n).padStart(2,'0')}`,'tenant',3,false)).concat([makeCustomer(9,'2026-10-10','tenant',2,false),makeCustomer(10,'2026-10-11','tenant',3,false)])};
    result=calculateEarnings(ctx);
    assert('TEST 7 non-qualifying uses position',result.customers[8].momentumGatheringPartner===0&&result.customers[9].momentumGatheringPartner===125);
    ctx={startDate:'2026-09-01',gatheredCustomers:[makeCustomer(1,'2026-09-02','homeowner',3,false),makeCustomer(2,'2026-09-03','homeowner',3,false),makeCustomer(3,'2026-09-04','homeowner',3,false),makeCustomer(4,'2026-10-02','homeowner',3,false)]};
    result=calculateEarnings(ctx);
    assert('TEST 8 split HAB locked',result.gatheringBreakdown.highActivityBonus===0);
    ctx.gatheredCustomers.push(makeCustomer(5,'2026-10-03','homeowner',3,false),makeCustomer(6,'2026-10-04','homeowner',3,false),makeCustomer(7,'2026-10-05','homeowner',3,false));
    result=calculateEarnings(ctx);
    assert('TEST 8 October unlocks only',result.hab.months['2026-10'].total===400&&(!result.hab.months['2026-09']||result.hab.months['2026-09'].total===0));
    ctx={startDate:'2026-09-01',gatheredCustomers:[makeCustomer(1,'2026-10-10','homeowner',4,true)]};
    result=calculateEarnings(ctx);
    assert('TEST 9 supported after day 30',result.customers[0].customerBonusGatheringPartner===150&&result.customers[0].supportingCustomerBonus===150&&result.customers[0].momentumGatheringPartner===0);
    ctx={startDate:'2026-07-04',gatheredCustomers:[makeCustomer(1,'2026-08-31','tenant',3,false),makeCustomer(2,'2026-09-01','tenant',3,false)]};
    result=calculateEarnings(ctx);
    assert('TEST 10 effective date',result.customers[0].momentumGatheringPartner===0&&result.customers[1].momentumGatheringPartner===125);
    ctx={startDate:'2026-09-01',ownAccountQualifiesForFastStart:true,ownAccountDate:'2026-09-01',gatheredCustomers:[1,2,3,4,5,6,7,8,9,10].map(n=>makeCustomer(n,`2026-10-${String(n).padStart(2,'0')}`,'tenant',3,false))};
    result=calculateEarnings(ctx);
    assert('TEST 11 C10 remains eligible',result.customers[9].customerNumber===10&&result.customers[9].momentumGatheringPartner===125);
    return {passed:11};
  };
  const api={CUSTOMER_BONUS_TABLE,HAB_THRESHOLD,HAB_PER_QUALIFYING_CUSTOMER,MOMENTUM_EFFECTIVE_DATE,MOMENTUM_MAX_GATHERED_CUSTOMER_NUMBER,MOMENTUM_GATHERING_PARTNER_AMOUNT,MOMENTUM_RECRUITER_AMOUNT,ENHANCED_SUPPORT_END_DAY,QD_BONUS,FAST_STARTER_BONUS,QD_MENTOR_BONUS,FAST_STARTER_MENTOR_BONUS,addDays,getJourneyDay,orderGatheredCustomers,calculateNormalCustomerBonus,calculateHighActivityBonusByCalendarMonth,isMomentumEligible,calculateMomentum,allocateCustomerBonusForSupport,calculateQDStatus,calculateEarnings,runAcceptanceTests};
  root.UWEarningsRules=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
