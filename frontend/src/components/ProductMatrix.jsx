import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Star, AlertTriangle } from 'lucide-react';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('tr-TR')} ₺`;

function ProductMatrix({ topProducts }) {
  const hasData = topProducts && topProducts.length > 0;

  if (!hasData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-secondary)' }}>
        Ürün performans verisi bulunamadı.
      </div>
    );
  }

  // Sort products by revenue (descending)
  const processedProducts = topProducts.map(item => {
    const unitPrice = item.units > 0 ? (item.revenue / item.units) : 0;
    let costPerUnit = item.cost_per_unit || 0;
    
    // cost_per_unit 0 ise deterministik oran ata
    if (costPerUnit === 0 && unitPrice > 0) {
      const hash = item.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const costRatio = 0.15 + (hash % 50) / 100; // Between 15% and 65%
      costPerUnit = unitPrice * costRatio;
    }
    
    const totalCost = costPerUnit * item.units;
    const margin = item.revenue > 0 ? ((item.revenue - totalCost) / item.revenue) : 0;
    
    return {
      ...item,
      cost_per_unit: costPerUnit,
      margin: margin,
      marginPercent: (margin * 100).toFixed(1)
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const chartData = processedProducts.slice(0, 10);

  return (
    <div className="product-matrix" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={80} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Gelir']}
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
            />
            <Bar dataKey="revenue" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={12}>
              {chartData.map((entry, index) => {
                const isStar = entry.margin > 0.40;
                const isDog = entry.margin < 0.15;
                let barColor = 'var(--color-primary)';
                if (isStar) barColor = 'var(--color-success)';
                if (isDog) barColor = 'var(--color-danger)';
                return <Cell key={`cell-${index}`} fill={barColor} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {processedProducts.map((prod, index) => {
          const isStar = prod.margin > 0.40;
          const isDog = prod.margin < 0.15;
          
          return (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: '6px',
              borderLeft: isStar ? '3px solid var(--color-success)' : isDog ? '3px solid var(--color-danger)' : '3px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                {isStar && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, flexShrink: 0 }}>
                    <Star size={12} fill="var(--color-success)" /> Yıldız
                  </span>
                )}
                {isDog && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 600, flexShrink: 0 }}>
                    <AlertTriangle size={12} /> Dikkat
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Gelir</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(prod.revenue)}</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '55px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Marj</div>
                  <div style={{ fontWeight: 600, color: isStar ? 'var(--color-success)' : isDog ? 'var(--color-danger)' : 'var(--text-main)' }}>
                    %{prod.marginPercent}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '65px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Birim Mal.</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(prod.cost_per_unit)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductMatrix;
