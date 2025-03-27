import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login(){

    const [username, setUserame] = useState()
    const [password, setPassword] = useState()
    
    const [message, setMessage] = useState("")
    const navigate = useNavigate();

    const api = async (e) => {
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
            <div className="Form-login">

                <form onSubmit={api}>
                    <label htmlFor="Username">
                        <h1>Username</h1>
                        <input 
                            type="text" 
                            placeholder="Enter a Username" 
                            required
                            value={username}
                            onChange={(e) => {setUserame(e.target.value)}}></input>
                    </label>

                    <label htmlFor="Password">
                        <h1>Password</h1>
                        <input 
                            type="password" 
                            placeholder="Enter a Password" 
                            required
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}></input>
                    </label>

                    <button type="submit"> Log In </button>
                </form>

                <h3>{message}</h3>

                <div>
                    <button onClick={() => navigate("/SignIn")}>Dont have an account? Sign in Here!</button>
                </div>

            </div>
        </>
    )
}

export default Login