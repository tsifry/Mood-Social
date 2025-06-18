import { useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { useNavigate, useLocation } from "react-router-dom";


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
               ></input>

        {results.length > 0 && (
        <ul>
            {results.map((result) => (
                <li onClick={() => handleSelectUser(result.username)}
                ><img src={`http://localhost:3000/${result.profile_image}`}></img>{result.username}</li>
            ))}
        </ul>)}
    
    </>);
}

export default SearchBar