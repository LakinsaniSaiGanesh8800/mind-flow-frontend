import { useState, useRef, useEffect } from 'react';
import { queryKnowledge } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Brain,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  MessageSquare,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { Knowledge, QueryResult } from '../types';
import { getAllKnowledge } from '../lib/storage';
import { queryBrain } from '../lib/ai';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: QueryResult['sources'];
  timestamp: Date;
}

const STARTER_QUESTIONS = [
  'What have I learned about productivity?',
  'Explain the key concepts I have about AI',
  'What learning techniques have I captured?',
  'Summarize my notes on note-taking',
];

export default function Query() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

 

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await queryKnowledge(q);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your query. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const apiExample = `// Public API endpoint
fetch('/api/public/brain/query?q=What have I learned about AI?')
  .then(res => res.json())
  .then(data => {
    console.log(data.answer);   // AI-synthesized answer
    console.log(data.sources);  // [{ id, title }, ...]
  });`;

  return (
    <div className="flex flex-col h-screen lg:h-[calc(100vh)] max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex-shrink-0"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Ask Your Brain</h1>
        <p className="text-white/40 mt-1 text-sm">
          Query your knowledge base with natural language — AI synthesizes answers from your notes
        </p>
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pb-4 pr-1 scrollbar-thin">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-6">
              <Brain size={36} className="text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Ready to Answer</h2>
            <p className="text-white/40 text-sm mb-8 max-w-sm leading-relaxed">
              Ask anything about your captured knowledge. The AI will search through{' '}
              <strong className="text-white/60">{knowledge.length} notes</strong> and synthesize a
              contextual answer.
            </p>

            {/* Starter questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left text-sm text-white/50 hover:text-white/80 hover:border-violet-500/30 hover:bg-violet-500/[0.06] transition-all group"
                >
                  <MessageSquare size={13} className="flex-shrink-0 text-violet-400/50 group-hover:text-violet-400" />
                  <span className="text-xs">{q}</span>
                  <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
                </button>
              ))}
            </div>

            {/* {knowledge.length === 0 && (
              <div className="mt-8 flex items-center gap-2 text-sm text-amber-400/70">
                <BookOpen size={14} />
                <span>No knowledge yet — </span>
                <Link to="/capture" className="underline hover:text-amber-400">
                  capture some notes first
                </Link>
              </div>
            )} */}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-3 mt-1 shadow-lg shadow-violet-500/20">
                    <Brain size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-violet-600/80 text-white rounded-tr-sm'
                        : 'bg-white/[0.05] border border-white/[0.08] text-white/80 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-2 flex flex-wrap gap-2"
                    >
                      <span className="text-[10px] text-white/30 self-center">Sources:</span>
                      {msg.sources.map((s) => (
                        <span
                          key={s.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300"
                        >
                          <BookOpen size={9} />
                          {s.title}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Copy button for assistant */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="mt-1.5 flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          Copy answer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Brain size={14} className="text-white" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/[0.08]">
                  <div className="flex items-center gap-2 text-white/50">
                    <Loader2 size={14} className="animate-spin text-violet-400" />
                    <span className="text-sm">Searching knowledge base and synthesizing answer...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-4 border-t border-white/[0.06]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your knowledge..."
              disabled={loading}
              className="w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] disabled:opacity-50 transition-all"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!input.trim() || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-violet-500/25"
          >
            <Send size={16} className="text-white" />
          </motion.button>
        </form>
        <p className="text-[11px] text-white/20 mt-2 text-center">
          Powered by AI · Searches across {knowledge.length} notes
        </p>
      </div>

      {/* API Callout */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 flex-shrink-0"
          >
            <details className="group">
              <summary className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 cursor-pointer transition-colors">
                <Globe size={12} />
                Public API endpoint available
                <ArrowRight size={11} className="ml-auto group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-violet-400" />
                  <span className="text-[11px] font-semibold text-violet-300">GET /api/public/brain/query</span>
                </div>
                <pre className="text-[11px] font-['JetBrains_Mono',monospace] text-white/40 overflow-x-auto whitespace-pre-wrap">
                  {apiExample}
                </pre>
              </div>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
