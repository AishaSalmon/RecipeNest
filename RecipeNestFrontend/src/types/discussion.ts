//This file defines the Discussion type and it represents the structure of the data related to a discussion.
//In this application, it is used to manage the data retrieved from the backend related to discussions, to be used in pages like the discussion list and discussion detail pages.
//This type helps ensure type safety and consistency when working with discussion data throughout the application.

export type Discussion = {
  discussionId: number;
  discussionTitle: string;
  discussionDescription: string;
  profileImageURL?: string;
  firstName?: string;
  lastName?: string;
  professionalTitle?: string;
  createdAt?: string;
  likedByCurrentUser?: boolean;
};