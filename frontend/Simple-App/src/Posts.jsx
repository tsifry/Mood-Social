import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider";
import LazyEmbed from "./LazyEmbed";
import ReportInput from "./ReportInput";
import { Heart, Flag } from 'lucide-react';


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
        sunset: { border: "border-pink-400", bg: "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600" },
        ocean: { border: "border-cyan-400", bg: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-300" },
        forest: { border: "border-green-400", bg: "bg-gradient-to-br from-green-400 via-emerald-400 to-lime-300" },
        night: { border: "border-purple-400", bg: "bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-900" },
        peach: { border: "border-orange-400", bg: "bg-gradient-to-br from-orange-400 via-pink-400 to-yellow-300" },
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
        <div className="max-w-xl mx-auto px-0 py-8 space-y-8">
            {posts[1]?.map((post, index) => {
                const theme = colorThemes[post.colorTheme] || colorThemes["night"];
                const { url, type } = extractAudioEmbed(post.song_url);
                const post_user = posts[0]?.find(u => u.id === post.user_id);
                return (
                    <div key={index} className={`card border-4 ${theme.border} ${theme.bg} hover:shadow-3xl transition-all duration-300 overflow-hidden group max-w-xl mx-auto`}>                        
                        {/* Header - User Info */}
                        <div 
                            onClick={() => navigateToUser(post_user?.username)}
                            className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-slate-800 transition-colors duration-200"
                        >
                            <img 
                                src={`http://localhost:3000/${post_user?.profile_image}`}
                                alt={`${post_user?.username}'s profile`}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-white hover:ring-purple-500 transition-all duration-200"
                            />
                            <div>
                                <h3 className="text-white font-semibold text-lg hover:text-purple-300 transition-colors duration-200">
                                    {post_user?.username}
                                </h3>
                                <p className="text-gray-400 text-sm">Daily Mood</p>
                            </div>
                        </div>
                        {/* Music Embed */}
                        <div className="px-4 pb-2">
                            <LazyEmbed type={type} url={url} />
                        </div>
                        {/* Image */}
                        {post.image_url && (
                            <div className="px-4 pb-2">
                                <img 
                                    src={`http://localhost:3000/${post.image_url}`}
                                    alt="Post image"
                                    className="w-full rounded-xl object-cover shadow-lg hover:scale-[1.02] transition-transform duration-300 max-h-60 min-h-60"
                                />
                            </div>
                        )}
                        {/* Quote */}
                        <div className="px-4 pb-4">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 border-l-4 border-slate-600">
                                <p className="text-white text-lg leading-relaxed font-medium italic">
                                    "{post.quote}"
                                </p>
                            </div>
                        </div>
                        {/* Action Bar */}
                        <div className="px-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    {user && (
                                        <>
                                            <button 
                                                onClick={() => like(post.id)} 
                                                className="flex items-center space-x-2 text-gray-400 hover:text-pink-500 transition-colors duration-200 group"
                                            >
                                                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill={liked ? 'pink' : 'none'} />
                                                <span className="font-medium">{post.like_count}</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => setReporting(true)}
                                                className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-xl hover:scale-110 transition-transform duration-200"
                                            >
                                                <Flag className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                {user && user.username === profile && (
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-red-500/10"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Reporting Modal */}
                        {reporting && (
                            <div className="px-6 pb-6">
                                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                    <ReportInput postId={post.id} />
                                    <button 
                                        onClick={() => setReporting(false)}
                                        className="mt-3 text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        
        {/* Loading/Message */}
        <div className="max-w-2xl mx-auto px-4 pb-8">
            <h2 className="text-center text-gray-400 text-lg">{message}</h2>
        </div>  
    </>);

}

export default Posts;