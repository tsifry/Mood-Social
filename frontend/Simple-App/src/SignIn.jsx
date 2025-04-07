import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

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
            <div className="Form-SignIn">

                <form onSubmit={api}>
                    <label htmlFor="Username">
                        <h1>Choose Username</h1>
                        <input 
                            type="text" 
                            placeholder="Enter a Username" 
                            required
                            value={username}
                            onChange={(e) => {setUsername(e.target.value)}}></input>
                    </label>

                    <label htmlFor="Password">
                        <h1>Choose Password</h1>
                        <input 
                            type="password" 
                            placeholder="Enter a Password" 
                            required
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}></input>
                    </label>

                    <button type="submit"> Sign In </button>
                    <div>
                        {message}
                    </div>

                </form>

                <div>{success && (<button onClick={() => navigate("/")}>Log In here!</button>)}</div>

            </div>
        </>
    )
}

export default SignIn