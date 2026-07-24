import { execFileSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const work = path.join(root, "work");
const bundleDir = path.join(work, "pages-bundle");
const deployDir = path.join(work, "pages-deploy");
const wrangler = path.join(root, "node_modules", ".bin", "wrangler");

await rm(bundleDir, { force: true, recursive: true });
await rm(deployDir, { force: true, recursive: true });
await mkdir(bundleDir, { recursive: true });
await mkdir(deployDir, { recursive: true });

execFileSync(
  wrangler,
  ["deploy", "--dry-run", "--outdir", bundleDir],
  { cwd: root, stdio: "inherit" }
);

await cp(path.join(root, ".open-next", "assets"), deployDir, {
  recursive: true
});
await cp(
  path.join(bundleDir, "worker.js"),
  path.join(deployDir, "_worker.js")
);
await writeFile(
  path.join(deployDir, "_routes.json"),
  `${JSON.stringify(
    {
      version: 1,
      include: ["/*"],
      exclude: ["/_next/static/*"]
    },
    null,
    2
  )}\n`
);

execFileSync(
  wrangler,
  [
    "pages",
    "deploy",
    deployDir,
    "--project-name",
    "study-buddy-desk",
    "--branch",
    "main"
  ],
  { cwd: root, stdio: "inherit" }
);
