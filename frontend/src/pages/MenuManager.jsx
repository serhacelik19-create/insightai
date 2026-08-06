import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Utensils, Percent, DollarSign, AlertTriangle, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

function MenuManager() {
  const { businessType, fetchData, triggerAnalysis } = useOutletContext();
  const onDataChange = async () => {
    await fetchData();
    triggerAnalysis(true);
  };
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    item_name: '',
    category: 'Main Course',
    sale_price: '',
    portion_cost: ''
  });

  const categories = [
    { value: 'Main Course', label: 'Main Course' },
    { value: 'Appetizer', label: 'Appetizer' },
    { value: 'Beverage', label: 'Beverage' },
    { value: 'Dessert', label: 'Dessert' }
  ];

  const fetchMenu = async () => {
    if (businessType !== 'restaurant') return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getMenu();
      if (Array.isArray(data)) {
        setMenuList(data);
      } else if (data && Array.isArray(data.menu)) {
        setMenuList(data.menu);
      } else if (data && Array.isArray(data.data)) {
        setMenuList(data.data);
      } else {
        setMenuList([]);
      }
    } catch (err) {
      console.error('Menu fetch error:', err);
      setError(err.message || 'Error loading menu data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [businessType]);

  // Sector Check (Only active for Restaurant & Cafe)
  if (businessType !== 'restaurant') {
    return (
      <div className="card glass-effect animate-fadeIn" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem', animation: 'scaleIn var(--transition-normal)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Lock size={36} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
          Menu & Cost Analysis Locked
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          This panel is active only for <strong>Restaurant & Cafe</strong> businesses. 
          To enable it, update your business type in Profile Settings.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_name || !form.sale_price || !form.portion_cost) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      item_name: form.item_name.trim(),
      category: form.category,
      sale_price: Number(form.sale_price),
      portion_cost: Number(form.portion_cost)
    };

    try {
      await api.createMenu(payload);
      setSuccess('Menu item added successfully.');
      setForm({
        item_name: '',
        category: 'Main Course',
        sale_price: '',
        portion_cost: ''
      });
      fetchMenu();
      if (onDataChange) onDataChange();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Menu post error:', err);
      setError(err.message || 'Error creating menu item.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    setError('');
    setSuccess('');
    try {
      await api.deleteMenu(id);
      setSuccess('Menu item deleted successfully.');
      fetchMenu();
      if (onDataChange) onDataChange();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Menu delete error:', err);
      setError(err.message || 'Error deleting menu item.');
    }
  };

  // Calculate food cost ratio and determine badge data
  const getFoodCostMetrics = (portionCost, salePrice) => {
    if (!salePrice || salePrice <= 0) return { percent: 0, badgeClass: 'success', text: 'Invalid Price', color: 'var(--color-success)' };
    const percent = (portionCost / salePrice) * 100;
    
    if (percent > 35) {
      return {
        percent,
        badgeClass: 'danger',
        bg: 'var(--color-danger-light)',
        color: 'var(--color-danger)',
        text: 'High Cost'
      };
    } else if (percent >= 30 && percent <= 35) {
      return {
        percent,
        badgeClass: 'warning',
        bg: 'var(--color-warning-light)',
        color: 'var(--color-warning)',
        text: 'Medium Cost'
      };
    } else {
      return {
        percent,
        badgeClass: 'success',
        bg: 'var(--color-success-light)',
        color: 'var(--color-success)',
        text: 'Good Margin'
      };
    }
  };

  return (
    <div className="menu-manager-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Cards / Summary Indicators */}
      <div className="summary-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="card glass-effect" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Menu Items</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{menuList.length}</div>
          </div>
        </div>

        <div className="card glass-effect" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <Percent size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Food Cost %</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-warning)' }}>
              {menuList.length > 0 
                ? (menuList.reduce((sum, item) => sum + ((item.portion_cost / item.sale_price) * 100), 0) / menuList.length).toFixed(1) + ' %'
                : '0.0 %'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Ana Grid (Form ve Tablo) */}
      <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Add Menu Item Form */}
        <div className="card" style={{ animation: 'fadeInUp var(--transition-normal)' }}>
          <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Utensils size={20} className="text-accent" />
            Add New Menu Item
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Item Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input 
                type="text" 
                name="item_name" 
                className="text-input" 
                placeholder="e.g. Kebab, Latte, Tiramisu"
                value={form.item_name} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Category <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select 
                name="category" 
                className="select-input" 
                style={{ height: '42px' }}
                value={form.category} 
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
                  Sale Price ($) <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input 
                  type="number" 
                  name="sale_price" 
                  className="text-input" 
                  placeholder="250"
                  min="0.01"
                  step="0.01"
                  value={form.sale_price} 
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Portion Cost ($) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="number" 
                  name="portion_cost" 
                  className="text-input" 
                  placeholder="75"
                  min="0"
                  step="0.01"
                  value={form.portion_cost} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            {/* Real-time Food Cost Display */}
            {form.sale_price > 0 && form.portion_cost >= 0 && (
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: 'var(--border-radius-sm)', 
                backgroundColor: 'var(--bg-secondary)',
                borderLeft: '4px solid var(--color-accent)',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Food Cost Ratio:</span>
                  <span style={{ fontWeight: '600' }}>
                    {((form.portion_cost / form.sale_price) * 100).toFixed(1)} %
                  </span>
                </div>
              </div>
            )}

            {/* Mesaj Bildirimleri */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', fontSize: '0.85rem' }}>
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem', width: '100%' }} disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add to Menu
                </>
              )}
            </button>
          </form>
        </div>

        {/* Menu Items List and Table */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 className="widget-title" style={{ margin: 0 }}>Menu & Cost Analysis Table</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total: {menuList.length} Items</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.5rem' }}>
              <Loader2 size={36} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading menu list...</span>
            </div>
          ) : menuList.length === 0 ? (
            /* Empty State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Utensils size={32} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>No Registered Menu Items</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                Start analyzing your food cost ratios by adding your dishes, selling prices, and portion costs.
              </p>
            </div>
          ) : (
            /* Menu Table */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>Item Name</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>Category</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Sale Price</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Portion Cost</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Food Cost %</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menuList.map((item) => {
                    const metrics = getFoodCostMetrics(item.portion_cost, item.sale_price);
                    return (
                      <tr 
                        key={item.id} 
                        style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color var(--transition-fast)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>
                          {item.item_name}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            fontWeight: '500',
                            backgroundColor: 'var(--bg-secondary)', 
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                          }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: '500' }}>
                          {formatCurrency(item.sale_price)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          {formatCurrency(item.portion_cost)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                            <span style={{ fontWeight: '700', color: metrics.color }}>
                              {metrics.percent.toFixed(1)} %
                            </span>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: '600', 
                              padding: '0.1rem 0.35rem', 
                              borderRadius: '4px', 
                              backgroundColor: metrics.bg, 
                              color: metrics.color 
                            }}>
                              {metrics.text}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="close-chat-btn"
                            title="Delete Item"
                            style={{ color: 'var(--color-danger)', display: 'inline-flex', padding: '0.35rem' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Inline style for CSS spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MenuManager;
