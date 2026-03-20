import useSWR from 'swr';
import http from '@/api/http';
import { useUserSWRKey } from '@/plugins/useSWRKey';

export interface UserQuota {
    memory: number;
    cpu: number;
    disk: number;
    servers: number;
    used_memory: number;
    used_cpu: number;
    used_disk: number;
    used_servers: number;
}

export default (): UserQuota | undefined => {
    const key = useUserSWRKey(['account', 'quota']);

    const { data } = useSWR(key, async () => {
        const { data } = await http.get('/api/client/account/quota');
        return data.attributes as UserQuota;
    });

    return data;
};
