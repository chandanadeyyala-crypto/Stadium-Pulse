import React, { useState } from 'react';
import { Database, DoorOpen, Grid3X3, MapPin, Bus, Upload, Download, Plus, Trash2, CheckCircle } from 'lucide-react';

// Demo verified venue data — clearly labelled
const DEMO_GATES = [
  { id: 'gate_a', name: 'Gate A', type: 'gate', description: 'North main gate, close to parking lot A', accessible: true, status: 'open' },
  { id: 'gate_b', name: 'Gate B', type: 'gate', description: 'South secondary gate, close to rideshare zone', accessible: true, status: 'crowded' },
  { id: 'gate_d', name: 'Gate D', type: 'gate', description: 'East VIP and General gate, close to light rail', accessible: true, status: 'open' },
];

const DEMO_FACILITIES = [
  { id: 'rest_r2', name: 'Restroom R2', type: 'facility', location: 'Concourse East', accessible: true },
  { id: 'med_east', name: 'Medical Desk East', type: 'facility', location: 'Concourse East', accessible: true },
  { id: 'elev_east', name: 'Elevator Bay E1', type: 'facility', location: 'Concourse East', accessible: true },
];

const DEMO_TRANSPORT = [
  { id: 'metro_3', name: 'Metro Exit 3', type: 'transit', description: 'Direct access to local rapid transit link' },
];

const TABS = ['Gates', 'Facilities', 'Sections', 'Routes', 'Transport'];

export default function AdminVenuePage() {
  const [activeTab, setActiveTab] = useState('Gates');
  const [gates, setGates] = useState(DEMO_GATES);
  const [facilities, setFacilities] = useState(DEMO_FACILITIES);
  const [saved, setSaved] = useState(false);
  const [newGateName, setNewGateName] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddGate = () => {
    if (!newGateName.trim()) return;
    setGates(prev => [...prev, {
      id: `gate_${Date.now()}`,
      name: newGateName,
      type: 'gate',
      description: 'New gate — add description',
      accessible: false,
      status: 'open'
    }]);
    setNewGateName('');
  };

  const handleDeleteGate = (id) => setGates(prev => prev.filter(g => g.id !== id));
  const toggleAccessible = (id) => setGates(prev => prev.map(g => g.id === id ? { ...g, accessible: !g.accessible } : g));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Database className="text-alertAmber" />
          <div>
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">Admin Venue Data</h1>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Manage verified stadium infrastructure records</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1">
            <Upload size={13} /><span>Import JSON</span>
          </button>
          <button className="px-3 py-2 bg-stadiumNavy border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1">
            <Download size={13} /><span>Export</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-pitchGreen hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
          >
            {saved ? <><CheckCircle size={13} /><span>Saved!</span></> : <span>Save Changes</span>}
          </button>
        </div>
      </div>

      {/* Principle Reminder */}
      <div className="bg-electricBlue/5 border border-electricBlue/20 p-4 rounded-2xl text-xs text-slate-300 font-medium leading-relaxed">
        <strong className="text-electricBlue">Core Principle:</strong> Verified Data → AI Intelligence → User.
        Only facts stored here are used by the AI assistant. Adding accurate records prevents hallucination and improves fan safety.
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-stadiumNavy/40 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-electricBlue text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Gates Manager */}
      {activeTab === 'Gates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5"><DoorOpen size={16} className="text-pitchGreen" /><span>Gate Manager</span></h3>
          </div>

          {/* Add new gate */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="New gate name (e.g. Gate F)"
              value={newGateName}
              onChange={(e) => setNewGateName(e.target.value)}
              className="flex-1 bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-medium focus:border-electricBlue"
            />
            <button
              onClick={handleAddGate}
              className="px-4 py-2.5 bg-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center space-x-1"
            >
              <Plus size={15} /><span>Add</span>
            </button>
          </div>

          <div className="space-y-3">
            {gates.map(gate => (
              <div key={gate.id} className="p-4 rounded-2xl bg-stadiumNavy border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">{gate.name}</h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${gate.status === 'open' ? 'bg-emerald-500/10 text-pitchGreen' : 'bg-red-500/10 text-criticalRed'}`}>{gate.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{gate.description}</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <span className="text-[10px] text-slate-400 font-semibold">♿ Accessible</span>
                    <div
                      onClick={() => toggleAccessible(gate.id)}
                      className={`w-8 h-4 rounded-full cursor-pointer transition-colors relative ${gate.accessible ? 'bg-pitchGreen' : 'bg-slate-700'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${gate.accessible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                  <button
                    onClick={() => handleDeleteGate(gate.id)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-criticalRed rounded-lg transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilities Manager */}
      {activeTab === 'Facilities' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5"><MapPin size={16} className="text-electricBlue" /><span>Facility Manager</span></h3>
          <div className="space-y-3">
            {facilities.map(fac => (
              <div key={fac.id} className="p-4 rounded-2xl bg-stadiumNavy border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{fac.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Location: {fac.location} · {fac.accessible ? '♿ Accessible' : 'Standard'}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{fac.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections Manager Placeholder */}
      {activeTab === 'Sections' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
          <Grid3X3 size={32} className="text-slate-600" />
          <h4 className="text-sm font-bold text-white">Section Manager</h4>
          <p className="text-xs text-slate-400 max-w-xs font-medium">Configure seating sections, capacity limits, and accessibility zones. Import venue seating chart JSON to auto-populate.</p>
          <button className="px-4 py-2 bg-electricBlue text-white text-xs font-bold rounded-xl flex items-center space-x-1">
            <Upload size={13} /><span>Import Section JSON</span>
          </button>
        </div>
      )}

      {/* Routes Manager Placeholder */}
      {activeTab === 'Routes' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
          <MapPin size={32} className="text-slate-600" />
          <h4 className="text-sm font-bold text-white">Route Graph Manager</h4>
          <p className="text-xs text-slate-400 max-w-xs font-medium">Edit graph nodes and edge connections. Changes instantly affect routing engine weights and AI-suggested paths.</p>
          <div className="text-[10px] font-mono text-slate-500 bg-black/40 px-4 py-2 rounded-lg border border-slate-800">
            Edit backend/src/services/routeEngine.js to modify STADIUM_NODES and STADIUM_EDGES
          </div>
        </div>
      )}

      {/* Transport Manager */}
      {activeTab === 'Transport' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5"><Bus size={16} className="text-alertAmber" /><span>Transport Point Manager</span></h3>
          <div className="space-y-3">
            {DEMO_TRANSPORT.map(t => (
              <div key={t.id} className="p-4 rounded-2xl bg-stadiumNavy border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{t.description}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-alertAmber bg-amber-500/10 px-2 py-0.5 rounded">{t.type}</span>
              </div>
            ))}
            <button className="w-full py-3 border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all">
              <Plus size={14} /><span>Add Transport Point</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
