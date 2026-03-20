import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 500px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        <div css={tw`flex flex-col items-center mb-8`}>
            <h1 css={tw`text-5xl font-bold text-white tracking-tight`}>
                Enzonic <span css={tw`text-blue-500`}>Cloud</span>
            </h1>
        </div>
        {title && <h2 css={tw`text-2xl text-center text-neutral-200 font-medium mb-6`}>{title}</h2>}
        <FlashMessageRender css={tw`mb-2 px-1`} />
        <Form {...props} ref={ref}>
            <div css={tw`w-full bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl p-8 mx-1`}>
                <div css={tw`flex-1`}>{props.children}</div>
            </div>
        </Form>
        <p css={tw`text-center text-neutral-500 text-xs mt-8`}>
            &copy; {new Date().getFullYear()} Enzonic Cloud. All rights reserved.
        </p>
    </Container>
));
