import { Knowledge } from '../types';

const STORAGE_KEY = 'second_brain_knowledge';

export function getAllKnowledge(): Knowledge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedData();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return getSeedData();
    return parsed;
  } catch {
    return getSeedData();
  }
}

export function saveKnowledge(items: Knowledge[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addKnowledge(item: Knowledge): void {
  const all = getAllKnowledge();
  saveKnowledge([item, ...all]);
}

export function deleteKnowledge(id: string): void {
  const all = getAllKnowledge();
  saveKnowledge(all.filter((k) => k.id !== id));
}

export function updateKnowledge(updated: Knowledge): void {
  const all = getAllKnowledge();
  saveKnowledge(all.map((k) => (k.id === updated.id ? updated : k)));
}

function getSeedData(): Knowledge[] {
  const seed: Knowledge[] = [
    {
      id: 'seed-1',
      title: 'The Feynman Technique for Deep Learning',
      content:
        'The Feynman Technique is a mental model that helps you learn anything faster and with greater understanding. It involves four steps: Choose a concept, Teach it to a child, Identify gaps and go back to the source material, Simplify and use analogies.',
      type: 'insight',
      tags: ['learning', 'productivity', 'mental-models'],
      summary:
        'A 4-step learning method by Richard Feynman: choose a concept, explain it simply, identify gaps, and refine with analogies.',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'seed-2',
      title: 'Building a Second Brain — Book Notes',
      content:
        "Tiago Forte's Building a Second Brain introduces the CODE method: Capture, Organize, Distill, Express. The key insight is that your mind is for having ideas, not storing them. Use a trusted external system to offload information so your brain can focus on creativity and synthesis.",
      type: 'note',
      tags: ['productivity', 'pkm', 'book-notes'],
      summary:
        'CODE method for PKM: Capture ideas, Organize by projects, Distill to essentials, Express through creation. Free your mind from storage.',
      sourceUrl: 'https://www.buildingasecondbrain.com',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'seed-3',
      title: 'Atomic Habits Core Principle',
      content:
        "James Clear argues that 1% improvements compound over time to produce remarkable results. The key is to focus on systems rather than goals. Identity-based habits are more durable: instead of 'I want to run a marathon', say 'I am a runner'.",
      type: 'insight',
      tags: ['habits', 'self-improvement', 'psychology'],
      summary:
        '1% daily improvements compound to 37x yearly gains. Focus on systems over goals; anchor habits to identity for lasting change.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'seed-4',
      title: 'Andrej Karpathy on LLM Architecture',
      content:
        'Transformers use self-attention to weigh the relevance of each word to every other word in the sequence. Key components: Query, Key, Value matrices. Multi-head attention allows the model to attend to information from different representation subspaces.',
      type: 'note',
      tags: ['ai', 'llm', 'machine-learning', 'transformers'],
      summary:
        'Transformers use Q/K/V self-attention across all tokens. Multi-head attention captures different semantic relationships simultaneously.',
      sourceUrl: 'https://karpathy.ai',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'seed-5',
      title: 'Zettelkasten Method Overview',
      content:
        'The Zettelkasten (slip-box) method by Niklas Luhmann involves creating atomic notes that are linked together. Each note should contain one idea and be written in your own words. The power comes from the connections between notes, not the individual notes themselves.',
      type: 'link',
      tags: ['pkm', 'writing', 'note-taking'],
      summary:
        'Atomic notes system where each note = one idea, written in your own words, linked to related notes. Value emerges from connections.',
      sourceUrl: 'https://zettelkasten.de',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'seed-6',
      title: 'React Server Components Mental Model',
      content:
        'RSCs run on the server and never ship JavaScript to the client. They can directly access databases, file systems, and APIs. Client components are still needed for interactivity. The boundary is marked with "use client". This enables zero-bundle-size components that render HTML on the server.',
      type: 'note',
      tags: ['react', 'web-dev', 'performance'],
      summary:
        'RSCs execute server-side only, enabling DB access with zero client JS. Mark interactive parts with "use client" directive.',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];
  saveKnowledge(seed);
  return seed;
}
