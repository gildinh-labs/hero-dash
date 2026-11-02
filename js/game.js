const H=540;
// ---- device / viewport adaptation ----
const DEV={touch:('ontouchstart' in window)||navigator.maxTouchPoints>0,dpr:window.devicePixelRatio||1,
  cores:navigator.hardwareConcurrency||4,mem:navigator.deviceMemory||4};
DEV.quality=(DEV.cores<=4||DEV.mem<=2||(DEV.touch&&DEV.dpr>=3&&DEV.cores<=6))?'low':'high';
function calcW(){const a=Math.min(21/9,Math.max(4/3,window.innerWidth/Math.max(1,window.innerHeight)));return Math.round(H*a/2)*2;}
let W=calcW();
const Q=()=>DEV.quality==='low'?{parts:0.4,lines:5,stars:15}:{parts:1,lines:14,stars:40};
function cornerUI(scene){ muteUI(scene,scene.scale.fullscreenAvailable?W-56:W-12); // fullscreen button + input hints, anchored to edges
  if(scene.scale.fullscreenAvailable&&!(/iPhone|iPod/.test(navigator.userAgent))){
    const fs=scene.add.text(W-12,12,'⛶',{fontFamily:'Arial',fontSize:26,color:'#fff',backgroundColor:'#120a2a99',padding:{x:6,y:0}}).setOrigin(1,0).setInteractive().setDepth(5);
    fs.on('pointerup',(p,x,y,e)=>{e&&e.stopPropagation&&e.stopPropagation();scene.scale.isFullscreen?scene.scale.stopFullscreen():scene.scale.startFullscreen();});
    return fs;}
}
const CALLOUTS={2:'NICE!',3:'GO BEYOND!',5:'UNSTOPPABLE!',8:'HERO MODE!',12:'LIMIT BREAK!!'};

const DIFFS={
  easy:  {name:'EASY',  col:'#3ddc84',speed:270,ramp:3,  maxSpeed:520,gear:6, zb:[20,30],gap:[60,115], gapMul:1.25,crate:0.18,fire:0.6,pSpd:0.75,lives:5,wallSnap:Infinity,coyote:0.16,buffer:0.18},
  medium:{name:'MEDIUM',col:'#ffd23f',speed:305,ramp:4.5,maxSpeed:640,gear:8, zb:[25,35],gap:[80,145], gapMul:1.45,crate:0.30,fire:1,pSpd:1,lives:3,wallSnap:16,coyote:0.10,buffer:0.12},
  hard:  {name:'HARD',  col:'#ff3d7f',speed:360,ramp:7.5,maxSpeed:800,gear:10,zb:[30,45],gap:[110,190],gapMul:1.8, crate:0.48,fire:1.45,pSpd:1.3,lives:3,wallSnap:4, coyote:0.04,buffer:0.06},
};
const DIFF_KEYS=['easy','medium','hard'];
function getDiff(){const d=Save.get('difficulty','medium');return DIFFS[d]?d:'medium'}
function skyBg(scene){ // gradient sky texture
  if(scene.textures.exists('sky'))return;
  const c=scene.textures.createCanvas('sky',4,H),ctx=c.getContext();
  const gr=ctx.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'#3a1c71');gr.addColorStop(0.5,'#d76d77');gr.addColorStop(1,'#ffaf7b');
  ctx.fillStyle=gr;ctx.fillRect(0,0,4,H);c.refresh();
}
function skyImg(sc){skyBg(sc);return sc.add.image(0,0,'sky').setOrigin(0).setDisplaySize(W,H).setDepth(-5);}

class SplashScene extends Phaser.Scene{
  constructor(){super('splash')}
  create(){
    makeHeroTextures(this); AUD.play('title');
    if(!this.textures.exists('splashsky')){const c=this.textures.createCanvas('splashsky',4,H),x=c.getContext(),gr=x.createLinearGradient(0,0,0,H);
      gr.addColorStop(0,'#0b0630');gr.addColorStop(0.45,'#5a1d8c');gr.addColorStop(0.75,'#ff4f7b');gr.addColorStop(1,'#ffb35c');x.fillStyle=gr;x.fillRect(0,0,4,H);c.refresh();}
    this.add.image(0,0,'splashsky').setOrigin(0).setDisplaySize(W,H);
    this.bg=this.add.graphics();
    this.lines=[...Array(DEV.quality==='low'?14:36)].map(()=>({x:Math.random()*W,y:Math.random()*H,l:60+Math.random()*200,v:600+Math.random()*900}));
    this.hills=[...Array(Math.ceil(W/110)+3)].map((_,i)=>({x:i*110,h:40+Math.random()*90}));
    // synthwave sun + twinkling stars fill the space the hero lineup used to occupy
    this.sunY=H-58; this.stars=[...Array(DEV.quality==='low'?20:50)].map(()=>({x:Math.random()*W,y:Math.random()*H*0.55,p:Math.random()*6.28}));
    const LY=Math.round(H*0.33), ttl={fontFamily:'Impact,Arial Black,sans-serif',fontSize:124,fontStyle:'italic',color:'#fff'};
    this.glow=this.add.text(W/2,LY,'HERO DASH',{...ttl,color:'#ff3d7f',stroke:'#ff3d7f',strokeThickness:26}).setOrigin(0.5).setAlpha(0.45);
    this.logo=this.add.text(W/2,LY,'HERO DASH',{...ttl,stroke:'#1b1030',strokeThickness:14}).setOrigin(0.5);
    const gr=this.logo.context.createLinearGradient(0,10,0,this.logo.height-10);
    gr.addColorStop(0,'#fff8b0');gr.addColorStop(0.45,'#ffd23f');gr.addColorStop(0.55,'#ff7a1a');gr.addColorStop(1,'#ff3d7f');
    this.logo.setFill(gr); this.logo.setShadow(6,6,'#1b1030',0,true,false);
    this.tweens.add({targets:[this.logo,this.glow],scale:1.05,angle:-2,duration:900,yoyo:true,repeat:-1,ease:'Sine.inOut'});
    this.tweens.add({targets:this.glow,alpha:0.15,duration:700,yoyo:true,repeat:-1});
    this.prompt=this.add.text(W/2,LY+120,'TAP / PRESS START',{fontFamily:'Arial Black,Arial',fontSize:30,color:'#fff',stroke:'#ff3d7f',strokeThickness:6}).setOrigin(0.5);
    this.tweens.add({targets:this.prompt,alpha:0.25,scale:0.94,duration:650,yoyo:true,repeat:-1});
    cornerUI(this);
    this.add.text(W/2,LY+162,DEV.touch?'Tap left = JUMP  •  Tap right = DASH':'Z / ↑ / Space = JUMP  •  X / Shift = DASH',{fontFamily:'Arial',fontSize:15,color:'#fff'}).setOrigin(0.5).setAlpha(0.85);
    const bs=Save.get('best',0); this.add.text(W/2,H-29,bs?'★ BEST '+bs+' ★':'★ NEW HERO — SET A RECORD! ★',{fontFamily:'Arial Black,Arial',fontSize:18,color:'#fff8b0',stroke:'#1b1030',strokeThickness:5}).setOrigin(0.5);
    const go=()=>{ if(this.going)return; this.going=true; this.cameras.main.flash(200,255,255,255); this.time.delayedCall(180,()=>this.scene.start('select')); };
    this.input.on('pointerdown',go); this.input.keyboard.on('keydown-ENTER',go); this.input.keyboard.on('keydown-SPACE',go);
  }
  update(t,d){ const g=this.bg,dt=d/1000; g.clear();
    this.stars.forEach(s=>{g.fillStyle(0xffffff,0.35+0.35*Math.sin(t/400+s.p));g.fillRect(s.x,s.y,2,2);});
    const sr=112,sx=W/2,sy=this.sunY, SC=[0xffe27a,0xffc45c,0xff9a4a,0xff6a5c,0xff4f7b];
    for(let k=0;k<5;k++){const y0=sy-sr+k*sr/5; g.fillStyle(SC[k],0.92); for(let y=y0;y<y0+sr/5;y+=4){const hw=Math.sqrt(Math.max(0,sr*sr-(sy-y)**2)); g.fillRect(sx-hw,y,hw*2,4);} }
    g.fillStyle(0x5a1d8c,1); for(let k=0;k<6;k++){const yy=sy-8-k*16-((t/70)%16), hw=Math.sqrt(Math.max(0,sr*sr-(sy-yy)**2)); g.fillRect(sx-hw,yy,hw*2,2+(5-k)*0.8);}
    g.fillStyle(0x2b0f4f,0.7); this.hills.forEach(h=>{h.x-=60*dt; if(h.x<-120)h.x+=this.hills.length*110; g.fillTriangle(h.x-80,H-50,h.x,H-50-h.h,h.x+80,H-50);});
    g.fillStyle(0x1b1030,1); g.fillRect(0,H-58,W,58); g.fillStyle(0x7af3ff,1); g.fillRect(0,H-58,W,5);
    this.lines.forEach(l=>{l.x-=l.v*dt; if(l.x+l.l<0){l.x=W+Math.random()*200;l.y=Math.random()*(H-80);} g.lineStyle(2,0xffffff,0.35); g.lineBetween(l.x,l.y,l.x+l.l,l.y);});
  }
}

class SelectScene extends Phaser.Scene{
  constructor(){super('select')}
  create(){
    skyImg(this);
    this.sel=Math.max(0,HEROES.findIndex(h=>h.id===Save.get('selected','blaze')));
    makeHeroTextures(this); AUD.play('title');
    this.add.text(W/2,40,'SELECT YOUR HERO',{fontFamily:'Arial Black,Arial',fontSize:28,color:'#fff',stroke:'#3a1c71',strokeThickness:6}).setOrigin(0.5);
    this.diff=getDiff();
    cornerUI(this);
    this.sub=this.add.text(W/2,74,'',{fontFamily:'Arial',fontSize:16,color:'#fff'}).setOrigin(0.5);
    this.dBtns=DIFF_KEYS.map((d,i)=>{const t=this.add.text(W/2+(i-1)*130,100,`${i+1} ${DIFFS[d].name}`,{fontFamily:'Arial Black,Arial',fontSize:15,color:'#fff',padding:{x:10,y:3}}).setOrigin(0.5).setInteractive();
      t.on('pointerdown',()=>this.setDiff(d)); return t;});
    this.setDiff(this.diff);
    this.g=this.add.graphics().setDepth(-1); this.cards=[];
    HEROES.forEach((h,i)=>{
      const cx=W/2-310+(i%3)*310, cy=200+Math.floor(i/3)*190;
      const z=this.add.zone(cx,cy,290,175).setInteractive();
      z.on('pointerdown',()=>{ if(this.sel===i)this.start(); this.sel=i; });
      const p=heroProgress(h.id);
      this.add.text(cx-50,cy-70,h.name,{fontFamily:'Arial Black,Arial',fontSize:18,color:'#fff'});
      this.add.text(cx-50,cy-44,h.power,{fontFamily:'Arial',fontSize:13,color:'#fff',wordWrap:{width:185}});
      this.add.text(cx-50,cy+30,'Lv '+p.level+'  XP '+p.xp+'/'+xpNeed(p.level),{fontFamily:'Arial',fontSize:13,color:'#ffe9a8'});
      const spr=this.add.sprite(cx-95,cy+62,'hero_'+h.id,'pose').setOrigin(0.5,1).setScale(3.6);
      this.cards.push({cx,cy,h,p,spr});
    });
    const b=this.add.text(W/2,H-30,''+(DEV.touch?'▶ START (tap selected hero)':'▶ START (Enter / Space)')+'',{fontFamily:'Arial Black,Arial',fontSize:22,color:'#fff',backgroundColor:'#ff3d7f',padding:{x:14,y:6}}).setOrigin(0.5).setInteractive();
    b.on('pointerdown',()=>this.start());
    const k=this.input.keyboard;
    k.on('keydown-LEFT',()=>this.sel=(this.sel+5)%6); k.on('keydown-RIGHT',()=>this.sel=(this.sel+1)%6);
    k.on('keydown-UP',()=>this.sel=(this.sel+3)%6); k.on('keydown-DOWN',()=>this.sel=(this.sel+3)%6);
    k.on('keydown-ENTER',()=>this.start());
    k.on('keydown-ONE',()=>this.setDiff('easy')); k.on('keydown-TWO',()=>this.setDiff('medium')); k.on('keydown-THREE',()=>this.setDiff('hard'));
    k.on('keydown-D',()=>this.setDiff(DIFF_KEYS[(DIFF_KEYS.indexOf(this.diff)+1)%3])); k.on('keydown-SPACE',()=>this.start());
  }
  setDiff(d){ this.diff=d; Save.set('difficulty',d);
    this.dBtns.forEach((t,i)=>{const on=DIFF_KEYS[i]===d; t.setBackgroundColor(on?DIFFS[DIFF_KEYS[i]].col:'#120a2a').setColor(on?'#1b1030':'#fff').setAlpha(on?1:0.75);});
    this.sub.setText(`Choose hero & difficulty (1/2/3 or D)  •  Best on ${DIFFS[d].name}: ${Save.get('best.'+d,0)}`); }
  start(){ Save.set('selected',HEROES[this.sel].id); this.scene.start('game',{hero:HEROES[this.sel].id,diff:this.diff}); }
  update(t){
    const g=this.g; g.clear();
    this.cards.forEach((c,i)=>{
      g.fillStyle(0x120a2a,i===this.sel?0.75:0.45); g.fillRoundedRect(c.cx-145,c.cy-87,290,175,14);
      if(i===this.sel){g.lineStyle(4,0xfff35c,1);g.strokeRoundedRect(c.cx-145,c.cy-87,290,175,14);}
      if(i===this.sel){ if(!c.spr.anims.isPlaying)c.spr.play('run_'+c.h.id); } else if(c.spr.anims.isPlaying){c.spr.stop();c.spr.setFrame('pose');}
      g.fillStyle(0x000000,0.5);g.fillRect(c.cx-50,c.cy+52,180,10);
      g.fillStyle(0x7af3ff,1);g.fillRect(c.cx-50,c.cy+52,180*Math.min(1,c.p.xp/xpNeed(c.p.level)),10);
    });
  }
}

class GameScene extends Phaser.Scene{
  constructor(){super('game')}
  init(d){
    this.heroId=d.hero||'blaze'; const lv=heroProgress(this.heroId).level;
    this.pow=1+Math.min(0.3,(lv-1)*0.02); // modest level boost
    this.diffKey=DIFFS[d.diff]?d.diff:getDiff(); this.D=DIFFS[this.diffKey];
    this.lives=this.D.lives; this.coyT=0; this.bufT=0; this.dist=0; this.bonus=0; this.combo=0; this.comboT=0; this.gems=0;
    this.speed=this.D.speed; this.rampSp=0; this.gear=0; this.zBoost=0; this.easeT=0; this.spdFx=0; this.t=0; this.ts=1; this.state='run'; this.boostT=0; this.goGone=false;
    this.R={time:0,enemies:0,gold:0,blue:0,maxCombo:0,topSpeed:0,zone:0}; // per-run stats (time = active run time, excludes slow-mo)
  }
  create(){
    skyImg(this);
    this.zone=new ZoneBG(this);
    this.bg=this.add.graphics(); this.g=this.add.graphics(); this.fx=this.add.graphics();
    const st=(s,c='#fff')=>({fontFamily:'Arial Black,Arial',fontSize:s,color:c,stroke:'#1b1030',strokeThickness:5});
    this.hud=this.add.text(14,10,'',st(20)); this.hud2=this.add.text(W-110,10,'',st(20)).setOrigin(1,0);
    this.call=this.add.text(W/2,150,'',st(56,'#fff35c')).setOrigin(0.5).setAlpha(0);
    this.mid=this.add.text(W/2,H/2,'',st(40)).setOrigin(0.5);
    this.spdT=this.add.text(14,38,'',st(16,'#7af3ff')).setDepth(2);
    this.clouds=[...Array(Math.ceil(W/140)+1)].map((_,i)=>({x:i*140,y:40+Math.random()*200,r:30+Math.random()*40}));
    this.stars=[...Array(Q().stars)].map(()=>({x:Math.random()*W,y:Math.random()*H*0.6}));
    this.hx=W*0.25; this.resetWorld();
    const k=this.input.keyboard;
    this.keys=k.addKeys('Z,UP,SPACE,X,SHIFT');
    ['Z','UP','SPACE'].forEach(n=>this.keys[n].on('down',()=>this.jump()));
    ['X','SHIFT'].forEach(n=>this.keys[n].on('down',()=>this.dash()));
    this.input.addPointer(2);
    this.input.on('pointerdown',(p,over)=>{ p.isJump=false;
      if(this.state==='over')return; // results panel buttons handle input
      if(over&&over.length)return; // tapped mute/fullscreen icon: don't jump/dash
      if(p.x<W/2){this.jump();p.isJump=true}else this.dash();
    });
    makeHeroTextures(this); makeEnemyTextures(this);
    this.echoSpr=this.add.sprite(0,0,'hero_echo','run0').setOrigin(0.5,1).setScale(SPR.SCALE).setAlpha(0.35).setTint(0x8a4dff).setVisible(this.heroId==='echo');
    this.heroSpr=this.add.sprite(0,0,'hero_'+this.heroId,'run0').setOrigin(0.5,1).setScale(SPR.SCALE);
    this.fx.setDepth(1); this.heroSpr.setDepth(0.6); this.echoSpr.setDepth(0.55); this.hud.setDepth(2); this.hud2.setDepth(2); this.call.setDepth(2); this.mid.setDepth(2);
    if(DEV.touch){ const bs={fontFamily:'Arial Black,Arial',fontSize:22,color:'#fff',backgroundColor:'#ffffff22',padding:{x:22,y:16}};
      this.add.text(18,H-18,'⤒ JUMP',bs).setOrigin(0,1).setAlpha(0.55).setDepth(3);
      this.add.text(W-18,H-18,'DASH »',bs).setOrigin(1,1).setAlpha(0.55).setDepth(3); }
    else { const kh=this.add.text(W/2,H-16,'Z/↑/Space jump (hold: float/double)  •  X/Shift dash',{fontFamily:'Arial',fontSize:14,color:'#fff'}).setOrigin(0.5,1).setAlpha(0.7).setDepth(3);
      this.time.delayedCall(6000,()=>this.tweens.add({targets:kh,alpha:0,duration:800})); }
    cornerUI(this); AUD.play('game');
    this.fpsAcc=0;this.fpsN=0;this.fpsLow=0;
    window.__hd=this;
  }
  resetWorld(){
    (this.obs||[]).forEach(o=>o.spr&&o.spr.destroy()); this.plats=[{x:-200,y:400,w:1400}]; this.obs=[]; this.shots=[]; this.gemsArr=[]; this.parts=[]; this.trail=[];
    this.bridges=[]; this.waves=[]; this.booms=[]; this.lastEnd=1200; this.lastY=400;
    this.spawnHero();
  }
  spawnHero(){
    this.hy=200; this.vy=0; this.grounded=false; this.jumps=0; this.dashT=0; this.dashCd=0;
    this.airDash=true; this.shield=this.heroId==='iron'; this.invuln=1.2;
    // safe ground under hero
    const sx=this.hx-150, ex=this.hx+450;
    this.plats=this.plats.filter(p=>p.x+p.w<sx-40||p.x>ex+80);
    this.plats.push({x:sx,y:400,w:ex-sx,safe:true});
    this.obs=this.obs.filter(o=>{const k=o.x>ex+80; if(!k&&o.spr)o.spr.destroy(); return k;}); this.shots=[]; this.obs.forEach(o=>{o.tel=0;o.cd=Math.max(o.cd,0.8);}); this.gemsArr=this.gemsArr.filter(g=>g.x<sx||g.x>ex+80);
    if(this.lastEnd<ex){this.lastEnd=ex;this.lastY=400;}
  }
  maxJumps(){return this.heroId==='volt'?3:2}
  jump(){
    if(this.state!=='run')return;
    if(this.jumps===0&&!this.grounded&&this.coyT>this.D.coyote)this.jumps=1; // coyote expired
    if(this.jumps<this.maxJumps()){ this.bufT=0; this.vy=-760; this.jumps++; this.grounded=false; this.dashT=0; AUD.sfx('jump');
      this.burst(this.hx,this.hy,0xffffff,8); }
    else this.bufT=this.D.buffer; // buffered: fires on landing
  }
  dash(){
    if(this.state!=='run'||this.dashCd>0||(!this.grounded&&!this.airDash))return;
    const blaze=this.heroId==='blaze'||this.heroId==='ichi';
    this.dashT=(blaze?0.55:0.35)*this.pow; this.dashCd=this.dashT+0.25; if(!this.grounded)this.airDash=false;
    this.vy=0; this.shake(0.006,120); AUD.sfx('dash');
    if(this.heroId==='ichi'){ this.waves.push({x:this.hx+30,y:this.hy-32,life:0.9}); this.callout('CRIMSON FANG!'); }
    if(this.heroId==='prism'&&!this.grounded) this.bridges.push({x:this.hx-20,y:this.hy,w:320*this.pow,life:1.6});
  }
  shake(i,d){this.cameras.main.shake(d,i)}
  burst(x,y,c,n,sp=250){n=Math.ceil(n*Q().parts);for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*sp;
    this.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0.6+Math.random()*0.4,c,r:2+Math.random()*4})}}
  callout(txt){this.call.setText(txt).setAlpha(1).setScale(0.4);
    this.tweens.add({targets:this.call,scale:1.1,duration:220,ease:'Back.out'});
    this.tweens.add({targets:this.call,alpha:0,delay:700,duration:400});}
  gen(){
    while(this.lastEnd<this.hx+W+600){
      const D=this.D, sp=this.speed/D.speed, w=Phaser.Math.Between(320,720), y=Phaser.Math.Clamp(this.lastY+Phaser.Math.Between(-110,90),220,470);
      let gap=Phaser.Math.Between(D.gap[0],D.gap[1])*Math.min(D.gapMul,sp);
      gap=Math.min(gap,this.reach(this.lastY-y)); // stay within single-jump reach at worst-case (eased) speed
      const x=this.lastEnd+gap; this.plats.push({x,y,w});
      // gems over gap
      for(let i=1;i<4;i++) this.gemsArr.push({x:x-gap+gap*i/4,y:Math.min(y,this.lastY)-60-Math.sin(i/4*Math.PI)*60,gold:Math.random()<0.04});
      let ox=x+160;
      while(ox<x+w-120){ const r=Math.random();
        if(r<this.D.crate) this.addEnemy(ox,y);
        else if(r<this.D.crate+0.4) for(let j=0;j<3;j++) this.gemsArr.push({x:ox+j*30,y:y-40,gold:Math.random()<0.04});
        ox+=Phaser.Math.Between(170,280); }
      this.lastEnd=x+w; this.lastY=y;
    }
  }
  // speed system: base + continuous ramp + gear steps (every 500m) + zone boosts, capped; eased after respawn
  targetSpeed(){ const D=this.D; return Math.min(D.maxSpeed,D.speed+this.rampSp+this.gear*D.gear+this.zBoost); }
  // horizontal distance covered by one jump (vy -760, g 2200) landing `rise` px higher, at 70% of current speed (respawn ease floor), 85% margin
  reach(rise){ const v=760,g=2200, d=v*v-2*g*Math.max(rise,0); if(d<=0)return 60; const t=(v+Math.sqrt(d))/g; return Math.max(60,0.7*this.speed*t*0.85); }
  speedStep(big){ if(big)this.time.delayedCall(900,()=>this.state==='run'&&this.callout('SPEED UP!!')); else this.callout('SPEED UP!'); this.spdFx=big?0.9:0.5; AUD.sfx('speedup'); this.shake(big?0.008:0.004,big?220:120); }
  updSpeed(dt){ const D=this.D, g=Math.floor(this.dist/500);
    this.rampSp+=D.ramp*dt;
    if(g>this.gear){ this.gear=g; if(g*500!==1500&&g*500!==4000)this.speedStep(false); }
    const zb=this.zone.zoneAt(this.dist)>=2?D.zb[0]+D.zb[1]:this.zone.zoneAt(this.dist)>=1?D.zb[0]:0;
    if(zb>this.zBoost){ this.zBoost=zb; this.speedStep(true); }
    const tgt=this.targetSpeed(); this.speed+= (tgt-this.speed)*Math.min(1,dt*6); if(Math.abs(tgt-this.speed)<0.5)this.speed=tgt;
    this.easeT=Math.max(0,this.easeT-dt); }
  curSpeed(){ return this.speed*(this.easeT>0?0.7+0.3*(1-this.easeT):1); }
  addEnemy(x,y){ const t=this.zone.zoneAt(this.dist+(x-this.hx)/10);
    const spr=this.add.sprite(0,0,'enemy_'+ESPR.KEYS[t],'idle0').setOrigin(0.5,1).setScale(ESPR.SCALE).setDepth(0.5);
    this.obs.push({x,y,w:40,h:56,type:t,spr,ph:Math.random()*6.28,cd:0.4+Math.random()*0.8,tel:0,n:0}); }
  killEnemy(o,col){ o.dead=true; AUD.sfx('smash'); this.R.enemies++; o.spr&&o.spr.destroy(); o.spr=null;
    const cx=o.x+20,cy=o.y-o.h/2; this.burst(cx,cy,col,26,380); this.burst(cx,cy,0xffffff,10,200);
    this.booms.push({x:cx,y:cy,life:0.3}); }
  // enemy attacks: sky = single slow straight shot; space = alternating 3-way spread / aimed shot. Telegraph TEL sec before firing.
  enemyAI(dt){ const D=this.D, TEL=0.6, safe=this.hx+250;
    for(const o of this.obs){ if(o.dead||o.type===0)continue;
      const onScr=o.x<W-30, ahead=o.x>safe;
      if(o.tel>0){ o.tel-=dt; if(!ahead){o.tel=0;continue;} if(o.tel<=0)this.fire(o); continue; }
      if(!onScr||!ahead)continue; o.cd-=dt;
      // only start telegraph if the shot will still leave from >=250px ahead of the hero
      if(o.cd<=0&&o.x-this.speed*TEL>safe){ o.tel=TEL; AUD.sfx('charge'); }
    } }
  fire(o){ const D=this.D, mx=o.x+2, my=o.y-(o.type===1?27:34)+this.bob(o), sp=(o.type===1?150:200)*D.pSpd;
    const S=(vx,vy,c)=>this.shots.push({x:mx,y:my,vx,vy,c,r:o.type===1?8:7});
    if(o.type===1){ S(-sp,0,0xff4fb0); o.cd=2.8/D.fire; }
    else { if(o.n++%2===0){ for(const a of [-0.26,0,0.26]) S(-Math.cos(a)*sp,Math.sin(a)*sp,0x7af3ff); }
      else { const ddx=this.hx-mx, ddy=(this.hy-30)-my, d=Math.hypot(ddx,ddy)||1; S(ddx/d*sp*1.15,ddy/d*sp*1.15,0xfff27a); }
      o.cd=2.1/D.fire; }
    AUD.sfx('shoot'); }
  bob(o){ return o.type===0?0:Math.sin(this.t*3+o.ph)*4; }
  crash(){
    if(this.invuln>0)return;
    if(this.shield){ this.shield=false; this.invuln=1; this.shake(0.012,250); this.callout('SHIELD!'); this.burst(this.hx,this.hy-30,0x9fe8ff,25); return 'saved'; }
    AUD.sfx('crash'); this.lives--; this.combo=0; this.state='slowmo'; this.ts=0.15; this.slowT=0;
    this.shake(0.02,500); this.burst(this.hx,this.hy-30,0xff3d7f,40,400);
    this.mid.setText(this.lives>0?`WISH LOST...  ${this.lives} LEFT`:'FINAL WISH SPENT!');
  }
  update(time,deltaMs){
    const realDt=Math.min(deltaMs/1000,0.05);
    // fps monitor: auto-drop to low quality if sustained <45fps
    if(DEV.quality==='high'){this.fpsAcc+=deltaMs;this.fpsN++; if(this.fpsAcc>2000){const f=1000*this.fpsN/this.fpsAcc; this.fpsLow=f<45?this.fpsLow+1:0; if(this.fpsLow>=2){DEV.quality='low';} this.fpsAcc=0;this.fpsN=0;}}
    if(this.state==='slowmo'){ this.slowT+=realDt;
      if(this.slowT>1.6){ this.mid.setText(''); this.ts=1;
        if(this.lives>0){ this.state='run'; this.easeT=1; this.spawnHero(); } // keep progress speed, 1s ease-in }
        else this.gameOver(); } }
    if(this.state==='over'){this.draw(0);return;}
    const dt=realDt*this.ts; this.t+=dt;
    if(this.state==='run') this.updSpeed(dt);
    const dashing=this.dashT>0, boost=this.boostT>0?1.15:1;
    const vx=this.curSpeed()*(dashing?1.7:1)*boost, dx=vx*dt;
    this.zone.update(this.state==='run'?dx:0,this.dist,this.t);
    if(this.state==='run'){ this.dist+=dx/10; const R=this.R; R.time+=realDt; R.topSpeed=Math.max(R.topSpeed,vx); R.zone=Math.max(R.zone,this.zone.cur);
      // scroll world
      for(const a of [this.plats,this.obs,this.shots,this.booms,this.gemsArr,this.bridges,this.waves,this.parts,this.trail]) for(const o of a) o.x-=dx;
      this.lastEnd-=dx; this.clouds.forEach(c=>{c.x-=dx*0.2;if(c.x<-100)c.x+=W+200});
      this.plats=this.plats.filter(p=>p.x+p.w>-50); this.obs=this.obs.filter(o=>{const k=o.x>-80&&!o.dead; if(!k&&o.spr)o.spr.destroy(); return k;});
      this.gemsArr=this.gemsArr.filter(g=>g.x>-50&&!g.got); this.gen();
      // physics
      this.dashT-=dt; this.dashCd-=dt; this.invuln-=dt; this.boostT-=dt; this.comboT-=dt; if(this.comboT<0)this.combo=0;
      const prevY=this.hy;
      if(this.dashT<=0){ this.vy+=2200*dt;
        const holding=this.keys.Z.isDown||this.keys.UP.isDown||this.keys.SPACE.isDown||this.input.activePointer.isDown&&this.input.activePointer.isJump;
        if(this.heroId==='ichi'&&holding&&this.vy>0) this.vy=Math.min(this.vy,260/this.pow);
      }
      this.hy+=this.vy*dt; const was=this.grounded; this.grounded=false;
      const surf=this.plats.concat(this.bridges);
      for(const p of surf){ if(this.hx+12>p.x&&this.hx-12<p.x+p.w&&this.vy>=0&&prevY<=p.y+2&&this.hy>=p.y){
        this.hy=p.y; this.vy=0; this.grounded=true; this.jumps=0; this.airDash=true;
        if(!was){ this.burst(this.hx,this.hy,0xffffff,6,120); if(this.heroId==='volt'){this.boostT=1*this.pow;} } } }
      this.bufT-=dt; if(this.grounded){ this.coyT=0; if(this.bufT>0){this.bufT=0;this.jump();} } else this.coyT+=dt;
      if(!this.grounded&&this.jumps===0&&this.coyT>this.D.coyote)this.jumps=1; // walked off edge (after coyote time)
      // side collision with platform face -> crash
      for(const p of this.plats){ if(this.hx+12>p.x&&this.hx<p.x+20&&this.hy>p.y+2&&this.hy-60<p.y+30){
        if(this.hy-p.y<=this.D.wallSnap){ this.hy=p.y; this.vy=0; this.grounded=true; this.jumps=0; this.airDash=true; this.coyT=0; } // grace: nudge up onto ledge
        else if(this.hy>p.y+8) this.crash(); break; } }
      if(this.hy>H+80) { this.invuln=0; this.shield=false; this.crash(); }
      // obstacles
      for(const o of this.obs){ if(this.hx+14>o.x&&this.hx-14<o.x+o.w&&this.hy>o.y-o.h&&this.hy-60<o.y){
        if(dashing||this.crash()==='saved'){ this.killEnemy(o,this.heroId==='blaze'?0xff7a1a:0xffd23f); this.combo++; this.R.maxCombo=Math.max(this.R.maxCombo,this.combo); this.comboT=3; this.bonus+=50*this.combo;
          this.shake(0.01,150);
          const c=CALLOUTS[this.combo]||(this.combo>12&&this.combo%5===0?'PLUS '+this.combo+'!':null); if(c)this.callout(c); }
        break; } }
      // enemy attacks + projectiles
      this.enemyAI(dt);
      for(const p of this.shots){ p.x+=p.vx*dt; p.y+=p.vy*dt;
        if(this.hx+14>p.x-p.r&&this.hx-14<p.x+p.r&&this.hy>p.y-p.r&&this.hy-60<p.y+p.r){
          if(dashing){ p.dead=true; this.bonus+=10; AUD.sfx('zap'); this.burst(p.x,p.y,p.c,10,200); }
          else if(this.invuln<=0){ p.dead=true; this.crash(); this.burst(p.x,p.y,p.c,10,200); } } }
      this.shots=this.shots.filter(p=>!p.dead&&p.x>-30&&p.x<W+60&&p.y>-30&&p.y<H+30);
      for(const b of this.booms)b.life-=dt; this.booms=this.booms.filter(b=>b.life>0);
      // gems
      const mag=(this.heroId==='echo'?170:30)*this.pow;
      for(const g of this.gemsArr){ const ddx=g.x-this.hx, ddy=g.y-(this.hy-30), d=Math.hypot(ddx,ddy);
        if(d<mag&&d>1){ g.x-=ddx/d*500*dt; g.y-=ddy/d*500*dt; }
        if(d<30){ g.got=true; AUD.sfx(g.gold?'gold':'gem'); this.gems+=g.gold?10:1; g.gold?this.R.gold++:this.R.blue++; this.burst(g.x,g.y,g.gold?0xffd700:0x7af3ff,8,150); } }
      for(const w of this.waves){ w.x+=700*dt; w.life-=dt;
        for(const o of this.obs) if(!o.dead&&o.x<w.x+30&&o.x+o.w>w.x-30&&o.y-o.h<w.y+50&&o.y>w.y-50){ this.killEnemy(o,0xc4101c); this.bonus+=50; }
        for(const p of this.shots) if(!p.dead&&Math.abs(p.x-w.x)<40&&Math.abs(p.y-w.y)<55){ p.dead=true; this.burst(p.x,p.y,p.c,6,150); }
        if(DEV.quality!=='low'&&Math.random()<0.6) this.parts.push({x:w.x-10,y:w.y+Math.random()*60-30,vx:-120,vy:-60,life:0.4,c:Math.random()<0.5?0x111111:0xff2a2a,r:3+Math.random()*3}); }
      this.waves=this.waves.filter(w=>w.life>0&&w.x<W+80);
      this.bridges.forEach(b=>b.life-=dt); this.bridges=this.bridges.filter(b=>b.life>0);
      if(dashing||this.heroId==='blaze'&&dashing) this.trail.push({x:this.hx,y:this.hy-30,life:0.4});
    }
    for(const p of this.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.life-=dt} this.parts=this.parts.filter(p=>p.life>0);
    for(const p of this.trail)p.life-=dt; this.trail=this.trail.filter(p=>p.life>0);
    this.draw(dt);
  }
  score(){return Math.floor(this.dist)+this.bonus}
  gameOver(){
    this.state='over'; const s=this.score(), R=this.R, bk='best.'+this.diffKey, prev=Save.get(bk,0), best=Math.max(s,prev), isBest=s>prev&&s>0; Save.set(bk,best);
    Save.set('best',Math.max(s,Save.get('best',0)));
    const before=heroProgress(this.heroId), ups=addXP(this.heroId,this.gems), after=heroProgress(this.heroId);
    const L=Save.get('life',{runs:0,time:0,gems:0}); if(L.crates!=null){L.enemies=(L.enemies||0)+L.crates;delete L.crates;} L.runs++; L.time+=R.time; L.gems+=this.gems; L.enemies=(L.enemies||0)+R.enemies; Save.set('life',L);
    AUD.stop(); AUD.sfx(ups?'levelup':'gameover');
    window.__hdRun={score:s,best,isBest,time:R.time,dist:Math.floor(this.dist),zone:R.zone,gems:R.blue,gold:R.gold,enemies:R.enemies,maxCombo:R.maxCombo,wishes:this.D.lives-Math.max(0,this.lives),top:R.topSpeed,xp:this.gems,ups,life:L};
    this.buildResults(window.__hdRun,before,after);
  }
  buildResults(r,before,after){
    const T=(x,y,str,sz,col='#fff',o={})=>this.add.text(x,y,str,{fontFamily:'Arial Black,Arial',fontSize:sz,color:col,stroke:'#1b1030',strokeThickness:Math.max(3,sz/6|0),...o});
    const D=this.D, hero=HEROES.find(h=>h.id===this.heroId)||HEROES[0], P=PAL[this.heroId]||PAL.blaze;
    const mmss=t=>{t=Math.floor(t);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
    const RK={easy:[6000,3500,1800,800],medium:[5000,3000,1500,600],hard:[4000,2400,1200,500]}[this.diffKey];
    const rank=['S','A','B','C'][RK.findIndex(v=>r.score>=v)]||'D';
    const RC={S:'#fff35c',A:'#ff3d7f',B:'#7af3ff',C:'#3ddc84',D:'#b8a8d8'}[rank];
    // backdrop: dim + speed lines
    const dim=this.add.rectangle(0,0,W,H,0x0b0630,0.7).setOrigin(0).setDepth(9).setAlpha(0);
    this.tweens.add({targets:dim,alpha:1,duration:300});
    const C=this.add.container(0,0).setDepth(10);
    const pw=Math.min(W-32,940), ph=H-36, px=(W-pw)/2, py=18;
    const g=this.add.graphics(); C.add(g);
    const sk=26; // skewed fighting-game panel
    g.fillStyle(0x000000,0.45); g.fillPoints([{x:px+sk+8,y:py+8},{x:px+pw+8,y:py+8},{x:px+pw-sk+8,y:py+ph+8},{x:px+8,y:py+ph+8}],true);
    g.fillStyle(0x160c33,0.96); g.fillPoints([{x:px+sk,y:py},{x:px+pw,y:py},{x:px+pw-sk,y:py+ph},{x:px,y:py+ph}],true);
    g.lineStyle(4,0xfff35c,1); g.strokePoints([{x:px+sk,y:py},{x:px+pw,y:py},{x:px+pw-sk,y:py+ph},{x:px,y:py+ph}],true);
    g.fillStyle(0xffffff,0.04); for(let i=0;i<pw;i+=22) g.fillRect(px+i,py+4,10,ph-8);
    // header banner
    g.fillStyle(Phaser.Display.Color.HexStringToColor(D.col).color,1); g.fillPoints([{x:px+sk+10,y:py+10},{x:px+pw*0.62,y:py+10},{x:px+pw*0.62-16,y:py+58},{x:px+sk-6,y:py+58}],true);
    g.fillStyle(0xff3d7f,1); g.fillRect(px+pw*0.62+6,py+22,pw*0.38-sk-24,6); g.fillRect(px+pw*0.62+2,py+36,pw*0.38-sk-40,4);
    C.add(T(px+sk+22,py+14,'GAME OVER',34,'#ffffff',{fontStyle:'italic'}));
    C.add(T(px+pw*0.62-24,py+18,D.name,18,'#1b1030',{stroke:'#ffffff',strokeThickness:0}).setOrigin(1,0));
    // --- left: hero portrait ---
    const lx=px+34, lw=Math.min(200,pw*0.24), top=py+74;
    g.fillStyle(0x0b0630,1); g.fillRect(lx,top,lw,190); g.lineStyle(3,Phaser.Display.Color.HexStringToColor(P.acc).color,1); g.strokeRect(lx,top,lw,190);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(P.suit).color,0.35); for(let i=0;i<6;i++) g.fillTriangle(lx+lw/2,top+120,lx+i*lw/5-20,top,lx+i*lw/5+10,top);
    const spr=this.add.sprite(lx+lw/2,top+184,'hero_'+this.heroId,'pose').setOrigin(0.5,1).setScale(5.4); C.add(spr);
    C.add(T(lx+lw/2,top+198,hero.name.toUpperCase(),16).setOrigin(0.5,0));
    const lvT=T(lx,top+224,'Lv '+before.level,15,'#ffe9a8'); C.add(lvT);
    C.add(T(lx+lw,top+224,'+'+r.xp+' XP',15,'#7af3ff').setOrigin(1,0));
    const bx=lx, by=top+248, bw=lw; g.fillStyle(0x000000,0.6); g.fillRect(bx,by,bw,12); g.lineStyle(2,0xffffff,0.6); g.strokeRect(bx,by,bw,12);
    const bar=this.add.graphics(); C.add(bar);
    const xp={lv:before.level,v:before.xp}; const drawBar=()=>{bar.clear();bar.fillStyle(0x7af3ff,1);bar.fillRect(bx+2,by+2,(bw-4)*Math.min(1,xp.v/xpNeed(xp.lv)),8);bar.fillStyle(0xffffff,0.6);bar.fillRect(bx+2,by+2,(bw-4)*Math.min(1,xp.v/xpNeed(xp.lv)),2);};
    drawBar();
    const lvUp=T(lx+lw/2,top+150,'LEVEL UP!',26,'#fff35c',{fontStyle:'italic',stroke:'#ff3d7f',strokeThickness:6}).setOrigin(0.5).setAlpha(0); C.add(lvUp);
    // --- center: score + stats ---
    const rkW=Math.min(170,pw*0.2), cx0=lx+lw+28, cw=px+pw-sk-rkW-cx0-14;
    C.add(T(cx0,top-4,'SCORE',15,'#ffe9a8'));
    const scT=T(cx0,top+12,'0',52,'#ffffff',{fontStyle:'italic'}); C.add(scT);
    C.add(T(cx0,top+76,'BEST ('+D.name+')  '+r.best,14,D.col));
    const nb=T(cx0+cw,top+30,'NEW BEST!',24,'#fff35c',{fontStyle:'italic',stroke:'#ff3d7f',strokeThickness:6}).setOrigin(1,0.5).setAngle(-8).setAlpha(0); C.add(nb);
    const Z=r.zone, rows=[
      ['TIME',mmss(r.time)],['DISTANCE',r.dist+' m'],['ZONE',ZONES[Z].name.replace(' ZONE!','').replace('!','')],['TOP SPEED',Math.round(r.top/10)+' m/s'],
      ['GEMS',''+r.gems],['GOLD GEMS',''+r.gold],['ENEMIES DEFEATED',''+r.enemies],['MAX COMBO','x'+r.maxCombo],['WISHES USED',r.wishes+' / '+D.lives]];
    const colW=cw/2, rh=38, sy=top+104;
    const rowsObjs=[];
    rows.forEach(([k,v],i)=>{const cX=cx0+(i%2)*colW, y=sy+Math.floor(i/2)*rh;
      g.fillStyle(0xffffff,0.05);g.fillRect(cX-6,y-8,colW-8,rh-6);const o=[T(cX,y,k,13,'#b8a8d8',{strokeThickness:3}), T(cX+colW-14,y-5,v,20,'#ffffff').setOrigin(1,0)];
      if(k==='ZONE'){const ic=this.add.graphics(); this.zoneIcon(ic,cX+colW-14-o[1].width-16,y+7,Z); o.push(ic);}
      o.forEach(e=>{e.setAlpha(0);C.add(e);}); rowsObjs.push(o);});
    // --- right: rank grade ---
    const rx=px+pw-sk-rkW/2-14, ry=top+70;
    C.add(T(rx,top-4,'RANK',15,'#ffe9a8').setOrigin(0.5,0));
    const rg=this.add.graphics(); C.add(rg); rg.fillStyle(0x0b0630,1); rg.fillCircle(rx,ry+20,58); rg.lineStyle(4,Phaser.Display.Color.HexStringToColor(RC).color,1); rg.strokeCircle(rx,ry+20,58);
    const rkT=this.add.text(rx,ry+22,rank,{fontFamily:'Impact,Arial Black,sans-serif',fontSize:104,fontStyle:'italic',color:RC,stroke:'#1b1030',strokeThickness:10}).setOrigin(0.5).setAlpha(0).setScale(3); C.add(rkT);
    C.add(T(rx,ry+92,{S:'LEGENDARY!',A:'HEROIC!',B:'GREAT!',C:'GOOD',D:'KEEP GOING'}[rank],14,RC).setOrigin(0.5,0));
    // --- buttons ---
    const btnY=py+ph-62, labels=[['RETRY','R'],['CHANGE HERO','H'],['TITLE','T']], bW=Math.min(200,(pw-sk*2-60)/3);
    this.goBtns=labels.map(([l,k],i)=>{const x=px+pw/2-sk/2+(i-1)*(bW+18);
      const t=this.add.text(x,btnY,l,{fontFamily:'Arial Black,Arial',fontSize:19,color:'#fff',fixedWidth:bW,align:'center',backgroundColor:'#2a1a55',padding:{x:0,y:8}}).setOrigin(0.5).setInteractive({useHandCursor:true});
      t.on('pointerover',()=>this.goFocus(i)); t.on('pointerup',()=>this.goPick(i)); C.add(t); return t;});
    this.goSel=0; this.goFocus(0);
    const kb=DEV.touch?'Tap a button':'←/→ select • Enter pick • R retry • H hero • T title';
    C.add(T(px+pw/2-sk/2,btnY+28,kb,11,'#b8a8d8',{strokeThickness:2}).setOrigin(0.5,0));
    const Lf=r.life; C.add(T(px+sk+4,py+ph-14,`LIFETIME  ${Lf.runs} runs • ${mmss(Lf.time)} • ${Lf.gems} gems • ${Lf.enemies||0} KO`,11,'#8f80b8',{strokeThickness:2}).setOrigin(0,1));
    // --- animation sequence: slide in, count up, reveal stats, rank stamp, xp fill ---
    C.x=W; this.tweens.add({targets:C,x:0,duration:420,ease:'Back.out',delay:150});
    const cnt={v:0}; this.tweens.add({targets:cnt,v:r.score,delay:560,duration:Math.min(1600,400+r.score/4),ease:'Cubic.out',onUpdate:()=>scT.setText(''+Math.floor(cnt.v)),
      onComplete:()=>{ scT.setText(''+r.score); if(r.isBest){ nb.setAlpha(1).setScale(0.2); this.tweens.add({targets:nb,scale:1,duration:300,ease:'Back.out'}); this.tweens.add({targets:nb,scale:1.12,yoyo:true,repeat:-1,duration:420,delay:320});
        this.goBurst(C,nb.x-nb.width/2,nb.y,0xfff35c); AUD.sfx('gold'); } }});
    rowsObjs.forEach((o,i)=>this.tweens.add({targets:o,alpha:1,x:'+=0',delay:620+i*70,duration:200}));
    this.time.delayedCall(1500,()=>{ this.tweens.add({targets:rkT,alpha:1,scale:1,duration:260,ease:'Back.out',onComplete:()=>{this.cameras.main.shake(160,0.008);this.goBurst(C,rx,ry+20,Phaser.Display.Color.HexStringToColor(RC).color);}}); AUD.sfx('smash'); });
    const fillTo=(lv,v,d,cb)=>this.tweens.add({targets:xp,v,duration:d,ease:'Sine.inOut',onUpdate:drawBar,onComplete:cb});
    let steps=after.level-before.level;
    const next=()=>{ if(steps>0){ fillTo(xp.lv,xpNeed(xp.lv),500,()=>{ steps--; xp.lv++; xp.v=0; lvT.setText('Lv '+xp.lv); drawBar();
        lvUp.setAlpha(1).setScale(0.3); this.tweens.add({targets:lvUp,scale:1,duration:300,ease:'Back.out'}); this.tweens.add({targets:lvUp,y:'-=6',yoyo:true,repeat:-1,duration:380});
        this.goBurst(C,lx+lw/2,top+150,0x7af3ff); next(); }); }
      else fillTo(xp.lv,after.xp,600,null); };
    this.time.delayedCall(900,next);
    // input
    this.goReady=false; this.time.delayedCall(500,()=>this.goReady=true);
    const k=this.input.keyboard;
    k.on('keydown-LEFT',()=>this.goFocus((this.goSel+2)%3)); k.on('keydown-RIGHT',()=>this.goFocus((this.goSel+1)%3));
    k.on('keydown-ENTER',()=>this.goPick(this.goSel)); k.on('keydown-SPACE',()=>this.goPick(this.goSel));
    k.on('keydown-R',()=>this.goPick(0)); k.on('keydown-H',()=>this.goPick(1)); k.on('keydown-C',()=>this.goPick(1)); k.on('keydown-T',()=>this.goPick(2)); k.on('keydown-ESC',()=>this.goPick(2));
    window.__hdOver=true;
  }
  goFocus(i){ this.goSel=i; this.goBtns.forEach((b,j)=>{const on=j===i; b.setBackgroundColor(on?'#ff3d7f':'#2a1a55').setColor(on?'#fff':'#d8ccff').setScale(on?1.06:1);}); }
  goPick(i){ if(!this.goReady||this.goGone)return; this.goGone=true; this.cameras.main.flash(160,255,255,255);
    this.time.delayedCall(140,()=>{ if(i===0)this.scene.start('game',{hero:this.heroId,diff:this.diffKey}); else if(i===1)this.scene.start('select'); else this.scene.start('splash'); }); }
  goBurst(C,x,y,c){ for(let i=0;i<14;i++){const a=i/14*6.283,s=this.add.rectangle(x,y,6,6,c).setAngle(45); C.add(s);
    this.tweens.add({targets:s,x:x+Math.cos(a)*70,y:y+Math.sin(a)*70,alpha:0,scale:0.3,duration:520,ease:'Cubic.out',onComplete:()=>s.destroy()});} }
  zoneIcon(g,x,y,z){ // tiny pixel icons: earth / sky / space
    const p=(a,b,w,h,c)=>{g.fillStyle(c,1);g.fillRect(x+a*2-8,y+b*2-8,w*2,h*2);};
    if(z===0){p(2,0,4,8,0x2f7dff);p(0,2,8,4,0x2f7dff);p(1,1,6,6,0x2f7dff);p(2,2,2,2,0x3fae4a);p(4,4,3,2,0x3fae4a);}
    else if(z===1){p(1,3,6,3,0xffffff);p(2,2,3,1,0xffffff);p(0,5,8,1,0xe6d6ff);}
    else {p(2,1,4,6,0xff9a5c);p(1,2,6,4,0xff9a5c);p(-1,4,10,1,0xfff27a);} }
  draw(dt){
    const g=this.g,bg=this.bg,fx=this.fx; g.clear();bg.clear();fx.clear();
    const PC=this.zone.plat(), zc=this.zone.cur;
    for(const p of this.plats){ g.fillStyle(PC[0],1); g.fillRoundedRect(p.x,p.y,p.w,36,zc===1?16:6);
      g.fillStyle(PC[1],1); g.fillRect(p.x+4,p.y,p.w-8,6);
      if(zc===0){ g.fillStyle(0x3a9a38,1); for(let x=p.x+8;x<p.x+p.w-8;x+=16) g.fillRect(x,p.y+6,6,4); }
      else if(zc===1){ g.fillStyle(0xd6dcff,1); g.fillRect(p.x+10,p.y+28,p.w-20,8); }
      else { g.fillStyle(0x2b2638,1); for(let x=p.x+14;x<p.x+p.w-20;x+=46) g.fillRect(x,p.y+14,10,8); g.fillStyle(0xff3d7f,1); for(let x=p.x+30;x<p.x+p.w-20;x+=92) g.fillRect(x,p.y+30,6,3);} }
    for(const b of this.bridges){ g.fillStyle(0xfff6ff,Math.min(1,b.life)); g.fillRect(b.x,b.y,b.w,6);
      g.fillStyle(0xff7ad9,0.4*Math.min(1,b.life)); g.fillRect(b.x,b.y-6,b.w,18); }
    const lo=DEV.quality==='low';
    for(const o of this.obs){ if(!o.spr)continue; const by=this.bob(o);
      o.spr.setPosition(o.x+20,o.y+2+by).setFrame(o.tel>0?(Math.floor(o.tel*16)%2?'charge':'idle0'):(Math.floor(this.t*3+o.ph)%2?'idle1':'idle0'));
      if(o.type!==0&&!lo){ g.fillStyle(0x000000,0.25); g.fillEllipse(o.x+20,o.y+2,30-by,6); }
      if(o.tel>0){ const k=1-o.tel/0.6, mx=o.x+2, my=o.y-(o.type===1?27:34)+by, c=o.type===1?0xff4fb0:(o.n%2===0?0x7af3ff:0xfff27a);
        fx.fillStyle(c,0.35+0.4*k); fx.fillCircle(mx,my,4+k*10); fx.fillStyle(0xffffff,0.9); fx.fillCircle(mx,my,2+k*4);
        fx.lineStyle(2,c,0.8*(1-k)); fx.strokeCircle(mx,my,26-k*20);
        if(o.type===2&&o.n%2===1){ fx.lineStyle(1,0xfff27a,0.35*k); fx.lineBetween(mx,my,this.hx,this.hy-30); } } }
    for(const p of this.shots){ if(!lo){ fx.fillStyle(p.c,0.3); fx.fillCircle(p.x,p.y,p.r+5); fx.fillStyle(p.c,0.25); fx.fillCircle(p.x-p.vx*0.04,p.y-p.vy*0.04,p.r); }
      fx.fillStyle(p.c,1); fx.fillCircle(p.x,p.y,p.r); fx.fillStyle(0xffffff,1); fx.fillCircle(p.x,p.y,p.r*0.45); }
    for(const b of this.booms){ const k=1-b.life/0.3; fx.lineStyle(4,0xffffff,1-k); fx.strokeCircle(b.x,b.y,10+k*45); fx.fillStyle(0xfff27a,0.6*(1-k)); fx.fillCircle(b.x,b.y,22*(1-k)+4); }
    for(const m of this.gemsArr){ const r=m.gold?11:8; g.fillStyle(m.gold?0xffd700:0x7af3ff,1);
      g.fillTriangle(m.x,m.y-r,m.x+r,m.y,m.x,m.y+r); g.fillTriangle(m.x,m.y-r,m.x-r,m.y,m.x,m.y+r); }
    for(const w of this.waves){ const a=Math.min(1,w.life*2); fx.lineStyle(14,0x111111,a); fx.beginPath(); fx.arc(w.x-30,w.y,52,-1.1,1.1); fx.strokePath();
      fx.lineStyle(6,0xff2a2a,a); fx.beginPath(); fx.arc(w.x-26,w.y,52,-1.0,1.0); fx.strokePath(); fx.lineStyle(2,0xffd0d0,a); fx.beginPath(); fx.arc(w.x-22,w.y,52,-0.8,0.8); fx.strokePath(); }
    for(const tr of this.trail){ const ic=this.heroId==='ichi'; fx.fillStyle(ic?(tr.x%2<1?0xff2a2a:0x111111):this.heroId==='blaze'?0xff7a1a:0xffffff,tr.life*1.5); fx.fillCircle(tr.x-20,tr.y+Math.random()*20-10,6+tr.life*20); }
    const hs=this.heroSpr, alive=this.state!=='over';
    hs.setPosition(this.hx,this.hy+2).setVisible(alive&&!(this.invuln>0&&Math.floor(this.t*20)%2));
    const fr=this.dashT>0?'dash':!this.grounded?'jump':'run'+(Math.floor(this.t*12)%4);
    hs.setFrame(fr);
    if(this.heroId==='echo'){ this.echoSpr.setVisible(alive).setPosition(this.hx-55,this.hy-8+Math.sin(this.t*4)*8).setFrame(fr); }
    if(this.shield&&alive){ g.lineStyle(3,0x9fe8ff,0.8); g.strokeCircle(this.hx,this.hy-34,38); }
    if(this.spdFx>0){ this.spdFx-=dt; fx.lineStyle(3,0xfff35c,Math.min(1,this.spdFx*2)); for(let i=0;i<Q().lines*2;i++){const y=Math.random()*H,x=Math.random()*W; fx.lineBetween(x,y,x+140+Math.random()*200,y);} }
    if(this.dashT>0){ fx.lineStyle(2,0xffffff,0.7); for(let i=0;i<Q().lines;i++){const y=Math.random()*H,x=Math.random()*W; fx.lineBetween(x,y,x+80+Math.random()*120,y);} }
    for(const p of this.parts){ fx.fillStyle(p.c,Math.max(0,p.life)); fx.fillCircle(p.x,p.y,p.r); }
    if(this.state==='slowmo'){ fx.fillStyle(0x000000,0.35); fx.fillRect(0,0,W,H); }
    this.hud.setText(`SCORE ${this.score()}   ${'★'.repeat(Math.max(0,this.lives))}${'☆'.repeat(this.D.lives-Math.max(0,this.lives))}   ${this.D.name}`);
    this.spdT.setText(`SPD x${(this.curSpeed()/this.D.speed).toFixed(1)}  GEAR ${this.gear+1}`);
    this.hud2.setText(`${this.combo>1?'COMBO x'+this.combo+'   ':''}GEMS ${this.gems}   KO ${this.R.enemies}`);
  }
}

window.game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#120a2a',
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  resolution:1,render:{antialias:true,powerPreference:DEV.quality==='low'?'low-power':'high-performance'},scene:[SplashScene,SelectScene,GameScene]});

// re-layout on resize / orientation change: new world width, rebuild menus; in-game just resize & re-anchor on next run
let rzT; function onResize(){ clearTimeout(rzT); rzT=setTimeout(()=>{ const nw=calcW(); if(nw===W)return; W=nw;
  game.scale.setGameSize(W,H);
  game.scene.getScenes(true).forEach(sc=>{ const k=sc.scene.key; if(k!=='game')sc.scene.restart(); else { sc.hud2.setX(W-110); } }); },200); }
window.addEventListener('resize',onResize); window.addEventListener('orientationchange',onResize);
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());
window.__DEV=DEV;
