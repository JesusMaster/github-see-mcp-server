
import GitHubClient from '#controllers/github';
import axios from 'axios';

class PullRequest extends GitHubClient {

    async getPullRequest(owner: string, repo: string, pullNumber: number) {


        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    };

    async getListPullRequests(owner: string, repo: string,state?: string ,sort?: string,direction?: string ,perPage?: number,page?: number) {

        const payload :{
            state?: string,
            sort?: string,
            direction?: string,
            per_page?: number,
            page?: number
        } = {
            state: state ?? "all"
        };

        if (state !== undefined) {
            payload.state = state;
        }
        if (sort !== undefined) {
            payload.sort = sort;
        }
        if (direction !== undefined) {
            payload.direction = direction;
        }
        if (perPage !== undefined) {
            payload.per_page = perPage;
        }
        if (page !== undefined) {
            payload.page = page;
        }

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            params: payload,
        });

        return response.data;
    }

    async mergePullRequest(owner: string, repo: string, pullNumber: number, commitMessage?: string, commit_title?: string, merge_method?: string) {

        const payload: {
            commit_message?: string,
            commit_title?: string,
            merge_method?: string,
        }={};

        if (commitMessage !== undefined) {
            payload.commit_message = commitMessage;
        }
        if (commit_title !== undefined) {
            payload.commit_title = commit_title;
        }
        if (merge_method !== undefined) {
            payload.merge_method = merge_method;
        }


        const response = await axios.put(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, payload, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    async getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/files`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    async getPullRequestStatus(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    async updatePullRequestBranch(owner: string, repo: string, pullNumber: number, expected_head_sha?: string) {

        const payload:{
            expected_head_sha?: string
        }={};
        if (expected_head_sha !== undefined) {
            payload.expected_head_sha = expected_head_sha;
        }

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/update-branch`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            params: payload
        });
        return response.data;
    }

    async getPullRequestComments(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    async getPullRequestReviews(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    async createPullRequestReview(owner: string, repo: string, pullNumber: number, body?: string , event?: string, commitId?: string, comments?: string[]) {
        
        const payload: {
            body?: string,
            event?: string,
            commit_id?: string,
            comments?: string[]
        } = {};

        if (body !== undefined) {
            payload.body = body;
        }
        if (event !== undefined) {
            payload.event = event;
        }
        if (commitId !== undefined) {
            payload.commit_id = commitId;
        } 
        if (comments !== undefined) {
            payload.comments = comments;
        }
        
        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, payload, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    async createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body?: string , draft?: boolean , maintainer_can_modify?: boolean) {

        const payload :{
            title: string,
            head: string,
            base: string,
            body?: string,
            draft?: boolean,
            maintainer_can_modify?: boolean
        } = {
            title: title,
            head: head,
            base: base
        }

        if (body !== undefined) {
            payload.body = body;
        }
        if (draft !== undefined) {
            payload.draft = draft;
        }
        if (maintainer_can_modify !== undefined) {
            payload.maintainer_can_modify = maintainer_can_modify;
        }

        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, payload, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    async addPullRequestReviewComment(owner: string, repo: string, pullNumber: number, body: string, path: string, commit_id?: string, in_reply_to?: number, subject_type?: string , line?: number, side?: string, start_line?: number, start_side?: string) {
        const payload: {
            body: string,
            path: string,
            commit_id?: string,
            in_reply_to?: number,
            subject_type?: string,
            line?: number,
            side?: string,
            start_line?: number,
            start_side?: string
        } = {
            body: body,
            path: path
        };

        if (commit_id !== undefined) {
            payload.commit_id = commit_id;
        }
        if (in_reply_to !== undefined) {
            payload.in_reply_to = in_reply_to;
        }
        if (subject_type !== undefined) {
            payload.subject_type = subject_type;
        }
        if (line !== undefined) {
            payload.line = line;
        }
        if (side !== undefined) {
            payload.side = side;
        }
        if (start_line !== undefined) {
            payload.start_line = start_line;
        }
        if (start_side !== undefined) {
            payload.start_side = start_side;
        }

        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, payload, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data; 
    }

    async updatePullRequest(owner: string, repo: string, pullNumber: number, title?: string, body?: string , state?: string , base?: string , maintainer_can_modify?: boolean ) {

        const payload: {
            title?: string,
            body?: string,
            state?: string,
            base?: string,
            maintainer_can_modify?: boolean
        } = {};
        if (title !== undefined) {
            payload.title = title;
        }
        if (body !== undefined) {
            payload.body = body;
        }
        if (state !== undefined) {
            payload.state = state;
        }
        if (base !== undefined) {
            payload.base = base;
        }
        if (maintainer_can_modify !== undefined) {
            payload.maintainer_can_modify = maintainer_can_modify;
        }

            const response = await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`, payload, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }
    


}

export default PullRequest;
