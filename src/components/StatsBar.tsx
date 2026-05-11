import { motion } from 'framer-motion';
import { Knowledge } from '../types';
import { FileText, Link2, Lightbulb, Layers } from 'lucide-react';

interface Props {
  knowledge: Knowledge[];
}

export default function StatsBar({ knowledge }: Props) {
  const total = knowledge.length;
  const notes = knowledge.filter((k) => k.type === 'note').length;
  const links = knowledge.filter((k) => k.type === 'link').length;
  const insights = knowledge.filter((k) => k.type === 'insight').length;

  const stats = [
    { label: 'Total', value: total, icon: Layers, color: 'text-white/60', bg: 'bg-white/[0.05]' },
    { label: 'Notes', value: notes, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Links', value: links, icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Insights', value: insights, icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all group overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-white/35 uppercase tracking-wider mb-1">{label}</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="text-3xl font-bold text-white tracking-tight"
              >
                {value}
              </motion.p>
            </div>
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={14} className={color} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
