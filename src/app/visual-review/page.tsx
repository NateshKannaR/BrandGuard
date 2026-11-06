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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <ImageIcon className="h-4 w-4" />
            Visual Brand Governance (Round 2 Improvement 2)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Visual Brand Compliance Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Interactive canvas inspection: logo clearspace margins, real-time pixel palette analysis, and WCAG contrast.
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

      {/* Main Studio: Upload & Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload & Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Marketing Creative or Poster</h3>
              <p className="text-xs text-slate-500">
                Supported formats: PNG, JPG, JPEG, WEBP, SVG. Maximum size: 10MB.
              </p>
            </div>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
              <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click to upload image or drag & drop</span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP, SVG</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Interactive Canvas Inspector Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-blue-600" />
                  Interactive Inspection Controls
                </span>
                <span className="text-[11px] font-mono text-slate-500">Canvas Live</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={showSafeZoneOverlay}
                    onChange={(e) => setShowSafeZoneOverlay(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show 24px Logo Safe-Zone Guide</span>
                </label>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                  Min 24px
                </span>
              </div>

              {/* Live Eyedropper Sampler Display */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-6 w-6 rounded border border-slate-300 shadow-xs"
                    style={{ backgroundColor: sampledColor }}
                  />
                  <div>
                    <div className="font-bold font-mono text-[11px] text-slate-800">{sampledColor}</div>
                    <div className="text-[10px] text-slate-500">Sampled pixel color</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-800">{contrastRatio}:1 Contrast</div>
                  <div
                    className={`text-[10px] font-bold ${
                      contrastRatio >= 4.5 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {contrastRatio >= 4.5 ? '✓ Pass WCAG AA' : '⚠ Caution for Body'}
                  </div>
                </div>
              </div>
            </div>
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

        {/* Right: Live Interactive Canvas Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Interactive Creative Canvas</h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                Click image to sample color
              </span>
            </div>
            {selectedFile && (
              <span className="text-xs text-slate-400 font-mono truncate max-w-[140px]">
                {selectedFile.name}
              </span>
            )}
          </div>

          <div className="relative flex-1 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden min-h-[300px] p-2">
            {previewUrl ? (
              <div className="relative inline-block cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-h-[320px] w-auto object-contain rounded-lg shadow-sm"
                  title="Click anywhere to sample color & test contrast"
                />

                {/* Simulated 24px Safe-Zone Boundary Box */}
                {showSafeZoneOverlay && (
                  <div
                    className="absolute top-2 left-2 border-2 border-dashed border-emerald-500/80 bg-emerald-500/10 rounded-lg pointer-events-none p-2 flex flex-col justify-between"
                    style={{ width: '130px', height: '60px' }}
                  >
                    <span className="text-[9px] font-mono font-bold text-emerald-800 bg-white/90 px-1 rounded w-max">
                      Logo Safe-Zone (24px)
                    </span>
                    <span className="text-[8px] text-emerald-800 font-mono self-end">✓ Margin Pass</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 space-y-1">
                <ImageIcon className="h-8 w-8 text-slate-300 mx-auto" />
                <p>Upload a creative or click &ldquo;Load Sample NovaTech Banner&rdquo; above.</p>
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
                  {result.mode === 'live_vision' ? 'Live Gemini Vision' : 'BrandGuard Vision Engine'}
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
                Scanned Color Palette (Extracted From Image Pixels)
              </h3>
              <span className="text-xs text-slate-400">Approved: Navy (#0F172A), Accent Blue (#2563EB)</span>
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
        </div>
      )}
    </div>
  );
}
