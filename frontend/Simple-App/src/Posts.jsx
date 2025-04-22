import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./css/Profile.module.css";


function Posts ({ filter }) {

    const navigate = useNavigate();

    const [home_posts, setHome_posts] = useState([]);
    const [message, setMessage] = useState('');

    const navigateToUser = (user) => {
        navigate(`/${user}`);
    } 
    
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
        
        fetch(`http://localhost:3000/home?filter=${filter}`, {
            method: "GET",
            credentials: "include"
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.message) {
                setMessage(data.message);
                setHome_posts([]); // clear posts
            }
            else{
                const [user, posts] = data;
                setHome_posts(data);
                setMessage(""); // clear old message
            }
    
        })
        .catch(error => console.error('Error fetching posts:', error));
    
    }, [filter, message]);
    
    const colorThemes = {
        sunset: { user: "#432C51", post: "#F1B5C6" },
        ocean: { user: "#1B3B5F", post: "#A2D2FF" },
        forest: { user: "#2E473B", post: "#B5E1B9" },
        night: { user: "#1E1E2F", post: "#3A3A55" },
        peach: { user: "#4F2E2E", post: "#F7C59F" },
    };

    return (<>

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
        <div>
            {message}
        </div>  
    </>);

}

export default Posts;