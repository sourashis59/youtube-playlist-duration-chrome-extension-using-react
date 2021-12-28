import React from "react";
import { render } from "react-dom";

import "bootstrap/dist/css/bootstrap.css";

import "./styles/popup.css";
import "./styles/spinner.css";
import "./styles/border.css";
// import "./styles/style.css";

import Main from "./components/main.jsx";

class Popup extends React.Component {
    render() {
        console.log("hello popup.jsx");

        return <Main />;

        return (
            <React.Fragment>
                <div className="container p-2 rainbow-border ">
                    <div
                        className="container whiteText  "
                        id="playlistDetailContainer"
                    >
                        <div
                            className="container  resultContainer alignItemsCenter hidden"
                            id="fetchingDetails"
                        >
                            <div className="container fetchingSpinner">
                                <span className="" id="fetchingText">
                                    Fetching details{" "}
                                </span>
                                <div className="loader"></div>
                            </div>

                            {/* <img src="media/reload-cat.gif" alt="" id="loadingImage"></img> */}
                        </div>

                        <div
                            className="container resultContainer  "
                            id="playlistDetail"
                        >
                            <div>
                                Total duration of playlist :
                                <div>
                                    <strong id="playlistDuration"></strong>
                                </div>
                            </div>

                            <br></br>
                            <div>
                                Total No. of videos :{" "}
                                <strong id="totalVideCount"></strong>
                            </div>
                            <div>
                                Total No. of Public videos :{" "}
                                <strong id="publicVideoCount"></strong>
                            </div>
                        </div>

                        <div
                            className="container  resultContainer alignItemsCenter hidden redText"
                            id="invalidURL"
                        >
                            <strong>
                                <p className="">
                                    Not a valid YouTube Playlist 😐
                                </p>
                            </strong>
                        </div>

                        <div
                            className="container  resultContainer redText hidden "
                            id="apiKeyQuotaExceeded"
                        >
                            <strong>
                                <p className="">
                                    YouTube API Key's Quota for today Exceeded ,
                                    please try again after 12am :😐
                                </p>
                            </strong>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

render(<Popup />, document.getElementById("react-target"));
