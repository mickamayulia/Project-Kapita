import React from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Download, 
  FileText, 
  Save, 
  CheckCircle2, 
  BarChart3, 
  AlertTriangle 
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

export default function AnalysisView({
  role,
  selectedModel,
  setSelectedModel,
  inputPrompt,
  setInputPrompt,
  loading,
  handleAnalyze,
  currentResult,
  handleExportCSV,
  handleExportJSON,
  handleSaveRegister,
  saveSuccess,
  chartData,
  handleViewDocument
}) {
  return (
          <div className={currentResult ? "split-screen-grid" : ""}>
            
            {/* Left Panel */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: currentResult ? 'sticky' : 'static', top: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--accent-cyan)" />
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    {role === 'admin' ? 'Form Simulasi Uji Insiden' : 'Input Catatan Insiden Operasional'}
                  </h2>
                </div>
                {role === 'admin' && (
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
                  </select>
                )}
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

                    <div className="matrix-grid-responsive">
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
  );
}
