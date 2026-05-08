import type { Recipe } from "./recipe";

//This file defines the ChefProfile type and it represents the structure of the data related to a chef's profile.
//In this application, it is used to manage the data retrieved from the backend related to the chef's profile, to be used in pages like the chef list and chef profile pages.
// This type helps ensure type safety and consistency when working with chef profile data throughout the application.
export type ChefProfile = {
    chefProfileId: number;
    firstName: string;
    lastName: string;
    bio: string;
    profileImageURL: File | string | null;
    isProfileVisible: boolean;
    professionalTitle?: string;
    Recipes?:  Recipe[];
}