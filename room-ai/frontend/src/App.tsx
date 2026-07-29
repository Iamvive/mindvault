import React, { useState } from 'react';
import { WizardStepper } from './components/WizardStepper';
import { UploadStep } from './components/UploadStep';
import { PreferencesStep } from './components/PreferencesStep';
import { MakeoverView } from './components/MakeoverView';
import { RoomAnalysisResult, MakeoverRequest, MakeoverResponse } from './types/room';

export const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<RoomAnalysisResult | null>(null);
  const [makeoverResult, setMakeoverResult] = useState<MakeoverResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImagesSelect = async (files: File[], urls: string[]) => {
    setSelectedFiles(files);
    setPreviewUrls(urls);
    setLoading(true);

    const formData = new FormData();
    files.forEach(f => formData.append('images', f));

    try {
      const res = await fetch('/api/analyze-room', { method: 'POST', body: formData });
      const data = await res.json();
      setAnalysis(data);
      setStep(2);
    } catch (err) {
      console.error('Failed to analyze room:', err);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMakeover = async (request: MakeoverRequest) => {
    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(f => formData.append('images', f));
      formData.append('payload', JSON.stringify(request));

      const res = await fetch('/api/generate-makeover', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setMakeoverResult(data);
      setStep(3);
    } catch (err) {
      console.error('Failed to generate makeover:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setAnalysis(null);
    setMakeoverResult(null);
  };

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '40px 24px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(230,0,35,0.1)', color: 'var(--sg-primary)', padding: '6px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
          ✨ AI-Powered Spatial Makeovers
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '10px' }}>RoomAI</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '640px', margin: '0 auto' }}>
          Upload up to 4 photos of your room, specify what to add and keep, and get realistic AI visualizations & shoppable furniture recommendations.
        </p>
      </header>

      <WizardStepper currentStep={step} />

      {step === 1 && (
        <UploadStep onImagesSelected={handleImagesSelect} loading={loading} />
      )}

      {step === 2 && (
        <PreferencesStep 
          previewUrl={previewUrls.length > 0 ? previewUrls[0] : ''} 
          analysis={analysis} 
          onSubmit={handleGenerateMakeover}
          loading={loading}
        />
      )}

      {step === 3 && makeoverResult && (
        <MakeoverView 
          originalPreviewUrl={previewUrls.length > 0 ? previewUrls[0] : ''} 
          makeoverResponse={makeoverResult} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
};

export default App;
