export default {
    type: "module",
    name: "name",
    version: "1.0.0",
    description: "description",
    main: "out/index.js",
    scripts: {
        test: "node --experimental-vm-modules node_modules/jest/bin/jest.js --testPathPattern=src/",
        testCoverage: "node --experimental-vm-modules node_modules/jest/bin/jest.js --testPathPattern=src/ --coverage",
        build: "tsc -b",
        watch: "tsc -b -w",
        clean: "rm -rf out",
        cleanWindows: "rmdir /s /q out",
        typedoc: "pnpm exec typedoc --out docs ./src --plugin @mxssfd/typedoc-theme --theme my-theme",
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
