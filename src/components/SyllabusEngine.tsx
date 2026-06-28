import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Cpu, Sparkles, Plus, AlertCircle, RefreshCw, Layers, CheckCircle2 } from "lucide-react";
import { Task } from "../types";

interface SyllabusEngineProps {
  onAddQuests: (newQuests: Task[]) => void;
  persona: string;
}

export default function SyllabusEngine({ onAddQuests, persona }: SyllabusEngineProps) {
  const [syllabusText, setSyllabusText] = useState("");
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedQuests, setGeneratedQuests] = useState<any[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Sample pre-populated text to make it easy for users to test right away!
  const loadSampleSyllabus = () => {
    setSubject("CS-101 Data Structures");
    setSyllabusText(
      `Course Syllabus & Schedule:\n` +
      `- Week 1: Introduction to Big-O notation, Time and Space complexities.\n` +
      `- Week 2: Arrays and Singly Linked Lists. Assignment 1 due June 30th.\n` +
      `- Week 3: Stacks and Queues. Midterm Exam covers all data structures so far.\n` +
      `- Week 4: Binary Search Trees & Tree Traversals. Coding Exam 1 on Stack implementation.\n` +
      `Focus areas for coding exam: Recursion, pointer manipulation, and memory management.`
    );
  };

  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusText.trim()) {
      setError("Please paste some syllabus text, module lists, or study notes.");
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedQuests([]);
    setAddedIds([]);

    try {
      const response = await fetch("/api/syllabus-to-quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: syllabusText, subject }),
      });

      if (!response.ok) {
        throw new Error("Failed to compile syllabus. Please try again.");
      }

      const data = await response.json();
      if (data.quests && Array.isArray(data.quests)) {
        setGeneratedQuests(data.quests);
      } else {
        throw new Error("Invalid output received from the server.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while compiling.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAll = () => {
    const newTasks: Task[] = generatedQuests.map((q, idx) => ({
      id: `quest-${Date.now()}-${idx}`,
      title: q.title,
      description: q.description,
      duration: q.duration,
      xp: q.xp,
      priority: q.priority || 'medium',
      completed: false,
      category: 'Quest'
    }));

    onAddQuests(newTasks);
    setAddedIds(generatedQuests.map((_, idx) => `q-${idx}`));
  };

  const handleAddSingle = (quest: any, index: number) => {
    const newTask: Task = {
      id: `quest-${Date.now()}-${index}`,
      title: quest.title,
      description: quest.description,
      duration: quest.duration,
      xp: quest.xp,
      priority: quest.priority || 'medium',
      completed: false,
      category: 'Quest'
    };

    onAddQuests([newTask]);
    setAddedIds((prev) => [...prev, `q-${index}`]);
  };

  return (
    <div id="syllabus-engine-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-slate-100 text-base">Syllabus-to-Micro-Quest Engine</h3>
            <p className="text-xs text-slate-400">Pipes complex course material into custom reward-yielding schedules</p>
          </div>
        </div>
        <button
          onClick={loadSampleSyllabus}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
        >
          Load Demo Syllabus
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Input */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCompile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Subject or Title
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Organic Chemistry, CS Midterm"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Paste Course Syllabus or Dense Text
              </label>
              <textarea
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                rows={5}
                placeholder="Paste dense syllabus modules, project requirements, exam guides, or weekly study goals here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling with Gemini AI...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-purple-200" /> Convert Syllabus to Quests
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Side Quests Generated */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Adaptive Micro-Quests
            </h4>

            {generatedQuests.length === 0 ? (
              <div className="h-44 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4">
                <FileText className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 max-w-xs">
                  Your customized learning quests will appear here after Gemini processes the dense syllabus text.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {generatedQuests.map((quest, index) => {
                  const isAdded = addedIds.includes(`q-${index}`);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={index}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-semibold text-slate-200 text-sm">{quest.title}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                            quest.priority === 'high' ? 'bg-rose-500/10 text-rose-400' :
                            quest.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {quest.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{quest.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                          <span>⏱️ {quest.duration} min</span>
                          <span className="text-indigo-400 font-bold">💎 +{quest.xp} Focus XP</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddSingle(quest, index)}
                        disabled={isAdded}
                        className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        {isAdded ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {generatedQuests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Generated {generatedQuests.length} custom micro-quests
              </span>
              <button
                onClick={handleAddAll}
                disabled={addedIds.length === generatedQuests.length}
                className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                Track All in Quests
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
