import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Lightbulb, TrendingUp, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { ReportResult } from '../data/mockData';

interface ReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportResult: ReportResult | null;
}

interface ParsedSection {
  type: 'numbered' | 'precedent' | 'conclusion' | 'text';
  title?: string;
  number?: number;
  content: string[];
  cases?: { brand: string; detail: string }[];
}

function cleanText(text: string): string {
  return text
    .replace(/^#{1,4}\s*/gm, '')       // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1')    // Remove bold markdown
    .replace(/^\s*[-]\s*/gm, '• ')      // Normalize dashes to bullets
    .replace(/\t+/g, '  ')              // Tabs to spaces
    .replace(/\([-–]\s*/g, '')          // Remove weird parenthesis-dash patterns
    .replace(/^\s*\(\s*/gm, '')         // Remove leading parentheses
    .replace(/\s*\)\s*$/gm, '')         // Remove trailing parentheses
    .replace(/^[+]\s*/gm, '• ')         // Plus signs to bullets
    .trim();
}

function parseContent(rawContent: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

  // Clean the entire content first
  const cleaned = cleanText(rawContent);

  // Split into major sections by detecting patterns
  const lines = cleaned.split('\n');

  let currentSection: ParsedSection | null = null;
  let currentLines: string[] = [];

  const flushSection = () => {
    if (currentSection) {
      currentSection.content = currentLines.filter(l => l.trim());
      if (currentSection.content.length > 0 || currentSection.type === 'precedent') {
        sections.push(currentSection);
      }
    }
    currentLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip "Agent Insight" title at the beginning
    if (trimmed === 'Agent Insight' || trimmed === 'Agent Insight:') {
      continue;
    }

    // Detect numbered sections (1. Title, 2. Title, etc.)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      flushSection();
      currentSection = {
        type: 'numbered',
        number: parseInt(numberedMatch[1]),
        title: numberedMatch[2].replace(/[*#]/g, '').trim(),
        content: [],
      };
      continue;
    }

    // Detect Market Precedent section
    if (trimmed === 'Market Precedent' || trimmed === 'Market Precedent:' ||
        trimmed.includes('Market Precedent')) {
      flushSection();
      currentSection = {
        type: 'precedent',
        title: '과거 성공 사례',
        content: [],
        cases: [],
      };
      continue;
    }

    // Detect Agent Conclusion section
    if (trimmed === 'Agent Conclusion' || trimmed === 'Agent Conclusion:' ||
        trimmed.includes('Agent Conclusion')) {
      flushSection();
      currentSection = {
        type: 'conclusion',
        title: 'Agent Insight',
        content: [],
      };
      continue;
    }

    // Add line to current section
    if (currentSection) {
      // For precedent section, try to extract brand cases
      if (currentSection.type === 'precedent' && trimmed) {
        // Detect brand case lines (start with brand name or bullet)
        const brandMatch = trimmed.match(/^[•\-]?\s*(.+?)[:：]\s*(.+)/);
        if (brandMatch && !trimmed.startsWith('핵심 전략') && trimmed.length > 20) {
          const brand = brandMatch[1].replace(/[•\-\s]/g, '').trim();
          const detail = brandMatch[2].trim();
          if (brand && detail) {
            currentSection.cases = currentSection.cases || [];
            currentSection.cases.push({ brand, detail });
            continue;
          }
        }
        // Sub-bullet under a case (핵심 전략 etc.)
        if (currentSection.cases && currentSection.cases.length > 0 &&
            (trimmed.startsWith('핵심 전략') || trimmed.startsWith('•'))) {
          const lastCase = currentSection.cases[currentSection.cases.length - 1];
          lastCase.detail += ' | ' + trimmed.replace(/^[•\-]\s*/, '');
          continue;
        }
      }
      currentLines.push(line);
    } else {
      // No current section yet, create a text section
      if (trimmed) {
        currentSection = { type: 'text', content: [] };
        currentLines.push(line);
      }
    }
  }

  // Flush last section
  flushSection();

  return sections;
}

function renderContentLines(lines: string[]) {
  const result: JSX.Element[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Sub-header (Korean text ending with colon or short bold-like text)
    if ((trimmed.endsWith(':') || trimmed.endsWith('：')) && trimmed.length < 40 && !trimmed.startsWith('•')) {
      result.push(
        <p key={idx} className="font-semibold text-slate-800 mt-4 mb-1 text-[15px]">
          {trimmed.replace(/:$|：$/, '')}
        </p>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const text = trimmed.replace(/^[•\-]\s*/, '');

      // <태그> 형식 파싱 (e.g., <성과지표>, <핵심전략>, <적용방안>)
      const tagMatch = text.match(/^<([^>]+)>\s*(.*)$/);
      if (tagMatch) {
        result.push(
          <div key={idx} className="flex items-start gap-2.5 ml-2 my-1.5">
            <span className="text-rose-400 mt-0.5 text-sm flex-shrink-0">&#9656;</span>
            <span className="text-slate-600 text-sm leading-relaxed">
              <span className="font-bold text-slate-800">{tagMatch[1]}:</span> {tagMatch[2]}
            </span>
          </div>
        );
        return;
      }

      result.push(
        <div key={idx} className="flex items-start gap-2.5 ml-2 my-1.5">
          <span className="text-rose-400 mt-0.5 text-sm flex-shrink-0">&#9656;</span>
          <span className="text-slate-600 text-sm leading-relaxed">{text}</span>
        </div>
      );
      return;
    }

    // Example lines (예시:)
    if (trimmed.startsWith('예시:') || trimmed.startsWith('예시 :')) {
      result.push(
        <div key={idx} className="ml-4 mt-2 pl-3 border-l-2 border-rose-200 text-sm text-slate-500 italic">
          {trimmed.replace(/^예시\s*[:：]\s*/, '')}
        </div>
      );
      return;
    }

    // Regular paragraph text
    result.push(
      <p key={idx} className="text-slate-600 text-sm leading-relaxed my-1">
        {trimmed}
      </p>
    );
  });

  return result;
}

export default function ReportViewModal({ isOpen, onClose, reportResult }: ReportViewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (reportResult?.content) {
      await navigator.clipboard.writeText(reportResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!reportResult) return null;

  const sections = parseContent(reportResult.content);
  const numberedSections = sections.filter(s => s.type === 'numbered');
  const precedentSection = sections.find(s => s.type === 'precedent');
  const conclusionSection = sections.find(s => s.type === 'conclusion');

  const typeConfig = {
    marketing: { icon: '📢', label: '마케팅 캠페인 전략', gradient: 'from-rose-500 to-pink-500' },
    npd: { icon: '🧪', label: '신제품 기획(BM)', gradient: 'from-violet-500 to-purple-500' },
    overseas: { icon: '✈️', label: '해외 진출 전략', gradient: 'from-blue-500 to-cyan-500' },
  };
  const config = typeConfig[reportResult.type as keyof typeof typeConfig] || typeConfig.marketing;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className={`flex items-center justify-between px-7 py-5 flex-shrink-0 bg-gradient-to-r ${config.gradient} text-white`}>
                <div className="flex-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    {config.label}
                  </h2>
                  {/* 선택한 키워드/카테고리를 헤더 중앙에 표시 */}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-white/80 text-sm">RAG 기반 AI 맞춤형 인사이트</p>
                    {reportResult.scope && (
                      <span className="text-white font-bold text-sm bg-white/20 px-3 py-0.5 rounded-full">
                        {reportResult.scope === 'keyword'
                          ? `🔑 ${reportResult.keyword}`
                          : `📁 ${reportResult.category}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 transition-all backdrop-blur-sm"
                  >
                    {copied ? <><Check className="w-3.5 h-3.5" /> 복사됨</> : <><Copy className="w-3.5 h-3.5" /> 복사</>}
                  </button>
                  <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1.5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-7 space-y-6">

                  {/* Numbered Strategy Sections - 각 섹션별 다른 색상 */}
                  {numberedSections.filter(s => s.number !== 5).map((section, idx) => {
                    // 섹션별 색상 설정
                    const sectionColors: Record<number, { bg: string; border: string; numBg: string; titleColor: string }> = {
                      1: { bg: 'bg-blue-50', border: 'border-blue-200', numBg: 'from-blue-500 to-blue-600', titleColor: 'text-blue-800' },
                      2: { bg: 'bg-emerald-50', border: 'border-emerald-200', numBg: 'from-emerald-500 to-emerald-600', titleColor: 'text-emerald-800' },
                      3: { bg: 'bg-violet-50', border: 'border-violet-200', numBg: 'from-violet-500 to-violet-600', titleColor: 'text-violet-800' },
                      4: { bg: 'bg-amber-50', border: 'border-amber-200', numBg: 'from-amber-500 to-amber-600', titleColor: 'text-amber-800' },
                    };
                    const colors = sectionColors[section.number || 1] || sectionColors[1];

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`${colors.bg} rounded-xl p-5 border ${colors.border}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${colors.numBg} text-white text-sm font-bold flex items-center justify-center shadow-sm`}>
                            {section.number}
                          </span>
                          <h3 className={`text-lg font-bold ${colors.titleColor} pt-0.5`}>
                            {section.title}
                          </h3>
                        </div>
                        <div className="ml-10">
                          {renderContentLines(section.content)}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Section 5: Agent Insight - 핑크/마젠타 배경에 흰 글씨 */}
                  {numberedSections.filter(s => s.number === 5).map((section, idx) => (
                    <motion.div
                      key={`insight-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-xl p-6 text-white shadow-lg"
                    >
                      <div className="flex items-center gap-2.5 mb-4">
                        <Lightbulb className="w-6 h-6 text-yellow-200" />
                        <h3 className="text-xl font-bold">{section.title}</h3>
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4">
                        <div className="text-white/95 text-sm leading-relaxed space-y-2">
                          {section.content.map((line, lineIdx) => {
                            const trimmed = line.trim();
                            if (!trimmed) return null;
                            // 번호 매기기된 줄 처리
                            if (/^\d+\./.test(trimmed)) {
                              return (
                                <div key={lineIdx} className="flex items-start gap-2 mt-2">
                                  <span className="text-yellow-200 font-bold">{trimmed.match(/^\d+/)?.[0]}.</span>
                                  <span>{trimmed.replace(/^\d+\.\s*/, '')}</span>
                                </div>
                              );
                            }
                            // 일반 줄
                            return <p key={lineIdx}>{trimmed}</p>;
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Market Precedent - Past Success Cases */}
                  {precedentSection && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-bold text-slate-800">과거 성공 사례 분석</h3>
                      </div>

                      {precedentSection.cases && precedentSection.cases.length > 0 ? (
                        <div className="grid gap-3">
                          {precedentSection.cases.map((c, idx) => (
                            <div key={idx} className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <span className="font-semibold text-slate-800 text-sm">{c.brand}</span>
                                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                  {c.detail.split(' | ').map((part, pIdx) => (
                                    <span key={pIdx}>
                                      {pIdx > 0 && <><br/><span className="text-amber-500 text-xs font-medium">&#8627; </span></>}
                                      {part}
                                    </span>
                                  ))}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                          {renderContentLines(precedentSection.content)}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Agent Insight - 별도 박스 (마케팅 타입 전용) */}
                  {reportResult.agentInsight && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8"
                    >
                      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-2.5 mb-4">
                          <Lightbulb className="w-6 h-6 text-yellow-200" />
                          <h3 className="text-xl font-bold">Agent Insight</h3>
                          <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">AI 종합 전략</span>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4">
                          <div className="text-white/95 text-sm leading-relaxed space-y-2">
                            {reportResult.agentInsight.split('\n').map((line, idx) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;
                              // 볼드 처리된 카테고리 (• **항목** 또는 **항목:**)
                              if (trimmed.includes('**')) {
                                const match = trimmed.match(/\*\*(.+?)\*\*:*\s*(.*)/);
                                if (match) {
                                  return (
                                    <div key={idx} className="flex items-start gap-2">
                                      <span className="text-yellow-200 font-bold flex-shrink-0">{match[1]}:</span>
                                      <span>{match[2]}</span>
                                    </div>
                                  );
                                }
                              }
                              // 일반 줄
                              return <p key={idx}>{trimmed.replace(/\*\*/g, '')}</p>;
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Agent Insight - Conclusion (섹션 5로 표시되지 않는 경우 fallback, agentInsight 없을 때만) */}
                  {!reportResult.agentInsight && conclusionSection && numberedSections.filter(s => s.number === 5).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8"
                    >
                      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-2.5 mb-4">
                          <Lightbulb className="w-6 h-6 text-yellow-200" />
                          <h3 className="text-xl font-bold">Agent Insight</h3>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4">
                          <p className="text-white/95 text-sm leading-relaxed">
                            {conclusionSection.content.join(' ').replace(/\s+/g, ' ').trim()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* RAG Sources */}
                  {reportResult.sources && reportResult.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-6 pt-5 border-t border-slate-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          RAG 참고 자료
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reportResult.sources.map((src, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs">
                            <span className="text-rose-400 font-bold">#{idx + 1}</span>
                            <span className="text-slate-600 font-medium">{src.title}</span>
                            {src.source && (
                              <span className="text-slate-400">({src.source})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
