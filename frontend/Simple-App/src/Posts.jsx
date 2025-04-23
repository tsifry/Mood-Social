import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider";
import styles from "./css/Profile.module.css";


function Posts ({ filter }) {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState('');

    const navigateToUser = (user) => {
        navigate(`/${user}`);
    } 
    
    //Links regex
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

    //renders posts
    const fetchPosts = async () => {
        try {
            const res = await fetch(`http://localhost:3000/home?filter=${filter}`, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();

            if (data.message) {
                setMessage(data.message);
                setPosts([]); // clear posts
            } else {
                const [user, posts] = data;
                setPosts(data); // maybe should be setPosts(posts)?
                setMessage(""); // clear old message
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };
    
    useEffect(() => {
        fetchPosts(); // call the named function
    
    }, [filter, message]);
    
    const colorThemes = {
        sunset: { user: "#432C51", post: "#F1B5C6" },
        ocean: { user: "#1B3B5F", post: "#A2D2FF" },
        forest: { user: "#2E473B", post: "#B5E1B9" },
        night: { user: "#1E1E2F", post: "#3A3A55" },
        peach: { user: "#4F2E2E", post: "#F7C59F" },
    };

    //handles liking posts
    const like = async (post_id) => {

        try {
            
            fetch('http://localhost:3000/posts/toggleLike', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({ post_id }) 
            })
            .then(res => {
                return res.json();
            })
            .then(data => {
                if (data.success){
                    fetchPosts(); 
                }
            })

        } catch (error) {
            console.log(error);
        }

    }

    return (<>

        <div className={styles.posts}>
            {posts[1]?.map((post, index) => {
                const theme = colorThemes[post.colorTheme] || colorThemes["night"];
                const { url, type } = extractAudioEmbed(post.song_url);
        
                const post_user = posts[0]?.find(u => u.id === post.user_id);
        
                return (
                    <div key={index} className={styles.post} style={{ backgroundColor: theme.post }}>
                        
                        {/* Header */}
                        <div className={styles.post_user} style={{ backgroundColor: theme.user, cursor: "pointer" }}
                            onClick={() => navigateToUser(post_user?.username)}>
                            <img src={`http://localhost:3000/${post_user?.profile_image}`} className={styles.user_image} />
                            <h1>{post_user?.username}</h1>
                        </div>

                        {/* post itself */}
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
                        
                        {/* Post bottom */}
                        <div className={styles.captionBox} style={{ backgroundColor: theme.user }}>
                            <h1 className={styles.captionText}>{post.quote}</h1>
                        </div>
                        
                        {user && (<>
                            <div className={styles.likeAndReport}>
                                <button onClick={() => like(post.id)}>❤️</button>   
                                <h3>{post.like_count}</h3>
                                <button>🚩</button>
                            </div>
                        </>)}

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