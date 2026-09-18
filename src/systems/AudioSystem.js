import { SETTINGS } from './SettingsSystem.js';

const SCENE_AUDIO = {
  TitleScene: { music: 'music_theme', musicVolume: 0.65 },
  RoomScene: { music: 'music_routine', musicVolume: 0.32 },
  KitchenScene: { music: 'music_routine', musicVolume: 0.28, ambience: 'fridge_hum', ambienceVolume: 0.42 },
  GarageScene: { music: 'music_routine', musicVolume: 0.24 },
  BedroomScene: { music: 'music_routine', musicVolume: 0.18 },
  DanielRoomScene: { music: 'music_routine', musicVolume: 0.18 },
  YardScene: { music: 'music_yard', musicVolume: 0.52, ambience: 'yard_ambience', ambienceVolume: 0.55 },
  MemoryScene: { music: 'music_memories', musicVolume: 0.58 },
  DinnerMemoryScene: { music: 'music_memories', musicVolume: 0.5 },
  WorkshopMemoryScene: { music: 'music_memories', musicVolume: 0.46 },
  ArgumentMemoryScene: { music: 'music_memories', musicVolume: 0.32 },
  DrawingMemoryScene: { music: 'music_memories', musicVolume: 0.42 },
  ReinterpretationScene: { music: 'music_memories', musicVolume: 0.24 },
  ClosingScene: { music: 'music_farewell', musicVolume: 0.6 },
  EndScene: { music: 'music_farewell', musicVolume: 0.42 },
  EpilogueScene: { music: 'music_epilogue', musicVolume: 0.58 },
};

const MUSIC = {
  music_theme: [146.83, 174.61, 220.00],
  music_routine: [130.81, 164.81, 196.00],
  music_memories: [116.54, 146.83, 174.61],
  music_yard: [174.61, 220.00, 261.63],
  music_farewell: [110.00, 146.83, 174.61],
  music_epilogue: [174.61, 220.00, 261.63],
};

let sharedContext = null;
function context() {
  if (!sharedContext) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) sharedContext = new AC();
  }
  if (sharedContext?.state === 'suspended') sharedContext.resume().catch(() => {});
  return sharedContext;
}

function masterDestination(ctx, gainValue) {
  const gain = ctx.createGain();
  gain.gain.value = gainValue;
  gain.connect(ctx.destination);
  return gain;
}

class ProceduralSound {
  constructor(nodes = [], gain = null) { this.nodes = nodes; this.gain = gain; }
  stop() { for (const n of this.nodes) { try { n.stop?.(); } catch {} try { n.disconnect?.(); } catch {} } this.nodes = []; }
  destroy() { this.stop(); try { this.gain?.disconnect?.(); } catch {} this.gain = null; }
  setVolume(value) { if (this.gain) this.gain.gain.setTargetAtTime(Math.max(0, value), context()?.currentTime || 0, 0.03); }
}

function noiseBuffer(ctx, seconds = 2) {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function oneShot(key, volume = 0.2, rate = 1) {
  const ctx = context();
  if (!ctx) return null;
  const out = masterDestination(ctx, volume);
  const now = ctx.currentTime;
  const nodes = [];
  const osc = (type, f, dur, level = 0.2, endF = null) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f * rate, now);
    if (endF) o.frequency.exponentialRampToValueAtTime(Math.max(20, endF * rate), now + dur);
    g.gain.setValueAtTime(level, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(out); o.start(now); o.stop(now + dur); nodes.push(o, g);
  };
  const hit = (dur = 0.12, level = 0.18, cutoff = 1000) => {
    const s = ctx.createBufferSource(); const f = ctx.createBiquadFilter(); const g = ctx.createGain();
    s.buffer = noiseBuffer(ctx, dur); f.type = 'lowpass'; f.frequency.value = cutoff;
    g.gain.setValueAtTime(level, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    s.connect(f); f.connect(g); g.connect(out); s.start(now); nodes.push(s, f, g);
  };

  switch (key) {
    case 'step_tile': hit(.10,.16,2400); osc('sine',390,.08,.08); break;
    case 'step_concrete': hit(.13,.19,700); osc('sine',90,.12,.09); break;
    case 'step_wood_1': case 'step_wood_2': hit(.13,.18,900); osc('sine',key.endsWith('2')?126:112,.14,.10); break;
    case 'door_open': hit(.18,.10,850); osc('sawtooth',118,.65,.035,82); break;
    case 'door_close': hit(.20,.27,550); osc('sine',78,.22,.13); break;
    case 'faucet': hit(1.2,.13,4800); break;
    case 'light_switch': hit(.055,.23,6200); osc('square',950,.035,.04); break;
    case 'clock_tick': osc('square',1450,.045,.06); break;
    case 'tool_click': hit(.07,.16,6000); osc('sine',1100,.08,.08); break;
    case 'paper_rustle': hit(.45,.13,5200); break;
    case 'chair_sit': hit(.55,.12,950); osc('sawtooth',92,.45,.025,74); break;
    case 'object_put': hit(.16,.18,900); osc('sine',140,.14,.07); break;
    case 'object_pick': default: hit(.10,.14,2600); osc('sine',520,.10,.05); break;
  }
  setTimeout(() => { try { out.disconnect(); } catch {} }, 1800);
  return new ProceduralSound(nodes, out);
}

function loopNoise(kind, volume) {
  const ctx = context(); if (!ctx) return null;
  const out = masterDestination(ctx, volume); const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, 4); source.loop = true;
  const filter = ctx.createBiquadFilter();
  if (kind === 'fridge_hum') { filter.type='lowpass'; filter.frequency.value=150; }
  else if (kind === 'radio_static') { filter.type='bandpass'; filter.frequency.value=1300; filter.Q.value=.45; }
  else { filter.type='lowpass'; filter.frequency.value=1700; }
  source.connect(filter); filter.connect(out); source.start();
  const nodes=[source,filter];
  if (kind === 'fridge_hum') {
    const o=ctx.createOscillator(); const g=ctx.createGain(); o.frequency.value=59.5; g.gain.value=.55; o.connect(g); g.connect(out); o.start(); nodes.push(o,g);
  }
  return new ProceduralSound(nodes,out);
}

function musicLoop(key, volume) {
  const ctx = context(); if (!ctx) return null;
  const out = masterDestination(ctx, volume * .33); const freqs = MUSIC[key] || MUSIC.music_routine; const nodes=[];
  freqs.forEach((f,i)=>{
    const o=ctx.createOscillator(); const g=ctx.createGain();
    o.type=i===0?'sine':'triangle'; o.frequency.value=f/(i===0?2:1);
    g.gain.value=i===0?.22:.10; o.connect(g); g.connect(out); o.start(); nodes.push(o,g);
  });
  const lfo=ctx.createOscillator(); const lfoGain=ctx.createGain(); lfo.frequency.value=.08; lfoGain.gain.value=.035;
  lfo.connect(lfoGain); lfoGain.connect(out.gain); lfo.start(); nodes.push(lfo,lfoGain);
  return new ProceduralSound(nodes,out);
}

export default class AudioSystem {
  constructor(scene) { this.scene=scene; this.music=null; this.ambience=null; this.musicLocal=1; this.ambienceLocal=1; this.lastStepAt=0; }
  volume(channel, local=1) { const master=Number(SETTINGS.masterVolume??1); const level=Number(SETTINGS[channel]??1); return Math.max(0,Math.min(1,master*level*local)); }
  playSfx(key, config={}, caption=null) { const sound=oneShot(key,this.volume('sfxVolume',config.volume??1),config.rate??1); if(caption) window.ACasaUI?.captionSound(caption); return sound; }
  playMusic(key, config={}) { this.stopMusic(); this.musicLocal=config.volume??1; this.music=musicLoop(key,this.volume('musicVolume',this.musicLocal)); return this.music; }
  playAmbience(key, config={}, caption=null) { this.stopAmbience(); this.ambienceLocal=config.volume??1; this.ambience=loopNoise(key,this.volume('ambienceVolume',this.ambienceLocal)); if(caption) window.ACasaUI?.captionSound(caption); return this.ambience; }
  setupForScene() { const profile=SCENE_AUDIO[this.scene.scene.key]; if(!profile)return; if(profile.music)this.playMusic(profile.music,{volume:profile.musicVolume??1}); if(profile.ambience)this.playAmbience(profile.ambience,{volume:profile.ambienceVolume??1}); }
  footstep(surface='wood') { const now=performance.now(); if(now-this.lastStepAt<300)return; this.lastStepAt=now; const keys=surface==='tile'?['step_tile']:surface==='concrete'?['step_concrete']:['step_wood_1','step_wood_2']; this.playSfx(keys[Math.floor(Math.random()*keys.length)],{volume:.38,rate:.96+Math.random()*.08}); }
  refreshVolumes() { if(this.music)this.music.setVolume(this.volume('musicVolume',this.musicLocal)*.33); if(this.ambience)this.ambience.setVolume(this.volume('ambienceVolume',this.ambienceLocal)); }
  stopMusic(){ if(this.music)this.music.destroy(); this.music=null; }
  stopAmbience(){ if(this.ambience)this.ambience.destroy(); this.ambience=null; }
  destroy(){ this.stopMusic(); this.stopAmbience(); }
}