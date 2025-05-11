
import  GitHubClient  from '#controllers/github';
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
    async createIssue(owner: string, repo: string, title: string, body?: string , assignees?: string[] , labels?: string[] ,milestone?: number ) {
        // Check if the required parameters are provided
       
        const payload:{
            title: string;
            body?: string;
            assignees?: string[];
            labels?: string[];
            milestone?: number;
        } = {
            title:title,
        }

        if(body) payload.body = body;
        if(assignees) payload.assignees = assignees;
        if(labels) payload.labels = labels;
        if(milestone) payload.milestone = milestone;

        const response = await axios.post(
            `${this.baseUrl}/repos/${owner}/${repo}/issues`,
            payload,
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

        const payload :{
            body:string
        }={
          body:comment  
        }

        // Check if the required parameters are provided
        if (!owner || !repo || !issueNumber || !comment) {
            throw new Error('Missing required parameters: owner, repo, issueNumber, and comment are required.');
        }
        const response = await axios.post(
            `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
           payload,
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
    async listIssues(owner: string, repo: string, state?: string, labels?: string[] ,sort?: string, direction?: string, since?: string, page?: number, per_page?: number) {

        const payload:{
            state?:string,
            labels?:string[],
            sort?: string,
            direction?: string,
            since?: string,
            page?: number,
            per_page?: number,
        } = {}

        if(state) payload.state = state;
        if(labels) payload.labels = labels;
        if(sort) payload.sort = sort;
        if(direction) payload.direction = direction;
        if(since) payload.since = since;
        if(page) payload.page = page;
        if(per_page) payload.per_page = per_page;

        const response = await axios.get(
            `${this.baseUrl}/repos/${owner}/${repo}/issues`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                params: payload,
            }
        );
        return response.data;
    }

    //metodo para actualizar un issue
    async updateIssue(owner: string, repo: string, issueNumber: number, title?: string , body?: string , assignees?: string[] ,milestone?: number ,state?: string , labels?: string[] ) {

        const payload:{
            title?: string , 
            body?: string , 
            assignees?: string[] ,
            milestone?: number ,
            state?: string , 
            labels?: string[] 
        }={};

        if(title) payload.title = title; 
        if(body) payload.body = body
        if(assignees) payload.assignees = assignees;
        if(milestone) payload.milestone = milestone;
        if(state) payload.state = state;
        if(labels) payload.labels = labels;
        

        // Check if the required parameters are provided
        if (!owner || !repo || !issueNumber) {
            throw new Error('Missing required parameters: owner, repo, and issueNumber are required.');
        }
        const response = await axios.patch(
            `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`,
            payload,
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
    async searchIssues(owner: string, repo: string, query: string, sort?: string, order?: string, page?: number, per_page?: number) {

        const payload:{
            query: string, 
            sort?: string,
            order?: string, 
            page?: number, 
            per_page?: number
        }={
            query:query
        }

        if(sort) payload.sort = sort;
        if(order) payload.order = order;
        if(page) payload.page = page;
        if(per_page) payload.per_page = per_page;


        const response = await axios.get(
            `${this.baseUrl}/repos/${owner}/${repo}/issues`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                params: payload,
            }
        );
        return response.data;
    }


}
export default Issues;