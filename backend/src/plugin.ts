import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { createRouter } from './router';

export const runtimeConditionsPlugin = createBackendPlugin({
  pluginId: 'runtime-conditions',
  register(env) {
    env.registerInit({
      deps: { httpRouter: coreServices.httpRouter },
      async init({ httpRouter }) {
        httpRouter.use(createRouter());
      },
    });
  },
});
