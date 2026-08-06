import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  BarChart3, 
  Lock, 
  Shield, 
  CheckCircle, 
  Database, 
  HelpCircle, 
  Layers, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Zap
} from 'lucide-react';

function LandingPage({ handleOpenAuth }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does InsightAI analyze my data?",
      answer: "InsightAI uses advanced machine learning models and large language models to analyze revenue and expense trends from your uploaded Excel or CSV files. It detects anomalies in your data and prepares actionable recommendations to increase profitability."
    },
    {
      question: "Which file formats can I upload?",
      answer: "You can easily upload standard Excel (.xlsx, .xls) and CSV files containing your financial history. The system automatically maps revenue, date, and expense columns. If there is a column name mismatch, it provides an easy mapping interface."
    },
    {
      question: "Is my financial data safe?",
      answer: "Yes, security is our top priority. All your data is encrypted using military-grade encryption (AES-256) at rest and in transit. Our servers are SOC 2 and ISO 27001 compliant, and your financial information is never shared with third parties."
    },
    {
      question: "What does the 'Add to Action' feature in the ChatBot do?",
      answer: "It allows you to add strategic recommendations suggested by our AI advisor to your action list with a single click. Added actions are tracked in the Follow-up List on the Overview page, where you can monitor their status."
    }
  ];

  const features = [
    {
      icon: <Sparkles size={24} style={{ color: '#6366f1' }} />,
      title: "AI-Powered Analysis",
      desc: "Instantly detects hidden fluctuations and growth opportunities in your financial records, producing strategic insights."
    },
    {
      icon: <Layers size={24} style={{ color: '#4f46e5' }} />,
      title: "Advanced Expense Breakdown",
      desc: "Automatically categorizes core expenses such as rent, personnel, marketing, and materials, displaying them in detailed tables."
    },
    {
      icon: <TrendingUp size={24} style={{ color: '#10b981' }} />,
      title: "Financial Trend Charts",
      desc: "Visualizes your income, expense, and profit status on beautiful, interactive Recharts graphs to track your overall performance."
    },
    {
      icon: <MessageSquare size={24} style={{ color: '#d946ef' }} />,
      title: "Smart Autonomous Co-Pilot",
      desc: "An AI assistant that answers any questions about your data and directly saves strategic recommendations to your action list."
    },
    {
      icon: <BarChart3 size={24} style={{ color: '#f59e0b' }} />,
      title: "PDF and Excel Exporting",
      desc: "Download your reports and charts with a single click in professional, presentation-ready PDF or editable Excel formats."
    },
    {
      icon: <Shield size={24} style={{ color: '#06b6d4' }} />,
      title: "Enterprise-Grade Security",
      desc: "Your data is protected by military-grade encryption, hosted on an infrastructure fully compliant with ISO 27001 and SOC 2."
    }
  ];

  return (
    <div style={{ background: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-bg {
          background: linear-gradient(-45deg, #f5f3ff, #e0e7ff, #ffffff, #faf5ff);
          background-size: 400% 400%;
          animation: gradientAnimation 12s ease infinite;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.08);
          border-radius: 16px;
          padding: 2.25rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          backdrop-filter: blur(8px);
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(99, 102, 241, 0.3) !important;
          background: #ffffff !important;
          box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.08), 0 10px 10px -5px rgba(99, 102, 241, 0.03) !important;
        }
        .pricing-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 20px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          backdrop-filter: blur(8px);
        }
        .pricing-card:hover {
          transform: translateY(-6px);
          border-color: rgba(99, 102, 241, 0.2) !important;
          box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.08), 0 10px 10px -5px rgba(99, 102, 241, 0.03) !important;
        }
        .faq-item {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .faq-item:hover {
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }
        .btn-hover-effect {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-hover-effect:hover {
          transform: translateY(-1px);
        }
      `}</style>

      {/* Navigation Header */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1.25rem 2rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>I</div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>InsightAI</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            className="btn btn-hover-effect" 
            onClick={() => handleOpenAuth('login')} 
            style={{ 
              border: 'none', 
              background: 'transparent', 
              color: '#475569', 
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseOver={(e) => e.target.style.color = '#0f172a'}
            onMouseOut={(e) => e.target.style.color = '#475569'}
          >
            Sign In
          </button>
          <button 
            className="btn btn-primary btn-hover-effect" 
            onClick={() => handleOpenAuth('register')}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.95'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg" style={{ 
        padding: '8rem 2rem 6.5rem', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ 
          padding: '0.4rem 1.25rem', borderRadius: 100, border: '1px solid rgba(99, 102, 241, 0.15)',
          background: 'rgba(99, 102, 241, 0.05)', color: '#4f46e5',
          fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.05)'
        }}>
          <Shield size={14} style={{ color: '#6366f1' }} /> ASC 606 & IFRS 15 Compliant Financial Intelligence
        </div>
        
        <h1 style={{ fontSize: '3.75rem', fontWeight: 850, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', maxWidth: '900px', margin: '0 0 1.5rem 0' }}>
          Empower Your Financial Decisions <br />
          with the Power of <span style={{ background: 'linear-gradient(to right, #6366f1, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: '#475569', maxWidth: 650, lineHeight: 1.65, margin: '0 0 2.5rem 0' }}>
          Analyze your expenses with automatic breakdowns, chat with our AI to make critical decisions, and export professional PDF or Excel reports in one click.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary btn-hover-effect" 
            onClick={() => handleOpenAuth('register')} 
            style={{ 
              padding: '0.9rem 2.25rem', 
              fontSize: '1.05rem', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              border: 'none', 
              borderRadius: '8px', 
              color: '#fff', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.95'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Get Started Free <ArrowRight size={18} />
          </button>
          <button 
            className="btn btn-hover-effect" 
            onClick={() => handleOpenAuth('login')}
            style={{ 
              padding: '0.9rem 2.25rem', 
              fontSize: '1.05rem', 
              background: '#ffffff', 
              border: '1px solid #cbd5e1', 
              borderRadius: '8px', 
              color: '#334155', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.borderColor = '#94a3b8';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.borderColor = '#cbd5e1';
            }}
          >
            Try Demo
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={16} style={{ color: '#6366f1' }} /> End-to-End Encryption</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Database size={16} style={{ color: '#6366f1' }} /> Automated Cloud Backups</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={16} style={{ color: '#6366f1' }} /> ISO 27001 Infrastructure</span>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6.5rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Platform Features</h2>
            <p style={{ color: '#475569', maxWidth: 600, margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Modern AI-powered tools designed to help you stay in complete control of your business financials.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="feature-card"
              >
                <div style={{ marginBottom: '1.25rem', display: 'inline-flex', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px' }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>{feat.title}</h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '6.5rem 2rem', background: '#ffffff', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Pricing Built for Your Growth</h2>
            <p style={{ color: '#475569', maxWidth: 600, margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
              No hidden fees. Choose the plan that fits your needs and start analyzing today.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.25rem', alignItems: 'stretch' }}>
            {/* Starter Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Starter</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '2rem', minHeight: '40px' }}>Essential financial analysis for startups and small businesses.</p>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a' }}>$99</span>
                <span style={{ color: '#64748b', fontWeight: 500 }}> / month</span>
              </div>
              <ul style={{ padding: 0, margin: '0 0 3rem 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> 1 User License</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> 10 Excel/CSV Uploads / mo</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> Standard Expense Breakdown</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> AI Chat Assistant Support</li>
              </ul>
              <button 
                onClick={() => handleOpenAuth('register')}
                className="btn-hover-effect"
                style={{ 
                  marginTop: 'auto', 
                  background: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  color: '#334155', 
                  padding: '0.8rem', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#94a3b8';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#cbd5e1';
                }}
              >
                Get Started
              </button>
            </div>

            {/* Professional Plan */}
            <div className="pricing-card" style={{ 
              background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.02) 0%, rgba(255, 255, 255, 0.8) 100%)', 
              border: '2px solid #6366f1', 
              position: 'relative',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 8px 10px -6px rgba(99, 102, 241, 0.05)'
            }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 1.25rem', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' }}>Recommended</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Professional</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '2rem', minHeight: '40px' }}>For growing teams that need advanced reporting and deeper insights.</p>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a' }}>$249</span>
                <span style={{ color: '#64748b', fontWeight: 500 }}> / month</span>
              </div>
              <ul style={{ padding: 0, margin: '0 0 3rem 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> 5 User Licenses</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> Unlimited Data Uploads</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> Advanced Recharts Visuals</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> PDF & Excel Exporting</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> Priority AI Assistant Support</li>
              </ul>
              <button 
                onClick={() => handleOpenAuth('register')}
                className="btn-hover-effect"
                style={{ 
                  marginTop: 'auto', 
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                  border: 'none', 
                  color: '#fff', 
                  padding: '0.85rem', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.95'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Get Started
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Enterprise</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '2rem', minHeight: '40px' }}>For large-scale organizations with advanced security requirements.</p>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>Custom Pricing</span>
              </div>
              <ul style={{ padding: 0, margin: '0 0 3rem 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> Unlimited Users</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> Custom AI Model Training</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> API & ERP Integrations</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> 24/7 Dedicated Support & SLA</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={16} style={{ color: '#6366f1' }} /> SOC 2 & ISO Compliance Suite</li>
              </ul>
              <button 
                onClick={() => handleOpenAuth('register')}
                className="btn-hover-effect"
                style={{ 
                  marginTop: 'auto', 
                  background: '#ffffff', 
                  border: '1px solid #cbd5e1', 
                  color: '#334155', 
                  padding: '0.8rem', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#94a3b8';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#cbd5e1';
                }}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section style={{ padding: '6.5rem 2rem', background: '#f8fafc', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <HelpCircle size={32} style={{ color: '#6366f1' }} /> Frequently Asked Questions
            </h2>
            <p style={{ color: '#475569', fontSize: '1.1rem' }}>Everything you need to know about our platform and security.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {faqs.map((faq, index) => {
              const isSelected = openFaq === index;
              return (
                <div 
                  key={index}
                  className="faq-item"
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    style={{ 
                      width: '100%', 
                      padding: '1.5rem', 
                      background: 'none', 
                      border: 'none', 
                      textAlign: 'left', 
                      color: '#0f172a', 
                      fontSize: '1.1rem', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{faq.question}</span>
                    {isSelected ? <ChevronUp size={20} style={{ color: '#6366f1' }} /> : <ChevronDown size={20} style={{ color: '#64748b' }} />}
                  </button>
                  {isSelected && (
                    <div style={{ 
                      padding: '0 1.5rem 1.5rem 1.5rem', 
                      color: '#475569', 
                      fontSize: '0.95rem', 
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                      paddingTop: '1rem'
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action (CTA) Section */}
      <section style={{ 
        padding: '7rem 2rem', 
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 100%)',
        textAlign: 'center',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Zap size={48} style={{ color: '#f59e0b', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2.75rem', fontWeight: 850, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#0f172a' }}>Step Into the Future of Finance Today</h2>
          <p style={{ color: '#4f46e5', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Accelerate your decision-making with advanced AI analysis. Upload your files and feel the power in seconds.
          </p>
          <button 
            className="btn btn-primary btn-hover-effect" 
            onClick={() => handleOpenAuth('register')} 
            style={{ 
              padding: '1rem 2.5rem', 
              fontSize: '1.1rem', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              border: 'none', 
              borderRadius: '8px', 
              color: '#fff', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.95'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Join Free Today
          </button>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem' }}>No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 2rem 3rem 2rem', textAlign: 'center', color: '#475569', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>I</div>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>InsightAI Enterprise</span>
        </div>
        <p style={{ fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: 1.5, color: '#64748b' }}>
          B2B Enterprise Financial Intelligence & Forecasting Platform. <br />
          All Rights Reserved &copy; 2026 InsightAI.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
          <span>ISO 27001</span>
          <span>&bull;</span>
          <span>SOC 2 Type II</span>
          <span>&bull;</span>
          <span>GDPR & HIPAA Compliant</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
