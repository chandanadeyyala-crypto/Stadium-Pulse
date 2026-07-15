import React, { useState } from 'react';
import { Database, DoorOpen, Grid3X3, MapPin, Bus, Upload, Download, Plus, Trash2, CheckCircle, ArrowRight, Navigation, Edit3, Users, AlertTriangle } from 'lucide-react';

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

const DEMO_SECTIONS = [
  { id: 'sec_214', name: 'Section 214', tier: 'Upper Tier', capacity: 3200, occupied: 2870, accessible: true, accessPoints: ['Concourse East (ramp)', 'Concourse West (stairs)'] },
  { id: 'sec_112', name: 'Section 112', tier: 'Lower Tier', capacity: 4800, occupied: 4100, accessible: true, accessPoints: ['Concourse West (stairs)', 'Gate A corridor'] },
  { id: 'sec_320', name: 'Section 320', tier: 'Premium Suite', capacity: 480, occupied: 310, accessible: true, accessPoints: ['VIP Elevator E2', 'Concourse East (ramp)'] },
];

const DEMO_EDGES = [
  { id: 'e1', from: 'Gate A', to: 'Concourse West', distance: 100, isAccessible: true, baseCrowd: 1.0 },
  { id: 'e2', from: 'Gate B', to: 'Concourse West', distance: 120, isAccessible: true, baseCrowd: 1.2 },
  { id: 'e3', from: 'Gate D', to: 'Concourse East', distance: 80, isAccessible: true, baseCrowd: 1.0 },
  { id: 'e4', from: 'Concourse West', to: 'Section 214', distance: 150, isAccessible: false, baseCrowd: 1.1 },
  { id: 'e5', from: 'Concourse East', to: 'Section 214', distance: 200, isAccessible: true, baseCrowd: 1.0 },
  { id: 'e6', from: 'Concourse West', to: 'Restroom R2', distance: 50, isAccessible: true, baseCrowd: 1.0 },
  { id: 'e7', from: 'Concourse East', to: 'Medical Desk', distance: 60, isAccessible: true, baseCrowd: 1.0 },
  { id: 'e8', from: 'Gate A', to: 'Metro Exit 3', distance: 300, isAccessible: true, baseCrowd: 1.3 },
  { id: 'e9', from: 'Gate B', to: 'Metro Exit 3', distance: 250, isAccessible: true, baseCrowd: 1.8 },
  { id: 'e10', from: 'Gate D', to: 'Metro Exit 3', distance: 400, isAccessible: true, baseCrowd: 1.1 },
];

const DEMO_NODES = [
  'Gate A', 'Gate B', 'Gate D', 'Section 214', 'Restroom R2',
  'Medical Desk', 'Metro Exit 3', 'Concourse East', 'Concourse West'
];

const TABS = ['Gates', 'Facilities', 'Sections', 'Routes', 'Transport'];

export default function AdminVenuePage() {
  const [activeTab, setActiveTab] = useState('Gates');
  const [gates, setGates] = useState(DEMO_GATES);
  const [facilities, setFacilities] = useState(DEMO_FACILITIES);
  const [sections, setSections] = useState(DEMO_SECTIONS);
  const [edges, setEdges] = useState(DEMO_EDGES);
  const [transport, setTransport] = useState(DEMO_TRANSPORT);
  const [saved, setSaved] = useState(false);
  const [newGateName, setNewGateName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newTransportName, setNewTransportName] = useState('');
  const [newTransportDesc, setNewTransportDesc] = useState('');
  const [newEdgeFrom, setNewEdgeFrom] = useState('Gate A');
  const [newEdgeTo, setNewEdgeTo] = useState('Section 214');
  const [newEdgeDist, setNewEdgeDist] = useState('100');
  const [newEdgeAccessible, setNewEdgeAccessible] = useState(true);

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

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setSections(prev => [...prev, {
      id: `sec_${Date.now()}`,
      name: newSectionName,
      tier: 'General',
      capacity: 2000,
      occupied: 0,
      accessible: false,
      accessPoints: ['Not yet assigned']
    }]);
    setNewSectionName('');
  };
  const handleDeleteSection = (id) => setSections(prev => prev.filter(s => s.id !== id));
  const toggleSectionAccessible = (id) => setSections(prev => prev.map(s => s.id === id ? { ...s, accessible: !s.accessible } : s));

  const handleAddEdge = () => {
    if (newEdgeFrom === newEdgeTo) return;
    const dist = parseInt(newEdgeDist, 10);
    if (isNaN(dist) || dist <= 0) return;
    setEdges(prev => [...prev, {
      id: `e_${Date.now()}`,
      from: newEdgeFrom,
      to: newEdgeTo,
      distance: dist,
      isAccessible: newEdgeAccessible,
      baseCrowd: 1.0
    }]);
  };
  const handleDeleteEdge = (id) => setEdges(prev => prev.filter(e => e.id !== id));
  const toggleEdgeAccessible = (id) => setEdges(prev => prev.map(e => e.id === id ? { ...e, isAccessible: !e.isAccessible } : e));

  const handleAddTransport = () => {
    if (!newTransportName.trim()) return;
    setTransport(prev => [...prev, {
      id: `transport_${Date.now()}`,
      name: newTransportName,
      type: 'transit',
      description: newTransportDesc || 'New transport point — add description'
    }]);
    setNewTransportName('');
    setNewTransportDesc('');
  };
  const handleDeleteTransport = (id) => setTransport(prev => prev.filter(t => t.id !== id));

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

      {/* Sections Manager */}
      {activeTab === 'Sections' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
            <Grid3X3 size={16} className="text-indigo-400" /><span>Section Manager</span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded ml-auto">{sections.length} sections</span>
          </h3>

          {/* Add new section */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="New section name (e.g. Section 415)"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="flex-1 bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-medium focus:border-electricBlue"
            />
            <button
              onClick={handleAddSection}
              className="px-4 py-2.5 bg-electricBlue hover:bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center space-x-1"
            >
              <Plus size={15} /><span>Add</span>
            </button>
          </div>

          {/* Section cards list */}
          <div className="space-y-3">
            {sections.map(sec => {
              const occupancyPct = Math.round((sec.occupied / sec.capacity) * 100);
              const occupancyColor = occupancyPct > 85 ? 'text-criticalRed' : occupancyPct > 60 ? 'text-alertAmber' : 'text-pitchGreen';
              const barColor = occupancyPct > 85 ? 'bg-criticalRed' : occupancyPct > 60 ? 'bg-alertAmber' : 'bg-pitchGreen';
              return (
                <div key={sec.id} className="p-4 rounded-2xl bg-stadiumNavy border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">{sec.name}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{sec.tier}</span>
                      {sec.accessible && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-pitchGreen">♿ Accessible</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <span className="text-[10px] text-slate-400 font-semibold">♿</span>
                        <div
                          onClick={() => toggleSectionAccessible(sec.id)}
                          className={`w-8 h-4 rounded-full cursor-pointer transition-colors relative ${sec.accessible ? 'bg-pitchGreen' : 'bg-slate-700'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${sec.accessible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </label>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-criticalRed rounded-lg transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-slate-400"><Users size={10} className="inline mr-1" />Occupancy</span>
                      <span className={occupancyColor}>{sec.occupied.toLocaleString()} / {sec.capacity.toLocaleString()} ({occupancyPct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${occupancyPct}%` }} />
                    </div>
                  </div>

                  {/* Access points */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Access:</span>
                    {sec.accessPoints.map((ap, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 font-medium">{ap}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Routes Graph Manager */}
      {activeTab === 'Routes' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
            <Navigation size={16} className="text-electricBlue" /><span>Route Graph Manager</span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded ml-auto">{DEMO_NODES.length} nodes · {edges.length} edges</span>
          </h3>

          {/* Principle notice */}
          <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-2xl text-xs text-slate-400 font-medium leading-relaxed flex items-start space-x-2">
            <AlertTriangle size={14} className="text-alertAmber shrink-0 mt-0.5" />
            <span>Edge changes here affect the Dijkstra routing engine immediately. Removing a critical edge may make destinations unreachable. The backend source of truth is <code className="font-mono text-slate-300">routeEngine.js</code>.</span>
          </div>

          {/* Verified nodes display */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Registered Graph Nodes</span>
            <div className="flex flex-wrap gap-2">
              {DEMO_NODES.map(node => {
                let color = 'bg-slate-800 text-slate-300 border-slate-700';
                if (node.startsWith('Gate')) color = 'bg-emerald-500/10 text-pitchGreen border-emerald-500/20';
                else if (node.startsWith('Metro')) color = 'bg-amber-500/10 text-alertAmber border-amber-500/20';
                else if (node.startsWith('Section')) color = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                else if (node.startsWith('Restroom') || node.startsWith('Medical')) color = 'bg-blue-500/10 text-electricBlue border-blue-500/20';
                return (
                  <span key={node} className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border ${color}`}>{node}</span>
                );
              })}
            </div>
          </div>

          {/* Add new edge */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Add Edge Connection</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">From</label>
                <select
                  value={newEdgeFrom}
                  onChange={(e) => setNewEdgeFrom(e.target.value)}
                  className="w-full bg-stadiumNavy border border-slate-700 rounded-lg py-2 px-2 text-xs font-bold text-white outline-none"
                >
                  {DEMO_NODES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">To</label>
                <select
                  value={newEdgeTo}
                  onChange={(e) => setNewEdgeTo(e.target.value)}
                  className="w-full bg-stadiumNavy border border-slate-700 rounded-lg py-2 px-2 text-xs font-bold text-white outline-none"
                >
                  {DEMO_NODES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Distance (m)</label>
                <input
                  type="number"
                  value={newEdgeDist}
                  onChange={(e) => setNewEdgeDist(e.target.value)}
                  className="w-full bg-stadiumNavy border border-slate-700 rounded-lg py-2 px-2 text-xs font-bold text-white outline-none"
                  min="1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase">♿ Accessible</label>
                <button
                  onClick={() => setNewEdgeAccessible(!newEdgeAccessible)}
                  className={`w-full py-2 px-2 rounded-lg text-xs font-bold border transition-all ${newEdgeAccessible ? 'bg-emerald-500/10 border-pitchGreen text-pitchGreen' : 'bg-stadiumNavy border-slate-700 text-slate-400'}`}
                >
                  {newEdgeAccessible ? '✓ Accessible' : '✗ Stairs Only'}
                </button>
              </div>
            </div>
            <button
              onClick={handleAddEdge}
              disabled={newEdgeFrom === newEdgeTo}
              className="px-4 py-2 bg-electricBlue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
            >
              <Plus size={13} /><span>Add Edge</span>
            </button>
          </div>

          {/* Edge list */}
          <div className="space-y-2">
            {edges.map(edge => (
              <div key={edge.id} className="p-3 rounded-xl bg-stadiumNavy border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition-all">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-xs font-bold text-white truncate">{edge.from}</span>
                  <ArrowRight size={12} className="text-slate-500 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{edge.to}</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-electricBlue">{edge.distance}m</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${edge.baseCrowd > 1.5 ? 'bg-red-500/10 text-criticalRed' : edge.baseCrowd > 1.0 ? 'bg-amber-500/10 text-alertAmber' : 'bg-slate-800 text-slate-400'}`}>
                    ×{edge.baseCrowd}
                  </span>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <span className="text-[10px] text-slate-400 font-semibold">♿</span>
                    <div
                      onClick={() => toggleEdgeAccessible(edge.id)}
                      className={`w-8 h-4 rounded-full cursor-pointer transition-colors relative ${edge.isAccessible ? 'bg-pitchGreen' : 'bg-slate-700'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${edge.isAccessible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                  <button
                    onClick={() => handleDeleteEdge(edge.id)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-criticalRed rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transport Manager */}
      {activeTab === 'Transport' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
            <Bus size={16} className="text-alertAmber" /><span>Transport Point Manager</span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded ml-auto">{transport.length} points</span>
          </h3>

          {/* Add transport form */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder="Transport name (e.g. Bus Terminal North)"
              value={newTransportName}
              onChange={(e) => setNewTransportName(e.target.value)}
              className="flex-1 bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-medium focus:border-electricBlue"
            />
            <input
              type="text"
              placeholder="Description"
              value={newTransportDesc}
              onChange={(e) => setNewTransportDesc(e.target.value)}
              className="flex-1 bg-stadiumNavy border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-medium focus:border-electricBlue"
            />
            <button
              onClick={handleAddTransport}
              disabled={!newTransportName.trim()}
              className="px-4 py-2.5 bg-electricBlue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm flex items-center space-x-1 shrink-0 transition-all"
            >
              <Plus size={15} /><span>Add</span>
            </button>
          </div>

          {/* Transport list */}
          <div className="space-y-3">
            {transport.map(t => (
              <div key={t.id} className="p-4 rounded-2xl bg-stadiumNavy border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{t.description}</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-alertAmber bg-amber-500/10 px-2 py-0.5 rounded">{t.type}</span>
                  <button
                    onClick={() => handleDeleteTransport(t.id)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-criticalRed rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
