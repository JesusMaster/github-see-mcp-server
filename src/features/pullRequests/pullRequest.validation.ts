
import { z } from 'zod';

const owner = z.string().min(1, "Owner is required.");
const repo = z.string().min(1, "Repo is required.");
const pullNumber = z.number().int().positive("Pull number must be a positive integer.");
const title = z.string().min(1, "Title is required.");
const head = z.string().min(1, "Head branch is required.");
const base = z.string().min(1, "Base branch is required.");
const path = z.string().min(1, "Path is required.");
const body = z.string().min(1, "Body is required.");

export const getPullRequestSchema = z.object({
  owner,
  repo,
  pullNumber,
});

export const listPullRequestsSchema = z.object({
  owner,
  repo,
  direction: z.enum(['asc', 'desc']).optional(),
  fields: z.array(z.string()).optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().optional(),
  sort: z.string().optional(),
  state: z.string().optional(),
});

export const mergePullRequestSchema = z.object({
  owner,
  repo,
  pullNumber,
  commitMessage: z.string().optional(),
  commit_title: z.string().optional(),
  merge_method: z.enum(['merge', 'squash', 'rebase']).optional(),
});

export const getPullRequestFilesSchema = z.object({
  owner,
  repo,
  pullNumber,
});

export const getPullRequestStatusSchema = z.object({
  owner,
  repo,
  pullNumber,
});

export const updatePullRequestBranchSchema = z.object({
  owner,
  repo,
  pullNumber,
  expectedHeadSha: z.string().optional(),
});

export const getPullRequestCommentsSchema = z.object({
  owner,
  repo,
  pullNumber,
});

export const getPullRequestReviewsSchema = z.object({
  owner,
  repo,
  pullNumber,
});

export const createPullRequestReviewSchema = z.object({
  owner,
  repo,
  pullNumber,
  body: z.string().optional(),
  comments: z.array(z.string()).optional(),
  commitId: z.string().optional(),
  event: z.enum(['approve', 'request_changes', 'comment']).optional(),
});

export const createPullRequestSchema = z.object({
  owner,
  repo,
  title,
  head,
  base,
  body: z.string().optional(),
  draft: z.boolean().optional(),
  maintainer_can_modify: z.boolean().optional(),
});

export const addPullRequestReviewCommentSchema = z.object({
  owner,
  repo,
  pullNumber,
  body,
  path,
  commit_id: z.string().optional(),
  in_reply_to: z.number().int().positive().optional(),
  line: z.number().int().positive().optional(),
  side: z.string().optional(),
  start_line: z.number().int().positive().optional(),
  start_side: z.string().optional(),
  subject_type: z.string().optional(),
});

export const updatePullRequestSchema = z.object({
  owner,
  repo,
  pullNumber,
  base: z.string().optional(),
  body: z.string().optional(),
  maintainer_can_modify: z.boolean().optional(),
  state: z.enum(['open', 'closed']).optional(),
  title: z.string().optional(),
});
