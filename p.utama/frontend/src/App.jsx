import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  XCircle,
  X
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
  const [newDocType, setNewDocType] = useState('kebijakan_internal');
  const [newDocContent, setNewDocContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // Document yang sedang dibuka di modal
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);

  // Helper untuk notifikasi toast custom sesuai tema
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    fetchStatus();
    fetchRecords();
    fetchDocs();
  }, []);

  // Kunci scroll halaman belakang ketika modal preview dokumen dibuka
  useEffect(() => {
    if (previewDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewDoc]);

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
        showToast(data.error || 'Gagal memproses data analisis.', 'error');
      } else {
        setCurrentResult(data);
        fetchRecords();
        showToast('Analisis risiko berhasil dibuat!', 'success');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
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
        showToast('Register risiko berhasil disimpan ke database!', 'success');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        showToast('Gagal menyimpan register risiko.', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
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
      '"' + (Array.isArray(r.sumber) ? r.sumber.map(s => {
        if (typeof s === 'object' && s !== null) {
          return `${s.dokumen || ''} [${s.bagian || ''}]: "${s.kutipan || ''}"`;
        }
        return String(s);
      }).join(' | ') : '') + '"'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Risk_Register_' + Date.now() + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor CSV berhasil diunduh!', 'success');
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
    showToast('Ekspor JSON berhasil diunduh!', 'success');
  };

  // Admin add document (Support File Upload atau Tulis Teks Dokumen Sendiri)
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDocTitle.trim() && !selectedFile) {
      showToast("Harap masukkan judul atau pilih file dokumen.", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newDocTitle.trim() || (selectedFile ? selectedFile.name : 'Dokumen Baru'));
      formData.append('type', newDocType);
      if (newDocContent) formData.append('content', newDocContent);
      if (selectedFile) formData.append('file', selectedFile);

      const res = await fetch(API_BASE + '/admin/documents', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setNewDocTitle('');
        setNewDocContent('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset nilai input elemen file di browser
        }
        showToast("Dokumen rujukan berhasil diunggah!", "success");
        fetchDocs();
      } else {
        const err = await res.json();
        showToast("Gagal: " + (err.error || "Terjadi kesalahan upload"), "error");
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  // View Document (Preview modal langsung tanpa download, bisa dipanggil dari Admin atau dari Hasil Analisis)
  const handleViewDocument = async (idOrTitle) => {
    setPreviewLoading(true);
    try {
      // Cari apakah idOrTitle adalah ID atau sebagian dari judul dokumen
      let targetId = idOrTitle;
      const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSearch = normalize(idOrTitle);

      const matched = adminDocs.find(d => {
        const idNorm = normalize(d.id);
        const titleNorm = normalize(d.title);
        const fileNorm = normalize(d.originalName);
        return idNorm === cleanSearch || 
               titleNorm === cleanSearch || 
               titleNorm.includes(cleanSearch) || 
               cleanSearch.includes(titleNorm) ||
               fileNorm.includes(cleanSearch) ||
               cleanSearch.includes(fileNorm);
      });

      if (matched) {
        targetId = matched.id;
      }

      const res = await fetch(API_BASE + '/admin/documents/' + encodeURIComponent(targetId) + '/view');
      const contentType = res.headers.get('content-type') || '';
      
      if (!contentType.includes('application/json')) {
        showToast('Format respon server bukan JSON yang valid.', 'error');
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setPreviewDoc(data);
      } else {
        showToast(data.error || "Gagal memuat isi dokumen.", "error");
      }
    } catch (e) {
      showToast("Error memuat dokumen: " + e.message, "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Admin Delete Document
  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(API_BASE + '/admin/documents/' + id, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDocs();
        if (previewDoc?.id === id) setPreviewDoc(null);
        showToast("Dokumen rujukan berhasil dihapus.", "success");
      } else {
        showToast("Gagal menghapus dokumen.", "error");
      }
    } catch (e) {
      showToast("Error: " + e.message, "error");
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
        showToast('Pengaturan OpenRouter berhasil tersimpan!', 'success');
        fetchStatus();
      } else {
        showToast('Gagal menyimpan pengaturan.', 'error');
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
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

                {/* Peta Matriks Distribusi Risiko 5x5 Interaktif per ID Risiko */}
                {currentResult.result?.daftar_risiko && currentResult.result.daftar_risiko.length > 0 && (
                  <div className="glass-panel" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '8px' }}>
                          <BarChart3 size={18} color="var(--accent-cyan)" />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                            Pemetaan Distribusi Matriks Risiko (5 × 5)
                          </h4>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                            Pemetaan posisi setiap ID Risiko berdasarkan Likelihood (Kemungkinan) × Impact (Dampak).
                          </p>
                        </div>
                      </div>

                      {/* Legenda Warna */}
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span> Tinggi (15-25)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span> Sedang (7-14)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span> Rendah (1-6)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(107, 114, 128, 0.15)', border: '1px solid rgba(107, 114, 128, 0.3)', color: '#9ca3af' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b7280' }}></span> Perlu Verifikasi
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 280px', gap: '20px', alignItems: 'start' }}>
                      {/* Grid Matriks 5x5 */}
                      <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Sumbu Y Label: Impact */}
                          <div style={{ 
                            writingMode: 'vertical-rl', 
                            transform: 'rotate(180deg)', 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            color: 'var(--accent-cyan)',
                            letterSpacing: '1px',
                            textAlign: 'center'
                          }}>
                            ▲ IMPACT (DAMPAK)
                          </div>

                          <div style={{ flex: 1, minWidth: '280px' }}>
                            <div style={{ display: 'grid', gridTemplateRows: 'repeat(5, 1fr)', gap: '4px' }}>
                              {[5, 4, 3, 2, 1].map((impactVal) => (
                                <div key={impactVal} style={{ display: 'grid', gridTemplateColumns: '32px repeat(5, 1fr)', gap: '4px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>
                                    I = {impactVal}
                                  </span>

                                  {[1, 2, 3, 4, 5].map((likelihoodVal) => {
                                    const cellScore = likelihoodVal * impactVal;
                                    let cellBg = 'rgba(16, 185, 129, 0.08)'; // Rendah
                                    let cellBorder = 'rgba(16, 185, 129, 0.2)';
                                    if (cellScore >= 15) {
                                      cellBg = 'rgba(239, 68, 68, 0.12)'; // Tinggi
                                      cellBorder = 'rgba(239, 68, 68, 0.3)';
                                    } else if (cellScore >= 7) {
                                      cellBg = 'rgba(245, 158, 11, 0.1)'; // Sedang
                                      cellBorder = 'rgba(245, 158, 11, 0.25)';
                                    }

                                    // Ambil risiko yang menempati sel ini
                                    const risksInCell = currentResult.result.daftar_risiko.filter(
                                      r => Number(r.likelihood) === likelihoodVal && Number(r.impact) === impactVal
                                    );

                                    return (
                                      <div
                                        key={likelihoodVal}
                                        style={{
                                          background: cellBg,
                                          border: `1px solid ${cellBorder}`,
                                          borderRadius: '6px',
                                          minHeight: '44px',
                                          padding: '4px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '3px',
                                          position: 'relative'
                                        }}
                                      >
                                        <span style={{ position: 'absolute', top: 2, right: 3, fontSize: '0.55rem', color: '#64748b' }}>
                                          {cellScore}
                                        </span>

                                        {/* Pin/Badge untuk setiap ID Risiko */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
                                          {risksInCell.map(r => {
                                            const badgeColor = r.tingkat === 'tinggi' ? '#ef4444' : r.tingkat === 'sedang' ? '#f59e0b' : '#10b981';
                                            return (
                                              <span
                                                key={r.id}
                                                title={`${r.id}: ${r.deskripsi} (Skor: ${r.skor || cellScore})`}
                                                style={{
                                                  fontSize: '0.65rem',
                                                  fontWeight: 800,
                                                  background: badgeColor,
                                                  color: '#ffffff',
                                                  padding: '1px 5px',
                                                  borderRadius: '4px',
                                                  boxShadow: `0 0 6px ${badgeColor}66`,
                                                  cursor: 'pointer'
                                                }}
                                              >
                                                {r.id}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>

                            {/* Sumbu X Label: Likelihood */}
                            <div style={{ display: 'grid', gridTemplateColumns: '32px repeat(5, 1fr)', gap: '4px', marginTop: '6px' }}>
                              <span></span>
                              {[1, 2, 3, 4, 5].map(l => (
                                <span key={l} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textAlign: 'center' }}>
                                  L = {l}
                                </span>
                              ))}
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px', letterSpacing: '1px' }}>
                              LIKELIHOOD (KEMUNGKINAN) ►
                            </div>
                          </div>
                        </div>

                        {/* Risiko Perlu Verifikasi (Ambigu / Null) */}
                        {(() => {
                          const unverified = currentResult.result.daftar_risiko.filter(
                            r => r.likelihood == null || r.impact == null || r.tingkat === 'perlu_verifikasi'
                          );
                          if (unverified.length === 0) return null;
                          return (
                            <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(107, 114, 128, 0.12)', border: '1px dashed rgba(156, 163, 175, 0.3)', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>
                                ⚠️ Risiko Tanpa Titik Matriks Pasti (Perlu Verifikasi Data):
                              </span>
                              <div style={{ display: 'inline-flex', gap: '6px', marginLeft: '8px' }}>
                                {unverified.map(r => (
                                  <span key={r.id} style={{ fontSize: '0.65rem', background: '#4b5563', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    {r.id} (Ambigu)
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Bar Ringkasan & Panduan Lokasi ID */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '10px' }}>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                            Daftar Titik Sebaran per ID:
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                            {currentResult.result.daftar_risiko.map(r => {
                              const badgeColor = r.tingkat === 'tinggi' ? '#ef4444' : r.tingkat === 'sedang' ? '#f59e0b' : r.tingkat === 'rendah' ? '#10b981' : '#6b7280';
                              return (
                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', padding: '4px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                    <span style={{ background: badgeColor, color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, fontSize: '0.65rem' }}>
                                      {r.id}
                                    </span>
                                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px', color: '#e2e8f0' }}>
                                      {r.deskripsi}
                                    </span>
                                  </div>
                                  <span style={{ fontWeight: 700, color: badgeColor, fontFamily: 'var(--font-mono)' }}>
                                    {r.likelihood !== null ? `(L${r.likelihood}, I${r.impact})` : 'Perlu Verifikasi'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Chart Ringkasan Kecil */}
                        <div style={{ width: '100%', height: 110 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                              <XAxis type="number" stroke="#6b7280" fontSize={10} />
                              <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} width={100} />
                              <Tooltip contentStyle={{ background: '#111827', borderColor: '#374151', fontSize: '0.75rem' }} />
                              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell key={'cell-' + index} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
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
                          <td style={{ padding: '10px 8px', maxWidth: '280px' }}>
                            {r.sumber && r.sumber.map((s, idx) => {
                              const isObj = typeof s === 'object' && s !== null;
                              const docName = isObj ? s.dokumen : s;
                              const section = isObj ? s.bagian : null;
                              const quote = isObj ? s.kutipan : null;

                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => handleViewDocument(docName)}
                                  style={{ 
                                    marginBottom: '6px', 
                                    background: 'rgba(59, 130, 246, 0.08)', 
                                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                                    borderRadius: '6px', 
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)'}
                                  title="Klik untuk membaca dokumen rujukan ini"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#93c5fd' }}>
                                      📚 {docName} ↗
                                    </span>
                                    {section && (
                                      <span style={{ fontSize: '0.65rem', color: '#c084fc', background: 'rgba(139, 92, 246, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                                        {section}
                                      </span>
                                    )}
                                  </div>
                                  {quote && (
                                    <p style={{ 
                                      fontSize: '0.68rem', 
                                      color: '#cbd5e1', 
                                      fontStyle: 'italic', 
                                      marginTop: '4px', 
                                      borderLeft: '2px solid var(--accent-cyan)', 
                                      paddingLeft: '6px',
                                      lineHeight: 1.3 
                                    }}>
                                      "{quote}"
                                    </p>
                                  )}
                                </div>
                              );
                            })}
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
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Knowledge Base Dokumen Rujukan (Admin Role)</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Kelola dokumen rujukan ISO/COBIT dan unggah dokumen kebijakan/SOP milik sendiri untuk dibaca langsung di browser.
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.2)', color: '#d8b4fe', padding: '4px 10px', borderRadius: '6px' }}>
                Total: {adminDocs.length} Dokumen
              </span>
            </div>

            {/* Form Tambah Dokumen (Pilih File atau Ketik Konten Sendiri) */}
            <div className="glass-card" style={{ padding: '18px', marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#c084fc' }}>
                + Unggah Dokumen Rujukan Sendiri
              </h3>
              <form onSubmit={handleAddDocument} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={newDocTitle} 
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Judul Dokumen (misal: SOP Pemulihan Bencana & Insiden Server 2026)"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', padding: '10px 12px', borderRadius: '6px', color: 'white', fontSize: '0.82rem' }}
                  />
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', padding: '10px 12px', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.82rem' }}
                  >
                    <option value="kebijakan_internal">Kebijakan Internal</option>
                    <option value="insiden_historis">Catatan Insiden</option>
                    <option value="standar">Standar / Framework</option>
                    <option value="template">Template Register</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Opsi 1: Upload File */}
                  <div style={{ border: '1px dashed var(--card-border)', padding: '12px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📁 Opsi 1: Pilih File dari Komputer (.txt, .md, .json, .csv, .pdf)
                      </label>
                      {selectedFile && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                        >
                          ✕ Batal Pilih
                        </button>
                      )}
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      style={{ fontSize: '0.78rem', color: '#93c5fd', width: '100%' }}
                    />
                    {selectedFile && (
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px', display: 'block' }}>
                        ✓ File terpilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>

                  {/* Opsi 2: Tulis Konten Langsung */}
                  <div>
                    <textarea 
                      rows={3}
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                      placeholder="✍️ Opsi 2: Atau tulis/tempel isi dokumen/kebijakan langsung di sini..."
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '6px', color: 'white', fontSize: '0.8rem', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 18px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                    <Upload size={14} /> Simpan & Daftarkan Dokumen
                  </button>
                </div>
              </form>
            </div>

            {/* List Dokumen Terdaftar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {adminDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '16px', 
                    cursor: 'pointer',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    border: previewDoc?.id === doc.id ? '1px solid var(--accent-cyan)' : undefined
                  }}
                  onClick={() => handleViewDocument(doc.id)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{doc.id}</span>
                      <span style={{ fontSize: '0.68rem', background: 'rgba(139, 92, 246, 0.2)', color: '#d8b4fe', padding: '2px 8px', borderRadius: '4px' }}>
                        {doc.type}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '8px', lineHeight: 1.4 }}>
                      {doc.title}
                    </h4>
                    {doc.originalName && (
                      <span style={{ fontSize: '0.72rem', color: '#93c5fd', display: 'block', marginTop: '4px' }}>
                        📎 File: {doc.originalName}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button 
                      type="button"
                      className="btn-secondary" 
                      style={{ fontSize: '0.72rem', padding: '4px 10px', color: '#38bdf8' }}
                      onClick={(e) => { e.stopPropagation(); handleViewDocument(doc.id); }}
                    >
                      👁️ Baca Dokumen
                    </button>
                    <button 
                      type="button"
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', padding: '4px' }}
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      title="Hapus Dokumen"
                    >
                      Hapus
                    </button>
                  </div>
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

      {/* MODAL PREVIEW DOKUMEN: POSISI FIXED DI TENGAH LAYAR & TIDAK IKUT SCROLL (GLOBAL OVERLAY) */}
      {previewDoc && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={(e) => {
            // Tutup jika user mengklik backdrop di luar kotak modal
            if (e.target === e.currentTarget) {
              setPreviewDoc(null);
            }
          }}
        >
          <div 
            className="glass-panel" 
            style={{
              width: '92vw',
              maxWidth: '1000px',
              height: '88vh',
              maxHeight: '900px',
              display: 'flex',
              flexDirection: 'column',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '16px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.08)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.8)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(6, 182, 212, 0.15)', 
                    color: 'var(--accent-cyan)', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}>
                    {previewDoc.id}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    • Tipe: {previewDoc.type ? previewDoc.type.replace('_', ' ') : 'Dokumen'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  {previewDoc.title}
                </h3>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  color: '#f8fafc', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ✕ Tutup
              </button>
            </div>

            {/* Modal Content Reader (PDF Viewer atau Text Viewer) */}
            <div style={{ 
              padding: '20px', 
              overflowY: 'auto', 
              flex: 1, 
              display: 'flex',
              flexDirection: 'column',
              background: '#0b0f19'
            }}>
              {previewLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                  <RefreshCw className="spin" size={24} style={{ marginRight: '8px' }} /> Memuat isi dokumen...
                </div>
              ) : previewDoc.fileUrl ? (
                /* Tampilkan PDF langsung di browser tanpa download */
                <iframe 
                  src={previewDoc.fileUrl} 
                  title={previewDoc.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    flex: 1, 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    background: '#1e293b' 
                  }}
                />
              ) : previewDoc.content ? (
                /* Tampilkan teks/markdown langsung */
                <div style={{ 
                  background: 'rgba(17, 24, 39, 0.8)', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.85rem', 
                  lineHeight: 1.7,
                  color: '#e2e8f0',
                  overflowY: 'auto',
                  flex: 1
                }}>
                  {previewDoc.content}
                </div>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>📄 Dokumen Terdaftar</p>
                  <p style={{ fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                    Dokumen ini terdaftar sebagai metadata acuan kerangka risiko baku (ISO/COBIT). Anda dapat mengunggah file PDF atau file teks rujukan kapan saja melalui formulir unggah.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ 
              padding: '12px 24px', 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '0.78rem', 
              color: 'var(--text-muted)',
              background: 'rgba(15, 23, 42, 0.9)'
            }}>
              <span>
                Diunggah pada: {previewDoc.uploadedAt ? new Date(previewDoc.uploadedAt).toLocaleString('id-ID') : '-'}
                {previewDoc.originalName ? ` • (${previewDoc.originalName})` : ''}
              </span>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.78rem', padding: '6px 16px', fontWeight: 600 }}
                onClick={() => setPreviewDoc(null)}
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER (MENGIKUTI TEMA DARK GLASSMORPHISM) */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const borderColor = isSuccess ? '#10b981' : isError ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';
          const bgColor = isSuccess ? 'rgba(6, 78, 59, 0.9)' : isError ? 'rgba(127, 29, 29, 0.9)' : isWarning ? 'rgba(120, 53, 15, 0.9)' : 'rgba(30, 58, 138, 0.9)';
          const iconColor = isSuccess ? '#34d399' : isError ? '#f87171' : isWarning ? '#fbbf24' : '#60a5fa';

          return (
            <div
              key={toast.id}
              className="animate-toast"
              style={{
                pointerEvents: 'auto',
                background: bgColor,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#f9fafb',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isSuccess && <CheckCircle2 size={18} style={{ color: iconColor, flexShrink: 0 }} />}
                {isError && <XCircle size={18} style={{ color: iconColor, flexShrink: 0 }} />}
                {isWarning && <AlertTriangle size={18} style={{ color: iconColor, flexShrink: 0 }} />}
                <span style={{ lineHeight: 1.4, fontWeight: 500 }}>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
