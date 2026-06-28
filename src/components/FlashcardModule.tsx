import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Brain, Sparkles, RefreshCw, Trash2, ArrowLeft, ArrowRight, Eye, ChevronRight, Check } from "lucide-react";
import { Flashcard } from "../types";

interface FlashcardModuleProps {
  flashcards: Flashcard[];
  onAddFlashcard: (card: Omit<Flashcard, 'id'>) => void;
  onAddMultipleFlashcards: (cards: Omit<Flashcard, 'id'>[]) => void;
  onDeleteFlashcard: (id: string) => void;
}

export default function FlashcardModule({
  flashcards,
  onAddFlashcard,
  onAddMultipleFlashcards,
  onDeleteFlashcard
}: FlashcardModuleProps) {
  // Navigation & Creation states
  const [topicInput, setTopicInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual adding states
  const [manualFront, setManualFront] = useState("");
  const [manualBack, setManualBack] = useState("");
  const [manualTopic, setManualTopic] = useState("");

  // Quiz states
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicInput })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.flashcards && Array.isArray(data.flashcards)) {
        onAddMultipleFlashcards(data.flashcards.map((f: any) => ({
          front: f.front,
          back: f.back,
          topic: topicInput
        })));
        setTopicInput("");
        alert(`✨ Success! Gemini generated and loaded ${data.flashcards.length} smart study flashcards on "${topicInput}".`);
      }
    } catch (err) {
      alert("Failed to generate flashcards. Please try again or create cards manually below.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFront.trim() || !manualBack.trim()) return;

    onAddFlashcard({
      front: manualFront,
      back: manualBack,
      topic: manualTopic.trim() || "General Study"
    });

    setManualFront("");
    setManualBack("");
    setManualTopic("");
  };

  // Study Deck Logic
  const startStudySession = () => {
    if (flashcards.length === 0) return;
    setIsStudyMode(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // finished
        alert(`🎓 Active Recall Session Completed!\nCorrect: ${correctCount}\nReview Later: ${incorrectCount}`);
        setIsStudyMode(false);
      }
    }, 200);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }
    handleNext();
  };

  return (
    <div id="flashcard-deck-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-slate-100 text-base">Active Recall Flashcards</h3>
            <p className="text-xs text-slate-400">Lock definitions and formulas into memory with interactive decks</p>
          </div>
        </div>

        {flashcards.length > 0 && !isStudyMode && (
          <button
            onClick={startStudySession}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            Play Study Session ({flashcards.length})
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isStudyMode ? (
          /* ACTIVE REVIEW STUDY SESSION */
          <motion.div
            key="study-mode"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden"
          >
            {/* Top Bar progress */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-medium">
              <span>Card {currentIndex + 1} of {flashcards.length}</span>
              <span className="text-emerald-400">Score: {correctCount} Learned</span>
              <button
                onClick={() => setIsStudyMode(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                Quit Session
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-1 bg-slate-900 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${((currentIndex) / flashcards.length) * 100}%` }}
              />
            </div>

            {/* Immersive Tactile Flip Card */}
            <div className="flex justify-center py-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md h-52 cursor-pointer relative"
                style={{ perspective: "1000px" }}
              >
                {/* Outer Flippable Container */}
                <div
                  className={`w-full h-full duration-500 transform-gpu relative select-none rounded-2xl border ${
                    isFlipped ? 'border-cyan-500/30 bg-slate-900/90' : 'border-slate-800 bg-slate-900'
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                  }}
                >
                  {/* FRONT SIDE (Question) */}
                  <div
                    className="absolute inset-0 p-6 flex flex-col justify-between"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      🏷️ {flashcards[currentIndex].topic || "Study Concept"}
                    </span>
                    <p className="text-center text-slate-100 font-sans font-medium text-base tracking-wide px-4">
                      {flashcards[currentIndex].front}
                    </p>
                    <span className="text-center text-[10px] text-slate-500 font-medium">
                      Click anywhere to Flip and reveal Answer
                    </span>
                  </div>

                  {/* BACK SIDE (Answer) */}
                  <div
                    className="absolute inset-0 p-6 flex flex-col justify-between bg-slate-950/40 rounded-2xl"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)"
                    }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                      💡 Explanation
                    </span>
                    <p className="text-center text-slate-300 font-sans text-sm leading-relaxed px-4">
                      {flashcards[currentIndex].back}
                    </p>
                    <span className="text-center text-[10px] text-slate-500 font-medium">
                      Select your recall accuracy below
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active recall selection */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => handleAnswer(false)}
                className="px-4 py-2 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/50 text-rose-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                🔴 Review Later
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="px-4 py-2 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-900/50 text-emerald-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                🟢 Solid Recall
              </button>
            </div>
          </motion.div>
        ) : (
          /* EDIT / ADD FLASHCARDS PANEL */
          <motion.div key="edit-mode" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI generator with Gemini */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Deck Architect
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Type in any course subject or specific textbook chapter, and our server's Gemini AI will formulate standard recall cards.
                  </p>
                </div>

                <form onSubmit={handleGenerateAI} className="space-y-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g. Krebs Cycle Biochemistry, AWS S3 buckets"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !topicInput.trim()}
                    className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Drafting deck...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Generate Cards via Gemini
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Manual drafting */}
              <form onSubmit={handleCreateManual} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Manual Deck drafting
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualTopic}
                    onChange={(e) => setManualTopic(e.target.value)}
                    placeholder="Topic (e.g. Math)"
                    className="col-span-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    value={manualFront}
                    onChange={(e) => setManualFront(e.target.value)}
                    placeholder="Front / Question prompt"
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                  <textarea
                    value={manualBack}
                    onChange={(e) => setManualBack(e.target.value)}
                    placeholder="Back / Answer details"
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualFront.trim() || !manualBack.trim()}
                  className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Flashcard
                </button>
              </form>
            </div>

            {/* List of existing flashcards */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                <span>Stored Decks ({flashcards.length})</span>
              </div>

              {flashcards.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-slate-850 rounded-xl">
                  <Brain className="w-7 h-7 text-slate-800 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">No study cards saved. Generate some using AI above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
                  {flashcards.map((card) => (
                    <div
                      key={card.id}
                      className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start justify-between gap-2 hover:border-slate-800 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 rounded">
                          {card.topic || "Study"}
                        </span>
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1">{card.front}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{card.back}</p>
                      </div>

                      <button
                        onClick={() => onDeleteFlashcard(card.id)}
                        className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
