import React, { useEffect, useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import getEggs, { Egg } from '@/api/server/getEggs';
import updateEgg from '@/api/server/updateEgg';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/components/elements/button/index';
import Select from '@/components/elements/Select';
import Input from '@/components/elements/Input';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const serverImage = ServerContext.useStoreState((state) => state.server.data!.dockerImage);
    const { clearFlashes, addFlash } = useFlash();
    const [eggs, setEggs] = useState<Egg[]>([]);
    const [selectedEggId, setSelectedEggId] = useState<number | undefined>();
    const [selectedImage, setSelectedImage] = useState<string | undefined>();
    const [version, setVersion] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getEggs(uuid)
            .then((data) => {
                setEggs(data);
                if (data.length > 0) {
                    let defaultEgg = data[0];
                    let defaultImage = Object.values(defaultEgg.docker_images)[0];

                    // Try to find the egg that matches the current server image
                    const matchingEgg = data.find(egg => Object.values(egg.docker_images).includes(serverImage));
                    if (matchingEgg) {
                        defaultEgg = matchingEgg;
                        defaultImage = serverImage;
                    }

                    setSelectedEggId(defaultEgg.id);
                    setSelectedImage(defaultImage);
                }
            })
            .catch((error) => {
                console.error(error);
                addFlash({ key: 'settings', type: 'error', message: 'Failed to fetch available eggs.' });
            });
    }, [uuid]);

    const selectedEgg = eggs.find(e => e.id === selectedEggId);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedEggId || !selectedImage) return;

        setIsSubmitting(true);
        clearFlashes('settings');

        updateEgg(uuid, selectedEggId, selectedImage, version)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Server egg and version has been updated successfully. You may need to restart or reinstall your server for changes to apply fully.',
                });
            })
            .catch((error) => {
                console.error(error);
                addFlash({ key: 'settings', type: 'error', message: 'Failed to update server egg.' });
            })
            .then(() => setIsSubmitting(false));
    };

    return (
        <TitledGreyBox title={'Change Server Version / Egg'} css={tw`mb-6 md:mb-10`}>
            <form onSubmit={submit}>
                <div css={tw`mb-6`}>
                    <Label>Select Egg</Label>
                    <Select
                        value={selectedEggId || ''}
                        onChange={(e) => {
                            const newId = Number(e.target.value);
                            setSelectedEggId(newId);
                            const newEgg = eggs.find(egg => egg.id === newId);
                            if (newEgg) {
                                setSelectedImage(Object.values(newEgg.docker_images)[0]);
                            }
                        }}
                    >
                        {eggs.map((egg) => (
                            <option key={egg.id} value={egg.id}>
                                {egg.name}
                            </option>
                        ))}
                    </Select>
                    {selectedEgg && <p css={tw`text-sm text-neutral-400 mt-2`}>{selectedEgg.description}</p>}
                </div>

                {selectedEgg && Object.keys(selectedEgg.docker_images).length > 0 && (
                    <div css={tw`mb-6`}>
                        <Label>Docker Image (Version)</Label>
                        <Select
                            value={selectedImage || ''}
                            onChange={(e) => setSelectedImage(e.target.value)}
                        >
                            {Object.entries(selectedEgg.docker_images).map(([name, image]) => (
                                <option key={image} value={image}>
                                    {name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                <div css={tw`mb-6`}>
                    <Label>Version (Optional)</Label>
                    <Input
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder={'e.g. latest, 1.19.2, etc.'}
                    />
                    <p css={tw`text-sm text-neutral-400 mt-2`}>
                        If your selected egg uses a specific version variable (like MINECRAFT_VERSION or VERSION), you can override it here. Leave empty to use default.
                    </p>
                </div>

                <div css={tw`flex justify-end`}>
                    <Button type={'submit'} disabled={isSubmitting || !selectedEggId || !selectedImage}>
                        Update Server Egg
                    </Button>
                </div>
            </form>
        </TitledGreyBox>
    );
};
