import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navigate } from "react-router-dom";

function Profile() {

    const [formData, setFormData] = useState({ song: "", quote: "" });
    const [submittedData, setSubmittedData] = useState(null);

    const [ user, setUser] = useState("")
    const { profile } = useParams();

    useEffect(() => {
            fetch("http://localhost:3000/auth/me", {
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setUser(data.user);
                    }
                })
                .catch(err => console.error("Error fetching user:", err));
        }, []); // Run only once when component mounts

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})   
    }

    const handleKey = (e) => {
        if (e.key === "Enter") {
            setSubmittedData({ ...formData, song: extractSoundCloud(formData.song) });
        }
    }

    const extractSoundCloud = (input) => {
        const regex = /https?:\/\/(?:w\.|)soundcloud\.com\/[^\s"]+/;
        const match = input.match(regex);
        return match ? match[0] : null
    };

    const handlePost = async (e) => {
        e.preventDefault();

        if (submittedData.song && submittedData.quote) {

            try {
                const response = await fetch("http://localhost:3000/posts/create", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({ submittedData: submittedData, user: user }) 
                });

                const data = await response.json();

                if(data.success){
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

    return (
        <div>
            <div>
                <h2>Song of the day:</h2>

                <div> {!submittedData?.song && 
                    (<input type="text"
                        value={formData.song}
                        name="song"
                        onChange={handleChange}
                        onKeyDown={handleKey}>
                        </input>)}
                </div>

                <div>{submittedData?.song && (<iframe
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(submittedData.song)}`}
                />)}</div>

            </div>

            <div>
                <h2>Quote of the day:</h2>
                
                <div>{!submittedData?.quote && 
                    (<input type="text"
                        value={formData.quote}
                        name="quote"
                        onChange={handleChange}
                        onKeyDown={handleKey}>
                    </input> )} 
                </div>

                <div>{submittedData && submittedData.quote}</div>

            </div>

            <div>
                    <h1> {user.username === profile ? 
                    (<>
                        <button onClick={handlePost}> Post </button>
                        You are at your profile.
                    </>) 
                    : 
                    
                    (<> You are watching someone else's profile.</>)} </h1>
            </div>
        </div>
    );
}

export default Profile;