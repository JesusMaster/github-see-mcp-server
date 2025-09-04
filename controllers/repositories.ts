import GitHubClient from '#controllers/github';
import axios from 'axios';
import { paginate } from '#utils/pagination';

class Repositories extends GitHubClient {
    isBase64(encodedString: string) {
        let regexBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        return regexBase64.test(encodedString);
    }

    async CreateFileContents(owner: string, repo: string, path: string, message: string, content: string, branch?: string, sha?: string) {

        const payload: {
            message: string,
            content: string,
            branch?: string,
            sha?: string
        } = {
            message: message,
            content: content,
        }

        if (branch) payload.branch = branch;
        if (sha) payload.sha = sha;
        
        if (!this.isBase64(payload.content)) {
            payload.content = Buffer.from(payload.content).toString('base64');
        }

        try {
            const response = await axios.put(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, payload, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: 5000
            });
            
            return response.data;
        }
        catch (error: any) {
            console.error(`Error creating or updating file contents: ${error.message}`);
            if (error.response && error.response.status !== 404) {
                throw error;
            }
            return error
        }
    }


    async UpdateFileContents(owner: string, repo: string, path: string, message: string, content: string, sha: string, branch?: string) {

        const payload: {
            message: string,
            content: string,
            branch?: string,
            sha: string
        } = {
            message: message,
            content: content,
            sha:sha
        }

        if (branch) payload.branch = branch;

        if (!this.isBase64(payload.content)) {
            payload.content = Buffer.from(payload.content).toString('base64');
        }

        try {
            const response = await axios.put(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, payload, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: 5000
            });

            return response.data;
        }
        catch (error: any) {
            console.error(`Error creating or updating file contents: ${error.message}`);
            if (error.response && error.response.status !== 404) {
                throw error;
            }
            return error
        }
    }

    async listBranches(owner: string, repo: string, page?: number, per_page: number = 5, fetchAll?: boolean, fields?: string[]) {
        const url = `${this.baseUrl}/repos/${owner}/${repo}/branches`;
        const config = {
            params: { page, per_page },
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        };
        let results = await paginate(url, config, fetchAll);

        if (fields && fields.length > 0) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }

        return results;
    }

    async pushMultipleFiles(owner: string, repo: string, branch: string, commitMessage: string, files: { path: string, content: string }[]) {
        const branchInfo = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches/${branch}`, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        const baseTreeSha = branchInfo.data.commit.commit.tree.sha;

        const tree = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/trees`, {
            base_tree: baseTreeSha,
            tree: files.map(file => ({
                path: file.path,
                mode: '100644',
                type: 'blob',
                content: file.content,
            })),
        }, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        const newTreeSha = tree.data.sha;

        const newCommit = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/commits`, {
            message: commitMessage,
            tree: newTreeSha,
            parents: [branchInfo.data.commit.sha],
        }, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            sha: newCommit.data.sha,
        }, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        return newCommit.data;
    }

    async createRepository(name: string, description?: string, privateRepo?: boolean, autoInit?: boolean) {
        const payload: {
            name: string;
            description?: string;
            private?: boolean;
            auto_init?: boolean;
        } = {
            name: name,
        };

        if (description !== undefined) {
            payload.description = description;
        }
        if (privateRepo !== undefined) {
            payload.private = privateRepo;
        }
        if (autoInit !== undefined) {
            payload.auto_init = autoInit;
        }

        const response = await axios.post(`${this.baseUrl}/user/repos`, payload, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        return response.data;
    }

    async searchRepositories(query: string, page?: number, per_page: number = 5, sort?: string, order?: string, fetchAll?: boolean, fields?: string[]) {
        const url = `${this.baseUrl}/search/repositories`;
        const config = {
            params: { q: query, page, per_page, sort, order },
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        };
        let results = await paginate(url, config, fetchAll);

        if (fields && fields.length > 0 && results.items) {
            results.items = results.items.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }

        return results;
    }


    async getUserRepos(userName: string, page?: number, perPage: number = 5, fetchAll?: boolean, fields?: string[]) {
        const url = `${this.baseUrl}/users/${userName}/repos`;
        const config = {
            params: { page, per_page: perPage },
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        };
        let results = await paginate(url, config, fetchAll);

        if (fields && fields.length > 0) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }

        return results;
    }


    async getUserRepoInfo(repoName: string, userName: string) {
        const response = await axios.get(`${this.baseUrl}/repos/${userName}/${repoName}`, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });
        return response.data;
    }


    async getFileContents(owner: string, repo: string, path: string, ref?: string) {

        const payload: {
            ref?: string
        } = {};
        if (ref) payload.ref = ref;        

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
            params: payload,
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        if (response.data && response.data.content) {
            const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
            response.data.decodedContent = decodedContent;
        }

        return response.data;
    }

    async createFork(owner: string, repo: string, organization?: string) {

        const payload: {
            organization?: string
        } = {};
        if (organization !== undefined) {
            payload.organization = organization;
        }

        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/forks`, payload, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        return response.data;
    }


    async getBranchInfo(owner: string, repo: string, branch: string) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });
        return response.data;
    }

    async createBranch(owner: string, repo: string, branchName: string, baseBranch: string) {

        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: baseBranch,
        }, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        return response.data;
    }

    async listCommits(owner: string, repo: string, sha?: string, path?: string, page?: number, perPage: number = 5, fetchAll?: boolean, fields?: string[]) {
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
        const config = {
            params: { sha, path, page, per_page: perPage },
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        };
        let results = await paginate(url, config, fetchAll);

        if (fields && fields.length > 0) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }

        return results;
    }

    async getCommit(owner: string, repo: string, sha?: string, page: number=1, perPage: number = 5, fetchAll?: boolean, fields?: string[]) {
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
        const config = {
            params: { sha, page: page, per_page: perPage },
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        };
        let results = await paginate(url, config, fetchAll);

        if (fields && fields.length > 0) {
            return results.map((item: any) => {
                const filteredItem: { [key: string]: any } = {};
                fields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        }

        return results;
    }

    async getSpecificCommit(owner: string, repo: string, sha: string){

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
            headers: {
                Authorization: `token ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000
        });

        return response.data;
    }

}

export default Repositories;
