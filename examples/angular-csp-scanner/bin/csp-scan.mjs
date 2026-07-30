#!/usr/bin/env node
/**
 * angular-csp-scanner — find common CSP footguns in Angular workspaces.
 *
 * Usage:
 *   node bin/csp-scan.mjs [projectRoot]
 *   npm start -- ./fixtures/sample-app
 */
import { resolve } from 'node:path';
import { scanProject } from '../src/scan.mjs';
import { formatReport } from '../src/report.mjs';

const root = resolve(process.argv[2] || '.');
const result = await scanProject(root);
const text = formatReport(result);
process.stdout.write(text);

const blocking = result.findings.filter((f) => f.severity === 'error').length;
process.exitCode = blocking > 0 ? 1 : 0;
