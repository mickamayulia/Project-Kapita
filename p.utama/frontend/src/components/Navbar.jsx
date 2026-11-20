import React from 'react';
import { 
  ShieldAlert, 
  User, 
  ShieldCheck, 
  MessageSquare, 
  History, 
  Database, 
  Upload, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Navbar({
  role,
  activeTab,
  setActiveTab,
  sessionRecordsCount,
  adminDocsCount,
  onLogout
}) {
  return (
    <header
      style={{
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
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex'
          }}
        >
          <ShieldAlert size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>RiskRegen</span> Assistant
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
            Asisten Register Risiko TI Berbasis AI & Grounding ISO/COBIT
          </p>
        </div>
      </div>

      {/* Role Badge & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Info / Role Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: role === 'admin' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${role === 'admin' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
            padding: '5px 12px',
            borderRadius: '20px'
          }}
        >
          {role === 'admin' ? <ShieldCheck size={14} color="#c084fc" /> : <User size={14} color="#60a5fa" />}
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: role === 'admin' ? '#c084fc' : '#60a5fa' }}>
            {role === 'admin' ? 'Administrator (Risk Manager)' : 'Staf Operasional (Risk Analyst)'}
          </span>
        </div>

        {/* Tab Actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {role === 'user' ? (
            <>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('chat')}
                style={{
                  background: activeTab === 'chat' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: activeTab === 'chat' ? '#60a5fa' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                <MessageSquare size={14} /> Analisis Insiden
              </button>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('records')}
                style={{
                  background: activeTab === 'records' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: activeTab === 'records' ? '#60a5fa' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                <History size={14} /> Draf Saya ({sessionRecordsCount})
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('chat')}
                style={{
                  background: activeTab === 'chat' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: activeTab === 'chat' ? '#c084fc' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                <MessageSquare size={14} /> Uji Analisis AI
              </button>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('records')}
                style={{
                  background: activeTab === 'records' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: activeTab === 'records' ? '#c084fc' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                <Database size={14} /> Master Register ({sessionRecordsCount})
              </button>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('admin-docs')}
                style={{
                  background: activeTab === 'admin-docs' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: activeTab === 'admin-docs' ? '#c084fc' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                <Upload size={14} /> Dokumen RAG ({adminDocsCount})
              </button>
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('settings')}
                style={{
                  background: activeTab === 'settings' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: activeTab === 'settings' ? '#c084fc' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '6px 10px'
                }}
                title="Pengaturan Sistem"
              >
                <Settings size={14} />
              </button>
            </>
          )}

          {/* Tombol Logout */}
          <button
            className="btn-secondary"
            onClick={onLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              fontSize: '0.78rem',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginLeft: '4px'
            }}
            title="Keluar / Ganti Akun"
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </div>
    </header>
  );
}

