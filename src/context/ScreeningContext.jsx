import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyzeImage, analyzeDomain } from '../services/api';

const ScreeningContext = createContext(null);

// STAGES:
// IDLE -> UPLOAD_SELECTED -> DOMAIN_CHECKING -> DOMAIN_VALID/DOMAIN_INVALID
// -> PREPROCESSING -> QUALITY_ASSESSMENT -> QUALITY_ACCEPTED/QUALITY_BORDERLINE/QUALITY_UNGRADABLE
// -> AI_ANALYZING -> REPORT_READY -> ERROR

export function ScreeningProvider({ children }) {
  const [currentFile, setCurrentFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // High-level stages
  const [stage, setStage] = useState('IDLE');
  const [error, setError] = useState(null);
  
  // Results from backend
  const [domainResult, setDomainResult] = useState(null);
  const [fullResult, setFullResult] = useState(null);

  const resetScreening = useCallback(() => {
    setCurrentFile(null);
    setPreviewUrl(null);
    setStage('IDLE');
    setError(null);
    setDomainResult(null);
    setFullResult(null);
  }, []);

  const handleFileUpload = useCallback((file) => {
    setCurrentFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStage('UPLOAD_SELECTED');
    setError(null);
    setDomainResult(null);
    setFullResult(null);
  }, []);

  const runDomainCheck = useCallback(async () => {
    if (!currentFile) return;
    
    try {
      setStage('DOMAIN_CHECKING');
      const result = await analyzeDomain(currentFile);
      
      setDomainResult(result.domain_check);
      
      if (result.domain_check.valid) {
        setStage('DOMAIN_VALID');
      } else {
        setStage('DOMAIN_INVALID');
      }
    } catch (err) {
      setError(err.message);
      setStage('ERROR');
    }
  }, [currentFile]);

  const runFullAnalysis = useCallback(async () => {
    if (!currentFile) return;
    
    try {
      setStage('AI_ANALYZING');
      const result = await analyzeImage(currentFile);
      
      setFullResult(result);
      
      if (result.pipeline_stopped) {
        if (result.stop_reason === 'domain_invalid') {
          setStage('DOMAIN_INVALID');
          setDomainResult(result.domain_check);
        } else if (result.stop_reason === 'quality_ungradable') {
          setStage('QUALITY_UNGRADABLE');
        } else {
          setStage('ERROR');
          setError('Pipeline stopped unexpectedly.');
        }
      } else {
        setStage('REPORT_READY');
      }
    } catch (err) {
      setError(err.message);
      setStage('ERROR');
    }
  }, [currentFile]);

  return (
    <ScreeningContext.Provider
      value={{
        currentFile,
        previewUrl,
        stage,
        error,
        domainResult,
        fullResult,
        handleFileUpload,
        runDomainCheck,
        runFullAnalysis,
        resetScreening,
        setStage, // Manual override for specific UI transitions
      }}
    >
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) {
    throw new Error('useScreening must be used within a ScreeningProvider');
  }
  return context;
}
