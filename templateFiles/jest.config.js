/** @type {import("ts-jest").JestConfigWithTsJest} */
export default {
    transform: {
        "\\.[jt]sx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    moduleNameMapper: {
        "(.+)\\.js": "$1",
    },
    extensionsToTreatAsEsm: [".ts"],
};
