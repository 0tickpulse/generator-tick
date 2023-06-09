var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Generator from "yeoman-generator";
import { mkdir, readFile, writeFile } from "fs/promises";
import packagejson from "./templates/package.js";
import libraries from "./libraries.js";
export default class extends Generator {
    constructor(args, options) {
        super(args, options);
    }
    prompting() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            this.log("Welcome to the Yeoman generator for a new 0TickPulse project!");
            const { name, description, author } = yield this.prompt([
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
            const { repo } = yield this.prompt([
                {
                    type: "input",
                    name: "git repository name",
                    message: "Your project git repository name",
                    default: (_a = data["name"]) === null || _a === void 0 ? void 0 : _a.replace(" ", "-"),
                },
            ]);
            data["repo"] = repo;
            const { license } = yield this.prompt([
                {
                    type: "list",
                    name: "license",
                    message: "Your project license",
                    choices: ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "Unlicense", "AGPL-3.0-or-later"],
                    default: "AGPL-3.0-or-later",
                },
            ]);
            data["license"] = license;
            const { webpack } = yield this.prompt([
                {
                    type: "confirm",
                    name: "webpack",
                    message: "Do you want to use webpack?",
                    default: false,
                },
            ]);
            data["webpack"] = webpack;
            this.log(data);
            const { confirm } = yield this.prompt([
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
            const newData = data;
            packagejson.name = newData["name"];
            packagejson.description = newData["description"];
            packagejson.author = newData["author"];
            packagejson.license = newData["license"];
            packagejson.repository = {
                type: "git",
                url: `https://github.com/${newData["author"]}/${newData["repo"]}.git`,
            };
            const tasks = [
                writeFile(this.destinationPath("package.json"), JSON.stringify(packagejson, null, 4)),
                writeFile(this.destinationPath("README.md"), `# ${newData["name"]}

${newData["description"]}`),
                mkdir(this.destinationPath("src")),
                mkdir(this.destinationPath("dist")),
                this.copyDestination(this.templatePath("..", "..", "templateFiles"), this.destinationPath()),
            ];
            // manage webpack
            if (newData["webpack"]) {
                // add webpack, webpack-cli, ts-loader
                libraries.devDependencies.push("webpack", "webpack-cli", "ts-loader");
                // add webpack.config.js
                tasks.push(writeFile(this.destinationPath("webpack.config.js"), yield readFile(this.templatePath("..", "..", "conditionalTemplateFiles", "webpack.config.js"), "utf-8")));
            }
            yield Promise.all(tasks);
            yield writeFile(this.destinationPath("src", "index.ts"), "");
            this.log("Installing dependencies...");
            // run pnpm install
            yield Promise.all([
                libraries.dependencies.length > 0 && this.spawnCommand("pnpm", ["add", ...libraries.dependencies]),
                libraries.devDependencies.length > 0 && this.spawnCommand("pnpm", ["add", "--save-dev", ...libraries.devDependencies]),
                this.spawnCommand("git", ["init"]),
            ].filter(Boolean));
            this.log("Done!");
            process.exit(0);
        });
    }
}
