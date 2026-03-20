import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCogs, faLayerGroup, faSignOutAlt, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center justify-center h-10 w-10 rounded-xl no-underline text-neutral-300 ml-2 cursor-pointer transition-all duration-200`};

        &:active,
        &:hover {
            ${tw`text-emerald-400 bg-neutral-800 scale-105`};
        }

        &:active {
            ${tw`scale-95`};
        }

        &.active {
            ${tw`text-emerald-400 bg-emerald-500/10`};
        }
    }
`;

const onTriggerNavButton = () => {
    const sidebar = document.getElementById('sidebar');

    if (sidebar) {
        sidebar.classList.toggle('active-nav');
    }
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);
    const [isLightMode, setIsLightMode] = useState(() => {
        return localStorage.getItem('theme') === 'light';
    });

    useEffect(() => {
        if (location.pathname.startsWith('/server') || location.pathname.startsWith('/account')) {
            setShowSidebar(true);
            return;
        }
        setShowSidebar(false);
    }, [location.pathname]);

    useEffect(() => {
        if (isLightMode) {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        }
    }, [isLightMode]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className={'sticky top-0 z-50 bg-neutral-900 border-b border-white/5 w-full topbar transition-all duration-300'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-16 px-4 md:px-8 max-w-[1400px]'}>
                {showSidebar && (
                    <button
                        className='flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-emerald-400 transition-all duration-200 active:scale-95 lg:hidden mr-4'
                        onClick={onTriggerNavButton}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                )}

                <div id={'logo'} className={'flex-1 flex items-center'}>
                    <Link
                        to={'/'}
                        className={
                            'text-2xl font-bold tracking-tight px-2 no-underline text-white hover:text-emerald-400 transition-colors duration-200'
                        }
                    >
                        {name}
                    </Link>
                </div>

                <RightNavigation className={'flex items-center'}>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Toggle Theme'}>
                        <button onClick={() => setIsLightMode(!isLightMode)}>
                            <FontAwesomeIcon icon={isLightMode ? faMoon : faSun} />
                        </button>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-6 h-6 rounded-full overflow-hidden'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout} className={'hover:text-red-500! hover:bg-red-500/10!'}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
