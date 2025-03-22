import { useState } from "react";

function Account() {

    const [formData, setFormData] = useState({ song: "", quote: "" });
    const [submittedData, setSubmittedData] = useState(null);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})   
    }

    const handleKey = (e) => {
        if (e.key === "Enter") {
            setSubmittedData({ ...formData, song: extractSoundCloud(formData.song) });
        }
    }

    const extractSoundCloud = (input) => {
        const regex = /https?:\/\/(?:w\.|)soundcloud\.com\/[^\s"]+/;
        const match = input.match(regex);
        return match ? match[0] : null
    };

    return (
        <div>
            <div>
                <h2>Song of the day:</h2>

                <div> {!submittedData?.song && 
                    (<input type="text"
                        value={formData.song}
                        name="song"
                        onChange={handleChange}
                        onKeyDown={handleKey}>
                        </input>)}
                </div>

                <div>{submittedData?.song && (<iframe
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(submittedData.song)}`}
                />)}</div>

            </div>

            <div>
                <h2>Quote of the day:</h2>
                
                <div>{!submittedData?.quote && 
                    (<input type="text"
                        value={formData.quote}
                        name="quote"
                        onChange={handleChange}
                        onKeyDown={handleKey}>
                    </input> )} 
                </div>
                <div>{submittedData && submittedData.quote}</div>
            </div>
        </div>
    );
}

export default Account;