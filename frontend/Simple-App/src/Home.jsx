import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider";
import Posts from "./Posts";
import Sidebar from "./Sidebar";
import styles from "./css/Profile.module.css";

function Home (){

    const { user } = useAuth();
    const navigate = useNavigate()

    const [filter, setFilter] = useState("All posts");

    return(
        <> 
            <div>
                {user ? (<>
                
                    <div>
                        <Sidebar></Sidebar>
                    </div>

                    <div>
                        <div>
                            <img src={`http://localhost:3000/${user.profile_image}`} alt="Profile"
                                className="profile_image"></img>
                        </div>

                        <h1>{user.username}</h1>

                    </div>
                
    
                </>
                
                ) : (
                
                <div>
                    <h2 className={styles.welcome_text}>Welcome to MoodFlow 🎧</h2>
                    <p className={styles.welcome_text}>Discover daily moods, share your vibe, and connect with others.</p>
                    <p className={styles.welcome_text}>You are not logged in:</p>
                    <button onClick={() => navigate('/Login')} className={styles._button}>Log in</button>
                    <button onClick={() => navigate('/SignIn')} className={styles._button}>Sign in</button>
                </div>)}

                <div className={styles.feedHeader}>
                    <h1 className={styles.welcome_text}>For you posts.</h1>
                    
                    {user && (

                        <div className={styles.dropdown}>
                            <button className={styles.dropdownButton}>{filter}</button>
                            <div className={styles.dropdownContent}>
                                <div onClick={() => setFilter("All posts")}>All Posts</div>
                                <div onClick={() => setFilter("Following")}>Follow Only</div>
                            </div>
                        </div>

                    )}
                    
                </div>

                <Posts filter={filter}></Posts>

            </div>
        </>
    );
}

export default Home