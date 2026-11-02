// Procedural pixel-art hero sprites (original designs). 24x32 frames, feet at bottom center.
const SPR={W:24,H:32,SCALE:2.25,FR:['run0','run1','run2','run3','jump','dash','pose']};
const PAL={
  blaze:  {skin:'#ffd9b3',hair:'#ff4a1c',hair2:'#ffb22e',suit:'#d6261e',suit2:'#8e1414',acc:'#ffd23f',boot:'#2a1210',eye:'#ff9a1a',motif:'scarf',m1:'#ff7a1a',m2:'#ffe14a'},
  volt:   {skin:'#ffe0c2',hair:'#ffe633',hair2:'#fffbb0',suit:'#1f2a44',suit2:'#121a2e',acc:'#ffe633',boot:'#ffe633',eye:'#33c8ff',motif:'bolt',m1:'#9ff3ff',m2:'#ffffff'},
  ichi:   {skin:'#f3d2b5',hair:'#ff7a12',hair2:'#ffb347',suit:'#1a1a1f',suit2:'#0a0a0d',acc:'#c4101c',boot:'#0a0a0d',eye:'#ffd23f',motif:'coat',m1:'#121216',m2:'#c4101c'},
  iron:   {skin:'#f0c9a4',hair:'#3b4458',hair2:'#5b6680',suit:'#8f9bb3',suit2:'#4d5a78',acc:'#2f7dff',boot:'#2c3446',eye:'#2f7dff',motif:'armor',m1:'#c9d3e6',m2:'#2f7dff'},
  echo:   {skin:'#e6cfe0',hair:'#2a1640',hair2:'#5a2f8a',suit:'#4a2570',suit2:'#24113a',acc:'#c77dff',boot:'#150a24',eye:'#e04dff',motif:'shadow',m1:'#1a0c2c',m2:'#7a3fbf'},
  prism:  {skin:'#ffe6d6',hair:'#ff7ad9',hair2:'#7af3ff',suit:'#ffffff',suit2:'#c9b8ff',acc:'#7af3ff',boot:'#7a5cff',eye:'#ff4fb0',motif:'crystal',m1:'#7af3ff',m2:'#fff27a'},
};
const RAINBOW=['#ff4a4a','#ff9a2e','#ffe633','#4ade80','#38bdf8','#a78bfa'];
function heroGrid(id,fr){
  const P=PAL[id],w=SPR.W,h=SPR.H,G=[...Array(h)].map(()=>Array(w).fill(null));
  const px=(x,y,c)=>{x|=0;y|=0;if(x>=0&&y>=0&&x<w&&y<h)G[y][x]=c;};
  const rect=(x,y,ww,hh,c)=>{for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)px(x+i,y+j,c)};
  const line=(x0,y0,x1,y1,c,t=2)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);rect(x,y,t,1,c)}};
  const run=fr.startsWith('run')?+fr[3]:-1, dash=fr==='dash', jump=fr==='jump', pose=fr==='pose';
  const bob=run===1||run===3?1:0, lean=dash?2:0;
  const hipY=22+bob, cx=11;
  // --- back motif ---
  if(P.motif==='scarf'){const wv=run>=0?run%2:0;line(cx-1+lean,13+bob,cx-8+lean,11+bob+wv,P.m1,2);line(cx-6+lean,12+bob+wv,cx-11+lean,10+bob-wv,P.m2,2);px(cx-12+lean,9+bob,P.m2);}
  if(P.motif==='wings'){const f=jump?-3:(run>=0?(run%2?-1:1):0);for(let i=0;i<6;i++){line(cx-1+lean,14+bob+i,cx-7-i+lean,8+bob+f+i*2,i%2?P.m2:P.m1,1);}}
  if(P.motif==='coat'){const fl=dash?6:jump?3:(run>=0?run%2:0);for(let i=0;i<5;i++){const ex=cx-3-i-fl+lean,ey=hipY+5-(dash?i:0);line(cx-1+lean,13+bob+i*2,ex,ey+(i%2),i===4?P.m2:P.m1,1);}
    for(let k=0;k<4;k++)px(cx-3-k*2-fl+lean,hipY+6-(dash?k:0)+(k%2),P.m2);}
  if(P.motif==='shadow'){for(let i=0;i<7;i++)line(cx-1+lean,13+bob+i,cx-5-i*0.6+lean-(dash?4:0),24+bob+(i%2)*2,P.m1,1);}
  if(P.motif==='crystal'){px(cx-5+lean,11+bob,P.m1);rect(cx-6+lean,12+bob,2,3,P.m1);px(cx-7+lean,15+bob,P.m2);rect(cx-4+lean,9+bob,1,2,P.m2);}
  // --- legs ---
  const leg=(fx,fy,c)=>{line(cx+1+lean/2,hipY,fx,fy-2,c,3);rect(fx-1,fy-2,4,3,P.boot);};
  if(run>=0){const o=[[4,-3],[2,0],[-3,4],[0,2]][run];leg(cx+o[1],31,P.suit2);leg(cx+o[0]+1,31-(run===0?1:0),P.suit);}
  else if(jump){leg(cx-2,29,P.suit2);line(cx+1,hipY,cx+5,hipY+2,P.suit,3);rect(cx+4,hipY+2,3,4,P.suit);rect(cx+4,hipY+5,4,3,P.boot);}
  else if(dash){leg(cx-6,30,P.suit2);leg(cx+5,31,P.suit);}
  else {leg(cx-1,31,P.suit2);leg(cx+3,31,P.suit);}
  // --- torso ---
  const ty=13+bob, tx=cx-3+lean;
  const bulk=P.motif==='armor'?1:0;
  rect(tx-bulk,ty,8+bulk*2,hipY-ty+1,P.suit); rect(tx-bulk,ty,2,hipY-ty+1,P.suit2);
  rect(tx-bulk,hipY-1,8+bulk*2,1,P.acc); // belt
  if(P.motif==='crystal')for(let i=0;i<6;i++)px(tx+2+(i%3)*2,ty+2+(i>2?2:0),RAINBOW[i]);
  else if(P.motif==='bolt'){px(tx+5,ty+1,P.acc);px(tx+4,ty+2,P.acc);rect(tx+3,ty+3,3,1,P.acc);px(tx+4,ty+4,P.acc);px(tx+3,ty+5,P.acc);}
  else if(P.motif==='armor'){rect(tx-2,ty-1,4,3,P.m1);rect(tx+7,ty-1,4,3,P.m1);rect(tx+3,ty+2,3,3,P.m2);px(tx+4,ty+3,'#bfe8ff');}
  else if(P.motif==='wings'){px(tx+3,ty+2,P.acc);px(tx+5,ty+2,P.acc);rect(tx+4,ty+3,1,2,P.acc);}
  else if(P.motif==='shadow'){rect(tx+3,ty+2,3,3,P.suit2);px(tx+4,ty+3,P.acc);}
  else {rect(tx+3,ty+2,3,3,P.acc);px(tx+4,ty+1,P.acc);}
  // --- arms ---
  const sh=[tx+5,ty+2];
  if(dash){line(sh[0],sh[1],sh[0]-7,sh[1]+3,P.suit2,2);line(sh[0],sh[1],sh[0]+5,sh[1]-1,P.suit,2);rect(sh[0]+5,sh[1]-2,2,2,P.skin);}
  else if(jump){line(sh[0],sh[1],sh[0]+4,sh[1]-6,P.suit,2);rect(sh[0]+4,sh[1]-8,2,2,P.skin);}
  else if(pose){line(sh[0],sh[1],sh[0]+1,sh[1]+6,P.suit,2);rect(sh[0]+1,sh[1]+6,2,2,P.skin);}
  else {const a=[[4,3],[2,5],[-3,4],[0,6]][Math.max(0,run)];line(sh[0],sh[1],sh[0]+a[0],sh[1]+a[1],P.suit,2);rect(sh[0]+a[0],sh[1]+a[1],2,2,P.skin);}
  if(P.motif==='coat'){ if(dash){line(sh[0]+6,sh[1]-1,sh[0]+13,sh[1]-4,'#e8e8f0',1);line(sh[0]+6,sh[1],sh[0]+12,sh[1]-3,'#0a0a0d',1);px(sh[0]+4,sh[1]+1,'#c9c9d6');px(sh[0]+3,sh[1]+2,'#c9c9d6');}
    else {line(tx-1,hipY-1,tx-6,hipY+7,'#0a0a0d',1);line(tx,hipY-1,tx-5,hipY+7,'#d9d9e6',1);px(tx+1,hipY-2,P.m2);px(tx+2,hipY-3,'#c9c9d6');}
    rect(tx+6,ty,2,hipY-ty-1,P.m2);} // red lining edge
  // --- head ---
  const hx=cx-3+lean, hy=5+bob;
  rect(hx,hy+1,8,7,P.skin); rect(hx+1,hy,6,1,P.skin); rect(hx+1,hy+8,6,1,P.skin);
  rect(hx+5,hy+3,2,3,'#ffffff'); rect(hx+6,hy+3,1,3,P.eye); px(hx+5,hy+3,'#1b1030'); // eye
  rect(hx+4,hy+2,3,1,P.hair); // brow
  px(hx+6,hy+7,'#c46a5a'); // mouth
  if(P.motif==='armor'){rect(hx-1,hy,10,2,P.m1);rect(hx-1,hy+2,2,5,P.m1);rect(hx+4,hy+1,4,1,P.acc);}
  if(P.motif==='shadow'){rect(hx+3,hy+6,5,3,P.suit2);}
  const mask=P.motif==='coat';
  // --- hair (spiky, swept back) ---
  const H1=P.hair,H2=P.hair2;
  rect(hx-1,hy-1,9,3,H1); rect(hx-1,hy+2,3,4,H1); px(hx+7,hy+2,H1);
  const spikes={blaze:[[0,-5],[2,-7],[4,-6],[6,-4],[-3,-3],[-4,0]],volt:[[0,-4],[3,-6],[6,-3],[-3,-4],[-5,1],[8,0]],
    ichi:[[0,-5],[3,-6],[6,-4],[-3,-4],[-5,0],[-4,3],[8,-1]],iron:[[1,-2],[4,-2],[-2,0]],echo:[[0,-3],[3,-4],[-3,-1],[-3,3],[-4,6]],prism:[[0,-4],[2,-6],[5,-5],[-3,-3],[-4,1]]}[id];
  spikes.forEach(([dx,dy],i)=>{line(hx+3,hy+1,hx+3+dx-lean,hy+dy,i%2?H2:H1,2);px(hx+3+dx-lean,hy+dy,H2);});
  if(id==='prism')spikes.forEach(([dx,dy],i)=>px(hx+3+dx,hy+dy,RAINBOW[i]));
  if(id==='volt'){px(hx+9,hy+1,'#ffffff');px(hx+10,hy,'#9ff3ff');}
  if(id==='echo')rect(hx+4,hy+1,3,2,H1); // fringe over eye
  if(mask){rect(hx+4,hy+2,4,6,'#f4f1e8');rect(hx+5,hy+3,2,2,'#0a0a0d');px(hx+6,hy+3,P.eye);rect(hx+4,hy+6,4,1,'#0a0a0d');px(hx+5,hy+7,'#f4f1e8');px(hx+7,hy+7,'#f4f1e8');
    px(hx+4,hy+2,P.m2);px(hx+4,hy+3,P.m2);px(hx+7,hy+2,P.m2);px(hx+7,hy+5,P.m2);}
  else if(id!=='echo'){rect(hx+5,hy+3,2,3,'#ffffff');rect(hx+6,hy+3,1,3,P.eye);px(hx+6,hy+4,'#1b1030');}
  else {rect(hx+5,hy+4,2,2,'#ffffff');px(hx+6,hy+4,P.eye);px(hx+6,hy+5,'#1b1030');}
  // --- outline ---
  const O=G.map(r=>r.slice()), OL=id==='echo'?'#05020c':'#1b1030';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!G[y][x]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>G[y+b]&&G[y+b][x+a]))O[y][x]=OL;
  return O;
}
function makeHeroTextures(scene){
  if(scene.textures.exists('hero_blaze'))return;
  const n=SPR.FR.length;
  HEROES.forEach(hd=>{
    const c=scene.textures.createCanvas('hero_'+hd.id,SPR.W*n,SPR.H),ctx=c.getContext();
    SPR.FR.forEach((f,i)=>{const G=heroGrid(hd.id,f);G.forEach((r,y)=>r.forEach((col,x)=>{if(col){ctx.fillStyle=col;ctx.fillRect(i*SPR.W+x,y,1,1)}}));c.add(f,0,i*SPR.W,0,SPR.W,SPR.H);});
    c.refresh(); c.setFilter(Phaser.Textures.FilterMode.NEAREST);
    scene.anims.create({key:'run_'+hd.id,frames:['run0','run1','run2','run3'].map(f=>({key:'hero_'+hd.id,frame:f})),frameRate:12,repeat:-1});
  });
}
