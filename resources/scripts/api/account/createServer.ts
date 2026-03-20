import http from '@/api/http';

export interface CreateServerRequest {
    name: string;
    memory: number;
    cpu: number;
    disk: number;
    egg_id: number;
    minecraft_version?: string;
}

export default async (data: CreateServerRequest): Promise<void> => {
    await http.post('/api/client/servers', data);
};
