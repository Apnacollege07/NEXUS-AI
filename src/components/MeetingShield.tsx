import React, { useState } from "react";
import { Shield, ShieldAlert, Check, Ban, AlertTriangle, Calendar, ToggleLeft, ToggleRight, Sparkles, RefreshCw } from "lucide-react";
import { MeetingInvite } from "../types";

interface MeetingShieldProps {
  invites: MeetingInvite[];
  onDeclineInvite: (id: string) => void;
  onAcceptInvite: (id: string) => void;
  onShieldDeepWork: () => void;
}

export default function MeetingShield({ invites, onDeclineInvite, onAcceptInvite, onShieldDeepWork }: MeetingShieldProps) {
  const [shieldActive, setShieldActive] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScanMeetings = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 1200);
  };

  const activeInvites = invites.filter(i => i.status !== "declined");

  return (
    <div id="meeting-shield-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${shieldActive ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-100 text-base">Meeting-Shield Focus Blocker</h3>
              <p className="text-xs text-slate-400">Declines trivial conflicts to reserve high-cognitive deep work</p>
            </div>
          </div>

          <button
            onClick={() => setShieldActive(!shieldActive)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={shieldActive ? "Deactivate Shield" : "Activate Shield"}
          >
            {shieldActive ? (
              <ToggleRight className="w-9 h-9 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-9 h-9 text-slate-600" />
            )}
          </button>
        </div>

        {/* Shield Status Banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
          shieldActive
            ? 'bg-cyan-950/10 border-cyan-500/20 text-cyan-300'
            : 'bg-slate-950 border-slate-850 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 shrink-0 ${shieldActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="text-xs">
              <span className="font-bold">{shieldActive ? "Shield Active" : "Shield Suspended"}</span>
              <p className="text-[10px] text-slate-500">Auto-evaluating meeting worthiness based on context load.</p>
            </div>
          </div>
          <button
            onClick={handleScanMeetings}
            className="text-[10px] font-bold bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg hover:border-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
          >
            {scanning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
            Scan
          </button>
        </div>

        {/* AI Insight Prep Bottleneck Alert */}
        {scanned && (
          <div className="bg-amber-950/15 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200">Gemini Bottleneck Alert</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                "Product Sync" overlaps with your prep-block for "System Architecture". Shield-Blocker recommends keeping the prep-block to protect delivery.
              </p>
              <button
                onClick={onShieldDeepWork}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline block"
              >
                Auto-Decline conflicting invitation & lock deep work
              </button>
            </div>
          </div>
        )}

        {/* Dynamic List of Invites */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pending Calendared Meetings
          </div>

          {activeInvites.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-850 rounded-xl">
              <p className="text-xs text-slate-500">Your calendar is clear. Shield holds strong!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeInvites.map((invite) => (
                <div
                  key={invite.id}
                  className={`p-3 bg-slate-950/40 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                    invite.status === "shielded"
                      ? "border-cyan-500/20 bg-cyan-950/5"
                      : "border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{invite.title}</span>
                      {invite.priority === "low" ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-slate-400 font-semibold rounded">
                          Low Value
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 font-semibold rounded">
                          High Stakes
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span>⏱️ {invite.time} ({invite.duration}m)</span>
                      <span>•</span>
                      <span>Organizer: {invite.organizer}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {invite.status === "shielded" ? (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded-lg flex items-center gap-1 border border-cyan-500/10">
                        <Shield className="w-3 h-3" /> Shielded
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onDeclineInvite(invite.id)}
                          className="p-1 bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Auto-Decline conflict"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onAcceptInvite(invite.id)}
                          className="p-1 bg-slate-900 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Accept meeting"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-850 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Powered by Gemini Meeting Analyzer
        </span>
        <span>Auto-blocker active</span>
      </div>
    </div>
  );
}
