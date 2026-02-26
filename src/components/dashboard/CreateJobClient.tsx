'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  MenuItem,
  Divider,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Freelance'];

interface ScreeningQuestion {
  question: string;
  type: 'yesno' | 'text';
  required: boolean;
}

interface Props {
  companies: { _id: string; name: string }[];
}

export default function CreateJobClient({ companies }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [companyId, setCompanyId] = useState(companies.length === 1 ? companies[0]._id : '');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [howToApply, setHowToApply] = useState('In-platform application');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [categoriesStr, setCategoriesStr] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [benefitsStr, setBenefitsStr] = useState('');
  const [reviewerEmailsStr, setReviewerEmailsStr] = useState('');
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [publishNow, setPublishNow] = useState(false);

  const addQuestion = () =>
    setScreeningQuestions([...screeningQuestions, { question: '', type: 'text', required: false }]);

  const removeQuestion = (i: number) =>
    setScreeningQuestions(screeningQuestions.filter((_, idx) => idx !== i));

  const updateQuestion = (i: number, field: keyof ScreeningQuestion, value: string | boolean) => {
    const copy = [...screeningQuestions];
    copy[i] = { ...copy[i], [field]: value } as ScreeningQuestion;
    setScreeningQuestions(copy);
  };

  const split = (s: string) =>
    s
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    if (!companyId || !title || !location || !employmentType || !description || !responsibilities || !requirements) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let attachmentUrls: string[] = [];
      if (attachmentFile) {
        const fd = new FormData();
        fd.append('file', attachmentFile);
        fd.append('target', 'jobAttachment');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          attachmentUrls = [data.url];
        }
      }

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          title,
          location,
          employmentType,
          description,
          responsibilities,
          requirements,
          howToApply,
          salaryRange: {
            min: salaryMin ? Number(salaryMin) : undefined,
            max: salaryMax ? Number(salaryMax) : undefined,
            currency: salaryCurrency,
          },
          categories: split(categoriesStr),
          tags: split(tagsStr),
          skills: split(skillsStr),
          benefits: split(benefitsStr),
          reviewerEmails: split(reviewerEmailsStr),
          screeningQuestions: screeningQuestions.filter((q) => q.question.trim()),
          attachmentUrls,
          status: publishNow ? 'published' : 'draft',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'Failed to create job');
      }

      const jobId = (data as { job?: { _id?: string } }).job?._id;
      if (split(reviewerEmailsStr).length > 0 && jobId) {
        await fetch('/api/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: split(reviewerEmailsStr), jobId }),
        }).catch(() => {});
      }

      router.push('/dashboard/talent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Create Job Posting
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {companies.length > 1 && (
            <TextField label="Company *" select value={companyId} onChange={(e) => setCompanyId(e.target.value)} fullWidth>
              {companies.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          {companies.length === 1 && (
            <Chip label={`Company: ${companies[0].name}`} color="primary" />
          )}

          <TextField label="Job Title *" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Location *" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Province, Country or Remote" fullWidth />
          <TextField label="Employment Type *" select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} fullWidth>
            {EMPLOYMENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Description *" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
          <TextField label="Responsibilities *" multiline rows={3} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} fullWidth />
          <TextField label="Requirements *" multiline rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)} fullWidth />
          <TextField label="How to Apply *" value={howToApply} onChange={(e) => setHowToApply(e.target.value)} fullWidth placeholder="URL, email, or In-platform application" />

          <Divider />
          <Typography variant="h6">Salary Range</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Min" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} sx={{ flex: 1 }} />
            <TextField label="Max" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} sx={{ flex: 1 }} />
            <TextField label="Currency" value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} sx={{ width: 100 }} />
          </Box>

          <TextField label="Categories" value={categoriesStr} onChange={(e) => setCategoriesStr(e.target.value)} placeholder="Comma-separated" fullWidth />
          <TextField label="Tags" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="Comma-separated" fullWidth />
          <TextField label="Skills" value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} placeholder="Comma-separated" fullWidth />
          <TextField label="Benefits" value={benefitsStr} onChange={(e) => setBenefitsStr(e.target.value)} placeholder="Comma-separated" fullWidth />

          <Divider />
          <Typography variant="h6">Screening Questions (Optional)</Typography>
          {screeningQuestions.map((q, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField label="Question" size="small" value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)} sx={{ flex: 1 }} />
                <TextField label="Type" size="small" select value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)} sx={{ width: 120 }}>
                  <MenuItem value="yesno">Yes / No</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                </TextField>
                <IconButton onClick={() => removeQuestion(i)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
          <Button startIcon={<AddIcon />} onClick={addQuestion} size="small">
            Add Screening Question
          </Button>

          <Divider />
          <Typography variant="h6">Attachment (Optional)</Typography>
          <input type="file" accept=".pdf" onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} />

          <Divider />
          <Typography variant="h6">Reviewers (Optional)</Typography>
          <TextField
            label="Reviewer Emails"
            value={reviewerEmailsStr}
            onChange={(e) => setReviewerEmailsStr(e.target.value)}
            placeholder="Comma-separated emails"
            helperText="If a reviewer does not have an account, they will receive an invite."
            fullWidth
          />

          <FormControlLabel
            control={<Switch checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />}
            label="Publish immediately"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button variant="contained" size="large" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create Job Posting'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
