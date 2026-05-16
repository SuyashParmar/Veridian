import React, { useState, useEffect } from 'react';
import { Radio, Cpu, ScanLine, Clock } from 'lucide-react';

interface StatusBarProps {
  scanCount: number;
  currentModel: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ scanCount, currentModel }) => {
  const [time, setTime] = useState(new Date());
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    const pulseId = setInterval(() => setPulse(p => !p), 1500);
    return () => { clearInterval(timerId); clearInterval(pulseId); };
  }, []);

  const modelLabels: Record<string, string> = {
    xgboost: 'XGBoost',
    random_forest: 'RandomForest',
    mlp_baseline: 'NeuralNet',
  };

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-live">
          <span className={`live-dot ${pulse ? 'live-dot--on' : 'live-dot--off'}`} />
          <span>LIVE</span>
        </div>
        <div className="status-divider" />
        <span className="status-brand">VERIDIAN</span>
        <span className="status-version">v2.0</span>
      </div>

      <div className="status-bar-right">
        <div className="status-item">
          <Cpu size={10} />
          <span>{modelLabels[currentModel] ?? currentModel}</span>
        </div>
        <div className="status-divider" />
        <div className="status-item">
          <ScanLine size={10} />
          <span>{scanCount} Scans</span>
        </div>
        <div className="status-divider" />
        <div className="status-item">
          <Clock size={10} />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
        <div className="status-divider" />
        <div className="status-item" style={{ color: 'var(--accent-emerald)' }}>
          <Radio size={10} />
          <span>99.9% UPTIME</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
