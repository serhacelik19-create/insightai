import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Activity,
  Wallet,
  Sparkles,
  Users,
  Repeat,
  ShoppingBag,
  Percent,
  TrendingDown,
  Utensils,
  ListTodo,
  BarChart3,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';
import ExpenseBreakdown from './ExpenseBreakdown';
import ProductMatrix from './ProductMatrix';
import ActionTracker from './ActionTracker';
import OriginalCashFlowGauge from './CashFlowGauge';
import OriginalHealthScore from './HealthScore';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const rev = payload[0]?.value || 0;
    const exp = payload[1]?.value || 0;
    const margin = rev > 0 ? (((rev - exp) / rev) * 100).toFixed(1) : '0';
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.75rem 1rem', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{label}</p>
        <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>Revenue: {formatCurrency(rev)}</p>
        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>Expenses: {formatCurrency(exp)}</p>
        <p style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600, borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>Profit Margin: {margin}%</p>
      </div>
    );
  }
  return null;
};

// Local Wrapper for CashFlowGauge using API healthData
const CashFlowGauge = ({ financialRecords, healthData }) => {
  if (!healthData || healthData.cashFlowScore === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        No cash flow data available.
      </div>
    );
  }

  const score = Math.round(healthData.cashFlowScore);

  let strokeColor = '#EF4444';
  let statusText = 'Weak';
  let commentText = 'Your cash flow is at a risky level. You need to reduce costs urgently or accelerate receivables collection.';
  
  if (score > 40 && score <= 70) {
    strokeColor = '#F59E0B';
    statusText = 'Moderate';
    commentText = 'Your cash flow is balanced, but more profitability and expense discipline should be achieved for growth.';
  } else if (score > 70) {
    strokeColor = '#10B981';
    statusText = 'Strong';
    commentText = 'Your cash flow is highly healthy. Your business has a strong financial foundation for new investments and growth.';
  }

  const radius = 45;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <div className="gauge-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.75rem', padding: '0.5rem 0' }}>
      <div style={{ position: 'relative', width: '160px', height: '95px' }}>
        <svg viewBox="0 0 120 70" className="gauge-svg" style={{ width: '100%', height: '100%' }}>
          <path
            d="M 15 60 A 45 45 0 0 1 105 60"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="10"
            strokeLinecap="round"
          />
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
    </div>
  );
};

// Local Wrapper for HealthScore using API healthData
const HealthScore = ({ financialRecords, topProducts, healthData }) => {
  if (!healthData || healthData.overallScore === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '170px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        No health score data available.
      </div>
    );
  }

  const profitability = Math.round(healthData.profitability !== undefined ? healthData.profitability : 50);
  const growth = Math.round(healthData.growth !== undefined ? healthData.growth : 50);
  const costControl = Math.round(healthData.costControl !== undefined ? healthData.costControl : 50);
  const productDiversity = Math.round(healthData.productDiversity !== undefined ? healthData.productDiversity : 50);
  const stability = Math.round(healthData.stability !== undefined ? healthData.stability : 50);
  const overallScore = Math.round(healthData.overallScore);

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
};

function Dashboard({
  businessName,
  businessType,
  financialRecords,
  topProducts,
  aiInsights,
  setChatOpen,
  token,
  apiBase,
  setActiveTab,
  triggerAnalysis
}) {
  const hasData = financialRecords && financialRecords.length > 0;
  
  const [healthData, setHealthData] = useState(null);
  const [actionRefreshKey, setActionRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!token) return;
    
    fetch(`${apiBase}/api/health`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Health API error');
        return res.json();
      })
      .then(data => {
        if (isMounted) setHealthData(data);
      })
      .catch(err => {
        console.warn('Could not fetch health data from API:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [token, apiBase]);

  // Empty State
  if (!hasData) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh', 
        textAlign: 'center', 
        padding: '2rem',
        opacity: 0.85
      }}>
        <BarChart3 size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Financial Data Yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', lineHeight: 1.6 }}>
          Unlock powerful insights by uploading your financial data from the Data Upload page.
        </p>
      </div>
    );
  }

  // Calculate default metrics
  const latestMonth = financialRecords[financialRecords.length - 1];
  const prevMonth = financialRecords.length > 1 ? financialRecords[financialRecords.length - 2] : null;
  
  const revenueChange = prevMonth ? (((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1) : '0.0';
  const expensesChange = prevMonth ? (((latestMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100).toFixed(1) : '0.0';
  const profitMargin = latestMonth.revenue > 0 ? ((latestMonth.profit / latestMonth.revenue) * 100).toFixed(1) : '30.0';

  // Sparkline data — last 6 records
  const sparklineRecords = financialRecords.slice(-6);
  const revenueSparkData = sparklineRecords.map(r => ({ v: r.revenue }));
  const expensesSparkData = sparklineRecords.map(r => ({ v: r.expenses }));
  const profitSparkData = sparklineRecords.map(r => ({ v: r.profit }));

  // Actual predictive data (Removed mock next month prediction)
  const predictiveData = financialRecords.map(r => ({ ...r, type: 'actual' }));

  // Add to Actions function
  const addToActions = async (title, impact) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, impact, financial_impact_value: 0.0 })
      });
      if (res.ok) {
        alert("Recommendation successfully added to action list!");
        setActionRefreshKey(prev => prev + 1); // Refresh the Kanban board instantly!
      } else {
        alert("An error occurred while adding the action.");
      }
    } catch (err) {
      console.warn('Action could not be added', err);
      alert("Connection error: Action could not be added.");
    }
  };

  // Dynamic Content Generators based on Sector / Business Type
  const getSectorData = () => {
    switch (businessType) {
      case 'b2b': {
        const churnRate = Math.max(1.0, (2.5 - parseFloat(revenueChange) * 0.1)).toFixed(1);
        const customerCount = Math.round(latestMonth.revenue / 2500) || 1;
        const ltv = Math.round((latestMonth.revenue / customerCount) / (parseFloat(churnRate) / 100));
        const cac = Math.round((latestMonth.expenses * 0.15) / Math.max(1, customerCount * 0.1));
        return {
          title: "SaaS & Subscription Financial Dashboard",
          kpis: [
            { label: "MRR (Monthly Recurring Revenue)", value: formatCurrency(latestMonth.revenue), trend: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`, trendUp: parseFloat(revenueChange) >= 0, subtext: "Compared to last month", icon: Repeat, iconClass: "primary", sparkData: revenueSparkData, sparkColor: "var(--color-primary)" },
            { label: "ARR (Annual Recurring Revenue)", value: formatCurrency(latestMonth.revenue * 12), trend: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`, trendUp: parseFloat(revenueChange) >= 0, subtext: "Compared to last month", icon: TrendingUp, iconClass: "accent", sparkData: expensesSparkData, sparkColor: "var(--color-danger)" },
            { label: "Customer Churn Rate", value: `%${churnRate}`, trend: "-0.3 bp", trendUp: false, subtext: "Improvement", icon: Users, iconClass: "warning", sparkData: profitSparkData, sparkColor: "var(--color-success)" },
            { label: "CAC / LTV Ratio", value: `${formatCurrency(cac)} / ${formatCurrency(ltv)}`, trend: `1:${(ltv / Math.max(1, cac)).toFixed(1)}`, trendUp: ltv > cac * 3, subtext: "Healthy Unit Economics", icon: Wallet, iconClass: "success" }
          ]
        };
      }
      
      case 'restaurant': {
        const avgTicket = topProducts && topProducts.length > 0 ? Math.round(topProducts.reduce((sum, p) => sum + p.revenue, 0) / topProducts.reduce((sum, p) => sum + (p.units || 1), 0)) : 245;
        const totalCost = topProducts && topProducts.length > 0 ? topProducts.reduce((sum, p) => {
          const unitPrice = p.units > 0 ? (p.revenue / p.units) : 0;
          let costPerUnit = p.cost_per_unit || 0;
          if (costPerUnit === 0 && unitPrice > 0) {
            const hash = p.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const costRatio = 0.15 + (hash % 50) / 100;
            costPerUnit = unitPrice * costRatio;
          }
          return sum + (costPerUnit * p.units);
        }, 0) : 0;
        const totalRevenue = topProducts && topProducts.length > 0 ? topProducts.reduce((sum, p) => sum + p.revenue, 0) : 0;
        const foodCostRatio = totalRevenue > 0 ? ((totalCost / totalRevenue) * 100).toFixed(1) : "34.2";
        return {
          title: "Restaurant & Cafe Operations Dashboard",
          kpis: [
            { label: "Monthly Net Revenue", value: formatCurrency(latestMonth.revenue), trend: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`, trendUp: parseFloat(revenueChange) >= 0, subtext: "Compared to last month", icon: Utensils, iconClass: "primary", sparkData: revenueSparkData, sparkColor: "var(--color-primary)" },
            { label: "Total Expenses", value: formatCurrency(latestMonth.expenses), trend: `${expensesChange >= 0 ? '+' : ''}${expensesChange}%`, trendUp: parseFloat(expensesChange) < 0, subtext: "Compared to last month", icon: Wallet, iconClass: "danger", sparkData: expensesSparkData, sparkColor: "var(--color-danger)" },
            { label: "Average Ticket Size", value: formatCurrency(avgTicket), trend: "+5.4%", trendUp: true, subtext: "Compared to last week", icon: ShoppingBag, iconClass: "accent", sparkData: profitSparkData, sparkColor: "var(--color-success)" },
            { label: "Food Cost Ratio", value: `%${foodCostRatio}`, trend: "-1.2%", trendUp: false, subtext: "Improvement", icon: Percent, iconClass: "success" }
          ]
        };
      }
        
      case 'ecommerce': {
        const orderCount = topProducts && topProducts.length > 0 ? topProducts.reduce((sum, p) => sum + (p.units || 0), 0) : Math.round(latestMonth.revenue / 320);
        const aov = orderCount > 0 ? Math.round(latestMonth.revenue / orderCount) : 320;
        const refundRate = Math.max(1.5, Math.min(10.0, (latestMonth.expenses / latestMonth.revenue) * 10)).toFixed(1);
        return {
          title: "E-Commerce Store Analytics Dashboard",
          kpis: [
            { label: "Total E-Commerce Revenue", value: formatCurrency(latestMonth.revenue), trend: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`, trendUp: parseFloat(revenueChange) >= 0, subtext: "Compared to last month", icon: ShoppingBag, iconClass: "primary", sparkData: revenueSparkData, sparkColor: "var(--color-primary)" },
            { label: "Order Count", value: `${orderCount} orders`, trend: "+10.2%", trendUp: true, subtext: "Compared to last month", icon: Repeat, iconClass: "accent", sparkData: expensesSparkData, sparkColor: "var(--color-danger)" },
            { label: "Average Order Value (AOV)", value: formatCurrency(aov), trend: "+8.2%", trendUp: true, subtext: "Compared to last month", icon: Wallet, iconClass: "success", sparkData: profitSparkData, sparkColor: "var(--color-success)" },
            { label: "Refund Rate", value: `%${refundRate}`, trend: "-0.5%", trendUp: false, subtext: "Improvement", icon: Percent, iconClass: "warning" }
          ]
        };
      }
 
      case 'general':
      default:
        return {
          title: "Business Financial Decision Dashboard",
          kpis: [
            { label: "Net Monthly Revenue", value: formatCurrency(latestMonth.revenue), trend: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`, trendUp: parseFloat(revenueChange) >= 0, subtext: "Compared to last month", icon: TrendingUp, iconClass: "primary", sparkData: revenueSparkData, sparkColor: "var(--color-primary)" },
            { label: "Total Expenses", value: formatCurrency(latestMonth.expenses), trend: `${expensesChange >= 0 ? '+' : ''}${expensesChange}%`, trendUp: parseFloat(expensesChange) < 0, subtext: "Compared to last month", icon: Wallet, iconClass: "danger", sparkData: expensesSparkData, sparkColor: "var(--color-danger)" },
            { label: "Net Profit", value: formatCurrency(latestMonth.profit), trend: prevMonth ? `${latestMonth.profit >= prevMonth.profit ? '+' : ''}${formatCurrency(latestMonth.profit - prevMonth.profit)}` : '0.0', trendUp: prevMonth ? latestMonth.profit >= prevMonth.profit : true, subtext: "Period change", icon: CheckCircle, iconClass: "success", sparkData: profitSparkData, sparkColor: "var(--color-success)" },
            { label: "Net Profit Margin", value: `%${profitMargin}`, trend: "+1.4%", trendUp: true, subtext: "Improvement", icon: Percent, iconClass: "accent" }
          ]
        };
    }
  };

  const sectorData = getSectorData();

  return (
    <div className="dashboard-grid">
      
      {/* 1. Header Area */}
      <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>{sectorData.title}</h2>
          <p className="text-muted" style={{ marginTop: '0.15rem', fontSize: '0.85rem' }}>
            {businessName} - Sectoral Financial Health Status & Action Recommendations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" onClick={() => triggerAnalysis && triggerAnalysis(true)}>
            <RefreshCw size={16} /> Refresh Analysis
          </button>
          <button className="btn" onClick={() => setActiveTab('reports')}>
            <FileSpreadsheet size={16} /> Download Report
          </button>
          <button className="btn btn-primary" onClick={() => setChatOpen(true)}>
            <Sparkles size={16} /> AI Finance Assistant
          </button>
        </div>
      </div>

      {/* 2. Dynamic Priority Problem-Solution Cards Section (Alert-First) */}
      <div className="priority-actions-section">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} /> Urgent Intervention & Decision Queue
        </h3>
        
        <div className="priority-cards-grid">
          {(!aiInsights || aiInsights.length === 0) ? (
            <div style={{ 
              gridColumn: 'span 3', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '2rem', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--border-radius-md)', 
              border: '1px dashed var(--border-color)',
              textAlign: 'center',
              width: '100%',
              minHeight: '120px'
            }}>
              <Sparkles size={24} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Waiting for AI Analysis</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
                Your financial data will be analyzed and AI recommendations will be displayed here. Please start the analysis using the 'AI Finance Assistant' button on the top right, or upload data.
              </p>
            </div>
          ) : (
            aiInsights.map((act, index) => {
              const isInfo = act.type === 'info';
              const cardClass = isInfo ? '' : act.type;
              const cardStyle = isInfo ? { borderLeft: '4px solid var(--color-primary)', backgroundColor: 'var(--color-primary-light, rgba(59, 130, 246, 0.05))' } : {};
              
              const IconComponent = act.type === 'warning' ? <AlertTriangle size={14} /> : act.type === 'success' ? <CheckCircle size={14} /> : <Info size={14} />;
              const headerText = act.type === 'warning' ? 'Critical Risk' : act.type === 'success' ? 'Opportunity' : 'Analysis Report';

              return (
                <div key={index} className={`priority-card ${cardClass}`} style={cardStyle}>
                  <div>
                    <div className={`priority-header ${cardClass}`} style={isInfo ? { color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' } : { display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {IconComponent} {headerText}
                      {act.impact && (
                        <span style={{ 
                          marginLeft: 'auto', 
                          fontSize: '0.75rem', 
                          padding: '0.15rem 0.4rem', 
                          borderRadius: '4px', 
                          fontWeight: 'bold', 
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          color: act.type === 'warning' ? 'var(--color-danger)' : act.type === 'success' ? 'var(--color-success)' : 'var(--text-main)'
                        }}>
                          Impact: {act.impact}
                        </span>
                      )}
                    </div>
                    <div className="priority-body" style={{ marginTop: '0.5rem' }}>
                      <h4>{act.title}</h4>
                      <p>{act.description}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                    <button 
                      className="btn" 
                      style={{ 
                        borderColor: act.type === 'warning' ? '#FCA5A5' : act.type === 'success' ? '#A7F3D0' : '#93C5FD', 
                        color: act.type === 'warning' ? '#991B1B' : act.type === 'success' ? '#065F46' : '#1D4ED8', 
                        background: act.type === 'warning' ? '#FEF2F2' : act.type === 'success' ? '#ECFDF5' : '#EFF6FF', 
                        fontWeight: 600, 
                        fontSize: '0.8rem', 
                        alignSelf: 'flex-start' 
                      }} 
                      onClick={() => setChatOpen(true)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn" 
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '6px' }}
                      onClick={() => addToActions(act.title, act.description)}
                    >
                      + Add to Actions
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Dynamic B2B / Sectoral KPI Row with Mini Sparklines */}
      <div className="kpi-row">
        {sectorData.kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="card kpi-card">
              <div className="kpi-header">
                <span>{kpi.label}</span>
                <div className={`kpi-icon ${kpi.iconClass}`}><Icon size={16} /></div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              {kpi.sparkData && (
                <div style={{ margin: '0.25rem 0' }}>
                  <LineChart width={80} height={30} data={kpi.sparkData}>
                    <Line type="monotone" dataKey="v" stroke={kpi.sparkColor} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </div>
              )}
              <div>
                <span className={`kpi-trend ${kpi.trendUp ? 'up' : 'down'}`}>
                  {kpi.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {kpi.trend}
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>{kpi.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Main Chart + Right Panel */}
      <div className="card chart-area" style={{ gridColumn: 'span 8', minHeight: '340px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Revenue Forecasting & Budget Execution</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Actual revenue and expenses performance over time.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></span> Revenue
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-danger)' }}></span> Expenses
            </span>
          </div>
        </div>
        
        <div style={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictiveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tickLine={false} axisLine={false} dy={10} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-primary)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRevL)" 
                strokeDasharray="0"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="var(--color-danger)" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorExpL)" 
                strokeDasharray="0"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Cash Flow Health</h3>
          <CashFlowGauge financialRecords={financialRecords} healthData={healthData} />
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Business Health Score</h3>
          <HealthScore financialRecords={financialRecords} topProducts={topProducts} healthData={healthData} />
        </div>
      </div>

      {/* 5. Expense Breakdown + Product Matrix */}
      <div className="card" style={{ gridColumn: 'span 6' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Expense Breakdown Analysis</h3>
        <ExpenseBreakdown financialRecords={financialRecords} />
      </div>
      <div className="card" style={{ gridColumn: 'span 6' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Product/Service Performance Matrix</h3>
        <ProductMatrix topProducts={topProducts} />
      </div>

      {/* 6. Aksiyon Takip */}
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ListTodo size={18} /> Action Tracking Dashboard
        </h3>
        <ActionTracker key={actionRefreshKey} token={token} apiBase={apiBase} />
      </div>

    </div>
  );
}

export default Dashboard;
