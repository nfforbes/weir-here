export type Persona = 'administrator' | 'user';

export interface IUser {
  _id?: string;
  auth0Id: string;
  email: string;
  name: string;
  personas: Persona[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestimonial {
  _id?: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  context: string;
  avatarUrl: string;
  published: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'temporary'
  | 'internship';

export interface IScreeningQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'text';
  required: boolean;
}

export interface ISalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface IJob {
  _id?: string;
  title: string;
  slug: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  responsibilities: string;
  requirements: string;
  howToApply: string;
  salaryRange: ISalaryRange;
  categories: string[];
  tags: string[];
  expiresAt: string;
  screeningQuestions: IScreeningQuestion[];
  skills: string[];
  benefits: string[];
  attachmentPaths: string[];
  reviewerEmails: string[];
  postedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IScreeningAnswer {
  questionId: string;
  answer: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected';

export interface IApplication {
  _id?: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  answers: IScreeningAnswer[];
  resumePath: string;
  status: ApplicationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface IReview {
  _id?: string;
  applicationId: string;
  reviewerId: string;
  rating: number;
  eliminated: boolean;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IInvite {
  _id?: string;
  email: string;
  jobId: string;
  invitedBy: string;
  token: string;
  accepted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISystemSetting {
  _id?: string;
  key: string;
  value: string;
  updatedBy: string;
  updatedAt?: string;
}

export interface IMenuItem {
  label: string;
  path: string;
  icon: string;
  requiredPersonas?: Persona[];
  requiresAuth?: boolean;
  children?: IMenuItem[];
}
