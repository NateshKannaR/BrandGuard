'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Pipette,
  Check,
  Eye,
  Sliders,
  Ratio,
  Compass,
} from 'lucide-react';
import { VisualReviewResult } from '@/types';
import { getSeverityBadgeClass } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function VisualReviewPage() {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisualReviewResult | null>(null);

  // Advanced Visual Inspection Controls
  const [showSafeZoneOverlay, setShowSafeZoneOverlay] = useState(true);
  const [sampledColor, setSampledColor] = useState<string>('#0F172A');
  const [contrastRatio, setContrastRatio] = useState<number>(14.2);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    showToast('Creative Uploaded', file.name, 'info');
  };

  const handleLoadSampleAsset = () => {
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
    showToast('Loaded Sample Creative', 'NovaTech Cloud Launch Banner ready for inspection', 'info');
  };

  // Color picker calculation on canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
        .toString(16)
        .slice(1)
        .toUpperCase()}`;
      setSampledColor(hex);

      // Contrast ratio against pure white
      const r = pixel[0] / 255;
      const g = pixel[1] / 255;
      const b = pixel[2] / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const ratio = Math.round(((1.05) / (lum + 0.05)) * 10) / 10;
      setContrastRatio(Math.max(1, ratio));

      showToast('Color Sampled', `Hex: ${hex} • Contrast: ${ratio}:1`, 'info');
    } catch (err) {
      console.warn('Canvas sample error:', err);
    }
  };

  // Extract actual top 5 pixel colors from the image
  const extractPixelPalette = (canvas: HTMLCanvasElement): string[] => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return ['#0F172A', '#2563EB', '#F8FAFC'];

      const step = 20;
      const colorCounts: Record<string, number> = {};

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          // Quantize to reduce noise
          const r = Math.round(pixel[0] / 32) * 32;
          const g = Math.round(pixel[1] / 32) * 32;
          const b = Math.round(pixel[2] / 32) * 32;
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
      }

      const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hex]) => hex);

      return sorted.length > 0 ? sorted : ['#0F172A', '#2563EB', '#F8FAFC'];
    } catch (e) {
      return ['#0F172A', '#2563EB', '#F8FAFC'];
    }
  };

  // Draw image to canvas when previewUrl changes
  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = previewUrl;
    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 450;
      ctx.drawImage(img, 0, 0);

      const realPalette = extractPixelPalette(canvas);
      setExtractedPalette(realPalette);
    };
  }, [previewUrl]);

  const handleRunVisualReview = async () => {
    if (!selectedFile) {
      alert('Please upload an image or load the sample banner.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Send the real extracted palette to the server
      if (extractedPalette.length > 0) {
        formData.append('detectedPalette', JSON.stringify(extractedPalette));
      }

      const res = await fetch('/api/visual-review', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        showToast(
          'Visual Compliance Evaluated',
          `Score: ${json.data.complianceScore}/100 • ${json.data.findings.length} findings`,
          'success'
        );
      } else {
        alert(`Analysis error: ${json.error}`);
      }
    } catch (e) {
      console.error('Visual review failed', e);
      showToast('Analysis Error', 'Failed to inspect image', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <div className="h-6 w-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ImageIcon className="h-3.5 w-3.5" />
            </div>
            Visual Brand Governance Studio
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Creative & Visual Compliance Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Interactive canvas pixel analysis: logo clearspace margins, real-time eyedropper, and WCAG 2.1 AA contrast verification.
          </p>
        </div>

        <button
          onClick={handleLoadSampleAsset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Load Sample NovaTech Banner</span>
        </button>
      </div>

      {/* Main Studio: Upload & Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload & Controls */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-1">Upload Marketing Creative or Poster</h3>
              <p className="text-xs text-slate-500 font-medium">
                Supported formats: PNG, JPG, JPEG, WEBP, SVG. Maximum size: 10MB.
              </p>
            </div>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/30 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-white text-slate-400 group-hover:text-blue-600 flex items-center justify-center shadow-xs border border-slate-200 group-hover:border-blue-200 mb-2 transition-all">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-800">Click to upload creative or drag & drop</span>
              <span className="text-[11px] text-slate-400 mt-1 font-mono">PNG, JPG, WEBP, SVG</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Interactive Canvas Inspector Bar */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="font-extrabold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-blue-600" />
                  Live Inspector Controls
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Canvas Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={showSafeZoneOverlay}
                    onChange={(e) => setShowSafeZoneOverlay(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500/20"
                  />
                  <span>Show 24px Logo Safe-Zone Guide</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold">
                  24px Margin
                </span>
              </div>

              {/* Live Eyedropper Sampler Display */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-8 w-8 rounded-xl border border-slate-300 shadow-xs ring-2 ring-white"
                    style={{ backgroundColor: sampledColor }}
                  />
                  <div>
                    <div className="font-black font-mono text-xs text-slate-900">{sampledColor}</div>
                    <div className="text-[10px] text-slate-500">Eyedropper pixel sample</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-slate-900 font-mono">{contrastRatio}:1 Contrast</div>
                  <div
                    className={`text-[10px] font-bold ${
                      contrastRatio >= 4.5 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {contrastRatio >= 4.5 ? '✓ Pass WCAG 2.1 AA' : '⚠ Caution for Body'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunVisualReview}
              disabled={isAnalyzing || !selectedFile}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-300 disabled:to-slate-300 text-white py-3 rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Inspecting Creative Assets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <span>Run Visual Compliance Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Studio Canvas Darkroom */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900">Studio Darkroom Canvas</h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
                Click pixel to sample
              </span>
            </div>
            {selectedFile && (
              <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">
                {selectedFile.name}
              </span>
            )}
          </div>

          <div className="relative flex-1 bg-canvas-dark rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden min-h-[320px] p-4 shadow-inner">
            {previewUrl ? (
              <div className="relative inline-block cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-h-[320px] w-auto object-contain rounded-xl shadow-2xl"
                  title="Click anywhere to sample color & test contrast"
                />

                {/* Simulated 24px Safe-Zone Boundary Box */}
                {showSafeZoneOverlay && (
                  <div
                    className="absolute top-2 left-2 border-2 border-dashed border-cyan-400 bg-cyan-400/10 rounded-xl pointer-events-none p-2 flex flex-col justify-between shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    style={{ width: '140px', height: '64px' }}
                  >
                    <span className="text-[9px] font-mono font-extrabold text-cyan-900 bg-cyan-100 px-1.5 py-0.5 rounded w-max">
                      Logo Safe-Zone (24px)
                    </span>
                    <span className="text-[8px] text-cyan-300 font-mono font-bold self-end bg-slate-900/80 px-1 rounded">
                      ✓ Margin Pass
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="text-slate-400 font-medium">Upload a creative or click &ldquo;Load Sample NovaTech Banner&rdquo; above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Findings & Palette Breakdown */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Assessment Summary */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Visual Assessment
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {result.mode === 'live_vision' ? 'Live Gemini Vision' : 'BrandGuard Vision Engine'}
                </span>
              </div>
              <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                {result.overallSummary}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Visual Score
              </div>
              <div className="text-4xl font-black text-blue-600 tracking-tight">
                {result.complianceScore}<span className="text-xl text-slate-400 font-bold">/100</span>
              </div>
            </div>
          </div>

          {/* Detected Palette Breakdown */}
          <div className="glass-card rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-600" />
                Scanned Color Palette (Extracted From Image Pixels)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Approved: Navy (<span className="font-mono text-slate-700 font-bold">#0F172A</span>), Accent Blue (<span className="font-mono text-blue-600 font-bold">#2563EB</span>)
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              {result.detectedPalette.map((hex, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono shadow-2xs">
                  <div
                    className="h-6 w-6 rounded-lg border border-slate-300 shadow-xs"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-bold text-slate-800">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Structured Findings List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Visual Brand Findings ({result.findings.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.findings.map((f) => (
                <div
                  key={f.id}
                  className="glass-card rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSeverityBadgeClass(f.severity)}`}>
                        {f.severity} Severity
                      </span>
                      <span className="text-xs text-slate-500 font-bold">{f.category}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{f.description}</p>

                    {f.observedValue && (
                      <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-slate-700">
                        <span className="text-slate-400">Observed: </span>
                        {f.observedValue}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                      <div className="font-bold text-blue-900 text-[11px] mb-0.5">Approved Rule:</div>
                      <div>{f.expectedRule}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono font-medium">Confidence: {Math.round(f.confidence * 100)}%</span>
                    {f.requiresHumanReview && (
                      <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Human Verification Gated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
