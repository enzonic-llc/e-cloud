import http from '@/api/http';

export default async (uuid: string, directory: string, url: string, filename?: string): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/files/pull`, {
        url,
        directory,
        filename,
    });
};
