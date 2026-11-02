const W=960,H=540;
const CALLOUTS={2:'NICE!',3:'GO BEYOND!',5:'UNSTOPPABLE!',8:'HERO MODE!',12:'LIMIT BREAK!!'};

const DIFFS={
  easy:  {name:'EASY',  col:'#3ddc84',speed:270,ramp:3,  maxSpeed:470,gap:[60,115], gapMul:1.25,crate:0.18,lives:5,wallSnap:Infinity,coyote:0.16,buffer:0.18},
  medium:{name:'MEDIUM',col:'#ffd23f',speed:305,ramp:4.5,maxSpeed:560,gap:[80,145], gapMul:1.45,crate:0.30,lives:3,wallSnap:16,coyote:0.10,buffer:0.12},
  hard:  {name:'HARD',  col:'#ff3d7f',speed:360,ramp:7.5,maxSpeed:700,gap:[110,190],gapMul:1.8, crate:0.48,lives:3,wallSnap:4, coyote:0.04,buffer:0.06},
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

class SelectScene extends Phaser.Scene{
  constructor(){super('select')}
  create(){
    skyBg(this); this.add.image(0,0,'sky').setOrigin(0).setDisplaySize(W,H);
    this.sel=Math.max(0,HEROES.findIndex(h=>h.id===Save.get('selected','blaze')));
    this.add.text(W/2,40,'HERO DASH',{fontFamily:'Impact,Arial Black,sans-serif',fontSize:54,color:'#fff',stroke:'#3a1c71',strokeThickness:8}).setOrigin(0.5);
    this.diff=getDiff();
    this.sub=this.add.text(W/2,74,'',{fontFamily:'Arial',fontSize:16,color:'#fff'}).setOrigin(0.5);
    this.dBtns=DIFF_KEYS.map((d,i)=>{const t=this.add.text(W/2+(i-1)*130,100,`${i+1} ${DIFFS[d].name}`,{fontFamily:'Arial Black,Arial',fontSize:15,color:'#fff',padding:{x:10,y:3}}).setOrigin(0.5).setInteractive();
      t.on('pointerdown',()=>this.setDiff(d)); return t;});
    this.setDiff(this.diff);
    this.g=this.add.graphics(); this.cards=[];
    HEROES.forEach((h,i)=>{
      const cx=170+(i%3)*310, cy=200+Math.floor(i/3)*190;
      const z=this.add.zone(cx,cy,290,175).setInteractive();
      z.on('pointerdown',()=>{ if(this.sel===i)this.start(); this.sel=i; });
      const p=heroProgress(h.id);
      this.add.text(cx-50,cy-70,h.name,{fontFamily:'Arial Black,Arial',fontSize:18,color:'#fff'});
      this.add.text(cx-50,cy-44,h.power,{fontFamily:'Arial',fontSize:13,color:'#fff',wordWrap:{width:185}});
      this.add.text(cx-50,cy+30,'Lv '+p.level+'  XP '+p.xp+'/'+xpNeed(p.level),{fontFamily:'Arial',fontSize:13,color:'#ffe9a8'});
      this.cards.push({cx,cy,h,p});
    });
    const b=this.add.text(W/2,H-30,'▶ START (Enter / tap selected hero)',{fontFamily:'Arial Black,Arial',fontSize:22,color:'#fff',backgroundColor:'#ff3d7f',padding:{x:14,y:6}}).setOrigin(0.5).setInteractive();
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
      drawHero(g,c.h.id,c.cx-95,c.cy+40,1.3,i===this.sel?t/1000:0);
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
    this.speed=this.D.speed; this.t=0; this.ts=1; this.state='run'; this.boostT=0;
  }
  create(){
    skyBg(this); this.add.image(0,0,'sky').setOrigin(0).setDisplaySize(W,H);
    this.bg=this.add.graphics(); this.g=this.add.graphics(); this.fx=this.add.graphics();
    const st=(s,c='#fff')=>({fontFamily:'Arial Black,Arial',fontSize:s,color:c,stroke:'#1b1030',strokeThickness:5});
    this.hud=this.add.text(14,10,'',st(20)); this.hud2=this.add.text(W-14,10,'',st(20)).setOrigin(1,0);
    this.call=this.add.text(W/2,150,'',st(56,'#fff35c')).setOrigin(0.5).setAlpha(0);
    this.mid=this.add.text(W/2,H/2,'',st(40)).setOrigin(0.5);
    this.clouds=[...Array(8)].map((_,i)=>({x:i*140,y:40+Math.random()*200,r:30+Math.random()*40}));
    this.stars=[...Array(40)].map(()=>({x:Math.random()*W,y:Math.random()*H*0.6}));
    this.hx=W*0.25; this.resetWorld();
    const k=this.input.keyboard;
    this.keys=k.addKeys('Z,UP,SPACE,X,SHIFT');
    ['Z','UP','SPACE'].forEach(n=>this.keys[n].on('down',()=>this.jump()));
    ['X','SHIFT'].forEach(n=>this.keys[n].on('down',()=>this.dash()));
    k.on('keydown-ENTER',()=>{ if(this.state==='over')this.scene.start('select'); });
    this.input.addPointer(2);
    this.input.on('pointerdown',p=>{
      if(this.state==='over'){ this.scene.start('select'); return; }
      if(p.x<W/2){this.jump();p.isJump=true}else this.dash();
    });
    window.__hd=this;
  }
  resetWorld(){
    this.plats=[{x:-200,y:400,w:1400}]; this.obs=[]; this.gemsArr=[]; this.parts=[]; this.trail=[];
    this.bridges=[]; this.lastEnd=1200; this.lastY=400;
    this.spawnHero();
  }
  spawnHero(){
    this.hy=200; this.vy=0; this.grounded=false; this.jumps=0; this.dashT=0; this.dashCd=0;
    this.airDash=true; this.shield=this.heroId==='iron'; this.invuln=1.2;
    // safe ground under hero
    const sx=this.hx-150, ex=this.hx+450;
    this.plats=this.plats.filter(p=>p.x+p.w<sx-40||p.x>ex+80);
    this.plats.push({x:sx,y:400,w:ex-sx,safe:true});
    this.obs=this.obs.filter(o=>o.x>ex+80); this.gemsArr=this.gemsArr.filter(g=>g.x<sx||g.x>ex+80);
    if(this.lastEnd<ex){this.lastEnd=ex;this.lastY=400;}
  }
  maxJumps(){return this.heroId==='volt'?3:2}
  jump(){
    if(this.state!=='run')return;
    if(this.jumps===0&&!this.grounded&&this.coyT>this.D.coyote)this.jumps=1; // coyote expired
    if(this.jumps<this.maxJumps()){ this.bufT=0; this.vy=-760; this.jumps++; this.grounded=false; this.dashT=0;
      this.burst(this.hx,this.hy,0xffffff,8); }
    else this.bufT=this.D.buffer; // buffered: fires on landing
  }
  dash(){
    if(this.state!=='run'||this.dashCd>0||(!this.grounded&&!this.airDash))return;
    const blaze=this.heroId==='blaze';
    this.dashT=(blaze?0.55:0.35)*this.pow; this.dashCd=this.dashT+0.25; if(!this.grounded)this.airDash=false;
    this.vy=0; this.shake(0.006,120);
    if(this.heroId==='prism'&&!this.grounded) this.bridges.push({x:this.hx-20,y:this.hy,w:320*this.pow,life:1.6});
  }
  shake(i,d){this.cameras.main.shake(d,i)}
  burst(x,y,c,n,sp=250){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*sp;
    this.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0.6+Math.random()*0.4,c,r:2+Math.random()*4})}}
  callout(txt){this.call.setText(txt).setAlpha(1).setScale(0.4);
    this.tweens.add({targets:this.call,scale:1.1,duration:220,ease:'Back.out'});
    this.tweens.add({targets:this.call,alpha:0,delay:700,duration:400});}
  gen(){
    while(this.lastEnd<this.hx+W+600){
      const D=this.D, sp=this.speed/D.speed, gap=Phaser.Math.Between(D.gap[0],D.gap[1])*Math.min(D.gapMul,sp);
      const w=Phaser.Math.Between(320,720), y=Phaser.Math.Clamp(this.lastY+Phaser.Math.Between(-110,90),220,470);
      const x=this.lastEnd+gap; this.plats.push({x,y,w});
      // gems over gap
      for(let i=1;i<4;i++) this.gemsArr.push({x:x-gap+gap*i/4,y:Math.min(y,this.lastY)-60-Math.sin(i/4*Math.PI)*60,gold:Math.random()<0.04});
      let ox=x+160;
      while(ox<x+w-120){ const r=Math.random();
        if(r<this.D.crate) this.obs.push({x:ox,y:y,w:40,h:Phaser.Math.Between(50,80)});
        else if(r<this.D.crate+0.4) for(let j=0;j<3;j++) this.gemsArr.push({x:ox+j*30,y:y-40,gold:Math.random()<0.04});
        ox+=Phaser.Math.Between(170,280); }
      this.lastEnd=x+w; this.lastY=y;
    }
  }
  crash(){
    if(this.invuln>0)return;
    if(this.shield){ this.shield=false; this.invuln=1; this.shake(0.012,250); this.callout('SHIELD!'); this.burst(this.hx,this.hy-30,0x9fe8ff,25); return 'saved'; }
    this.lives--; this.combo=0; this.state='slowmo'; this.ts=0.15; this.slowT=0;
    this.shake(0.02,500); this.burst(this.hx,this.hy-30,0xff3d7f,40,400);
    this.mid.setText(this.lives>0?`WISH LOST...  ${this.lives} LEFT`:'FINAL WISH SPENT!');
  }
  update(time,deltaMs){
    const realDt=Math.min(deltaMs/1000,0.05);
    if(this.state==='slowmo'){ this.slowT+=realDt;
      if(this.slowT>1.6){ this.mid.setText(''); this.ts=1;
        if(this.lives>0){ this.state='run'; this.speed=Math.max(this.D.speed,this.speed*0.85); this.spawnHero(); }
        else this.gameOver(); } }
    if(this.state==='over'){this.draw(0);return;}
    const dt=realDt*this.ts; this.t+=dt;
    if(this.state==='run'){ this.speed=Math.min(this.D.maxSpeed,this.speed+this.D.ramp*dt); } // ramp
    const dashing=this.dashT>0, boost=this.boostT>0?1.15:1;
    const vx=this.speed*(dashing?1.7:1)*boost, dx=vx*dt;
    if(this.state==='run'){ this.dist+=dx/10;
      // scroll world
      for(const a of [this.plats,this.obs,this.gemsArr,this.bridges,this.parts,this.trail]) for(const o of a) o.x-=dx;
      this.lastEnd-=dx; this.clouds.forEach(c=>{c.x-=dx*0.2;if(c.x<-100)c.x+=W+200});
      this.plats=this.plats.filter(p=>p.x+p.w>-50); this.obs=this.obs.filter(o=>o.x>-80&&!o.dead);
      this.gemsArr=this.gemsArr.filter(g=>g.x>-50&&!g.got); this.gen();
      // physics
      this.dashT-=dt; this.dashCd-=dt; this.invuln-=dt; this.boostT-=dt; this.comboT-=dt; if(this.comboT<0)this.combo=0;
      const prevY=this.hy;
      if(this.dashT<=0){ this.vy+=2200*dt;
        const holding=this.keys.Z.isDown||this.keys.UP.isDown||this.keys.SPACE.isDown||this.input.activePointer.isDown&&this.input.activePointer.x<W/2;
        if(this.heroId==='feather'&&holding&&this.vy>0) this.vy=Math.min(this.vy,110/this.pow);
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
        if(dashing||this.crash()==='saved'){ o.dead=true; this.combo++; this.comboT=3; this.bonus+=50*this.combo;
          this.burst(o.x+20,o.y-o.h/2,this.heroId==='blaze'?0xff7a1a:0xffd23f,26,380); this.shake(0.01,150);
          const c=CALLOUTS[this.combo]||(this.combo>12&&this.combo%5===0?'PLUS '+this.combo+'!':null); if(c)this.callout(c); }
        break; } }
      // gems
      const mag=(this.heroId==='echo'?170:30)*this.pow;
      for(const g of this.gemsArr){ const ddx=g.x-this.hx, ddy=g.y-(this.hy-30), d=Math.hypot(ddx,ddy);
        if(d<mag&&d>1){ g.x-=ddx/d*500*dt; g.y-=ddy/d*500*dt; }
        if(d<30){ g.got=true; this.gems+=g.gold?10:1; this.burst(g.x,g.y,g.gold?0xffd700:0x7af3ff,8,150); } }
      this.bridges.forEach(b=>b.life-=dt); this.bridges=this.bridges.filter(b=>b.life>0);
      if(dashing||this.heroId==='blaze'&&dashing) this.trail.push({x:this.hx,y:this.hy-30,life:0.4});
    }
    for(const p of this.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.life-=dt} this.parts=this.parts.filter(p=>p.life>0);
    for(const p of this.trail)p.life-=dt; this.trail=this.trail.filter(p=>p.life>0);
    this.draw(dt);
  }
  score(){return Math.floor(this.dist)+this.bonus}
  gameOver(){
    this.state='over'; const s=this.score(), bk='best.'+this.diffKey, prev=Save.get(bk,0), best=Math.max(s,prev); Save.set(bk,best);
    Save.set('best',Math.max(s,Save.get('best',0)));
    const ups=addXP(this.heroId,this.gems); const p=heroProgress(this.heroId);
    const st={fontFamily:'Arial Black,Arial',fontSize:24,color:'#fff',stroke:'#1b1030',strokeThickness:5,align:'center'};
    this.add.rectangle(W/2,H/2,560,320,0x120a2a,0.85).setStrokeStyle(4,0xfff35c);
    this.add.text(W/2,H/2-110,'GAME OVER',{...st,fontSize:48,color:'#ff3d7f'}).setOrigin(0.5);
    this.add.text(W/2,H/2-62,this.D.name+(s>prev&&s>0?'  •  NEW BEST!':''),{...st,fontSize:22,color:this.D.col}).setOrigin(0.5);
    this.add.text(W/2,H/2+10,`Score ${s}   Best ${best}\nGems +${this.gems} XP${ups?`   LEVEL UP! Lv ${p.level}`:`   Lv ${p.level}`}\n\nTap / Enter to restart`,st).setOrigin(0.5);
    window.__hdOver=true;
  }
  draw(dt){
    const g=this.g,bg=this.bg,fx=this.fx; g.clear();bg.clear();fx.clear();
    bg.fillStyle(0xffffff,0.6); this.stars.forEach(s=>bg.fillRect(s.x,s.y,2,2));
    bg.fillStyle(0xffffff,0.25); this.clouds.forEach(c=>{bg.fillCircle(c.x,c.y,c.r);bg.fillCircle(c.x+c.r,c.y+8,c.r*0.8)});
    for(const p of this.plats){ g.fillStyle(0x2b1b5a,1); g.fillRoundedRect(p.x,p.y,p.w,36,8);
      g.fillStyle(0x7af3ff,1); g.fillRect(p.x+4,p.y,p.w-8,6); }
    for(const b of this.bridges){ g.fillStyle(0xfff6ff,Math.min(1,b.life)); g.fillRect(b.x,b.y,b.w,6);
      g.fillStyle(0xff7ad9,0.4*Math.min(1,b.life)); g.fillRect(b.x,b.y-6,b.w,18); }
    for(const o of this.obs){ g.fillStyle(0x9a3b2e,1); g.fillRect(o.x,o.y-o.h,o.w,o.h);
      g.lineStyle(2,0x4a1610,1); g.strokeRect(o.x,o.y-o.h,o.w,o.h); g.lineBetween(o.x,o.y-o.h/2,o.x+o.w,o.y-o.h/2); }
    for(const m of this.gemsArr){ const r=m.gold?11:8; g.fillStyle(m.gold?0xffd700:0x7af3ff,1);
      g.fillTriangle(m.x,m.y-r,m.x+r,m.y,m.x,m.y+r); g.fillTriangle(m.x,m.y-r,m.x-r,m.y,m.x,m.y+r); }
    for(const tr of this.trail){ fx.fillStyle(this.heroId==='blaze'?0xff7a1a:0xffffff,tr.life*1.5); fx.fillCircle(tr.x-20,tr.y+Math.random()*20-10,6+tr.life*20); }
    if(this.heroId==='echo'&&this.state!=='over') drawHero(g,'echo',this.hx-55,this.hy-10+Math.sin(this.t*4)*8,1,this.t,{alpha:0.35});
    if(this.state!=='over'&&!(this.invuln>0&&Math.floor(this.t*20)%2)) drawHero(g,this.heroId,this.hx,this.hy,1,this.grounded?this.t:0,{shield:this.shield});
    if(this.dashT>0){ fx.lineStyle(2,0xffffff,0.7); for(let i=0;i<14;i++){const y=Math.random()*H,x=Math.random()*W; fx.lineBetween(x,y,x+80+Math.random()*120,y);} }
    for(const p of this.parts){ fx.fillStyle(p.c,Math.max(0,p.life)); fx.fillCircle(p.x,p.y,p.r); }
    if(this.state==='slowmo'){ fx.fillStyle(0x000000,0.35); fx.fillRect(0,0,W,H); }
    this.hud.setText(`SCORE ${this.score()}   ${'★'.repeat(Math.max(0,this.lives))}${'☆'.repeat(this.D.lives-Math.max(0,this.lives))}   ${this.D.name}`);
    this.hud2.setText(`${this.combo>1?'COMBO x'+this.combo+'   ':''}GEMS ${this.gems}`);
  }
}

window.game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#120a2a',
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[SelectScene,GameScene]});
