import Generator, { GeneratorOptions } from "yeoman-generator";
import { join } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import packagejson from "./templates/package.js";
import libraries from "./libraries.js";

type GeneratorProjectData = {
    name: string;
    description: string;
    author: string;
    repo: string;
    license: string;
    webpack: boolean;
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
                default: this.appname.replace(/\s/g, "-"),
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

        const { webpack } = await this.prompt([
            {
                type: "confirm",
                name: "webpack",
                message: "Do you want to use webpack?",
                default: false,
            },
        ]);

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

        const tasks = [
            writeFile(join(this.destinationPath(), "package.json"), JSON.stringify(packagejson, null, 4)),
            writeFile(
                join(this.destinationPath(), "README.md"),
                `# ${newData["name"]}

${newData["description"]}`,
            ),
            mkdir(join(this.destinationPath(), "src")),
            mkdir(join(this.destinationPath(), "dist")),

            this.copyDestination(join(this.destinationPath(), "..", "templateFiles"), this.destinationPath()),
        ];

        // manage webpack
        if (newData["webpack"]) {
            // add webpack, webpack-cli, ts-loader
            libraries.devDependencies.push("webpack", "webpack-cli", "ts-loader");
            // add webpack.config.js
            tasks.push(
                writeFile(
                    join(this.destinationPath(), "webpack.config.js"),
                    await readFile(join(this.destinationPath(), "..", "conditionalTemplateFiles", "webpack.config.js"), "utf-8"),
                ),
            );
        }

        await Promise.all(tasks);
        await writeFile(join(this.destinationPath(), "src", "index.ts"), "");

        this.log("Installing dependencies...");
        // run pnpm install
        await Promise.all(
            [
                libraries.dependencies.length > 0 && this.spawnCommand("pnpm", ["add", ...libraries.dependencies]),
                libraries.devDependencies.length > 0 && this.spawnCommand("pnpm", ["add", "--save-dev", ...libraries.devDependencies]),
                this.spawnCommand("git", ["init"]),
            ].filter(Boolean),
        );
        this.log("Done!");
        process.exit(0);
    }
}
