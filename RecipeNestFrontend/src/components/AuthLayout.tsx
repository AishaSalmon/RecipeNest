import type { ReactNode } from "react";
import RN_logo from "../assets/RecipeNest.png";
import "../pages/Main.css";


//The authlayoutprops type defines the structure of the properties that the authenticaion layout expects to receive includig title, subtitile and children.
type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};


//This funciton manages the layout of the authentication pagees (login, register, forgrt password, reset password).
//It aceepts the title, subtitle and children as props, and renders the layout of the authentication pages accordingly.
// The left side of the layout contains the brand mark and some information about the website, while the right side contains the form for authentication and displays the title and subtitle passed as props.
//This is to ensure uniformity and resuability of the authentication pages, as they all share the same layout and styling.
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  /* //the returned JSX code defines the structure of the authentication layout, with a wrapper div. It awaits the three props to be passed in and rendered in the layout */
  return (
    <div className="auth_wrapper">
    <div className="auth">
      <div className="auth_left">
        <section className="auth_innerLeft">
          <div className="brandMark">
            RecipeNest
            <img src={RN_logo} alt="Recipe Nest Logo" width={150} height={150} />
          </div>

          <div className="inner">
            <h1>
              Share Recipes.<br />Build Your Chef Brand
            </h1>

            <p className="sub">
              A professional space for chefs to showcase Recipes and connect with food lovers.
            </p>
            <ul className="bullet">
              <li>Create a chef profile + portfolio</li>
              <li>Publish recipes with ingredients & steps</li>
              <li>Join discussions and grow your audience</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="auth_right">
        <div className="cardd">
          <div className="cardd_header">
            <div className="logo">
              <img src={RN_logo} alt="Recipe Nest Logo" width={40} height={40} />
            </div>
            <div>
              <h2>{title}</h2>
              <p className="muted">{subtitle}</p>
            </div>
          </div>
        </div>

          {children}
      </div>
    </div>
    </div>
  );
}
