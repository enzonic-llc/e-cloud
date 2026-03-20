import useSWR from 'swr';
import http from '@/api/http';
import { useUserSWRKey } from '@/plugins/useSWRKey';

export interface DeployableEgg {
    id: number;
    name: string;
    description: string;
    is_minecraft: boolean;
}

export default (): DeployableEgg[] | undefined => {
    const key = useUserSWRKey(['account', 'deployable_eggs']);

    const { data } = useSWR(key, async () => {
        const { data } = await http.get('/api/client/deployable-eggs');
        return (data.data || []).map((item: any) => item.attributes as DeployableEgg);
    });

    return data;
};
