import { ProjectTargetConfigurator } from '@nrwl/devkit';

export const projectFilePatterns = ['cdktf.json'];

export const registerProjectTargets: ProjectTargetConfigurator = () => {
  return {
    cdktf: {
      executor: 'nx-cdktf:cdktf',
    },
  };
};
