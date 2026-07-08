import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { 
  BellRing, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Languages,
  Users,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

const AUDIENCE_OPTIONS = ['All Fans', 'Fans near Gate B', 'Accessibility Users', 'Volunteers', 'Security Team', 'Transport Team'];

export default function AlertApprovalPage() {
  const { user } = useAuth();
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [approved, setApproved] = useState({});
  const [previewLang, setPreviewLang] = useState({});
  const [audience, setAudience] = useState({});
  const [editedMessage, setEditedMessage] = useState({});

  const fetchPending = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = JSON.parse(localStorage.getItem('stadiumpulse_user') || '{}').token || '';
      const res = await axios.get(`${backendUrl}/api/alerts/pending`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-demo-role': user?.role || 'staff' }
      });
      setPendingAlerts(res.data);
      // Initialise editable messages
      const msgs = {};
      res.data.forEach(a => { msgs[a.id] = a.message; });
      setEditedMessage(msgs);
    } catch (err) {
      console.error('Failed to fetch pending alerts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (alertId) => {
    setApproving(prev => ({ ...prev, [alertId]: true }));
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = JSON.parse(localStorage.getItem('stadiumpulse_user') || '{}').token || '';
      await axios.post(`${backendUrl}/api/alerts/approve`, { alertId }, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-demo-role': user?.role || 'staff' }
      });
      setApproved(prev => ({ ...prev, [alertId]: true }));
      setTimeout(() => {
        setPendingAlerts(prev => prev.filter(a => a.id !== alertId));
      }, 1200);
    } catch (err) {
      console.error('Approval failed:', err.message);
    } finally {
      setApproving(prev => ({ ...prev, [alertId]: false }));
    }
  };

  const handleReject = (alertId) => {
    setPendingAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="text-pitchGreen" />
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Alert Approval Desk</h1>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Review AI-drafted alerts before broadcasting to fans</p>
          </div>
        </div>
        <button onClick={fetchPending} className="p-2 bg-stadiumNavy border border-slate-800 rounded-xl text-slate-400 hover:text-white">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Safety Notice */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-xs text-slate-300 font-medium leading-relaxed flex items-start space-x-3">
        <AlertTriangle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-white">Anti-Hallucination Policy:</strong> All alerts below were drafted by AI using only the original staff report text. No stadium facts were invented. You may edit the message before approving. Alerts are NOT live until you click <strong className="text-pitchGreen">Approve &amp; Broadcast</strong>.
        </span>
      </div>

      {loading ? (
        <LoadingState message="Loading pending alert queue..." />
      ) : pendingAlerts.length === 0 ? (
        <EmptyState title="Queue Empty" message="No pending alert drafts awaiting approval. The operations queue is clear." icon={BellRing} />
      ) : (
        <div className="space-y-5">
          {pendingAlerts.map(alert => (
            <div key={alert.id} className={`glass-panel p-5 rounded-3xl border transition-all ${approved[alert.id] ? 'border-pitchGreen/50 bg-emerald-950/10' : 'border-slate-800'}`}>
              {approved[alert.id] ? (
                <div className="flex items-center space-x-3 py-4 justify-center text-pitchGreen font-bold">
                  <CheckCircle size={24} className="animate-bounce" />
                  <span>Alert Approved &amp; Broadcasted!</span>
                </div>
              ) : (
                <>
                  {/* Alert Meta */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={alert.severity} text={alert.severity?.toUpperCase()} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{alert.type}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">{alert.target || 'General Area'}</span>
                  </div>

                  {/* Editable Message */}
                  <div className="space-y-1.5 mb-4">
                    <label className="text-[10px] font-bold text-alertAmber uppercase">Draft Fan Alert Message (Editable)</label>
                    <textarea
                      rows={3}
                      value={editedMessage[alert.id] || alert.message}
                      onChange={(e) => setEditedMessage(prev => ({ ...prev, [alert.id]: e.target.value }))}
                      className="w-full bg-stadiumNavy/60 border border-alertAmber/30 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none font-medium resize-none focus:border-alertAmber"
                    />
                  </div>

                  {/* Language Preview Tabs */}
                  <div className="mb-4 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1"><Languages size={11} /><span>Language Preview</span></label>
                    <div className="flex space-x-2">
                      {['English', 'Spanish', 'French'].map(lang => (
                        <button
                          key={lang}
                          onClick={() => setPreviewLang(prev => ({ ...prev, [alert.id]: lang }))}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${(previewLang[alert.id] || 'English') === lang ? 'bg-electricBlue text-white border-electricBlue' : 'bg-stadiumNavy text-slate-400 border-slate-800'}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                    {(previewLang[alert.id] && previewLang[alert.id] !== 'English') && (
                      <p className="text-xs text-slate-400 bg-stadiumNavy/40 p-2.5 rounded-xl border border-slate-800 font-medium italic">
                        [Translation preview] Connect AI keys for live translation of: "{editedMessage[alert.id] || alert.message}"
                      </p>
                    )}
                  </div>

                  {/* Audience Selector */}
                  <div className="mb-5 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1"><Users size={11} /><span>Target Audience</span></label>
                    <div className="flex flex-wrap gap-2">
                      {AUDIENCE_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setAudience(prev => ({ ...prev, [alert.id]: opt }))}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${(audience[alert.id] || 'All Fans') === opt ? 'bg-pitchGreen/20 border-pitchGreen text-pitchGreen' : 'bg-stadiumNavy border-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(alert.id)}
                      disabled={approving[alert.id]}
                      className="flex-1 py-2.5 bg-pitchGreen hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
                    >
                      {approving[alert.id] ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                      <span>Approve &amp; Broadcast</span>
                    </button>
                    <button
                      onClick={() => handleReject(alert.id)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-criticalRed font-bold rounded-xl text-sm transition-all flex items-center space-x-1"
                    >
                      <XCircle size={15} />
                      <span>Reject</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
