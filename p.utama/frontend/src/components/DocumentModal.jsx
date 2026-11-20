import React from 'react';
import { FileText, XCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export function DocumentModal({ previewDoc, setPreviewDoc, previewLoading }) {
  if (!previewDoc && !previewLoading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={() => setPreviewDoc(null)}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {previewDoc?.title || 'Memuat Dokumen...'}
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {previewDoc?.id} • Tipe: {previewDoc?.type} {previewDoc?.originalName ? `• File: ${previewDoc.originalName}` : ''}
              </span>
            </div>
          </div>
          <button
            onClick={() => setPreviewDoc(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {previewLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Memuat isi teks dokumen...
            </div>
          ) : (
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: '#e2e8f0',
                margin: 0
              }}
            >
              {previewDoc?.content || 'Isi dokumen kosong atau tidak dapat diekstraksi.'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        const borderColor = isSuccess ? '#10b981' : isError ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';
        const bgColor = isSuccess
          ? 'rgba(6, 78, 59, 0.9)'
          : isError
          ? 'rgba(127, 29, 29, 0.9)'
          : isWarning
          ? 'rgba(120, 53, 15, 0.9)'
          : 'rgba(30, 58, 138, 0.9)';
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
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

