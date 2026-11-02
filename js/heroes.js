// Original characters only.
const HEROES = [
  {id:'blaze',name:'Blaze Rush',power:'Fire dash: longer dash + flame trail',body:0xff5a2a,hair:0xffd23f,cape:0xb3122e},
  {id:'volt',name:'Volt Step',power:'Triple jump + speed boost on landing',body:0x2fb8ff,hair:0xfff35c,cape:0x1d3fd1},
  {id:'ichi',name:'Ichi',power:'Crimson Fang: long dash + crescent wave defeats enemies ahead',body:0x111111,hair:0xff8a1a,cape:0xc4101c},
  {id:'iron',name:'Ironclad',power:'Shield survives one crash per life',body:0x8a94a6,hair:0x3b3f4a,cape:0xe0a526},
  {id:'echo',name:'Echo',power:'Shadow clone magnetizes nearby gems',body:0x6b3fa0,hair:0x1b1030,cape:0x2de2c8},
  {id:'prism',name:'Prism',power:'Dash makes a light bridge over gaps',body:0xff7ad9,hair:0x7af3ff,cape:0xfff27a},
];
const Save = {
  get(k,d){try{const v=localStorage.getItem('herodash.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('herodash.'+k,JSON.stringify(v))}catch(e){}},
};
// migrate Featherfall save slot -> Ichi
(function(){try{const o=localStorage.getItem('herodash.hero.feather');if(o&&!localStorage.getItem('herodash.hero.ichi'))localStorage.setItem('herodash.hero.ichi',o);
  if(localStorage.getItem('herodash.selected')==='"feather"')localStorage.setItem('herodash.selected','"ichi"');}catch(e){}})();
const xpNeed = lvl => 30 + lvl*20;
function heroProgress(id){ return Save.get('hero.'+id,{level:1,xp:0}); }
function addXP(id,n){ const p=heroProgress(id); p.xp+=n; let ups=0;
  while(p.xp>=xpNeed(p.level)&&p.level<50){p.xp-=xpNeed(p.level);p.level++;ups++;}
  Save.set('hero.'+id,p); return ups; }
function drawHero(g,id,x,y,s,t,opts={}){ // x,y = feet center
  const h=HEROES.find(h=>h.id===id)||HEROES[0]; s=s||1; const a=opts.alpha??1;
  const run=Math.sin((t||0)*18)*6*s;
  g.fillStyle(h.cape,a); g.fillTriangle(x-6*s,y-40*s,x-30*s-run,y-14*s,x-4*s,y-18*s);
  g.fillStyle(0x1b1030,a); g.fillRect(x-9*s+run*0.5,y-14*s,6*s,14*s); g.fillRect(x+3*s-run*0.5,y-14*s,6*s,14*s);
  g.fillStyle(h.body,a); g.fillRoundedRect(x-11*s,y-38*s,22*s,26*s,5*s);
  g.fillStyle(0xffe0c2,a); g.fillCircle(x,y-48*s,11*s);
  g.fillStyle(h.hair,a);
  g.fillTriangle(x-12*s,y-50*s,x-26*s,y-62*s,x-2*s,y-58*s);
  g.fillTriangle(x-6*s,y-56*s,x-8*s,y-72*s,x+8*s,y-58*s);
  g.fillTriangle(x+2*s,y-58*s,x+16*s,y-68*s,x+12*s,y-50*s);
  g.fillStyle(0x1b1030,a); g.fillRect(x+3*s,y-50*s,3*s,5*s);
  g.fillStyle(0xffffff,a); g.fillRect(x-14*s,y-34*s,28*s,4*s); // headband/belt flair
  if(opts.shield){ g.lineStyle(3,0x9fe8ff,0.8); g.strokeCircle(x,y-34*s,34*s); }
}
