import React from 'react';

interface Props {
  currentStep: number;
}

export const WizardStepper: React.FC<Props> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "1. Room Photo" },
    { num: 2, label: "2. Preferences & Detection" },
    { num: 3, label: "3. Makeover & Shopping" }
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '36px' }}>
      {steps.map(s => (
        <div 
          key={s.num}
          style={{
            padding: '10px 22px',
            borderRadius: '9999px',
            background: currentStep === s.num ? 'var(--sg-primary)' : 'rgba(255,255,255,0.05)',
            color: currentStep === s.num ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '14px',
            border: currentStep === s.num ? 'none' : '1px solid var(--bg-card-border)',
            transition: 'all 0.2s ease'
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
};
