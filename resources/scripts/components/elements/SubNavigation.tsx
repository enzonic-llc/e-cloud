import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full bg-neutral-900 border-b border-white/5 overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-4 md:px-8`};
        max-width: 1400px;

        & > a,
        & > div {
            ${tw`inline-block py-4 px-4 text-neutral-400 no-underline whitespace-nowrap transition-all duration-200 font-medium`};

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-emerald-400`};
            }

            &:active,
            &.active {
                ${tw`text-emerald-400`};
                box-shadow: inset 0 -2px ${theme`colors.emerald.500`.toString()};
            }
        }
    }
`;

export default SubNavigation;
