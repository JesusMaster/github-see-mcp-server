import GitHubClient from '#services/api';
import { sanitize } from '../../utils/sanitize.js';

// --- Interfaces para Opciones de Métodos ---

export interface GetPullRequestOptions { owner: string; repo: string; pullNumber: number; }
export interface ListPullRequestsOptions { owner: string; repo: string; state?: string; sort?: string; direction?: string; perPage?: number; page?: number; fields?: string[]; }
export interface MergePullRequestOptions { owner: string; repo: string; pullNumber: number; commitMessage?: string; commit_title?: string; merge_method?: string; }
export interface GetPullRequestFilesOptions { owner: string; repo: string; pullNumber: number; }
export interface GetPullRequestStatusOptions { owner: string; repo: string; pullNumber: number; }
export interface UpdatePullRequestBranchOptions { owner: string; repo: string; pullNumber: number; expected_head_sha?: string; }
export interface GetPullRequestCommentsOptions { owner: string; repo: string; pullNumber: number; }
export interface GetPullRequestReviewsOptions { owner: string; repo: string; pullNumber: number; }
export interface CreatePullRequestReviewOptions { owner: string; repo: string; pullNumber: number; body?: string; event?: string; commitId?: string; comments?: string[]; }
export interface CreatePullRequestOptions { owner: string; repo: string; title: string; head: string; base: string; body?: string; draft?: boolean; maintainer_can_modify?: boolean; }
export interface AddPullRequestReviewCommentOptions { owner: string; repo: string; pullNumber: number; body: string; path: string; commit_id?: string; in_reply_to?: number; subject_type?: string; line?: number; side?: string; start_line?: number; start_side?: string; }
export interface UpdatePullRequestOptions { owner: string; repo: string; pullNumber: number; title?: string; body?: string; state?: string; base?: string; maintainer_can_modify?: boolean; }

class PullRequest extends GitHubClient {

    async getPullRequest(options: GetPullRequestOptions, token: string) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}`, {}, token);
    }

    async getListPullRequests(options: ListPullRequestsOptions, token: string) {
        const { owner, repo, fields, ...params } = options;
        const payload = { state: "open", per_page: 5, page: 1, ...params };
        const results = await this.get(`repos/${owner}/${repo}/pulls`, payload, token);

        if (fields?.length) {
            return (results as any[]).map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => {
                    if (item.hasOwnProperty(field)) filteredItem[field] = item[field];
                });
                return filteredItem;
            });
        }
        return results;
    }

    async mergePullRequest(options: MergePullRequestOptions, token: string) {
        const { owner, repo, pullNumber, ...payload } = options;
        if (payload.commit_title) payload.commit_title = sanitize(payload.commit_title);
        if (payload.commitMessage) payload.commitMessage = sanitize(payload.commitMessage);
        return this.put(`repos/${owner}/${repo}/pulls/${pullNumber}/merge`, payload, token);
    }

    async getPullRequestFiles(options: GetPullRequestFilesOptions, token: string) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/files`, {}, token);
    }

    async getPullRequestStatus(options: GetPullRequestStatusOptions, token: string) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {}, token);
    }

    async updatePullRequestBranch(options: UpdatePullRequestBranchOptions, token: string) {
        const { owner, repo, pullNumber, ...params } = options;
        return this.put(`repos/${owner}/${repo}/pulls/${pullNumber}/update-branch`, params, token);
    }

    async getPullRequestComments(options: GetPullRequestCommentsOptions, token: string) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/comments`, {}, token);
    }

    async getPullRequestReviews(options: GetPullRequestReviewsOptions, token: string) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {}, token);
    }

    async createPullRequestReview(options: CreatePullRequestReviewOptions, token: string) {
        const { owner, repo, pullNumber, commitId, ...rest } = options;
        const payload: any = { ...rest };
        if (payload.body) payload.body = sanitize(payload.body);
        if (commitId) payload.commit_id = commitId;
        return this.post(`repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, payload, token);
    }

    async createPullRequest(options: CreatePullRequestOptions, token: string) {
        const { owner, repo, ...payload } = options;
        if (payload.title) payload.title = sanitize(payload.title);
        if (payload.body) payload.body = sanitize(payload.body);
        return this.post(`repos/${owner}/${repo}/pulls`, payload, token);
    }

    async addPullRequestReviewComment(options: AddPullRequestReviewCommentOptions, token: string) {
        const { owner, repo, pullNumber, ...payload } = options;
        if (payload.body) payload.body = sanitize(payload.body);
        return this.post(`repos/${owner}/${repo}/pulls/${pullNumber}/comments`, payload, token);
    }

    async updatePullRequest(options: UpdatePullRequestOptions, token: string) {
        const { owner, repo, pullNumber, ...payload } = options;
        if (payload.title) payload.title = sanitize(payload.title);
        if (payload.body) payload.body = sanitize(payload.body);
        return this.patch(`repos/${owner}/${repo}/pulls/${pullNumber}`, payload, token);
    }
}

export default PullRequest;
