
import  GitHubClient  from '#controllers/github';
import axios from 'axios';

class Issues extends GitHubClient{

    async getIssues(owner: string, repo: string, issueNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }

    async getComments(owner: string, repo: string, issueNumber: number) {
        const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }

    async createIssue(owner: string, repo: string, title: string, body?: string , assignees?: string[] , labels?: string[] ,milestone?: number ) {
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

    async addComment(owner: string, repo: string, issueNumber: number, comment: string) {

        const payload :{
            body:string
        }={
          body:comment  
        }

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

    async listIssues(owner: string, repo: string, state?: string, labels?: string[] ,sort?: string, direction?: string, since?: string, page?: number, per_page: number = 5, fields?: string[]) {

        const payload:{
            state?:string,
            labels?:string[],
            sort?: string,
            direction?: string,
            since?: string,
            page?: number,
            per_page?: number,
        } = {
            per_page: per_page
        }

        if(state) payload.state = state;
        if(labels) payload.labels = labels;
        if(sort) payload.sort = sort;
        if(direction) payload.direction = direction;
        if(since) payload.since = since;
        if(page) payload.page = page;

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
        
        let results = response.data;

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

    async searchIssues(owner: string, repo: string, query: string, sort?: string, order?: string, page?: number, per_page: number = 5, fields?: string[]) {

        const payload:{
            q: string, 
            sort?: string,
            order?: string, 
            page?: number, 
            per_page?: number
        }={
            q:query,
            per_page: per_page
        }

        if(sort) payload.sort = sort;
        if(order) payload.order = order;
        if(page) payload.page = page;


        const response = await axios.get(
            `${this.baseUrl}/search/issues`, // Corrected endpoint from /issues to /search/issues
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                params: payload,
            }
        );
        
        let results = response.data;

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


}
export default Issues;
