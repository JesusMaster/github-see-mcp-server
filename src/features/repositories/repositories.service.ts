import GitHubClient from '#services/api';
import { paginate } from '#utils/pagination';
import { sanitize } from '../../utils/sanitize.js';

// --- Interfaces para Opciones de Métodos ---

export interface CreateFileContentsOptions { owner: string; repo: string; path: string; message: string; content: string; branch?: string; }
export interface UpdateFileContentsOptions { owner: string; repo: string; path: string; message: string; content: string; sha: string; branch?: string; }
export interface ListBranchesOptions { owner: string; repo: string; page?: number; per_page?: number; fetchAll?: boolean; fields?: string[]; }
export interface PushMultipleFilesOptions { owner: string; repo: string; branch: string; commitMessage: string; files: { path: string; content: string }[]; }
export interface CreateRepositoryOptions { name: string; description?: string; privateRepo?: boolean; autoInit?: boolean; }
export interface SearchRepositoriesOptions { query: string; page?: number; per_page?: number; sort?: string; order?: string; fetchAll?: boolean; fields?: string[]; }
export interface GetUserReposOptions { userName: string; page?: number; perPage?: number; fetchAll?: boolean; fields?: string[]; }
export interface GetUserRepoInfoOptions { repoName: string; userName: string; }
export interface GetFileContentsOptions { owner: string; repo: string; path: string; ref?: string; }
export interface CreateForkOptions { owner: string; repo: string; organization?: string; }
export interface GetBranchInfoOptions { owner: string; repo: string; branch: string; }
export interface CreateBranchOptions { owner: string; repo: string; branchName: string; baseBranch: string; }
export interface ListCommitsOptions { owner: string; repo: string; sha?: string; path?: string; page?: number; perPage?: number; fetchAll?: boolean; fields?: string[]; }
export interface GetCommitOptions { owner: string; repo: string; sha?: string; page?: number; perPage?: number; fetchAll?: boolean; fields?: string[]; }
export interface GetSpecificCommitOptions { owner: string; repo: string; sha: string; }

class Repositories extends GitHubClient {
    private isBase64(encodedString: string) {
        return /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(encodedString);
    }

    private _upsertFile(options: CreateFileContentsOptions | UpdateFileContentsOptions, token: string) {
        const { owner, repo, path, ...payload } = options as any;
        if (payload.message) payload.message = sanitize(payload.message);
        if (payload.content && !this.isBase64(payload.content)) {
            payload.content = Buffer.from(sanitize(payload.content)).toString('base64');
        }
        return this.put(`repos/${owner}/${repo}/contents/${sanitize(path)}`, payload, token);
    }

    async createFileContents(options: CreateFileContentsOptions, token: string) {
        return this._upsertFile(options, token);
    }

    async updateFileContents(options: UpdateFileContentsOptions, token: string) {
        return this._upsertFile(options, token);
    }

    async listBranches(options: ListBranchesOptions, token: string) {
        const { owner, repo, fields, fetchAll, ...params } = options;
        const url = `${this.baseUrl}/repos/${owner}/${repo}/branches`;
        const config = { params: { per_page: 5, ...params }, headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
        let results = await paginate(url, config, fetchAll);

        if (fields?.length) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => { if (item.hasOwnProperty(field)) filteredItem[field] = item[field]; });
                return filteredItem;
            });
        }
        return results;
    }

    async pushMultipleFiles(options: PushMultipleFilesOptions, token: string) {
        const { owner, repo, branch, commitMessage, files } = options;
        const branchInfo = await this.get(`repos/${owner}/${repo}/branches/${sanitize(branch)}`, {}, token);
        const baseTreeSha = (branchInfo as any).commit.commit.tree.sha;

        const tree = await this.post(`repos/${owner}/${repo}/git/trees`, {
            base_tree: baseTreeSha,
            tree: files.map((file: { path: string; content: string }) => ({ path: sanitize(file.path), mode: '100644', type: 'blob', content: sanitize(file.content) })),
        }, token);

        const newCommit = await this.post(`repos/${owner}/${repo}/git/commits`, {
            message: sanitize(commitMessage),
            tree: (tree as any).sha,
            parents: [(branchInfo as any).commit.sha],
        }, token);

        await this.patch(`repos/${owner}/${repo}/git/refs/heads/${sanitize(branch)}`, { sha: (newCommit as any).sha }, token);
        return newCommit;
    }

    async createRepository(options: CreateRepositoryOptions, token: string) {
        const { name, description, privateRepo, autoInit } = options;
        const payload = { name: sanitize(name), description: description ? sanitize(description) : undefined, private: privateRepo, auto_init: autoInit };
        return this.post('user/repos', payload, token);
    }

    async searchRepositories(options: SearchRepositoriesOptions, token: string) {
        const { fields, fetchAll, query, ...params } = options;
        const url = `${this.baseUrl}/search/repositories`;
        const config = { params: { q: sanitize(query), per_page: 5, ...params }, headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
        let results: any = await paginate(url, config, fetchAll);

        if (fields?.length && results.items) {
            results.items = results.items.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => { if (item.hasOwnProperty(field)) filteredItem[field] = item[field]; });
                return filteredItem;
            });
        }
        return results;
    }

    async getUserRepos(options: GetUserReposOptions, token: string) {
        const { userName, fields, fetchAll, ...params } = options;
        const url = `${this.baseUrl}/users/${userName}/repos`;
        const config = { params: { per_page: 5, ...params }, headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
        let results = await paginate(url, config, fetchAll);

        if (fields?.length) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => { if (item.hasOwnProperty(field)) filteredItem[field] = item[field]; });
                return filteredItem;
            });
        }
        return results;
    }

    async getUserRepoInfo(options: GetUserRepoInfoOptions, token: string) {
        const { repoName, userName } = options;
        return this.get(`repos/${userName}/${repoName}`, {}, token);
    }

    async getFileContents(options: GetFileContentsOptions, token: string) {
        const { owner, repo, path, ...params } = options;
        const response: any = await this.get(`repos/${owner}/${repo}/contents/${sanitize(path)}`, params, token);
        if (response?.content) {
            response.decodedContent = Buffer.from(response.content, 'base64').toString('utf-8');
        }
        return response;
    }

    async createFork(options: CreateForkOptions, token: string) {
        const { owner, repo, ...payload } = options;
        return this.post(`repos/${owner}/${repo}/forks`, payload, token);
    }

    async getBranchInfo(options: GetBranchInfoOptions, token: string) {
        const { owner, repo, branch } = options;
        return this.get(`repos/${owner}/${repo}/git/ref/heads/${sanitize(branch)}`, {}, token);
    }

    async createBranch(options: CreateBranchOptions, token: string) {
        const { owner, repo, branchName, baseBranch } = options;
        return this.post(`repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${sanitize(branchName)}`, sha: sanitize(baseBranch) }, token);
    }

    async listCommits(options: ListCommitsOptions, token: string) {
        const { owner, repo, fields, fetchAll, ...params } = options;
        if (params.path) params.path = sanitize(params.path);
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
        const config = { params: { per_page: 5, ...params }, headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
        let results = await paginate(url, config, fetchAll);

        if (fields?.length) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => { if (item.hasOwnProperty(field)) filteredItem[field] = item[field]; });
                return filteredItem;
            });
        }
        return results;
    }

    async getCommit(options: GetCommitOptions, token: string) {
        const { owner, repo, fields, fetchAll, ...params } = options;
        if (params.sha) params.sha = sanitize(params.sha);
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
        const config = { params: { page: 1, per_page: 5, ...params }, headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
        let results = await paginate(url, config, fetchAll);

        if (fields?.length) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach((field: string) => { if (item.hasOwnProperty(field)) filteredItem[field] = item[field]; });
                return filteredItem;
            });
        }
        return results;
    }

    async getSpecificCommit(options: GetSpecificCommitOptions, token: string) {
        const { owner, repo, sha } = options;
        return this.get(`repos/${owner}/${repo}/commits/${sanitize(sha)}`, {}, token);
    }
}

export default Repositories;
