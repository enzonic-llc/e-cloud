import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import deleteServer from '@/api/server/deleteServer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const removeServer = () => {
        clearFlashes('settings');
        setIsSubmitting(true);
        deleteServer(uuid)
            .then(() => {
                window.location.href = '/';
            })
            .catch((error) => {
                console.error(error);
                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
                setIsSubmitting(false);
                setModalVisible(false);
            });
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    useEffect(() => {
        if (!modalVisible) {
            setConfirmName('');
            setIsSubmitting(false);
        }
    }, [modalVisible]);

    return (
        <TitledGreyBox title={'Delete Server'} css={tw`relative`}>
            <Dialog
                open={modalVisible}
                onClose={() => !isSubmitting && setModalVisible(false)}
            >
                <div css={tw`mb-4`}>
                    <Dialog.Icon position={'container'} type={'danger'} />
                    <h2 css={tw`text-2xl mb-2 flex items-center`}>Delete Server</h2>
                    <p css={tw`text-neutral-300 mt-2`}>
                        This action will immediately delete your server and all of its data. This cannot be undone.
                    </p>
                </div>
                <div css={tw`mt-6`}>
                    <Label>Confirm Server Name</Label>
                    <Input
                        type={'text'}
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder={name}
                    />
                    <p css={tw`text-xs text-neutral-400 mt-2`}>
                        Please type <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>{name}</code> to confirm.
                    </p>
                </div>
                <div css={tw`flex justify-end mt-8 sm:mt-6 space-x-4`}>
                    <Button.Text variant={Button.Variants.Secondary} onClick={() => setModalVisible(false)} disabled={isSubmitting}>
                        Cancel
                    </Button.Text>
                    <Button.Danger
                        onClick={removeServer}
                        disabled={confirmName !== name || isSubmitting}
                    >
                        Delete Server
                    </Button.Danger>
                </div>
            </Dialog>
            <p css={tw`text-sm`}>
                Deleting your server is an irreversible action. All files, databases, and settings will be permanently lost.
                <strong css={tw`font-medium`}>
                    Please ensure you have backups of any important data before proceeding.
                </strong>
            </p>
            <div css={tw`mt-6 text-right`}>
                <Button.Danger variant={Button.Variants.Secondary} onClick={() => setModalVisible(true)}>
                    Delete Server
                </Button.Danger>
            </div>
        </TitledGreyBox>
    );
};
