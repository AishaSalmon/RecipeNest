import RN_logo from "../assets/RecipeNest.png";
import HomeLayout from '../components/HomeLayout';


//the help page provides users with comprehensive guidance on how to use the RecipeNest platform.
//it includes step-by-step instructions for various features such as creating an account, resetting passwords, managing profiles, using recipes, engaging in discussions, and switching between light and dark modes.
export default function Help(){
    return(
        <HomeLayout
            topLayer = {
            <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
                <h3>Help & Support</h3>
            </div>
            }
            
            pageContent = {
                <div className="about-content">
                    <div className = "content">
                        <p>Need assistance? We're here to help!</p>
                        <section>
                            <h1>To begin:</h1>
                            <ol>
                                <li>Register a new account using your email and a chosen password.</li>
                                <li>Login using your registered credentials.</li>
                                <li>Set up your profile by adding a profile picture, writing a bio, and sharing your culinary interests.</li>
                                <li>Update your profile and preferences to personalize your experience.</li>
                                <li>Start sharing your recipes with other users and explore recipes shared by other chefs!</li>
                                <li>Easily update your recipes and manage your content.</li>
                                <li>Access discussions to engage with other members and exchange cooking tips.</li>
                                <li>Share and participate in discussions to engage with other members and exchange cooking tips.</li>
                                <li>Save your favorite recipes for easy access later.</li>
                                <li>Get help and support whenever you need it.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I create an account?</h1>
                            <p>To create an account, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Create Account</b> button on the homepage.</li>
                                <li>Enter your email address and choose a secure password.</li>
                                <li>Fill in your name and any other required details.</li>
                                <li>By clicking <b>Register</b>, you agree to our terms and conditions and privacy policy.</li>
                                <li>Click <b>Register</b> to complete the registration process.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I reset my password?</h1>
                            <p>If you've forgotten your password, you can reset it by following these steps:</p>
                            <ol>
                                <li>Go to the login page and click on the <b>Forgot Password?</b> link.</li>
                                <li>Enter your registered email address and click <b>Send reset link</b>.</li>
                                <li>Check your email inbox for a password reset link.</li>
                                <li>Open the email and click on the provided link. If you don't see the email, check your spam folder or try resending the link.</li>
                                <li>Follow the instructions on the screen to create a new password.</li>
                                <li>Once you've successfully reset your password, you can log in with your new credentials.</li>
                                <li>Once logged in, you can access your dashboard and start using RecipeNest.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I create my profile?</h1>
                            <p>To create your profile, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Dashboard</b> button on your dashboard.</li>
                                <li>Click on the <b>Create Profile</b> button.</li>
                                <li>Enter your personal information, such as your name, bio, and profile picture, as displayed in the form.</li>
                                <li>You can also choose to keep your profile private or make it visible to other users.</li>
                                <li>Click <b>Save</b> to update your profile.</li>
                                <li>Once your profile is created, you can start sharing your recipes and engaging with fellow users!</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I update or delete my profile?</h1>
                            <p>To update or delete your profile, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Dashboard</b> button on your dashboard.</li>
                                <li>Click on the <b>Edit Profile</b> button to update your information.</li>
                                <li>Make the desired changes to your profile and click <b>Save</b>.</li>
                                <li>To delete your profile, click on the <b>Delete Profile</b> button and confirm the action.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I use recipes?</h1>
                            <p>On RecipeNest, you can explore a wide variety of recipes shared by other users. 
                                <br/>To use a recipe, simply click on it to view the full details, including ingredients, instructions, and any additional notes from the author. 
                                <br/>You can also save your favorite recipes for easy access later.</p>
                        </section>

                        <section>
                            <h1>How do I create a new recipe?</h1>
                            <p>To create a new recipe, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Manage Recipes</b> button on your the navigation bar.</li>
                                <li>Click on the <b>Create Recipe</b> button.</li>
                                <li>Enter the recipe title, ingredients, and instructions.</li>
                                <li>Add any additional notes or tips for the recipe.</li>
                                <li>Upload a photo of your dish if desired.</li>
                                <li>Click <b>Create Recipe</b> to share your recipe with other users.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I delete all my recipes?</h1>
                            <p>To delete all your recipes, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Manage Recipes</b> button on the side navigation bar.</li>
                                <li>Here you will see a list of options. Click on the <b>Delete All Recipes</b> button to remove all your recipes.</li>
                                <li>Confirm the action to permanently delete all your recipes.</li>
                                <li>Once confirmed, all your recipes will be deleted from the platform.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I update, delete or view my recipes?</h1>
                            <p>To update, delete, or view your recipes, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Manage Recipes</b> button on the side navigation bar.</li>
                                <li>Here you will see a list of all your recipes. Click on a recipe to view its details.</li>
                                <li>To update a recipe, click on the <b>Edit</b> button and make the desired changes.</li>
                                <li>To delete a recipe, click on the <b>Delete</b> button and confirm the action.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I use the discussion feature?</h1>
                            <p>To use the discussion feature, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Discussions</b> button on the navigation bar.</li>
                                <li>Here you will see a list of all discussions with options to like, view or delete your own discussions.</li>
                                <li> Click on a discussion to view its details.</li>
                                <li>To like a discussion, click on the <b>Like</b> button and to unlike it, click the <b>Unlike</b> button.</li>
                                <li>You can also create a new discussion by clicking on the <b>Post New Discussion</b> button at the top of the page and entering your title and description.</li>
                                <li>To delete a discussion, click on the <b>Delete</b> button and confirm the action.</li>
                                <li>And that's how you can manage discussions on RecipeNest!</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I change from light mode to dark mode?</h1>
                            <p>To change from light mode to dark mode, follow these steps:</p>
                            <ol>
                                <li>Click on the <b>Settings</b> button on the navigation bar.</li>
                                <li>Simply click on <b>Dark Mode</b> to switch to dark mode.</li>
                                <li>To switch back to light mode, select <b>Light Mode</b>.</li>
                            </ol>
                        </section>

                        <section>
                            <h1>How do I contact support?</h1>
                            <p>If you need further assistance or have any questions, you can contact our support team by clicking on the <b>Contact Support</b> button below. 
                                The developer is ready to help and respond to your inquiry as soon as possible. Thank you for choosing RecipeNest!</p>
                            <button className="post-discussion-button" onClick={() => window.location.href = "mailto:aisha.salmon@beds.ac.uk"}>Contact Support</button> 
                            {/* //this button will open the user's default email client with a new email addressed to the support email address, allowing them to easily reach out to developer for assistance. */}
                        </section>
                    </div>
                </div>
            }>
        </HomeLayout>
    )
}