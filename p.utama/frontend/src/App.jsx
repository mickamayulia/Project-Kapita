import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Upload, 
  MessageSquare, 
  BarChart3, 
  History, 
  Settings, 
  Download, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Send,
  Sparkles,
  RefreshCw,
  User,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [role, setRole] = useState('user');
  const [activeTab, setActiveTab] = useState('chat');
  const [status, setStatus] = useState({ hasApiKey: false, defaultModel: '' });
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState('dots-studio/dots-3-note-preview:free');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [sessionRecords, setSessionRecords] = useState([]);
  const [adminDocs, setAdminDocs] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchRecords();
    fetchDocs();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(API_BASE + '/status');
      const data = await res.json();
      setStatus(data);
      if (data.defaultModel) setSelectedModel(data.defaultModel);
    } catch {
      console.warn('Backend belum aktif.');
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch(API_BASE + '/records/sessions');
      const data = await res.json();
      setSessionRecords(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDocs = async () => {
    try {
      const res = await fetch(API_BASE + '/admin/documents');
      const data = await res.json();
      setAdminDocs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || loading) return;
    setLoading(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(API_BASE + '/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputPrompt, model: selectedModel })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal memproses data.');
      } else {
        setCurrentResult(data);
        fetchRecords();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegister = async () => {
    if (!currentResult || !currentResult.result) return;
    try {
      const res = await fetch(API_BASE + '/registers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentResult.id,
          title: 'Register Risiko — ' + new Date().toLocaleString('id-ID'),
          daftar_risiko: currentResult.result.daftar_risiko,
          status: 'final'
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (!currentResult || !currentResult.result || !currentResult.result.daftar_risiko) return;
    const items = currentResult.result.daftar_risiko;
    const headers = ['ID', 'Deskripsi', 'Kategori', 'Likelihood', 'Impact', 'Skor', 'Tingkat', 'Mitigasi', 'Pemilik', 'Sumber'];
    const rows = items.map(r => [
      '"' + r.id + '"',
      '"' + (r.deskripsi || '').replace(/"/g, '""') + '"',
      '"' + r.kategori + '"',
      r.likelihood !== null ? r.likelihood : 'null',
      r.impact !== null ? r.impact : 'null',
      r.skor !== null ? r.skor : 'null',
      '"' + r.tingkat + '"',
      '"' + (r.mitigasi || '').replace(/"/g, '""') + '"',
      '"' + r.pemilik + '"',
      '"' + (r.sumber || []).join('; ') + '"'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Risk_Register_' + Date.now() + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!currentResult || !currentResult.result) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentResult.result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'Risk_Register_' + Date.now() + '.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    try {
      const res = await fetch(API_BASE + '/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newDocTitle, type: 'referensi_internal' })
      });
      if (res.ok) {
        setNewDocTitle('');
        fetchDocs();
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE + '/config/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput, model: selectedModel })
      });
      if (res.ok) {
        alert('Pengaturan OpenRouter tersimpan!');
        fetchStatus();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const getChartData = () => {
    if (!currentResult || !currentResult.result || !currentResult.result.daftar_risiko) return [];
    const counts = { 'tinggi': 0, 'sedang': 0, 'rendah': 0, 'perlu_verifikasi': 0 };
    currentResult.result.daftar_risiko.forEach(r => {
      if (counts[r.tingkat] !== undefined) counts[r.tingkat]++;
      else counts['perlu_verifikasi']++;
    });

    return [
      { name: 'Tinggi (15-25)', count: counts.tinggi, color: '#ef4444' },
      { name: 'Sedang (7-14)', count: counts.sedang, color: '#f59e0b' },
      { name: 'Rendah (1-6)', count: counts.rendah, color: '#10b981' },
      { name: 'Perlu Verifikasi', count: counts.perlu_verifikasi, color: '#6b7280' }
    ];
  };

  const chartData = getChartData();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <header style={{ 
        borderBottom: '1px solid var(--card-border)', 
        background: 'rgba(11, 15, 25, 0.9)', 
        backdropFilter: 'blur(12px)',
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', 
            padding: '8px', 
            borderRadius: '10px', 
            display: 'flex' 
          }}>
            <ShieldAlert size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              <span style={{ color: 'var(--accent-cyan)' }}>RiskRegen</span> Assistant
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Asisten Register Risiko TI Berbasis AI & Grounding ISO/COBIT
            </p>
          </div>
        </div>

        {/* Role & Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '3px', 
            borderRadius: '8px', 
            border: '1px solid var(--card-border)' 
          }}>
            <button 
              onClick={() => { setRole('user'); setActiveTab('chat'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: role === 'user' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                color: role === 'user' ? '#60a5fa' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              <User size={13} /> Staf / User
            </button>
            <button 
              onClick={() => { setRole('admin'); setActiveTab('admin-docs'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: role === 'admin' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                color: role === 'admin' ? '#c084fc' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              <ShieldCheck size={13} /> Admin
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setActiveTab('chat')}
              style={{ background: activeTab === 'chat' ? 'rgba(255,255,255,0.12)' : 'transparent', fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <MessageSquare size={14} /> Analisis
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setActiveTab('records')}
              style={{ background: activeTab === 'records' ? 'rgba(255,255,255,0.12)' : 'transparent', fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <History size={14} /> Record ({sessionRecords.length})
            </button>
            {role === 'admin' && (
              <button 
                className="btn-secondary" 
                onClick={() => setActiveTab('admin-docs')}
                style={{ background: activeTab === 'admin-docs' ? 'rgba(255,255,255,0.12)' : 'transparent', fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Upload size={14} /> Dokumen ({adminDocs.length})
              </button>
            )}
            <button 
              className="btn-secondary" 
              onClick={() => setActiveTab('settings')}
              style={{ background: activeTab === 'settings' ? 'rgba(255,255,255,0.12)' : 'transparent', fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main style={{ flex: 1, padding: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>

        {/* TAB 1: CHAT & ANALYSIS */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: currentResult ? '380px 1fr' : '1fr', gap: '20px' }}>
            
            {/* Left Panel */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--accent-cyan)" />
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Input Catatan Insiden</h2>
                </div>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    color: '#cbd5e1',
                    border: '1px solid var(--card-border)',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    fontSize: '0.72rem'
                  }}
                >
                  <option value="dots-studio/dots-3-note-preview:free">⚡ Dots 3 Note (Super Cepat ~0.5s / Free)</option>
                  <option value="cohere/north-mini-code:free">⚡ Cohere North Mini (Cepat ~0.7s / Free)</option>
                  <option value="nvidia/nemotron-3.5-lightning:free">Nvidia Nemotron 3.5 (Gratis)</option>
                  <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (der.txt - Berbayar)</option>
                </select>
              </div>

              <textarea 
                rows={7}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Tuliskan catatan insiden/keluhan operasional..."
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Uji Cepat (dari 17 Kasus Uji):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <button 
                    type="button" 
                    onClick={() => setInputPrompt('Server aplikasi utama down 3x sebulan karena memori habis.')}
                    style={{ fontSize: '0.7rem', padding: '3px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: '#93c5fd', borderRadius: '4px' }}
                  >
                    TC-01: Server Down
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setInputPrompt('Password admin server masih pakai bawaan pabrik.')}
                    style={{ fontSize: '0.7rem', padding: '3px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: '#93c5fd', borderRadius: '4px' }}
                  >
                    TC-02: Password Default
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setInputPrompt('Sistem sering error, kadang normal, tergantung beban.')}
                    style={{ fontSize: '0.7rem', padding: '3px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', color: '#fcd34d', borderRadius: '4px' }}
                  >
                    TC-09: Ambigu (Null)
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={loading || !inputPrompt.trim()}
                className="btn-primary" 
                style={{ justifyContent: 'center', marginTop: '10px' }}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? 'Menganalisis...' : 'Ekstrak Register Risiko'}
              </button>
            </div>

            {/* Right Panel: Output & Charts */}
            {currentResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Header Summary & Action */}
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontWeight: 700,
                      background: currentResult.result?.status === 'sukses' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: currentResult.result?.status === 'sukses' ? '#34d399' : '#f87171'
                    }}>
                      STATUS: {currentResult.result?.status ? currentResult.result.status.toUpperCase() : 'SELESAI'}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '4px' }}>
                      {currentResult.result?.ringkasan}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-secondary" onClick={handleExportCSV} style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
                      <Download size={14} /> CSV
                    </button>
                    <button className="btn-secondary" onClick={handleExportJSON} style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
                      <FileText size={14} /> JSON
                    </button>
                    <button 
                      onClick={handleSaveRegister}
                      className="btn-primary" 
                      style={{ fontSize: '0.75rem', padding: '6px 12px', background: saveSuccess ? '#059669' : undefined }}
                    >
                      {saveSuccess ? <CheckCircle2 size={14} /> : <Save size={14} />} 
                      {saveSuccess ? 'Tersimpan (Final)' : 'Simpan Register'}
                    </button>
                  </div>
                </div>

                {/* Bar Chart */}
                {currentResult.result?.daftar_risiko && currentResult.result.daftar_risiko.length > 0 && (
                  <div className="glass-panel" style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <BarChart3 size={16} color="var(--accent-blue)" />
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Distribusi Skor Risiko</h4>
                    </div>
                    <div style={{ width: '100%', height: 140 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <XAxis type="number" stroke="#6b7280" />
                          <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={120} />
                          <Tooltip contentStyle={{ background: '#111827', borderColor: '#374151' }} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={'cell-' + index} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px' }}>ID</th>
                        <th style={{ padding: '8px' }}>Deskripsi</th>
                        <th style={{ padding: '8px' }}>Kategori</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>L × I</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Skor</th>
                        <th style={{ padding: '8px' }}>Tingkat</th>
                        <th style={{ padding: '8px' }}>Mitigasi</th>
                        <th style={{ padding: '8px' }}>Pemilik</th>
                        <th style={{ padding: '8px' }}>Sumber</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResult.result?.daftar_risiko && currentResult.result.daftar_risiko.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{r.id}</td>
                          <td style={{ padding: '10px 8px', maxWidth: '220px' }}>{r.deskripsi}</td>
                          <td style={{ padding: '10px 8px' }}>{r.kategori}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                            {r.likelihood !== null ? (r.likelihood + ' × ' + r.impact) : '-'}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {r.skor !== null ? r.skor : '-'}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <span style={{ 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem', 
                              fontWeight: 700,
                              background: r.tingkat === 'tinggi' ? 'rgba(239, 68, 68, 0.2)' : r.tingkat === 'sedang' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: r.tingkat === 'tinggi' ? '#f87171' : r.tingkat === 'sedang' ? '#fbbf24' : '#34d399'
                            }}>
                              {r.tingkat ? r.tingkat.toUpperCase() : ''}
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', maxWidth: '200px' }}>
                            {r.mitigasi === 'Tidak ditemukan di dokumen rujukan' ? (
                              <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={12} /> {r.mitigasi}
                              </span>
                            ) : r.mitigasi}
                          </td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{r.pemilik}</td>
                          <td style={{ padding: '10px 8px' }}>
                            {r.sumber && r.sumber.map((s, idx) => (
                              <span key={idx} style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', padding: '2px 4px', borderRadius: '3px', marginRight: '4px' }}>
                                {s}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECORDS */}
        {activeTab === 'records' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Riwayat Record Analisis Risiko</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Record riwayat fleksibel terdahulu dan masa depan yang siap dipantau dan diaudit.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sessionRecords.map((rec) => (
                <div key={rec.id} className="glass-card" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{rec.id} • {new Date(rec.timestamp).toLocaleString('id-ID')}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rec.modelUsed}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px', fontWeight: 600 }}>"{rec.userQuery}"</p>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.72rem', padding: '4px 8px', marginTop: '8px' }}
                    onClick={() => { setCurrentResult(rec); setActiveTab('chat'); }}
                  >
                    Buka Hasil Analisis
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN DOCS */}
        {activeTab === 'admin-docs' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Knowledge Base Dokumen Rujukan (Admin)</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Daftar 8 dokumen standar rujukan (K=11) dan modul upload untuk penambahan dokumen internal baru.
            </p>
            <form onSubmit={handleAddDocument} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                value={newDocTitle} 
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Judul dokumen rujukan internal baru..."
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', padding: '8px 12px', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                <Upload size={14} /> Tambah Dokumen
              </button>
            </form>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {adminDocs.map((doc) => (
                <div key={doc.id} className="glass-card" style={{ padding: '12px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>{doc.id}</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>{doc.title}</h4>
                  <span style={{ fontSize: '0.68rem', color: '#c084fc', display: 'block', marginTop: '6px' }}>{doc.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Pengaturan API OpenRouter</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Masukkan API Key dari OpenRouter agar sistem dapat memanggil model AI (Gemini Flash Lite, DeepSeek, dsb).
            </p>

            {/* Quick Link Info Box */}
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              border: '1px solid rgba(59, 130, 246, 0.25)', 
              borderRadius: '8px', 
              padding: '12px 16px', 
              marginBottom: '16px',
              fontSize: '0.8rem'
            }}>
              <span style={{ fontWeight: 600, color: '#93c5fd', display: 'block', marginBottom: '4px' }}>
                🔗 Belum punya atau ingin mengambil API Key?
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Buka dan buat API key di: {' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  openrouter.ai/keys
                </a>
              </span>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  OpenRouter API Key:
                </label>
                <input 
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', padding: '10px 12px', borderRadius: '6px', color: 'white', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                />
                <span style={{ fontSize: '0.72rem', color: status.hasApiKey ? '#34d399' : '#f87171', display: 'block', marginTop: '6px' }}>
                  {status.hasApiKey ? '✅ API Key sudah aktif tersimpan di server.' : '⚠️ Belum ada API Key tersimpan. Masukkan key lalu klik Simpan.'}
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Model AI Default:
                </label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', padding: '8px 10px', borderRadius: '6px', color: 'white', fontSize: '0.82rem' }}
                >
                  <option value="dots-studio/dots-3-note-preview:free">dots-studio/dots-3-note-preview:free (Super Cepat ~0.5s / Free)</option>
                  <option value="cohere/north-mini-code:free">cohere/north-mini-code:free (Cepat ~0.7s / Free)</option>
                  <option value="nvidia/nemotron-3.5-lightning:free">nvidia/nemotron-3.5-lightning:free (Gratis)</option>
                  <option value="google/gemini-2.5-flash-lite">google/gemini-2.5-flash-lite (Berbayar - der.txt)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                <Save size={14} /> Simpan Pengaturan
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
