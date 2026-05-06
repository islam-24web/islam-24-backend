'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'TipTap',
    plugin: 'tiptap',
    type: 'richtext',
  });
};
