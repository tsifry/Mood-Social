import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Posts from "./Posts";
import Sidebar from "./Sidebar";
import styles from "./css/Profile.module.css";

function Profile() {

    const [formData, setFormData] = useState({ song: "", quote: "", colorTheme: "", image: null });
    const [submittedData, setSubmittedData] = useState(null);
    const [song_type, setSongType] = useState("");

    const { user } = useAuth();
    const { profile } = useParams();

    const [following, setFollow] = useState(false)
    const [pfp, setPfp] = useState(null);

    const [posting, setPosting] = useState(false)

    const postFile = useRef(null);

    const colorThemes = {
        sunset: { user: "#432C51", post: "#F1B5C6" },
        ocean: { user: "#1B3B5F", post: "#A2D2FF" },
        forest: { user: "#2E473B", post: "#B5E1B9" },
        night: { user: "#1E1E2F", post: "#3A3A55" },
        peach: { user: "#4F2E2E", post: "#F7C59F" },
    };

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
                setPfp(data.pfp.profile_image)
            }
        })
        .catch(err => {
            console.error("Error retrieving profile info:", err);
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

    //Image posting
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;
        setFormData({ ...formData, image: file });
    }

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

    return (
        <div>

            <div>
                <Sidebar></Sidebar>
            </div>

            {/*Render up part of profile */}
            <div className={styles.user}>

                {pfp && (
                    <div className={styles.userInfo}>
                        <img src={`http://localhost:3000/${pfp}`} alt="Profile" className="profile_image" />
                        <h1>{profile}</h1>
                    </div>
                )}

                {/*Following button if in other profile */}
                {user && user.username !== profile && pfp && (<>
                
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

            {/* This is just the stuff that appears to submit a new post. */}
            {posting && user.username === profile &&
            (<> <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={cancellPost}>✕</button>

                        {/*Song input */}
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
                        
                        {/*Image input */}
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
                            
                            {/*Color input */}
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
                        
                        {/*Quote input */}
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
            
            {/*Button to start posting*/}
            <div>
                {user.username === profile && (
                    <div >
                        <button onClick={() => setPosting(!posting)} className={styles.posting}>Post Today's mood</button>
                    </div>
                )}
            </div>
            
            {/*Posts render */}
            <Posts filter={null} profile={profile}></Posts>
            
        </div>
    );
}

export default Profile;