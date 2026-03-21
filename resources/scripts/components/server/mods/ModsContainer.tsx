import React, { useState, useEffect } from 'react';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import pullFile from '@/api/server/files/pullFile';
import loadDirectory from '@/api/server/files/loadDirectory';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import Select from '@/components/elements/Select';
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

const Card = styled.div<{ $isInstalled?: boolean }>`
    ${tw`bg-neutral-800 rounded-2xl shadow-md p-4 flex flex-col justify-between border transition-colors duration-200`};
    ${props => props.$isInstalled ? tw`border-blue-500/50` : tw`border-neutral-700`};
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

const getSoftware = (eggName: string, variables: any[]) => {
    let checkString = (eggName || '').toLowerCase();
    
    if (variables) {
        const jarVar = variables.find(v => v.envVariable === 'SERVER_JARFILE' || v.envVariable === 'JARFILE');
        if (jarVar && (jarVar.serverValue || jarVar.defaultValue)) {
            checkString += ' ' + (jarVar.serverValue || jarVar.defaultValue).toLowerCase();
        }
    }

    if (checkString.includes('fabric')) return 'fabric';
    if (checkString.includes('neoforge')) return 'neoforge';
    if (checkString.includes('forge')) return 'forge';
    if (checkString.includes('paper')) return 'paper';
    if (checkString.includes('purpur')) return 'purpur';
    if (checkString.includes('spigot')) return 'spigot';
    if (checkString.includes('quilt')) return 'quilt';
    if (checkString.includes('velocity')) return 'velocity';
    if (checkString.includes('bungee') || checkString.includes('waterfall')) return 'bungee';
    if (checkString.includes('vanilla')) return 'vanilla';
    return '';
};

const getVersion = (variables: any[]) => {
    if (!variables) return '';
    const versionVar = variables.find(v => 
        ['MINECRAFT_VERSION', 'MC_VERSION', 'VERSION'].includes(v.envVariable) ||
        v.envVariable.includes('VERSION')
    );
    return versionVar ? versionVar.serverValue || versionVar.defaultValue || '' : '';
};

export default () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ModrinthProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState<string | null>(null);
    const [installedFiles, setInstalledFiles] = useState<string[]>([]);
    const { addFlash, clearFlashes } = useFlash();
    
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const variables = ServerContext.useStoreState((state) => state.server.data!.variables);
    const eggName = ServerContext.useStoreState((state) => state.server.data!.eggName);

    const [selectedVersion, setSelectedVersion] = useState(() => getVersion(variables));
    const [selectedSoftware, setSelectedSoftware] = useState(() => getSoftware(eggName, variables));

    const fetchInstalled = async () => {
        let files: string[] = [];
        try {
            const mods = await loadDirectory(uuid, '/mods');
            files = [...files, ...mods.map(f => f.name.toLowerCase())];
        } catch (e) {}
        try {
            const plugins = await loadDirectory(uuid, '/plugins');
            files = [...files, ...plugins.map(f => f.name.toLowerCase())];
        } catch (e) {}
        setInstalledFiles(files);
    };

    const searchMods = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        setLoading(true);
        clearFlashes('mods');
        try {
            const facets = [];
            if (selectedVersion) {
                facets.push([`versions:${selectedVersion}`]);
            }
            if (selectedSoftware) {
                facets.push([`categories:${selectedSoftware}`]);
            }

            let url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=20`;
            if (facets.length > 0) {
                url += `&facets=${encodeURIComponent(JSON.stringify(facets))}`;
            }

            const res = await fetch(url);
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
        fetchInstalled();
    }, []);

    const isInstalled = (project: ModrinthProject) => {
        const slug = project.slug.toLowerCase();
        const title = project.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        return installedFiles.some(fileName => 
            fileName.includes(slug) || 
            fileName.replace(/[^a-z0-9]/g, '').includes(title)
        );
    };

    const installMod = async (project: ModrinthProject) => {
        setInstalling(project.project_id);
        clearFlashes('mods');
        try {
            const queryParams = new URLSearchParams();
            if (selectedVersion) {
                queryParams.append('game_versions', JSON.stringify([selectedVersion]));
            }
            if (selectedSoftware) {
                queryParams.append('loaders', JSON.stringify([selectedSoftware.toLowerCase()]));
            }
            
            const versionsRes = await fetch(`https://api.modrinth.com/v2/project/${project.project_id}/version?${queryParams.toString()}`);
            const versions = await versionsRes.json();
            
            if (!versions || versions.length === 0) {
                throw new Error(`No versions found for this project matching ${selectedVersion || 'any version'} and ${selectedSoftware || 'any software'}.`);
            }

            const latestVersion = versions[0];
            const file = latestVersion.files.find((f: any) => f.primary && f.filename.endsWith('.jar')) 
                      || latestVersion.files.find((f: any) => f.filename.endsWith('.jar')) 
                      || latestVersion.files[0];
            
            if (!file) {
                throw new Error('No downloadable file found.');
            }

            let directory = '/plugins';
            if (['fabric', 'forge', 'neoforge', 'quilt'].includes(selectedSoftware.toLowerCase())) {
                directory = '/mods';
            } else if (project.project_type === 'mod') {
                directory = '/mods';
            }

            await pullFile(uuid, directory, file.url, file.filename);
            
            addFlash({ type: 'success', key: 'mods', message: `Successfully requested installation for ${project.title}. It will be downloaded to ${directory}.` });
            fetchInstalled();
        } catch (error: any) {
            addFlash({ type: 'error', key: 'mods', message: error.message || 'Failed to install project.' });
        } finally {
            setInstalling(null);
        }
    };

    return (
        <ServerContentBlock title={'Mods & Plugins'}>
            <div css={tw`mb-8 bg-neutral-800 p-6 rounded-2xl shadow-md border border-neutral-700`}>
                <h2 css={tw`text-xl font-bold text-neutral-100 mb-4`}>Search Modrinth</h2>
                <form onSubmit={searchMods} css={tw`flex flex-col md:flex-row gap-4`}>
                    <Input
                        placeholder={'Search for a mod or plugin...'}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        css={tw`flex-1 rounded-xl bg-neutral-900 border-2 border-neutral-600 focus:border-green-500 p-4 text-lg shadow-inner`}
                    />
                    <Input
                        placeholder={'Version (e.g. 1.20.1)'}
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        css={tw`w-full md:w-32 rounded-xl bg-neutral-900 border-2 border-neutral-600 focus:border-green-500 p-4 text-lg`}
                    />
                    <Select
                        value={selectedSoftware}
                        onChange={(e) => setSelectedSoftware(e.target.value)}
                        css={tw`w-full md:w-48 rounded-xl bg-neutral-900 border-2 border-neutral-600 focus:border-green-500 p-4 text-lg`}
                    >
                        <option value="">Any Software</option>
                        <option value="fabric">Fabric</option>
                        <option value="forge">Forge</option>
                        <option value="neoforge">NeoForge</option>
                        <option value="paper">Paper</option>
                        <option value="purpur">Purpur</option>
                        <option value="spigot">Spigot</option>
                        <option value="quilt">Quilt</option>
                        <option value="velocity">Velocity</option>
                        <option value="bungee">Bungee</option>
                        <option value="vanilla">Vanilla</option>
                    </Select>
                    <Button type={'submit'} disabled={loading} css={tw`rounded-xl bg-green-600 hover:bg-green-500 border-none p-4 text-lg`}>
                        Search
                    </Button>
                </form>
            </div>

            {loading ? (
                <div css={tw`w-full flex justify-center py-10`}>
                    <Spinner size={'large'} />
                </div>
            ) : (
                <div css={tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                    {results.map((project) => {
                        const installed = isInstalled(project);
                        return (
                            <Card key={project.project_id} $isInstalled={installed}>
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
                                    <div>
                                        <span css={tw`text-xs uppercase font-bold tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-lg`}>
                                            {project.project_type}
                                        </span>
                                        {installed && (
                                            <span css={tw`text-xs uppercase font-bold tracking-wider text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg ml-2`}>
                                                Installed
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        size={'small'}
                                        disabled={installing === project.project_id || installed}
                                        onClick={() => installMod(project)}
                                        css={[
                                            tw`rounded-xl border-none px-4 py-2`,
                                            installed ? tw`bg-neutral-600 text-neutral-400` : tw`bg-green-600 hover:bg-green-500`
                                        ]}
                                    >
                                        {installing === project.project_id ? 'Installing...' : (installed ? 'Installed' : 'Install')}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                    {results.length === 0 && !loading && (
                        <div css={tw`col-span-full text-center text-neutral-400 py-10`}>
                            No mods or plugins found. Try a different search term or change your filters.
                        </div>
                    )}
                </div>
            )}
        </ServerContentBlock>
    );
};
