//Importing all the necessary components and libraries for the application rendering and routing.
//Importing all the pages that will be routed to between navigations in the application. 
// Each page corresponds to a specific route in the application, allowing users to navigate to different sections such as login, home, about, settings, etc.

import { BrowserRouter, Routes, Route } from "react-router-dom"; // Importing routing components from react-router-dom for handling navigation between pages.
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Help from "./pages/Help";
import Settings from "./pages/Settings.tsx";
import ManageRecipes from "./pages/ManageRecipes";
import SignOut from "./pages/SignOut";
import ChefList from "./pages/ChefList";
import Dashboard from "./pages/Dashboard";
import SavedRecipes from "./pages/SavedRecipes";
import ViewYourRecipe from "./pages/ViewYourRecipe";
import ChefRecipes from "./pages/ChefRecipes.tsx";
import { ThemeProvider } from "./components/context/ThemeContext.tsx";

// The main App component that sets up the routing and theme context for the application.
// The themeprovider wraps the entire application so that when the theme is toggled, the change appears on all pages in the application. 
// The BrowserRouter component is used to enable routing in the application, and the Routes component defines the different routes and their corresponding components that will be rendered when a user navigates to a specific path. Each Route component specifies a path and the element (page) that should be rendered when that path is accessed. This structure allows for seamless navigation between different pages of the application while maintaining a consistent theme across all pages.
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />}/>
          <Route path="/help" element={<Help />}/>
          <Route path="/settings" element={<Settings />}/>
          <Route path="/manage-recipes" element={<ManageRecipes />}/>
          <Route path="/sign-out" element={<SignOut />}/>
          <Route path="/chef-list" element={<ChefList />}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/saved-recipes" element={<SavedRecipes />}/>
          <Route path="/view-your-recipe" element={<ViewYourRecipe />}/>
          <Route path="/chef-recipes/:chefId" element={<ChefRecipes />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;