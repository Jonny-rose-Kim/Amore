import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchTrendEvidence, TrendEvidenceData } from '../services/api';

interface TrendEvidenceChartProps {
  keyword: string | null;
  country: string;
}

export default function TrendEvidenceChart({ keyword, country }: TrendEvidenceChartProps) {
  const [data, setData] = useState<TrendEvidenceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchTrendEvidence(country, keyword || undefined).then(result => {
      setData(result);
      setIsLoading(false);
    });
  }, [country, keyword]);

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-slate-500">
        <Activity className="w-4 h-4 animate-pulse inline mr-1" />
        데이터 로딩 중...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-4 text-center text-sm text-slate-400">
        리더보드 항목을 선택하면 트렌드 근거가 표시됩니다
      </div>
    );
  }

  const getPLCPhaseLabel = (level: string) => {
    if (level === 'Early') return 'Introduction → Growth';
    if (level === 'Growing') return 'Growth → Maturity';
    return 'Maturity (Peak)';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* 트렌드 근거 차트 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-rose-600" />
          <h4 className="text-sm font-semibold text-slate-800">
            {keyword ? `"${keyword}" 언급 추세` : '전체 언급 추세'}
          </h4>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data.weeksData}>
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} width={30} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="SNS" stroke="#ec4899" strokeWidth={2} dot={false} name="SNS" />
              <Line type="monotone" dataKey="Retail" stroke="#f97316" strokeWidth={2} dot={false} name="Retail" />
              <Line type="monotone" dataKey="Review" stroke="#06b6d4" strokeWidth={2} dot={false} name="Review" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PLC 트렌드 예측 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-slate-800">PLC 트렌드 예측</h4>
          <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
            {getPLCPhaseLabel(data.trendLevel)}
          </span>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={data.plcPrediction}>
              <defs>
                <linearGradient id="plcGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#64748b' }} interval={2} />
              <YAxis tick={{ fontSize: 8, fill: '#64748b' }} width={25} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                formatter={(value: number) => [`${value}%`, 'Trend Score']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#plcGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-1 px-1">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-purple-600"></div>
              <span className="text-[9px] text-slate-500">현재</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-purple-400 border-dashed border-t"></div>
              <span className="text-[9px] text-slate-500">6개월 예측</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-purple-300 border-dashed border-t"></div>
              <span className="text-[9px] text-slate-500">1년 예측</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
