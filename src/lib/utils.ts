import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getSeverityBadgeClass(severity: 'High' | 'Medium' | 'Low' | string) {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/10';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10';
    case 'low':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getStatusBadgeClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/10';
    case 'changes_requested':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10';
    case 'in_review':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-600/10';
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10';
    case 'draft':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
