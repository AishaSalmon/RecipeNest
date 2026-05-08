import { useTheme } from "../components/context/ThemeContext";
import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";

//the settings page allows users to toggle between light and dark mode.
//it uses the useTheme hook to access the local storage and page themem.
export default function Settings(){
    const {theme, toggleTheme} = useTheme();

    return(
        <HomeLayout
            topLayer = {
            <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                <h3>Settings</h3>
            </div>
            }
            pageContent = {
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: theme === "light" ? "#fff" : "#333", padding: "2rem", color: theme === "light" ? "#000" : "#fff", borderColor: theme === "light" ? "#000" : "#fff", borderWidth: "10px", borderRadius: "10px", width: "60%" }}>
                    <h3>Toggle between light and dark mode</h3>
                    <button className="post-discussion-button" onClick={toggleTheme}> {/* //the button calls the ToggleTheme function from the useTheme hook, which allows users to switch between light and dark mode. */}
                        {theme === "light"
                            ? "🌙 Dark Mode"
                            : "☀️ Light Mode"}            
                    </button>
                </div>
            }>

            </HomeLayout>
    )
}