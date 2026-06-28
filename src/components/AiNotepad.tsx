import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Sparkles, RefreshCw, Layers, CheckCircle2, Copy, BookOpen, Trash2, Edit, Plus } from "lucide-react";
import { Note, Flashcard } from "../types";

interface AiNotepadProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onImportFlashcards: (cards: Omit<Flashcard, 'id'>[]) => void;
}

export default function AiNotepad({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onImportFlashcards
}: AiNotepadProps) {
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiType, setAiType] = useState<'summary' | 'concepts' | 'quiz' | null>(null);
  
  // Note Creation / Edit
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Sync content with textarea when active note changes
  React.useEffect(() => {
    if (activeNote) {
      setNoteContent(activeNote.content);
    } else {
      setNoteContent("");
    }
    setAiResult("");
    setAiType(null);
  }, [activeNoteId]);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    onAddNote({
      title: newNoteTitle.trim(),
      content: ""
    });

    setNewNoteTitle("");
  };

  const handleSaveTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    if (activeNoteId) {
      onUpdateNote(activeNoteId, val);
    }
  };

  const triggerGeminiAction = async (action: 'summarize' | 'key-concepts' | 'quiz') => {
    if (!noteContent.trim()) {
      alert("Please write or paste some study notes first.");
      return;
    }

    setIsProcessing(true);
    setAiResult("");
    setAiType(action === 'quiz' ? 'quiz' : action === 'key-concepts' ? 'concepts' : 'summary');

    try {
      const response = await fetch("/api/ai-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText: noteContent, action })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      if (action === "quiz") {
        if (data.flashcards && Array.isArray(data.flashcards)) {
          // Store result as JSON so we can display it nicely with action import button
          setAiResult(JSON.stringify(data.flashcards));
        } else {
          throw new Error();
        }
      } else {
        setAiResult(data.result || "");
      }
    } catch (err) {
      alert("Failed to process request with AI. Please check your text and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFlashcards = () => {
    try {
      const cards = JSON.parse(aiResult);
      if (Array.isArray(cards)) {
        onImportFlashcards(cards.map(c => ({
          front: c.front,
          back: c.back,
          topic: activeNote?.title || "Notepad Generated"
        })));
        alert(`🎓 Successfully imported ${cards.length} active recall cards into your deck!`);
        setAiResult("");
        setAiType(null);
      }
    } catch (e) {
      alert("Could not import cards.");
    }
  };

  return (
    <div id="ai-notepad-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between">
      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-100 text-base">Interactive Study Notepad</h3>
              <p className="text-xs text-slate-400">Quickly draft formulas, notes, & generate flashcards instantly</p>
            </div>
          </div>
        </div>

        {/* Notes Side-by-Side or Selection Menu */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Note sidebar chooser */}
          <div className="md:col-span-4 space-y-3">
            <form onSubmit={handleCreateNote} className="flex gap-1.5">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="New note title..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!newNoteTitle.trim()}
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    note.id === activeNoteId
                      ? 'bg-slate-800 border-cyan-500/30'
                      : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/50'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-200 truncate">{note.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Draft Area */}
          <div className="md:col-span-8 flex flex-col justify-between">
            {activeNote ? (
              <div className="space-y-3">
                <textarea
                  value={noteContent}
                  onChange={handleSaveTextChange}
                  placeholder="Paste textbook definitions, chemistry formulas, lecture notes, or business memos here..."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs font-mono text-slate-300 placeholder-slate-650 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />

                {/* Intelligent Operations Drawer */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => triggerGeminiAction('summarize')}
                    className="py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    📝 Summarize Note
                  </button>
                  <button
                    onClick={() => triggerGeminiAction('key-concepts')}
                    className="py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    💡 Key Concepts
                  </button>
                  <button
                    onClick={() => triggerGeminiAction('quiz')}
                    className="py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    🎓 Generate Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-44 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4">
                <BookOpen className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 max-w-xs">
                  Create or select a study note from the sidebar menu to begin drafting and planning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Processing / Results Display Drawer */}
      <AnimatePresence>
        {(isProcessing || aiResult) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {aiType === 'quiz' ? 'AI Quiz Card Synthesis' : aiType === 'concepts' ? 'Core Concepts Extracted' : 'Adaptive Summary'}
              </span>
              <button
                onClick={() => {
                  setAiResult("");
                  setAiType(null);
                }}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                Clear
              </button>
            </div>

            {isProcessing ? (
              <div className="flex items-center gap-2 py-4 justify-center text-slate-500 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Let Gemini synthesize this material...
              </div>
            ) : (
              <div className="space-y-3">
                {aiType === 'quiz' ? (
                  <div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Gemini analyzed your text and drafted interactive Active Recall flashcards! Import them directly to your deck.
                    </p>

                    <button
                      onClick={handleImportFlashcards}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      📥 Import cards to Deck
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-slate-900/65 border border-slate-800 p-3 rounded-lg">
                    {aiResult}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
