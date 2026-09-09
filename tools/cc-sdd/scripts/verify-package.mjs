import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.env.npm_execpath;
assert.ok(npm, 'Run this check through npm run test:package');
const scratch = await mkdtemp(join(tmpdir(), 'cc-sdd-package-'));
const skills = [
  'kiro-debug', 'kiro-discovery', 'kiro-impl', 'kiro-review',
  'kiro-spec-batch', 'kiro-spec-design', 'kiro-spec-init', 'kiro-spec-quick',
  'kiro-spec-requirements', 'kiro-spec-status', 'kiro-spec-tasks',
  'kiro-steering', 'kiro-steering-custom', 'kiro-validate-design',
  'kiro-validate-gap', 'kiro-validate-impl', 'kiro-verify-completion',
];
const clients = [
  { flag: '--codex-skills', directory: '.agents/skills', document: 'AGENTS.md' },
  { flag: '--claude-skills', directory: '.claude/skills', document: 'CLAUDE.md' },
];

// 在指定临时目录运行真实程序；失败时保留命令输出，避免只得到空泛的断言错误。
function run(script, args, cwd) {
  try {
    return execFileSync(process.execPath, [script, ...args], {
      cwd, encoding: 'utf8', timeout: 120_000, stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    process.stderr.write(error.stdout || '');
    process.stderr.write(error.stderr || '');
    throw error;
  }
}

// 检查真实安装结果：技能、共享规则、模板和客户端说明都必须来自已打包的程序。
async function verifyProject(project, client, language) {
  const directory = join(project, client.directory);
  assert.deepEqual((await readdir(directory)).sort(), [...skills].sort());
  for (const name of skills) {
    const skill = await readFile(join(directory, name, 'SKILL.md'), 'utf8');
    assert.match(skill, new RegExp(`^name: ${name}$`, 'm'));
    assert.doesNotMatch(skill, /\{\{(?:KIRO_DIR|LANG_CODE|AGENT_COMMANDS_DIR|AGENT_DOC)\}\}/);
    const sharedRules = skill.match(/^\s+shared-rules:\s*"([^"]+)"/m);
    for (const rule of sharedRules?.[1].split(',').map((name) => name.trim()) || []) {
      const content = await readFile(join(directory, name, 'rules', rule), 'utf8');
      assert.ok(content.trim(), `${name}: missing shared rule content ${rule}`);
    }
  }
  const templates = join(project, '.kiro/settings/templates/specs');
  const metadata = JSON.parse(await readFile(join(templates, 'init.json'), 'utf8'));
  assert.equal(metadata.language, language);
  for (const name of ['requirements.md', 'design.md', 'tasks.md']) {
    assert.ok((await readFile(join(templates, name), 'utf8')).trim(), name);
  }
  assert.ok((await readFile(join(project, client.document), 'utf8')).trim());
  if (client.flag === '--codex-skills') {
    assert.ok((await readFile(join(project, '.codex/agents/spec-reviewer.toml'), 'utf8')).trim());
  }
}

try {
  // 从 tarball 安装到仓库外，禁止安装脚本补救缺失构建产物；不接触用户项目。
  const packed = JSON.parse(run(npm, [
    'pack', '--json', '--ignore-scripts', '--pack-destination', scratch,
  ], packageRoot));
  assert.equal(packed.length, 1);
  const consumer = join(scratch, 'consumer');
  await mkdir(consumer);
  run(npm, [
    'install', '--prefix', consumer, '--ignore-scripts', '--no-package-lock',
    '--no-audit', '--no-fund', join(scratch, packed[0].filename),
  ], scratch);
  // 打包后的许可必须与上游原文相同，避免包中漏掉归属说明。
  assert.equal(
    await readFile(join(consumer, 'node_modules/cc-sdd/LICENSE'), 'utf8'),
    await readFile(resolve(packageRoot, '../../LICENSE'), 'utf8'),
  );
  const cli = join(consumer, 'node_modules/cc-sdd/dist/cli.js');
  assert.match(run(cli, ['--help'], scratch), /Usage: cc-sdd/);
  for (const client of clients) {
    for (const language of ['en', 'zh']) {
      const project = join(scratch, `${client.flag.slice(2)}-${language}`);
      await mkdir(project);
      run(cli, [client.flag, '--lang', language, '--yes'], project);
      await verifyProject(project, client, language);
      console.log(`PASS packed install: ${client.flag} --lang ${language} (17 skills)`);
    }
  }
} finally {
  // 只清理本次 mkdtemp 创建的目录；失败也不留下临时安装项目。
  await rm(scratch, { recursive: true, force: true });
}
