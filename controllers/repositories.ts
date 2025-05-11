import GitHubClient from '#controllers/github';
import axios from 'axios';
import { string } from 'zod';

class Repositories extends GitHubClient {
    //function to Create or update a single file in a repository


    isBase64(encodedString: string) {
        var regexBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        return regexBase64.test(encodedString);   // return TRUE if its base64 string.
    }


    async createOrUpdateFileContents(owner: string, repo: string, path: string, message: string, content: string, branch?: string, sha?: string) {

        const payload: {
            message: string,
            content: string,
            branch?: string,
            sha?: string
        } = {
            message: message,
            content: content,
        }

        if (branch !== undefined) {
            payload.branch = branch;
        }
        if (sha !== undefined) {
            payload.sha = sha;
        }

        this.isBase64(payload.content);
        if (!this.isBase64(payload.content)) {
            payload.content = Buffer.from(payload.content).toString('base64');
        }

        try {

            const response = await axios.put(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, payload, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            sha = response.data.sha;
            return response.data;
        }
        catch (error: any) {
            console.error(`Error creating or updating file contents: ${error.message}`);
            if (error.response && error.response.status !== 404) {
                throw error; // If it's not a 404 error, rethrow it
            }
            return error
            // If it's a 404 error, it means the file doesn't exist, so we can proceed without setting sha
        }
        // Check if content is base64 encoded

    }

    // function to List branches in a GitHub repository
    async listBranches(owner: string, repo: string, page?: number, per_page?: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // function to Push multiple files in a single commit

    async pushMultipleFiles(owner: string, repo: string, branch: string, commitMessage: string, files: { path: string, content: string }[]) {
        const branchInfo = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches/${branch}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
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
        });

        await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            sha: newCommit.data.sha,
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            }
        });

        return newCommit.data;
    }

    // function to Create a new repository for the authenticated user
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
            payload.auto_init = autoInit; // GitHub API uses auto_init
        }

        const response = await axios.post(`${this.baseUrl}/user/repos`, payload, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // create function to search repositories
    async searchRepositories(query: string, page?: number, per_page?: number, sort?: string, order?: string) {

        const payload: {
            query: string,
            page?: number,
            per_page?: number,
            sort?: string,
            order?: string
        } = {
            query: query
        };
        if (page !== undefined) {
            payload.page = page;
        }
        if (per_page !== undefined) {
            payload.per_page = per_page;
        }
        if (sort !== undefined) {
            payload.sort = sort;
        }
        if (order !== undefined) {
            payload.order = order;
        }


        const response = await axios.get(`${this.baseUrl}/search/repositories`, {
            params: payload,
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }


    async getUserRepos(userName: string, page?: number, perPage?: number) {


        const payload: {
            page?: number,
            per_page?: number
        } = {};
        if (page !== undefined) {
            payload.page = page;
        }
        if (perPage !== undefined) { 
            payload.per_page = perPage;
        }

        const response = await axios.get(`${this.baseUrl}/users/${userName}/repos`, {
            params: payload,
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }


    async getUserRepoInfo(repoName: string, userName: string) { // Consider swapping userName and repoName for conventional owner, repo order if preferred
        const response = await axios.get(`${this.baseUrl}/repos/${userName}/${repoName}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }


    // function to get file contents from a repository
    async getFileContents(owner: string, repo: string, path: string, ref?: string) {

        const payload: {
            ref?: string
        } = {};
        if (ref !== undefined) {
            payload.ref = ref;
        }

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
            params: payload,
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (response.data && response.data.content) {
            // Decode the base64 content
            const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
            response.data.content = decodedContent;
        }

        return response.data;
    }

    //function to create a fork of a repository
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
        });

        return response.data;
    }


    async getBranchInfo(owner: string, repo: string, branch: string) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }

    //function to create a branch
    async createBranch(owner: string, repo: string, branchName: string, baseBranch: string) {

        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: baseBranch,
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // function to get list of commits
    async listCommits(owner: string, repo: string, sha?: string, path?: string, page?: number, perPage?: number) {

        const payload: {
            sha?: string,
            path?: string,
            page?: number,
            per_page?: number
        } = {};

        if (sha !== undefined) {
            payload.sha = sha;
        }
        if (path !== undefined) {
            payload.path = path;
        }
        if (page !== undefined) {
            payload.page = page;
        }
        if (perPage !== undefined) {
            payload.per_page = perPage;
        }

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
            params: payload,
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }

    //function to get a single commit
    async getCommit(owner: string, repo: string, sha?: string, page?: number, perPage?: number) {


        const payload: {
            sha?: string,
            page?: number,
            per_page?: number
        } = {};
        if (sha !== undefined) {
            payload.sha = sha;
        }
        if (page !== undefined) {
            payload.page = page;
        }
        if (perPage !== undefined) {
            payload.per_page = perPage;
        }

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/commits`, {
            params: payload,
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

}

export default Repositories;
