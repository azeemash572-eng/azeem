(function(){
  var btn=document.querySelector('.menu-btn'),links=document.querySelector('.links');
  btn.addEventListener('click',function(){var o=links.classList.toggle('open');btn.setAttribute('aria-expanded',o);});
  links.addEventListener('click',function(e){if(e.target.tagName==='A'){links.classList.remove('open');btn.setAttribute('aria-expanded','false');}});
  document.getElementById('year').textContent=new Date().getFullYear();

  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el);});
  } else els.forEach(function(el){el.classList.add('in');});

  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  function rnd(a,b){return a+Math.random()*(b-a);}
  function gauss(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5;}
  function starColor(){var r=Math.random();
    if(r<.07)return [243,201,139];          // warm gold
    if(r<.45)return [159,212,255];          // ice blue
    if(r<.6)return [200,225,255];
    return [242,245,255];}                  // white
  function sparkle(ctx,x,y,s,a){
    ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='lighter';
    var g=ctx.createRadialGradient(x,y,0,x,y,s*1.2);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.25,'rgba(190,225,255,.35)');g.addColorStop(1,'rgba(159,212,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,s*1.2,0,6.283);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();var w=s*.09;
    ctx.moveTo(x,y-s*2);ctx.quadraticCurveTo(x+w,y-w,x+s*2,y);ctx.quadraticCurveTo(x+w,y+w,x,y+s*2);ctx.quadraticCurveTo(x-w,y+w,x-s*2,y);ctx.quadraticCurveTo(x-w,y-w,x,y-s*2);ctx.fill();
    ctx.restore();}

  /* ---- fixed starfield ---- */
  var sc=document.getElementById('stars'),sx=sc.getContext('2d'),field=[],SW,SH,haze;
  function initStars(){
    SW=sc.width=innerWidth*DPR;SH=sc.height=innerHeight*DPR;
    var n=Math.round(innerWidth*innerHeight/2600);field=[];
    for(var i=0;i<n;i++){var c=Math.random()<.05?[243,201,139]:(Math.random()<.4?[159,212,255]:[242,245,255]);
      field.push({x:Math.random()*SW,y:Math.random()*SH,r:(Math.random()<.92?rnd(.3,.8):rnd(.9,1.4))*DPR,a:rnd(.2,.8),p:Math.random()*6.28,s:rnd(.4,1.6),c:c});}
    haze=document.createElement('canvas');haze.width=SW;haze.height=SH;var hx=haze.getContext('2d');
    [[.18,.3,.5,'rgba(70,110,170,.06)'],[.82,.7,.55,'rgba(90,120,190,.05)'],[.6,.15,.35,'rgba(243,201,139,.025)']].forEach(function(h){var g=hx.createRadialGradient(h[0]*SW,h[1]*SH,0,h[0]*SW,h[1]*SH,h[2]*Math.max(SW,SH));g.addColorStop(0,h[3]);g.addColorStop(1,'rgba(0,0,0,0)');hx.fillStyle=g;hx.fillRect(0,0,SW,SH);});
    drawStars(0);}
  function drawStars(t){
    sx.clearRect(0,0,SW,SH);
    sx.drawImage(haze,0,0); // soft nebula haze (pre-rendered)
    for(var i=0;i<field.length;i++){var s=field[i],a=s.a*(reduce?1:.65+.35*Math.sin(t*.001*s.s+s.p));
      sx.fillStyle='rgba('+s.c[0]+','+s.c[1]+','+s.c[2]+','+a+')';sx.beginPath();sx.arc(s.x,s.y,s.r,0,6.283);sx.fill();}
  }

  /* ---- hero galaxy ---- */
  var gc=document.getElementById('galaxy'),gx=gc.getContext('2d'),parts=[],GW,GH,cx,cy,R,sparks=[];
  function initGalaxy(){
    var hero=gc.parentElement;GW=gc.width=hero.clientWidth*DPR;GH=gc.height=hero.clientHeight*DPR;
    var space=document.querySelector('.galaxy-space').getBoundingClientRect(),hr=hero.getBoundingClientRect();
    cx=GW/2;cy=(space.top-hr.top+space.height*.52)*DPR;
    R=Math.min(GW*.47,Math.max(space.height*.95,180)*DPR,600*DPR);
    var n=innerWidth<640?2200:4200;parts=[];
    var ARMS=2,TURNS=1.35;
    for(var i=0;i<n;i++){
      var p={};
      if(i<n*.16){ // bulge
        var rr=Math.pow(Math.random(),2.2)*.2;p.r=rr;p.th=Math.random()*6.283;p.size=rnd(.4,1.1);p.c=Math.random()<.5?[255,255,255]:[210,230,255];p.a=rnd(.5,1);
      }else if(i<n*.24){ // diffuse disk
        p.r=rnd(.1,1.05);p.th=Math.random()*6.283;p.size=rnd(.3,.8);p.c=starColor();p.a=rnd(.1,.35);
      }else{
        var arm=i%ARMS,t=Math.pow(Math.random(),.85);
        p.r=.12+t*.9;var spread=(.34-.18*t)*gauss();
        p.th=arm*Math.PI+t*TURNS*6.283+spread;p.r+=gauss()*.025;
        p.size=Math.random()<.06?rnd(1.2,2):rnd(.4,1.1);p.c=starColor();p.a=rnd(.45,1);
      }
      p.w=.00009/(.25+p.r);p.tw=Math.random()*6.28;p.ts=rnd(.5,2.4);
      parts.push(p);}
    sparks=[{r:.55,th:.9},{r:.88,th:3.9},{r:.35,th:5.2}];
    if(innerWidth<640)sparks.length=2;
  }
  var tilt=.62,rot0=0;
  function drawGalaxy(t){
    gx.clearRect(0,0,GW,GH);
    var rot=reduce?0:t*1;gx.globalCompositeOperation='lighter';
    // haze
    var g=gx.createRadialGradient(cx,cy,0,cx,cy,R*1.1);g.addColorStop(0,'rgba(170,205,255,.16)');g.addColorStop(.35,'rgba(110,150,220,.06)');g.addColorStop(1,'rgba(60,90,160,0)');
    gx.fillStyle=g;gx.beginPath();gx.ellipse(cx,cy,R*1.1,R*1.1*tilt,0,0,6.283);gx.fill();
    for(var i=0;i<parts.length;i++){var p=parts[i],th=p.th+rot*p.w;
      var x=cx+Math.cos(th)*p.r*R,y=cy+Math.sin(th)*p.r*R*tilt;
      var a=p.a*(reduce?1:.6+.4*Math.sin(t*.002*p.ts+p.tw));
      gx.fillStyle='rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+a.toFixed(3)+')';
      var s=p.size*DPR;gx.fillRect(x-s/2,y-s/2,s,s);}
    // core
    var c=gx.createRadialGradient(cx,cy,0,cx,cy,R*.22);c.addColorStop(0,'rgba(255,255,255,.95)');c.addColorStop(.18,'rgba(235,245,255,.55)');c.addColorStop(.5,'rgba(159,212,255,.14)');c.addColorStop(1,'rgba(159,212,255,0)');
    gx.fillStyle=c;gx.beginPath();gx.ellipse(cx,cy,R*.22,R*.22*tilt*1.15,0,0,6.283);gx.fill();
    gx.globalCompositeOperation='source-over';
    sparks.forEach(function(s,k){var th=s.th+rot*(.00009/(.25+s.r));
      var a=reduce?.9:.7+.3*Math.sin(t*.0015+k*2);
      sparkle(gx,cx+Math.cos(th)*s.r*R,cy+Math.sin(th)*s.r*R*tilt,(innerWidth<640?6:9)*DPR,a);});
  }
  var heroVisible=true,last=0,FRAME=1000/30;
  if('IntersectionObserver' in window){new IntersectionObserver(function(en){heroVisible=en[0].isIntersecting;}).observe(gc.parentElement);}
  function frame(t){if(t-last>=FRAME){last=t;drawStars(t);if(heroVisible)drawGalaxy(t);}if(!reduce)requestAnimationFrame(frame);}
  function initAll(){initStars();initGalaxy();drawGalaxy(0);}
  initAll();if(!reduce)requestAnimationFrame(frame);
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(initAll,150);});
})();
