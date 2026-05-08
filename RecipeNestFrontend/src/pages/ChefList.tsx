import HomeLayout from "../components/HomeLayout";
import RN_logo from "../assets/RecipeNest.png";
import "./Home.css";
import {useState, useEffect, useMemo} from "react";
import type {ChefProfile} from "../types/ChefProfile";
import ChefListCard from "./ChefListCard";
import Modal from "../components/modal/Modal";
import DefaultProfile from "../assets/default-profile.png";
import {useNavigate} from "react-router-dom";
import SearchSortControls from "../components/SearchSortControls";

// This component displays a list of chef profiles, allowing users to search, sort, and view details of each chef.
// It fetches the chef data from an API and manages loading, error, and success states. Users can click on a chef to view their profile in a modal or navigate to a page showing their recipes.
export default function ChefList() {
  const [chefs, setChefs] = useState<ChefProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedChef, setSelectedChef] = useState<ChefProfile | null>(null);
  const navigate = useNavigate();
  const [chefQuery, setChefQuery] = useState("");
  const [chefSort, setChefSort] = useState("name-asc");


  //handling sorting and filtering of chefs based on the search query and selected sort option. It uses useMemo to optimize performance by memoizing the filtered and sorted list of chefs.
  const filteredSortedChefs = useMemo(() => {
    const q = chefQuery.trim().toLowerCase();
    const filtered = chefs.filter((chef) => {
      if (!q) {
        return true;
      }

      const haystack = [chef.firstName, chef.lastName, chef.professionalTitle, chef.bio]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const aName = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
      const bName = `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim();

      if (chefSort === "name-desc") {
        return bName.localeCompare(aName);
      }
      if (chefSort === "title-asc") {
        return (a.professionalTitle ?? "").localeCompare(b.professionalTitle ?? "");
      }
      if (chefSort === "title-desc") {
        return (b.professionalTitle ?? "").localeCompare(a.professionalTitle ?? "");
      }
      return aName.localeCompare(bName);
    });

    return sorted;
  }, [chefs, chefQuery, chefSort]);


  //this determines the correct profile image url for the selected chef, handling absolute and relative URL, and implementing a fallback image, to prevent the Ui from breaking if the profile image is absent.
   const profileImageSrc = selectedChef?.profileImageURL && typeof selectedChef.profileImageURL === "string"
        ? (selectedChef.profileImageURL.startsWith("http")
            ? selectedChef.profileImageURL
            : `${new URL(API_URL).origin}${selectedChef.profileImageURL.startsWith("/") ? "" : "/"}${selectedChef.profileImageURL}`)
        : DefaultProfile;

  useEffect(() => {
        fetchChefs();
  }, []);

  //resettign the error and success messages to nill after 3 seconds, to prevent old messages from lingering on the screen and causing confusion for the user.
  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, success]);

  //This function is responsible for fetching the chef profiles from the API endpoint.
  //It manages the loading, error and success feedback states. It passes the api response to the cheflist state after transforming the data to match the ChefProfile type,
  //It ensures accurate user feedback to user based on API reseponse.
  async function fetchChefs() {
      setLoading(true);
      setError("");
      setSuccess("");

      try{
          const res = await fetch(`${API_URL}/ChefProfile/All`, {  //fetches the chef profiles from the API endpoint.
                method: "GET",
          });

        if (res.status === 204) {  //appropriate feedback is probided based on the API response, else, it returns.
          setChefs([]);
          setSuccess("No chef profiles were returned by the server.");
          return;
        }

        const rawText = await res.text(); //analyzing the API response to raw text.
        let data: any = null; //if the response is JSOn, it parses the data, else it uses the raw text as the error message or data.
        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch {
          data = rawText;
        }

          if (!res.ok) {
          throw new Error((typeof data === "object" ? data?.message : data) || "There are currently no chefs available.");
          }

        const rawChefList = Array.isArray(data)
          ? data
          : Array.isArray(data?.chefs)
          ? data.chefs
          : Array.isArray(data?.data)
            ? data.data
            : [];

        const chefList: ChefProfile[] = rawChefList.map((cheff: any) => ({  //setting the chef list state after transforming the API response to match the ChefProfile type.
                  chefProfileId: cheff.chefProfileId ?? cheff.ChefProfileId ?? cheff.id ?? cheff.Id,
                  firstName: cheff.firstName ?? cheff.FirstName,
                  lastName: cheff.lastName ?? cheff.LastName,
                  professionalTitle: cheff.professionalTitle ?? cheff.ProfessionalTitle,
                  bio: cheff.bio ?? cheff.Bio,
                  profileImageURL: cheff.profileImageURL ?? cheff.ProfileImageURL,
                  isProfileVisible: cheff.isProfileVisible ?? cheff.IsProfileVisible,
          }))
          .filter((chef: ChefProfile) => Boolean(chef.chefProfileId));

          setChefs(chefList);
      }catch(err){
          console.error(err);
          setChefs([]);
          setError(err instanceof Error ? err.message : "Unable to load chefs.");
      }finally{
          setLoading(false);
      }
  }

  return (
    <HomeLayout /* //the homelayout is used to render the common layout of the page, returing the top layer and page content. */
      topLayer={
        <div className="top_heading2" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
            <img src={RN_logo} alt="Recipe Nest Logo" width={32} height={32} />
            <h3>Chef List</h3>
        </div>
      }
      pageContent={ 
        <>
            {/* //checks if the data is still loading. If it is, it displays a loading message to inform the user that the chef profiles are being fetched. */}
            {loading && <p>Loading chefs...</p>}
            {/* //displays an error message at the top of the page if there was an error fetching the chef profile. */}
            {error && <p>{error}</p>}
            {/* //displays a success message at the top of the page if the chef profiles were fetched successfully. */}
            {success &&<p>{success}</p>}
            <SearchSortControls /* //implementing the search and sort controls for hte  chef list, allowing users to search for chefs and sort based on different criteria. It passes the props to the SearchSortControls component. */
              query={chefQuery}
              onQueryChange={setChefQuery}
              sortValue={chefSort}
              onSortChange={setChefSort}
              searchPlaceholder="Search chefs by name, title, or bio..."
              sortOptions={[
                { value: "name-asc", label: "Name A-Z" },
                { value: "name-desc", label: "Name Z-A" },
                { value: "title-asc", label: "Title A-Z" },
                { value: "title-desc", label: "Title Z-A" },
              ]}
            />
            {/* //returns error message if no chefs are found matching the criteria. */}
            {!loading && !error && filteredSortedChefs.length === 0 && <p>No chefs found for your search.</p>}
            
            {filteredSortedChefs.map((cheff) => (
                <ChefListCard
                    key={cheff.chefProfileId}
                    chef={cheff}
                    onViewProfile={() => { setSelectedChef(cheff); setShowProfileModal(true); }}
                    onViewRecipes={() => navigate(`/chef-recipes/${cheff.chefProfileId}`)}
              />
            ))}

            <Modal /* //the modal is used to display the chef profile when a chef is selected.  and passes the props of the selected chef to te modal, allowing accurate display of the chef profile information, and a button to view the chef's recipes. */
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                hasCloseButton={true}>
              {selectedChef && ( /* //modal content.checks the selected chef data and renders the appropriate information, including the profile image, name, title, bio, and a button to view the chef's recipes. */
                     <div className="dashboard"> 
                        {selectedChef ? (
                            <div className="chef-profile">
                                <img
                                    src={profileImageSrc}
                                    alt={`${selectedChef.firstName} ${selectedChef.lastName}`}
                                    width={250}
                                    height={250}
                                    onError={(e) => {
                                        e.currentTarget.src = DefaultProfile;
                                    }}
                                    style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid var(--white)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                                <h4>{selectedChef.professionalTitle ?? "Chef"} </h4>
                                <p style={{textAlign: "center"}}>{selectedChef.bio}</p>

                                <h2>{selectedChef.firstName} {selectedChef.lastName}</h2>

                                <button onClick={() => navigate(`/chef-recipes/${selectedChef.chefProfileId}`)}>View Recipes</button> {/* //button to navigate to the chef's recipes page. */}
                            </div>
                        ) : (
                          <p>Chef profile data is unavailable.</p>
                        )}
                </div>)}
            </Modal>
        </>
      }>
    </HomeLayout>
  )
}