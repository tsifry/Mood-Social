import { useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./css/Sidebar.module.css";


function SearchBar (){

    const navigate = useNavigate();
    const location = useLocation();

    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        setSearch("")
    },[location]);

    const fetchUsers = async (search) => {
        if (!search.trim()) return setResults([]);

        try {
            const response = await fetch(`http://localhost:3000/search?query=${search}`);
            const data = await response.json();
            setResults(data);
        } catch (error){
            console.log("Error fetching users " + error)
        }

    };

    const debouncedFetch =  useCallback(debounce(fetchUsers, 300), []);

    useEffect(() => {
        if (search) debouncedFetch(search);
    }, [search, debouncedFetch]);

    const handleChange = (e) =>{
        const value = e.target.value;
        setSearch(value);
        debouncedFetch(value);
    }

    const handleSelectUser = (user) => {
        setSearch('');
        setResults([]);
        navigate(`/${user}`);
    } 

    return(
    <>
    
        <input onChange={handleChange}
               placeholder="User..."
               value={search}
               className={styles.searchInput}></input>

        {results.length > 0 && (
        <ul className={styles.searchUl}>
            {results.map((result) => (
                <li onClick={() => handleSelectUser(result.username)}
                    className={styles.searchLi}><img src={`http://localhost:3000/${result.profile_image}`} className={styles.search_image}></img>{result.username}</li>
            ))}
        </ul>)}
    
    </>);
}

export default SearchBar