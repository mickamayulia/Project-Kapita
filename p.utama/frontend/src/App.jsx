import React, { useState, useEffect, useRef } from 'react';

// Subkomponen Terpisah
import LoginPortal from './components/LoginPortal';
import Navbar from './components/Navbar';
import AnalysisView from './components/AnalysisView';
import RecordsView from './components/RecordsView';
import AdminDocsView from './components/AdminDocsView';
import SettingsView from './components/SettingsView';
import { DocumentModal, ToastContainer } from './components/DocumentModal';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
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
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);

  // Helper untuk notifikasi toast custom sesuai tema
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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

    try {
      const res = await fetch(API_BASE + '/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputPrompt, model: selectedModel })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentResult(data);
        fetchRecords();
        showToast('Analisis risiko berhasil diekstraksi!', 'success');
      } else {
        showToast(data.error || 'Terjadi kesalahan analisis', 'error');
      }
    } catch (e) {
      showToast('Error koneksi: ' + e.message, 'error');
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
        const err = await res.json();
        showToast(err.error || 'Gagal menyimpan register', 'error');
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  const handleExportCSV = () => {
    if (!currentResult || !currentResult.result || !currentResult.result.daftar_risiko) return;
    const items = currentResult.result.daftar_risiko;
    const headers = [
      'ID',
      'Kategori',
      'Pernyataan Risiko',
      'Penyebab',
      'Dampak',
      'Likelihood',
      'Impact',
      'Inherent Risk',
      'Rencana Mitigasi',
      'Status Verifikasi'
    ];
    const rows = items.map((r) => [
      r.id_risiko,
      `"${r.kategori || ''}"`,
      `"${(r.pernyataan_risiko || '').replace(/"/g, '""')}"`,
      `"${(r.penyebab || '').replace(/"/g, '""')}"`,
      `"${(r.dampak || '').replace(/"/g, '""')}"`,
      r.likelihood ?? 'N/A',
      r.impact ?? 'N/A',
      r.inherent_risk ?? 'N/A',
      `"${(r.mitigasi || '').replace(/"/g, '""')}"`,
      `"${r.status_verifikasi || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RiskRegister_${currentResult.id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!currentResult) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentResult, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `RiskRegister_${currentResult.id || 'export'}.json`);
    dlAnchorElem.click();
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      showToast('Judul dokumen wajib diisi!', 'warning');
      return;
    }

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', newDocTitle);
        formData.append('type', newDocType);
        formData.append('content', newDocContent);

        res = await fetch(API_BASE + '/admin/documents/upload', {
          method: 'POST',
          body: formData
        });
      } else {
        if (!newDocContent.trim()) {
          showToast('Isi dokumen atau pilih file wajib dilampirkan!', 'warning');
          return;
        }
        res = await fetch(API_BASE + '/admin/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newDocTitle,
            type: newDocType,
            content: newDocContent
          })
        });
      }

      if (res.ok) {
        setNewDocTitle('');
        setNewDocContent('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocs();
        showToast('Dokumen berhasil didaftarkan dan diekstrak untuk RAG!', 'success');
      } else {
        const err = await res.json();
        showToast('Gagal: ' + (err.error || 'Terjadi kesalahan upload'), 'error');
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  const handleViewDocument = async (idOrTitle) => {
    setPreviewLoading(true);
    try {
      let targetId = idOrTitle;
      const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSearch = normalize(idOrTitle);

      const matched = adminDocs.find((d) => {
        const idNorm = normalize(d.id);
        const titleNorm = normalize(d.title);
        const fileNorm = normalize(d.originalName);
        return (
          idNorm === cleanSearch ||
          titleNorm === cleanSearch ||
          titleNorm.includes(cleanSearch) ||
          cleanSearch.includes(titleNorm) ||
          fileNorm.includes(cleanSearch) ||
          cleanSearch.includes(fileNorm)
        );
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
        showToast(data.error || 'Gagal memuat isi dokumen.', 'error');
      }
    } catch (e) {
      showToast('Error memuat dokumen: ' + e.message, 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(API_BASE + '/admin/documents/' + id, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDocs();
        if (previewDoc?.id === id) setPreviewDoc(null);
        showToast('Dokumen rujukan berhasil dihapus.', 'success');
      } else {
        showToast('Gagal menghapus dokumen.', 'error');
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
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
    const counts = { tinggi: 0, sedang: 0, rendah: 0, perlu_verifikasi: 0 };
    currentResult.result.daftar_risiko.forEach((r) => {
      const score = Number(r.inherent_risk);
      if (r.status_verifikasi && r.status_verifikasi.includes('Perlu Verifikasi')) {
        counts.perlu_verifikasi++;
      } else if (score >= 15) {
        counts.tinggi++;
      } else if (score >= 7) {
        counts.sedang++;
      } else if (score >= 1) {
        counts.rendah++;
      } else {
        counts.perlu_verifikasi++;
      }
    });
    return [
      { name: 'Tinggi (15-25)', count: counts.tinggi, color: '#ef4444' },
      { name: 'Sedang (7-14)', count: counts.sedang, color: '#f59e0b' },
      { name: 'Rendah (1-6)', count: counts.rendah, color: '#10b981' },
      { name: 'Perlu Verifikasi', count: counts.perlu_verifikasi, color: '#6b7280' }
    ];
  };

  const chartData = getChartData();

  // 1. TAMPILAN LOGIN PORTAL
  if (!isLoggedIn) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <LoginPortal
          role={role}
          setRole={setRole}
          loginUsername={loginUsername}
          setLoginUsername={setLoginUsername}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginError={loginError}
          setLoginError={setLoginError}
          onLoginSuccess={(chosenRole) => {
            setIsLoggedIn(true);
            setRole(chosenRole);
            setActiveTab(chosenRole === 'admin' ? 'admin-docs' : 'chat');
          }}
          showToast={showToast}
        />
      </>
    );
  }

  // 2. TAMPILAN UTAMA APLIKASI (SETELAH LOGIN)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Atas */}
      <Navbar
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionRecordsCount={sessionRecords.length}
        adminDocsCount={adminDocs.length}
        onLogout={() => {
          setIsLoggedIn(false);
          setLoginPassword('');
          setLoginError('');
        }}
      />

      {/* Konten Utama Berdasarkan Tab */}
      <main style={{ flex: 1, padding: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'chat' && (
          <AnalysisView
            role={role}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            inputPrompt={inputPrompt}
            setInputPrompt={setInputPrompt}
            loading={loading}
            handleAnalyze={handleAnalyze}
            currentResult={currentResult}
            handleExportCSV={handleExportCSV}
            handleExportJSON={handleExportJSON}
            handleSaveRegister={handleSaveRegister}
            saveSuccess={saveSuccess}
            chartData={chartData}
            handleViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'records' && (
          <RecordsView
            sessionRecords={sessionRecords}
            setCurrentResult={setCurrentResult}
            setActiveTab={setActiveTab}
            role={role}
          />
        )}

        {activeTab === 'admin-docs' && (
          <AdminDocsView
            adminDocs={adminDocs}
            newDocTitle={newDocTitle}
            setNewDocTitle={setNewDocTitle}
            newDocType={newDocType}
            setNewDocType={setNewDocType}
            newDocContent={newDocContent}
            setNewDocContent={setNewDocContent}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            fileInputRef={fileInputRef}
            handleAddDocument={handleAddDocument}
            handleViewDocument={handleViewDocument}
            handleDeleteDocument={handleDeleteDocument}
            previewDoc={previewDoc}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            apiKeyInput={apiKeyInput}
            setApiKeyInput={setApiKeyInput}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            status={status}
            handleSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Modal Preview Dokumen */}
      <DocumentModal previewDoc={previewDoc} setPreviewDoc={setPreviewDoc} previewLoading={previewLoading} />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
