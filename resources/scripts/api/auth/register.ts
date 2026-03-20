import http from '@/api/http';

interface RegisterResponse {
    complete: boolean;
    intended: string;
}

export default (data: Record<string, string>): Promise<RegisterResponse> => {
    return new Promise((resolve, reject) => {
        http.post('/auth/register', data)
            .then((response) => resolve(response.data.data))
            .catch(reject);
    });
};
