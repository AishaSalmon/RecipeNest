// This file contains utility functions for sharing recipes on various platforms and copying the share URL to the clipboard.
// It defines the RecipeShareTarget type for specifying the target platform for sharing and provides functions to build share URLs and copy them to the clipboard.

export type RecipeShareTarget = "whatsapp" | "email" | "facebook" | "twitter";

export function buildRecipeShareUrl(recipeId: number): string {
    return `${window.location.origin}/?recipeId=${recipeId}`;
}

export async function copyRecipeShareUrl(recipeId: number): Promise<string> {
    const shareUrl = buildRecipeShareUrl(recipeId);
    await navigator.clipboard.writeText(shareUrl);
    return shareUrl;
}

//This function builds the share URL for a given recipe and target platform.
//It allows for reusability of code, so that if the share URL format changes in the future, it can be updated in one place without needing to modify the sharing logic for each platform.
//It is also designed to avoid code duplication in each file where it is needed.
export function buildRecipePlatformShareUrl(recipeId: number, target: RecipeShareTarget): string {
    const shareUrl = buildRecipeShareUrl(recipeId);

    switch (target) {
        case "whatsapp":
            return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this recipe: ${shareUrl}`)}`;
        case "email":
            return `mailto:?subject=${encodeURIComponent("Check out this recipe!")}&body=${encodeURIComponent(shareUrl)}`;
        case "facebook":
            return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        case "twitter":
            return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out this recipe!")}`;
        default:
            return shareUrl;
    }
}
