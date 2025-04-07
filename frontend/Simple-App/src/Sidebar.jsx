import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import SearchBar from "./SearchBar";

function Sidebar() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState(false);

    const logout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: "POST",
                credentials: "include"
            });

            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    }

    return(

        <>
            <ul className="sidebar-items">
                <li onClick={() => navigate('/')}>Home</li>
                <li onClick={() => setQuery(!query)}>Search</li>
                {query ? (<SearchBar></SearchBar>) : null}
                {user ? (
                    <>
                        <li onClick={() => navigate(`/${user.username}`)}>Profile</li>
                        <li onClick={() => navigate('/Settings')}>Settings</li>
                        <li><button onClick={logout}>Log out</button></li>
                    </>
                ) : (
                    <li onClick={() => navigate('/login')}>Login</li>
                )}
            </ul>
        </>
    )
}

export default Sidebar;