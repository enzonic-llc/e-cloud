import http from '@/api/http';

export interface Egg {
    id: number;
    name: string;
    description: string;
    docker_images: Record<string, string>;
}

export default async (uuid: string): Promise<Egg[]> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/settings/eggs`);
    return data || [];
};
