import http from '@/api/http';

export default async (uuid: string, eggId: number, dockerImage: string, version?: string): Promise<void> => {
    await http.put(`/api/client/servers/${uuid}/settings/egg`, {
        egg_id: eggId,
        docker_image: dockerImage,
        version: version || undefined,
    });
};
