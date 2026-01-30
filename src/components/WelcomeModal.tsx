import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'amore-clue-welcome-dismissed';

export default function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // localStorage에서 이전에 닫았는지 확인
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // 약간의 딜레이 후 모달 표시 (페이지 로딩 후)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // 그냥 닫기 (다음에도 다시 표시됨)
  const handleClose = () => {
    setIsVisible(false);
  };

  // 다시 보지 않기 (localStorage에 저장)
  const handleDismissForever = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden">
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-white" />
                  <h2 className="text-white font-bold text-lg">Amore Clue 안내</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 본문 */}
              <div className="p-6">
                {/* 마스코트와 말풍선 */}
                <div className="flex items-start gap-4 mb-6">
                  {/* 마스코트 아이콘 */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                      <span className="text-3xl">🌸</span>
                    </div>
                  </div>

                  {/* 말풍선 */}
                  <div className="relative flex-1 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200">
                    {/* 말풍선 꼬리 */}
                    <div className="absolute left-[-8px] top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-rose-200"></div>
                    <div className="absolute left-[-6px] top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-rose-50"></div>

                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-600 font-bold text-sm">Amore Clue 팀</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      안녕하세요! 저희 대시보드를 방문해주셔서 감사합니다 🙏
                    </p>
                  </div>
                </div>

                {/* 안내 내용 */}
                <div className="space-y-4 text-sm text-slate-700">
                  {/* GPU 서버 안내 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🖥️</span>
                      <div>
                        <p className="font-semibold text-blue-800 mb-1">AI Agent 서버 안내</p>
                        <p className="text-blue-700 leading-relaxed">
                          현재 데모 버전은 <span className="font-bold">GPU 4장</span>으로 AI Agent를 운영하고 있습니다.
                          최상의 체험을 위해 서버를 수시로 점검하고 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 문의 안내 */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📱</span>
                      <div>
                        <p className="font-semibold text-emerald-800 mb-1">AI 분석 오류 발생 시</p>
                        <p className="text-emerald-700 leading-relaxed">
                          <span className="font-bold bg-emerald-200 px-2 py-0.5 rounded">010-3382-5929</span>로 문자 주시면
                          <span className="font-bold"> 1분 내 해결</span> 후 바로 회신드리겠습니다!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 데이터 안내 */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📊</span>
                      <div>
                        <p className="font-semibold text-amber-800 mb-1">데이터 안내</p>
                        <p className="text-amber-700 leading-relaxed">
                          모든 데이터는 <span className="font-bold">실제 데이터 기반</span>으로 제작되었습니다.
                          현재 <span className="font-bold">미국 시장</span>을 중점적으로 업데이트하고 있으며,
                          일본~말레이시아는 이전 버전 데이터임을 양해 부탁드립니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 이미지 오류 안내 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🖼️</span>
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">제품 이미지 안내</p>
                        <p className="text-slate-600 leading-relaxed">
                          일부 제품 이미지가 표시되지 않는 경우가 있습니다. URL 오류를 순차적으로 수정 중입니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 푸터 */}
              <div className="px-6 pb-6 space-y-3">
                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  확인했습니다!
                </button>
                <button
                  onClick={handleDismissForever}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  다시 보지 않기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
