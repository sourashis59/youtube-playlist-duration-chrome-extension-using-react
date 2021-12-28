import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

class PlaylistDetail extends React.Component {
    state = {
        totalDuration: this.props.value.totalDuration,
        totalDurationString: this.props.value.totalDurationString,
    };

    render() {
        return (
            <React.Fragment>
                <div>
                    Total duration of playlist :
                    <div>
                        <strong>{this.state.totalDurationString}</strong>
                    </div>
                </div>

                <br></br>
                <div>
                    Total No. of videos : <strong></strong>
                </div>
                <div>
                    Total No. of Public videos : <strong></strong>
                </div>
            </React.Fragment>
        );
    }
}

export default PlaylistDetail;
