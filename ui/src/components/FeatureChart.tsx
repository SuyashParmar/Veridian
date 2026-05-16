import React, { useEffect, useState } from 'react';

interface Contribution {
  feature: string;
  value: number;
}

interface FeatureChartProps {
  contributions: Contribution[];
  limit?: number;
}

const FeatureChart: React.FC<FeatureChartProps> = ({ contributions, limit = 6 }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, [contributions]);

  const sorted = [...contributions]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, limit);

  const maxAbs = Math.max(...sorted.map(c => Math.abs(c.value)), 0.001);

  const formatFeature = (s: string) =>
    s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="feature-chart">
      {sorted.map((c, i) => {
        const isRisk = c.value > 0;
        const pct = (Math.abs(c.value) / maxAbs) * 100;
        return (
          <div key={c.feature} className="feature-row" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="feature-row-header">
              <span className="feature-name">{formatFeature(c.feature)}</span>
              <span className={`feature-val ${isRisk ? 'val--risk' : 'val--safe'}`}>
                {c.value > 0 ? '+' : ''}{c.value.toFixed(3)}
              </span>
            </div>
            <div className="feature-bar-track">
              <div
                className={`feature-bar-fill ${isRisk ? 'fill--risk' : 'fill--safe'}`}
                style={{
                  width: mounted ? `${pct}%` : '0%',
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureChart;
