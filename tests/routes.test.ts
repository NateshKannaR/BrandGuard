import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it } from 'vitest';
import * as analytics from '@/app/api/analytics/route';
import * as reset from '@/app/api/demo/reset/route';
import * as guidelines from '@/app/api/guidelines/route';
import * as guideline from '@/app/api/guidelines/[id]/route';
import * as review from '@/app/api/review/route';
import * as visual from '@/app/api/visual-review/route';
import * as submissions from '@/app/api/submissions/route';
import * as submission from '@/app/api/submissions/[id]/route';
import * as comments from '@/app/api/submissions/[id]/comment/route';
import * as revisions from '@/app/api/submissions/[id]/revision/route';
import * as transitions from '@/app/api/submissions/[id]/transition/route';
import * as users from '@/app/api/users/route';

const url = 'http://localhost/api';
function request(body?: object, method = 'POST') {
  return new NextRequest(url, body === undefined ? undefined : {
    method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
  });
}

describe('BrandGuard API workflows', () => {
  beforeEach(async () => {
    expect((await reset.POST()).status).toBe(200);
  });

  it('reviews copy, submits with context, requests changes, revises, approves and updates metrics', async () => {
    const initialMetrics = (await (await analytics.GET()).json()).data;
    const { users: availableUsers } = (await (await users.GET()).json()).data;
    const creator = availableUsers.find((user: { role: string }) => user.role === 'creator');
    const reviewer = availableUsers.find((user: { role: string }) => user.role === 'reviewer');
    expect((await (await users.POST(request({ userId: creator.id }))).json()).data.id).toBe(creator.id);

    const rawText = 'NovaTech delivers an unmatched 100% unbreakable uptime guarantee.';
    const result = await review.POST(request({ content: rawText }));
    expect(result.status).toBe(200);
    const assessment = (await result.json()).data;
    expect(assessment.mode).toBe('demo_rules');
    expect(assessment.issues.length).toBeGreaterThan(0);

    const created = await submissions.POST(request({ title: 'API launch check', rawText, latestReview: assessment, reviewerNote: '  Check the launch claims.  ' }));
    expect(created.status).toBe(201);
    const item = (await created.json()).data;
    const context = { params: { id: item.id } };
    expect(item.comments[0]).toMatchObject({ authorId: creator.id, text: 'Check the launch claims.' });
    expect(item.status).toBe('submitted');

    const filtered = await submissions.GET(new NextRequest(url + '?status=submitted&q=API%20launch'));
    expect((await filtered.json()).data.map(({ id }: { id: string }) => id)).toEqual([item.id]);
    expect((await (await users.POST(request({ userId: reviewer.id }))).json()).data.id).toBe(reviewer.id);
    expect((await (await users.GET()).json()).data.currentUser.id).toBe(reviewer.id);
    expect((await comments.POST(request({ text: 'Please adjust the uptime claim.' }), context)).status).toBe(200);
    expect((await transitions.POST(request({ status: 'changes_requested', reason: 'Claim needs evidence' }), context)).status).toBe(200);
    expect((await revisions.POST(request({ content: 'NovaTech offers cloud hosting.' }), context)).status).toBe(200);
    expect((await transitions.POST(request({ status: 'approved' }), context)).status).toBe(200);

    const final = (await (await submission.GET(request(), context)).json()).data;
    expect(final).toMatchObject({ status: 'approved', reviewerId: reviewer.id, currentText: 'NovaTech offers cloud hosting.' });
    expect(final.revisions).toHaveLength(2);
    expect(final.comments).toHaveLength(3);
    expect(final.approvedAt).toBeTruthy();
    expect((await (await analytics.GET()).json()).data.approvedCount).toBe(initialMetrics.approvedCount + 1);
  });

  it('creates, finds, edits and deletes a guideline', async () => {
    const created = await guidelines.POST(request({ title: 'Campaign evidence', category: 'Approved Facts', rule: 'Cite a source.' }));
    expect(created.status).toBe(201);
    const { id } = (await created.json()).data;
    const context = { params: { id } };
    expect((await guideline.GET(request(), context)).status).toBe(200);
    const updated = await guideline.PUT(request({ rule: 'Cite the latest source.' }, 'PUT'), context);
    expect((await updated.json()).data.rule).toBe('Cite the latest source.');
    expect((await guideline.DELETE(request(), context)).status).toBe(200);
    expect((await guideline.GET(request(), context)).status).toBe(404);
  });

  it('evaluates an uploaded PNG using the supplied palette and validates empty inputs', async () => {
    const body = new FormData();
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVZ0AAAAASUVORK5CYII=', 'base64');
    body.append('image', new Blob([png], { type: 'image/png' }), 'sample.png');
    body.append('detectedPalette', JSON.stringify(['#0F172A', '#2563EB']));
    const evaluated = await visual.POST(new NextRequest(url, { method: 'POST', body }));
    expect(evaluated.status).toBe(200);
    expect((await evaluated.json()).data.mode).toBe('demo_vision');
    expect((await visual.POST(new NextRequest(url, { method: 'POST', body: new FormData() }))).status).toBe(400);
    expect((await review.POST(request({ content: ' ' }))).status).toBe(400);
    expect((await submissions.POST(request({ title: 'Missing copy' }))).status).toBe(400);
  });

  it('restores seeded records after they are edited', async () => {
    const original = (await (await submissions.GET(request())).json()).data[0];
    const context = { params: { id: original.id } };
    await revisions.POST(request({ content: 'Temporary revision' }), context);
    await reset.POST();
    const restored = (await (await submission.GET(request(), context)).json()).data;
    expect(restored.currentText).toBe(original.currentText);
    expect(restored.revisions).toEqual(original.revisions);
  });
});
