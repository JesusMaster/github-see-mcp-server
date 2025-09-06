import axios from 'axios';

export default class GitHubClient {
    public token: string;
    public baseUrl: string;
    public timeout: number;

    constructor(token: string) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
        this.timeout = 600000; // 10 minutes timeout
    }

    private getHeaders() {
        return {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
        };
    }

    protected async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
            headers: this.getHeaders(),
            params,
            timeout: this.timeout,
        });
        return response.data;
    }

    protected async post<T>(endpoint: string, data: Record<string, any>): Promise<T> {
        const response = await axios.post(`${this.baseUrl}/${endpoint}`, data, {
            headers: this.getHeaders(),
            timeout: this.timeout,
        });
        return response.data;
    }

    protected async patch<T>(endpoint: string, data: Record<string, any>): Promise<T> {
        const response = await axios.patch(`${this.baseUrl}/${endpoint}`, data, {
            headers: this.getHeaders(),
            timeout: this.timeout,
        });
        return response.data;
    }

    protected async put<T>(endpoint: string, data: Record<string, any>): Promise<T> {
        const response = await axios.put(`${this.baseUrl}/${endpoint}`, data, {
            headers: this.getHeaders(),
            timeout: this.timeout,
        });
        return response.data;
    }

    async getUserInfo() {
        return this.get('user');
    }
}