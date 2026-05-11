import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  PlusCircle,
  Brain,
  X,
} from 'lucide-react';
import { Knowledge, KnowledgeType, FilterState } from '../types';
import { getAllKnowledge, deleteKnowledge } from '../lib/storage';
import KnowledgeCard from '../components/KnowledgeCard';
import { SkeletonCard } from '../components/SkeletonCard';
import StatsBar from '../components/StatsBar';
import SearchBar from '../components/SearchBar';

const TYPE_OPTIONS: { value: KnowledgeType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'note', label: 'Notes' },
  { value: 'link', label: 'Links' },
  { value: 'insight', label: 'Insights' },
];

export default function Dashboard() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    tags: [],
    sort: 'newest',
    search: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setKnowledge(getAllKnowledge());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    knowledge.forEach((k) => k.tags?.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [knowledge]);

  const filtered = useMemo(() => {
    let result = [...knowledge];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.content.toLowerCase().includes(q) ||
          k.tags.some((t) => t.toLowerCase().includes(q)) ||
          (k.summary || '').toLowerCase().includes(q)
      );
    }

    if (filters.type !== 'all') {
      result = result.filter((k) => k.type === filters.type);
    }

    if (filters.tags.length > 0) {
      result = result.filter((k) =>
        filters.tags.every((t) => k.tags.includes(t))
      );
    }

    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return filters.sort === 'newest' ? db - da : da - db;
    });

    return result;
  }, [knowledge, filters]);

  const handleDelete = (id: string) => {
    deleteKnowledge(id);
    setKnowledge((prev) => prev.filter((k) => k.id !== id));
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({ type: 'all', tags: [], sort: 'newest', search: '' });
  };

  const hasActiveFilters =
    filters.type !== 'all' || filters.tags.length > 0 || filters.sort !== 'newest' || filters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Knowledge Dashboard
            </h1>
            <p className="text-white/40 mt-1 text-sm">
              Your curated collection of ideas, links, and insights
            </p>
          </div>
          <Link
            to="/capture"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            <PlusCircle size={16} />
            Capture
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      {!loading && <StatsBar knowledge={knowledge} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters((p) => ({ ...p, search: v }))}
        />

        {/* Type Filter */}
        <div className="relative">
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((p) => ({ ...p, type: e.target.value as KnowledgeType | 'all' }))
            }
            className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#1a1a2e]">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value as 'newest' | 'oldest' }))}
            className="appearance-none h-10 pl-3 pr-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            <option value="newest" className="bg-[#1a1a2e]">Newest</option>
            <option value="oldest" className="bg-[#1a1a2e]">Oldest</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        {/* Tag filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 h-10 px-3 rounded-xl border text-sm font-medium transition-all ${
            showFilters || filters.tags.length > 0
              ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
              : 'bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Tags</span>
          {filters.tags.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
              {filters.tags.length}
            </span>
          )}
        </button>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            <List size={15} />
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/15 transition-all"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Tag Chips */}
      <AnimatePresence>
        {showFilters && allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex flex-wrap gap-2 py-3 border-y border-white/[0.06]">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    filters.tags.includes(tag)
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-white/30">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>
      )}

      {/* Grid / List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <Brain size={28} className="text-white/20" />
          </div>
          <p className="text-white/40 font-medium mb-2">
            {filters.search || filters.type !== 'all' || filters.tags.length > 0
              ? 'No matching knowledge found'
              : 'Your second brain is empty'}
          </p>
          <p className="text-white/25 text-sm mb-6">
            {filters.search ? 'Try different search terms' : 'Start by capturing your first note'}
          </p>
          {!filters.search && (
            <Link
              to="/capture"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/25"
            >
              <PlusCircle size={15} />
              Add Knowledge
            </Link>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filtered.map((item, i) => (
              <KnowledgeCard
                key={item.id}
                knowledge={item}
                viewMode={viewMode}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
