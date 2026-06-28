import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, Sparkles, BookOpen, Clock, Users, Shield, Plus,
  CheckCircle, CheckCircle2, Circle, Trash2, Cpu, RefreshCw, Zap,
  Briefcase, GraduationCap, Building2, Trophy, Award, MessageSquare, AlertTriangle,
  User2, LayoutGrid
} from "lucide-react";
import { Task, Flashcard, GuildMember, FocusDuel, Note, MeetingInvite, PersonaType } from "./types";
import PomodoroTimer from "./components/PomodoroTimer";
import SyllabusEngine from "./components/SyllabusEngine";
import FlashcardModule from "./components/FlashcardModule";
import GuildsLeaderboard from "./components/GuildsLeaderboard";
import MeetingShield from "./components/MeetingShield";
import AiNotepad from "./components/AiNotepad";
import UserProfile from "./components/UserProfile";

export default function App() {
  // 1. Core State Managers
  const [persona, setPersona] = useState<PersonaType>('Student');
  const [subject, setSubject] = useState("CS-101 Data Structures");
  const [userXP, setUserXP] = useState(240);
  const [streak, setStreak] = useState(4);
  const [isUserFocusing, setIsUserFocusing] = useState(false);
  const [userName, setUserName] = useState("Zen Scholar");
  const [uniqueId] = useState("NEXUS-85392");
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'profile'>('dashboard');

  // Recommendations & AI Suggestions states
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);

  // 2. Mock Databases pre-populated with realistic, engaging records
  const [tasks, setTasks] = useState<Task[]>([
    { id: "task-1", title: "Verify Arrays & Singly Linked Lists modules", duration: 25, xp: 30, priority: "high", completed: false, category: "Syllabus" },
    { id: "task-2", title: "Draft flashcards for recursive pointer swaps", duration: 15, xp: 20, priority: "medium", completed: true, category: "Recall" },
    { id: "task-3", title: "Complete CS Midterm preparation review", duration: 45, xp: 50, priority: "high", completed: false, category: "Exam Prep" }
  ]);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: "fc-1", front: "What is the time complexity of searching a value in an unsorted Singly Linked List?", back: "O(n) - you must potentially traverse all nodes sequentially.", topic: "Linked Lists" },
    { id: "fc-2", front: "How does the Leitner Active Recall system optimize learning?", back: "By using spaced repetition; card intervals increase when correctly remembered, and decrease when forgotten.", topic: "Recall Theory" }
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "note-1",
      title: "Binary Tree Traversals Notes",
      content: "Three basic depth-first traversals:\n1. Pre-order: Visit Root, Left, Right.\n2. In-order: Visit Left, Root, Right.\n3. Post-order: Visit Left, Right, Root.",
      updatedAt: "June 28, 2026"
    }
  ]);

  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([
    { id: "user-1", name: "You", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80", status: 'idle', xp: 240, streak: 4, glowing: false, isCurrentUser: true },
    { id: "user-2", name: "Rahul Deshmukh", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80", status: 'focusing', focusSessionLeft: "14m left", xp: 310, streak: 6, glowing: true },
    { id: "user-3", name: "Sarah Connor", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80", status: 'idle', xp: 290, streak: 3, glowing: false },
    { id: "user-4", name: "Amit Patel", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80", status: 'offline', xp: 195, streak: 1, glowing: false }
  ]);

  const [duels, setDuels] = useState<FocusDuel[]>([]);

  const [meetingInvites, setMeetingInvites] = useState<MeetingInvite[]>([
    { id: "invite-1", title: "Product Architecture Review", time: "1:00 PM", duration: 45, priority: "high", status: "pending", organizer: "Marcus Aurelius" },
    { id: "invite-2", title: "Low priority Align sync", time: "3:30 PM", duration: 30, priority: "low", status: "pending", organizer: "Toby Flenderson" }
  ]);

  // Form creation states
  const [customTaskTitle, setCustomTaskTitle] = useState("");
  const [customTaskDuration, setCustomTaskDuration] = useState(25);
  const [customTaskPriority, setCustomTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Sync "You" on the leaderboard with user's actual XP, name, and focusing status
  useEffect(() => {
    setGuildMembers(prev =>
      prev.map(m =>
        m.isCurrentUser
          ? { ...m, name: userName, xp: userXP, status: isUserFocusing ? 'focusing' : 'idle', glowing: isUserFocusing }
          : m
      )
    );
  }, [userName, userXP, isUserFocusing]);

  const handleAddGroupMemberToLeaderboard = (friendName: string, groupName: string) => {
    const avatars = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80"
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    setGuildMembers(prev => {
      if (prev.some(m => m.name.toLowerCase() === friendName.toLowerCase())) return prev;
      return [
        ...prev,
        {
          id: `friend-${Date.now()}`,
          name: friendName,
          avatarUrl: randomAvatar,
          status: 'idle',
          xp: 120,
          streak: 1,
          glowing: false,
          recentActivity: `Joined "${groupName}" via unique invitation`
        }
      ];
    });
  };

  // Auto recommend tasks when persona or subject shifts
  useEffect(() => {
    fetchSmartRecommendations();
  }, [persona, subject]);

  // Handle Focus Sprint completion from PomodoroTimer
  const handleSprintComplete = (minutesFocused: number) => {
    const xpReward = minutesFocused * 2; // 2 XP per focus minute
    setUserXP(prev => prev + xpReward);
    setStreak(prev => prev + 1);

    // If there is an active focus duel, add progress!
    if (duels.length > 0) {
      setDuels(prev =>
        prev.map(d => {
          if (d.status === "active") {
            const updatedUserProgress = Math.min(d.userProgressMinutes + minutesFocused, d.targetDuration);
            const isCompletedNow = updatedUserProgress >= d.targetDuration;
            if (isCompletedNow) {
              alert(`🏆 DUEL WON! You completed your ${d.targetDuration}-minute focus sprint before anyone else and earned the Jackpot of +${d.xpPool} XP!`);
              setUserXP(x => x + d.xpPool);
              return { ...d, userProgressMinutes: updatedUserProgress, status: 'completed' as const };
            }
            return { ...d, userProgressMinutes: updatedUserProgress };
          }
          return d;
        })
      );
    }
  };

  // Fetch Smart Recommendations from Server
  const fetchSmartRecommendations = async () => {
    setIsRecommending(true);
    try {
      const response = await fetch("/api/recommend-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTasks: tasks.filter(t => !t.completed).map(t => t.title),
          persona,
          subject
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      }
    } catch (e) {
      console.warn("Failed fetching recommendations, using fallbacks.");
    } finally {
      setIsRecommending(false);
    }
  };

  // 3. Task Management Callbacks
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: customTaskTitle.trim(),
      duration: Number(customTaskDuration),
      xp: Math.round(Number(customTaskDuration) * 1.5),
      priority: customTaskPriority,
      completed: false,
      category: "Personal"
    };

    setTasks(prev => [...prev, newTask]);
    setCustomTaskTitle("");
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const newStatus = !t.completed;
          if (newStatus) {
            setUserXP(x => x + t.xp);
          } else {
            setUserXP(x => Math.max(0, x - t.xp));
          }
          return { ...t, completed: newStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // 4. Flashcard Callbacks
  const handleAddFlashcard = (card: Omit<Flashcard, 'id'>) => {
    const newCard: Flashcard = {
      ...card,
      id: `fc-${Date.now()}`
    };
    setFlashcards(prev => [...prev, newCard]);
  };

  const handleAddMultipleFlashcards = (cards: Omit<Flashcard, 'id'>[]) => {
    const newCards = cards.map((c, idx) => ({ ...c, id: `fc-${Date.now()}-${idx}` }));
    setFlashcards(prev => [...prev, ...newCards]);
  };

  const handleDeleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(fc => fc.id !== id));
  };

  // 5. Guild & Duels Callbacks
  const handleTriggerDuel = (newDuel: Omit<FocusDuel, 'id'>) => {
    const duel: FocusDuel = {
      ...newDuel,
      id: `duel-${Date.now()}`
    };
    setDuels([duel]);
  };

  const handleAddGuildMember = (member: GuildMember) => {
    setGuildMembers(prev => [...prev, member]);
  };

  // 6. Meeting Shield Callbacks
  const handleDeclineInvite = (id: string) => {
    setMeetingInvites(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status: 'declined' } : inv)
    );
    alert("Shield Auto-Blocker: Declined low priority invitation to secure focus hours.");
  };

  const handleAcceptInvite = (id: string) => {
    setMeetingInvites(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status: 'accepted' } : inv)
    );
  };

  const handleShieldDeepWork = () => {
    setMeetingInvites(prev =>
      prev.map(inv => inv.priority === 'low' ? { ...inv, status: 'shielded' } : inv)
    );
    alert("🛡️ Shield Enabled! Low stakes meeting conflicts have been shielded to protect your deep-focus blocks.");
  };

  // 7. Notepad Callbacks
  const handleAddNote = (note: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      updatedAt: "Just now"
    };
    setNotes(prev => [...prev, newNote]);
  };

  const handleUpdateNote = (id: string, content: string) => {
    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, content, updatedAt: "Just now" } : n)
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* 1. Global Navigation / Header Block */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/30">
              <Cpu className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-black text-white text-lg tracking-wide uppercase">Nexus AI</span>
              <span className="text-[10px] text-cyan-400 font-semibold block uppercase tracking-widest leading-none">Productivity Engine</span>
            </div>
          </div>

          {/* User Status Badges */}
          <div className="flex items-center gap-4">
            {/* XP and level status */}
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Focus Grade</span>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-extrabold text-slate-200">
                  {userXP < 300 ? "Novice Focused" : userXP < 600 ? "Zone Commander" : "Zen Master"}
                </span>
                <span className="text-[11px] text-cyan-400 font-extrabold">({userXP} XP)</span>
              </div>
            </div>

            {/* Daily Streak */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500/15" />
              <div>
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">Streak</span>
                <span className="text-sm font-extrabold text-slate-200 leading-none">{streak} Days</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Persona Selection Visual Switcher */}
      <div className="bg-slate-950 border-b border-slate-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-200">Select Your Tactical Focus Persona</h1>
            <p className="text-xs text-slate-500">Tailors recommendations, blocks, and community leaderboards to your work scenario.</p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/80 gap-1.5 w-full md:w-auto">
            <button
              onClick={() => { setPersona('Student'); setSubject('CS-101 Data Structures'); }}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                persona === 'Student'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Students
            </button>
            <button
              onClick={() => { setPersona('Professional'); setSubject('System Design'); }}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                persona === 'Professional'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Professionals
            </button>
            <button
              onClick={() => { setPersona('Entrepreneur'); setSubject('Founders Pitch Deck'); }}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                persona === 'Entrepreneur'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Building2 className="w-4 h-4" /> Entrepreneurs
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Selector Tabs */}
        <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80 gap-1.5 w-full max-w-sm backdrop-blur-md">
          <button
            onClick={() => setActiveMainTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeMainTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/30 font-extrabold scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveMainTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeMainTab === 'profile'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/30 font-extrabold scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <User2 className="w-4 h-4" />
            <span>Profile & Groups</span>
          </button>
        </div>

        {activeMainTab === 'dashboard' ? (
          <>
            {/* Dynamic Theme Banner & Subject Header */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/30 border border-cyan-500/10 px-2 py-0.5 rounded">
              Active Focus Target
            </span>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-lg md:text-xl font-bold bg-transparent border-b border-dashed border-slate-700 hover:border-cyan-500 focus:border-cyan-500 focus:outline-none text-white w-full md:w-auto"
                title="Click to edit your active subject"
              />
            </div>
            <p className="text-xs text-slate-500">Every study block, note summary, and recall quiz centers around this master topic.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850 max-w-md w-full">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-slate-300">
                {persona === 'Student' ? "Syllabus-to-Quest Active" : persona === 'Professional' ? "Meeting Shield Active" : "Founders Circle Active"}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {persona === 'Student' ? "Generate micro-quests from raw class material to study systematically." :
                 persona === 'Professional' ? "Predict prep bottlenecks and decline distracting sync invites automatically." :
                 "Compare metrics with co-founders to eliminate accountability gaps."}
              </p>
            </div>
          </div>
        </div>

        {/* BENTO GRID ROW 1: Focus Timer + Smart Task Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Focus Timer Column */}
          <div className="lg:col-span-5">
            <PomodoroTimer
              onSprintComplete={handleSprintComplete}
              isUserFocusing={isUserFocusing}
              setIsUserFocusing={setIsUserFocusing}
            />
          </div>

          {/* Task Manager and Smart AI Recommendations */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-slate-100 text-base">Adaptable Study Quests</h3>
                    <p className="text-xs text-slate-400">Marking tasks complete awards XP immediately</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Pending: {tasks.filter(t => !t.completed).length}
                </div>
              </div>

              {/* Task Adding Form */}
              <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4 bg-slate-950 p-2 rounded-xl border border-slate-850">
                <input
                  type="text"
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  placeholder="Task title (e.g. Learn Preorder Traverse)"
                  className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={customTaskDuration}
                  onChange={(e) => setCustomTaskDuration(Number(e.target.value))}
                  className="sm:col-span-3 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value={15}>15 Mins</option>
                  <option value={25}>25 Mins</option>
                  <option value={45}>45 Mins</option>
                  <option value={60}>60 Mins</option>
                </select>
                <button
                  type="submit"
                  disabled={!customTaskTitle.trim()}
                  className="sm:col-span-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  Add Quest
                </button>
              </form>

              {/* Stored Tasks */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mb-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 bg-slate-950/40 border rounded-xl flex items-center justify-between gap-3 transition-colors ${
                      task.completed ? 'border-emerald-500/20 bg-emerald-950/5 opacity-60' : 'border-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <span className={`text-xs font-semibold block ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>⏱️ {task.duration} min</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-semibold">💎 +{task.xp} XP</span>
                          {task.category && (
                            <>
                              <span>•</span>
                              <span className="uppercase tracking-widest text-[9px] bg-slate-900 px-1.5 rounded">{task.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart AI Recommendations Section */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Executive Smart Recommendations
                </span>
                <button
                  onClick={fetchSmartRecommendations}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh AI
                </button>
              </div>

              {isRecommending ? (
                <div className="text-center py-4 text-slate-500 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 mx-auto mb-1" /> Generating high impact strategies...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div
                      key={index}
                      className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex flex-col justify-between hover:border-slate-800 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">{rec.category}</span>
                          <span className="text-[9px] text-slate-500 font-bold">{rec.difficulty}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-200 block mb-1 leading-snug line-clamp-1">{rec.title}</span>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{rec.reason}</p>
                      </div>

                      <button
                        onClick={() => {
                          const newT: Task = {
                            id: `rec-${Date.now()}`,
                            title: rec.title,
                            duration: 30,
                            xp: 45,
                            priority: 'high',
                            completed: false,
                            category: rec.category
                          };
                          setTasks(prev => [...prev, newT]);
                          alert(`Added recommended quest: "${rec.title}" to your scheduler!`);
                        }}
                        className="mt-2 text-left text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Track Task
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BENTO GRID ROW 2: Guilds/Leaderboard + Persona Feature Specific */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Social Guilds and live Podium Leaderboard */}
          <div className="lg:col-span-6">
            <GuildsLeaderboard
              members={guildMembers}
              duels={duels}
              onTriggerDuel={handleTriggerDuel}
              onAddMember={handleAddGuildMember}
              userXP={userXP}
            />
          </div>

          {/* Persona Feature Container */}
          <div className="lg:col-span-6">
            {persona === 'Student' ? (
              <SyllabusEngine
                onAddQuests={(newQ) => setTasks(prev => [...prev, ...newQ])}
                persona={persona}
              />
            ) : (
              <MeetingShield
                invites={meetingInvites}
                onDeclineInvite={handleDeclineInvite}
                onAcceptInvite={handleAcceptInvite}
                onShieldDeepWork={handleShieldDeepWork}
              />
            )}
          </div>
        </div>

        {/* BENTO GRID ROW 3: Active Recall Flashcard Module & Notepad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-6">
            <FlashcardModule
              flashcards={flashcards}
              onAddFlashcard={handleAddFlashcard}
              onAddMultipleFlashcards={handleAddMultipleFlashcards}
              onDeleteFlashcard={handleDeleteFlashcard}
            />
          </div>

          <div className="lg:col-span-6">
            <AiNotepad
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onImportFlashcards={handleAddMultipleFlashcards}
            />
          </div>
        </div>
        </>
        ) : (
          <UserProfile
            userName={userName}
            onUpdateUserName={setUserName}
            userXP={userXP}
            streak={streak}
            uniqueId={uniqueId}
            onAddGroupMember={handleAddGroupMemberToLeaderboard}
          />
        )}
      </main>

      {/* 4. Visual Footer Details */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center mt-12">
        <p className="text-xs text-slate-600 font-sans tracking-wide">
          Nexus Productivity Companion • Powered by full-stack server-side Gemini AI models.
        </p>
      </footer>
    </div>
  );
}
