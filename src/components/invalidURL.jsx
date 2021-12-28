import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

class InvalidURL extends React.Component {
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
                <strong>Not a valid YouTube Playlist 😐 </strong>
            </div>
        );
    }
}

export default InvalidURL;
