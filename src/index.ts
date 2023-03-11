import Generator, { GeneratorOptions } from "yeoman-generator";
import { join } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import eslintrcjson from "./templates/.eslintrc.js";
import packagejson from "./templates/package.js";
import tsconfig from "./templates/tsconfig.js";
import gitignore from "./templates/gitignore.js";
import jestconfig from "./templates/jestconfig.js";
import libraries from "./libraries.js";

type GeneratorProjectData = {
    name: string;
    description: string;
    author: string;
    repo: string;
    license: string;
};

export default class extends Generator {
    constructor(args: string | string[], options: GeneratorOptions) {
        super(args, options);
    }
    async prompting() {
        const data: Partial<GeneratorProjectData> = {};
        this.log("Welcome to the Yeoman generator for a new 0TickPulse project!");
        const { name, description, author } = await this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your project name",
                default: this.appname,
            },
            {
                type: "input",
                name: "description",
                message: "Your project description",
                default: "My awesome project",
            },
            {
                type: "input",
                name: "author",
                message: "Your name",
                default: this.user.git.name(),
                store: true,
            },
        ]);
        data["name"] = name;
        data["description"] = description;
        data["author"] = author;
        const { repo } = await this.prompt([
            {
                type: "input",
                name: "git repository name",
                message: "Your project git repository name",
                default: data["name"]?.replace(" ", "-"),
            },
        ]);
        data["repo"] = repo;
        const { license } = await this.prompt([
            {
                type: "list",
                name: "license",
                message: "Your project license",
                choices: ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "Unlicense", "AGPL-3.0-or-later"],
                default: "AGPL-3.0-or-later",
            },
        ]);
        data["license"] = license;
        this.log(data);
        const { confirm } = await this.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: "Is this information correct?",
                default: true,
            },
        ]);
        if (!confirm) {
            this.log("Please restart the generator!");
            process.exit(1);
        }

        this.log("Creating project...");

        const newData = data as GeneratorProjectData;

        packagejson.name = newData["name"];
        packagejson.description = newData["description"];
        packagejson.author = newData["author"];
        packagejson.license = newData["license"];
        packagejson.repository = {
            type: "git",
            url: `https://github.com/${newData["author"]}/${newData["repo"]}.git`,
        };

        await Promise.all([
            writeFile(join(this.destinationPath(), "package.json"), JSON.stringify(packagejson, null, 4)),
            writeFile(join(this.destinationPath(), "tsconfig.json"), JSON.stringify(tsconfig, null, 4)),
            writeFile(join(this.destinationPath(), ".eslintrc.json"), JSON.stringify(eslintrcjson, null, 4)),
            writeFile(join(this.destinationPath(), "jest.config.json"), JSON.stringify(jestconfig, null, 4)),
            writeFile(
                join(this.destinationPath(), "README.md"),
                `# ${newData["name"]}

${newData["description"]}`,
            ),
            writeFile(join(this.destinationPath(), ".gitignore"), gitignore.map((i) => i.generate()).join("\n")),
            mkdir(join(this.destinationPath(), "src")),
            mkdir(join(this.destinationPath(), "out")),
        ]);
        await writeFile(join(this.destinationPath(), "src", "index.ts"), "");

        this.log("Installing dependencies...");
        // run pnpm install
        await Promise.all(
            [
                libraries.dependencies.map((i) => this.spawnCommand("pnpm", ["add", i])),
                libraries.devDependencies.map((i) => this.spawnCommand("pnpm", ["add", i, "--save-dev"])),
                this.spawnCommand("git", ["init"]),
            ].flat(),
        );
        this.log("Done!");
        process.exit(0);
    }
}
