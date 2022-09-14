import { getPackageManagerCommand as _getPackageManagerCommand } from '@nrwl/devkit';

export function getPackageManagerCommand() {
  const pmc = _getPackageManagerCommand();
  return {
    ...pmc,
    // pnpm exec has a quirk regarding working directory, see https://github.com/pnpm/pnpm/issues/4135#issuecomment-1247132890
    // hence we use npx instead which should also be available
    exec: pmc.exec.includes('pnpm exec') ? 'npx' : pmc.exec,
  };
}
