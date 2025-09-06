
import { z } from 'zod';

const owner = z.string().min(1, "Owner is required.");
const repo = z.string().min(1, "Repo is required.");
const issueNumber = z.number().int().positive("Issue number must be a positive integer.");
const title = z.string().min(1, "Title is required.");
const comment = z.string().min(1, "Comment is required.");
const query = z.string().min(1, "Query is required.");

export const getIssueSchema = z.object({
  owner,
  repo,
  issueNumber,
});

export const getIssueCommentsSchema = z.object({
  owner,
  repo,
  issueNumber,
});

export const createIssueSchema = z.object({
  owner,
  repo,
  title,
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  milestone: z.number().int().positive().optional(),
});

export const addIssueCommentSchema = z.object({
  owner,
  repo,
  issueNumber,
  comment,
});

export const listIssuesSchema = z.object({
  owner,
  repo,
  direction: z.enum(['asc', 'desc']).optional(),
  labels: z.array(z.string()).optional(),
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().optional(),
  since: z.string().datetime().optional(),
  sort: z.enum(['created', 'updated', 'comments']).optional(),
  state: z.enum(['open', 'closed', 'all']).optional(),
});

export const updateIssueSchema = z.object({
  owner,
  repo,
  issueNumber,
  title: z.string().optional(),
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  milestone: z.number().int().positive().optional(),
  state: z.enum(['open', 'closed']).optional(),
});

export const searchIssuesSchema = z.object({
  owner,
  repo,
  q: query,
  fields: z.array(z.string()).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().optional(),
  sort: z.enum(['created', 'updated', 'comments']).optional(),
});
