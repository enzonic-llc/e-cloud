import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Formik, useField } from 'formik';
import { object, string, number } from 'yup';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import Field from '@/components/elements/Field';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import getDeployableEggs, { DeployableEgg } from '@/api/account/getDeployableEggs';
import createServer from '@/api/account/createServer';
import getQuota from '@/api/account/getQuota';

interface Values {
    name: string;
    memory: number;
    cpu: number;
    disk: number;
    egg_id: number;
    minecraft_version: string;
}

const SliderField = ({ label, name, min, max, unit }: { label: string, name: string, min: number, max: number, unit: string }) => {
    const [field, meta, helpers] = useField(name);

    return (
        <div css={tw`flex flex-col mb-4`}>
            <div css={tw`flex justify-between items-center mb-1`}>
                <label css={tw`text-sm text-green-200 font-semibold tracking-wide`}>{label}</label>
                <span css={tw`text-sm text-white font-medium bg-green-900/50 px-2 py-0.5 rounded`}>
                    {field.value} {unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max === 0 ? 100000 : max} // Fallback if no limit
                {...field}
                css={[
                    tw`w-full h-2 bg-green-900/50 rounded-lg appearance-none cursor-pointer`,
                    `&::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: #4ade80; /* green-400 */
                        cursor: pointer;
                        box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
                    }
                    &::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: #4ade80;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
                    }`
                ]}
                onChange={(e) => helpers.setValue(Number(e.target.value))}
            />
            {meta.touched && meta.error ? (
                <p css={tw`text-xs text-red-400 mt-1`}>{meta.error}</p>
            ) : null}
            <div css={tw`flex justify-between text-xs text-green-400/50 mt-1`}>
                <span>{min} {unit}</span>
                <span>{max === 0 ? '∞' : max} {unit}</span>
            </div>
        </div>
    );
};

export default () => {
    const history = useHistory();
    const { addFlash, clearFlashes } = useFlash();
    const eggs = getDeployableEggs();
    const quota = getQuota();
    
    // Default to the first egg, ideally a Minecraft egg if we can find one
    const [selectedEgg, setSelectedEgg] = useState<DeployableEgg | undefined>(undefined);

    useEffect(() => {
        clearFlashes('server:create');
    }, []);

    useEffect(() => {
        if (eggs && eggs.length > 0 && !selectedEgg) {
            const mcEgg = eggs.find(e => e.is_minecraft) || eggs[0];
            setSelectedEgg(mcEgg);
        }
    }, [eggs]);

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

    if (!eggs || !quota || !selectedEgg) {
        return <Spinner centered size={'large'} />;
    }

    const availableMemory = quota.memory === 0 ? 0 : Math.max(0, quota.memory - quota.used_memory);
    const availableCpu = quota.cpu === 0 ? 0 : Math.max(0, quota.cpu - quota.used_cpu);
    const availableDisk = quota.disk === 0 ? 0 : Math.max(0, quota.disk - quota.used_disk);

    return (
        <PageContentBlock title={'Create Server'} showFlashKey={'server:create'}>
            <div css={tw`w-full flex justify-center mt-10 mb-10`}>
                <div css={tw`w-full max-w-2xl bg-neutral-900 border border-green-500/20 p-8 rounded-2xl shadow-2xl`}>
                    <div css={tw`flex flex-col items-center mb-8`}>
                        <div css={tw`bg-green-500 p-3 rounded-full mb-4 shadow-lg shadow-green-500/30`}>
                            <svg xmlns="http://www.w3.org/2000/svg" css={tw`h-6 w-6 text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h2 css={tw`text-3xl font-extrabold text-white tracking-tight text-center`}>
                            Create a <span css={tw`text-green-400`}>New Server</span>
                        </h2>
                        <p css={tw`text-green-200/80 mt-2 text-center`}>Configure your server resources and get started.</p>
                    </div>

                    <Formik
                        onSubmit={submit}
                        initialValues={{
                            name: '',
                            memory: Math.min(1024, availableMemory === 0 ? 1024 : availableMemory),
                            cpu: Math.min(100, availableCpu === 0 ? 100 : availableCpu),
                            disk: Math.min(1024, availableDisk === 0 ? 1024 : availableDisk),
                            egg_id: selectedEgg.id,
                            minecraft_version: 'latest',
                        }}
                        validationSchema={object().shape({
                            name: string().required('A server name is required.'),
                            memory: number().required().min(100).max(availableMemory === 0 ? 999999 : availableMemory),
                            cpu: number().required().min(10).max(availableCpu === 0 ? 999999 : availableCpu),
                            disk: number().required().min(100).max(availableDisk === 0 ? 999999 : availableDisk),
                            egg_id: number().required().min(1, 'Please select a valid egg.'),
                            minecraft_version: string().when('egg_id', (eggId, schema) => {
                                if (selectedEgg && selectedEgg.is_minecraft) {
                                    return schema.required('Minecraft version is required.');
                                }
                                return schema;
                            })
                        })}
                    >
                        {({ isSubmitting, setFieldValue }) => (
                            <Form css={tw`flex flex-col gap-6`}>
                                <div css={tw`bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50`}>
                                    <div css={tw`mb-2`}>
                                        <label css={tw`text-sm text-green-200 font-semibold tracking-wide mb-2 block`}>Server Name</label>
                                        <Field 
                                            name={'name'} 
                                            placeholder={'e.g., My Awesome Server'}
                                        />
                                    </div>
                                    <p css={tw`text-xs text-green-400/50`}>A descriptive name to help you identify this server.</p>
                                </div>

                                <div css={tw`bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 flex flex-col gap-4`}>
                                    <h3 css={tw`text-lg font-bold text-white mb-2`}>Resource Limits</h3>
                                    <SliderField 
                                        name={'memory'} 
                                        label={'Memory'} 
                                        min={100} 
                                        max={availableMemory} 
                                        unit={'MB'} 
                                    />
                                    <SliderField 
                                        name={'cpu'} 
                                        label={'CPU'} 
                                        min={10} 
                                        max={availableCpu} 
                                        unit={'%'} 
                                    />
                                    <SliderField 
                                        name={'disk'} 
                                        label={'Storage'} 
                                        min={100} 
                                        max={availableDisk} 
                                        unit={'MB'} 
                                    />
                                </div>

                                {selectedEgg?.is_minecraft && (
                                    <div css={tw`bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50`}>
                                        <div css={tw`mb-2`}>
                                            <label css={tw`text-sm text-green-200 font-semibold tracking-wide mb-2 block`}>Minecraft Version</label>
                                            <Field 
                                                name={'minecraft_version'} 
                                                placeholder={'e.g. 1.19.4 or latest'}
                                            />
                                        </div>
                                        <p css={tw`text-xs text-green-400/50`}>Leave as "latest" to install the newest version, or specify a particular release.</p>
                                    </div>
                                )}

                                <div css={tw`mt-4 flex justify-end`}>
                                    <Button
                                        type={'submit'}
                                        css={tw`w-full py-4 text-lg font-bold bg-green-500 hover:bg-green-400 text-green-900 border-none rounded-xl transition-all shadow-lg hover:shadow-green-500/50`}
                                        disabled={isSubmitting}
                                        isLoading={isSubmitting}
                                    >
                                        Create Server Now
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </PageContentBlock>
    );
};
