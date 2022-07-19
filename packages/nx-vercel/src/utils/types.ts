import type { ProjectSettings } from '@vercel/build-utils';

export interface VercelProjectConfig {
  orgId: string;
  projectId: string;
  settings: ProjectSettings;
}
