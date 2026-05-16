import React, { useEffect, useState } from 'react';
import { Download, Trash2, Terminal } from 'lucide-react';

export interface ScanEntry {
  id: string;
  timestamp: string;
  prediction: string;
  probability: number;
  confidence: number;
  model: string;
  isOod: boolean;
}

const STORAGE_KEY = 'veridian_scan_history';
const MAX_ENTRIES = 50;

export const useScanHistory = () => {
  const load = (): ScanEntry[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  };

  const addEntry = (entry: Omit<ScanEntry, 'id' | 'timestamp'>) => {
    const entries = load();
    const newEntry: ScanEntry = {
      ...entry,
      id: `VRD_${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  };

  const clear = () => localStorage.removeItem(STORAGE_KEY);

  return { load, addEntry, clear };
};

interface ScanHistoryProps {
  latestEntry?: ScanEntry | null;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ latestEntry }) => {
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const { load, clear } = useScanHistory();

  useEffect(() => {
    setEntries(load());
  }, [latestEntry]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Clearance', 'Risk Probability', 'Confidence', 'Model', 'OOD Flag'];
    const rows = entries.map(e => [
      e.id,
      new Date(e.timestamp).toLocaleString(),
      e.prediction,
      `${(e.probability * 100).toFixed(2)}%`,
      `${(e.confidence * 100).toFixed(1)}%`,
      e.model,
      e.isOod ? 'YES' : 'NO',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veridian_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    clear();
    setEntries([]);
  };

  return (
    <div className="glass-dossier fade-up">
      <div className="log-header">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-indigo-400" />
          <h2 className="log-title">Decision Audit Log</h2>
          <span className="log-badge">{entries.length} records</span>
        </div>
        <div className="flex gap-3">
          <button className="log-action-btn" onClick={handleExportCSV} disabled={entries.length === 0} title="Export CSV">
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button className="log-action-btn log-action-btn--danger" onClick={handleClear} disabled={entries.length === 0} title="Clear history">
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="audit-table">
          <thead>
            <tr>
              <th>VECTOR ID</th>
              <th>TIMESTAMP</th>
              <th>CLEARANCE</th>
              <th>RISK PROB</th>
              <th>CONFIDENCE</th>
              <th>ENGINE</th>
              <th>OOD</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="audit-empty">
                  No scans recorded yet. Run a profile scan to begin logging.
                </td>
              </tr>
            ) : (
              entries.map((e, i) => (
                <tr key={e.id} className={i === 0 && latestEntry?.id === e.id ? 'audit-row--new' : ''}>
                  <td className="audit-id">{e.id}</td>
                  <td className="audit-ts">{new Date(e.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`audit-badge ${e.prediction === 'Approved' ? 'badge--approved' : 'badge--denied'}`}>
                      {e.prediction.toUpperCase()}
                    </span>
                  </td>
                  <td className="audit-mono">{(e.probability * 100).toFixed(2)}%</td>
                  <td className="audit-mono">{(e.confidence * 100).toFixed(1)}%</td>
                  <td className="audit-engine">{e.model}</td>
                  <td>
                    <span className={`audit-ood ${e.isOod ? 'ood--yes' : 'ood--no'}`}>
                      {e.isOod ? 'OOD' : 'NOM'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanHistory;
