import React, { useState, useEffect } from 'react';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import pullFile from '@/api/server/files/pullFile';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components';

interface ModrinthProject {
    project_id: string;
    project_type: string;
    slug: string;
    title: string;
    description: string;
    icon_url: string;
    author: string;
}

const Card = styled.div`
    ${tw`bg-neutral-800 rounded-2xl shadow-md p-4 flex flex-col justify-between border border-neutral-700 transition-colors duration-200`};
    &:hover {
        ${tw`border-green-500`};
    }
`;

const Header = styled.div`
    ${tw`flex items-center mb-3`};
`;

const Icon = styled.img`
    ${tw`w-12 h-12 rounded-lg mr-4 bg-neutral-900 object-cover`};
`;

const Title = styled.h3`
    ${tw`text-lg font-bold text-neutral-100 truncate`};
`;

const Author = styled.span`
    ${tw`text-sm text-neutral-400`};
`;

const Description = styled.p`
    ${tw`text-sm text-neutral-300 mb-4 line-clamp-3`};
`;

export default () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ModrinthProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState<string | null>(null);
    const { addFlash, clearFlashes } = useFlash();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const searchMods = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        setLoading(true);
        clearFlashes('mods');
        try {
            const res = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=20`);
            const data = await res.json();
            setResults(data.hits || []);
        } catch (error) {
            addFlash({ type: 'error', key: 'mods', message: 'Failed to search Modrinth API.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchMods();
    }, []);

    const installMod = async (project: ModrinthProject) => {
        setInstalling(project.project_id);
        clearFlashes('mods');
        try {
            // Fetch versions
            const versionsRes = await fetch(`https://api.modrinth.com/v2/project/${project.project_id}/version`);
            const versions = await versionsRes.json();
            
            if (!versions || versions.length === 0) {
                throw new Error('No versions found for this project.');
            }

            // Find a valid jar file from the latest version
            const latestVersion = versions[0];
            const file = latestVersion.files.find((f: any) => f.filename.endsWith('.jar')) || latestVersion.files[0];
            
            if (!file) {
                throw new Error('No downloadable file found.');
            }

            const directory = project.project_type === 'plugin' ? '/plugins' : '/mods';

            await pullFile(uuid, directory, file.url, file.filename);
            
            addFlash({ type: 'success', key: 'mods', message: `Successfully requested installation for ${project.title}. It will be downloaded to ${directory}.` });
        } catch (error: any) {
            addFlash({ type: 'error', key: 'mods', message: error.message || 'Failed to install project.' });
        } finally {
            setInstalling(null);
        }
    };

    return (
        <ServerContentBlock title={'Mods & Plugins'} description={'Search and install mods or plugins using Modrinth.'}>
            <form onSubmit={searchMods} css={tw`mb-6 flex gap-4`}>
                <Input
                    placeholder={'Search for a mod or plugin...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    css={tw`flex-1 rounded-xl bg-neutral-900 border-neutral-700 focus:border-green-500`}
                />
                <Button type={'submit'} disabled={loading} css={tw`rounded-xl bg-green-600 hover:bg-green-500 border-none`}>
                    Search
                </Button>
            </form>

            {loading ? (
                <div css={tw`w-full flex justify-center py-10`}>
                    <Spinner size={'large'} />
                </div>
            ) : (
                <div css={tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                    {results.map((project) => (
                        <Card key={project.project_id}>
                            <div>
                                <Header>
                                    <Icon src={project.icon_url || '/assets/images/pterodactyl.svg'} alt={project.title} />
                                    <div css={tw`overflow-hidden`}>
                                        <Title>{project.title}</Title>
                                        <Author>{project.author}</Author>
                                    </div>
                                </Header>
                                <Description>{project.description}</Description>
                            </div>
                            <div css={tw`flex justify-between items-center mt-2`}>
                                <span css={tw`text-xs uppercase font-bold tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-lg`}>
                                    {project.project_type}
                                </span>
                                <Button
                                    size={'small'}
                                    disabled={installing === project.project_id}
                                    onClick={() => installMod(project)}
                                    css={tw`rounded-xl bg-green-600 hover:bg-green-500 border-none`}
                                >
                                    {installing === project.project_id ? 'Installing...' : 'Install'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {results.length === 0 && !loading && (
                        <div css={tw`col-span-full text-center text-neutral-400 py-10`}>
                            No mods or plugins found. Try a different search term.
                        </div>
                    )}
                </div>
            )}
        </ServerContentBlock>
    );
};
