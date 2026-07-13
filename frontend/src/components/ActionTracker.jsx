import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, ArrowLeft, CheckCircle2, Circle, Clock } from 'lucide-react';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

function ActionTracker({ token, apiBase }) {
  const API_BASE = apiBase || import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  const userToken = token || localStorage.getItem('token') || '';

  const [actions, setActions] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newImpact, setNewImpact] = useState('');
  const [newFinancialValue, setNewFinancialValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchActions = async () => {
    if (!userToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/actions`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActions(data || []);
      } else {
        setError('An error occurred while loading actions.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [userToken]);

  const handleAddAction = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ 
          title: newTitle, 
          impact: newImpact || 'Low',
          financial_impact_value: Number(newFinancialValue) || 0.0
        })
      });
      if (res.ok) {
        setNewTitle('');
        setNewImpact('');
        setNewFinancialValue('');
        fetchActions();
      } else {
        setError('Error adding action.');
      }
    } catch (err) {
      setError('Connection error.');
    }
  };

  const handleStatusChange = async (actionId, newStatus) => {
    setError('');
    const targetAction = actions.find(act => act.id === actionId);
    try {
      const res = await fetch(`${API_BASE}/api/actions/${actionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          financial_impact_value: Number(targetAction?.financial_impact_value || 0)
        })
      });
      if (res.ok) {
        setActions(prev => prev.map(act => act.id === actionId ? { ...act, status: newStatus } : act));
      } else {
        setError('Error updating status.');
      }
    } catch (err) {
      setError('Connection error.');
    }
  };

  const columns = [
    { id: 'TODO', title: 'To Do', icon: Circle, color: 'var(--color-primary)' },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: Clock, color: 'var(--color-warning)' },
    { id: 'DONE', title: 'Completed', icon: CheckCircle2, color: 'var(--color-success)' }
  ];

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('actionId', id);
  };

  const handleDrop = (e, status) => {
    const actionId = parseInt(e.dataTransfer.getData('actionId'), 10);
    if (actionId) {
      handleStatusChange(actionId, status);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="action-tracker" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', padding: '0.5rem', background: 'var(--color-danger-light)', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Yeni Ekleme Formu */}
      <form onSubmit={handleAddAction} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action Title</label>
          <input 
            type="text" 
            placeholder="e.g. Negotiate rent discount" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)}
            className="form-input"
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
          />
        </div>
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Financial Impact / Description</label>
          <input 
            type="text" 
            placeholder="e.g. Rent reduction" 
            value={newImpact} 
            onChange={e => setNewImpact(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
          />
        </div>
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Financial Impact Value ($)</label>
          <input 
            type="number" 
            placeholder="e.g. 5000" 
            value={newFinancialValue} 
            onChange={e => setNewFinancialValue(e.target.value)}
            className="form-input"
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '38px', padding: '0 1rem' }}>
          <Plus size={16} /> Add
        </button>
      </form>

      {/* Cumulative Success Card */}
      <div className="card glass-effect" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1.25rem', 
        borderRadius: '8px', 
        border: '1px solid var(--color-success)',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            padding: '0.5rem', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-success)', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>Completed Action Success</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You successfully completed your targets and saved money.</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Total Savings from Completed Actions</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {formatCurrency(actions.filter(act => act.status === 'DONE').reduce((sum, act) => sum + Number(act.financial_impact_value || 0), 0))}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {columns.map(col => {
          const colActions = actions.filter(act => act.status === col.id);
          const ColIcon = col.icon;
          
          return (
            <div 
              key={col.id} 
              className="action-column" 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ 
                backgroundColor: 'var(--bg-main)', 
                borderRadius: '8px', 
                padding: '1rem', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                minHeight: '300px'
              }}
            >
              <div className="action-column-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ColIcon size={16} style={{ color: col.color }} />
                  <span className="action-column-title" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{col.title}</span>
                </div>
                <span className="action-column-count" style={{ fontSize: '0.75rem', backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 600 }}>
                  {colActions.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                {colActions.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '2rem 0', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                    Drag and drop here
                  </div>
                ) : (
                  colActions.map(act => (
                    <div 
                      key={act.id} 
                      className="action-item" 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, act.id)}
                      style={{ 
                        backgroundColor: 'var(--bg-surface)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '6px', 
                        padding: '0.75rem',
                        cursor: 'grab',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div className="action-item-title" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {act.title}
                      </div>
                      {act.impact && (
                        <div className="action-item-impact" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          Description: {act.impact}
                        </div>
                      )}
                      {Number(act.financial_impact_value || 0) > 0 && (
                        <div className="action-item-value" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)', marginTop: '0.15rem' }}>
                          Savings Effect: {formatCurrency(act.financial_impact_value)}
                        </div>
                      )}
                      
                      {/* Status Transition Buttons */}
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', alignSelf: 'flex-end' }}>
                        {col.id !== 'TODO' && (
                          <button 
                            type="button" 
                            className="btn" 
                            onClick={() => handleStatusChange(act.id, col.id === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                            title="Move Back"
                          >
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {col.id !== 'DONE' && (
                          <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={() => handleStatusChange(act.id, col.id === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                            title="Move Forward"
                          >
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActionTracker;
