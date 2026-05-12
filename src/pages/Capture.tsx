import { useState } from 'react';
import { captureKnowledge } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Link2,
  Lightbulb,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Tag,
  Globe,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { KnowledgeFormData, KnowledgeType } from '../types';
import { addKnowledge } from '../lib/storage';
import { generateSummaryAndTags } from '../lib/ai';
import { v4 as uuidv4 } from 'uuid';



const TYPE_OPTIONS: { value: KnowledgeType; label: string; icon: React.ElementType; desc: string; color: string }[] = [
  {
    value: 'note',
    label: 'Note',
    icon: FileText,
    desc: 'General note or reference',
    color: 'blue',
  },
  {
    value: 'link',
    label: 'Link',
    icon: Link2,
    desc: 'URL, article, or resource',
    color: 'emerald',
  },
  {
    value: 'insight',
    label: 'Insight',
    icon: Lightbulb,
    desc: 'Idea, realization, or pattern',
    color: 'amber',
  },
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function Capture() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<KnowledgeFormData>({
    title: '',
    content: '',
    type: 'note',
    tags: '',
    sourceUrl: '',
  });
  const [formState, setFormState] = useState<FormState>('idle');
  const [aiStatus, setAiStatus] = useState('');
  const [errors, setErrors] = useState<Partial<KnowledgeFormData>>({});

  const validate = () => {
    const errs: Partial<KnowledgeFormData> = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.content.trim()) errs.content = 'Content is required';
    if (formData.sourceUrl && !isValidUrl(formData.sourceUrl)) {
      errs.sourceUrl = 'Enter a valid URL (https://...)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setFormState("submitting");
  setAiStatus("Sending data to server...");

  try {

    const existingTags = formData.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/brain/capture`", {
      method: "POST",
      headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${localStorage.getItem("sb_token")}`,
       },
      body: JSON.stringify({
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        tags: existingTags,
        sourceUrl: formData.sourceUrl.trim() || undefined,
      }),
    });

    const data = await response.json();

    //if (!response.ok) throw new Error("Failed to save");

    // Update frontend state with response
    addKnowledge({
      id: data.id,
      title: data.title,
      content: formData.content,
      type: formData.type,
      tags: data.tags,
      summary: data.summary,
      sourceUrl: formData.sourceUrl,
      createdAt: data.createdAt,
    });

    setFormState("success");
    setAiStatus("");

  } catch (error) {
    console.error(error);
    setFormState("error");
    setAiStatus("");
  }
};

  const handleReset = () => {
    setFormData({ title: '', content: '', type: 'note', tags: '', sourceUrl: '' });
    setFormState('idle');
    setErrors({});
  };

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white">Capture Knowledge</h1>
        <p className="text-white/40 mt-1 text-sm">
          Add a note, link, or insight — AI will automatically summarize and tag it
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {formState === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4"
            >
              <CheckCircle size={32} className="text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">Knowledge Captured!</h2>
            <p className="text-white/50 text-sm mb-8 max-w-xs">
              Your note has been stored and enriched with AI-generated summary and tags.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Add Another
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white transition-all shadow-lg shadow-violet-500/25"
              >
                View Dashboard
                <ChevronRight size={15} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                Knowledge Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TYPE_OPTIONS.map(({ value, label, icon: Icon, desc, color }) => {
                  const active = formData.type === value;
                  const colorMap: Record<string, string> = {
                    blue: active ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : '',
                    emerald: active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : '',
                    amber: active ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : '',
                  };
                  const iconColorMap: Record<string, string> = {
                    blue: 'text-blue-400',
                    emerald: 'text-emerald-400',
                    amber: 'text-amber-400',
                  };
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, type: value }))}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 ${
                        active
                          ? colorMap[color]
                          : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/60'
                      }`}
                    >
                      <Icon size={18} className={active ? iconColorMap[color] : ''} />
                      <div>
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{desc}</p>
                      </div>
                      {active && (
                        <motion.div
                          layoutId="typeActive"
                          className="absolute inset-0 rounded-xl ring-1 ring-current opacity-30"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, title: e.target.value }));
                  if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                }}
                placeholder="Give your knowledge a clear title..."
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.07] transition-all ${
                  errors.title ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/[0.08] focus:border-violet-500/50'
                }`}
              />
              {errors.title && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                  <AlertCircle size={12} />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, content: e.target.value }));
                  if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
                }}
                placeholder="Write your note, paste an excerpt, or describe your insight..."
                rows={6}
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.07] resize-none transition-all leading-relaxed ${
                  errors.content ? 'border-red-500/50' : 'border-white/[0.08] focus:border-violet-500/50'
                }`}
              />
              {errors.content && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                  <AlertCircle size={12} />
                  {errors.content}
                </p>
              )}
              <p className="mt-1 text-[11px] text-white/25">
                {formData.content.length} characters · AI will auto-summarize this
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <Tag size={11} />
                Tags
                <span className="font-normal text-white/25 normal-case tracking-normal">(optional — AI will generate if empty)</span>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                placeholder="productivity, ai, learning (comma-separated)"
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Source URL */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                <Globe size={11} />
                Source URL
                <span className="font-normal text-white/25 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, sourceUrl: e.target.value }));
                  if (errors.sourceUrl) setErrors((p) => ({ ...p, sourceUrl: undefined }));
                }}
                placeholder="https://example.com/article"
                className={`w-full h-11 px-4 rounded-xl bg-white/[0.05] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.07] transition-all ${
                  errors.sourceUrl ? 'border-red-500/50' : 'border-white/[0.08] focus:border-violet-500/50'
                }`}
              />
              {errors.sourceUrl && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                  <AlertCircle size={12} />
                  {errors.sourceUrl}
                </p>
              )}
            </div>

            {/* AI Notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/[0.07] border border-violet-500/20">
              <Sparkles size={15} className="text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-violet-300 mb-0.5">AI Enrichment</p>
                <p className="text-[12px] text-white/40 leading-relaxed">
                  After submission, OpenAI will generate a concise summary and suggest relevant tags based on your content. This happens server-side for security.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                {formState === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{aiStatus}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Capture & Enrich with AI
                  </>
                )}
              </button>
            </div>

            {formState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
              >
                <AlertCircle size={15} />
                Something went wrong. Please try again.
              </motion.div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
