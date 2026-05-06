import pluginId from './pluginId';
import TipTapEditor from './components/TipTapEditor';

export default {
  register(app) {
    app.customFields.register({
      name: 'TipTap',
      pluginId,
      type: 'richtext',
      intlLabel: {
        id: 'tiptap.label',
        defaultMessage: 'TipTap Rich Editor',
      },
      intlDescription: {
        id: 'tiptap.description',
        defaultMessage: 'أقوى محرر نصوص - headings, fonts, colors, tables, HTML source, SEO tools',
      },
      components: {
        Input: async () => TipTapEditor,
      },
    });
  },
  bootstrap() {},
};
