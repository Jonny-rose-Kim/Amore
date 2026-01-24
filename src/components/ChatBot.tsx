import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { sendChatMessage, sendChatMultimodal, ChatMessage } from '../services/api';

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 스크롤 하단 고정
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 채팅창 열릴 때 기본 인사 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'bot',
        content: '안녕하세요! CLUE Bot입니다.\nK-뷰티 트렌드, 성분 분석, 시장 인사이트 등 궁금한 점을 자유롭게 물어보세요.\n이미지를 드래그하면 제품/트렌드 시각 분석도 가능합니다!',
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

      const botMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        role: 'bot',
        content: result.success ? result.response : (result.error || '응답 생성에 실패했습니다. 서버 상태를 확인해주세요.'),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'bot',
        content: '서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: Date.now(),
      };
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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-2xl flex items-center justify-center transition-shadow"
          >
            <MessageCircle className="w-9 h-9" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 채팅창 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-50 w-[480px] h-[650px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">AMORE CLUE AI</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setMessages([]);
                    setSessionId(generateSessionId());
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="대화 초기화"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-700'
                    }`}
                  >
                    {/* 이미지 미리보기 */}
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="첨부 이미지"
                        className="max-w-full max-h-40 rounded-lg mb-2 object-cover"
                      />
                    )}
                    {/* 메시지 내용 */}
                    {msg.role === 'bot' ? (
                      <FormattedResponse text={msg.content} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                    <span className="text-xs text-slate-500">답변 생성 중...</span>
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
