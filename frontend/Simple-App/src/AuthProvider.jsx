import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser ] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3000/auth/me", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user); // Store user globally
                }
            })
            .catch(err => console.error("Error fetching user:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useAuth() {
    return useContext(UserContext);
}