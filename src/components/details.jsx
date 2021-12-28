import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

class Details extends React.Component {
    constructor(props) {
        super(props);

        // console.log("props : ");
        // console.log(this.props.details);

        this.state = { details: this.props.details };
        // this.state.totalDurationString = props.totalDurationString ? props.totalDurationString : "N/A" ;
        // this.state.totalDuration = props.totalDuration ? props.totalDuration : "N/A";
        // this.state.playlistID = props.playlistID ? props.playlistID : "N/A";
        // this.state.countTotalVid = props.countTotalVid ? props.countTotalVid : "N/A";
        // this.state.countPublicVid = props.countPublicVid ? props.countPublicVid : "N/A";
    }

    render() {
        return (
            <React.Fragment>
                <div className="container p-1">
                    <div>
                        Total duration of playlist :
                        <div>
                            <strong>
                                {this.state.details.totalDurationString}
                            </strong>
                        </div>
                    </div>

                    <br></br>
                    <div>
                        Total No. of videos :{" "}
                        <strong>{this.state.details.countTotalVid}</strong>
                    </div>
                    <div>
                        Total No. of Public videos :{" "}
                        <strong>{this.state.details.countPublicVid}</strong>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Details;
