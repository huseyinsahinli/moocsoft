import { readerTools } from './reader-calculators.mjs';
import { apps } from './apps.mjs';

// Website tools are not all mobile apps. Keep service tools out of app stores.
export const browserTools = Object.freeze([
  ...readerTools.map(tool => Object.freeze({ path: `/tools/${tool.key}/`, name: tool.name })),
  ...Object.values(apps).filter(app => app.tool).map(app => Object.freeze({ path: `/tools/${app.tool}/`, name: app.toolName })),
  Object.freeze({ path: '/tools/savings-goal-calculator/', name: 'Savings Goal Calculator' }),
  Object.freeze({ path: '/tools/app-brief-builder/', name: 'Mobile App Brief Builder' }),
]);
