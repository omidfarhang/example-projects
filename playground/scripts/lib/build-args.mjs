/** Parse CLI flags and env for playground build orchestrator. */
export function parseBuildArgs(argv = process.argv.slice(2)) {
  const args = {
    only: [],
    category: null,
    exclude: [],
    affected: process.env.PLAYGROUND_AFFECTED === '1',
    allowSkip: process.env.PLAYGROUND_ALLOW_SKIP === '1',
    skipLanding: false,
    skipCache: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--only') {
      const value = argv[++i];
      if (value) {
        args.only.push(...value.split(',').map((s) => s.trim()).filter(Boolean));
      }
    } else if (arg === '--category') {
      args.category = argv[++i] ?? null;
    } else if (arg === '--exclude') {
      const value = argv[++i];
      if (value) {
        args.exclude.push(...value.split(',').map((s) => s.trim()).filter(Boolean));
      }
    } else if (arg === '--skip-landing') {
      args.skipLanding = true;
    } else if (arg === '--no-cache') {
      args.skipCache = true;
    } else if (arg.startsWith('--only=')) {
      args.only.push(...arg.slice(6).split(',').map((s) => s.trim()).filter(Boolean));
    } else if (arg.startsWith('--category=')) {
      args.category = arg.slice(11);
    } else if (arg.startsWith('--exclude=')) {
      args.exclude.push(...arg.slice(10).split(',').map((s) => s.trim()).filter(Boolean));
    }
  }

  return args;
}
