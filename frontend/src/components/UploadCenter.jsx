import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import ManualDataEntry from './ManualDataEntry';

function UploadCenter({ token, apiBase, onUploadSuccess }) {
  const [activeUploadTab, setActiveUploadTab] = useState('file'); // 'file' or 'manual'
  const fileInputRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '', data: null });
  const [isDragging, setIsDragging] = useState(false);
  const [unmatchedColumn, setUnmatchedColumn] = useState(null);
  const [matchedSelection, setMatchedSelection] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!uploadLoading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    setUploadLoading(true);
    setUploadStatus({ type: '', message: '', data: null });
    setUnmatchedColumn(null);
    setMatchedSelection('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${apiBase}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        
        let unmatched = null;
        if (result.unmatched_columns && result.unmatched_columns.length > 0) {
          unmatched = result.unmatched_columns[0];
        }
        setUnmatchedColumn(unmatched);

        setUploadStatus({
          type: 'success',
          message: `${file.name} uploaded successfully!`,
          data: result
        });
      } else {
        const err = await res.json();
        setUploadStatus({ type: 'error', message: err.detail || 'File upload error.', data: null });
      }
    } catch (err) {
      setUploadStatus({ type: 'error', message: 'Could not connect to the server. Please ensure the API server is running.', data: null });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', flexShrink: 0 }}>
      <h2 className="widget-title">Financial Data Import Center</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Choose one of the methods below to import your business revenue, expenses, or product sales breakdown.
      </p>

      {/* Tab Selection */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '1rem' }}>
        <button 
          onClick={() => setActiveUploadTab('file')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            border: 'none', 
            background: 'none', 
            borderBottom: activeUploadTab === 'file' ? '3px solid var(--color-primary)' : '3px solid transparent', 
            color: activeUploadTab === 'file' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease'
          }}
        >
          File Upload
        </button>
        <button 
          onClick={() => setActiveUploadTab('manual')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            border: 'none', 
            background: 'none', 
            borderBottom: activeUploadTab === 'manual' ? '3px solid var(--color-primary)' : '3px solid transparent', 
            color: activeUploadTab === 'manual' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease'
          }}
        >
          Manual Entry
        </button>
      </div>

      {activeUploadTab === 'file' ? (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
            Upload an <strong>Excel (.xlsx)</strong> or <strong>CSV</strong> file containing your business revenue, expenses, or product sales breakdown. Our AI model will analyze this file to generate financial reports and growth recommendations instantly.
          </p>

          <div 
            className={`file-upload-card ${isDragging ? 'dragging' : ''}`}
            onClick={() => !uploadLoading && fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              cursor: uploadLoading ? 'not-allowed' : 'pointer',
              border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed var(--border-color)',
              backgroundColor: isDragging ? 'var(--color-primary-light)' : 'transparent'
            }}
          >
            <div className="upload-icon-container">
              <UploadCloud size={36} />
            </div>
            <h3>{uploadLoading ? 'Processing File...' : 'Select an Excel or CSV File'}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              You can drag and drop the file, or click to select it from your computer.
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              className="file-input" 
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              disabled={uploadLoading}
            />
          </div>

          {uploadStatus.message && (
            <div style={{ marginTop: '2rem' }}>
              <div 
                className="insight-item" 
                style={{ 
                  borderLeftColor: uploadStatus.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                  backgroundColor: uploadStatus.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                }}
              >
                <div className="insight-icon-wrapper">
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
                  )}
                </div>
                <div className="insight-content-area">
                  <span className="insight-title-text">{uploadStatus.type === 'success' ? 'Success' : 'Error'}</span>
                  <span className="insight-description-text">{uploadStatus.message}</span>
                </div>
              </div>
              
              {uploadStatus.type === 'success' && uploadStatus.data && (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} style={{ color: 'var(--color-primary)' }}/> Data Quality Summary
                  </h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '20px', fontWeight: 'bold' }}>
                      Quality Score: {uploadStatus.data.quality_score || 'A'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>{uploadStatus.data.records_count || 0}</strong> financial records, <strong>{uploadStatus.data.products_count || 0}</strong> product/service data items processed.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-success-light)' }}>
                      <h5 style={{ color: 'var(--color-success)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} /> Strengths
                      </h5>
                      <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(uploadStatus.data.strong_points || ['Data format compatible', 'No missing dates']).map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-warning-light)' }}>
                      <h5 style={{ color: 'var(--color-warning)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={16} /> Weaknesses
                      </h5>
                      <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(uploadStatus.data.missing_points || ['Some categories unclear']).map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {unmatchedColumn && (
                    <div style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-warning-light)' }}>
                      <h5 style={{ color: 'var(--color-warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={16} /> Column Matching Required
                      </h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        The system could not recognize the column named <strong>"{unmatchedColumn}"</strong>. What does this column represent?
                      </p>
                      <select 
                        className="form-input" 
                        value={matchedSelection} 
                        onChange={(e) => setMatchedSelection(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                      >
                        <option value="">-- Please Select --</option>
                        <option value="revenue">Revenue / Income</option>
                        <option value="expenses">Expenses / Cost</option>
                        <option value="date">Date / Period</option>
                        <option value="product">Product / Service</option>
                      </select>
                    </div>
                  )}

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600 }}
                      onClick={() => onUploadSuccess && onUploadSuccess()}
                      disabled={unmatchedColumn && !matchedSelection}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '3rem', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>Recommended File Template Structure</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>Standard column names for the most efficient processing.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0', padding: '1.5rem' }}>
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>Monthly Finance Template:</span>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8 }}>
                  <li><strong>Date / Month</strong> (e.g., January)</li>
                  <li><strong>Revenue / Income</strong> (e.g., 280000)</li>
                  <li><strong>Expenses / Cost</strong> (e.g., 190000)</li>
                </ul>
              </div>
              <div style={{ paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>Product & Service Template:</span>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.8 }}>
                  <li><strong>Product</strong> (e.g., Latte)</li>
                  <li><strong>Units</strong> (e.g., 1200)</li>
                  <li><strong>Revenue</strong> (e.g., 90000)</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <ManualDataEntry 
          token={token}
          apiBase={apiBase}
          onSaveSuccess={onUploadSuccess}
        />
      )}
    </div>
  );
}

export default UploadCenter;
