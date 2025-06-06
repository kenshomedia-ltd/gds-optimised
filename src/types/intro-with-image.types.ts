// src/components/common/IntroWithImage/intro-with-image.types.ts

import type { StrapiImage } from "@/types/strapi.types";

export interface IntroWithImageProps {
  heading: string;
  introduction?: string;
  image?:
    | {
        data?: {
          attributes?: StrapiImage;
        };
      }
    | StrapiImage;
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
