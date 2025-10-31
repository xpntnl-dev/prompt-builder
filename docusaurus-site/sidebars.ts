import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '🚀 Getting Started',
    },
    {
      type: 'category',
      label: '🏗️ Architecture',
      items: [
        'architecture/overview',
      ],
    },
    {
      type: 'category',
      label: '✨ Features',
      items: [
        'features/overview',
      ],
    },
    {
      type: 'category',
      label: '🗄️ Database',
      items: [
        'database/schema',
      ],
    },
    {
      type: 'category',
      label: '💻 Development',
      items: [
        'development/getting-started',
      ],
    },
    {
      type: 'doc',
      id: 'context',
      label: '📋 Context & Updates',
    },
  ],
};

export default sidebars;
