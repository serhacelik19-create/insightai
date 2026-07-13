import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('tr-TR')} ₺`;

function OnboardingWizard({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "InsightAI'a Hoş Geldiniz!",
      description: "AI destekli kurumsal finansal analiz platformumuz ile işletmenizin finansal sağlığını en ince detayına kadar analiz edebilir ve yapay zeka destekli akıllı kararlarla büyümenizi hızlandırabilirsiniz.",
      icon: <Sparkles size={48} style={{ color: 'var(--color-primary)' }} />
    },
    {
      title: "Verilerinizi Yükleyin veya Girin",
      description: "Performansınızı ölçümleyebilmemiz için aylık gelir-gider tablolarınızı veya ürün satış detaylarınızı Excel/CSV formatında yükleyebilir ya da manuel olarak veri giriş ekranımızdan sisteme işleyebilirsiniz.",
      icon: <span style={{ fontSize: '3rem' }}>📊</span>
    },
    {
      title: "Keşfetmeye Hazırsınız!",
      description: "Artık platformun tüm özelliklerini keşfetmeye hazırsınız. Yapay zeka asistanımızla konuşabilir, What-If senaryolarını test edebilir veya aksiyonlarınızı Kanban board üzerinden adım adım takip edebilirsiniz.",
      icon: <Check size={48} style={{ color: 'var(--color-success)' }} />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="onboarding-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="onboarding-card" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.5rem'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          title="Kapat / Geç"
        >
          <X size={20} />
        </button>

        <div className="onboarding-progress" style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          <div style={{
            height: '100%',
            width: `${progressPercentage}%`,
            backgroundColor: 'var(--color-primary)',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {steps[currentStep].icon}
        </div>

        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            {steps[currentStep].title}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {steps[currentStep].description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {steps.map((_, idx) => {
            let dotClass = 'onboarding-step-dot';
            if (idx === currentStep) dotClass += ' active';
            else if (idx < currentStep) dotClass += ' completed';

            return (
              <span 
                key={idx} 
                className={dotClass}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: idx === currentStep ? 'var(--color-primary)' : idx < currentStep ? 'var(--color-success)' : 'var(--border-color)',
                  transition: 'background-color 0.2s ease'
                }}
              ></span>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '1rem', gap: '0.75rem' }}>
          {currentStep > 0 ? (
            <button 
              className="btn" 
              onClick={handlePrev}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.6rem 1.25rem' }}
            >
              <ArrowLeft size={16} /> Geri
            </button>
          ) : (
            <button 
              className="btn" 
              onClick={onClose}
              style={{ padding: '0.6rem 1.25rem', color: 'var(--text-secondary)' }}
            >
              Atla
            </button>
          )}

          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.6rem 1.5rem', marginLeft: 'auto' }}
          >
            {currentStep === steps.length - 1 ? (
              <>Başla</>
            ) : (
              <>İleri <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
