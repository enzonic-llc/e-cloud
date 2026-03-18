import React, { useEffect, useState } from 'react';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import getFileContents from '@/api/server/files/getFileContents';
import saveFileContents from '@/api/server/files/saveFileContents';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import Switch from '@/components/elements/Switch';
import { httpErrorToHuman } from '@/api/http';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addFlash, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fileContent, setFileContent] = useState('');
    const [properties, setProperties] = useState<Record<string, string>>({});
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        clearFlashes('properties');
        getFileContents(uuid, 'server.properties')
            .then((content) => {
                setFileContent(content);
                const props: Record<string, string> = {};
                content.split('\n').forEach((line) => {
                    if (!line.trim().startsWith('#') && line.includes('=')) {
                        const [key, ...rest] = line.split('=');
                        props[key.trim()] = rest.join('=').trim();
                    }
                });
                setProperties(props);
                setError(false);
            })
            .catch((err) => {
                console.error(err);
                setError(true);
                addFlash({
                    key: 'properties',
                    type: 'error',
                    message: 'Could not load server.properties. Make sure the file exists in the server root directory.',
                });
            })
            .then(() => setLoading(false));
    }, [uuid]);

    const handleChange = (key: string, value: string) => {
        setProperties((p) => ({ ...p, [key]: value }));
    };

    const save = () => {
        setSubmitting(true);
        clearFlashes('properties');

        const lines = fileContent.split('\n');
        const result: string[] = [];
        const usedKeys = new Set<string>();

        lines.forEach((line) => {
            if (!line.trim().startsWith('#') && line.includes('=')) {
                const [key] = line.split('=');
                const trimmedKey = key.trim();
                if (properties[trimmedKey] !== undefined) {
                    result.push(`${trimmedKey}=${properties[trimmedKey]}`);
                    usedKeys.add(trimmedKey);
                } else {
                    result.push(line);
                }
            } else {
                result.push(line);
            }
        });

        Object.keys(properties).forEach((key) => {
            if (!usedKeys.has(key)) {
                result.push(`${key}=${properties[key]}`);
            }
        });

        const newContent = result.join('\n');

        saveFileContents(uuid, 'server.properties', newContent)
            .then(() => {
                setFileContent(newContent);
                addFlash({
                    key: 'properties',
                    type: 'success',
                    message: 'Successfully saved server.properties.',
                });
            })
            .catch((err) => {
                console.error(err);
                addFlash({
                    key: 'properties',
                    type: 'error',
                    message: httpErrorToHuman(err),
                });
            })
            .then(() => setSubmitting(false));
    };

    if (loading) {
        return <Spinner size={'large'} centered />;
    }

    if (error) {
        return (
            <ServerContentBlock title={'Server Properties'}>
                <FlashMessageRender byKey={'properties'} css={tw`mb-4`} />
            </ServerContentBlock>
        );
    }

    // Properties to render specially (boolean toggles)
    const booleanProps = [
        'allow-flight', 'allow-nether', 'broadcast-console-to-ops', 'broadcast-rcon-to-ops', 
        'enable-command-block', 'enable-jmx-monitoring', 'enable-rcon', 
        'enable-status', 'enable-query', 'enforce-whitelist', 'force-gamemode', 
        'generate-structures', 'hardcore', 'hide-online-players', 'online-mode', 
        'prevent-proxy-connections', 'pvp', 'require-resource-pack', 'spawn-animals', 
        'spawn-monsters', 'spawn-npcs', 'sync-chunk-writes', 'use-native-transport', 
        'white-list', 'enforce-secure-profile'
    ];

    return (
        <ServerContentBlock title={'Server Properties'}>
            <FlashMessageRender byKey={'properties'} css={tw`mb-4`} />
            
            <TitledGreyBox title={'Edit Server Properties'} css={tw`mb-6`}>
                <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                    {Object.keys(properties).map((key) => {
                        const isBool = booleanProps.includes(key) || properties[key] === 'true' || properties[key] === 'false';
                        
                        if (isBool) {
                            return (
                                <div key={key} css={tw`flex items-center justify-between p-4 bg-neutral-900 rounded-md`}>
                                    <Label css={tw`mb-0`}>{key}</Label>
                                    <Switch
                                        name={key}
                                        checked={properties[key] === 'true'}
                                        onChange={(e) => handleChange(key, e.target.checked ? 'true' : 'false')}
                                    />
                                </div>
                            );
                        }

                        return (
                            <div key={key} css={tw`p-4 bg-neutral-900 rounded-md`}>
                                <Label>{key}</Label>
                                <Input
                                    value={properties[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                />
                            </div>
                        );
                    })}
                </div>
                <div css={tw`mt-6 flex justify-end`}>
                    <Button onClick={save} disabled={submitting}>
                        Save Properties
                    </Button>
                </div>
            </TitledGreyBox>
        </ServerContentBlock>
    );
};
