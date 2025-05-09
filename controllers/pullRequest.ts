
import GitHubClient from '@controllers/github.js';
import axios from 'axios';

class PullRequest extends GitHubClient {

    //método para obtener una pull request
    async getPullRequest(owner: string, repo: string, pullNumber: number) {


        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    };

    // método para obtner un lista de pull requests
    async getListPullRequests(owner: string, repo: string,state: string | undefined,sort: string | undefined,direction: string | undefined,perPage: number | undefined,page: number | undefined) {

        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            params: {
                state: state,
                sort: sort,
                direction: direction,
                per_page: perPage,
                page: page,
            },
        });

        return response.data;
    }

    // método para crear un merge de pull request
    async mergePullRequest(owner: string, repo: string, pullNumber: number, commitMessage: string | undefined, commit_title: string | undefined, merge_method: string | undefined) {
        const response = await axios.put(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
            commit_message: commitMessage,
            commit_title: commit_title,
            merge_method: merge_method,
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // método para obtener los archivos de una pull request
    async getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/files`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // método para obtener el status de una pull request
    async getPullRequestStatus(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // método para actualizar un branch de un pull request
    async updatePullRequestBranch(owner: string, repo: string, pullNumber: number, expected_head_sha: string | undefined) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/update-branch`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            params: {
                expected_head_sha: expected_head_sha
            }
        });
        return response.data;
    }

    // método para obtener los commentarios del pull request
    async getPullRequestComments(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // método para obtener los reviews del pull request
    async getPullRequestReviews(owner: string, repo: string, pullNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // método para crear una review del pull request
    async createPullRequestReview(owner: string, repo: string, pullNumber: number, body: string | undefined, event: string | undefined, commitId: string | undefined, comments: string[] | undefined) {
        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
            body: body,
            event: event,
            commit_id: commitId,
            comments: comments
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // método para crear una pull request
    async createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body: string | undefined, draft: boolean | undefined, maintainer_can_modify: boolean | undefined) {
        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
            title: title,
            head: head,
            base: base,
            body: body,
            draft: draft,
            maintainer_can_modify: maintainer_can_modify
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }

    // function to add a review comment to a pull request or reply to an existing comment
    async addPullRequestReviewComment(owner: string, repo: string, pullNumber: number, body: string, path: string, commit_id: string | undefined, in_reply_to: number | undefined, subject_type: string | undefined, line: number | undefined, side: string | undefined, start_line: number | undefined, start_side: string | undefined) {
        // Check if the required parameters are provided 
        const response = await axios.post(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, {
            body: body,
            path: path,
            commit_id: commit_id,
            in_reply_to: in_reply_to,
            subject_type: subject_type,
            line: line,
            side: side,
            start_line: start_line,
            start_side: start_side
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data; 
    }

    // function to update pull request
    async updatePullRequest(owner: string, repo: string, pullNumber: number, title: string | undefined, body: string | undefined, state: string | undefined, base: string | undefined, maintainer_can_modify: boolean | undefined) {
        const response = await axios.patch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`, {
            title: title,
            body: body,
            state: state,
            base: base,
            maintainer_can_modify: maintainer_can_modify
        }, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        return response.data;
    }
    


}

export default PullRequest;