import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {

    const [user, setUser ] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/auth/me", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user); // Store user globally
                }
            })
            .catch(err => console.error("Error fetching user:", err));
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}