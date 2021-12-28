import React, { Component } from "react";
import regeneratorRuntime from "regenerator-runtime"; //for async functions in .jsx (dunno why needed)

import InvalidURl from "./invalidURL.jsx";
import PlaylistDetail from "./playlistDetail.jsx";
import FetchingDetails from "./fetchingDetails.jsx";
import APIQuotaExceeded from "./apiQuotaExceeded.jsx";
import Details from "./details.jsx";

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = { details: { status: "fetchingDetails", data: null } };
    }

    componentDidMount() {
        getDuration()
            .then((response) => {
                this.setState({
                    details: { status: response.status, data: response.data },
                });

                console.log("from componentDidMount : response = ");
                console.log(response);
            })
            .catch((error) => {
                console.log("Error from componentDidMount : ");
                console.error(error);

                this.setState({});
            });
    }

    render() {
        // return <FetchingDetails />;
        // return <InvalidURl />;

        if (this.state.details.status === "fetchingDetails") {
            return <FetchingDetails />;
        } else if (
            this.state.details.status === "done" ||
            this.state.details.status === "alreadyComputed"
        ) {
            const details = this.state.details.data;

            return <Details details={details} />;
        } else if (this.state.details.status === "notValidYouTubePlaylistURL") {
            return <InvalidURl />;
        } else if (this.state.details.status === "quotaExceeded") {
            return <APIQuotaExceeded />;
        }
    }
}

//*DESCRIPTION:___________________________________________________________________________

//*returns an object ({status , data})

//*status : "done"   => means total duration of the playlist had been calculated through youtube API calls , and data is sent which is ({countPublicVid, countTotalVid , playlistID, totalDuration, totalDurationString})

//*status :  "alreadyComputed"    => means total duration ofor this URL had already been calculated previously,  so previous stored "data" is sent which is ({countPublicVid, countTotalVid , playlistID, totalDuration, totalDurationString})

//*status : "notValidYouTubePlaylistURL"   => means the current tab's URL is not a valid  youtube playlist URL

//*status : "quotaExceeded"   => means the current API key's quota for today has exceeded

//*data contains {countPublicVid, countTotalVid, playlistID, totalDuration, totalDurationString}

async function getDuration() {
    return new Promise((resolve, reject) => {
        //*send message to content script asking for the total duration of the current youtube playlist
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                // console.log("sending request from main.jsx ");

                if (tabs[0]) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        "sendDurationPlz:)",

                        function (response) {
                            // console.log("main.jsx : response recieved");

                            //*at homepage the extension was showing chrome.runtime.lastError , but this error cant be caught . so added this corner case
                            if (chrome.runtime.lastError) {
                                // console.log("chrome.runtime.lastError : ");
                                // console.log(chrome.runtime.lastError);

                                // displayInvalidURL();
                                resolve({
                                    status: "notValidYouTubePlaylistURL",
                                });
                            }

                            //*now i know the current tab is not homemade
                            // console.log(
                            //     "main.jsx : getDuration() : response : "
                            // );
                            // console.log(response);

                            resolve(response);
                        }
                    );
                }
            }
        );
    });
}

export default Main;
