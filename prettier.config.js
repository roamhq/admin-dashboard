export default {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'none',
    bracketSpacing: true,
    arrowParens: 'always',
    plugins: [
        'prettier-plugin-tailwindcss',
        './node_modules/@ttskch/prettier-plugin-tailwindcss-anywhere/dist/index.js'
    ],
    overrides: [
        {
            files: '*.{html,twig}',
            options: {
                parser: 'anywhere'
            }
        },
        {
            files: 'package.json',
            options: {
                tabWidth: 2
            }
        }
    ]
};
