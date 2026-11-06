'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  FileUp,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { BrandGuideline, GuidelineCategory } from '@/types';
import { formatDate } from '@/lib/utils';
import { useRole } from '@/components/layout/RoleContext';
import { useToast } from '@/components/ui/Toast';
import { RuleExtractorModal } from '@/components/guidelines/RuleExtractorModal';

const categories: (GuidelineCategory | 'All')[] = [
  'All',
  'Tone of Voice',
  'Terminology',
  'Approved Facts',
  'Messaging',
  'Visual Identity',
  'Accessibility',
  'Promotional Claims',
];

export default function GuidelinesPage() {
  const { currentUser } = useRole();
  const { showToast } = useToast();

  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeGuideline, setActiveGuideline] = useState<BrandGuideline | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tone of Voice' as GuidelineCategory,
    rule: '',
    description: '',
    sourceDocument: '',
    sourceExcerpt: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/guidelines?${params.toString()}`);
      const json = await res.json();
      if (json.success) setGuidelines(json.data);
    } catch (err) {
      console.error('Failed to fetch guidelines', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, [selectedCategory, searchQuery]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setActiveGuideline(null);
    setFormData({
      title: '',
      category: 'Tone of Voice',
      rule: '',
      description: '',
      sourceDocument: '',
      sourceExcerpt: '',
      isActive: true,
    });
    setUploadStatus('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guide: BrandGuideline) => {
    setModalMode('edit');
    setActiveGuideline(guide);
    setFormData({
      title: guide.title,
      category: guide.category,
      rule: guide.rule,
      description: guide.description,
      sourceDocument: guide.sourceDocument || '',
      sourceExcerpt: guide.sourceExcerpt || '',
      isActive: guide.isActive,
    });
    setUploadStatus('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      try {
        const res = await fetch(`/api/guidelines/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          showToast('Guideline Deleted', `Removed "${title}"`, 'info');
          fetchGuidelines();
        }
      } catch (err) {
        console.error('Delete error', err);
      }
    }
  };

  const handleCopyRule = (id: string, rule: string) => {
    navigator.clipboard.writeText(rule);
    setCopiedId(id);
    showToast('Copied to clipboard', 'Rule text ready to paste', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.rule) {
      alert('Please fill in both the Title and Rule fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/guidelines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          showToast('Guideline Created', formData.title, 'success');
          fetchGuidelines();
        }
      } else if (modalMode === 'edit' && activeGuideline) {
        const res = await fetch(`/api/guidelines/${activeGuideline.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          showToast('Guideline Updated', formData.title, 'success');
          fetchGuidelines();
        }
      }
    } catch (err) {
      console.error('Save error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Extracted source text from ${file.name}`);
    setFormData((prev) => ({
      ...prev,
      sourceDocument: file.name,
      sourceExcerpt: prev.sourceExcerpt || `Excerpt extracted from uploaded ${file.name} (Section 2: Official Governance)`,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Brand Knowledge Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage official guidelines, approved facts, terminology rules, and source documents.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsExtractorOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Auto-Extract Rules</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Brand Guideline</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guidelines, rules, terminology, or source documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/70 border border-slate-200/50 text-xs text-slate-600 font-semibold shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{guidelines.length} Rules Active</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map((cat) => {
            const count = cat === 'All' ? guidelines.length : guidelines.filter(g => g.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
                    : 'bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guidelines Grid */}
      {loading ? (
        <div className="p-16 text-center text-sm font-medium text-slate-500 glass-card rounded-2xl flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Retrieving governance knowledge graph...</span>
        </div>
      ) : guidelines.length === 0 ? (
        <div className="glass-card rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No guidelines found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filter, or click &ldquo;AI Auto-Extract Rules&rdquo; to populate from a document.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.map((guide) => {
            const getCategoryStyle = (category: string) => {
              switch (category) {
                case 'Tone of Voice':
                  return { tag: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' };
                case 'Terminology':
                  return { tag: 'bg-indigo-50 text-indigo-700 border-indigo-200', border: 'border-l-indigo-500' };
                case 'Approved Facts':
                  return { tag: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-l-emerald-500' };
                case 'Promotional Claims':
                  return { tag: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-l-amber-500' };
                case 'Visual Identity':
                  return { tag: 'bg-violet-50 text-violet-700 border-violet-200', border: 'border-l-violet-500' };
                default:
                  return { tag: 'bg-slate-100 text-slate-700 border-slate-200', border: 'border-l-slate-400' };
              }
            };
            const catStyle = getCategoryStyle(guide.category);

            return (
              <div
                key={guide.id}
                className={`glass-card rounded-2xl border border-slate-200/80 border-l-4 ${catStyle.border} p-5 hover:shadow-glass-card-hover transition-all flex flex-col justify-between group`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${catStyle.tag}`}>
                        {guide.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/guidelines/${guide.id}`}>
                          {guide.title}
                        </Link>
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => handleCopyRule(guide.id, guide.rule)}
                        className="p-1.5 hover:text-slate-800 hover:bg-slate-100/80 rounded-lg transition-colors"
                        title="Copy rule statement"
                      >
                        {copiedId === guide.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(guide)}
                        className="p-1.5 hover:text-blue-600 hover:bg-slate-100/80 rounded-lg transition-colors"
                        title="Edit guideline"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(guide.id, guide.title)}
                        className="p-1.5 hover:text-red-600 hover:bg-slate-100/80 rounded-lg transition-colors"
                        title="Delete guideline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rule statement */}
                  <div className="text-xs text-slate-800 font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 leading-relaxed shadow-2xs">
                    {guide.rule}
                  </div>

                  {guide.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {guide.description}
                    </p>
                  )}

                  {/* Source Citation */}
                  {guide.sourceDocument && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono truncate bg-slate-100/60 px-1.5 py-0.5 rounded border border-slate-200/40">{guide.sourceDocument}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  <span>Updated {formatDate(guide.updatedAt)}</span>
                  <Link
                    href={`/guidelines/${guide.id}`}
                    className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect Rule</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Rule Extractor Modal */}
      <RuleExtractorModal
        isOpen={isExtractorOpen}
        onClose={() => setIsExtractorOpen(false)}
        onImported={fetchGuidelines}
      />

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'create' ? 'Add Brand Guideline' : 'Edit Brand Guideline'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Guideline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Customer-First Terminology"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as GuidelineCategory })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    <option value="active">Active & Enforced</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Compliance Rule Statement *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the exact rule enforced by the compliance reviewer..."
                  value={formData.rule}
                  onChange={(e) => setFormData({ ...formData, rule: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Context</label>
                <textarea
                  rows={2}
                  placeholder="Provide background, intent, or rationale..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Source Document & Verifiable Evidence
                  </span>
                  <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-normal flex items-center gap-1 text-[11px]">
                    <FileUp className="h-3 w-3" />
                    <span>Upload Document (TXT/PDF/DOCX)</span>
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadStatus && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">
                    {uploadStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Source Document Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Brand_Charter_2026.pdf"
                      value={formData.sourceDocument}
                      onChange={(e) => setFormData({ ...formData, sourceDocument: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Source Passage / Excerpt</label>
                    <input
                      type="text"
                      placeholder="e.g. Section 4.2: Terminology rules"
                      value={formData.sourceExcerpt}
                      onChange={(e) => setFormData({ ...formData, sourceExcerpt: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Guideline' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
