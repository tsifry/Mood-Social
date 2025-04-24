import React, { useState } from "react";

function ReportInput({ postId }){

    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/posts/report`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ postId, message }),
            });
            const data = await response.json();
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || "Failed to report the post.");
                console.log(data.message);
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while reporting the post.");
        }
    };

    return (
        <div className="report-input">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your report message"
                    required
                    maxLength={200}
                    minLength={5}
                ></textarea>
                <button type="submit">Report</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">Post reported successfully!</p>}
        </div>
    );
}

export default ReportInput;