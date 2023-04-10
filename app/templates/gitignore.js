function g(name, description) {
    return {
        name,
        description,
        generate() {
            return `# ${description}` + "\n" + name + "\n";
        }
    };
}
export default [
    g("node_modules/", "Node modules"),
    g("out/", "Compiled TypeScript files"),
    g("docs/", "Generated documentation"),
    g(".vscode/", "VSCode settings"),
];