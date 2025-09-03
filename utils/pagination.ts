import axios, { AxiosRequestConfig } from 'axios';

export async function paginate(url: string, config: AxiosRequestConfig, fetchAll: boolean = false) {
    if (!fetchAll) {
        const response = await axios.get(url, config);
        return response.data;
    }

    let page = 1;
    const per_page = config.params?.per_page ?? 30;
    let allData: any[] = [];
    let data;

    do {
        const response = await axios.get(url, {
            ...config,
            params: {
                ...config.params,
                page: page,
                per_page: per_page,
            },
        });

        data = response.data.items ?? response.data;
        allData = allData.concat(data);
        page++;
    } while (data.length === per_page);

    if (Array.isArray(allData)) {
        return allData;
    }

    return { items: allData };
}
