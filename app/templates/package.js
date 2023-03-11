export default {
    type: "module",
    name: "name",
    version: "1.0.0",
    description: "description",
    main: "out/index.js",
    scripts: {
        test: "node out/tests/test.js",
        build: "tsc -b",
        watch: "tsc -b -w",
        clean: "rm -rf out",
        cleanWindows: "rmdir /s /q out",
        typedoc: "npx typedoc --out docs ./src",
        prettier: "npx prettier -w ./src",
    },
    author: "0TickPulse",
    license: "AGPL-3.0-or-later",
    prettier: {
        printWidth: 150,
        tabWidth: 4,
        trailingComma: "all",
    },
    repository: {
        type: "git",
        url: "?",
    },
};
