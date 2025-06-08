// src/components/common/IntroWithImage/intro-with-image.types.ts

import type { StrapiImage, NestedStrapiImage } from "@/types/strapi.types";

// Union type for image prop
export type ImageProp = StrapiImage | NestedStrapiImage;

export interface IntroWithImageProps {
  heading: string;
  introduction?: string;
  image?: ImageProp;
  translations?: Record<string, string>;
  timeDate?: string | Date;
  authorData?: {
    id: number | string;
    firstName: string;
    lastName: string;
    slug?: string;
    photo?: StrapiImage;
  };
  isHomePage?: boolean;
  isDateEnabled?: boolean;
}
