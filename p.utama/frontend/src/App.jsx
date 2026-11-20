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
        body: JSON.stringify({ 
          message: inputPrompt, 
          model: selectedModel,
          sessionId: currentResult?.id || null, // Pertahankan sesi jika sedang berdiskusi di sesi yang sama
          author: role === 'admin' ? 'Administrator' : (loginUsername || 'Staf Operasional')
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentResult(data);
        fetchRecords();
        showToast('Analisis risiko berhasil diperbarui!', 'success');
      } else {
        showToast(data.error || 'Terjadi kesalahan analisis', 'error');
      }
    } catch (e) {
      showToast('Error koneksi: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // User mengajukan draf ke Admin untuk ditinjau
  const handleSubmitToAdmin = async () => {
    if (!currentResult?.id) return;
    try {
      const res = await fetch(API_BASE + '/sessions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentResult.id })
      });
      if (res.ok) {
        setCurrentResult(prev => ({ ...prev, status: 'submitted' }));
        fetchRecords();
        showToast('Draf berhasil diajukan ke Admin untuk ditinjau!', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal mengajukan draf', 'error');
      }
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  // Reset sesi untuk memulai analisis kasus insiden baru
  const handleNewSession = () => {
    setCurrentResult(null);
    setInputPrompt('');
    showToast('Sesi baru dimulai. Silakan masukkan laporan insiden.', 'info');
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
    const dateFormatted = new Date(currentResult.timestamp || Date.now()).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WITA';

    const incidentQuery = currentResult.userQuery || inputPrompt || '-';
    const modelUsed = currentResult.modelUsed || selectedModel || 'dots-studio/dots-3-note-preview:free';
    const sessionId = currentResult.id || ('SES-' + Date.now());
    const summaryNarrative = currentResult.result?.ringkasan || '-';

    // Buat HTML-based XML Spreadsheet yang kompatibel dengan Microsoft Excel & Google Sheets
    // Dilengkapi Header Kop Formal, Warna Cell (Merah/Oranye/Hijau), Garis Border & Font Rapi
    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Risk Register Formal</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
          .header-title { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
          .meta-label { font-weight: bold; color: #475569; background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px; }
          .meta-value { border: 1px solid #cbd5e1; padding: 6px; }
          th { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #0f172a; padding: 8px; font-size: 10pt; text-align: center; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 9.5pt; vertical-align: top; }
          .cell-center { text-align: center; }
          .badge-high { background-color: #fecaca; color: #991b1b; font-weight: bold; text-align: center; }
          .badge-medium { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; }
          .badge-low { background-color: #d1fae5; color: #065f46; font-weight: bold; text-align: center; }
          .badge-verify { background-color: #f3f4f6; color: #4b5563; font-style: italic; text-align: center; }
        </style>
      </head>
      <body>
        <!-- KOP LAPORAN EKSEKUTIF -->
        <table>
          <tr>
            <td colspan="9" class="header-title">REGISTER RISIKO TI & TATA KELOLA OPERASIONAL</td>
          </tr>
          <tr>
            <td colspan="9" style="color: #64748b; font-size: 10pt;">Sistem Aviako RiskRegen Assistant • Grounding Standar ISO 31000 / COBIT 2019 / POJK</td>
          </tr>
          <tr><td colspan="9" style="height: 10px;"></td></tr>

          <!-- METADATA GENERATE, LAPORAN INSIDEN, & PARAMETER MODEL -->
          <tr>
            <td colspan="2" class="meta-label">ID Sesi Analisis:</td>
            <td colspan="7" class="meta-value" style="font-family: monospace; font-weight: bold;">${sessionId}</td>
          </tr>
          <tr>
            <td colspan="2" class="meta-label">Waktu Generate:</td>
            <td colspan="7" class="meta-value">${dateFormatted}</td>
          </tr>
          <tr>
            <td colspan="2" class="meta-label">Laporan Insiden Pengguna:</td>
            <td colspan="7" class="meta-value" style="font-style: italic; color: #0f172a;">"${incidentQuery}"</td>
          </tr>
          <tr>
            <td colspan="2" class="meta-label">Parameter Model AI:</td>
            <td colspan="7" class="meta-value"><strong>${modelUsed}</strong> (Gateway: OpenRouter • Temperature: 0.1 • Mode Deterministik)</td>
          </tr>
          <tr>
            <td colspan="2" class="meta-label">Ringkasan Analisis AI:</td>
            <td colspan="7" class="meta-value">${summaryNarrative}</td>
          </tr>
          <tr><td colspan="9" style="height: 14px;"></td></tr>
        </table>

        <!-- TABEL FORMAL REGISTER RISIKO (PERSIS DI UI) -->
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ID</th>
              <th style="width: 220px;">Pernyataan Risiko</th>
              <th style="width: 100px;">Kategori</th>
              <th style="width: 110px;">Inherent (L×I)</th>
              <th style="width: 100px;">Skor Awal</th>
              <th style="width: 130px;">Residual Target</th>
              <th style="width: 260px;">Rencana Mitigasi</th>
              <th style="width: 150px;">Risk Owner</th>
              <th style="width: 240px;">Rujukan Klausul Regulasi</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(r => {
              const inherentScore = r.skor ?? r.inherent_risk;
              const inherentLevel = r.tingkat || (inherentScore >= 15 ? 'tinggi' : inherentScore >= 7 ? 'sedang' : inherentScore >= 1 ? 'rendah' : 'perlu_verifikasi');
              
              const badgeClass = inherentLevel === 'tinggi' ? 'badge-high' : inherentLevel === 'sedang' ? 'badge-medium' : inherentLevel === 'rendah' ? 'badge-low' : 'badge-verify';
              const resBadgeClass = r.residualTingkat === 'tinggi' ? 'badge-high' : r.residualTingkat === 'sedang' ? 'badge-medium' : r.residualTingkat === 'rendah' ? 'badge-low' : 'badge-verify';
              
              const citStr = Array.isArray(r.sumber) 
                ? r.sumber.map(s => typeof s === 'object' ? `${s.dokumen || ''} (${s.bagian || ''})` : s).join('; ') 
                : '-';

              return `
                <tr>
                  <td class="cell-center" style="font-weight: bold; font-family: monospace;">${r.id || r.id_risiko}</td>
                  <td>${r.deskripsi || r.pernyataan_risiko || '-'}</td>
                  <td class="cell-center">${r.kategori || '-'}</td>
                  <td class="cell-center">${r.likelihood !== null && r.likelihood !== undefined ? `${r.likelihood} × ${r.impact}` : '-'}</td>
                  <td class="${badgeClass}">${inherentScore !== null && inherentScore !== undefined ? `${inherentScore} (${String(inherentLevel).toUpperCase()})` : 'Perlu Verifikasi'}</td>
                  <td class="${resBadgeClass}">${r.residualSkor !== null && r.residualSkor !== undefined ? `${r.residualLikelihood}×${r.residualImpact} = ${r.residualSkor} (${String(r.residualTingkat).toUpperCase()})` : '-'}</td>
                  <td>${r.mitigasi || '-'}</td>
                  <td style="font-weight: bold; color: #1e40af;">${r.risk_owner || r.pemilik || 'Unit Operasional TI Bandara'}</td>
                  <td style="font-size: 8.5pt; color: #334155;">${citStr}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- FOOTER CATATAN KELAYAKAN -->
        <table>
          <tr><td colspan="9" style="height: 10px;"></td></tr>
          <tr>
            <td colspan="9" style="font-size: 8pt; color: #64748b; font-style: italic;">
              * Dokumen ini diekspor resmi dari Sistem Aviako RiskRegen Assistant. Seluruh mitigasi berpedoman pada ISO 31000/27005 dan membutuhkan persetujuan pengesahan pejabat berwenang (Lapis 5 Guardrail).
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RiskRegister_${sessionId}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Laporan Register Risiko (Excel/Spreadsheet) berhasil diunduh!', 'success');
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
      <main style={{ flex: 1, padding: '16px 24px', maxWidth: '100%', width: '100%' }}>
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
            handleSubmitToAdmin={handleSubmitToAdmin}
            handleNewSession={handleNewSession}
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
