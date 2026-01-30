import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ImagePlus, Trash2, Maximize2, Minimize2, Move } from 'lucide-react';
import { sendChatMessage, sendChatMultimodal, ChatMessage } from '../services/api';

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/** 타이핑 효과가 있는 텍스트 컴포넌트 */
function TypingText({
  text,
  speed = 15,
  onComplete
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        // 한 번에 여러 글자 추가 (더 자연스러운 효과)
        const charsToAdd = Math.min(3, text.length - currentIndex);
        setDisplayedText(text.substring(0, currentIndex + charsToAdd));
        currentIndex += charsToAdd;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return (
    <>
      <FormattedResponse text={displayedText} />
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-pink-400 animate-pulse ml-0.5 rounded-sm" />
      )}
    </>
  );
}

/** LLM 응답 포맷팅 컴포넌트 */
function FormattedResponse({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // ### 소제목
        if (trimmed.startsWith('###')) {
          return (
            <div key={i} className="font-bold text-slate-800 text-sm mt-2 mb-1">
              {trimmed.replace(/^###\s*/, '')}
            </div>
          );
        }

        // ## 소제목
        if (trimmed.startsWith('##')) {
          return (
            <div key={i} className="font-bold text-slate-800 text-base mt-2 mb-1">
              {trimmed.replace(/^##\s*/, '')}
            </div>
          );
        }

        // 번호 매기기 (1. 2. 3.)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 items-start ml-1">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                {numberedMatch[1]}
              </span>
              <span className="text-slate-700 flex-1">{formatInlineStyles(numberedMatch[2])}</span>
            </div>
          );
        }

        // 불릿 포인트 (- *)
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[-*]\s*/, '');
          return (
            <div key={i} className="flex gap-2 items-start ml-2">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-pink-400 mt-2" />
              <span className="text-slate-700 flex-1">{formatInlineStyles(content)}</span>
            </div>
          );
        }

        // 일반 텍스트
        return (
          <p key={i} className="text-slate-700">
            {formatInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/** 인라인 스타일 (볼드 처리) */
function formatInlineStyles(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null); // 현재 타이핑 중인 메시지 ID
  const [showInitialTooltip, setShowInitialTooltip] = useState(false); // 처음 방문 시 챗봇 안내 말풍선

  // 드래그 및 확대 관련 상태
  const [position, setPosition] = useState({ x: 24, y: 24 }); // bottom-left 기준
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 고정
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 처음 방문 시 챗봇 안내 말풍선 표시
  useEffect(() => {
    const CHATBOT_TOOLTIP_KEY = 'amore-clue-chatbot-tooltip-dismissed';
    const dismissed = localStorage.getItem(CHATBOT_TOOLTIP_KEY);
    if (!dismissed) {
      // 1초 후 말풍선 표시
      const showTimer = setTimeout(() => {
        setShowInitialTooltip(true);
      }, 1500);
      // 8초 후 자동 숨김 및 localStorage 저장
      const hideTimer = setTimeout(() => {
        setShowInitialTooltip(false);
        localStorage.setItem(CHATBOT_TOOLTIP_KEY, 'true');
      }, 9500);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  // 드래그 이벤트 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 헤더 영역에서만 드래그 시작
    if ((e.target as HTMLElement).closest('.chat-drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX + position.x,
        y: e.clientY + position.y,
      });
      e.preventDefault();
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = dragStart.x - e.clientX;
    const newY = dragStart.y - e.clientY;

    // 화면 밖으로 나가지 않도록 제한
    const maxX = window.innerWidth - (isExpanded ? 700 : 480) - 10;
    const maxY = window.innerHeight - (isExpanded ? 800 : 650) - 10;

    setPosition({
      x: Math.max(10, Math.min(maxX, newX)),
      y: Math.max(10, Math.min(maxY, newY)),
    });
  }, [isDragging, dragStart, isExpanded]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 더블클릭 확대/축소
  const handleDoubleClick = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 추천 질문 목록
  const suggestedQuestions = [
    { icon: '🔥', text: '요즘 핫한 K-뷰티 트렌드는?' },
    { icon: '🧴', text: '인기 성분 TOP 5 알려줘' },
    { icon: '🌍', text: '미국에서 인기있는 제품은?' },
    { icon: '💡', text: '신규 진출 추천 카테고리' },
  ];

  // 채팅창 열릴 때 기본 인사 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'bot',
        content: '🤖 안녕하세요! CLUE Bot이에요!\n\n✨ K-뷰티 트렌드, 성분 분석, 시장 인사이트 등\n궁금한 점을 자유롭게 물어보세요!\n\n📸 이미지를 드래그하면 제품/트렌드 시각 분석도 가능해요!',
        timestamp: Date.now(),
      }]);
    }
  }, [isOpen]);

  // 채팅창 닫으면 전체 state 초기화 (메모리 해제)
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMessages([]);
    setInputText('');
    setAttachedImage(null);
    setIsLoading(false);
    setSessionId(generateSessionId());
    setIsDragOver(false);
    setShowSuggestions(true);
    setPosition({ x: 24, y: 24 }); // 위치 초기화
    setIsExpanded(false); // 크기 초기화
  }, []);

  // 이미지 파일 처리
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일은 5MB 이하만 업로드 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // 드래그 앤 드롭
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  // 파일 선택
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = '';
  }, [handleImageFile]);

  // 메시지 전송
  const handleSend = useCallback(async () => {
    const message = inputText.trim();
    if (!message && !attachedImage) return;
    if (isLoading) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message || '이미지를 분석해주세요.',
      image: attachedImage || undefined,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      let result;
      if (attachedImage) {
        result = await sendChatMultimodal({
          message: message || '이 이미지를 분석해주세요.',
          image: attachedImage,
          sessionId,
        });
      } else {
        result = await sendChatMessage({
          message,
          sessionId,
        });
      }

      const botMessageId = `msg_${Date.now()}_bot`;
      const botMessage: ChatMessage = {
        id: botMessageId,
        role: 'bot',
        content: result.success ? result.response : (result.error || '응답 생성에 실패했습니다. 서버 상태를 확인해주세요.'),
        timestamp: Date.now(),
      };
      setTypingMessageId(botMessageId); // 타이핑 효과 시작
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessageId = `msg_${Date.now()}_err`;
      const errorMessage: ChatMessage = {
        id: errorMessageId,
        role: 'bot',
        content: '서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: Date.now(),
      };
      setTypingMessageId(errorMessageId); // 에러 메시지도 타이핑 효과
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, attachedImage, isLoading, sessionId]);

  // Enter 전송, Shift+Enter 줄바꿈
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <>
      {/* 채팅 아이콘 버튼 */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 group"
          >
            {/* 메인 버튼 */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 shadow-lg hover:shadow-2xl flex items-center justify-center transition-all overflow-hidden">
              {/* 채팅 말풍선 아이콘 */}
              <div className="relative">
                {/* 메인 말풍선 */}
                <div className="w-9 h-7 bg-white rounded-xl relative shadow-inner">
                  {/* 말풍선 꼬리 */}
                  <div className="absolute -bottom-1.5 left-1.5 w-3 h-3 bg-white rounded-sm transform rotate-45" />
                  {/* 채팅 점들 */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
              {/* 반짝이는 효과 */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {/* 말풍선 툴팁 - 호버 시 */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white rounded-xl px-3 py-2 shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2 whitespace-nowrap pointer-events-none">
              <div className="text-xs font-medium text-slate-700">AI에게 물어보세요! 💬</div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-white border-l border-b border-slate-100 rotate-45" />
            </div>
            {/* 노란색 안내 말풍선 - 처음 방문 시 */}
            <AnimatePresence>
              {showInitialTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  className="absolute left-full ml-4 bottom-0 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-2xl px-4 py-3 shadow-xl whitespace-nowrap pointer-events-none"
                >
                  <div className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span>궁금한 게 있으면 챗봇을 이용해보세요!</span>
                  </div>
                  <div className="text-xs text-amber-800 mt-1 ml-7">K-뷰티 트렌드, 성분, 제품 뭐든 물어보세요 🌸</div>
                  {/* 말풍선 꼬리 */}
                  <div className="absolute left-0 bottom-4 -translate-x-2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-amber-400" />
                </motion.div>
              )}
            </AnimatePresence>
            {/* 온라인 표시 */}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <span className="text-[8px] font-bold text-white">AI</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 채팅창 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${isDragging ? 'cursor-grabbing' : ''}`}
            style={{
              left: position.x,
              bottom: position.y,
              width: isExpanded ? '700px' : '480px',
              height: isExpanded ? '800px' : '650px',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMouseDown={handleMouseDown}
          >
            {/* 헤더 - 드래그 핸들 */}
            <div
              className="chat-drag-handle flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white flex-shrink-0 shadow-md cursor-grab active:cursor-grabbing select-none"
              onDoubleClick={handleDoubleClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/30 shadow-inner">
                  <img
                    src="/images/amore_clue.png"
                    alt="CLUE Bot"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-wide">AMORE CLUE AI</span>
                  <span className="text-[10px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    온라인
                    <span className="mx-1">·</span>
                    <Move className="w-3 h-3 inline" />
                    <span className="text-white/60">드래그로 이동</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(prev => !prev);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title={isExpanded ? "축소" : "확대"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessages([]);
                    setSessionId(generateSessionId());
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="대화 초기화"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* 아바타 */}
                  <div className={`flex-shrink-0 ${msg.role === 'user' ? 'mb-1' : 'mb-1'}`}>
                    {msg.role === 'bot' ? (
                      <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-pink-100 overflow-hidden flex items-center justify-center">
                        <img
                          src="/images/amore_clue.png"
                          alt="CLUE Bot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-100 to-blue-200 shadow-md flex items-center justify-center border-2 border-sky-200">
                        <span className="text-base">😊</span>
                      </div>
                    )}
                  </div>

                  {/* 메시지 말풍선 */}
                  <div className={`relative max-w-[78%] group`}>
                    <div
                      className={`relative rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-sky-400 to-blue-400 text-white rounded-br-md shadow-md'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-md'
                      }`}
                    >
                      {/* 이미지 미리보기 */}
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="첨부 이미지"
                          className="max-w-full max-h-40 rounded-lg mb-2 object-cover shadow-sm"
                        />
                      )}
                      {/* 메시지 내용 */}
                      {msg.role === 'bot' ? (
                        msg.id === typingMessageId ? (
                          <TypingText
                            text={msg.content}
                            speed={12}
                            onComplete={() => setTypingMessageId(null)}
                          />
                        ) : (
                          <FormattedResponse text={msg.content} />
                        )
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    {/* 시간 표시 (hover시) */}
                    <div className={`absolute bottom-0 ${msg.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 whitespace-nowrap`}>
                      {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex items-end gap-2">
                  {/* 봇 아바타 */}
                  <div className="flex-shrink-0 mb-1">
                    <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-pink-100 overflow-hidden flex items-center justify-center">
                      <img
                        src="/images/amore_clue.png"
                        alt="CLUE Bot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md shadow-md px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-slate-400 ml-1">답변 생성 중...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 드래그 오버레이 */}
            {isDragOver && (
              <div className="absolute inset-0 bg-pink-50/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl border-2 border-dashed border-pink-400">
                <div className="text-center">
                  <ImagePlus className="w-10 h-10 text-pink-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-pink-600">이미지를 여기에 놓으세요</p>
                </div>
              </div>
            )}

            {/* 이미지 미리보기 */}
            {attachedImage && (
              <div className="px-4 py-2 border-t border-slate-100 flex-shrink-0">
                <div className="relative inline-block">
                  <img
                    src={attachedImage}
                    alt="첨부 이미지"
                    className="h-16 rounded-lg object-cover border border-slate-200"
                  />
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* 추천 질문 */}
            {showSuggestions && !isLoading && (
              <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0 bg-gradient-to-r from-slate-50 to-pink-50/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-slate-400 font-medium">💡 이런 질문은 어때요?</p>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-slate-300 hover:text-slate-500 transition-colors p-0.5 rounded hover:bg-slate-100"
                    title="추천 질문 숨기기"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        // 바로 전송
                        const userMessage: ChatMessage = {
                          id: `msg_${Date.now()}`,
                          role: 'user',
                          content: q.text,
                          timestamp: Date.now(),
                        };
                        setMessages(prev => [...prev, userMessage]);
                        setIsLoading(true);

                        try {
                          const result = await sendChatMessage({
                            message: q.text,
                            sessionId,
                          });
                          const botMessageId = `msg_${Date.now()}_bot`;
                          const botMessage: ChatMessage = {
                            id: botMessageId,
                            role: 'bot',
                            content: result.success ? result.response : (result.error || '응답 생성에 실패했습니다.'),
                            timestamp: Date.now(),
                          };
                          setTypingMessageId(botMessageId); // 타이핑 효과 시작
                          setMessages(prev => [...prev, botMessage]);
                        } catch {
                          const errorMessageId = `msg_${Date.now()}_err`;
                          const errorMessage: ChatMessage = {
                            id: errorMessageId,
                            role: 'bot',
                            content: '서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
                            timestamp: Date.now(),
                          };
                          setTypingMessageId(errorMessageId); // 에러 메시지도 타이핑 효과
                          setMessages(prev => [...prev, errorMessage]);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 transition-all shadow-sm hover:shadow active:scale-95"
                    >
                      <span>{q.icon}</span>
                      <span>{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 입력 영역 */}
            <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                  title="이미지 첨부"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="메시지를 입력하세요..."
                  rows={1}
                  className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 max-h-24 overflow-y-auto"
                  style={{ minHeight: '36px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || (!inputText.trim() && !attachedImage)}
                  className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
