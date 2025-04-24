import { useAuth } from "./AuthProvider";
import { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import styles from "./css/Settings.module.css"



function Settings() {

    const { user } = useAuth();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("")
    const [message, setMessage] =useState("")

    const fileInputRef = useRef(null);

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("http://localhost:3000/posts/upload-profile", {
                method: "POST",
                credentials:"include",
                body: formData
            })

            const data = await res.json();

            if (data.success) {
                const userRes = await fetch("http://localhost:3000/auth/me", { credentials: "include"})
                const userData = await userRes.json();

                setUser(userData.user);
                console.log("Upload successful:", data.imagePath, userData.user);

            }
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <>

            <div>
                <Sidebar></Sidebar>
            </div>

            <div className={styles.Settings}>
                {user ? (
                    <>  
                        <div>

                            <div>
                                <img src={`http://localhost:3000/${user.profile_image}`} alt="Profile"
                                    className="profile_image"></img>
                            </div>

                            <div>
                                <div className={styles.username}>
                                    <h1>{user.username}</h1>
                                </div>
                            </div>

                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleImageUpload}
                        />

                        <button className={styles.image_button}
                                onClick={() => fileInputRef.current.click()}>Upload profile image.</button>

                        <form onSubmit={update_nickname}
                              className={styles.form}>

                            <input placeholder="Change username."
                                   onChange={(e) => setUsername(e.target.value)}
                                   className={styles.input}
                                   maxLength={20}
                                   minLength={3}></input>

                            <button className={styles.upload_button}>Ok</button>
                        </form>
                    </>
                ) : (

                    <>
                        <h1>Not authorized.</h1>
                    </>
                )}
            </div>

            <div className={styles.message}>
                {message}
            </div>
        </>
    )
}

export default Settings;