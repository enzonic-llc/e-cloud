import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { object, string, number } from 'yup';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import Field from '@/components/elements/Field';
import Select from '@/components/elements/Select';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import getDeployableEggs, { DeployableEgg } from '@/api/account/getDeployableEggs';
import createServer from '@/api/account/createServer';
import Label from '@/components/elements/Label';

interface Values {
    name: string;
    memory: number;
    cpu: number;
    disk: number;
    egg_id: number;
    minecraft_version: string;
}

export default () => {
    const history = useHistory();
    const { addFlash, clearFlashes } = useFlash();
    const eggs = getDeployableEggs();
    const [selectedEgg, setSelectedEgg] = useState<DeployableEgg | undefined>(undefined);

    useEffect(() => {
        clearFlashes('server:create');
    }, []);

    const submit = (values: Values, { setSubmitting }: any) => {
        clearFlashes('server:create');
        
        const payload = {
            name: values.name,
            memory: values.memory,
            cpu: values.cpu,
            disk: values.disk,
            egg_id: values.egg_id,
            ...(selectedEgg?.is_minecraft ? { minecraft_version: values.minecraft_version } : {})
        };

        createServer(payload)
            .then(() => {
                history.push('/');
                addFlash({
                    key: 'dashboard',
                    type: 'success',
                    message: 'Server created successfully!',
                });
            })
            .catch((error) => {
                let message = 'An error occurred while creating the server.';
                if (error.response?.data?.errors) {
                    message = error.response.data.errors.map((e: any) => e.detail).join('\n');
                } else if (error.message) {
                    message = error.message;
                }
                
                addFlash({
                    key: 'server:create',
                    type: 'error',
                    message,
                });
                setSubmitting(false);
            });
    };

    if (!eggs) {
        return <Spinner centered size={'large'} />;
    }

    return (
        <PageContentBlock title={'Create Server'} showFlashKey={'server:create'}>
            <div css={tw`w-full flex justify-center mt-4`}>
                <div css={tw`w-full max-w-2xl bg-neutral-800 p-6 rounded shadow-md`}>
                    <h2 css={tw`text-2xl mb-6`}>Create New Server</h2>
                    <Formik
                        onSubmit={submit}
                        initialValues={{
                            name: '',
                            memory: 1024,
                            cpu: 100,
                            disk: 1024,
                            egg_id: eggs.length > 0 ? eggs[0].id : 0,
                            minecraft_version: 'latest',
                        }}
                        validationSchema={object().shape({
                            name: string().required('A server name is required.'),
                            memory: number().required().min(100),
                            cpu: number().required().min(10),
                            disk: number().required().min(100),
                            egg_id: number().required().min(1, 'Please select a valid egg.'),
                            minecraft_version: string().when('egg_id', (eggId, schema) => {
                                const egg = eggs.find(e => e.id === Number(eggId));
                                if (egg && egg.is_minecraft) {
                                    return schema.required('Minecraft version is required.');
                                }
                                return schema;
                            })
                        })}
                    >
                        {({ isSubmitting, values, setFieldValue }) => {
                            // Update selectedEgg state to track if we need to show Minecraft Version
                            useEffect(() => {
                                const egg = eggs.find(e => e.id === Number(values.egg_id));
                                setSelectedEgg(egg);
                            }, [values.egg_id]);

                            return (
                                <Form css={tw`flex flex-col gap-6`}>
                                    <div>
                                        <Field name={'name'} label={'Server Name'} description={'A descriptive name for your server.'} />
                                    </div>

                                    <div css={tw`flex flex-col md:flex-row gap-4`}>
                                        <div css={tw`flex-1`}>
                                            <Field type={'number'} name={'memory'} label={'Memory (MB)'} />
                                        </div>
                                        <div css={tw`flex-1`}>
                                            <Field type={'number'} name={'cpu'} label={'CPU (%)'} />
                                        </div>
                                        <div css={tw`flex-1`}>
                                            <Field type={'number'} name={'disk'} label={'Disk (MB)'} />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Select Egg</Label>
                                        <Select
                                            name={'egg_id'}
                                            onChange={(e) => setFieldValue('egg_id', Number(e.target.value))}
                                            value={values.egg_id}
                                        >
                                            {eggs.length === 0 && <option value={0}>No eggs available</option>}
                                            {eggs.map((egg) => (
                                                <option key={egg.id} value={egg.id}>
                                                    {egg.name}
                                                </option>
                                            ))}
                                        </Select>
                                        {selectedEgg?.description && (
                                            <p css={tw`text-sm text-neutral-400 mt-2`}>{selectedEgg.description}</p>
                                        )}
                                    </div>

                                    {selectedEgg?.is_minecraft && (
                                        <div>
                                            <Field name={'minecraft_version'} label={'Minecraft Version'} description={'Enter the Minecraft version (e.g. 1.19.4) or "latest".'} />
                                        </div>
                                    )}

                                    <div css={tw`flex justify-end mt-4`}>
                                        <Button
                                            type={'submit'}
                                            color={'primary'}
                                            size={'large'}
                                            disabled={isSubmitting}
                                            isLoading={isSubmitting}
                                        >
                                            Create Server
                                        </Button>
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                </div>
            </div>
        </PageContentBlock>
    );
};