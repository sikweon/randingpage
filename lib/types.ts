export interface Product {
  id: number;
  name: string;
  nameColor: string;
  nameSize: string;
  badge: string;
  showBadge: boolean;
  thumbnail: string;
  discount: string;
  discountColor: string;
  discountSize: string;
  originalPrice: string;
  originalPriceColor: string;
  originalPriceSize: string;
  salePrice: string;
  salePriceColor: string;
  salePriceSize: string;
  link: string;
  featured: boolean;
  gradientIndex: number;
}

export interface ServiceItem {
  id: number;
  icon: string;
  name: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  description: string;
}

export interface LandingConfig {
  brand: {
    logo: string;
    name: string;
  };
  header: {
    title: string;
    badgeText1: string;
    badgeText2: string;
    bgColor: string;
    badgeBg: string;
    badgeBorderColor: string;
    badgeTextColor1: string;
    badgeTextColor2: string;
  };
  event: {
    label: string;
    labelBg: string;
    labelColor: string;
    deadline: string;
    deadlineBg: string;
    deadlineColor: string;
    products: Product[];
  };
  services: {
    label: string;
    items: ServiceItem[];
  };
  footer: {
    awards: string;
    copyright: string;
    disclaimer: string;
  };
  seo?: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
  };
}
