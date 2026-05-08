import {createContext, useContext, useEffect, useState} from "react";

type Theme = "light" | "dark";

// The theme context type defines the structure of the context object, which includes the current theme and a function to toggle the theme.
type ThemeContextType = { 
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

//the function manages the theme state.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme"); //checks local storage for the current theme.
        const saved: Theme = savedTheme === "dark" ? "dark" : "light";
        setTheme(saved);
    }, []);

    useEffect(() => { //updates the body class and local storage whenever the theme changes.
        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    function toggleTheme() { //toggles the theme between light and dark when button is clicked on the siettings page.
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }

    return(
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

//The function is used to access the theme context in any component, which allows components to read the current theme and toggle it when needed.
//It is used in the header component in the settings page, allowing the useState of the theme to be toggled when the button is clicked, and the current theme to be displayed on the button.
export function useTheme() {
    return useContext(ThemeContext)!;
}