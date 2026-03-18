import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div css={tw`rounded-2xl shadow-sm bg-neutral-800/80 border border-white/5 overflow-hidden`} className={className}>
        <div css={tw`bg-neutral-900/50 p-4 border-b border-white/5`}>
            {typeof title === 'string' ? (
                <p css={tw`text-sm font-semibold tracking-wide text-neutral-200`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-emerald-400`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-4 sm:p-5`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
