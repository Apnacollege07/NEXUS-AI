import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Shield, Clipboard, Check, Users, Plus, 
  Trash2, Sparkles, FolderPlus, Globe, LogIn, Send, Trophy, Flame,
  RefreshCw, Settings, CheckCircle2, UserCheck, Eye, LogOut, Radio, HelpCircle
} from "lucide-react";

interface Group {
  id: string;
  name: string;
  topic: string;
  creatorId: string;
  membersCount: number;
  members: Array<{ id: string; name: string; status: 'Online' | 'Focusing' | 'Resting'; xp: number; avatarUrl: string }>;
}

interface UserProfileProps {
  userName: string;
  onUpdateUserName: (newName: string) => void;
  userXP: number;
  streak: number;
  uniqueId: string;
  onAddGroupMember: (name: string, groupName: string) => void;
}

export default function UserProfile({
  userName,
  onUpdateUserName,
  userXP,
  streak,
  uniqueId,
  onAddGroupMember
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [copied, setCopied] = useState(false);
  const [userStatus, setUserStatus] = useState<'Online' | 'Focusing' | 'Resting'>('Online');
  const [dynamicInviteId, setDynamicInviteId] = useState(uniqueId);

  // Invite state
  const [inviteFriendName, setInviteFriendName] = useState("");
  const [inviteFriendId, setInviteFriendId] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  // Group creation state
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "grp-1",
      name: "Nexus Core Squad",
      topic: "CS-101 & Algorithms Prep",
      creatorId: "user-1",
      membersCount: 3,
      members: [
        { id: "user-1", name: userName, status: userStatus, xp: userXP, avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" },
        { id: "user-2", name: "Rahul Deshmukh", status: "Focusing", xp: 310, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80" },
        { id: "user-3", name: "Sarah Connor", status: "Resting", xp: 290, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80" }
      ]
    },
    {
      id: "grp-2",
      name: "Sprinting Founders",
      topic: "Pitch Deck & Metrics Drill",
      creatorId: "user-system",
      membersCount: 2,
      members: [
        { id: "user-1", name: userName, status: userStatus, xp: userXP, avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" },
        { id: "user-4", name: "Amit Patel", status: "Online", xp: 195, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80" }
      ]
    }
  ]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTopic, setNewGroupTopic] = useState("");
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState<string>(groups[0]?.id || "");

  const handleCopyId = () => {
    navigator.clipboard.writeText(dynamicInviteId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateId = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    setDynamicInviteId(`NEXUS-${randomSuffix}`);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setIsEditing(false);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupTopic.trim()) return;

    const newGrp: Group = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      topic: newGroupTopic.trim(),
      creatorId: "user-1",
      membersCount: 1,
      members: [
        { id: "user-1", name: userName, status: userStatus, xp: userXP, avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" }
      ]
    };

    setGroups(prev => [...prev, newGrp]);
    setSelectedGroupForInvite(newGrp.id);
    setNewGroupName("");
    setNewGroupTopic("");
    setInviteStatus(`Success! "${newGrp.name}" is now ready for deep sprints.`);
    setTimeout(() => setInviteStatus(null), 4000);
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const handleInviteFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteFriendName.trim() || !inviteFriendId.trim()) return;

    const targetGroupId = selectedGroupForInvite;
    if (!targetGroupId) {
      setInviteStatus("Please select or build a group first!");
      return;
    }

    setGroups(prev =>
      prev.map(g => {
        if (g.id === targetGroupId) {
          if (g.members.some(m => m.name.toLowerCase() === inviteFriendName.toLowerCase() || m.id === inviteFriendId)) {
            return g;
          }
          return {
            ...g,
            membersCount: g.membersCount + 1,
            members: [
              ...g.members,
              {
                id: inviteFriendId.trim(),
                name: inviteFriendName.trim(),
                status: "Online",
                xp: Math.floor(Math.random() * 200) + 120,
                avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80"
              }
            ]
          };
        }
        return g;
      })
    );

    // Synchronize friend onto the main dashboard sidebar leaderboard
    onAddGroupMember(inviteFriendName.trim(), groups.find(g => g.id === targetGroupId)?.name || "Group");

    setInviteStatus(`Success! Invitation processed. ${inviteFriendName} joined your space.`);
    setInviteFriendName("");
    setInviteFriendId("");
    setTimeout(() => setInviteStatus(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Dynamic Alert Overlay */}
      <AnimatePresence>
        {inviteStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-gradient-to-r from-cyan-900 to-indigo-950 border border-cyan-500/30 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm backdrop-blur-md"
          >
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-100 uppercase tracking-wider">Sync Completed</p>
              <p className="text-[11px] text-cyan-300 mt-0.5">{inviteStatus}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PREMIUM PROFILE CARD */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/40 border border-slate-700/50 p-1">
                  <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                    <User className="w-7 h-7 text-cyan-400" />
                  </div>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold ${
                  userStatus === 'Focusing' ? 'bg-amber-500 animate-pulse' : userStatus === 'Resting' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-white block" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <form onSubmit={handleSaveName} className="flex gap-1.5 items-center mt-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold max-w-[140px]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white truncate">{userName}</h2>
                    <button
                      onClick={() => { setTempName(userName); setIsEditing(true); }}
                      className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-cyan-400 text-xs transition-colors cursor-pointer"
                      title="Edit Profile Name"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/40 border border-cyan-500/10 px-2 py-0.5 rounded">
                    Level {Math.floor(userXP / 200) + 1} Scholar
                  </span>
                </div>
              </div>
            </div>

            {/* User Custom Status Controller */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2">My Live Tactical Status</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setUserStatus('Online')}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    userStatus === 'Online'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold'
                      : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🟢 Active
                </button>
                <button
                  onClick={() => setUserStatus('Focusing')}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    userStatus === 'Focusing'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-extrabold'
                      : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ Focus
                </button>
                <button
                  onClick={() => setUserStatus('Resting')}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    userStatus === 'Resting'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-extrabold'
                      : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  💤 Resting
                </button>
              </div>
            </div>

            {/* Profile Unique Invite ID Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Your Unique Invite ID</span>
                <button
                  onClick={handleRegenerateId}
                  className="p-1 hover:bg-slate-900 text-slate-500 hover:text-cyan-400 rounded-lg transition-all"
                  title="Generate New Invite Code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <code className="text-xs font-mono font-bold text-slate-300 tracking-wider pl-1.5">{dynamicInviteId}</code>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] border border-slate-850"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2.5 leading-relaxed">
                When friends input this key into their groups panel, you'll be automatically enrolled into shared sprints, unlocking +15% XP multiplier bonuses.
              </p>
            </div>

            {/* Interactive Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center hover:border-slate-800 transition-all">
                <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Total XP</span>
                <span className="text-sm font-extrabold text-white">{userXP} XP</span>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center hover:border-slate-800 transition-all">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Streak</span>
                <span className="text-sm font-extrabold text-white">{streak} Days</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850 text-[10px] text-slate-500 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-500" /> Peer-to-peer workspace security active
          </div>
        </div>

        {/* Invite Friend Form Component */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/10">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-slate-100 text-base">Invite Friends via ID</h3>
                <p className="text-xs text-slate-400">Assemble elite study circles and synchronized productivity pipelines</p>
              </div>
            </div>

            <form onSubmit={handleInviteFriend} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1.5 tracking-wider">Friend's Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteFriendName}
                    onChange={(e) => setInviteFriendName(e.target.value)}
                    placeholder="e.g. Marcus Aurelius"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1.5 tracking-wider">Friend's Unique Invite ID</label>
                  <input
                    type="text"
                    required
                    value={inviteFriendId}
                    onChange={(e) => setInviteFriendId(e.target.value)}
                    placeholder="e.g. NEXUS-48293"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1.5 tracking-wider">Destination Study Space</label>
                <select
                  value={selectedGroupForInvite}
                  onChange={(e) => setSelectedGroupForInvite(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} — {g.topic} ({g.membersCount} active)</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!inviteFriendName.trim() || !inviteFriendId.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-cyan-950/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" /> Enforce Invite Protocol
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850/60 bg-slate-950/40 p-4 rounded-xl border border-slate-850/40">
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase block mb-1 tracking-wider">🎯 Cooperative Boost Activated</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Whenever any member within your groups completes a focus timer, a portion of the bonus XP flows through your node automatically. Form circles to maximize passive scholar growth!
            </p>
          </div>
        </div>
      </div>

      {/* Group Creator & Groups Workspace */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-100 text-base">Make His Group & Workspace</h3>
              <p className="text-xs text-slate-400">Initialize custom study workspaces for topic masteries, code camps, or sprint cohorts</p>
            </div>
          </div>

          <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Workspace Name (e.g. FAANG Study)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-w-[200px]"
            />
            <input
              type="text"
              required
              value={newGroupTopic}
              onChange={(e) => setNewGroupTopic(e.target.value)}
              placeholder="Active Target (e.g. Tree Traversals)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 min-w-[180px]"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim() || !newGroupTopic.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Establish Group
            </button>
          </form>
        </div>

        {/* List of Created Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {groups.map(group => (
              <motion.div 
                key={group.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-950/80 rounded-xl border border-slate-850 p-4 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/50 border border-indigo-500/15 px-2 py-0.5 rounded">
                        Active Workspace
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2 leading-none">{group.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{group.topic}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase block">Presence</span>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {group.members.length} Squad
                        </span>
                      </div>
                      
                      {group.id !== "grp-1" && (
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Dissolve Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Members Grid List */}
                  <div className="space-y-2 mt-4 pt-3.5 border-t border-slate-900">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Live Node Members</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.members.map(member => {
                        // Dynamically resolve status/xp if it's the current user
                        const isSelf = member.id === 'user-1';
                        const currentStatus = isSelf ? userStatus : member.status;
                        const currentXPVal = isSelf ? userXP : member.xp;
                        const currentNameVal = isSelf ? userName : member.name;

                        return (
                          <div key={member.id} className="flex items-center gap-2.5 bg-slate-900/60 p-2 rounded-xl border border-slate-850/60 hover:border-slate-800 transition-all">
                            <img
                              referrerPolicy="no-referrer"
                              src={member.avatarUrl}
                              alt={currentNameVal}
                              className="w-7 h-7 rounded-lg border border-slate-700/80 object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-200 block truncate leading-tight">
                                {currentNameVal} {isSelf && <span className="text-[10px] text-cyan-400 font-extrabold">(You)</span>}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  currentStatus === 'Focusing' ? 'bg-amber-500 animate-pulse' : currentStatus === 'Resting' ? 'bg-indigo-400' : 'bg-emerald-400'
                                }`} />
                                <span className="text-[9px] text-slate-400 truncate leading-none">
                                  {currentStatus} • {currentXPVal} XP
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Live telemetry active
                  </span>
                  
                  <button
                    onClick={() => {
                      setSelectedGroupForInvite(group.id);
                      setInviteFriendName("Rahul Deshmukh");
                      setInviteFriendId("NEXUS-29402");
                      setInviteStatus(`Pre-populated ${group.name} with quick-join data. Hit "Send Instant Invite" to join!`);
                      setTimeout(() => setInviteStatus(null), 4000);
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                  >
                    + Quick Add Friend
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
