import React from 'react';
import { Save } from 'lucide-react';

export default function SettingsView({
  apiKeyInput,
  setApiKeyInput,
  selectedModel,
  setSelectedModel,
  status,
  handleSaveSettings
}) {
  return (
    <div className="glass-panel" style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Pengaturan API OpenRouter</h2>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Konfigurasi API Key dari OpenRouter untuk gateway LLM (Dots 3 Note, Cohere North Mini, Nvidia Nemotron).
      </p>

      {/* Quick Link Info Box */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '0.8rem'
        }}
      >
        <span style={{ fontWeight: 600, color: '#93c5fd', display: 'block', marginBottom: '4px' }}>
          🔗 Belum punya atau ingin mengambil API Key?
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Buka dan buat API key di:{' '}
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
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--card-border)',
              padding: '10px 12px',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              color: status.hasApiKey ? '#34d399' : '#f87171',
              display: 'block',
              marginTop: '6px'
            }}
          >
            {status.hasApiKey
              ? '✅ API Key sudah aktif tersimpan di server.'
              : '⚠️ Belum ada API Key tersimpan. Masukkan key lalu klik Simpan.'}
          </span>
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            Model AI Default:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--card-border)',
              padding: '8px 10px',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.82rem'
            }}
          >
            <option value="dots-studio/dots-3-note-preview:free">
              dots-studio/dots-3-note-preview:free (Super Cepat ~0.5s / Free)
            </option>
            <option value="cohere/north-mini-code:free">
              cohere/north-mini-code:free (Cepat ~0.7s / Free)
            </option>
            <option value="nvidia/nemotron-3.5-lightning:free">
              nvidia/nemotron-3.5-lightning:free (Gratis)
            </option>
          </select>
        </div>

        <button type="submit" className="btn-primary" style={{ fontSize: '0.82rem', marginTop: '6px' }}>
          <Save size={14} /> Simpan Pengaturan
        </button>
      </form>
    </div>
  );
}

