import React, { useState } from 'react';
import { Play, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

function ScenarioAnalysis({ financialRecords, topProducts }) {
  const [scenarioType, setScenarioType] = useState('expense_reduction');
  const [value, setValue] = useState('10');
  const [selectedProduct, setSelectedProduct] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const hasData = financialRecords && financialRecords.length > 0;

  if (!hasData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)' }}>
        No financial data available for scenario analysis.
      </div>
    );
  }

  const latest = financialRecords[financialRecords.length - 1];

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    let params = {};
    if (scenarioType === 'expense_reduction') {
      params = {
        category: 'other',
        percent: Number(value),
        value: Number(value),
        reduction_percent: Number(value)
      };
    } else if (scenarioType === 'revenue_increase') {
      params = {
        percent: Number(value),
        value: Number(value),
        increase_percent: Number(value)
      };
    } else if (scenarioType === 'price_change') {
      params = {
        percent: Number(value),
        value: Number(value),
        price_change_percent: Number(value),
        product_name: ''
      };
    } else if (scenarioType === 'product_removal') {
      params = {
        product_name: selectedProduct,
        product: selectedProduct,
        value: selectedProduct
      };
    }

    let apiSuccess = false;
    let apiData = null;

    try {
      const rawData = await api.createScenario({
        scenario_type: scenarioType,
        params: params
      });
      if (rawData && rawData.current) {
        apiData = {
          current: {
            revenue: rawData.current.total_revenue,
            expenses: rawData.current.total_expenses,
            profit: rawData.current.total_profit,
            profit_margin: rawData.current.profit_margin
          },
          projected: {
            revenue: rawData.projected.total_revenue,
            expenses: rawData.projected.total_expenses,
            profit: rawData.projected.total_profit,
            profit_margin: rawData.projected.profit_margin
          },
          impact: {
            profit_change: rawData.impact.profit_change,
            margin_change: rawData.impact.margin_change,
            profit_change_percent: rawData.current.total_profit !== 0 
              ? (rawData.impact.profit_change / Math.abs(rawData.current.total_profit)) * 100 
              : 0
          },
          ai_commentary: rawData.ai_commentary
        };
        apiSuccess = true;
      }
    } catch (err) {
      console.warn("Scenario API did not run, using front-end simulation.", err);
    }

    if (!apiSuccess) {
      const currentRevenue = latest.revenue;
      const currentExpenses = latest.expenses;
      const currentProfit = latest.profit;

      let projectedRevenue = currentRevenue;
      let projectedExpenses = currentExpenses;

      if (scenarioType === 'expense_reduction') {
        const pct = Number(value) / 100;
        projectedExpenses = currentExpenses * (1 - pct);
      } else if (scenarioType === 'revenue_increase') {
        const pct = Number(value) / 100;
        projectedRevenue = currentRevenue * (1 + pct);
      } else if (scenarioType === 'price_change') {
        const pct = Number(value) / 100;
        const demandDrop = pct * 0.3;
        projectedRevenue = currentRevenue * (1 + pct) * (1 - demandDrop);
        const materialExpense = latest.material_expense || (currentExpenses * 0.35);
        projectedExpenses = currentExpenses - (materialExpense * demandDrop);
      } else if (scenarioType === 'product_removal') {
        const prod = topProducts?.find(p => p.name === selectedProduct);
        if (prod) {
          projectedRevenue = Math.max(0, currentRevenue - prod.revenue);
          const prodCost = (prod.cost_per_unit || 0) * (prod.units || 0);
          projectedExpenses = Math.max(0, currentExpenses - prodCost);
        }
      }

      const projectedProfit = projectedRevenue - projectedExpenses;
      const profitImpact = projectedProfit - currentProfit;

      apiData = {
        current: { revenue: currentRevenue, expenses: currentExpenses, profit: currentProfit },
        projected: { revenue: projectedRevenue, expenses: projectedExpenses, profit: projectedProfit },
        impact: {
          profit_change: profitImpact,
          profit_change_percent: currentProfit !== 0 ? (profitImpact / Math.abs(currentProfit)) * 100 : 0
        }
      };
    }

    setTimeout(() => {
      setResult(apiData);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="scenario-analysis" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <form onSubmit={handleRunAnalysis} className="scenario-form" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Scenario Type</label>
          <select 
            value={scenarioType} 
            onChange={e => { setScenarioType(e.target.value); setResult(null); }}
            className="form-input"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
          >
            <option value="expense_reduction">Cost Reduction (Expense Cut)</option>
            <option value="revenue_increase">Sales Volume Increase (New Customers etc.)</option>
            <option value="price_change">Price Optimization (Increase/Discount)</option>
            <option value="product_removal">Remove Low-Performing Product</option>
          </select>
        </div>

        {scenarioType !== 'product_removal' ? (
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Change Rate (%)</label>
            <input 
              type="number" 
              min="-100" 
              max="500" 
              value={value} 
              onChange={e => { setValue(e.target.value); setResult(null); }}
              className="form-input"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
              required
            />
          </div>
        ) : (
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product to Remove</label>
            <select 
              value={selectedProduct} 
              onChange={e => { setSelectedProduct(e.target.value); setResult(null); }}
              className="form-input"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
              required
            >
              <option value="">-- Select Product --</option>
              {topProducts?.map((p, idx) => (
                <option key={idx} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px', padding: '0 1.25rem' }}>
          <Play size={16} /> {loading ? 'Analyzing...' : 'Run Scenario'}
        </button>
      </form>

      {result && (
        <div className="scenario-result" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Scenario Projection Results</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="scenario-card current" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status (Monthly)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Revenue:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(result.current.revenue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Expense:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(result.current.expenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>Net Profit:</span>
                  <span style={{ fontWeight: 700, color: result.current.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {formatCurrency(result.current.profit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="scenario-card projected" style={{ backgroundColor: 'var(--bg-main)', border: '1px dashed var(--color-primary)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Projection</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Revenue:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(result.projected.revenue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Expense:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(result.projected.expenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px dashed var(--color-primary)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>Net Profit:</span>
                  <span style={{ fontWeight: 700, color: result.projected.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {formatCurrency(result.projected.profit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="scenario-card impact" style={{
              backgroundColor: result.impact.profit_change >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${result.impact.profit_change >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}`,
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: result.impact.profit_change >= 0 ? 'var(--color-success)' : 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Impact on Profit
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.4rem', fontWeight: 800, color: result.impact.profit_change >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {result.impact.profit_change >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                <span>{formatCurrency(result.impact.profit_change)}</span>
              </div>
              <div className="scenario-impact" style={{ fontSize: '0.85rem', fontWeight: 600, color: result.impact.profit_change >= 0 ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '0.25rem' }}>
                {result.impact.profit_change >= 0 ? '+' : ''}{result.impact.profit_change_percent.toFixed(1)}% Change
              </div>
            </div>
          </div>

          {result.ai_commentary && (
            <div className="scenario-commentary" style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.08)', 
              border: '1px solid var(--color-primary)', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginTop: '0.5rem', 
              color: 'var(--text-main)', 
              fontSize: '0.9rem', 
              lineHeight: '1.4' 
            }}>
              <strong>InsightAI Analysis Commentary:</strong> {result.ai_commentary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScenarioAnalysis;
