import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

class FetchingDetails extends React.Component {
    render() {
        return (
            <div
                className="
                        container alignItemsCenter p-3 fetchingSpinner
                    "
            >
                <strong>Fetching Details ... </strong>
                <span className="spinner-border text-info " role="status">
                    <span className="visually-hidden ">Loading...</span>
                </span>
            </div>
        );
    }
}

export default FetchingDetails;
