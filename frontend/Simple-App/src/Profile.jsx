import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Posts from "./Posts";
import Sidebar from "./Sidebar";
import { X } from 'lucide-react';


function Profile() {

    const [formData, setFormData] = useState({ song: "", quote: "", colorTheme: "", image: null });
    const [song_type, setSongType] = useState("");

    const { user } = useAuth();
    const { profile } = useParams();

    const [following, setFollow] = useState(false)
    const [pfp, setPfp] = useState(null);
    const [postTimer, setPostTimer] = useState(null);
    const [allowedToPost, setAllowedToPost] = useState(false);

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
                setPostTimer(data.allowedToPost.timeLeft)
                setAllowedToPost(data.allowedToPost.allowed)
            } else {
                setFollow(false)
                setPfp(data.pfp.profile_image)
            }
        })
        .catch(err => {
            console.error("Error retrieving profile info:", err);
            setFollow(false);
        });

    }, [following, profile, pfp, postTimer, allowedToPost]);

    // Handles input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedForm = { ...formData, [name]: value };
        setFormData(updatedForm);
    
        // If changing the song, update the song type
        if (name === "song") {
            const embed = extractAudioEmbed(value);
            setSongType(embed.type);
        }
    };

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
    
        const formDataToSend = new FormData();
        formDataToSend.append("song", formData.song);
        formDataToSend.append("quote", formData.quote);
        formDataToSend.append("colorTheme", formData.colorTheme);
        formDataToSend.append("image", formData.image);
    
        if (formData.song && formData.quote && formData.colorTheme && formData.image) {
            try {
                const response = await fetch("http://localhost:3000/posts/create", {
                    method: "POST",
                    credentials: "include",
                    body: formDataToSend
                });
    
                const data = await response.json();
    
                if (data.success) {
                    window.location.reload();
                    alert("Post sent.");
                } else {
                    alert(data.message);  
                }
    
            } catch (error) {
                alert("Error Connecting to Server");
                console.log(error);
            }
        } 
    };

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
        setFormData(null);
        setSongType("");
        setPosting(false);
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="fixed top-0 left-0 h-full z-50">
                <Sidebar></Sidebar>
            </div>

            <div className="ml-64">
                {/* Profile Header - Centered like Twitter */}
                <div className="max-w-2xl mx-auto px-4 py-6">
                    {pfp && (
                        <div className="flex flex-col items-center text-center mb-8">
                            <img 
                                src={`http://localhost:3000/${pfp}`} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-700 mb-4"
                            />
                            <h1 className="text-2xl font-bold text-white mb-2">{profile}</h1>
                            <p className="text-gray-400">Daily Mood Creator</p>
                        </div>
                    )}

                    {/* Following button if in other profile */}
                    {user && user.username !== profile && pfp && (
                        <div className="flex justify-center mb-6">
                            {following ? (
                                <button 
                                    onClick={unfollow}
                                    className="bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                                >
                                    Unfollow {profile}
                                </button>
                            ) : (
                                <button 
                                    onClick={follow}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                                >
                                    Follow {profile}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Post Creation Modal */}
                {posting && user.username === profile && (
                    <div className="max-w-2xl mx-auto px-4 mb-8">
                        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Create New Post</h2>
                                <button 
                                    onClick={cancellPost}
                                    className="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Song input */}
                            <div className="mb-6">
                                <h3 className="text-white font-semibold mb-2">Song of the day</h3>
                                <p className="text-gray-400 text-sm mb-3">Paste a soundcloud or Spotify song link</p>
                                <input 
                                    type="text"
                                    name="song"
                                    value={formData.song}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter song URL"
                                />
                            </div>
                               
                            <div className="mb-6">
                                {song_type === "spotify" && (
                                    <iframe
                                        style={{ borderRadius: "12px" }}
                                        src={`${extractAudioEmbed(formData.song).url}?utm_source=generator&theme=0`}
                                        width="100%"
                                        height="150"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                )}

                                {song_type === "soundcloud" && (
                                    <iframe 
                                        width="100%"
                                        height="152"
                                        scrolling="no"
                                        frameBorder="no"
                                        allow="autoplay"
                                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(formData.song)}
                                        &color=%23000000&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false`}
                                    />
                                )}
                            </div>
                            
                            {/* Image input */}
                            <div className="mb-6">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={postFile}
                                    style={{ display: "none" }}
                                    onChange={handleImageUpload}
                                />

                                <button
                                    onClick={() => postFile.current.click()}
                                    className="w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors duration-200"
                                >
                                    Upload image
                                </button>
                            </div>

                            <div className="mb-6">
                                {/* Color input */}
                                <h3 className="text-white font-semibold mb-3">Pick your color vibe</h3>

                                <div className="flex justify-center space-x-4">
                                    {Object.entries(colorThemes).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => setFormData({ ...formData, colorTheme: key })}
                                        style={{
                                        background: `linear-gradient(45deg, ${value.user}, ${value.post})`,
                                        border: formData.colorTheme === key ? "3px solid white" : "none",
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        }}
                                        className="hover:scale-110 transition-transform duration-200"
                                    />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Quote input */}
                            <div className="mb-6">
                                <h3 className="text-white font-semibold mb-2">Quote of the day</h3>
                                <p className="text-gray-400 text-sm mb-3">Type your best quote!</p>
                                <input 
                                    value={formData.quote}
                                    name="quote"
                                    onChange={handleChange}
                                    maxLength={250}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your quote..."
                                />
                            </div>

                            <button 
                                onClick={handlePost}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Button to start posting */}
                <div className="max-w-2xl mx-auto px-4 mb-8">
                    {user.username === profile && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => allowedToPost && setPosting(!posting)}
                                disabled={allowedToPost === false}
                                className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${
                                    allowedToPost 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl' 
                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {allowedToPost === null
                                    ? "Loading..." 
                                    : allowedToPost
                                        ? "Create Post"
                                        : "You can post again in " + Math.ceil(postTimer) + " hours."
                                }
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Posts render */}
                <Posts filter={null} profile={profile}></Posts>
            </div>
        </div>
    );
}

export default Profile;