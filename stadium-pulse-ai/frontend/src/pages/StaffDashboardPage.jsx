import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import { 
  LayoutDashboard, 
  FileText, 
  BellRing, 
  Users, 
  AlertOctagon, 
  Sparkles,
  ClipboardList,
  Flame,
  UserCheck
} from 'lucide-react';

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({
    activeIncidents: 4,
    crowdedGates: 1,
    broadcastAlerts: 2,
    pendingTasks: 3
  });

  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const token = localStorage.getItem('stadiumpulse_user') 
          ? JSON.parse(localStorage.getItem('stadiumpulse_user')).token 
          : '';

        // Load active alerts
        const alertsResponse = await axios.get(`${backendUrl}/api/alerts`);
        setAlerts(alertsResponse.data);

        // Load incidents
        const incidentsResponse = await axios.get(`${backendUrl}/api/venue/gates`); // Placeholder just to verify server
        
        // Mocking operational incident database lists for demo
        setIncidents([
          { id: '1', category: 'crowd', severity: 'warning', location: 'Gate B', summary: 'Heavy shuttle buses influx. Security queues 30 min.' },
          { id: '2', category: 'medical', severity: 'info', location: 'Section 214', summary: 'Medical responder dispatched for heat exhaustion. Complete.' }
        ]);

        setStats({
          activeIncidents: 2,
          crowdedGates: alertsResponse.data.filter(a => a.message.includes('crowded') || a.message.includes('congestion')).length || 1,
          broadcastAlerts: alertsResponse.data.length,
          pendingTasks: 3
        });
      } catch (err) {
        console.error('Failed to load operations dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const [tasks, setTasks] = useState([
    { id: 'task_1', title: 'Redirect fans at Gate B to Gate D', assignee: 'Volunteer Ramesh', status: 'pending' },
    { id: 'task_2', title: 'Check wheelchair ramp elevator at East Concourse', assignee: 'Staff Sarah', status: 'completed' },
    { id: 'task_3', title: 'Assist Section 214 medical dispatch route clearance', assignee: 'Volunteer Chen', status: 'pending' }
  ]);

  const toggleTaskStatus = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'completed' ? 'pending' : 'completed' };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2.5">
          <LayoutDashboard className="text-electricBlue" />
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Operations Dashboard</h1>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Venue staff command center</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/staff-report"
            className="px-4 py-2 bg-electricBlue hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
          >
            <FileText size={14} />
            <span>File Incident Report</span>
          </Link>
          <Link
            to="/alert-approval"
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
          >
            Review Pending Alerts
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Incidents', count: stats.activeIncidents, color: 'text-criticalRed', icon: AlertOctagon },
          { label: 'Congested Gates', count: stats.crowdedGates, color: 'text-alertAmber', icon: Flame },
          { label: 'Live Broadcasts', count: stats.broadcastAlerts, color: 'text-electricBlue', icon: BellRing },
          { label: 'Active Personnel', count: 12, color: 'text-pitchGreen', icon: Users }
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-stadiumNavy/40 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{stat.label}</span>
              <span className={`text-2xl font-black ${stat.color}`}>{stat.count}</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 text-slate-400">
              <stat.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Operations & AI Summary Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Decision Recommendations Summary Panel */}
          <div className="p-5 rounded-3xl border border-indigo-500/20 bg-indigo-950/5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">AI Operations Command Panel</h3>
                <p className="text-[9px] uppercase font-bold text-indigo-400">Gemini Grounded Decision Assistant</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-3 font-medium">
              <p>
                <strong>Current Status:</strong> High crowd density identified at the South stadium gates (Gate B) due to rapid shuttle arrivals. Metro Exit 3 is clear.
              </p>
              <div className="p-3 bg-black bg-opacity-35 rounded-xl border border-indigo-500/10 space-y-2">
                <p className="font-bold text-white text-[11px] uppercase tracking-wider">Suggested Actions:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Assign **Ramesh** to manually divert arriving transport shuttles to drop off near Gate D.</li>
                  <li>Broadcast a **Warning** alert to fans near Gate B advising them to walk via Concourse East.</li>
                  <li>Increase edge weights for Gate B in the routing engine to redirect new routing requests.</li>
                </ul>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold italic border-t border-slate-800/80 pt-3">
              Grounded Reference: Operational status database log files.
            </div>
          </div>

          {/* Active Incidents List */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Active Logs & Reports
            </h3>
            
            {loading ? (
              <LoadingState message="Downloading active reports..." />
            ) : incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.map(inc => (
                  <div key={inc.id} className="p-3 bg-stadiumNavy/40 border border-slate-800 rounded-xl flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{inc.location}</span>
                        <StatusBadge status={inc.severity} text={inc.category} />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{inc.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active incidents filed.</p>
            )}
          </div>

        </div>

        {/* Volunteers & Tasks Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Volunteer Task cards */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4" id="tasks">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center space-x-1.5">
              <ClipboardList size={15} className="text-slate-400" />
              <span>Volunteer Assignments</span>
            </h3>

            <div className="space-y-3">
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className="w-full p-3 bg-stadiumNavy border border-slate-800 hover:border-electricBlue rounded-xl text-left flex justify-between items-start gap-2 transition-all hover:scale-[1.01]"
                >
                  <div className="space-y-1">
                    <span className={`text-xs font-bold block ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                      <UserCheck size={10} className="text-electricBlue" />
                      <span>{task.assignee}</span>
                    </span>
                  </div>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black shrink-0 ${task.status === 'completed' ? 'bg-emerald-500/10 text-pitchGreen' : 'bg-amber-500/10 text-alertAmber'}`}>
                    {task.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Crowd Heat Status Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Gate Congestion Heat
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-stadiumNavy/20 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300">Gate A (North)</span>
                <span className="text-[10px] uppercase font-bold text-pitchGreen">Normal (2m queue)</span>
              </div>
              <div className="flex justify-between items-center bg-stadiumNavy/20 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300">Gate B (South)</span>
                <span className="text-[10px] uppercase font-bold text-criticalRed">Heavy (30m queue)</span>
              </div>
              <div className="flex justify-between items-center bg-stadiumNavy/20 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300">Gate D (East)</span>
                <span className="text-[10px] uppercase font-bold text-pitchGreen">Normal (1m queue)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
