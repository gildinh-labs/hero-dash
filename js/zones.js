// Progressive pixel-art parallax zones: EARTH -> SKY -> SPACE. Textures drawn at 1/4 res, scaled with NEAREST.
const ZONES=[
  {key:'earth',name:'EARTH',at:0,   top:'#5ec8ff',bot:'#c9f0ff', plat:[0x5a3a22,0x4cc24a]},
  {key:'sky',  name:'SKY ZONE!',at:1500,top:'#3a1c71',bot:'#ffaf7b', plat:[0xf2f4ff,0xffffff]},
  {key:'space',name:'SPACE ZONE!',at:4000,top:'#05020f',bot:'#1b0b3a', plat:[0x4a4458,0x7af3ff]},
];
function zoneTex(scene){
  if(scene.textures.exists('z_earth_far'))return;
  let seed=7; const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const mk=(key,w,h,fn)=>{const c=scene.textures.createCanvas(key,w,h),x=c.getContext();fn(x,w,h,(X,Y,W2,H2,col)=>{x.fillStyle=col;x.fillRect(X|0,Y|0,W2|0,H2|0)});c.refresh();c.setFilter(Phaser.Textures.FilterMode.NEAREST);};
  const grad=(key,a,b)=>{const c=scene.textures.createCanvas(key,4,135),x=c.getContext(),g=x.createLinearGradient(0,0,0,135);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,4,135);c.refresh();};
  ZONES.forEach(z=>grad('z_'+z.key+'_sky',z.top,z.bot));
  // EARTH: far hills + clouds, near city skyline + trees
  mk('z_earth_far',320,135,(x,w,h,r)=>{for(let i=0;i<6;i++){const cx=R()*w,cy=10+R()*35;r(cx,cy,24,5,'#ffffff');r(cx+4,cy-3,14,3,'#ffffff');}
    for(let X=0;X<w;X++){const y=80+Math.round(10*Math.sin(X/320*Math.PI*4)+6*Math.sin(X/320*Math.PI*10));r(X,y,1,h-y,'#7fc98a');r(X,y,1,2,'#9fe0a5');}});
  mk('z_earth_near',320,135,(x,w,h,r)=>{let X=0;while(X<w){const bw=12+R()*16|0,bh=20+R()*30|0,c=['#6b7aa8','#8a6fa8','#5d8aa8'][R()*3|0];
      r(X,h-28-bh,bw,bh,c);for(let wy=h-26-bh;wy<h-32;wy+=5)for(let wx=X+2;wx<X+bw-2;wx+=4)r(wx,wy,2,2,R()<0.5?'#ffe9a8':'#3a4466');X+=bw+2;}
    for(let t=0;t<8;t++){const tx=t*40+R()*20;r(tx+3,h-38,2,10,'#5a3a22');r(tx,h-46,8,9,'#2f8f3a');r(tx+1,h-49,6,3,'#3fae4a');}});
  // SKY: distant mountains low, big clouds, birds
  mk('z_sky_far',320,135,(x,w,h,r)=>{for(let X=0;X<w;X++){const y=105+Math.round(12*Math.abs(Math.sin(X/320*Math.PI*3))+4*Math.sin(X/9));r(X,y,1,h-y,'#7a4a8a');}
    for(let i=0;i<5;i++){const cx=R()*w,cy=20+R()*50;r(cx,cy,40,6,'#ffd6e0');r(cx+6,cy-4,26,4,'#ffe6ee');r(cx-4,cy+6,48,3,'#f0a8c0');}});
  mk('z_sky_near',320,135,(x,w,h,r)=>{for(let i=0;i<4;i++){const cx=i*80+R()*30,cy=80+R()*30;r(cx,cy,50,10,'#ffffff');r(cx+8,cy-6,30,6,'#ffffff');r(cx,cy+10,50,3,'#e6d6ff');}
    for(let b=0;b<6;b++){const bx=R()*w,by=15+R()*50;r(bx,by,1,1,'#2a1640');r(bx+1,by+1,2,1,'#2a1640');r(bx+3,by,1,1,'#2a1640');}});
  // SPACE: stars, nebula, planets, earth curve
  mk('z_space_far',320,135,(x,w,h,r)=>{x.globalAlpha=0.55;for(let i=0;i<5;i++){const cx=R()*w,cy=10+R()*80,rad=14+R()*16,c=i%2?'#ff4fb0':'#4f7bff';for(let y=-rad;y<=rad;y++)for(let X=-rad*2;X<=rad*2;X++){const d=(X/2)**2+y*y;if(d<rad*rad&&((X+y)&1)&&R()<0.5*(1-d/(rad*rad)))r(cx+X,cy+y,1,1,c);}}x.globalAlpha=1;
    for(let i=0;i<120;i++)r(R()*w,R()*h,1,1,R()<0.2?'#9ff3ff':'#ffffff');});
  mk('z_space_near',320,135,(x,w,h,r)=>{const pl=(cx,cy,rad,c1,c2,ring)=>{for(let y=-rad;y<=rad;y++){const hw=Math.round(Math.sqrt(rad*rad-y*y));r(cx-hw,cy+y,hw*2,1,c1);r(cx-hw,cy+y,Math.max(1,hw*0.6),1,c2);}if(ring)r(cx-rad-5,cy,rad*2+10,1,'#fff27a');};
    pl(60,30,10,'#ff9a5c','#c8542a',1); pl(230,50,6,'#7af3ff','#3a8fbf'); pl(290,20,3,'#e6e6ff','#9a9ab3');
    for(let X=0;X<w;X++){const y=118+Math.round(((X-160)/160)**2*10);r(X,y,1,h-y,'#2f6fd8');r(X,y,1,2,'#9fe8ff');if((X*7)%23<6)r(X,y+4,1,4,'#3fae4a');}});
}
class ZoneBG{
  constructor(scene){ this.s=scene; zoneTex(scene); this.cur=0; this.low=()=>DEV.quality==='low';
    this.L=ZONES.map((z,i)=>{const a=i?0:1;
      const sky=scene.add.image(0,0,'z_'+z.key+'_sky').setOrigin(0).setDisplaySize(W,H).setDepth(-4).setAlpha(a);
      const far=scene.add.tileSprite(0,0,Math.ceil(W/4),135,'z_'+z.key+'_far').setOrigin(0).setScale(4).setDepth(-4).setAlpha(a);
      const near=scene.add.tileSprite(0,0,Math.ceil(W/4),135,'z_'+z.key+'_near').setOrigin(0).setScale(4).setDepth(-3).setAlpha(a);
      return {sky,far,near,a}; }); }
  zoneAt(d){let i=0;ZONES.forEach((z,k)=>{if(d>=z.at)i=k});return i;}
  update(dx,dist,t){ const zi=this.zoneAt(dist);
    if(zi!==this.cur){this.cur=zi;this.s.callout(ZONES[zi].name);}
    const step=0.016*1.2, inc=this.L[zi];
    if(inc.a<1)inc.a=Math.min(1,inc.a+step);
    this.L.forEach((l,i)=>{ if(i!==zi&&inc.a>=1)l.a=Math.max(0,l.a-step*2); l.near.setDepth(i===zi?-2:-3); l.far.setDepth(i===zi?-3.5:-4); l.sky.setDepth(i===zi?-3.6:-4.5);
      const vis=l.a>0; [l.sky,l.far,l.near].forEach(o=>o.setVisible(vis).setAlpha(l.a));
      if(vis&&dx){ l.far.tilePositionX+=dx*0.05/4; l.near.tilePositionX+=dx*(this.low()?0.15:0.3)/4; } });
    if(zi===2&&!this.low()) this.L[2].far.setAlpha(this.L[2].a*(0.85+0.15*Math.sin(t*6))); // twinkle
  }
  plat(){ return ZONES[this.cur].plat; }
}
