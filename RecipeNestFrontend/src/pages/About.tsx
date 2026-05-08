import RN_logo from "../assets/RecipeNest.png";
import HomeLayout from '../components/HomeLayout';


//the about page is rendered using the Homelayout component. It provides information about the application, its mission, how it works, and what users can expect.
//it also provides information about the developer and a button to view the source code on GitHub, as well as a button to navigate to the help page for support.
export default function About(){
    return(
        <HomeLayout
            topLayer = { /* //the toplayer JSX provides the heading for the page. It includes the logo and the title "About RecipeNest". */
            <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                <h3>About RecipeNest</h3>
            </div>
            }
            
            pageContent = { /* //the pageContent JSX provides the main content for the about page. it is rendered as JSX and styled to provide a visually appealing layout. */
                <div className="about-content">
                    <div className = "content">
                        <section>
                        <p>
                        Welcome to RecipeNest, the ultimate platform for chefs and food enthusiasts to share and discover amazing recipes!
                        </p>
                        </section>

                        <h1>Our Mission</h1>
                        <p>
                        At RecipeNest, our mission is to empower chefs and food lovers to share their culinary creations with the world. 
                        We believe that everyone has a unique story to tell through their cooking, and we provide a space for those stories to be shared and celebrated.
                        The aim of this platform is to help chefs connect with a community of like-minded individuals, and inspire others with their culinary skills.
                        Whether you're an experienced chef or someone passionate about cooking, RecipeNest helps you share your creations and inspire others.
                        </p>

                        <h1>How the application works</h1>
                        <p>
                        RecipeNest is a platform designed to provide a seamless experience for chefs and food enthusiasts alike.
                        Users can create an account, set up their profile, and start sharing their recipes with the community.
                        You can also browse through a wide variety of recipes, save your favorites, and connect with other chefs to exchange ideas and feedback through the discussion menu.
                        The application also offers features like recipe management, where chefs can easily organize and update their recipes, and a dashboard to track their activity and engagement on the platform.
                        </p>
                        <h1>What to Expect</h1>
                        <p>
                        By joining RecipeNest, you can expect to be part of a vibrant community of chefs and food lovers who are passionate about sharing their culinary creations.
                        The application is intended to:
                        </p>
                        <ul>
                            <li>make recipe sharing easy and enjoyable</li>
                            <li>connect chefs with a community of like-minded individuals</li>
                            <li>inspire creative culinary expression</li>
                            <li>support saving and sharing recipes for future use</li>
                            <li>provide tools for recipe management and tracking engagement</li>
                        </ul>

                        <p>
                        As the platform continues to grow, users can expect new features and improvements based on user feedback and creativity of the developers.
                        This platform is committed to creating a space for chefs to share their passion for cooking with the world.
                        </p>

                        <h1>About the developer</h1>
                        <p>
                        RecipeNest was developed by Aisha Salmon - a second-year software engineering student at the university of Bedfordshire, as a project to showcase her skill in full stack web application development.
                        The developer is passionate about helping to solve real-world problems through technology, and is excited to share this platform with the world.
                        You can view the source code for RecipeNest on GitHub, among her other projects by clicking on the button below:
                        </p>
                        <button onClick={() => window.open("https://github.com/AishaPro", "_blank")}>View on GitHub</button> {/* //button connecting to developer's gitbhub profile, opening on a new tab. */}


                        <h1>Feedback</h1>
                        <p>
                        We welcome your feedback and suggestions to help us improve RecipeNest.

                        If you have any questions, or need help with navigating the platform, please don't hesitate to reach out to us by heading to the "Help" section in the navigation menu contact information for support or click the button below:
                        </p>
                        <button onClick={() => window.location.href = "/help"}>Go to Help</button> {/* //butting navigating to the help page for support on how to use th epplication. */}
                        <p>
                        Please feel free to reach out to us with any comments, questions, or ideas you may have. Your input is invaluable in helping us create the best possible experience for our users.

                        </p>
                        
                    </div>
                      <button onClick={() => window.location.href = "/"}>Back to Home</button> {/* //button navigating back to the home page. */}
                </div>
            }>
        </HomeLayout>
    )
}