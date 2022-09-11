import type { Linter } from '@nrwl/linter';

export interface CdktfApplicationGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  unitTestRunner?: 'jest' | 'none';
  linter?: Linter;
}
