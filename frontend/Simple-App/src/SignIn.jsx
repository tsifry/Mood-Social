import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import styles from "./css/Login.module.css";

function SignIn(){

    const [username, setUsername] = useState()
    const [password, setPassword] = useState()

    const [success, setSuccess] = useState(false)
    const [message, setMessage] = useState("")


    const navigate = useNavigate()


    const api = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/auth/signin", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username, password }) 
            });

            const data = await response.json();

            if(data.success){
                setSuccess(true)
                setMessage(data.message)
            }
            else{
                setMessage(data.message);  
                setSuccess(false)
            }

        } catch (error) {
            setMessage("Error Connecting to Server" + error)
        }
    }

    return(
        <>
            <div className={styles.body}>
                <form className={styles.Login} onSubmit={api}>
                <label className={styles.label} htmlFor="Username">
                    <h1>Choose Username</h1>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Enter a Username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>

                <label className={styles.label} htmlFor="Password">
                    <h1>Choose Password</h1>
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Enter a Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <button type="submit" className={styles.submit}>Sign In</button>

                <div style={{ textAlign: "center", color: "#ccc", marginTop: "1rem" }}>
                    {message}
                </div>
                </form>

                {success && (
                <button className={styles.signin} onClick={() => navigate("/")}>
                    Log In here!
                </button>
                )}
            </div>
         </>
    )
}

export default SignIn