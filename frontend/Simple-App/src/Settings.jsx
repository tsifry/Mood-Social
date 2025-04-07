import { useAuth } from "./AuthProvider";
import { useState } from "react";
import Sidebar from "./Sidebar";

function Settings() {

    const { user } = useAuth();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("")
    const [message, setMessage] =useState("")

    const update_nickname = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/posts/username-change", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({ username }) 
            });

            const data = await response.json();

            if (data.success) {
                const userRes = await fetch("http://localhost:3000/auth/me", { credentials: "include"})
                const userData = await userRes.json();

                setUser(userData.user);
            }
            else {
                console.log("Error changing username.")
            }

            setMessage(data.message);


        } catch (error) {
            console.log(error);
        }

    }

    return(
        <>

            <div>
                <Sidebar></Sidebar>
            </div>

            <div>
                {user ? (
                    <>
                        <button>Upload profile image.</button>
                        <form onSubmit={update_nickname}>
                            <input placeholder="Update username."
                                   onChange={(e) => setUsername(e.target.value)}></input>
                            <button>Ok</button>
                        </form>
                    </>
                ) : (

                    <>
                        <h1>Not authorized.</h1>
                    </>
                )}
            </div>

            <div>
                {message}
            </div>
        </>
    )
}

export default Settings;