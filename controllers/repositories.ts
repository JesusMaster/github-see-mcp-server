import GitHubClient from '#controllers/github';
import axios from 'axios';


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
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: this.timeout
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
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: this.timeout
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

    async listBranches(owner: string, repo: string, page?: number, per_page?: number) {
        let page_number = page ?? 1;
        let per_page_number = per_page ?? 30;
        let allBranches: any[] = [];
        let branches;

        do {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches`, {
                params: {
                    page: page_number,
                    per_page: per_page_number,
                },
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: this.timeout
            });

            branches = response.data;
            allBranches = allBranches.concat(branches);
            page_number++;
        } while (branches.length === per_page_number);

        return allBranches;
    }

    async pushMultipleFiles(owner: string, repo: string, branch: string, commitMessage: string, files: { path: string, content: string }[]) {
        const branchInfo = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches/${branch}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
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
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });

        const newTreeSha = tree.data.sha;

        const newCommit = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/commits`, {
            message: commitMessage,
            tree: newTreeSha,
            parents: [branchInfo.data.commit.sha],
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });

        await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            sha: newCommit.data.sha,
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
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
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });

        return response.data;
    }

    async searchRepositories(query: string, page?: number, per_page?: number, sort?: string, order?: string) {
        let page_number = page ?? 1;
        let per_page_number = per_page ?? 30;
        let allResults: any[] = [];
        let results;

        do {
            const response = await axios.get(`${this.baseUrl}/search/repositories`, {
                params: {
                    q: query,
                    page: page_number,
                    per_page: per_page_number,
                    sort: sort,
                    order: order
                },
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: this.timeout
            });

            results = response.data.items;
            allResults = allResults.concat(results);
            page_number++;
        } while (results.length === per_page_number);

        return { items: allResults };
    }


    async getUserRepos(userName: string, page?: number, perPage?: number) {
        let page_number = page ?? 1;
        let per_page_number = perPage ?? 30;
        let allRepos: any[] = [];
        let repos;

        do {
            const response = await axios.get(`${this.baseUrl}/users/${userName}/repos`, {
                params: {
                    page: page_number,
                    per_page: per_page_number,
                },
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: this.timeout
            });

            repos = response.data;
            allRepos = allRepos.concat(repos);
            page_number++;
        } while (repos.length === per_page_number);

        return allRepos;
    }


    async getUserRepoInfo(repoName: string, userName: string) {
        const response = await axios.get(`${this.baseUrl}/repos/${userName}/${repoName}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
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
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
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
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });

        return response.data;
    }


    async getBranchInfo(owner: string, repo: string, branch: string) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });
        return response.data;
    }

    async createBranch(owner: string, repo: string, branchName: string, baseBranch: string) {

        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: baseBranch,
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });

        return response.data;
    }

    async listCommits(owner: string, repo: string, sha?: string, path?: string, page?: number, perPage?: number) {
        let page_number = page ?? 1;
        let per_page_number = perPage ?? 30;
        let allCommits: any[] = [];
        let commits;

        do {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
                params: {
                    sha: sha,
                    path: path,
                    page: page_number,
                    per_page: per_page_number,
                },
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: this.timeout
            });

            commits = response.data;
            allCommits = allCommits.concat(commits);
            page_number++;
        } while (commits.length === per_page_number);

        return allCommits;
    }

    async getCommit(owner: string, repo: string, sha?: string, page?: number, perPage?: number) {
        let page_number = page ?? 1;
        let per_page_number = perPage ?? 30;
        let allCommits: any[] = [];
        let commits;

        do {
            const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
                params: {
                    sha: sha,
                    page: page_number,
                    per_page: per_page_number,
                },
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                timeout: this.timeout
            });

            commits = response.data;
            allCommits = allCommits.concat(commits);
            page_number++;
        } while (commits.length === per_page_number);

        return allCommits;
    }

    async getSpecificCommit(owner: string, repo: string, sha: string){

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });

        return response.data;
    }

}

export default Repositories;
