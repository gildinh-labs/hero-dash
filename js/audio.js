// Original chiptune music + SFX via Web Audio (no samples). Starts after first user gesture.
const AUD=(()=>{
  let ctx=null,master=null,musG=null,sfxG=null,noiseBuf=null,timer=null,song=null,step=0,nextT=0;
  let muted=!!Save.get('muted',false);
  const f=m=>440*Math.pow(2,(m-69)/12);
  function init(){ if(ctx)return ctx.state==='suspended'&&ctx.resume();
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return; ctx=new AC();
    master=ctx.createGain(); master.gain.value=muted?0:1; master.connect(ctx.destination);
    musG=ctx.createGain(); musG.gain.value=0.16; musG.connect(master);
    sfxG=ctx.createGain(); sfxG.gain.value=0.28; sfxG.connect(master);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*0.5,ctx.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    if(song)play(song,true); }
  function tone(type,freq,t,dur,vol,dest,slide){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g); g.connect(dest||musG); o.start(t); o.stop(t+dur+0.02); }
  function noise(t,dur,vol,hp,dest){ const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain(); s.buffer=noiseBuf;
    fl.type='highpass'; fl.frequency.value=hp; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    s.connect(fl); fl.connect(g); g.connect(dest||musG); s.start(t); s.stop(t+dur+0.02); }
  // ---- songs: lead = 16 steps/bar of midi or 0 (rest) or -1 (hold); chords = root per bar ----
  const _=0, h=-1;
  const SONGS={
    title:{bpm:150,chords:[[57,60,64],[53,57,60],[55,59,62],[52,56,59]],
      lead:[69,h,72,h,76,h,74,72, 74,h,h,h,_,_,_,_, 72,h,69,h,65,h,67,69, 67,h,h,h,_,_,_,_,
            71,h,74,h,79,h,77,76, 74,h,76,h,74,72,71,h, 68,h,71,h,76,h,h,h, 74,h,72,h,71,h,h,h]},
    game:{bpm:164,chords:[[57,60,64],[53,57,60],[48,52,55],[55,59,62],[57,60,64],[53,57,60],[50,53,57],[52,56,59]],
      lead:[76,h,76,79,h,76,74,h, 72,h,74,h,76,h,h,h, 77,h,76,74,h,72,h,69, 72,h,h,h,_,_,69,72,
            79,h,79,81,h,79,77,h, 76,h,74,h,72,h,74,76, 74,h,h,h,72,h,71,72, 71,h,h,h,_,_,76,77,
            81,h,79,h,76,h,79,h, 84,h,h,h,81,h,79,h, 77,h,76,77,h,79,h,77, 76,h,h,h,72,h,76,h,
            74,h,77,h,81,h,79,77, 76,h,74,h,72,h,74,h, 71,h,72,h,74,h,76,h, 80,h,h,h,_,_,_,_]},
  };
  function sched(){ const S=SONGS[song],spb=60/S.bpm/4;
    while(nextT<ctx.currentTime+0.15){ const t=nextT, bar=Math.floor(step/16)%S.chords.length, s=step%16, ch=S.chords[bar];
      const L=S.lead[step%S.lead.length];
      if(L>0){ let n=1; while(S.lead[(step+n)%S.lead.length]===h)n++; tone('square',f(L),t,spb*n*0.95,0.5); tone('square',f(L)*1.005,t+spb*0.5,spb*n*0.8,0.12); }
      if(s%2===0) tone('triangle',f(ch[0]-12+(s%8===6?12:0)),t,spb*1.8,0.9);
      tone('square',f(ch[s%3]+12),t,spb*0.6,0.07);            // arpeggio
      if(s%8===0) tone('sine',150,t,0.12,0.9,musG,45);        // kick
      if(s%8===4) noise(t,0.12,0.5,1500);                      // snare
      if(s%2===1) noise(t,0.03,0.18,7000);                     // hat
      nextT+=spb; step++; } }
  function play(name,force){ if(song===name&&!force&&timer)return; song=name; if(!ctx)return; clearInterval(timer); step=0; nextT=ctx.currentTime+0.05; timer=setInterval(sched,40); }
  function stop(){ clearInterval(timer); timer=null; song=null; }
  const SFX={
    jump:t=>tone('square',300,t,0.12,0.5,sfxG,700),
    dash:t=>{noise(t,0.2,0.5,800,sfxG);tone('sawtooth',200,t,0.18,0.25,sfxG,80);},
    gem:t=>{tone('square',f(88),t,0.06,0.35,sfxG);tone('square',f(93),t+0.06,0.1,0.35,sfxG);},
    gold:t=>[84,88,91,96].forEach((n,i)=>tone('square',f(n),t+i*0.05,0.1,0.35,sfxG)),
    smash:t=>{noise(t,0.25,0.8,300,sfxG);tone('square',180,t,0.15,0.4,sfxG,60);},
    charge:t=>tone('square',220,t,0.55,0.18,sfxG,880),
    shoot:t=>tone('square',900,t,0.14,0.3,sfxG,200),
    zap:t=>{tone('square',1200,t,0.08,0.3,sfxG,2400);noise(t,0.06,0.3,4000,sfxG);},
    crash:t=>{noise(t,0.5,0.8,100,sfxG);tone('sawtooth',400,t,0.5,0.45,sfxG,50);},
    levelup:t=>[72,76,79,84,79,84].forEach((n,i)=>tone('square',f(n),t+i*0.08,0.12,0.4,sfxG)),
    gameover:t=>[67,h,64,60,55].forEach((n,i)=>n>0&&tone('square',f(n),t+i*0.16,0.3,0.4,sfxG)),
  };
  function sfx(n){ if(!ctx||muted)return; try{SFX[n](ctx.currentTime);}catch(e){} }
  function toggle(){ muted=!muted; Save.set('muted',muted); if(master)master.gain.value=muted?0:1; return muted; }
  return {init,play,stop,sfx,toggle,get muted(){return muted}};
})();
function muteUI(scene,x){ const t=scene.add.text(x,12,AUD.muted?'🔇':'🔊',{fontFamily:'Arial',fontSize:24,backgroundColor:'#120a2a99',padding:{x:4,y:2}}).setOrigin(1,0).setInteractive().setDepth(5);
  const tg=()=>{t.setText(AUD.toggle()?'🔇':'🔊');}; t.on('pointerup',(p,x,y,e)=>{e&&e.stopPropagation&&e.stopPropagation();AUD.init();tg();});
  scene.input.keyboard.on('keydown-M',tg); return t; }
['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,()=>AUD.init(),{capture:true}));
