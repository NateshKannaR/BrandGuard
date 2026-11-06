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
} from 'lucide-react';
import { BrandGuideline, GuidelineCategory } from '@/types';
import { formatDate } from '@/lib/utils';
import { useRole } from '@/components/layout/RoleContext';

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
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    if (confirm(`Are you sure you want to delete the guideline "${title}"? This cannot be undone.`)) {
      try {
        const res = await fetch(`/api/guidelines/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          fetchGuidelines();
        }
      } catch (err) {
        console.error('Failed to delete guideline', err);
      }
    }
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
          fetchGuidelines();
        }
      }
    } catch (err) {
      console.error('Save error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock Document text extractor for knowledge upload
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

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Brand Guideline</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guidelines, rules, terminology, or source documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
            <span>{guidelines.length} guidelines loaded</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guidelines Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Loading guidelines...</div>
      ) : guidelines.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No guidelines found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filter, or create a new guideline to enforce brand standards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {guide.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                      <Link href={`/guidelines/${guide.id}`} className="hover:text-blue-600">
                        {guide.title}
                      </Link>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => handleOpenEdit(guide)}
                      className="p-1.5 hover:text-blue-600 hover:bg-slate-100 rounded"
                      title="Edit guideline"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id, guide.title)}
                      className="p-1.5 hover:text-red-600 hover:bg-slate-100 rounded"
                      title="Delete guideline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rule statement */}
                <div className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
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
                    <span className="font-mono truncate">{guide.sourceDocument}</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Updated {formatDate(guide.updatedAt)}</span>
                <Link
                  href={`/guidelines/${guide.id}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Details</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

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
