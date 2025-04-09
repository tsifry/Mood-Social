import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";
import styles from "./css/Profile.module.css";

function Home (){

    const { user } = useAuth();
    const navigate = useNavigate()

    const [home_posts, setHome_posts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [message, setMessage] = useState('');

    const colorThemes = {
        sunset: { user: "#432C51", post: "#F1B5C6" },
        ocean: { user: "#1B3B5F", post: "#A2D2FF" },
        forest: { user: "#2E473B", post: "#B5E1B9" },
        night: { user: "#1E1E2F", post: "#3A3A55" },
        peach: { user: "#4F2E2E", post: "#F7C59F" },
    };

    const extractAudioEmbed = (input) => {
        const spotifyRegex = /https?:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/
        const soundcloudRegex = /https?:\/\/(www\.)?soundcloud\.com\/[^\s"]+/;
      
        const spotifyMatch = input.match(spotifyRegex);
        if (spotifyMatch) {
            return {
                type: "spotify",
                url: `https://open.spotify.com/embed/track/${spotifyMatch[1]}`
            };
        }
      
        const soundcloudMatch = input.match(soundcloudRegex);
        if (soundcloudMatch) {
          return {
            type: "soundcloud",
            url: soundcloudMatch[0],
          };
        }
      
        return { type: null, url: null };
    };

    useEffect(() => {
    
            fetch(`http://localhost:3000/home`, {
                method: "GET",
                credentials: "include"
            })
            .then(res => {
                return res.json();
            })
            .then(data => {
                if (data) {
                    const [user, posts] = data
                    
                    console.log('user:', user);
                    console.log('posts:', posts);

                    setHome_posts(data);
                }
                else{
                    setMessage(data.message);
                }
        
            })
            .catch(error => console.error('Error fetching posts:', error));
    
    }, []);

    const navigateToUser = (user) => {
        navigate(`/${user}`);
    } 

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
                    
                    <div className={styles.dropdown}>
                        <button className={styles.dropdownButton}>Filter ▼</button>
                        <div className={styles.dropdownContent}>
                            <div onClick={() => setFilter("all")}>All Posts</div>
                            <div onClick={() => setFilter("followed")}>Follow Only</div>
                        </div>
                    </div>
                </div>

                <div className={styles.posts}>
                    {home_posts[1]?.map((post, index) => {
                        const theme = colorThemes[post.colorTheme] || colorThemes["night"];
                        const { url, type } = extractAudioEmbed(post.song_url);

                        const user = home_posts[0]?.find(u => u.id === post.user_id);

                        return (
                            <div key={index} className={styles.post} style={{ backgroundColor: theme.post }}>

                                <div className={styles.post_user} style={{ backgroundColor: theme.user, cursor: "pointer" }}
                                     onClick={() => navigateToUser(user?.username)}>
                                    <img src={`http://localhost:3000/${user?.profile_image}`} className={styles.user_image} />
                                    <h1>{user?.username}</h1>
                                </div>

                                <div className={styles.playerWrapper}>
                                    {type === "spotify" && (
                                        <iframe
                                            style={{ borderRadius: "12px" }}
                                            src={`${url}?utm_source=generator&theme=0`}
                                            width="100%"
                                            height="240"
                                            frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            allowFullScreen
                                            loading="lazy"
                                        ></iframe>
                                    )}

                                    {type === "soundcloud" && (
                                        <iframe
                                            width="100%"
                                            height="152"
                                            scrolling="no"
                                            frameBorder="no"
                                            allow="autoplay"
                                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23000000&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false`}
                                        ></iframe>
                                    )}
                                </div>

                                {post.image_url && (
                                    <div className={styles._image}>
                                        <img src={`http://localhost:3000/${post.image_url}`} className={styles._image} />
                                    </div>
                                )}

                                <div className={styles.captionBox} style={{ backgroundColor: theme.user }}>
                                    <h1 className={styles.captionText}>{post.quote}</h1>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div>
                {message}
            </div>
        </>
    );
}

export default Home