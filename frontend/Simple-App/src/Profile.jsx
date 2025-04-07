import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";

function Profile() {

    const [message , setMessage] = useState("");

    const [formData, setFormData] = useState({ song: "", quote: "" });
    const [submittedData, setSubmittedData] = useState(null);

    const { user } = useAuth();
    const { profile } = useParams();

    const [posts, setPosts] =useState([]);


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

    // Handles input change
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})   
    }

    //Handles input submition
    const handleKey = (e) => {
        if (e.key === "Enter") {
            setSubmittedData({ ...formData, song: extractSoundCloud(formData.song) });
        }
    }

    //Regex for links
    const extractSoundCloud = (input) => {
        const regex = /https?:\/\/(?:w\.|)soundcloud\.com\/[^\s"]+/;
        const match = input.match(regex);
        return match ? match[0] : null
    };

    // Handles posting
    const handlePost = async (e) => {
        e.preventDefault();

        if (submittedData.song && submittedData.quote) {

            try {
                const response = await fetch("http://localhost:3000/posts/create", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({ submittedData: submittedData}) 
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

    const follow = () => {
        return; // post pro search, provavelmente como params, pegar id do paraemetro de usuario 
        // e atribuir como id de seguidor ao id de quem seguiu, pegar id de user no backend com req.user usando o middleware
    }


    return (
        <div>

            <div>
                <Sidebar></Sidebar>
            </div>

            <div>
                <h1>{profile} posts.</h1>
            </div>


            <div>
                {user.username === profile ? 
                    (<> 
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
                                
                            <p></p>
                            <button onClick={handlePost}> Post </button>
                            <p></p>

                        </div>

                    </>) 

                    : 
                    
                    (<> 
                        <button onClick={() => follow}>Follow {profile}</button> 
                        <p></p>
                    </>)}

            </div>

            <div>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={index} className="post">
                            <iframe
                                width="100%"
                                height="166"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src={`https://w.soundcloud.com/player/?url=${post.song_url}`}
                            />
                            <h1>{post.quote}</h1>

                            {user.username === profile ? (<button onClick={() => handleDelete(post.id)}>Delete</button>) : null}

                        </div>
                    ))
                ) : (
                    <></>
                )}    
                  
            </div>

            <div>
                {message}
            </div>
        </div>
    );
}

export default Profile;