const colors = require('tailwindcss/colors');

function varColor(name) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${name}), ${opacityValue})`;
        }
        return `rgb(var(${name}))`;
    };
}

module.exports = {
    darkMode: 'class',
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#0f0f0f',
                primary: {
                    50: varColor('--pt-primary-50'),
                    100: varColor('--pt-primary-100'),
                    200: varColor('--pt-primary-200'),
                    300: varColor('--pt-primary-300'),
                    400: varColor('--pt-primary-400'),
                    500: varColor('--pt-primary-500'),
                    600: varColor('--pt-primary-600'),
                    700: varColor('--pt-primary-700'),
                    800: varColor('--pt-primary-800'),
                    900: varColor('--pt-primary-900'),
                },
                orange: colors.orange,
                emerald: colors.emerald,
                green: colors.green,
                red: colors.red,
                blue: colors.blue,
                yellow: colors.yellow,
                indigo: colors.indigo,
                purple: colors.purple,
                pink: colors.pink,
                cyan: colors.cyan,
                gray: {
                    50: varColor('--pt-neutral-50'),
                    100: varColor('--pt-neutral-100'),
                    200: varColor('--pt-neutral-200'),
                    300: varColor('--pt-neutral-300'),
                    400: varColor('--pt-neutral-400'),
                    500: varColor('--pt-neutral-500'),
                    600: varColor('--pt-neutral-600'),
                    700: varColor('--pt-neutral-700'),
                    800: varColor('--pt-neutral-800'),
                    900: varColor('--pt-neutral-900'),
                },
                neutral: {
                    50: varColor('--pt-neutral-50'),
                    100: varColor('--pt-neutral-100'),
                    200: varColor('--pt-neutral-200'),
                    300: varColor('--pt-neutral-300'),
                    400: varColor('--pt-neutral-400'),
                    500: varColor('--pt-neutral-500'),
                    600: varColor('--pt-neutral-600'),
                    700: varColor('--pt-neutral-700'),
                    800: varColor('--pt-neutral-800'),
                    900: varColor('--pt-neutral-900'),
                },
                cyan: colors.cyan,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: varColor('--pt-neutral-400'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};