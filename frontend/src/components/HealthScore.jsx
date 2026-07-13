import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

function HealthScore({ financialRecords, topProducts }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);

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
        console.warn('Health fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const hasData = financialRecords && financialRecords.length > 0;

  if (!hasData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-secondary)' }}>
        No data found for health score analysis.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-secondary)' }}>
        Loading health score...
      </div>
    );
  }

  if (!healthData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
        No health score data available.
      </div>
    );
  }

  // Helper to extract metric from radar_metrics or direct fields
  const getMetric = (subjEng, subjTr, defaultVal) => {
    if (healthData.radar_metrics && Array.isArray(healthData.radar_metrics)) {
      const found = healthData.radar_metrics.find(m => m.subject === subjEng || m.subject === subjTr);
      if (found && found.A !== undefined) return found.A;
    }
    const key = subjEng.toLowerCase().replace(' ', '');
    if (healthData[key] !== undefined) return healthData[key];
    const keyCamel = subjEng.charAt(0).toLowerCase() + subjEng.slice(1).replace(' ', '');
    if (healthData[keyCamel] !== undefined) return healthData[keyCamel];
    return defaultVal;
  };

  const profitability = Math.round(getMetric('Profitability', 'Kârlılık', 50));
  const growth = Math.round(getMetric('Growth', 'Büyüme', 50));
  const costControl = Math.round(getMetric('Cost Control', 'Maliyet Kontrolü', 50));
  const productDiversity = Math.round(getMetric('Product Diversity', 'Ürün Çeşitliliği', 50));
  const stability = Math.round(getMetric('Stability', 'Stabilite', 50));

  const overallScore = healthData.overallScore !== undefined 
    ? healthData.overallScore 
    : (healthData.overall_score !== undefined 
       ? healthData.overall_score 
       : (healthData.cash_flow_score !== undefined 
          ? healthData.cash_flow_score 
          : 50));

  const data = [
    { subject: 'Profitability', A: profitability, fullMark: 100 },
    { subject: 'Growth', A: growth, fullMark: 100 },
    { subject: 'Cost Control', A: costControl, fullMark: 100 },
    { subject: 'Product Diversity', A: productDiversity, fullMark: 100 },
    { subject: 'Stability', A: stability, fullMark: 100 }
  ];

  let statusText = 'Excellent';
  let descText = 'Your business\'s financial structure is highly balanced and has ideal conditions for sustainable growth.';
  let scoreColor = '#10B981';

  if (overallScore >= 50 && overallScore < 80) {
    statusText = 'Good';
    descText = 'Your business is generally healthy, but there are areas to optimize the profitability margin and cost control.';
    scoreColor = '#F59E0B';
  } else if (overallScore < 50) {
    statusText = 'Needs Improvement';
    descText = 'Risks were detected in some critical financial metrics. You should review costs urgently and take growth-oriented steps.';
    scoreColor = '#EF4444';
  }

  // Override text if backend status is present
  if (healthData && healthData.cash_flow_status) {
    statusText = healthData.cash_flow_status;
  }
  if (healthData && healthData.cash_flow_comment) {
    descText = healthData.cash_flow_comment;
  }

  return (
    <div className="health-score-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.75rem' }}>
      <div style={{ width: '100%', height: '170px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" radius="70%" data={data}>
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={10} />
            <Radar name="Business Health" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreColor }}>
          {overallScore} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>/ 100 ({statusText})</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', lineHeight: 1.4, maxWidth: '280px' }}>
          {descText}
        </p>
      </div>
    </div>
  );
}

export default HealthScore;
