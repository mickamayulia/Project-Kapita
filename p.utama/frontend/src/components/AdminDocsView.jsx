import React from 'react';
import { Upload } from 'lucide-react';

export default function AdminDocsView({
  adminDocs,
  newDocTitle,
  setNewDocTitle,
  newDocType,
  setNewDocType,
  newDocContent,
  setNewDocContent,
  selectedFile,
  setSelectedFile,
  fileInputRef,
  handleAddDocument,
  handleViewDocument,
  handleDeleteDocument,
  previewDoc
}) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Knowledge Base Dokumen Rujukan (Admin Role)</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Kelola dokumen rujukan ISO/COBIT dan unggah dokumen kebijakan/SOP organisasi untuk dibaca langsung di browser.
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.2)', color: '#d8b4fe', padding: '4px 10px', borderRadius: '6px' }}>
          Total: {adminDocs.length} Dokumen
        </span>
      </div>

      {/* Form Tambah Dokumen */}
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
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--card-border)',
                padding: '10px 12px',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.82rem'
              }}
            />
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--card-border)',
                padding: '10px 12px',
                borderRadius: '6px',
                color: '#cbd5e1',
                fontSize: '0.82rem'
              }}
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
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--card-border)',
                  padding: '10px',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.8rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{
                fontSize: '0.82rem',
                padding: '8px 18px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
              }}
            >
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
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {doc.id}
                </span>
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDocument(doc.id);
                }}
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
  );
}

