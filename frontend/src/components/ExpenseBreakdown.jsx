import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

function ExpenseBreakdown({ financialRecords }) {
  const hasData = financialRecords && financialRecords.length > 0;
  
  if (!hasData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)' }}>
        No expense breakdown data found.
      </div>
    );
  }

  const latestRecord = financialRecords[financialRecords.length - 1];
  
  const categories = [
    { name: 'Rent Expenses', key: 'rent_expense', color: '#3B82F6' },
    { name: 'Personnel Expenses', key: 'personnel_expense', color: '#10B981' },
    { name: 'Marketing Expenses', key: 'marketing_expense', color: '#F59E0B' },
    { name: 'Material Expenses', key: 'material_expense', color: '#EF4444' },
    { name: 'Other Expenses', key: 'other_expense', color: '#8B5CF6' }
  ];

  const data = categories.map(cat => ({
    name: cat.name,
    value: latestRecord[cat.key] ? Number(latestRecord[cat.key]) : 0,
    color: cat.color
  })).filter(item => item.value > 0);

  const totalExpense = data.reduce((sum, item) => sum + item.value, 0);

  if (totalExpense === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)' }}>
        The expense breakdown data for this period is zero.
      </div>
    );
  }

  return (
    <div className="expense-breakdown" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
      <div style={{ width: '200px', height: '200px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
            {formatCurrency(totalExpense)}
          </div>
        </div>
      </div>

      <div className="expense-legend" style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data.map((item, index) => {
          const percent = ((item.value / totalExpense) * 100).toFixed(1);
          return (
            <div key={index} className="expense-legend-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="expense-legend-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
              </div>
              <div className="expense-legend-value" style={{ fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>
                {formatCurrency(item.value)} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExpenseBreakdown;
