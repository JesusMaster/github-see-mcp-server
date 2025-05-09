import axios from 'axios';

// crea una clase para el cliente de GitHub
class GitHubClient {
    public token: string;
    public baseUrl: string;

    constructor(token: string) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
    }

    // método para obtener información del usuario
    async getUserInfo() {
        const response = await axios.get(`${this.baseUrl}/user`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.data;
    }
}

export default GitHubClient;