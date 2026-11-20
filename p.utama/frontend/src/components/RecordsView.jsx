import React from 'react';

export default function RecordsView({
  sessionRecords,
  setCurrentResult,
  setActiveTab,
  role
}) {
  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
        {role === 'admin' ? 'Master Register Risiko Organisasi' : 'Riwayat Draf Register Saya'}
      </h2>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {role === 'admin'
          ? 'Seluruh record riwayat analisis dan register risiko dari tim operasional yang siap diaudit.'
          : 'Daftar riwayat ekstraksi risiko yang pernah Anda buat dan simpan sebelumnya.'}
      </p>

      {sessionRecords.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Belum ada riwayat record tersimpan.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessionRecords.map((rec) => (
            <div key={rec.id} className="glass-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {rec.id} • {new Date(rec.timestamp).toLocaleString('id-ID')}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rec.modelUsed}</span>
              </div>
              <p style={{ fontSize: '0.85rem', marginTop: '6px', fontWeight: 600, color: 'white' }}>
                "{rec.userQuery}"
              </p>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '5px 12px', marginTop: '8px', color: 'var(--accent-cyan)' }}
                onClick={() => {
                  setCurrentResult(rec);
                  setActiveTab('chat');
                }}
              >
                Buka Hasil Analisis
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

