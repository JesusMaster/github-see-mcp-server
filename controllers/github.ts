import axios from 'axios';

class GitHubClient {
    public token: string;
    public baseUrl: string;
    public timeout: number;

    constructor(token: string) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
        this.timeout = 300000; // 300 seconds timeout for all GitHub API requests
    }

    async getUserInfo() {
        const response = await axios.get(`${this.baseUrl}/user`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: this.timeout
        });
        return response.data;
    }

    

}

export default GitHubClient;
