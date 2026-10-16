import { ESLint } from 'eslint';

const diff = Bun.spawnSync([
    'git', 'diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z', '--'
], { stderr: 'inherit' });

if (diff.exitCode !== 0) {
    process.exit(diff.exitCode || 1);
}

const files = diff.stdout.toString().split('\0').filter(file => /\.(ts|tsx)$/.test(file));

if (files.length === 0) {
    process.exit(0);
}

const eslint = new ESLint({ globInputPaths: false });
const results = await eslint.lintFiles(files);
const formatter = await eslint.loadFormatter('stylish');
const output = formatter.format(results);

if (output) {
    console.log(output);
}

process.exit(results.some(result => result.errorCount > 0) ? 1 : 0);
