import GitHubClient from '#services/api';
import { paginate } from '#utils/pagination';

// --- Interfaces para Opciones de Métodos ---

export interface FileContentsOptions { owner: string; repo: string; path: string; message: string; content: string; branch?: string; sha?: string; }
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

    async CreateFileContents(options: FileContentsOptions) {
        const { owner, repo, path, ...payload } = options;
        if (!this.isBase64(payload.content)) {
            payload.content = Buffer.from(payload.content).toString('base64');
        }
        return this.put(`repos/${owner}/${repo}/contents/${path}`, payload);
    }

    async UpdateFileContents(options: UpdateFileContentsOptions) {
        const { owner, repo, path, ...payload } = options;
        if (!this.isBase64(payload.content)) {
            payload.content = Buffer.from(payload.content).toString('base64');
        }
        return this.put(`repos/${owner}/${repo}/contents/${path}`, payload);
    }

    async listBranches(options: ListBranchesOptions) {
        const { owner, repo, fields, fetchAll, ...params } = options;
        const url = `${this.baseUrl}/repos/${owner}/${repo}/branches`;
        const config = { params: { per_page: 5, ...params }, headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
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

    async pushMultipleFiles(options: PushMultipleFilesOptions) {
        const { owner, repo, branch, commitMessage, files } = options;
        const branchInfo = await this.get(`repos/${owner}/${repo}/branches/${branch}`);
        const baseTreeSha = (branchInfo as any).commit.commit.tree.sha;

        const tree = await this.post(`repos/${owner}/${repo}/git/trees`, {
            base_tree: baseTreeSha,
            tree: files.map((file: { path: string; content: string }) => ({ path: file.path, mode: '100644', type: 'blob', content: file.content })),
        });

        const newCommit = await this.post(`repos/${owner}/${repo}/git/commits`, {
            message: commitMessage,
            tree: (tree as any).sha,
            parents: [(branchInfo as any).commit.sha],
        });

        await this.patch(`repos/${owner}/${repo}/git/refs/heads/${branch}`, { sha: (newCommit as any).sha });
        return newCommit;
    }

    async createRepository(options: CreateRepositoryOptions) {
        const { name, description, privateRepo, autoInit } = options;
        const payload = { name, description, private: privateRepo, auto_init: autoInit };
        return this.post('user/repos', payload);
    }

    async searchRepositories(options: SearchRepositoriesOptions) {
        const { fields, fetchAll, query, ...params } = options;
        const url = `${this.baseUrl}/search/repositories`;
        const config = { params: { q: query, per_page: 5, ...params }, headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
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

    async getUserRepos(options: GetUserReposOptions) {
        const { userName, fields, fetchAll, ...params } = options;
        const url = `${this.baseUrl}/users/${userName}/repos`;
        const config = { params: { per_page: 5, ...params }, headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
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

    async getUserRepoInfo(options: GetUserRepoInfoOptions) {
        const { repoName, userName } = options;
        return this.get(`repos/${userName}/${repoName}`);
    }

    async getFileContents(options: GetFileContentsOptions) {
        const { owner, repo, path, ...params } = options;
        const response: any = await this.get(`repos/${owner}/${repo}/contents/${path}`, params);
        if (response?.content) {
            response.decodedContent = Buffer.from(response.content, 'base64').toString('utf-8');
        }
        return response;
    }

    async createFork(options: CreateForkOptions) {
        const { owner, repo, ...payload } = options;
        return this.post(`repos/${owner}/${repo}/forks`, payload);
    }

    async getBranchInfo(options: GetBranchInfoOptions) {
        const { owner, repo, branch } = options;
        return this.get(`repos/${owner}/${repo}/git/ref/heads/${branch}`);
    }

    async createBranch(options: CreateBranchOptions) {
        const { owner, repo, branchName, baseBranch } = options;
        return this.post(`repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${branchName}`, sha: baseBranch });
    }

    async listCommits(options: ListCommitsOptions) {
        const { owner, repo, fields, fetchAll, ...params } = options;
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
        const config = { params: { per_page: 5, ...params }, headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
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

    async getCommit(options: GetCommitOptions) {
        const { owner, repo, fields, fetchAll, ...params } = options;
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
        const config = { params: { page: 1, per_page: 5, ...params }, headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' }, timeout: 5000 };
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

    async getSpecificCommit(options: GetSpecificCommitOptions) {
        const { owner, repo, sha } = options;
        return this.get(`repos/${owner}/${repo}/commits/${sha}`);
    }
}

export default Repositories;