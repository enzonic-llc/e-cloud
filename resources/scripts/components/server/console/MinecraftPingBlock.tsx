import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const [mcStatus, setMcStatus] = useState<any>(null);

    const isMinecraft = ['minecraft', 'paper', 'forge', 'spigot', 'vanilla', 'purpur', 'fabric'].some((type) =>
        server.eggName.toLowerCase().includes(type)
    );

    useEffect(() => {
        if (!isMinecraft) return;

        if (status === 'running' || status === 'starting') {
            const alloc = server.allocations.find((a) => a.isDefault);
            if (alloc) {
                const targetIp = alloc.alias || alloc.ip;
                fetch(`https://api.mcsrvstat.us/3/${targetIp}:${alloc.port}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.online) {
                            setMcStatus(data);
                        } else {
                            setMcStatus(null);
                        }
                    })
                    .catch(() => setMcStatus(null));
            }
        } else {
            setMcStatus(null);
        }
    }, [status, isMinecraft, server.allocations]);

    if (!isMinecraft || !mcStatus) {
        return null;
    }

    return (
        <div css={tw`flex items-center mt-2 bg-neutral-900/50 p-3 rounded-md border border-neutral-800`}>
            {mcStatus.icon && (
                <img src={mcStatus.icon} css={tw`w-12 h-12 rounded mr-4`} alt="Server Icon" />
            )}
            <div>
                <div css={tw`flex items-center text-xs text-neutral-400 mb-1`}>
                    <span css={tw`mr-2 bg-green-500 text-green-100 rounded px-2 py-0.5 font-bold`}>
                        {mcStatus.players?.online || 0} / {mcStatus.players?.max || 0} Players
                    </span>
                    {mcStatus.version && (
                        <span css={tw`bg-neutral-700 text-neutral-300 rounded px-2 py-0.5`}>
                            {mcStatus.version}
                        </span>
                    )}
                </div>
                <div
                    css={tw`text-sm`}
                    dangerouslySetInnerHTML={{ __html: mcStatus.motd?.html?.join('<br>') || '' }}
                />
            </div>
        </div>
    );
};
