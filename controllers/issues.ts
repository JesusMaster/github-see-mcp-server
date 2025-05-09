
import  GitHubClient  from './github.js';
import axios from 'axios';

class Issues extends GitHubClient{


    // método para obtener la informacion de issues 
    async getIssues(owner: string, repo: string, issueNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }

    //metodo para obtener los comentarios de un issue
    async getComments(owner: string, repo: string, issueNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }

    // método para crear un issue
    async createIssue(owner: string, repo: string, title: string, body: string | undefined, assignees: string[] | undefined, labels: string[] | undefined,milestone: number | undefined) {
        // Check if the required parameters are provided
        if (!owner || !repo || !title) {
            throw new Error('Missing required parameters: owner, repo, and title are required.');
        }
        const response = await axios.post(
            `${this.baseUrl}/repos/${owner}/${repo}/issues`,
            {
                title,
                body,
                assignees,
                labels,
                milestone,
            },
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );
        return response.data;
    }

    // método para agregar un comentario a un issue
    async addComment(owner: string, repo: string, issueNumber: number, comment: string) {
        // Check if the required parameters are provided
        if (!owner || !repo || !issueNumber || !comment) {
            throw new Error('Missing required parameters: owner, repo, issueNumber, and comment are required.');
        }
        const response = await axios.post(
            `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
            {
                body: comment,
            },
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );
        return response.data;
    }

    // método para listar los issues de un repositorio
    async listIssues(owner: string, repo: string, state: string | undefined, labels: string[] | undefined,sort: string | undefined, direction: string | undefined, since: string | undefined, page: number | undefined, per_page: number | undefined) {
        // Check if the required parameters are provided
        const response = await axios.get(
            `${this.baseUrl}/repos/${owner}/${repo}/issues`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                params: {
                    state,
                    labels,
                    sort,
                    direction,
                    since,
                    page,
                    per_page,
                },
            }
        );
        return response.data;
    }

    //metodo para actualizar un issue
    async updateIssue(owner: string, repo: string, issueNumber: number, title: string | undefined, body: string | undefined, assignees: string[] | undefined,milestone: number | undefined,state: string | undefined, labels: string[] | undefined) {
        // Check if the required parameters are provided
        if (!owner || !repo || !issueNumber) {
            throw new Error('Missing required parameters: owner, repo, and issueNumber are required.');
        }
        const response = await axios.patch(
            `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`,
            {
                title,
                body,
                assignees,
                milestone,
                state,
                labels,
            },
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );
        return response.data;
    }

    // método para buscar una issue
    async searchIssues(owner: string, repo: string, query: string, sort: string | undefined, order: string | undefined, page: number | undefined, per_page: number | undefined) {
        // Check if the required parameters are provided
        if (!owner || !repo || !query) {
            throw new Error('Missing required parameters: owner, repo, and query are required.');
        }
        const response = await axios.get(
            `${this.baseUrl}/repos/${owner}/${repo}/issues`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                params: {
                    q: query,
                    sort,
                    order,
                    page,
                    per_page,
                },
            }
        );
        return response.data;
    }


}
export default Issues;