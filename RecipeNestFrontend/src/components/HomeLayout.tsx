import type { ReactNode } from "react";
import RN_logo from "../assets/RecipeNest.png";
import "../pages/Home.css";
import { Link } from "react-router-dom";
import { Home, ChefHat, Bookmark, Plus, LogOutIcon, Settings, CircleQuestionMark, Info } from "lucide-react";

//TThe HomeLayoutProps type defines the structure of the properties that the home layout expects to receive, including the top layer and page content.
//The props are both react components, passed as JSX elements, to be rendered in the top panel and page content sections of the home layout, respectively.
//The top layer renders the header, title or navigation bar, while the page content is used for the main content of the page.
type HomeLayoutProps = {
    topLayer: ReactNode;
    pageContent: ReactNode;
}

//The homelayout component defines the overall structure of the page, ensuring consistent layout accross different pages
//It ensures uniformity, and prevents code duplication by providing a common layout for all pages.
//The page ensures consistent DOM structure, allowing for easy manipulation, maintainance and styling. 
//The left panel remains consistent, containing the logo, and navigation links, while the right panel is dynamic for each page, rendering the toplayer and page conent passed as props.
export default function HomeLayout({topLayer, pageContent}: HomeLayoutProps){
    return(
        /* // wrapper for the entire home layout, containing the left and right panels */
        <div className="Home"> 
            <div className="left_panel">
                <div className="logo">
                    <img src={RN_logo} alt="RecipeNest logo" width={40} height={40}/>
                    <h2><Link to="/">RecipeNest</Link></h2>
                </div>
                 {/* //navigation links */}
                <div className="links">
                    <ul>
                        <li><Home size={25} style={{marginRight: "16px"}}/><Link to="/dashboard">Dashboard</Link></li>
                        <li><ChefHat size={25} style={{marginRight: "16px"}}/><Link to="/chef-list">Chef List</Link></li>
                        <li><Bookmark size={25} style={{marginRight: "16px"}}/><Link to="/saved-recipes">Saved Recipes</Link></li>
                        <li><Plus size={25} style={{marginRight: "16px"}}/><Link to="/manage-recipes">Manage Recipes</Link></li>
                    </ul>
                </div>
                
                <div>
                    <ul>
                        <li><Settings size={25} style={{marginRight: "16px"}}/><Link to="/settings">Settings</Link></li>
                        <li><CircleQuestionMark size={25} style={{marginRight: "16px"}}/><Link to="/help">Help</Link></li>
                        <li><Info size={25} style={{marginRight: "16px"}}/><Link to="/about">About</Link></li>
                        <li><LogOutIcon size={25} style={{marginRight: "16px"}}/><Link to="/sign-out">Sign Out</Link></li>
                    </ul>
                    <p style={{fontSize: "12px", color: "var(--muted)"}}>&#169;2026 RecipeNest. All rights reserved.</p>
                </div>
            </div>
 {/* //dynamic content area, awaiting the toplayer and page content passed as props */}
            <div className="right_panel">
                <div className="topPanel">
                    {topLayer}
                </div>

                <div className="pageContent">
                    {pageContent}
                </div>
            </div>
        </div>
    )
}