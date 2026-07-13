import React, { useState, useEffect } from 'react';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('tr-TR')} ₺`;

function CashFlowGauge({ financialRecords }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    if (!userToken) return;

    setLoading(true);
    fetch(`${API_BASE}/api/health`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('API error');
      })
      .then(data => {
        setHealthData(data);
      })
      .catch(err => {
        console.warn('Health fetch error, using local fallback:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const hasData = financialRecords && financialRecords.length > 0;

  if (!hasData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: 'var(--text-secondary)' }}>
        Nakit akışı verisi bulunamadı.
      </div>
    );
  }

  const latestMonth = financialRecords[financialRecords.length - 1];
  const prevMonth = financialRecords.length > 1 ? financialRecords[financialRecords.length - 2] : null;

  // 1. Profit Margin Score (0-100)
  const marginRatio = latestMonth.revenue > 0 ? (latestMonth.profit / latestMonth.revenue) : 0;
  const marginScore = Math.min(100, Math.max(0, (marginRatio / 0.30) * 100));

  // 2. Revenue Growth Trend Score (0-100)
  let revenueTrendScore = 50;
  if (prevMonth && prevMonth.revenue > 0) {
    const revChange = (latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue;
    revenueTrendScore = Math.min(100, Math.max(0, 50 + (revChange * 500)));
  }

  // 3. Gider Kontrol Skoru (0-100)
  let expenseControlScore = 50;
  if (prevMonth) {
    const revChange = prevMonth.revenue > 0 ? (latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue : 0;
    const expChange = prevMonth.expenses > 0 ? (latestMonth.expenses - prevMonth.expenses) / prevMonth.expenses : 0;
    const diff = revChange - expChange;
    expenseControlScore = Math.min(100, Math.max(0, 50 + (diff * 200)));
  }

  // Toplam Skor
  const localScore = Math.round((marginScore * 0.4) + (revenueTrendScore * 0.3) + (expenseControlScore * 0.3));
  const score = healthData && healthData.cash_flow_score !== undefined ? healthData.cash_flow_score : localScore;

  // Renk ve durum belirleme
  let strokeColor = '#EF4444';
  let statusText = 'Zayıf';
  let commentText = 'Nakit akışınız riskli seviyede. Maliyetlerinizi acilen düşürmeniz veya alacak tahsilatını hızlandırmanız gerekiyor.';
  
  if (score > 40 && score <= 70) {
    strokeColor = '#F59E0B';
    statusText = 'Orta';
    commentText = 'Nakit akışınız dengeli ancak büyüme için daha fazla kârlılık ve gider disiplini sağlanmalı.';
  } else if (score > 70) {
    strokeColor = '#10B981';
    statusText = 'Güçlü';
    commentText = 'Nakit akışınız son derece sağlıklı. İşletmeniz yeni yatırımlar ve büyüme için güçlü bir finansal zemine sahip.';
  }

  if (healthData && healthData.cash_flow_comment) {
    commentText = healthData.cash_flow_comment;
  }
  if (healthData && healthData.cash_flow_status) {
    statusText = healthData.cash_flow_status;
  }

  // SVG Yay parametreleri
  const radius = 45;
  const circumference = Math.PI * radius; // Semicircle length: 141.37
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <div className="gauge-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.75rem', padding: '0.5rem 0' }}>
      <div style={{ position: 'relative', width: '160px', height: '95px' }}>
        <svg viewBox="0 0 120 70" className="gauge-svg" style={{ width: '100%', height: '100%' }}>
          {/* Background arc (Gray) */}
          <path
            d="M 15 60 A 45 45 0 0 1 105 60"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Value arc (Colored) */}
          <path
            d="M 15 60 A 45 45 0 0 1 105 60"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <div className="gauge-label" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: strokeColor, marginTop: '0.15rem' }}>{statusText}</div>
        </div>
      </div>
      
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0, lineHeight: 1.4, maxWidth: '280px' }}>
        {commentText}
      </p>

      {/* How Score is Calculated Tooltip and Help Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', marginTop: '0.25rem' }}>
        <button 
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'var(--color-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <span>ℹ️ Skor Nasıl Hesaplanır?</span>
        </button>

        {showTooltip && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            width: '260px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.75rem',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10,
            fontSize: '0.75rem',
            color: 'var(--text-main)',
            textAlign: 'left',
            lineHeight: '1.4'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sağlık Skoru Hesaplaması</span>
              <button 
                onClick={() => setShowTooltip(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: '0 0 0.4rem 0' }}>Skorunuz aşağıdaki 5 temel metriğin eşit ağırlıklı ortalaması alınarak hesaplanır:</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <li><strong>Kârlılık:</strong> Net kâr marjınızın %30 hedefine oranı.</li>
              <li><strong>Büyüme:</strong> Son dönemdeki ciro artış trendi.</li>
              <li><strong>Maliyet Kontrolü:</strong> Giderlerinizin cironuza oranı (%50 hedef).</li>
              <li><strong>Ürün Çeşitliliği:</strong> Portföyünüzdeki ürün sayısı (Hedef: 4+ ürün).</li>
              <li><strong>Stabilite:</strong> Kârlı geçen ayların tüm aylara oranı.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CashFlowGauge;
