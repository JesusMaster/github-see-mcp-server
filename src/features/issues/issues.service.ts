import GitHubClient from '#services/api';
import { sanitize } from '../../utils/sanitize.js';

// --- Interfaces para Opciones de Métodos ---

export interface GetIssuesOptions { owner: string; repo: string; issueNumber: number; }
export interface GetCommentsOptions { owner: string; repo: string; issueNumber: number; }
export interface CreateIssueOptions { owner: string; repo: string; title: string; body?: string; assignees?: string[]; labels?: string[]; milestone?: number; }
export interface AddCommentOptions { owner: string; repo: string; issueNumber: number; comment: string; }
export interface ListIssuesOptions { owner: string; repo: string; state?: string; labels?: string[]; sort?: string; direction?: string; since?: string; page?: number; per_page?: number; fields?: string[]; }
export interface UpdateIssueOptions { owner: string; repo: string; issueNumber: number; title?: string; body?: string; assignees?: string[]; milestone?: number; state?: string; labels?: string[]; }
export interface SearchIssuesOptions { owner: string; repo: string; q: string; sort?: string; order?: string; page?: number; per_page?: number; fields?: string[]; }

class Issues extends GitHubClient {

    async getIssues(options: GetIssuesOptions) {
        const { owner, repo, issueNumber } = options;
        return this.get(`repos/${owner}/${repo}/issues/${issueNumber}`);
    }

    async getComments(options: GetCommentsOptions) {
        const { owner, repo, issueNumber } = options;
        return this.get(`repos/${owner}/${repo}/issues/${issueNumber}/comments`);
    }

    async createIssue(options: CreateIssueOptions) {
        const { owner, repo, ...payload } = options;
        if (payload.title) payload.title = sanitize(payload.title);
        if (payload.body) payload.body = sanitize(payload.body);
        return this.post(`repos/${owner}/${repo}/issues`, payload);
    }

    async addComment(options: AddCommentOptions) {
        const { owner, repo, issueNumber, comment } = options;
        const payload = { body: sanitize(comment) };
        return this.post(`repos/${owner}/${repo}/issues/${issueNumber}/comments`, payload);
    }

    async listIssues(options: ListIssuesOptions) {
        const { owner, repo, fields, ...params } = options;
        const results = await this.get(`repos/${owner}/${repo}/issues`, { per_page: 5, ...params });
        
        if (fields?.length) {
            return (results as any[]).map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }
        return results;
    }

    async updateIssue(options: UpdateIssueOptions) {
        const { owner, repo, issueNumber, ...payload } = options;
        if (payload.title) payload.title = sanitize(payload.title);
        if (payload.body) payload.body = sanitize(payload.body);
        return this.patch(`repos/${owner}/${repo}/issues/${issueNumber}`, payload);
    }

    async searchIssues(options: SearchIssuesOptions) {
        const { owner, repo, fields, q, ...params } = options;
        const payload = { q: sanitize(q), per_page: 5, ...params };
        const results: any = await this.get('search/issues', payload);
        
        if (fields?.length && results.items) {
            results.items = results.items.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }
        return results;
    }
}

export default Issues;