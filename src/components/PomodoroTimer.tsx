import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Flame, Sparkles, Bell, Volume2, VolumeX, Shield, Timer } from "lucide-react";

interface PomodoroTimerProps {
  onSprintComplete: (minutes: number) => void;
  isUserFocusing: boolean;
  setIsUserFocusing: (focusing: boolean) => void;
}

export default function PomodoroTimer({ onSprintComplete, isUserFocusing, setIsUserFocusing }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [presetDuration, setPresetDuration] = useState(25); // default 25
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isMuted, setIsMuted] = useState(false);
  const [totalFocusXP, setTotalFocusXP] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Tone Generator
  const playAlertSound = (type: 'success' | 'click' | 'break') => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'success') {
        // High upbeat beep
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'break') {
        // Soft calming chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.00, audioCtx.currentTime); // G4
        osc.frequency.setValueAtTime(440.00, audioCtx.currentTime + 0.2); // A4
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } else {
        // Soft click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      console.warn("Web Audio is blocked or unsupported.", e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      setIsUserFocusing(mode === 'work');
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer Finished!
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);

            if (mode === 'work') {
              playAlertSound('success');
              const xpEarned = presetDuration * 2; // 2 XP per focus minute
              setTotalFocusXP((prev) => prev + xpEarned);
              onSprintComplete(presetDuration);
              alert(`🎉 Outstanding Deep-Focus Sprint completed! You earned +${xpEarned} XP! Take a well-deserved break.`);
              
              // Auto switch to break
              setMode('break');
              setMinutes(5);
              setSeconds(0);
            } else {
              playAlertSound('break');
              alert(`☕ Break time is over! Ready to lock back in?`);
              setMode('work');
              setMinutes(presetDuration);
              setSeconds(0);
            }
            setIsUserFocusing(false);
          } else {
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsUserFocusing(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, minutes, seconds, mode, presetDuration]);

  const handleStartPause = () => {
    playAlertSound('click');
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playAlertSound('click');
    setIsRunning(false);
    setMode('work');
    setMinutes(presetDuration);
    setSeconds(0);
    setIsUserFocusing(false);
  };

  const handlePresetChange = (duration: number) => {
    playAlertSound('click');
    setIsRunning(false);
    setMode('work');
    setPresetDuration(duration);
    setMinutes(duration);
    setSeconds(0);
    setIsUserFocusing(false);
  };

  // Calculate percentage progress
  const totalSeconds = (mode === 'work' ? presetDuration : 5) * 60;
  const currentSecondsLeft = minutes * 60 + seconds;
  const progressPercent = ((totalSeconds - currentSecondsLeft) / totalSeconds) * 100;

  return (
    <div id="pomodoro-timer-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Glow Effect when focusing */}
      <AnimatePresence>
        {isUserFocusing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 blur-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${mode === 'work' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-green-500/10 text-green-400'}`}>
            <Timer className="w-5 h-5" />
          </div>
          <span className="font-sans font-semibold text-slate-200 text-sm tracking-wide uppercase">
            {mode === 'work' ? 'Deep Focus Sprint' : 'Calm Break'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title={isMuted ? "Unmute" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Dial Area */}
      <div className="flex flex-col items-center justify-center py-6 relative z-10">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Radial progress circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="80"
              className="stroke-slate-800 fill-none"
              strokeWidth="6"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="80"
              className={`fill-none ${mode === 'work' ? 'stroke-cyan-500' : 'stroke-green-500'}`}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              transition={{ ease: "easeInOut" }}
            />
          </svg>

          {/* Time digits */}
          <div className="flex flex-col items-center z-10">
            <div className="font-mono text-4xl font-bold text-white tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            {isUserFocusing && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mt-1 uppercase tracking-widest"
              >
                <Flame className="w-3.5 h-3.5 fill-cyan-400/20" /> Sprinting
              </motion.div>
            )}
            {!isRunning && minutes === presetDuration && (
              <span className="text-slate-400 text-[11px] uppercase tracking-wider mt-1">Ready</span>
            )}
            {!isRunning && minutes !== presetDuration && (
              <span className="text-amber-400 text-[11px] uppercase tracking-wider mt-1">Paused</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Interval Presets */}
      <div className="grid grid-cols-3 gap-2 py-2 z-10">
        {[25, 45, 60].map((dur) => (
          <button
            key={dur}
            disabled={isRunning && presetDuration === dur}
            onClick={() => handlePresetChange(dur)}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
              presetDuration === dur
                ? 'bg-slate-800 text-white border-cyan-500/50 shadow-md shadow-cyan-950/40'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {dur} Min
          </button>
        ))}
      </div>

      {/* Primary Control Buttons */}
      <div className="flex items-center gap-3 mt-4 z-10">
        <button
          onClick={handleStartPause}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/30'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-white" /> Pause Sprint
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> Begin Focus
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Focus Stats Line */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 z-10">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> +{presetDuration * 2} Potential Focus XP
        </span>
        <span>Session: {presetDuration}m</span>
      </div>
    </div>
  );
}
