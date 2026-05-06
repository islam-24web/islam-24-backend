import pluginId from './pluginId';

const prefixPluginTranslations = (trad, pluginId) => {
  if (!trad) return {};
  return Object.keys(trad).reduce((acc, current) => {
    acc[`${pluginId}.${current}`] = trad[current];
    return acc;
  }, {});
};

export default {
  register(app) {
    app.customFields.register({
      name: 'CKEditor',
      pluginId: pluginId,
      type: 'richtext',
      intlLabel: {
        id: 'ckeditor.label',
        defaultMessage: 'CKEditor 5',
      },
      intlDescription: {
        id: 'ckeditor.description',
        defaultMessage: 'Rich text editor by CKEditor 5',
      },
      components: {
        Input: async () => import('./components/CKEditorInput').then(m => ({ default: m.CKEditorInput })),
      },
      options: {
        base: [
          {
            name: 'options.licenseKey',
            type: 'string',
            intlLabel: {
              id: 'ckeditor.options.licenseKey',
              defaultMessage: 'License Key',
            },
            description: {
              id: 'ckeditor.options.licenseKey.description',
              defaultMessage: 'CKEditor 5 license key (optional for free tier)',
            },
          },
        ],
      },
    });
  },

  async registerTrads() {
    return Promise.resolve({});
  },
};
