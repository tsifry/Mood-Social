import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";
import styles from "./css/Profile.module.css";

function Profile() {

    const [message , setMessage] = useState("");
    const [formData, setFormData] = useState({ song: "", quote: "", colorTheme: "", image: null });
    const [submittedData, setSubmittedData] = useState(null);
    const [song_type, setSongType] = useState("");

    const { user } = useAuth();
    const { profile } = useParams();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [following, setFollow] = useState(false)
    const [pfp, setPfp] = useState(null);

    const [posting, setPosting] = useState(false)

    const colorThemes = {
        sunset: { user: "#432C51", post: "#F1B5C6" },
        ocean: { user: "#1B3B5F", post: "#A2D2FF" },
        forest: { user: "#2E473B", post: "#B5E1B9" },
        night: { user: "#1E1E2F", post: "#3A3A55" },
        peach: { user: "#4F2E2E", post: "#F7C59F" },
    };

    const postFile = useRef(null);


    // Render posts
    useEffect(() => {

        fetch(`http://localhost:3000/posts/${profile}`, {
            method: "GET",
            credentials: "include"
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.message){
                setMessage(data.message);
            } 
            else {
                setPosts(data);
            }
        })
        .catch(error => console.error('Error fetching posts:', error));

    }, [profile]);

    // Checks for followage and other stuff about profile
    useEffect(() => {

        fetch(`http://localhost:3000/search/follow/${profile}`, {
            method: "GET",
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setFollow(data.follows)
                setPfp(data.pfp.profile_image)
            } else {
                setFollow(false)
            }
        })
        .catch(err => {
            console.error("Error checking follow status:", err);
            setFollow(false);
        });

    }, [following, profile, pfp]);

    // Handles input change
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})   
    }

    //Handles input submition
    const handleSongSubmit = (e) => {
        if (e.key === "Enter") {
          setSubmittedData({ ...submittedData, song: formData.song });
          setSongType(extractAudioEmbed(submittedData.song).type);
        }
    };

    const handleQuoteSubmit = (e) => {
        if (e.key === "Enter") {
            setSubmittedData({ ...formData, quote: formData.quote });
        }
    }

    //Regex for links
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

    // Handles posting
    const handlePost = async (e) => {
        e.preventDefault();

        setSubmittedData({ ...formData, quote: formData.quote, colorTheme: formData.colorTheme, image: formData.image });

        const formDataToSend = new FormData();

        formDataToSend.append("song", submittedData.song);
        formDataToSend.append("quote", submittedData.quote);
        formDataToSend.append("colorTheme", submittedData.colorTheme);
        formDataToSend.append("image", submittedData.image); // ✅ this is the actual file


        if (submittedData.song && submittedData.quote && submittedData.colorTheme && submittedData.image) {

            try {
                const response = await fetch("http://localhost:3000/posts/create", {
                    method: "POST",
                    credentials: "include",
                    body: formDataToSend
                });

                const data = await response.json();

                if(data.success){
                    window.location.reload();
                    alert("Post send.");
                }
                else{
                    alert("Could not post.");  
                }

            } catch (error) {
                alert("Error Connecting to Server")
                console.log(error)
            }
        } 
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;
        setFormData({ ...formData, image: file });
    }

    // Handles deletion
    const handleDelete = async (postID) => {
        const confirm = window.confirm("Are you sure you want to delete this post?");

        if (confirm) {

            try {
                const response = await fetch(`http://localhost:3000/posts/delete/${postID}`, {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include'
                })

                if (response.status != 200){
                    return alert(response.message);
                }

                setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postID));
                alert('Post deleted successfully');
            } catch (error) {
                console.log(error);
            }
        }
    };

    // Handles following
    const follow = async () => {
        
        try {
            
            const response = await fetch(`http://localhost:3000/search/follow`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({ profile })
            });

            const data = await response.json();

            if (data.success) {
                await fetch(`http://localhost:3000/search/follow/${profile}`, {
                    method: "GET",
                    credentials: "include"
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setFollow(data.follows)
                    } else {
                        setFollow(false)
                    }
                })
            }

        } catch (error) {
            console.log(error);
        }
    }

    // Handles unfollowing
    const unfollow = async () =>{
        
        try {

            const response = await fetch(`http://localhost:3000/search/follow/${profile}`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
            });

            const data = await response.json();

            if (data.success) {
                await fetch(`http://localhost:3000/search/follow/${profile}`, {
                    method: "GET",
                    credentials: "include"
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setFollow(data.follows)
                    } else {
                        setFollow(false)
                    }
                })
            }

        } catch (error) {
            console.log(error);
        }
    }

    //Handles post cancel
    const cancellPost = () => {
        setFormData({ song: "", quote: "", colorTheme: "", image: null });
        setSubmittedData(null);
        setSongType("");
        setPosting(false);
    }

    const navigateToUser = (user) => {
        navigate(`/${user}`);
    } 

    return (
        <div>

            <div>
                <Sidebar></Sidebar>
            </div>

            <div className={styles.user}>

                <div>
                    <img src={`http://localhost:3000/${pfp}`} alt="Profile"
                         className="profile_image"></img>
                 </div>

                <h1>{profile}</h1>

                {user.username !== profile && (<>
                
                    <> 
                        {following ? (
                        <>
                            <button onClick={unfollow} className={styles.follow_button}>Unfollow {profile}</button> 
                            <p></p>
                        </>) : (
                            
                        <>
                            <button onClick={follow} className={styles.follow_button}>Follow {profile}</button> 
                            <p></p>
                        </>)}
                    </>
                
                </>)}

            </div>

            {posting && user.username === profile &&
            (<> <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={cancellPost}>✕</button>

                        <div className={styles.post_message}>
                            <h2>Song of the day.</h2>
                            <h3>Paste a soundcloud or Spotify song link</h3>
                        </div>

                        <div>
                            <input type="text"
                                   name="song"
                                   value={formData.song}
                                   onChange={handleChange}
                                   onKeyDown={handleSongSubmit}></input>
                            
                        </div>
                           
                        <div>
                            {song_type === "spotify" && (<>
                                <iframe
                                    style={{ borderRadius: "12px" }}
                                    src={`${extractAudioEmbed(submittedData.song).url}?utm_source=generator&theme=0`}
                                    width="100%"
                                    height="150"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </>)}

                            {song_type === "soundcloud" && (<>
                                <iframe width="100%"
                                    height="152"
                                    scrolling="no"
                                    frameBorder="no"
                                    allow="autoplay"
                                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(submittedData.song)}
                                    &color=%23000000&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false`}
                                />
                            </>)}
                        </div>

                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={postFile}
                                style={{ display: "none" }}
                                onChange={handleImageUpload}
                            />

                            <button className={styles.image_button}
                                    onClick={() => postFile.current.click()}>Upload image.</button>
                        </div>

                        <div className={styles.themePicker}>

                            <h2>Pick your color vibe</h2>

                            <div className={styles.themeOptions}>
                                {Object.entries(colorThemes).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setFormData({ ...formData, colorTheme: key })}
                                    style={{
                                    background: `linear-gradient(45deg, ${value.user}, ${value.post})`,
                                    border: formData.colorTheme === key ? "2px solid white" : "none",
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    margin: "0.5rem",
                                    cursor: "pointer",
                                    }}
                                />
                                ))}
                            </div>
                        </div>

                        <div className={styles.post_message}>

                            <h2>Quote of the day</h2>
                            <h3>Type your best quote!</h3>

                        </div>
                                <input value={formData.quote}
                                       name="quote"
                                       onChange={handleChange}
                                       onKeyDown={handleQuoteSubmit}></input>

                        <div>
                            
                        </div>

                        <button onClick={handlePost}>Post</button>
                    </div>
                </div>
            
            </>)}

            <div>
                {user.username === profile && (
                    <div >
                        <button onClick={() => setPosting(!posting)} className={styles.posting}>Post Today's mood</button>
                    </div>
                )}
            </div>

            <div className={styles.posts}>
                {posts.map((post, index) => {
                    const theme = colorThemes[post.colorTheme] || colorThemes["night"];
                    const {url, type } = extractAudioEmbed(post.song_url);

                    return (
                        <div key={index} className={styles.post} style={{ backgroundColor: theme.post }}>

                            <div className={styles.post_user} style={{ backgroundColor: theme.user, cursor: "pointer" }}
                                 onClick={() => navigateToUser(profile)}>
                                <img src={`http://localhost:3000/${pfp}`} className={styles.user_image} />
                                <h1>{profile}</h1>
                            </div>

                            <div className={styles.playerWrapper}>

                                {type === "spotify" && (
                                    <iframe style={{ borderRadius: "12px" }}
                                            src={`${url}?utm_source=generator&theme=0`}
                                            width="100%"
                                            height="240"
                                            frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            allowFullScreen
                                            loading="lazy">
                                    </iframe>
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

                                {user.username === profile && (
                                    <button onClick={() => handleDelete(post.id)} className={styles.deleteButton}>Delete</button>
                                )}
                            </div>
                        </div>
                    );
                })}
                  
            </div>

            <div>
                {message}
            </div>
        </div>
    );
}

export default Profile;