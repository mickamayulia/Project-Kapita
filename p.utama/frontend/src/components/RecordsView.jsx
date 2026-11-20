import React, { useState } from 'react';
import { 
  FolderClock, 
  Search, 
  ArrowRight,
  Calendar,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function RecordsView({
  sessionRecords,
  setCurrentResult,
  setActiveTab,
  role
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'submitted' | 'approved' | 'draft'

  const filtered = sessionRecords.filter(rec => {
    const matchQuery = (rec.userQuery || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.result?.ringkasan || '').toLowerCase().includes(searchQuery.toLowerCase());

    const recStatus = rec.status || 'draft';
    const matchStatus = statusFilter === 'all' ? true : recStatus === statusFilter;

    return matchQuery && matchStatus;
  });

  const countPending = sessionRecords.filter(r => r.status === 'submitted').length;
  const countApproved = sessionRecords.filter(r => r.status === 'approved').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Header & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'white' }}>
            {role === 'admin' ? 'Master Verifikasi & Register Risiko' : 'Draf Laporan Insiden Saya'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Menampilkan {filtered.length} draf catatan • {countPending} perlu peninjauan admin
          </span>
        </div>

        {/* Search Bar Elegan */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          padding: '8px 14px',
          width: '280px'
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari draf insiden atau pelapor..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.8rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Filter Tabs Status */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: statusFilter === 'all' ? 700 : 500,
            background: statusFilter === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: statusFilter === 'all' ? '1px solid rgba(255,255,255,0.2)' : 'none',
            color: statusFilter === 'all' ? 'white' : 'var(--text-muted)'
          }}
        >
          Semua ({sessionRecords.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('submitted')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: statusFilter === 'submitted' ? 700 : 500,
            background: statusFilter === 'submitted' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            border: statusFilter === 'submitted' ? '1px solid rgba(59, 130, 246, 0.4)' : 'none',
            color: statusFilter === 'submitted' ? '#60a5fa' : 'var(--text-muted)'
          }}
        >
          🔵 Siap Ditinjau Admin ({countPending})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('approved')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: statusFilter === 'approved' ? 700 : 500,
            background: statusFilter === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            border: statusFilter === 'approved' ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
            color: statusFilter === 'approved' ? '#34d399' : 'var(--text-muted)'
          }}
        >
          🟢 Sudah Disahkan ({countApproved})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('draft')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: statusFilter === 'draft' ? 700 : 500,
            background: statusFilter === 'draft' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            border: statusFilter === 'draft' ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
            color: statusFilter === 'draft' ? '#fbbf24' : 'var(--text-muted)'
          }}
        >
          🟡 Draf Berjalan
        </button>
      </div>

      {/* Grid Card Elegan & Rapi (Tidak Keramaian) */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Belum ada riwayat draf tersimpan.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {filtered.map((rec) => {
            const risks = rec.result?.daftar_risiko || [];
            const hasHigh = risks.some(r => r.tingkat === 'tinggi');
            const dateStr = new Date(rec.timestamp).toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={rec.id}
                className="glass-card"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  border: hasHigh ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(17, 24, 39, 0.65)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
                }}
                onClick={() => {
                  setCurrentResult(rec);
                  setActiveTab('chat');
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = hasHigh ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.25)';
                }}
              >
                <div>
                  {/* Card Top: ID Sesi, Pelapor & Badge Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {rec.id}
                      </span>
                      <span style={{ fontSize: '0.66rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                        {rec.author || 'Staf'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {/* Status Governance Draf */}
                      <span style={{
                        fontSize: '0.64rem',
                        padding: '2px 6px',
                        borderRadius: '5px',
                        fontWeight: 700,
                        background: rec.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : rec.status === 'submitted' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: rec.status === 'approved' ? '#34d399' : rec.status === 'submitted' ? '#60a5fa' : '#fbbf24',
                        border: `1px solid ${rec.status === 'approved' ? 'rgba(16, 185, 129, 0.3)' : rec.status === 'submitted' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      }}>
                        {rec.status === 'approved' ? 'Disahkan' : rec.status === 'submitted' ? 'Siap Ditinjau' : 'Draf'}
                      </span>

                      <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 7px',
                        borderRadius: '5px',
                        fontWeight: 600,
                        background: hasHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: hasHigh ? '#f87171' : '#34d399',
                        border: `1px solid ${hasHigh ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        {risks.length} Risiko
                      </span>
                    </div>
                  </div>

                  {/* Judul / Catatan Insiden */}
                  <p style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#f8fafc',
                    margin: '0 0 8px 0',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    "{rec.userQuery}"
                  </p>

                  {/* Ringkasan Singkat Hasil AI */}
                  {rec.result?.ringkasan && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {rec.result.ringkasan}
                    </p>
                  )}
                </div>

                {/* Footer Card: Tanggal & Tombol Aksi */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={12} />
                    <span>{dateStr}</span>
                  </div>

                  <span style={{
                    color: 'var(--accent-cyan)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem'
                  }}>
                    Buka Hasil <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
