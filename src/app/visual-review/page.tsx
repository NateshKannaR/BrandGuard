'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  Palette,
  Maximize2,
  UserCheck,
} from 'lucide-react';
import { VisualReviewResult } from '@/types';
import { getSeverityBadgeClass } from '@/lib/utils';

export default function VisualReviewPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisualReviewResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
  };

  const handleLoadSampleAsset = () => {
    // Generate a clean branded SVG canvas sample in base64
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <rect width="100%" height="100%" fill="#F8FAFC"/>
      <rect x="0" y="0" width="800" height="8" fill="#2563EB"/>
      <rect x="24" y="24" width="36" height="36" rx="8" fill="#2563EB"/>
      <text x="70" y="48" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0F172A">NovaTech</text>
      <text x="50" y="160" font-family="sans-serif" font-size="32" font-weight="bold" fill="#0F172A">Next-Generation Cloud Solutions</text>
      <text x="50" y="200" font-family="sans-serif" font-size="16" fill="#64748B">Proven 99.95% audited SLA uptime for modern enterprise teams.</text>
      <rect x="50" y="240" width="180" height="44" rx="8" fill="#0F172A"/>
      <text x="80" y="267" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">Explore Platform</text>
    </svg>`;
    const blob = new Blob([sampleSvg], { type: 'image/svg+xml' });
    const file = new File([blob], 'novatech-cloud-launch-banner.png', { type: 'image/png' });
    setSelectedFile(file);
    setPreviewUrl(`data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`);
    setResult(null);
  };

  const handleRunVisualReview = async () => {
    if (!selectedFile) {
      alert('Please upload an image or load the sample banner.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch('/api/visual-review', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        alert(`Analysis error: ${json.error}`);
      }
    } catch (e) {
      console.error('Visual review failed', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <ImageIcon className="h-4 w-4" />
            Visual Brand Governance (Improvement 2)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Visual Brand Compliance Review</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze visual marketing creatives against approved logo safe zones, color palettes, typography, and contrast.
          </p>
        </div>

        <button
          onClick={handleLoadSampleAsset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Load Sample NovaTech Banner</span>
        </button>
      </div>

      {/* Upload & Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Marketing Creative or Poster</h3>
            <p className="text-xs text-slate-500 mb-4">
              Supported formats: PNG, JPG, JPEG, WEBP. Max file size: 10MB.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
              <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click to upload image or drag & drop</span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunVisualReview}
              disabled={isAnalyzing || !selectedFile}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Inspecting Creative Assets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run Visual Compliance Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-900">Creative Preview</h3>
            {selectedFile && (
              <span className="text-xs text-slate-400 font-mono">{selectedFile.name}</span>
            )}
          </div>

          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-[260px] p-2">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded Creative Preview"
                className="max-h-[300px] w-auto object-contain rounded-lg shadow-xs"
              />
            ) : (
              <div className="text-center text-xs text-slate-400 space-y-1">
                <ImageIcon className="h-8 w-8 text-slate-300 mx-auto" />
                <p>No creative uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Findings & Palette Breakdown */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Assessment Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Visual Assessment
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {result.mode === 'live_vision' ? 'Live Gemini Vision' : 'Heuristic Brand Inspector'}
                </span>
              </div>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                {result.overallSummary}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Visual Score
              </div>
              <div className="text-3xl font-extrabold text-blue-600">
                {result.complianceScore}/100
              </div>
            </div>
          </div>

          {/* Detected Palette Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-blue-600" />
                Detected Color Palette & Brand Consistency
              </h3>
              <span className="text-xs text-slate-400">Target: Navy (#0F172A), Accent Blue (#2563EB)</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {result.detectedPalette.map((hex, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                  <div
                    className="h-6 w-6 rounded border border-slate-300 shadow-xs"
                    style={{ backgroundColor: hex }}
                  />
                  <span>{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Structured Findings List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Visual Brand Findings ({result.findings.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.findings.map((f) => (
                <div
                  key={f.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadgeClass(f.severity)}`}>
                        {f.severity} Severity
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{f.category}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>

                    {f.observedValue && (
                      <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-slate-700">
                        <span className="text-slate-400">Observed: </span>
                        {f.observedValue}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100">
                      <div className="font-semibold text-blue-900 text-[11px] mb-0.5">Approved Rule:</div>
                      <div>{f.expectedRule}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">Confidence: {Math.round(f.confidence * 100)}%</span>
                    {f.requiresHumanReview && (
                      <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Human Verification Recommended
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uncertainty and Limitation Disclosure */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              Explainable AI Visual Governance Transparency
            </div>
            <p>
              Visual compliance estimates color harmony, contrast ratios, and layout margins based on computer vision heuristics and multi-modal models. Where image resolution or vector definitions are ambiguous, items are flagged for explicit human reviewer confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
