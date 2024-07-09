module.exports = {
    root: true,
    parser: 'hermes-eslint',
    plugins: [
        'ft-flow'
    ],
    extends: [
        'eslint:recommended',
        'plugin:ft-flow/recommended',
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};