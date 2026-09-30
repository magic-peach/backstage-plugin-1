import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { createRouter } from './router';

export const runtimeConditionsPlugin = createBackendPlugin({
  pluginId: 'runtime-conditions',
  register(env) {
    env.registerInit({
      deps: { httpRouter: coreServices.httpRouter },
      async init({ httpRouter }) {
        // Adapters reporting fulfillment, and the frontend reading it, both
        // call this API without a Backstage user session.
        httpRouter.addAuthPolicy({ path: '/fulfillments', allow: 'unauthenticated' });
        httpRouter.use(createRouter());
      },
    });
  },
});
