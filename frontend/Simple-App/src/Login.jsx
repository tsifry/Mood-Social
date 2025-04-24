import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider";
import styles from "./css/Login.module.css";

function Login(){

    const [username, setUserame] = useState()
    const [password, setPassword] = useState()
    
    const [message, setMessage] = useState("")
    const navigate = useNavigate();

    const { setUser } = useAuth();


    //login
    const login = async (e) => {
        e.preventDefault();

        try {
                const response = await fetch("http://localhost:3000/auth/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({ username, password }) 
                });

                const data = await response.json();

                if(data.success){
                    const userRes = await fetch("http://localhost:3000/auth/me", {credentials: "include"})
                    const userData = await userRes.json();

                    setUser(userData.user)

                    navigate('/');
                }
                else{
                    setMessage(data.message);  
                }

        } catch (error) {
            setMessage("Error Connecting to Server")
            console.log(error)
        }
    };

    return(
        <>
            <div className={styles.body}>

                <form onSubmit={login} className={styles.Login}>
                    <label htmlFor="Username" className={styles.label}>
                        <input 
                            type="text" 
                            placeholder="Username" 
                            required
                            className={styles.input}
                            value={username}
                            maxLength={20}
                            minLength={3}
                            onChange={(e) => {setUserame(e.target.value)}}></input>
                    </label>

                    <label htmlFor="Password" className={styles.label}>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required
                            className={styles.input}
                            value={password}
                            maxLength={64}
                            minLength={0}
                            onChange={(e) => {setPassword(e.target.value)}}></input>
                    </label>

                    <div className={styles.buttonRow}>
                        <button type="submit" className={styles.submit}>Log In</button>
                    </div>

                    <button onClick={() => navigate("/SignIn")} className={styles.signin}>
                            Don’t have an account? Sign in
                    </button>
                </form>

                <h3>{message}</h3>
            </div>
        </>
    )
}

export default Login