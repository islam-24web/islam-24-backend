import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCtaBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_cta_blocks';
  info: {
    description: 'Call to action section';
    displayName: 'CTA Block';
    icon: 'cursor';
  };
  attributes: {
    button_link: Schema.Attribute.String & Schema.Attribute.Required;
    button_text: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    description: 'Hero banner with background image and CTA';
    displayName: 'Hero';
    icon: 'picture';
  };
  attributes: {
    background_image: Schema.Attribute.Media<'images'>;
    button_link: Schema.Attribute.String;
    button_text: Schema.Attribute.String;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksImageBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_blocks';
  info: {
    description: 'Image with optional caption';
    displayName: 'Image Block';
    icon: 'landscape';
  };
  attributes: {
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface BlocksServiceItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_service_items';
  info: {
    description: 'Individual service entry';
    displayName: 'Service Item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksServicesBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_services_blocks';
  info: {
    description: 'Grid of services or features';
    displayName: 'Services Block';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'blocks.service-item', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_text_blocks';
  info: {
    description: 'Rich text content section';
    displayName: 'Text Block';
    icon: 'align-left';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    heading: Schema.Attribute.String;
  };
}

export interface NavigationSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_navigation_social_links';
  info: {
    description: 'Social media link';
    displayName: 'Social Link';
    icon: 'earth';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      [
        'twitter',
        'facebook',
        'instagram',
        'linkedin',
        'youtube',
        'tiktok',
        'github',
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: 'Navigation link';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    is_external: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'A single question and answer pair shown to readers and emitted as FAQPage structured data';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    question: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface SharedPhysicalLocation extends Struct.ComponentSchema {
  collectionName: 'components_shared_physical_locations';
  info: {
    description: 'Optional physical address for ONSITE/HYBRID jobs';
    displayName: 'Physical Location';
    icon: 'map';
  };
  attributes: {
    city: Schema.Attribute.String;
    country: Schema.Attribute.String & Schema.Attribute.Required;
    region: Schema.Attribute.String;
  };
}

export interface SharedSourceCitation extends Struct.ComponentSchema {
  collectionName: 'components_shared_source_citations';
  info: {
    description: 'A cited source. Pick a kind so readers and search engines understand the type of evidence (Quran, hadith, scholarly, medical, research, book, other)';
    displayName: 'Source';
    icon: 'book';
  };
  attributes: {
    kind: Schema.Attribute.Enumeration<
      ['quran', 'hadith', 'scholarly', 'medical', 'research', 'book', 'other']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'other'>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    reference: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata for pages and articles';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonical_url: Schema.Attribute.String;
    meta_description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    meta_title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    no_index: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    og_image: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.cta-block': BlocksCtaBlock;
      'blocks.hero': BlocksHero;
      'blocks.image-block': BlocksImageBlock;
      'blocks.service-item': BlocksServiceItem;
      'blocks.services-block': BlocksServicesBlock;
      'blocks.text-block': BlocksTextBlock;
      'navigation.social-link': NavigationSocialLink;
      'shared.faq-item': SharedFaqItem;
      'shared.link': SharedLink;
      'shared.physical-location': SharedPhysicalLocation;
      'shared.source-citation': SharedSourceCitation;
      'shared.seo': SharedSeo;
    }
  }
}
