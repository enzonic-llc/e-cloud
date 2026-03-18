import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-2xl no-underline text-neutral-200 items-center bg-neutral-800/80 p-5 border border-white/5 transition-all duration-200 overflow-hidden shadow-sm`};

    ${(props) => props.$hoverable !== false && tw`hover:border-emerald-500/50 hover:bg-neutral-800 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer`};

    & .icon {
        ${tw`rounded-xl w-14 h-14 flex items-center justify-center bg-neutral-900/80 text-emerald-400 p-3 shadow-inner`};
    }
`;
