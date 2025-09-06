import GitHubClient from '#services/api';

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

    async getPullRequest(options: GetPullRequestOptions) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}`);
    }

    async getListPullRequests(options: ListPullRequestsOptions) {
        const { owner, repo, fields, ...params } = options;
        const payload = { state: "open", per_page: 5, page: 1, ...params };
        const results = await this.get(`repos/${owner}/${repo}/pulls`, payload);

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

    async mergePullRequest(options: MergePullRequestOptions) {
        const { owner, repo, pullNumber, ...payload } = options;
        return this.put(`repos/${owner}/${repo}/pulls/${pullNumber}/merge`, payload);
    }

    async getPullRequestFiles(options: GetPullRequestFilesOptions) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/files`);
    }

    async getPullRequestStatus(options: GetPullRequestStatusOptions) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/merge`);
    }

    async updatePullRequestBranch(options: UpdatePullRequestBranchOptions) {
        const { owner, repo, pullNumber, ...params } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/update-branch`, params);
    }

    async getPullRequestComments(options: GetPullRequestCommentsOptions) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/comments`);
    }

    async getPullRequestReviews(options: GetPullRequestReviewsOptions) {
        const { owner, repo, pullNumber } = options;
        return this.get(`repos/${owner}/${repo}/pulls/${pullNumber}/reviews`);
    }

    async createPullRequestReview(options: CreatePullRequestReviewOptions) {
        const { owner, repo, pullNumber, commitId, ...rest } = options;
        const payload: any = { ...rest };
        if (commitId) payload.commit_id = commitId;
        return this.post(`repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, payload);
    }

    async createPullRequest(options: CreatePullRequestOptions) {
        const { owner, repo, ...payload } = options;
        return this.post(`repos/${owner}/${repo}/pulls`, payload);
    }

    async addPullRequestReviewComment(options: AddPullRequestReviewCommentOptions) {
        const { owner, repo, pullNumber, ...payload } = options;
        return this.post(`repos/${owner}/${repo}/pulls/${pullNumber}/comments`, payload);
    }

    async updatePullRequest(options: UpdatePullRequestOptions) {
        const { owner, repo, pullNumber, ...payload } = options;
        return this.patch(`repos/${owner}/${repo}/pulls/${pullNumber}`, payload);
    }
}

export default PullRequest;
