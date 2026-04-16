'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type GameCategory = 'All' | 'Focus' | 'Memory' | 'Calm';
type GameId = 'focus-tap' | 'memory-sequence' | 'breathing-rhythm';

interface GameDefinition {
  id: GameId;
  title: string;
  description: string;
  category: Exclude<GameCategory, 'All'>;
  xpReward: number;
  accent: string;
}

const GAMES: GameDefinition[] = [
  {
    id: 'focus-tap',
    title: 'Star Tap Sprint',
    description: 'Tap the glowing star before it moves. Great for attention and reaction time.',
    category: 'Focus',
    xpReward: 180,
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    id: 'memory-sequence',
    title: 'Memory Lights',
    description: 'Watch the light sequence, then repeat it in the right order.',
    category: 'Memory',
    xpReward: 220,
    accent: 'from-violet-500 to-fuchsia-400',
  },
  {
    id: 'breathing-rhythm',
    title: 'Calm Breathing Flow',
    description: 'Follow inhale and exhale cues to settle your rhythm and regain calm.',
    category: 'Calm',
    xpReward: 150,
    accent: 'from-emerald-500 to-teal-400',
  },
];

const MEMORY_TONES = [
  { id: 0, color: 'bg-rose-400', ring: 'ring-rose-200' },
  { id: 1, color: 'bg-amber-400', ring: 'ring-amber-200' },
  { id: 2, color: 'bg-sky-400', ring: 'ring-sky-200' },
  { id: 3, color: 'bg-emerald-400', ring: 'ring-emerald-200' },
];

const FOCUS_BOARD = [
  'translate-x-[-90px] translate-y-[-45px]',
  'translate-x-[70px] translate-y-[-60px]',
  'translate-x-[-40px] translate-y-[65px]',
  'translate-x-[95px] translate-y-[55px]',
  'translate-x-0 translate-y-0',
  'translate-x-[-110px] translate-y-[10px]',
];

export const GameView: React.FC = () => {
  const [category, setCategory] = useState<GameCategory>('All');
  const [selectedGame, setSelectedGame] = useState<GameId>('focus-tap');

  const [focusScore, setFocusScore] = useState(0);
  const [focusTimeLeft, setFocusTimeLeft] = useState(20);
  const [focusTargetIndex, setFocusTargetIndex] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);

  const [memorySequence, setMemorySequence] = useState<number[]>([0, 2]);
  const [memoryPlayerInput, setMemoryPlayerInput] = useState<number[]>([]);
  const [memoryShowIndex, setMemoryShowIndex] = useState<number>(-1);
  const [memoryRound, setMemoryRound] = useState(1);
  const [memoryLocked, setMemoryLocked] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState('Watch the lights, then repeat them.');

  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCycles, setBreathCycles] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathRunning, setBreathRunning] = useState(false);

  const filteredGames = useMemo(() => {
    return category === 'All'
      ? GAMES
      : GAMES.filter(game => game.category === category);
  }, [category]);

  const selectedDefinition = useMemo(
    () => GAMES.find(game => game.id === selectedGame) ?? GAMES[0],
    [selectedGame],
  );

  useEffect(() => {
    if (!focusRunning) return;
    if (focusTimeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFocusTimeLeft(previous => {
        if (previous <= 1) {
          setFocusRunning(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [focusRunning, focusTimeLeft]);

  useEffect(() => {
    if (!focusRunning) return;
    const mover = window.setInterval(() => {
      setFocusTargetIndex(previous => (previous + 1) % FOCUS_BOARD.length);
    }, 900);
    return () => window.clearInterval(mover);
  }, [focusRunning]);

  useEffect(() => {
    let interval: number | undefined;
    const starter = window.setTimeout(() => {
      setMemoryLocked(true);
      setMemoryShowIndex(-1);

      let pointer = 0;
      interval = window.setInterval(() => {
        if (pointer >= memorySequence.length) {
          if (interval) window.clearInterval(interval);
          setMemoryShowIndex(-1);
          setMemoryLocked(false);
          setMemoryStatus('Your turn. Tap the colors in order.');
          return;
        }

        setMemoryShowIndex(memorySequence[pointer]);
        pointer += 1;
      }, 700);

    }, 120);

    return () => {
      window.clearTimeout(starter);
      if (interval) window.clearInterval(interval);
    };
  }, [memoryRound, memorySequence]);

  useEffect(() => {
    if (!breathRunning) return;

    const phases = {
      inhale: { next: 'hold' as const, increment: 20, limit: 100 },
      hold: { next: 'exhale' as const, increment: 25, limit: 100 },
      exhale: { next: 'inhale' as const, increment: 20, limit: 100 },
    };

    const timer = window.setInterval(() => {
      setBreathProgress(previous => {
        const nextValue = previous + phases[breathPhase].increment;
        if (nextValue >= phases[breathPhase].limit) {
          setBreathPhase(phases[breathPhase].next);
          if (breathPhase === 'exhale') {
            setBreathCycles(previousCycles => previousCycles + 1);
          }
          return 0;
        }
        return nextValue;
      });
    }, 800);

    return () => window.clearInterval(timer);
  }, [breathRunning, breathPhase]);

  const totalXp = focusScore * 10 + Math.max(memoryRound - 1, 0) * 35 + breathCycles * 20;

  const handleFocusStart = () => {
    setFocusScore(0);
    setFocusTimeLeft(20);
    setFocusTargetIndex(0);
    setFocusRunning(true);
  };

  const handleFocusTap = () => {
    if (!focusRunning) return;
    setFocusScore(previous => previous + 1);
    setFocusTargetIndex(previous => (previous + 2) % FOCUS_BOARD.length);
  };

  const resetMemoryGame = () => {
    setMemoryRound(1);
    setMemorySequence([0, 2]);
    setMemoryPlayerInput([]);
    setMemoryStatus('Watch the lights, then repeat them.');
  };

  const handleMemoryTap = (value: number) => {
    if (memoryLocked) return;

    const nextInput = [...memoryPlayerInput, value];
    const currentIndex = memoryPlayerInput.length;

    if (memorySequence[currentIndex] !== value) {
      setMemoryStatus('Almost. The pattern changed, so we restart gently.');
      setMemoryPlayerInput([]);
      window.setTimeout(() => {
        resetMemoryGame();
      }, 900);
      return;
    }

    if (nextInput.length === memorySequence.length) {
      const nextValue = (memorySequence.length + memoryRound + value) % MEMORY_TONES.length;
      setMemoryStatus('Great memory. New round unlocked.');
      setMemoryPlayerInput([]);
      setMemoryRound(previous => previous + 1);
      setMemorySequence(previous => [...previous, nextValue]);
      return;
    }

    setMemoryPlayerInput(nextInput);
  };

  const toggleBreathing = () => {
    if (breathRunning) {
      setBreathRunning(false);
      return;
    }
    setBreathPhase('inhale');
    setBreathProgress(0);
    setBreathRunning(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10"
    >
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <h2 className="font-headline text-5xl font-bold text-primary italic leading-tight">
            Focus Games
          </h2>
          <p className="max-w-2xl text-on-surface-variant opacity-80">
            The prototype now includes real mini-games: train attention, memory and calm with instant feedback.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[1.75rem] border border-outline-variant/10 bg-surface-container-low p-3">
          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">XP Earned</p>
            <p className="text-2xl font-black text-primary">{totalXp}</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Focus Hits</p>
            <p className="text-2xl font-black text-primary">{focusScore}</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Calm Cycles</p>
            <p className="text-2xl font-black text-primary">{breathCycles}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        {(['All', 'Focus', 'Memory', 'Calm'] as GameCategory[]).map(item => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={cn(
              'rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-all',
              category === item
                ? 'bg-primary text-on-primary shadow-lg'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8">
        <section className="grid grid-cols-1 gap-5">
          {filteredGames.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={cn(
                'overflow-hidden rounded-[2rem] border text-left transition-all',
                selectedGame === game.id
                  ? 'border-primary/30 bg-white shadow-xl'
                  : 'border-outline-variant/10 bg-surface-container-lowest hover:border-primary/20',
              )}
            >
              <div className={`h-3 bg-gradient-to-r ${game.accent}`} />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline mb-2">
                      {game.category}
                    </p>
                    <h3 className="font-headline text-3xl font-bold italic text-primary">
                      {game.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    +{game.xpReward} XP
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {game.description}
                </p>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-[2.5rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex flex-col gap-2 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline">
              Live Game Panel
            </p>
            <h3 className="font-headline text-4xl font-black italic text-on-surface">
              {selectedDefinition.title}
            </h3>
            <p className="text-sm text-on-surface-variant">
              {selectedDefinition.description}
            </p>
          </div>

          {selectedGame === 'focus-tap' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Time Left</p>
                  <p className="text-3xl font-black text-primary">{focusTimeLeft}s</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Score</p>
                  <p className="text-3xl font-black text-primary">{focusScore}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Status</p>
                  <p className="text-lg font-black text-primary">{focusRunning ? 'Playing' : 'Ready'}</p>
                </div>
              </div>

              <div className="relative flex h-[340px] items-center justify-center overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.12),_rgba(255,255,255,1)_62%)]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(2,132,199,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.07)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <motion.button
                  key={focusTargetIndex}
                  onClick={handleFocusTap}
                  disabled={!focusRunning}
                  initial={{ scale: 0.7, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    'relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-[0_22px_60px_rgba(14,165,233,0.35)] transition-transform',
                    focusRunning ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50',
                    FOCUS_BOARD[focusTargetIndex],
                  )}
                >
                  <span className="material-symbols-outlined text-4xl">kid_star</span>
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleFocusStart}
                  className="rounded-2xl bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:shadow-lg"
                >
                  {focusRunning ? 'Restart Sprint' : 'Start Sprint'}
                </button>
                <p className="flex items-center text-sm text-on-surface-variant">
                  Tap the star each time it moves. The faster you react, the better the focus score.
                </p>
              </div>
            </div>
          )}

          {selectedGame === 'memory-sequence' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Round</p>
                  <p className="text-3xl font-black text-primary">{memoryRound}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Sequence</p>
                  <p className="text-3xl font-black text-primary">{memorySequence.length}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Progress</p>
                  <p className="text-3xl font-black text-primary">{memoryPlayerInput.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-slate-950 p-6">
                {MEMORY_TONES.map(tone => {
                  const isLit = memoryShowIndex === tone.id;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => handleMemoryTap(tone.id)}
                      disabled={memoryLocked}
                      className={cn(
                        'h-32 rounded-[1.5rem] transition-all ring-4 ring-transparent',
                        tone.color,
                        isLit && cn('scale-[1.03] brightness-125 shadow-2xl', tone.ring),
                        memoryLocked && 'cursor-not-allowed opacity-80',
                      )}
                    />
                  );
                })}
              </div>

              <div className="rounded-2xl bg-surface-container-low px-5 py-4">
                <p className="text-sm font-semibold text-on-surface">{memoryStatus}</p>
              </div>

              <button
                onClick={resetMemoryGame}
                className="rounded-2xl border border-outline-variant/20 px-6 py-3 font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"
              >
                Reset Memory Game
              </button>
            </div>
          )}

          {selectedGame === 'breathing-rhythm' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Phase</p>
                  <p className="text-2xl font-black capitalize text-primary">{breathPhase}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Cycles</p>
                  <p className="text-3xl font-black text-primary">{breathCycles}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Flow</p>
                  <p className="text-3xl font-black text-primary">{Math.round(breathProgress)}%</p>
                </div>
              </div>

              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[2rem] bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.16),_rgba(255,255,255,1)_62%)]">
                <motion.div
                  animate={{
                    scale:
                      breathPhase === 'inhale'
                        ? 1.22
                        : breathPhase === 'hold'
                        ? 1.14
                        : 0.88,
                  }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-[0_30px_80px_rgba(16,185,129,0.28)]"
                >
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                      {breathPhase}
                    </p>
                    <p className="mt-2 text-4xl font-black">{breathRunning ? 'Breathe' : 'Ready'}</p>
                  </div>
                </motion.div>
                <p className="mt-8 max-w-md text-center text-sm text-on-surface-variant">
                  Follow the circle: breathe in, hold softly, then breathe out to calm your body.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleBreathing}
                  className="rounded-2xl bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:shadow-lg"
                >
                  {breathRunning ? 'Pause Session' : 'Start Breathing'}
                </button>
                <button
                  onClick={() => {
                    setBreathRunning(false);
                    setBreathCycles(0);
                    setBreathProgress(0);
                    setBreathPhase('inhale');
                  }}
                  className="rounded-2xl border border-outline-variant/20 px-6 py-3 font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"
                >
                  Reset Calm Flow
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};
