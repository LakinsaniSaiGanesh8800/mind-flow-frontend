/**
 * AI Service — Client-side simulation layer
 *
 * In a production deployment (Next.js/Vercel), this logic would live
 * in /app/api/brain/* server routes with the OpenAI SDK.
 * Here we simulate realistic AI responses for the demo environment.
 *
 * Architecture note: All OpenAI API calls MUST be server-side only.
 * Never expose API keys in client code.
 *
 * Production implementation:
 *   POST /api/brain/capture → calls openai.chat.completions.create()
 *   POST /api/brain/query   → retrieves context + calls OpenAI
 */

import { Knowledge, QueryResult } from '../types';

// Simulated AI processing delay for realistic UX
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateSummaryAndTags(
  title: string,
  content: string,
  existingTags: string[]
): Promise<{ summary: string; tags: string[] }> {
  await delay(1200 + Math.random() * 800);

  // Simulate AI-generated summaries based on content analysis
  const wordCount = content.split(' ').length;
  const firstSentence = content.split(/[.!?]/)[0].trim();
  const keyTerms = extractKeyTerms(content);

  const summary = generateSmartSummary(title, content, firstSentence, wordCount);
  const tags =
    existingTags.length > 0
      ? existingTags
      : generateSmartTags(title, content, keyTerms);

  return { summary, tags };
}

export async function queryBrain(
  question: string,
  knowledge: Knowledge[]
): Promise<QueryResult> {
  await delay(1500 + Math.random() * 1000);

  const relevant = findRelevantKnowledge(question, knowledge);

  if (relevant.length === 0) {
    return {
      answer:
        "I searched through your knowledge base but couldn't find relevant information to answer this question. Try adding more notes related to this topic, or rephrase your question.",
      sources: [],
    };
  }

  const answer = synthesizeAnswer(question, relevant);

  return {
    answer,
    sources: relevant.slice(0, 3).map((k) => ({ id: k.id, title: k.title })),
  };
}

function extractKeyTerms(content: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'it', 'its', 'that', 'this', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'each', 'more', 'than', 'when', 'where', 'how', 'what', 'which',
    'who', 'use', 'used', 'using', 'also', 'they', 'their', 'them', 'your',
    'you', 'we', 'our', 'not', 'so', 'if', 'all', 'any', 'both', 'same',
  ]);

  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stopWords.has(w))
    .slice(0, 15);
}

function generateSmartSummary(
  title: string,
  content: string,
  firstSentence: string,
  wordCount: number
): string {
  const sentences = content.split(/[.!?]/).filter((s) => s.trim().length > 20);
  const keyPoints = sentences.slice(0, 2).map((s) => s.trim());

  if (wordCount < 30) {
    return `${firstSentence}. (Short note — ${wordCount} words)`;
  }

  if (keyPoints.length >= 2) {
    return `${keyPoints[0]}. ${keyPoints[1]}.`.replace(/\s+/g, ' ').trim();
  }

  return firstSentence + (firstSentence.length < 80 ? `. Key topic: ${title}.` : '.');
}

function generateSmartTags(
  title: string,
  content: string,
  keyTerms: string[]
): string[] {
  const combined = `${title} ${content}`.toLowerCase();
  const autoTags: string[] = [];

  const tagRules: [RegExp, string][] = [
    [/\b(react|vue|angular|svelte|next\.?js|vite)\b/, 'web-dev'],
    [/\b(python|javascript|typescript|rust|go|java)\b/, 'programming'],
    [/\b(machine.learning|ml|neural|transformer|llm|gpt|ai|openai)\b/, 'ai'],
    [/\b(productiv|habit|focus|deep.work|system)\b/, 'productivity'],
    [/\b(note.taking|zettelkasten|pkm|second.brain|knowledge)\b/, 'pkm'],
    [/\b(book|read|author|chapter|page)\b/, 'book-notes'],
    [/\b(learn|study|understand|concept|principle)\b/, 'learning'],
    [/\b(mental.model|framework|heuristic|principle)\b/, 'mental-models'],
    [/\b(design|ux|ui|interface|user)\b/, 'design'],
    [/\b(startup|business|growth|marketing|product)\b/, 'business'],
    [/\b(health|fitness|sleep|nutrition|exercise)\b/, 'health'],
    [/\b(philosophy|stoic|meaning|purpose|ethic)\b/, 'philosophy'],
    [/\b(invest|finance|money|wealth|stock)\b/, 'finance'],
    [/\b(science|research|study|paper|journal)\b/, 'science'],
    [/\b(psychology|cognitive|bias|behavior|mind)\b/, 'psychology'],
  ];

  for (const [pattern, tag] of tagRules) {
    if (pattern.test(combined)) autoTags.push(tag);
  }

  // Add top key terms as tags if we have fewer than 2
  if (autoTags.length < 2 && keyTerms.length > 0) {
    autoTags.push(...keyTerms.slice(0, 3 - autoTags.length));
  }

  return [...new Set(autoTags)].slice(0, 5);
}

function findRelevantKnowledge(question: string, knowledge: Knowledge[]): Knowledge[] {
  const qWords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  const scored = knowledge.map((k) => {
    const corpus = `${k.title} ${k.content} ${k.tags.join(' ')} ${k.summary || ''}`.toLowerCase();
    let score = 0;
    for (const word of qWords) {
      const regex = new RegExp(word, 'gi');
      const matches = corpus.match(regex);
      if (matches) score += matches.length;
    }
    return { knowledge: k, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.knowledge);
}

function synthesizeAnswer(question: string, sources: Knowledge[]): string {
  const q = question.toLowerCase();
  const sourceList = sources.map((s) => s.title).join('", "');

  const contextSummaries = sources
    .map((s, i) => `[${i + 1}] ${s.summary || s.content.slice(0, 150)}`)
    .join(' ');

  // Generate contextual response based on question type
  if (q.startsWith('what') || q.startsWith('define') || q.startsWith('explain')) {
    return `Based on your knowledge base, here's what I found across ${sources.length} source${sources.length > 1 ? 's' : ''}: ${contextSummaries}. The sources "${sourceList}" collectively address your question about "${question.replace(/[?]/g, '')}". I recommend reviewing these notes for deeper context and cross-referencing the key ideas.`;
  }

  if (q.startsWith('how')) {
    return `Your second brain contains relevant methodology in ${sources.length} note${sources.length > 1 ? 's' : ''}. Key insights: ${contextSummaries}. The approach described in "${sources[0].title}" is most directly applicable. Consider combining these frameworks for a comprehensive answer to "${question.replace(/[?]/g, '')}"`;
  }

  if (q.startsWith('why')) {
    return `Drawing from your captured knowledge: ${contextSummaries}. The reasoning across your notes "${sourceList}" suggests a nuanced answer to your question. The most relevant perspective comes from "${sources[0].title}".`;
  }

  return `I found ${sources.length} relevant note${sources.length > 1 ? 's' : ''} in your knowledge base that address this topic. Key synthesized insight: ${contextSummaries}. Sources referenced: "${sourceList}". These notes collectively provide context for: "${question}"`;
}
