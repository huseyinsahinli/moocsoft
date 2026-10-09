import { apps } from './apps.mjs';

// Editorial topics are not all downloadable apps. Keep service guides out of
// the app catalogue, store directory, app previews and install metadata.
export const guideTopics = Object.freeze({
  ...apps,
  development: Object.freeze({
    name: 'Flutter development', category: 'Mobile app development', color: '#91c9f4',
    heading: 'Mobile App Planning and Flutter Development Guides',
    description: 'Plan a focused mobile app with clear scope, data decisions and release checks. Read practical Flutter development guides and explore Moocsoft’s service.',
    intro: 'Turn an app idea into a clear development conversation. Define the user journey, first-release scope and platform decisions before choosing how to build it.',
    choice: 'Start with the MVP checklist, then review the Flutter service, published apps and contact details when you are ready to discuss a project.',
    use: 'Moocsoft offers Flutter mobile app development. Bring your user goal, target platforms and existing materials to discuss whether the project is a fit.',
    actionPath: '/hire-flutter-developer/', actionLabel: 'Explore Flutter development services →',
  }),
});

export const guideHref = guide => guide.path || `/guides/${guide.slug}/`;
