import { motion } from 'framer-motion';
import { Knowledge } from '../types';
import { deleteKnowledge } from "../lib/api";
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Link2,
  Lightbulb,
  Trash2,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  knowledge: Knowledge;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
  index?: number;
}

const typeConfig = {
  note: {
    icon: FileText,
    label: 'Note',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
  },
  link: {
    icon: Link2,
    label: 'Link',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  insight: {
    icon: Lightbulb,
    label: 'Insight',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
};

export default function KnowledgeCard({ knowledge, viewMode, onDelete, index = 0 }: Props) {
  const config = typeConfig[knowledge.type as keyof typeof typeConfig] || typeConfig.note;
  const Icon = config.icon;
  const handleDelete = async (id: string) => {
  try {
    await deleteKnowledge(id);

    setKnowledge((prev) =>
      prev.filter((item) => item.id !== id)
    );

  } catch (error) {
    console.error(error);
    alert("Failed to delete note");
  }
};

  const timeAgo = formatDistanceToNow(new Date(knowledge.createdAt), { addSuffix: true });

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
      >
        {/* Type icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}>
          <Icon size={15} className={config.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm text-white/90 truncate group-hover:text-white transition-colors">
                {knowledge.title}
              </h3>
              <p className="text-xs text-white/40 mt-0.5 line-clamp-1">
                {knowledge.summary || knowledge.content}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-white/30">
                <Clock size={10} />
                <span>{timeAgo}</span>
              </div>
              {knowledge.sourceUrl && (
                <a
                  href={knowledge.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ExternalLink size={12} />
                </a>
              )}
              <button
                onClick={() => onDelete(knowledge.id)}
                className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {knowledge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {knowledge.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] text-white/40 border border-white/[0.06]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 hover:shadow-xl hover:shadow-black/20 cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${config.bg} border ${config.border}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          <Icon size={12} className={config.color} />
          <span className={`text-[11px] font-semibold ${config.color} uppercase tracking-wider`}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {knowledge.sourceUrl && (
            <a
              href={knowledge.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={() => onDelete(knowledge.id)}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[15px] text-white/90 group-hover:text-white transition-colors mb-2 leading-snug">
        {knowledge.title}
      </h3>

      {/* Summary / Content */}
      {knowledge.summary ? (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={10} className="text-violet-400" />
            <span className="text-[10px] font-semibold text-violet-400/70 uppercase tracking-wider">
              AI Summary
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{knowledge.summary}</p>
        </div>
      ) : (
        <p className="text-xs text-white/50 leading-relaxed line-clamp-3 mb-3">{knowledge.content}</p>
      )}

      {/* Tags */}
      {knowledge.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto mb-3">
          {knowledge.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] text-white/40 border border-white/[0.06] hover:border-white/20 hover:text-white/60 transition-all cursor-pointer"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
          {knowledge.tags.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] text-white/25">
              +{knowledge.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
        <Clock size={11} className="text-white/20" />
        <span className="text-[11px] text-white/30">{timeAgo}</span>
      </div>
    </motion.div>
  );
}
