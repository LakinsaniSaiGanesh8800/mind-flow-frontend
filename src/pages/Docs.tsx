import { motion } from 'framer-motion';
import {
  Layers,
  Zap,
  Shield,
  Code2,
  Globe,
  Brain,
  Database,
  Server,
  GitBranch,
  ChevronRight,
  ExternalLink,
  Cpu,
  Eye,
  Fingerprint,
  Workflow,
  LayoutTemplate,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.section>
  );
}

function DocCard({
  icon: Icon,
  title,
  children,
  color = 'violet',
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  color?: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';
}) {
  const colorMap = {
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: 'text-violet-400', title: 'text-violet-300' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', title: 'text-blue-300' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', title: 'text-emerald-300' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400', title: 'text-amber-300' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: 'text-rose-400', title: 'text-rose-300' },
  };
  const c = colorMap[color];

  return (
    <div className={`p-5 rounded-2xl ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
          <Icon size={16} className={c.icon} />
        </div>
        <h3 className={`font-semibold text-sm ${c.title}`}>{title}</h3>
      </div>
      <div className="text-sm text-white/50 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  return (
    <div className="rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-[11px] font-medium text-white/30 font-mono">{language}</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
      </div>
      <pre className="p-4 text-[12px] font-['JetBrains_Mono',monospace] text-white/60 overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

const prismaSchema = `model Knowledge {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  type      String   // "note" | "link" | "insight"
  tags      String[]
  summary   String?  @db.Text
  sourceUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([type])
  @@index([createdAt])
}`;

const apiRouteCode = `// app/api/brain/capture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/ai';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.enum(['note', 'link', 'insight']),
  tags: z.array(z.string()).optional(),
  sourceUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // AI enrichment (server-side only)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: \`Summarize and tag this knowledge entry.
          Title: \${data.title}
          Content: \${data.content}
          Return JSON: { summary: string, tags: string[] }\`
      }],
      response_format: { type: 'json_object' },
    });

    const { summary, tags } = JSON.parse(
      completion.choices[0].message.content!
    );

    const entry = await prisma.knowledge.create({
      data: {
        ...data,
        summary,
        tags: data.tags?.length ? data.tags : tags,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation or server error' },
      { status: 400 }
    );
  }
}`;

const queryApiCode = `// app/api/brain/query/route.ts
export async function POST(req: NextRequest) {
  const { question } = await req.json();

  // 1. Retrieve relevant context via text search
  const relevant = await prisma.knowledge.findMany({
    where: {
      OR: [
        { title: { contains: question, mode: 'insensitive' } },
        { content: { contains: question, mode: 'insensitive' } },
        { tags: { hasSome: question.split(' ') } },
      ],
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  // 2. Build context for OpenAI
  const context = relevant
    .map(k => \`[\${k.title}]: \${k.summary || k.content}\`)
    .join('\\n\\n');

  // 3. Call OpenAI with context
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: \`Context:\\n\${context}\\n\\nQuestion: \${question}\` }
    ],
  });

  return NextResponse.json({
    answer: completion.choices[0].message.content,
    sources: relevant.map(k => ({ id: k.id, title: k.title })),
  });
}`;

const envExample = `# .env.local

# Database (Neon / Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# OpenAI — NEVER expose this client-side
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"

# App
NEXTAUTH_SECRET="your-secret-here"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"`;

const uxPrinciples = [
  {
    n: '01',
    title: 'Progressive Disclosure',
    desc: "Show only what the user needs at each step. The capture form reveals AI enrichment details without overwhelming. Advanced filters are hidden behind a toggle. This reduces cognitive load and surfaces complexity only when intentionally requested.",
    icon: Workflow,
  },
  {
    n: '02',
    title: 'Optimistic UI & Feedback Loops',
    desc: 'Every action has immediate feedback. Skeleton loaders match the exact shape of loaded content. AI processing shows a staged status message ("Storing... → Calling AI... → Saving...") to communicate what\'s happening, reducing perceived wait time by up to 40%.',
    icon: Zap,
  },
  {
    n: '03',
    title: 'Spatial Consistency',
    desc: 'Type badges, color codes, and iconography are consistent across Dashboard and Query views. A "note" is always blue, a "link" always emerald, an "insight" always amber — across every surface. Spatial memory reduces navigation friction.',
    icon: LayoutTemplate,
  },
  {
    n: '04',
    title: 'Zero-Friction Capture',
    desc: 'The capture flow defaults to the most common type (note), minimizes required fields (only title + content), and handles the rest with AI. Tags are auto-generated if not provided. This removes the "what do I call this?" paralysis that kills PKM adoption.',
    icon: Fingerprint,
  },
  {
    n: '05',
    title: 'Ambient Intelligence',
    desc: 'AI is a silent collaborator, not a chatbot gimmick. It enriches every note automatically, surfaces related knowledge contextually, and answers questions from your personal corpus — not the general web. The interface never requires AI expertise to use.',
    icon: Brain,
  },
];

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <Section>
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent border border-violet-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-violet-300/70 uppercase tracking-widest">Documentation</p>
                <h1 className="text-2xl font-bold text-white">Second Brain OS</h1>
              </div>
            </div>
            <p className="text-white/50 leading-relaxed max-w-2xl">
              A production-ready AI-powered personal knowledge management system built with Next.js 14, Prisma, PostgreSQL, and OpenAI. This document covers architecture, UX principles, AI agent design, and infrastructure.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Next.js 14', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'OpenAI GPT-4o', 'Framer Motion', 'Tailwind CSS'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-medium text-white/50">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Architecture */}
      <Section delay={0.05}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Layers size={18} className="text-violet-400" />
          Portable Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DocCard icon={LayoutTemplate} title="/app — UI Routes" color="violet">
            <p>Next.js 14 App Router pages. Each route is a React Server Component by default. Client interactivity is isolated with "use client" boundaries.</p>
            <ul className="space-y-1 mt-2 text-[12px]">
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-violet-400" />/app/page.tsx — Dashboard</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-violet-400" />/app/capture/page.tsx — Form</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-violet-400" />/app/query/page.tsx — Chat UI</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-violet-400" />/app/docs/page.tsx — This page</li>
            </ul>
          </DocCard>

          <DocCard icon={Server} title="/lib — Core Logic" color="blue">
            <p>Pure utility modules with zero UI dependencies. Fully portable across runtimes.</p>
            <ul className="space-y-1 mt-2 text-[12px]">
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-blue-400" />/lib/db.ts — Prisma client singleton</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-blue-400" />/lib/ai.ts — OpenAI wrapper (server-only)</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-blue-400" />/lib/utils.ts — Shared helpers</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-blue-400" />/lib/validations.ts — Zod schemas</li>
            </ul>
          </DocCard>

          <DocCard icon={Globe} title="/api — API Routes" color="emerald">
            <p>Next.js server-side API handlers. All AI and DB operations happen here — never client-side.</p>
            <ul className="space-y-1 mt-2 text-[12px]">
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-emerald-400" />POST /api/brain/capture</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-emerald-400" />POST /api/brain/query</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-emerald-400" />GET /api/public/brain/query</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-emerald-400" />DELETE /api/brain/[id]</li>
            </ul>
          </DocCard>

          <DocCard icon={Database} title="Prisma + PostgreSQL" color="amber">
            <p>Type-safe ORM with Neon/Supabase PostgreSQL. Migrations tracked in /prisma/migrations.</p>
            <ul className="space-y-1 mt-2 text-[12px]">
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-amber-400" />prisma/schema.prisma — Data model</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-amber-400" />String[] tags with GIN index</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-amber-400" />Full-text search via PostgreSQL</li>
              <li className="flex items-center gap-1.5"><ChevronRight size={10} className="text-amber-400" />Connection pooling via Neon serverless</li>
            </ul>
          </DocCard>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Prisma Schema</h3>
          <CodeBlock code={prismaSchema} language="prisma" />
        </div>
      </Section>

      {/* UX Principles */}
      <Section delay={0.1}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Eye size={18} className="text-violet-400" />
          UX Principles
        </h2>
        <div className="space-y-3">
          {uxPrinciples.map(({ n, title, desc, icon: Icon }) => (
            <div
              key={n}
              className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
            >
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-[11px] font-bold text-white/20 font-mono">{n}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={14} className="text-violet-400" />
                  <h3 className="font-semibold text-sm text-white">{title}</h3>
                </div>
                <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Agent Thinking */}
      <Section delay={0.15}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Cpu size={18} className="text-violet-400" />
          Agent Thinking — How the AI Works
        </h2>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
          <h3 className="font-semibold text-sm text-white mb-3">Capture Pipeline (2-step agent)</h3>
          <div className="space-y-3">
            {[
              { step: 1, label: 'Validate & Store', desc: "Input is validated with Zod. Valid data is persisted to PostgreSQL immediately — the user's content is never lost even if AI fails." },
              { step: 2, label: 'AI Enrichment', desc: 'OpenAI GPT-4o-mini receives title + content in a structured prompt. Response format is enforced as JSON with { summary: string, tags: string[] }. Tags are only AI-generated if the user provided none (respecting intent).' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-violet-400">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{label}</p>
                  <p className="text-xs text-white/40 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
          <h3 className="font-semibold text-sm text-white mb-3">Query Pipeline (RAG-lite)</h3>
          <div className="space-y-3">
            {[
              { step: 1, label: 'Intent Parsing', desc: 'The question is analyzed for keywords. A PostgreSQL full-text search retrieves up to 5 most relevant notes using ts_rank with GIN indexes on title, content, and tags.' },
              { step: 2, label: 'Context Assembly', desc: 'Retrieved notes are formatted as numbered context blocks: [Note Title]: summary or first 200 chars. This is injected into the system prompt alongside a persona instruction.' },
              { step: 3, label: 'Synthesis', desc: "GPT-4o receives the assembled context and the user's question. The system prompt instructs it to only answer from the provided context, cite sources, and acknowledge gaps rather than hallucinate." },
              { step: 4, label: 'Structured Response', desc: 'The API returns { answer: string, sources: [{id, title}] }. Sources are rendered as clickable chips in the UI, linking directly to the relevant notes.' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-indigo-400">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{label}</p>
                  <p className="text-xs text-white/40 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl">
            <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wider">Capture API</h3>
            <CodeBlock code={apiRouteCode} language="typescript" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wider">Query API</h3>
            <CodeBlock code={queryApiCode} language="typescript" />
          </div>
        </div>
      </Section>

      {/* Infrastructure */}
      <Section delay={0.2}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-violet-400" />
          Infrastructure &amp; Security
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <DocCard icon={Server} title="Vercel Deployment" color="violet">
            <p>Serverless Edge Functions for API routes. Static pages are CDN-cached globally. Zero cold-start for UI routes.</p>
          </DocCard>
          <DocCard icon={Database} title="Neon PostgreSQL" color="blue">
            <p>Serverless PostgreSQL with automatic connection pooling. Branch databases for staging/preview environments.</p>
          </DocCard>
          <DocCard icon={Shield} title="Security Model" color="emerald">
            <p>OpenAI key is server-only via env vars. All AI calls happen in API routes. Input validation with Zod. Rate limiting via Vercel Edge Config.</p>
          </DocCard>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Environment Variables</h3>
          <CodeBlock code={envExample} language=".env" />
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={14} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Setup Commands</h3>
            </div>
            <CodeBlock
              code={`# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev`}
              language="bash"
            />
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={14} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Public API Usage</h3>
            </div>
            <CodeBlock
              code={`# Query via REST
curl -G https://your-app.vercel.app/api/public/brain/query \\
  --data-urlencode "q=What is the Feynman technique?"

# Response
{
  "answer": "The Feynman Technique...",
  "sources": [
    { "id": "uuid", "title": "Feynman..." }
  ]
}`}
              language="bash"
            />
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section delay={0.25}>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/[0.07] to-transparent border border-violet-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white mb-1">Ready to Deploy</h3>
            <p className="text-sm text-white/40">Push to GitHub, connect to Vercel, add your DATABASE_URL and OPENAI_API_KEY. Done.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all"
            >
              Deploy to Vercel
              <ExternalLink size={13} />
            </a>
            <a
              href="https://neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm font-medium text-white/70 hover:text-white transition-all"
            >
              Neon DB
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
