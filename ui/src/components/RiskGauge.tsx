import React, { useEffect, useState } from 'react';

interface RiskGaugeProps {
  probability: number; // 0 to 1
  prediction: string;
  size?: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ probability, prediction, size = 200 }) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    setAnimated(0);
    const timer = setTimeout(() => setAnimated(probability), 100);
    return () => clearTimeout(timer);
  }, [probability]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const strokeWidth = size * 0.045;

  // Arc from -220deg to +40deg (240 degrees total sweep)
  const totalSweep = 240;
  const startAngle = -210; // degrees
  const circumference = (2 * Math.PI * r * totalSweep) / 360;
  const offset = circumference - animated * circumference;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startRad = toRad(startAngle);
  const endRad = toRad(startAngle + totalSweep);
  const sx = cx + r * Math.cos(startRad);
  const sy = cy + r * Math.sin(startRad);
  const ex = cx + r * Math.cos(endRad);
  const ey = cy + r * Math.sin(endRad);

  const arcPath = `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`;

  const isApproved = prediction === 'Approved';
  const gaugeColor = isApproved ? '#10b981' : '#f43f5e';
  const gaugeGlow = isApproved
    ? 'drop-shadow(0 0 12px rgba(16,185,129,0.6))'
    : 'drop-shadow(0 0 12px rgba(244,63,94,0.6))';

  return (
    <div className="risk-gauge-wrapper">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: gaugeGlow, overflow: 'visible' }}
      >
        {/* Track */}
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Animated fill */}
        <path
          d={arcPath}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const angle = toRad(startAngle + tick * totalSweep);
          const inner = r - strokeWidth * 0.8;
          const outer = r + strokeWidth * 0.5;
          return (
            <line
              key={tick}
              x1={cx + inner * Math.cos(angle)}
              y1={cy + inner * Math.sin(angle)}
              x2={cx + outer * Math.cos(angle)}
              y2={cy + outer * Math.sin(angle)}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
            />
          );
        })}
        {/* Center text */}
        <text
          x={cx}
          y={cy - size * 0.06}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.18}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="800"
        >
          {(probability * 100).toFixed(1)}%
        </text>
        <text
          x={cx}
          y={cy + size * 0.1}
          textAnchor="middle"
          fill={gaugeColor}
          fontSize={size * 0.07}
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          letterSpacing="0.15em"
          textDecoration="none"
        >
          RISK SCORE
        </text>
        {/* Min/Max labels */}
        <text
          x={cx + r * Math.cos(toRad(startAngle)) - 4}
          y={cy + r * Math.sin(toRad(startAngle)) + 14}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={size * 0.055}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
        >
          0%
        </text>
        <text
          x={cx + r * Math.cos(toRad(startAngle + totalSweep)) + 4}
          y={cy + r * Math.sin(toRad(startAngle + totalSweep)) + 14}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={size * 0.055}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="600"
        >
          100%
        </text>
      </svg>
    </div>
  );
};

export default RiskGauge;
