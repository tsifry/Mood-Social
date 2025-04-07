import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import SearchBar from "./SearchBar";
import styles from "./css/Sidebar.module.css";

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
            <ul className={styles.sidebar}>
                <li className={styles.sidebarItem}>
                    <div className={styles.sidebarItemBox} onClick={() => navigate('/')}>
                        Home
                    </div>
                </li>

                <li className={styles.sidebarItem}>
                    <div className={styles.sidebarItemBox} onClick={() => setQuery(!query)}>
                        Search
                    </div>                
                </li>

                {query ? (
                    <div>
                        <SearchBar />
                    </div>
                ) : null}

                {user ? (
                    <>
                         <li className={styles.sidebarItem}>
                            <div className={styles.sidebarItemBox} onClick={() => navigate(`/${user.username}`)}>
                                Profile
                            </div>
                        </li>
                        <li className={styles.sidebarItem}>
                            <div className={styles.sidebarItemBox} onClick={() => navigate('/Settings')}>
                                Settings
                            </div>
                        </li>
                        <li className={styles.sidebarItem}>
                            <div className={styles.sidebarItemBox} onClick={logout}>
                                Logout
                            </div>
                        </li>
                    </>
                ) : (
                    <li className={styles.sidebarItem}>
                        <div className={styles.sidebarItemBox} onClick={() => navigate('/login')}>
                            Login
                        </div>
                    </li>
                )}
            </ul>
        </>
    )
}

export default Sidebar;