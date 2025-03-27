import { Navigate, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";

function Home (){

    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetch("http://localhost:3000/auth/me", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUser(data.user);
                } else {
                    navigate('/login');
                }
            })
            .catch(err => console.error("Error fetching user:", err));
    }, [navigate]); // Run only once when component mounts


    return(
        <>
            <h1>Home</h1>
            
            <div>
                {user ? (
                    <div>
                        <p>Logged in as: {user.username}</p>
                        <a href={`/${user.username}`}>Go to Profile</a>
                    </div>
                ) : (
                    <p>You are not logged in.</p>
                )}

                {/* Render posts here */}
            </div>
        </>
    );
}

export default Home