'use client';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
  type?: 'bar' | 'pie';
}

export default function SimpleChart({ data, title, type = 'bar' }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-5 h-5 rounded-lg shadow-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color || `hsl(${index * 60}, 70%, 50%)`}, ${item.color || `hsl(${index * 60}, 70%, 60%)`})`
                    }}
                  ></div>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">({percentage.toFixed(1)}%)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                <span className="text-lg font-bold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${item.color || `hsl(${index * 60}, 70%, 50%)`}, ${item.color || `hsl(${index * 60}, 70%, 60%)`})`
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
