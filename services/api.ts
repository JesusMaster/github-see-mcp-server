import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface Logger {
  log(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }

  error(message: string) {
    console.error(message);
  }
}

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly logger: Logger | null;

  constructor(baseURL: string, token: string | null = null, enableLogging: boolean = false) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        ...token && { Authorization: `token ${token}` },
        'Content-Type': 'application/json',
      },
    });
    this.logger = enableLogging ? new ConsoleLogger() : null;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      this.logger?.log(`Requesting GET ${url}`);
      const response = await this.axiosInstance.get<T>(url, config);
      this.logger?.log(`Response from GET ${url}: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger?.error(`Error in GET ${url}: ${error}`);
      throw error;
    }
  }

  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      this.logger?.log(`Requesting POST ${url}`);
      const response = await this.axiosInstance.post<T>(url, data, config);
      this.logger?.log(`Response from POST ${url}: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger?.error(`Error in POST ${url}: ${error}`);
      throw error;
    }
  }

  async patch<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      this.logger?.log(`Requesting PATCH ${url}`);
      const response = await this.axiosInstance.patch<T>(url, data, config);
      this.logger?.log(`Response from PATCH ${url}: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger?.error(`Error in PATCH ${url}: ${error}`);
      throw error;
    }
  }

  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      this.logger?.log(`Requesting PUT ${url}`);
      const response = await this.axiosInstance.put<T>(url, data, config);
      this.logger?.log(`Response from PUT ${url}: ${response.status}`);
      return response.data;
    } catch (error) {
      this.logger?.error(`Error in PUT ${url}: ${error}`);
      throw error;
    }
  }
}
