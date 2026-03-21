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
        <div css={tw`flex flex-col items-center mb-10`}>
            <div css={tw`bg-green-500 p-4 rounded-full mb-6 shadow-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" css={tw`h-8 w-8 text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 css={tw`text-4xl font-extrabold text-white tracking-tight`}>
                Enzonic <span css={tw`text-green-400`}>Cloud</span>
            </h1>
            <p css={tw`text-green-200 mt-3 text-lg`}>Welcome back! Let's get you set up.</p>
        </div>
        {title && <h2 css={tw`text-xl text-center text-gray-200 font-semibold mb-6`}>{title}</h2>}
        <FlashMessageRender css={tw`mb-4 px-1`} />
        <Form {...props} ref={ref}>
            <div css={tw`w-full bg-gray-800 border border-gray-700 shadow-2xl rounded-3xl p-8 mx-1`}>
                <div css={tw`flex-1`}>{props.children}</div>
            </div>
        </Form>
        <p css={tw`text-center text-green-200 text-sm mt-8 font-medium`}>
            &copy; {new Date().getFullYear()} Enzonic Cloud. All rights reserved.
        </p>
    </Container>
));
