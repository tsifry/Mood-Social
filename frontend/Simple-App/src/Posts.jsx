import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider";
import LazyEmbed from "./LazyEmbed";
import styles from "./css/Profile.module.css";
import ReportInput from "./ReportInput";


function Posts ({ filter, profile }) {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [liked, setLiked] = useState(false);
    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState('');
    const [reporting, setReporting] = useState(false);

    //infinite scroll rendering
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const queryParams = new URLSearchParams();
    if (profile !== null) queryParams.append("profile", profile);
    if (filter) queryParams.append("filter", filter);

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
    const fetchPosts = async (page) => {

        setLoading(true);
        setMessage('Loading...');

        try {

            queryParams.append("page", page);
            console.log(queryParams.toString())

            if (filter === "Following" && page === 1) {
                setPosts([[], []]); // Clear the previous posts
                setHasMore(true); // Reset hasMore to true
            } else if (filter === "All posts" && page === 1) {
                setPosts([[], []]); // Clear the previous posts 
                setHasMore(true); // Reset hasMore to true
            }

            const res = await fetch(`http://localhost:3000/posts?${queryParams.toString()}`, {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();
    
            if (data.success === false) {
                setMessage(data.message);
                setHasMore(false);
                return
            }

            else {
                const [users, newPosts] = data;

                setPosts(prevPosts => {
                    const [prevUsers, prevPostsData] = prevPosts.length ? prevPosts : [[], []];
                    return [
                        [...prevUsers, ...users],     
                        [...prevPostsData, ...newPosts] 
                    ];
                });
                setPage(prevPage => prevPage + 1);
                setMessage('');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };
    
    //Checks for filter changes
    useEffect(() => {
        if (!filter) {
            return
        }
        else if (filter === "Following") {
            setPage(1); 
            fetchPosts(1); 
        } else if (filter === "All posts") {
            setPage(1); 
            fetchPosts(1);         }
    },[filter]);

    //Checks for Profile changes
    useEffect(() => {
        if (!profile) return; // If no profile is provided, do nothing

        setPosts([[], []]);  
        setPage(1);           
        fetchPosts(1);
        setHasMore(true); // Reset hasMore to true        
    }, [profile]); 


    const colorThemes = {
        sunset: { user: "#432C51", post: "#F1B5C6" },
        ocean: { user: "#1B3B5F", post: "#A2D2FF" },
        forest: { user: "#2E473B", post: "#B5E1B9" },
        night: { user: "#1E1E2F", post: "#3A3A55" },
        peach: { user: "#4F2E2E", post: "#F7C59F" },
    };

    //handles liking posts
    const like = async (post_id) => {

        setLiked(!liked);

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
                    console.log(data); 
                }
            })

        } catch (error) {
            console.log(error);
        }
    }
    
    //Handles deleting posts
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
                window.location.reload();
            } catch (error) {
                console.log(error);
            }
        }
    };

    //scroll rendering
    useEffect(() => {
        const handleScroll = () => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const fullHeight = document.documentElement.scrollHeight;
      
          if (scrollTop + windowHeight >= fullHeight - 10) {
            if (!loading && hasMore) {
              console.log("Loading more posts...");
              setLoading(true); // prevent multiple triggers
              fetchPosts(page);
            }
          }
        };
      
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, page]);
      
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

                        {/* Embeds */}
                        <div className={styles.playerWrapper}>
                            <LazyEmbed type={type} url={url} />
                        </div>
                    
                        {/* Image */}
                        {post.image_url && (
                            <div className={styles._image}>
                                <img src={`http://localhost:3000/${post.image_url}`} className={styles._image} />
                            </div>
                        )}
                        
                        {/* Post bottom */}
                        <div className={styles.captionBox} style={{ backgroundColor: theme.user }}>
                            <h1 className={styles.captionText}>{post.quote}</h1>

                            {user.username === profile && (
                                <button onClick={() => handleDelete(post.id)} className={styles.deleteButton}>Delete</button>
                            )}
                        </div>
                        
                        {/* Likes and report button */}
                        {user && (<>
                            <div className={styles.likeAndReport}>
                                <button onClick={() => like(post.id)} 
                                        className={`${styles.likeButton} ${post.liked ? styles.liked : ''}`}>❤</button>   
                                <h3 className={styles.likeCounter}>{post.like_count}</h3>
                                <button onClick={() => setReporting(true)}className={styles.reportButton}>🚩</button>
                            </div>
                        </>)}

                        {/* Reporting */}
                        {reporting && (
                            <div className={styles.reportInput}>
                                <ReportInput postId={post.id} />
                                <button onClick={() => setReporting(false)}>Close</button>
                            </div>
                        )}

                    </div>
                );
            })}
        </div>
        <div>
            <h2>{message}</h2>
        </div>  
    </>);

}

export default Posts;