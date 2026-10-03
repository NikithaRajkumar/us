import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { memories } from './data/memories.js';

const clues = memories.map((m) => m.message);

function PhotoCard({ memory, index }) {
  const [failed, setFailed] = useState(false);
  const isVideo = memory.image && memory.image.endsWith('.mp4');
  return <div className={`photo-frame${index === 4 ? ' landscape' : index === 11 ? ' landscape-xl' : index === 12 ? ' landscape-xl' : ''}`} key={`${memory.image}-${index}`}>
    {isVideo ? <video className="memory-photo" src={memory.image} autoPlay loop muted playsInline controls style={{objectFit:'cover'}} /> :
      memory.image && !failed ? <img className="memory-photo" src={memory.image} alt={memory.caption || 'A shared memory'} onError={() => setFailed(true)} /> :
      <div className="photo-placeholder" aria-label="Photo placeholder"><span className="placeholder-orb"><Sparkles size={18} /></span><span>Your photo goes here</span><small>public/photos</small></div>}
    <p className="photo-caption">{memory.caption}</p>
  </div>;
}

export default function App() {
  const [scene, setScene] = useState('intro');
  const [stage, setStage] = useState(0);
  const [choice, setChoice] = useState('');
  const [dodgePos, setDodgePos] = useState({ x: null, y: null });
  const [dodgeCount, setDodgeCount] = useState(0);
  const audioRef = useRef(null);
  const audio2Ref = useRef(null);
  const dodgeBtnRef = useRef(null);

  useEffect(() => {
    if (scene !== 'apology') return;
    const handleDodge = (e) => {
      if (!dodgeBtnRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = dodgeBtnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist < 110) {
        const angle = Math.atan2(cy - clientY, cx - clientX);
        const nx = Math.min(90, Math.max(5, ((cx + Math.cos(angle) * 200) / window.innerWidth) * 100));
        const ny = Math.min(85, Math.max(10, ((cy + Math.sin(angle) * 200) / window.innerHeight) * 100));
        setDodgePos({ x: nx, y: ny });
        setDodgeCount(c => c + 1);
      }
    };
    window.addEventListener('mousemove', handleDodge, { passive: true });
    window.addEventListener('touchmove', handleDodge, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleDodge);
      window.removeEventListener('touchmove', handleDodge);
    };
  }, [scene]);

  useEffect(() => {
    if (scene !== 'discovery' || stage < memories.length) return;
    const timer = window.setTimeout(() => setScene('reveal'), 2600);
    return () => window.clearTimeout(timer);
  }, [scene, stage]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
  }, []);

  const begin = () => {
    if (audioRef.current) { audioRef.current.play().catch(() => {}); }
    setScene('discovery');
    setStage(0);
  };
  const advance = () => setScene('apology');
  const goBack = () => {
    if (scene === 'reveal') { setScene('discovery'); }
    else if (scene === 'apology') { setScene('reveal'); setDodgePos({ x: null, y: null }); setDodgeCount(0); }
  };
  const goBackStage = () => setStage(s => Math.max(s - 1, 0));
  const handleClose = () => {
    if (choice === 'yes') {
      if (audio2Ref.current) { audio2Ref.current.pause(); audio2Ref.current.currentTime = 0; }
      if (audioRef.current) { audioRef.current.play().catch(() => {}); }
    }
    setChoice('');
  };
  const handleYes = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if (audio2Ref.current) { audio2Ref.current.play().catch(() => {}); }
    setChoice('yes');
  };

  return <main className={`app scene-${scene}`}>
    <div className="ambient" aria-hidden="true"><i className="grain" /><i className="glow glow-one"/><i className="glow glow-two"/><div className="stars">{Array.from({length: 30}, (_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*61)%100}%`,animationDuration:`${2+(i%5)}s`,animationDelay:`${i*-.3}s`}} />)}</div></div>
    <header className="topbar"><span className="brand-mark">✳</span><span className="brand-name">a little something</span><audio ref={audioRef} loop src="/music.mp3" /><audio ref={audio2Ref} src="/wanna-be-yours.mp3" /></header>

    {scene === 'intro' && <section className="screen intro-screen" key="intro"><div className="eyebrow"><span className="eyebrow-line"/> A NOTE, IN ANOTHER FORM <span className="eyebrow-line"/></div><h1>I have something<br/><em>for you.</em></h1><p className="intro-copy">You probably won't understand it at first.<br/>Just trust me and click.</p><button className="primary-button" onClick={begin}>REVEAL <ArrowRight size={17}/></button><div className="scroll-note"><span/> TAKE A MOMENT</div></section>}

    {scene === 'discovery' && <section className="screen discovery-screen" key="discovery">
      {stage > 0 && <button className="back-button" onClick={goBackStage}>← Back</button>}
      <div className="discovery-heading"><span className="eyebrow">A SMALL DISCOVERY</span><h2>{stage === 0 ? <>Okay... you <em>found it.</em></> : stage < memories.length ? <em>{clues[stage - 1]}</em> : <>Maybe you know<br/><em>where this is going.</em></>}</h2>{stage === 0 && <p className="muted">But that's only the beginning.</p>}</div>
      {stage > 0 && stage <= memories.length && <div className="discovery-memory" key={stage}><PhotoCard memory={memories[stage-1]} index={stage-1}/></div>}
      <div className="progress-track" aria-label={`Discovery ${stage} of ${memories.length}`}>{memories.map((_,i)=><i key={i} className={i < stage ? 'filled' : ''}/>)}</div>
      <span className="discovery-hint">{stage === 0 ? 'YOUR STORY IS WAITING' : stage < memories.length ? 'KEEP GOING' : 'A LITTLE MORE'}</span>
      {stage < memories.length && <button className="quiet-next" onClick={() => setStage(s => Math.min(s + 1, memories.length))}>{stage === 0 ? 'Tap to uncover' : 'Continue'} <ArrowRight size={13}/></button>}
    </section>}

    {scene === 'reveal' && <section className="screen reveal-screen" key="reveal"><button className="back-button" onClick={goBack}>← Back</button><span className="eyebrow">THE THINGS WE KEEP</span><h2>You've probably figured out<br/>what this is about.</h2><div className="reveal-pause"/><p className="us-word">Us<span>.</span></p><p className="reveal-sub">We really had some beautiful moments.</p><div className="memory-row">{memories.slice(0,3).map((m,i)=><PhotoCard key={i} memory={m} index={i}/>)}</div><div className="memory-lines"><p>I still remember the little things.</p><p>The laughs. The random conversations.</p><p>The days that didn't seem special at the time...</p><p className="warm-line">But somehow became memories I never wanted to lose.</p></div><button className="text-button" onClick={advance}>There's something else <ArrowRight size={15}/></button></section>}

    {scene === 'apology' && <section className="screen apology-screen" key="apology"><button className="back-button" onClick={goBack}>← Back</button><span className="eyebrow">A LITTLE HONESTY</span><div className="apology-copy"><p>I know I can't change what happened.</p><p>I know saying sorry can't undo the moments that hurt you.</p></div><div className="final-copy"><p className="give-chance-line"><strong>Give me one last chance.</strong></p><p>One chance to love you the way you deserve.<br/>One chance to make you feel the love I've always had for you.<br/>One chance to show you—not just tell you—that I can do better.</p><p className="respect-line"><em>I don't want to promise you a perfect us.<br/>I just want one last chance to make our us worth fighting for.</em></p></div><div className="question-block"><h2>Can we try again daddy?</h2><div className="choice-buttons" style={{position:'relative', minHeight:'60px'}}><button className="primary-button" onClick={handleYes}>ONE MORE CHANCE <ArrowRight size={16}/></button><button ref={dodgeBtnRef} className="secondary-button" onClick={()=>setChoice('blocked')} style={dodgePos.x !== null ? {position:'fixed', left:`${dodgePos.x}%`, top:`${dodgePos.y}%`, transform:'translate(-50%,-50%)', transition:'left 0.15s ease, top 0.15s ease', zIndex:999} : {}}>{dodgeCount === 0 ? 'I NEED TIME' : dodgeCount < 3 ? '...nope 🏃' : dodgeCount < 6 ? 'STOP CHASING ME' : dodgeCount < 10 ? "YOU CAN'T CATCH ME 😂" : 'okay fine... 🥲'}</button></div></div></section>}

    {choice && <div className="choice-overlay" role="dialog" aria-modal="true"><div className="choice-card"><span className="choice-star">✳</span>{choice === 'blocked' ? <><h2>Not allowed. 🚫</h2><p>Please... one last chance.</p><p style={{fontSize:'13px',color:'#a89ab4',marginTop:'8px'}}>You weren't supposed to click that 😅</p></> : <><h2>Then let's start again.</h2><p>Slowly. Honestly. Together.</p><div className="heart-bloom">♡</div></>}<button className="text-button" onClick={handleClose}>Close <span aria-hidden="true">×</span></button></div></div>}
    <footer className="footer"><span>MADE OF LITTLE THINGS</span><span className="footer-dot">✳</span><span>TAKE YOUR TIME</span></footer>
  </main>;
}
