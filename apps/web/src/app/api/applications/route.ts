import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getApiAuthUser } from '@/lib/apiAuth';
import { connectDB } from '@/lib/mongodb';
import {
  isSharePointUploadConfigured,
  sendMailViaGraph,
  uploadToSharePoint,
} from '@/lib/ms365';
import { escapeHtml, loadApplicationsMailRouting } from '@/lib/mailRouting';
import { getPublicSiteUrl } from '@/lib/siteUrl';
import { canAccessJobApplications } from '@/lib/jobApplicationAccess';
import Application from '@/models/Application';
import Job from '@/models/Job';
import type { ScreeningQuestionDoc } from '@/models/Job';
import type { ScreeningAnswerDoc } from '@/models/Application';

function buildJobApplicationEmailHtml(params: {
  jobTitle: string;
  jobLocation: string;
  jobEmploymentType: string;
  jobId: string;
  jobPublicUrl: string;
  applicantName: string;
  applicantEmail: string;
  applicantAuth0Sub: string;
  resumeUrl: string;
  resumeStoredInSharePoint: boolean;
  applicationId: string;
  screeningQuestions: Array<{ id: string; question: string }>;
  answers: ScreeningAnswerDoc[];
  pdfAttached: boolean;
}): string {
  const answersBlock =
    params.answers.length > 0
      ? params.answers
          .map((a) => {
            const q = params.screeningQuestions.find((sq) => sq.id === a.questionId);
            const label = q?.question ?? a.questionId;
            return `<p><strong>${escapeHtml(label)}</strong><br/>${escapeHtml(a.answer).replace(/\n/g, '<br/>')}</p>`;
          })
          .join('')
      : '<p><em>No screening answers submitted.</em></p>';

  let resumeLine: string;
  if (params.resumeStoredInSharePoint && params.resumeUrl) {
    resumeLine = `<p><strong>Resume (SharePoint):</strong> <a href="${escapeHtml(params.resumeUrl)}">${escapeHtml(params.resumeUrl)}</a></p>`;
  } else if (params.pdfAttached) {
    resumeLine =
      '<p><strong>Resume:</strong> PDF is attached to this email (not stored in SharePoint).</p>';
  } else {
    resumeLine = '<p><strong>Resume:</strong> No file was submitted.</p>';
  }
  const attachLine = params.pdfAttached
    ? '<p><strong>Attachment:</strong> Applicant&rsquo;s resume PDF is attached.</p>'
    : '';

  return `
    <h2>New job application</h2>
    <p><strong>Job:</strong> ${escapeHtml(params.jobTitle)}</p>
    <p><strong>Location:</strong> ${escapeHtml(params.jobLocation)} &nbsp;|&nbsp; <strong>Type:</strong> ${escapeHtml(params.jobEmploymentType)}</p>
    <p><strong>Job listing:</strong> <a href="${escapeHtml(params.jobPublicUrl)}">${escapeHtml(params.jobPublicUrl)}</a> &nbsp;|&nbsp; <strong>Job ID:</strong> ${escapeHtml(params.jobId)}</p>
    <h3>Applicant (logged-in account)</h3>
    <p><strong>Name:</strong> ${escapeHtml(params.applicantName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(params.applicantEmail)}</p>
    <p><strong>Auth0 user id:</strong> ${escapeHtml(params.applicantAuth0Sub)}</p>
    <p><strong>Application record ID:</strong> ${escapeHtml(params.applicationId)}</p>
    ${resumeLine}
    ${attachLine}
    <h3>Screening answers</h3>
    ${answersBlock}
  `;
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getApiAuthUser(request);
    if (!sessionUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const jobId = request.nextUrl.searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'jobId query param is required' }, { status: 400 });

    await connectDB();
    const job = await Job.findById(jobId)
      .select('postedBy reviewerEmails')
      .lean<{ postedBy: string; reviewerEmails?: string[] | null } | null>();
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const allowed = await canAccessJobApplications(sessionUser, job);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const applications = await Application.find({ jobId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ applications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getApiAuthUser(request);
    if (!sessionUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (!sessionUser.emailVerified) return NextResponse.json({ error: 'Email not verified' }, { status: 403 });

    await connectDB();

    const contentType = request.headers.get('content-type') || '';
    let jobId: string;
    let answers: unknown = [];
    let resumePath = '';
    let resumeAttachment: { name: string; buffer: Buffer } | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      jobId = String(formData.get('jobId') ?? '');
      const answersRaw = formData.get('answers');
      if (typeof answersRaw === 'string') {
        try {
          answers = JSON.parse(answersRaw) as unknown;
        } catch {
          answers = [];
        }
      }
      const resume = formData.get('resume');
      if (resume instanceof File && resume.size > 0) {
        const buffer = Buffer.from(await resume.arrayBuffer());
        const fileName = resume.name?.trim() || 'resume.pdf';
        resumeAttachment = { name: fileName, buffer };
        const spReady = await isSharePointUploadConfigured();
        if (spReady) {
          try {
            resumePath = await uploadToSharePoint('resume', fileName, buffer);
          } catch (uploadErr) {
            console.error('[applications] SharePoint upload failed; saving application without stored file:', uploadErr);
            resumePath = '';
          }
        } else {
          resumePath = '';
        }
      }
    } else {
      const body = (await request.json()) as {
        jobId?: string;
        answers?: unknown;
        resumePath?: string;
      };
      jobId = body.jobId ?? '';
      answers = body.answers ?? [];
      resumePath = body.resumePath ?? '';
    }

    if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 });

    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const existing = await Application.findOne({ jobId, applicantId: sessionUser.sub });
    if (existing) return NextResponse.json({ error: 'You have already applied to this job' }, { status: 409 });

    const answersList = (Array.isArray(answers) ? answers : []) as ScreeningAnswerDoc[];

    const applicantName =
      sessionUser.name?.trim() ||
      sessionUser.email?.trim() ||
      'Applicant';
    const applicantEmailRequired = sessionUser.email?.trim();
    if (!applicantEmailRequired) {
      return NextResponse.json({ error: 'Your account has no email address' }, { status: 400 });
    }

    const baseUrl = getPublicSiteUrl();
    const jobPublicUrl = `${baseUrl}/jobs/${jobId}`;

    const application = await Application.create({
      jobId,
      applicantId: sessionUser.sub,
      applicantName,
      applicantEmail: applicantEmailRequired,
      answers: answersList,
      resumePath: resumePath || '',
    });

    try {
      const routing = await loadApplicationsMailRouting();
      if (!routing) {
        console.warn(
          '[applications] Skipping notification email: Microsoft 365 mail is not configured (MS365_MAIL_FROM).',
        );
      } else {
        const html = buildJobApplicationEmailHtml({
          jobTitle: job.title,
          jobLocation: job.location,
          jobEmploymentType: job.employmentType,
          jobId,
          jobPublicUrl,
          applicantName,
          applicantEmail: applicantEmailRequired,
          applicantAuth0Sub: sessionUser.sub,
          resumeUrl: resumePath || '',
          resumeStoredInSharePoint: Boolean(resumePath),
          applicationId: String(application._id),
          screeningQuestions: job.screeningQuestions.map((q: ScreeningQuestionDoc) => ({
            id: q.id,
            question: q.question,
          })),
          answers: answersList,
          pdfAttached: Boolean(resumeAttachment),
        });
        await sendMailViaGraph(routing.sendAs, {
          recipients: routing.recipients,
          replyTo: applicantEmailRequired,
          subject: `New job application: ${job.title}`,
          bodyHtml: html,
          attachments: resumeAttachment
            ? [
                {
                  name: resumeAttachment.name,
                  contentType: 'application/pdf',
                  contentBytes: resumeAttachment.buffer.toString('base64'),
                },
              ]
            : undefined,
        });
      }
    } catch (mailErr) {
      console.error('[applications] Notification email failed:', mailErr);
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
