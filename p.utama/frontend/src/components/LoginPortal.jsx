import React from 'react';
import { ShieldAlert, User, ShieldCheck, Lock } from 'lucide-react';

export default function LoginPortal({
  role,
  setRole,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  onLoginSuccess,
  showToast
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'admin') {
      if (
        loginPassword.trim() === 'admin123' ||
        loginPassword.trim() === 'kapita' ||
        loginPassword.trim() === '10231053'
      ) {
        onLoginSuccess('admin');
        showToast('Login berhasil sebagai Administrator', 'success');
      } else {
        setLoginError('PIN/Password Admin salah! (Gunakan: admin123 atau 10231053)');
      }
    } else {
      onLoginSuccess('user');
      showToast(`Selamat datang, ${loginUsername || 'Staf Operasional'}`, 'success');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.12), transparent 70%), #0b0f19',
        padding: '20px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              padding: '12px',
              borderRadius: '14px',
              marginBottom: '14px',
              boxShadow: '0 8px 16px rgba(6, 182, 212, 0.25)'
            }}
          >
            <ShieldAlert size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>RiskRegen</span> Portal
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Sistem Otomasi Register Risiko TI Berbasis AI & Regulasi
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setRole('user');
              setLoginError('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'user' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              color: role === 'user' ? '#60a5fa' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <User size={15} /> Staf / User
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setLoginError('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'admin' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              color: role === 'admin' ? '#c084fc' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={15} /> Admin
          </button>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {role === 'user' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Nama Staf / Unit Kerja
              </label>
              <input
                type="text"
                placeholder="Contoh: Micka — Unit Operasional TI"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                PIN / Password Administrator
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Masukkan PIN (admin123)"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: loginError ? '1px solid #ef4444' : '1px solid var(--card-border)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
              </div>
              {loginError && (
                <span style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '4px', display: 'block' }}>
                  {loginError}
                </span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginTop: '6px',
              background:
                role === 'admin'
                  ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                  : 'linear-gradient(135deg, #3b82f6, #06b6d4)'
            }}
          >
            Masuk sebagai {role === 'admin' ? 'Admin' : 'Staf'}
          </button>
        </form>

        {/* Quick Login Pill */}
        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              ⚡ Mode Demo Pengujian (1-Klik):
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setRole('user');
                setLoginUsername('Staf Aviako (Demo)');
                onLoginSuccess('user');
                showToast('Masuk sebagai Staf Operasional (Clean User View)', 'success');
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                color: '#93c5fd',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                transition: 'all 0.2s ease'
              }}
              title="Masuk langsung ke antarmuka Staf tanpa ketik kredensial"
            >
              <User size={14} color="#60a5fa" />
              <span>Demo Staf</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setLoginPassword('admin123');
                onLoginSuccess('admin');
                showToast('Masuk sebagai Administrator (Risk Canvas & Audit View)', 'success');
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                border: '1px solid rgba(139, 92, 246, 0.45)',
                color: '#d8b4fe',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s ease'
              }}
              title="Masuk langsung ke antarmuka Admin Risk Officer"
            >
              <ShieldCheck size={14} color="#c084fc" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

