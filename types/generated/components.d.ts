import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAppsFeature extends Struct.ComponentSchema {
  collectionName: 'components_blocks_apps_features';
  info: {
    description: 'Grid of featured Islamic apps (Sibaq, future apps).';
    displayName: 'Apps Feature';
    icon: 'th';
  };
  attributes: {
    headline_ar: Schema.Attribute.String;
    headline_en: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.app-card', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
        },
        number
      >;
  };
}

export interface BlocksAudioEmbed extends Struct.ComponentSchema {
  collectionName: 'components_blocks_audio_embeds';
  info: {
    description: 'Audio player (uploaded media or external URL). Native HTML5 audio \u2014 zero JS.';
    displayName: 'Audio Embed';
    icon: 'headphones';
  };
  attributes: {
    caption: Schema.Attribute.Text;
    file: Schema.Attribute.Media<'audios' | 'files'>;
    title: Schema.Attribute.String;
    transcript_url: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface BlocksCategoryStrip extends Struct.ComponentSchema {
  collectionName: 'components_blocks_category_strips';
  info: {
    description: 'A featured-hero + small-thumb grid for one category. Editor picks the category; latest articles render automatically.';
    displayName: 'Category Strip';
    icon: 'stack';
  };
  attributes: {
    category: Schema.Attribute.Relation<'oneToOne', 'api::category.category'>;
    headline_ar: Schema.Attribute.String;
    headline_en: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<
      ['hero-grid', 'horizontal-scroll', 'three-up']
    > &
      Schema.Attribute.DefaultTo<'hero-grid'>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 3;
        },
        number
      > &
      Schema.Attribute.DefaultTo<7>;
    see_more_label: Schema.Attribute.String;
    source: Schema.Attribute.Enumeration<['category', 'featured-flag']> &
      Schema.Attribute.DefaultTo<'category'>;
  };
}

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

export interface BlocksDailyTiles extends Struct.ComponentSchema {
  collectionName: 'components_blocks_daily_tiles';
  info: {
    description: 'Row of small daily-content tiles (ayah, hadith, wisdom, dua, etc.)';
    displayName: 'Daily Tiles';
    icon: 'th-large';
  };
  attributes: {
    headline_ar: Schema.Attribute.String;
    headline_en: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.daily-tile', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 8;
        },
        number
      >;
  };
}

export interface BlocksDivineNamesFeature extends Struct.ComponentSchema {
  collectionName: 'components_blocks_divine_names_features';
  info: {
    description: 'Promo for the Asma Allah surface. Either a card CTA to /asma-allah, or a horizontal strip of N name tiles.';
    displayName: 'Divine Names Feature';
    icon: 'star';
  };
  attributes: {
    body_ar: Schema.Attribute.Text;
    cta_label: Schema.Attribute.String;
    headline_ar: Schema.Attribute.String;
    mode: Schema.Attribute.Enumeration<['card-cta', 'strip']> &
      Schema.Attribute.DefaultTo<'card-cta'>;
    strip_count: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 3;
        },
        number
      > &
      Schema.Attribute.DefaultTo<9>;
  };
}

export interface BlocksEditorPick extends Struct.ComponentSchema {
  collectionName: 'components_blocks_editor_picks';
  info: {
    description: 'Curated bundle of hand-picked articles (featured series, themed selections).';
    displayName: 'Editor Pick';
    icon: 'bookmark';
  };
  attributes: {
    articles: Schema.Attribute.Relation<'oneToMany', 'api::article.article'>;
    headline_ar: Schema.Attribute.String;
    headline_en: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['two-up', 'three-up', 'magazine']> &
      Schema.Attribute.DefaultTo<'three-up'>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    mode: Schema.Attribute.Enumeration<['hand-picked', 'flag-driven']> &
      Schema.Attribute.DefaultTo<'hand-picked'>;
    subhead: Schema.Attribute.Text;
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

export interface BlocksHomeHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_home_heroes';
  info: {
    description: 'Top-of-page hero. Carousel pulls latest featured articles (or a hand-picked list); single mode renders one large editorial card.';
    displayName: 'Home Hero';
    icon: 'picture';
  };
  attributes: {
    articles: Schema.Attribute.Relation<'oneToMany', 'api::article.article'>;
    eyebrow: Schema.Attribute.String;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 8;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    mode: Schema.Attribute.Enumeration<
      ['latest-featured', 'hand-picked', 'flag-driven']
    > &
      Schema.Attribute.DefaultTo<'latest-featured'>;
    variant: Schema.Attribute.Enumeration<['carousel', 'single']> &
      Schema.Attribute.DefaultTo<'carousel'>;
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

export interface BlocksNewsletterCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_newsletter_ctas';
  info: {
    description: 'Email signup block. Submissions are stored in api::newsletter-subscriber.newsletter-subscriber via /api/newsletter.';
    displayName: 'Newsletter CTA';
    icon: 'envelop';
  };
  attributes: {
    body_ar: Schema.Attribute.Text;
    consent_label: Schema.Attribute.String;
    cta_label: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    headline_ar: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
    success_message: Schema.Attribute.String;
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

export interface BlocksYoutubeEmbed extends Struct.ComponentSchema {
  collectionName: 'components_blocks_youtube_embeds';
  info: {
    description: 'Embedded YouTube video with a click-to-load facade (zero JS until interaction).';
    displayName: 'YouTube Embed';
    icon: 'play';
  };
  attributes: {
    aspect_ratio: Schema.Attribute.Enumeration<['16:9', '9:16', '1:1', '4:3']> &
      Schema.Attribute.DefaultTo<'16:9'>;
    caption: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface SharedAppCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_app_cards';
  info: {
    description: 'Featured-app tile (Sibaq, etc.)';
    displayName: 'App Card';
    icon: 'rocket';
  };
  attributes: {
    cta_label: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    icon: Schema.Attribute.String;
    open_in_new_tab: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    tone: Schema.Attribute.Enumeration<['emerald', 'amber', 'neutral']> &
      Schema.Attribute.DefaultTo<'emerald'>;
  };
}

export interface SharedDailyTile extends Struct.ComponentSchema {
  collectionName: 'components_shared_daily_tiles';
  info: {
    description: 'A single tile in the daily-content row (ayah / hadith / wisdom / dua)';
    displayName: 'Daily Tile';
    icon: 'calendar';
  };
  attributes: {
    href: Schema.Attribute.String;
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    reference: Schema.Attribute.String;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    tone: Schema.Attribute.Enumeration<['emerald', 'amber']> &
      Schema.Attribute.DefaultTo<'emerald'>;
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

export interface SharedLinkGroup extends Struct.ComponentSchema {
  collectionName: 'components_shared_link_groups';
  info: {
    description: 'A titled group of links (used for footer columns and similar grouped lists).';
    displayName: 'Link Group';
    icon: 'bulletList';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    description: 'Navigation item with optional one-level dropdown';
    displayName: 'Nav Item';
    icon: 'link';
  };
  attributes: {
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    href: Schema.Attribute.String;
    is_external: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    sub_items: Schema.Attribute.Component<'shared.link', true>;
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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.apps-feature': BlocksAppsFeature;
      'blocks.audio-embed': BlocksAudioEmbed;
      'blocks.category-strip': BlocksCategoryStrip;
      'blocks.cta-block': BlocksCtaBlock;
      'blocks.daily-tiles': BlocksDailyTiles;
      'blocks.divine-names-feature': BlocksDivineNamesFeature;
      'blocks.editor-pick': BlocksEditorPick;
      'blocks.hero': BlocksHero;
      'blocks.home-hero': BlocksHomeHero;
      'blocks.image-block': BlocksImageBlock;
      'blocks.newsletter-cta': BlocksNewsletterCta;
      'blocks.service-item': BlocksServiceItem;
      'blocks.services-block': BlocksServicesBlock;
      'blocks.text-block': BlocksTextBlock;
      'blocks.youtube-embed': BlocksYoutubeEmbed;
      'navigation.social-link': NavigationSocialLink;
      'shared.app-card': SharedAppCard;
      'shared.daily-tile': SharedDailyTile;
      'shared.faq-item': SharedFaqItem;
      'shared.link': SharedLink;
      'shared.link-group': SharedLinkGroup;
      'shared.nav-item': SharedNavItem;
      'shared.physical-location': SharedPhysicalLocation;
      'shared.seo': SharedSeo;
      'shared.source-citation': SharedSourceCitation;
    }
  }
}
