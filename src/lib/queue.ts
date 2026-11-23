import type { ContentSubmission, SubmissionStatus } from '@/types';

export type QueueView = 'all' | 'created' | 'assigned';
export type QueueSort = 'updated' | 'oldest' | 'lowest-score';

export function getQueueResults(
  submissions: ContentSubmission[],
  filters: {
    status: SubmissionStatus | 'all';
    query: string;
    view: QueueView;
    sort: QueueSort;
    userId: string;
  },
) {
  const query = filters.query.trim().toLowerCase();
  const results = submissions.filter((submission) => {
    if (filters.status !== 'all' && submission.status !== filters.status) return false;
    if (filters.view === 'created' && submission.creatorId !== filters.userId) return false;
    if (filters.view === 'assigned' && submission.reviewerId !== filters.userId) return false;
    return [submission.title, submission.contentType, submission.creatorName, submission.rawText, submission.currentText]
      .some((value) => value.toLowerCase().includes(query));
  });

  return results.sort((a, b) => {
    if (filters.sort === 'lowest-score') {
      const scoreA = a.latestReview?.compliance_score ?? Infinity;
      const scoreB = b.latestReview?.compliance_score ?? Infinity;
      if (scoreA !== scoreB) return scoreA - scoreB;
    }
    if (filters.sort === 'oldest') return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[\t\r\n]|^\s*[=+\-@]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function queueToCsv(submissions: ContentSubmission[]) {
  const columns = ['Title', 'Content type', 'Status', 'Creator', 'Reviewer', 'Compliance score', 'Created', 'Updated'];
  const rows = submissions.map((submission) => [
    submission.title,
    submission.contentType,
    submission.status.replace(/_/g, ' '),
    submission.creatorName,
    submission.reviewerName ?? '',
    submission.latestReview?.compliance_score ?? '',
    submission.createdAt,
    submission.updatedAt,
  ]);
  return [columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}
