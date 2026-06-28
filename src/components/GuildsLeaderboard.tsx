import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Trophy, Flame, Zap, ShieldAlert, Award, MessageSquare, Shield, Play, Plus, Compass } from "lucide-react";
import { GuildMember, FocusDuel } from "../types";

interface GuildsLeaderboardProps {
  members: GuildMember[];
  duels: FocusDuel[];
  onTriggerDuel: (duel: Omit<FocusDuel, 'id'>) => void;
  onAddMember: (member: GuildMember) => void;
  userXP: number;
}

export default function GuildsLeaderboard({
  members,
  duels,
  onTriggerDuel,
  onAddMember,
  userXP
}: GuildsLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'guild' | 'global'>('guild');
  const [selectedCommunity, setSelectedCommunity] = useState<'cs-guild' | 'founders-circle'>('cs-guild');
  const [globalHub, setGlobalHub] = useState<'chem-dept' | 'founders-hub'>('chem-dept');

  // New Guild Member Form State
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  // Sort members by XP for leaderboard
  const sortedMembers = [...members].sort((a, b) => b.xp - a.xp);

  // Top 3 for the Dynamic Podium
  const podium = sortedMembers.slice(0, 3);
  const remainingMembers = sortedMembers.slice(3);

  const handleStartFocusDuel = (targetMember: GuildMember) => {
    const duelDuration = 45; // 45-min sprint standard
    const newDuel: Omit<FocusDuel, 'id'> = {
      challengerId: "user-1",
      challengerName: "You",
      targetDuration: duelDuration,
      xpPool: 150, // High stakes double XP
      deadlineMinutes: 60,
      status: 'active',
      userProgressMinutes: 0,
      challengerProgressMinutes: 0
    };
    onTriggerDuel(newDuel);
    alert(`⚡ Focus Duel Initiated against ${targetMember.name}! First to complete a 45-minute deep-focus sprint wins the +150 XP Duel Jackpot!`);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const avatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80"
    ];

    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    onAddMember({
      id: `member-${Date.now()}`,
      name: newMemberName,
      avatarUrl: randomAvatar,
      status: 'idle',
      xp: Math.floor(Math.random() * 300) + 100,
      streak: 1,
      glowing: false,
      recentActivity: "Joined the guild recently"
    });

    setNewMemberName("");
    setShowAddMember(false);
  };

  return (
    <div id="guilds-leaderboard-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between">
      <div>
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-bold text-slate-100 text-base">Guilds & Live Podium</h3>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('guild')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guild' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Guild
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'global' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Global Hubs
            </button>
          </div>
        </div>

        {/* Guild Selection Sub-Tabs */}
        {activeTab === 'guild' ? (
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCommunity('cs-guild')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedCommunity === 'cs-guild'
                    ? 'bg-slate-800 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                🎓 CS Study Guild
              </button>
              <button
                onClick={() => setSelectedCommunity('founders-circle')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedCommunity === 'founders-circle'
                    ? 'bg-slate-800 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                💼 Founders Accountability
              </button>
            </div>

            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Invite
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setGlobalHub('chem-dept')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                globalHub === 'chem-dept'
                  ? 'bg-slate-800 text-purple-300 border border-purple-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🧪 Chemistry Department Hub
            </button>
            <button
              onClick={() => setGlobalHub('founders-hub')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                globalHub === 'founders-hub'
                  ? 'bg-slate-800 text-purple-300 border border-purple-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🚀 Startup Founders Hub
            </button>
          </div>
        )}

        {/* Add Friend Form */}
        <AnimatePresence>
          {showAddMember && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddFriend}
              className="mb-4 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 overflow-hidden"
            >
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Member's Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Rahul, Sarah, etc."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 1. Dynamic Podium Visual Area */}
        {activeTab === 'guild' && sortedMembers.length > 0 && (
          <div className="grid grid-cols-3 gap-2 items-end justify-center py-4 bg-slate-950/40 rounded-2xl border border-slate-850 p-3 mb-4">
            {/* 2nd Place */}
            {podium[1] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={podium[1].avatarUrl}
                    alt={podium[1].name}
                    className="w-10 h-10 rounded-full border-2 border-slate-400 object-cover"
                  />
                  {podium[1].glowing && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 ring-2 ring-slate-950">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-300 mt-1.5 truncate max-w-[70px]">
                  {podium[1].name}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">{podium[1].xp} XP</span>
                {/* 2nd Podium block */}
                <div className="w-14 h-10 bg-gradient-to-t from-slate-800 to-slate-900 border-t border-slate-700/50 rounded-t-lg mt-2 flex items-center justify-center text-xs font-bold text-slate-400">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place (Crown Position) */}
            {podium[0] && (
              <div className="flex flex-col items-center">
                <div className="relative -top-1">
                  <Award className="w-5 h-5 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow" />
                  <img
                    src={podium[0].avatarUrl}
                    alt={podium[0].name}
                    className={`w-14 h-14 rounded-full border-2 border-amber-400 object-cover ${
                      podium[0].glowing ? 'ring-4 ring-cyan-500/40 animate-pulse' : ''
                    }`}
                  />
                  {podium[0].glowing && (
                    <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 ring-2 ring-slate-950">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-100 mt-1 truncate max-w-[80px]">
                  {podium[0].name}
                </span>
                <span className="text-[11px] text-amber-400 font-extrabold">{podium[0].xp} XP</span>
                {/* 1st Podium block */}
                <div className="w-16 h-14 bg-gradient-to-t from-amber-950/20 to-slate-900 border border-amber-500/20 rounded-t-xl mt-2 flex items-center justify-center text-sm font-black text-amber-400">
                  1st
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {podium[2] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={podium[2].avatarUrl}
                    alt={podium[2].name}
                    className="w-10 h-10 rounded-full border-2 border-amber-700 object-cover"
                  />
                  {podium[2].glowing && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 ring-2 ring-slate-950">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-300 mt-1.5 truncate max-w-[70px]">
                  {podium[2].name}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">{podium[2].xp} XP</span>
                {/* 3rd Podium block */}
                <div className="w-14 h-8 bg-gradient-to-t from-slate-800 to-slate-900 border-t border-slate-700/50 rounded-t-lg mt-2 flex items-center justify-center text-xs font-bold text-amber-700">
                  3rd
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Scrollable Leaderboard List */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {activeTab === 'guild' ? (
            remainingMembers.map((member, index) => (
              <div
                key={member.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  member.isCurrentUser
                    ? 'bg-indigo-950/10 border-indigo-500/20'
                    : 'bg-slate-950/20 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-500 w-4">#{index + 4}</div>
                  <div className="relative shrink-0">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className={`w-9 h-9 rounded-full object-cover ${
                        member.glowing ? 'ring-2 ring-cyan-500 shadow-md shadow-cyan-950/50' : ''
                      }`}
                    />
                    {member.glowing && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-cyan-500 ring-1 ring-slate-900 animate-pulse" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">{member.name}</span>
                      {member.glowing && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 font-semibold rounded uppercase tracking-wider">
                          In Zone
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 font-medium">
                      <span>💎 {member.xp} XP</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-500">
                        <Flame className="w-3 h-3 fill-amber-500/10" /> {member.streak}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Friendly Sabotage Boost Sabotage Trigger button */}
                {!member.isCurrentUser && (
                  <button
                    onClick={() => handleStartFocusDuel(member)}
                    className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 py-1 px-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-indigo-500/10"
                    title="Challenge member to a Focus Duel sprint"
                  >
                    <Zap className="w-3 h-3 fill-indigo-400/10 animate-pulse" /> Duel
                  </button>
                )}
              </div>
            ))
          ) : (
            // Simulated Campus Global Community Hub
            <div className="space-y-2">
              <div className="p-3 bg-purple-950/10 border border-purple-500/10 rounded-xl">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">
                  Active Hub Target
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  You are participating in the <strong>{globalHub === 'chem-dept' ? "Chemistry Dept" : "Founders Hub"}</strong> community leaderboard.
                </p>
              </div>

              {[
                { name: "Akash Mehra", xp: 1450, rank: 1, campus: "L-2 Science Lab" },
                { name: "Tanya Sharma", xp: 1290, rank: 2, campus: "Library Wing B" },
                { name: "You", xp: userXP, rank: 3, campus: "Study Table" },
                { name: "Devansh Sen", xp: 950, rank: 4, campus: "Main Quad" }
              ].map((item) => (
                <div key={item.rank} className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">#{item.rank}</span>
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                      <span className="text-[9px] text-slate-500 block">{item.campus}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-400">{item.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Focus Duels / Friendly Sabotage Area */}
      {duels.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Active Focus Duels
          </h4>

          {duels.map((duel) => (
            <div key={duel.id} className="p-3 bg-amber-950/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-200">Duel with {duel.challengerName}</span>
                <span className="text-amber-400 font-extrabold">🏆 {duel.xpPool} XP Prize</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">First person to accomplish a {duel.targetDuration}-minute deep-focus sprint wins!</p>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Your Progress:</span>
                  <span>{duel.userProgressMinutes} / {duel.targetDuration} mins</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full"
                    style={{ width: `${(duel.userProgressMinutes / duel.targetDuration) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between mt-1">
                  <span>Opponent Progress:</span>
                  <span>{duel.challengerProgressMinutes} / {duel.targetDuration} mins</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(duel.challengerProgressMinutes / duel.targetDuration) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
