const ORDER = { error: 0, warn: 1, info: 2 };

/**
 * @param {{ root: string, angularJsonPath: string|null, findings: object[] }} result
 */
export function formatReport(result) {
  const findings = [...result.findings].sort((a, b) => {
    const sev = ORDER[a.severity] - ORDER[b.severity];
    if (sev !== 0) return sev;
    return `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`);
  });

  const counts = { error: 0, warn: 0, info: 0 };
  for (const f of findings) counts[f.severity] = (counts[f.severity] || 0) + 1;

  const lines = [];
  lines.push(`angular-csp-scanner`);
  lines.push(`root: ${result.root}`);
  if (result.angularJsonPath) {
    lines.push(`angular.json: ${result.angularJsonPath}`);
  }
  lines.push(
    `findings: ${findings.length} (errors=${counts.error}, warnings=${counts.warn}, info=${counts.info})`
  );
  lines.push('');

  if (!findings.length) {
    lines.push('No common CSP footguns detected.');
    lines.push('');
    return lines.join('\n');
  }

  for (const f of findings) {
    lines.push(`[${f.severity.toUpperCase()}] ${f.id}`);
    lines.push(`  ${f.file}:${f.line}`);
    lines.push(`  ${f.message}`);
    if (f.snippet) lines.push(`  > ${f.snippet}`);
    lines.push('');
  }

  lines.push('Next steps:');
  lines.push('  1. Start with Content-Security-Policy-Report-Only.');
  lines.push('  2. Enable Angular autoCsp or ngCspNonce / CSP_NONCE.');
  lines.push('  3. Remove error-level findings before enforcing script-src.');
  lines.push('');

  return lines.join('\n');
}
