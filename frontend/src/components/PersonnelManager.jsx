import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Clock, DollarSign, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('tr-TR')} ₺`;

function PersonnelManager({ token, apiBase }) {
  const API_BASE = apiBase || import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  const userToken = token || localStorage.getItem('token') || '';

  const [personnelList, setPersonnelList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    surname: '',
    role: 'Garson',
    monthly_salary: '',
    overtime_rate: '',
    overtime_hours: ''
  });

  const roles = [
    { value: 'Yönetici', label: 'Yönetici' },
    { value: 'Şef', label: 'Şef' },
    { value: 'Garson', label: 'Garson' },
    { value: 'Kurye', label: 'Kurye' },
    { value: 'Bulaşıkçı', label: 'Bulaşıkçı' },
    { value: 'Kasiyer', label: 'Kasiyer' },
    { value: 'Barista', label: 'Barista' },
    { value: 'Diğer', label: 'Diğer' }
  ];

  const fetchPersonnel = async () => {
    if (!userToken) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/personnel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPersonnelList(data);
        } else if (data && Array.isArray(data.personnel)) {
          setPersonnelList(data.personnel);
        } else if (data && Array.isArray(data.data)) {
          setPersonnelList(data.data);
        } else {
          setPersonnelList([]);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Personel verileri yüklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Personnel fetch error:', err);
      setError('Sunucu bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, [API_BASE, userToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.surname || !form.monthly_salary) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name: form.name.trim(),
      surname: form.surname.trim(),
      role: form.role,
      monthly_salary: Number(form.monthly_salary),
      overtime_rate: Number(form.overtime_rate || 0),
      overtime_hours: Number(form.overtime_hours || 0)
    };

    try {
      const response = await fetch(`${API_BASE}/api/personnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess('Personel başarıyla eklendi.');
        setForm({
          name: '',
          surname: '',
          role: 'Garson',
          monthly_salary: '',
          overtime_rate: '',
          overtime_hours: ''
        });
        fetchPersonnel();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Personel kaydedilirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Personnel post error:', err);
      setError('Sunucu bağlantı hatası oluştu. Personel eklenemedi.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;

    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE}/api/personnel/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        setSuccess('Personel başarıyla silindi.');
        fetchPersonnel();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Personel silinirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Personnel delete error:', err);
      setError('Sunucu bağlantı hatası oluştu. Personel silinemedi.');
    }
  };

  const calculateOvertimeExpense = (rate, hours) => {
    return Number(rate || 0) * Number(hours || 0);
  };

  const totalMonthlySalary = personnelList.reduce((sum, p) => {
    return sum + Number(p.monthly_salary || 0);
  }, 0);

  const totalOvertimeCost = personnelList.reduce((sum, p) => {
    return sum + calculateOvertimeExpense(p.overtime_rate, p.overtime_hours);
  }, 0);

  return (
    <div className="personnel-manager-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Cards / Summary Indicators */}
      <div className="summary-widgets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card glass-effect" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam Personel</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{personnelList.length}</div>
          </div>
        </div>

        <div className="card glass-effect" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Maaş Toplamı</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatCurrency(totalMonthlySalary)}</div>
          </div>
        </div>

        <div className="card glass-effect" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mesai Toplamı</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-warning)' }}>{formatCurrency(totalOvertimeCost)}</div>
          </div>
        </div>

        <div className="card glass-effect" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam Personel Maliyeti</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-success)' }}>{formatCurrency(totalMonthlySalary + totalOvertimeCost)}</div>
          </div>
        </div>
      </div>

      {/* Ana Grid (Form ve Tablo) */}
      <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Personel Ekleme Formu */}
        <div className="card" style={{ animation: 'fadeInUp var(--transition-normal)' }}>
          <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <UserCheck size={20} className="text-accent" />
            Yeni Personel Ekle
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Adı <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  className="text-input" 
                  placeholder="Ahmet"
                  value={form.name} 
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Soyadı <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  name="surname" 
                  className="text-input" 
                  placeholder="Yılmaz"
                  value={form.surname} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Rolü <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select 
                name="role" 
                className="select-input" 
                style={{ height: '42px' }}
                value={form.role} 
                onChange={handleChange}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Aylık Sabit Maaş (₺) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input 
                type="number" 
                name="monthly_salary" 
                className="text-input" 
                placeholder="35000"
                min="0"
                step="0.01"
                value={form.monthly_salary} 
                onChange={handleChange}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
                  Mesai Saat Ücreti (₺)
                </label>
                <input 
                  type="number" 
                  name="overtime_rate" 
                  className="text-input" 
                  placeholder="250"
                  min="0"
                  step="0.01"
                  value={form.overtime_rate} 
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Mesai Saati (saat)</label>
                <input 
                  type="number" 
                  name="overtime_hours" 
                  className="text-input" 
                  placeholder="10"
                  min="0"
                  step="0.5"
                  value={form.overtime_hours} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mesaj Bildirimleri */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', fontSize: '0.85rem' }}>
                <UserCheck size={16} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem', width: '100%' }} disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Personel Ekle
                </>
              )}
            </button>
          </form>
        </div>

        {/* Personel Listesi ve Tablosu */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 className="widget-title" style={{ margin: 0 }}>Personel & Mesai Takip Listesi</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam: {personnelList.length} Çalışan</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.5rem' }}>
              <Loader2 size={36} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Personel listesi yükleniyor...</span>
            </div>
          ) : personnelList.length === 0 ? (
            /* Empty State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Users size={32} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>Kayıtlı Personel Bulunmamaktadır</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                Ekibinizi yönetmek, mesai saatlerini ve maliyetlerini hesaplamak için sol taraftaki formu kullanarak personel ekleyin.
              </p>
            </div>
          ) : (
            /* Personel Tablosu */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>Adı Soyadı</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>Rolü</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Aylık Maaş</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Mesai Saat Ücreti</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Mesai Saati</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Mesai Gideri</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'right' }}>Toplam Maliyet</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: '600', textAlign: 'center' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {personnelList.map((person) => {
                    const overtimeExpense = calculateOvertimeExpense(person.overtime_rate, person.overtime_hours);
                    const totalCost = Number(person.monthly_salary || 0) + overtimeExpense;
                    return (
                      <tr 
                        key={person.id} 
                        style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color var(--transition-fast)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>
                          {person.name} {person.surname}
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
                            {person.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          {formatCurrency(person.monthly_salary)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          {formatCurrency(person.overtime_rate)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: '500' }}>
                          {person.overtime_hours || 0} sa
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: '500', color: 'var(--color-warning)' }}>
                          {formatCurrency(overtimeExpense)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--color-success)' }}>
                          {formatCurrency(totalCost)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDelete(person.id)}
                            className="close-chat-btn"
                            title="Personeli Sil"
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

export default PersonnelManager;
