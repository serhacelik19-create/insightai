import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

function ManualDataEntry({ onSaveSuccess }) {
  const [activeTab, setActiveTab] = useState('financial'); // 'financial' or 'product'
  const [financials, setFinancials] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [newFin, setNewFin] = useState({
    date: '',
    revenue: '',
    expenses: '',
    rent_expense: '',
    personnel_expense: '',
    marketing_expense: '',
    material_expense: '',
    other_expense: ''
  });

  const [newProd, setNewProd] = useState({
    name: '',
    revenue: '',
    units: '',
    cost_per_unit: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const data = await api.getData();
      setFinancials(data.records || []);
      setProducts(data.products || []);
    } catch (err) {
      console.warn('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFinancial = async (e) => {
    e.preventDefault();
    if (!newFin.date || !newFin.revenue || !newFin.expenses) return;
    
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.createFinancialRecord({
        date: newFin.date,
        revenue: Number(newFin.revenue),
        expenses: Number(newFin.expenses),
        rent_expense: Number(newFin.rent_expense || 0),
        personnel_expense: Number(newFin.personnel_expense || 0),
        marketing_expense: Number(newFin.marketing_expense || 0),
        material_expense: Number(newFin.material_expense || 0),
        other_expense: Number(newFin.other_expense || 0)
      });

      setStatus({ type: 'success', message: 'Financial record added successfully!' });
      setNewFin({
        date: '',
        revenue: '',
        expenses: '',
        rent_expense: '',
        personnel_expense: '',
        marketing_expense: '',
        material_expense: '',
        other_expense: ''
      });

      await fetchData();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.revenue || !newProd.units) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.createProduct({
        name: newProd.name,
        revenue: Number(newProd.revenue),
        units: Number(newProd.units),
        cost_per_unit: Number(newProd.cost_per_unit || 0)
      });

      setStatus({ type: 'success', message: 'Product/service added successfully!' });
      setNewProd({
        name: '',
        revenue: '',
        units: '',
        cost_per_unit: ''
      });

      await fetchData();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFinancial = async (id) => {
    if (!id) return;
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.deleteFinancialRecord(id);
      setStatus({ type: 'success', message: 'Financial record deleted successfully!' });
      await fetchData();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'An error occurred during deletion.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!id) return;
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.deleteProduct(id);
      setStatus({ type: 'success', message: 'Product/service deleted successfully!' });
      await fetchData();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'An error occurred during deletion.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manual-entry-card card" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <h2 className="widget-title">Manual Data Entry Panel</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        You can manually edit, add, or delete your data. Changes are saved to the server instantly.
      </p>

      {/* Tabs */}
      <div className="manual-entry-tabs" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button 
          className={`manual-entry-tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => { setActiveTab('financial'); setStatus({ type: '', message: '' }); }}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'financial' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'financial' ? 'var(--color-primary)' : 'var(--text-secondary)'
          }}
        >
          Monthly Financials
        </button>
        <button 
          className={`manual-entry-tab ${activeTab === 'product' ? 'active' : ''}`}
          onClick={() => { setActiveTab('product'); setStatus({ type: '', message: '' }); }}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'product' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'product' ? 'var(--color-primary)' : 'var(--text-secondary)'
          }}
        >
          Add Product/Service
        </button>
      </div>

      {status.message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          backgroundColor: status.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
          color: status.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          border: `1px solid ${status.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)'}`
        }}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {activeTab === 'financial' ? (
        <div>
          {/* Financials Form */}
          <form onSubmit={handleAddFinancial} className="entry-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Date / Period</label>
              <input type="text" placeholder="e.g. July" value={newFin.date} onChange={e => setNewFin({...newFin, date: e.target.value})} required className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Revenue / Income ($)</label>
              <input type="number" placeholder="e.g. 300000" value={newFin.revenue} onChange={e => setNewFin({...newFin, revenue: e.target.value})} required className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Expenses ($)</label>
              <input type="number" placeholder="e.g. 200000" value={newFin.expenses} onChange={e => setNewFin({...newFin, expenses: e.target.value})} required className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Rent Expense (Optional)</label>
              <input type="number" placeholder="e.g. 25000" value={newFin.rent_expense} onChange={e => setNewFin({...newFin, rent_expense: e.target.value})} className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Personnel Expense (Optional)</label>
              <input type="number" placeholder="e.g. 80000" value={newFin.personnel_expense} onChange={e => setNewFin({...newFin, personnel_expense: e.target.value})} className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Marketing Expense (Optional)</label>
              <input type="number" placeholder="e.g. 15000" value={newFin.marketing_expense} onChange={e => setNewFin({...newFin, marketing_expense: e.target.value})} className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Material Expense (Optional)</label>
              <input type="number" placeholder="e.g. 60000" value={newFin.material_expense} onChange={e => setNewFin({...newFin, material_expense: e.target.value})} className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Other Expenses (Optional)</label>
              <input type="number" placeholder="e.g. 20000" value={newFin.other_expense} onChange={e => setNewFin({...newFin, other_expense: e.target.value})} className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div className="full-width" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Plus size={16} /> {loading ? 'Adding...' : 'Save & Add to Server'}
              </button>
            </div>
          </form>

          {/* List Table */}
          <div className="table-wrapper" style={{ marginBottom: '1.5rem' }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Profit</th>
                  <th>Details (Rent/Pers/Mktg/Mat/Other)</th>
                  <th style={{ width: '50px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {financials.map((fin, idx) => (
                  <tr key={fin.id || idx}>
                    <td style={{ fontWeight: 600 }}>{fin.date}</td>
                    <td>{formatCurrency(fin.revenue)}</td>
                    <td>{formatCurrency(fin.expenses)}</td>
                    <td style={{ color: fin.revenue - fin.expenses >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                      {formatCurrency(fin.revenue - fin.expenses)}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Rent: {formatCurrency(fin.rent_expense)}, Pers: {formatCurrency(fin.personnel_expense)}, Mktg: {formatCurrency(fin.marketing_expense)}, Mat: {formatCurrency(fin.material_expense)}, Other: {formatCurrency(fin.other_expense)}
                    </td>
                    <td>
                      <button type="button" disabled={loading} className="btn" onClick={() => handleDeleteFinancial(fin.id)} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)', padding: '0.3rem 0.5rem' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {financials.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No records added yet. Fill out the form above to start.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {/* Products Form */}
          <form onSubmit={handleAddProduct} className="entry-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Product / Service Name</label>
              <input type="text" placeholder="e.g. Filter Coffee" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} required className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Sales Volume (Units)</label>
              <input type="number" placeholder="e.g. 500" value={newProd.units} onChange={e => setNewProd({...newProd, units: e.target.value})} required className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Revenue ($)</label>
              <input type="number" placeholder="e.g. 45000" value={newProd.revenue} onChange={e => setNewProd({...newProd, revenue: e.target.value})} required className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Unit Product Cost ($, Optional)</label>
              <input type="number" placeholder="e.g. 25" value={newProd.cost_per_unit} onChange={e => setNewProd({...newProd, cost_per_unit: e.target.value})} className="form-input" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
            </div>
            <div className="full-width" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Plus size={16} /> {loading ? 'Adding...' : 'Save & Add to Server'}
              </button>
            </div>
          </form>

          {/* Products List Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {products.map((prod, idx) => (
              <div key={prod.id || idx} className="product-list-item" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-main)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 600 }}>{prod.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Sales Volume: <strong>{prod.units} units</strong> | Unit Cost: <strong>{formatCurrency(prod.cost_per_unit)}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Revenue</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(prod.revenue)}</div>
                  </div>
                  <button type="button" disabled={loading} className="btn" onClick={() => handleDeleteProduct(prod.id)} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-light)', padding: '0.3rem 0.5rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                No products/services added yet. Fill out the form above to start.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManualDataEntry;
