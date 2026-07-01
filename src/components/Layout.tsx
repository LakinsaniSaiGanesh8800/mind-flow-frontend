import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  BookOpen,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { Outlet } from "react-router-dom";
const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/capture', label: 'Capture', icon: PlusCircle },
  { path: '/query', label: 'Ask Brain', icon: MessageSquare },
  //{ path: '/docs', label: 'Docs', icon: BookOpen },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-600/6 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 hidden lg:flex flex-col border-r border-slate-200 bg-white backdrop-blur-xl">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight">MindFlow AI</p>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Knowledge OS</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-violet-100 text-violet-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100]'
                }`}
              >
                <Icon
                  size={16}
                  className={`transition-colors ${active ? 'text-violet-400' : 'text-white/30 group-hover:text-white/60'}`}
                />
                {label}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">AI-Powered</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your knowledge is automatically summarized and tagged by AI.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Brain size={15} className="text-white" />
          </div>
          <span className="font-bold text-sm">Second Brain</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-[57px] left-0 right-0 z-40 bg-[#0d0d15]/95 backdrop-blur-xl border-b border-white/[0.06] p-4 space-y-1"
          >
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    active ? 'bg-violet-500/15 text-violet-300' : 'text-white/50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="pt-[57px] lg:pt-0 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <main className="w-full">
                 <div className="pt-[57px] lg:pt-0 min-h-screen">
                   <Outlet />
                 </div>
               </main>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
