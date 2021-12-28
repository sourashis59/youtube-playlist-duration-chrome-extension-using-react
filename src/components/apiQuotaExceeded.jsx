import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

class APIQuotaExceeded extends React.Component {
    render() {
        return (
            <div
                className="
                        container
                        alignItemsCenter
                        redText
                        p-3
                    "
            >
                <strong>YouTube API key's quota exceeded for today 😐 </strong>
            </div>
        );
    }
}

export default APIQuotaExceeded;
