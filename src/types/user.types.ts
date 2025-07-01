export type TUser = {
  bio: string;
  cover_image: {
    url: string;
    id: number;
  };
  email: string;
  firstName: string;
  lastName: string;
  photo: {
    url: string;
    id: number;
  };
  username: string;
  id: number;
};

export type TUserMessage = {
  content: string;
  title: string;
  users: TUser[];
  id: number;
  updatedAt: string;
  createdAt: string;
  publishedAt: string;
};
