"use strict";

//*async function was creating "Error in event handler: ReferenceError: regeneratorRuntime is not defined" problem donno why, importing this shit fixed the problem donno why :)
import regeneratorRuntime from "regenerator-runtime";

console.log(
    '"Your browser has been hacked!!" - content.js of YouTube Playlist Duration Extension :)'
);

let myAPIKey = `AIzaSyAINYkozxfcG-0S5CfhSob0Tuw_coi_U9I`;
let currURL;
let currDurationObject;

//*______________________HELPER FUNCTIONS_______________________________________________________________________________________

//*get a duration object {years, months, weeks, days , hours , minuts, seconds} from ISO 8601 duration
function parseISO8601Duration(iso8601Duration) {
    const iso8601DurationRegex =
        /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;
    const matches = iso8601Duration.match(iso8601DurationRegex);

    return {
        sign: matches[1] === undefined ? "+" : "-",
        years: matches[2] === undefined ? 0 : Number(matches[2]),
        months: matches[3] === undefined ? 0 : Number(matches[3]),
        weeks: matches[4] === undefined ? 0 : Number(matches[4]),
        days: matches[5] === undefined ? 0 : Number(matches[5]),
        hours: matches[6] === undefined ? 0 : Number(matches[6]),
        minutes: matches[7] === undefined ? 0 : Number(matches[7]),
        seconds: matches[8] === undefined ? 0 : Number(matches[8]),
    };
}

//*adds two durations and returns the result
function addDurations(duration1, duration2) {
    let totalYears = 0,
        totalMonths = 0,
        totalWeeks = 0,
        totalDays = 0,
        totalHours = 0,
        totalMinutes = 0,
        totalSeconds = 0;

    totalSeconds += (duration1.seconds + duration2.seconds) % 60;
    totalMinutes += Math.floor((duration1.seconds + duration2.seconds) / 60);

    totalMinutes += (duration1.minutes + duration2.minutes) % 60;
    totalHours += Math.floor((duration1.minutes + duration2.minutes) / 60);

    totalHours += (duration1.hours + duration2.hours) % 24;
    totalDays += Math.floor((duration1.hours + duration2.hours) / 24);

    totalDays += (duration1.days + duration2.days) % 7;
    totalWeeks += Math.floor((duration1.weeks + duration2.weeks) / 7);

    totalWeeks += duration1.weeks + duration2.weeks;
    totalMonths += duration1.months + duration2.months;
    if (totalDays > 30) {
        totalWeeks = Math.floor((totalDays - 30) / 7);
        totalMonths += 1;
    }

    totalYears += duration1.years + duration2.years;
    if (totalMonths > 12) {
        totalYears++;
        totalMonths = totalMonths - 12;
    }

    return {
        years: totalYears,
        months: totalMonths,
        weeks: totalWeeks,
        days: totalDays,
        hours: totalHours,
        minutes: totalMinutes,
        seconds: totalSeconds,
    };
}

//*check if the given url is valid youtube url or not
function isYoutTubeURLValid(url) {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com(?:\S+)?$/;
    if (url.match(regExp) && url.match(regExp).length > 0) return true;
    else return false;
}

//*get playlist id from youtube playlist url
function getPlaylistIDFromYouTubeURL(url) {
    // const reg = new RegExp("[&?]list=([a-z0-9_]+)", "i");
    const reg = new RegExp("[&?]list=([a-z0-9_-]+)", "i");

    const match = reg.exec(url);

    if (match && match[1].length > 0 && isYoutTubeURLValid(url)) {
        return match[1];
    } else {
        return null;
    }
}

//*returns json (promise) after fetching
async function fetchJSON(url, errorMessage = "responseNotOk") {
    return fetch(url).then((response) => {
        // console.log("response : ");
        // console.log(response);

        // console.log(response);

        if (response.ok) return response.json();
        else {
            if (response.status === 403) {
                // console.log(`API key quota exceeded for key No : ${currAPIKeyIndex}`);
                throw new Error("quotaExceeded");
            } else {
                throw new Error(errorMessage);
            }
        }
    });
}

//*returns playlistContentDetails (promise) of pageToken(if not null) from playlist id
async function getPlaylistContentDetailsFromPlaylistID(
    playlistID,
    pageToken = null
) {
    let url;
    if (!pageToken)
        url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistID}&key=${myAPIKey}`;
    else
        url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&pageToken=${pageToken}&playlistId=${playlistID}&key=${myAPIKey}`;

    try {
        const data = await fetchJSON(url);
        return data;
    } catch (error) {
        throw error;
    }
}

//*returns videoContentDetails (promise) from videoID
async function getVideoContentDetailsFromVideoID(videoID) {
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoID}&key=${myAPIKey}`;

    try {
        const data = await fetchJSON(url);
        return data;
    } catch (error) {
        throw error;
    }
}

function durationObjectToString(duration) {
    // debugger;
    let totalDuration = duration;

    let text = "";
    if (totalDuration.years) text += `, ${totalDuration.years} years`;
    if (totalDuration.months) text += `, ${totalDuration.months} months`;
    // if (totalDuration.weeks) text += `, ${totalDuration.weeks} weeks`;
    if (totalDuration.days) text += `, ${totalDuration.days} days`;
    if (totalDuration.hours) text += `, ${totalDuration.hours} hours`;
    if (totalDuration.minutes) text += `, ${totalDuration.minutes} minutes`;
    text += `, ${totalDuration.seconds} seconds`;
    //remove " ," from start
    text = text.substring(2);

    return text;
}
//
//
//

//
//
//
//
///
//
//
//______________________          :)    ______________________________________________
//

//*returns an object {totalDuration, countTotalVid, countPublicVid} from valid youtube playlist ID

async function getTotalDurationFromPlaylistID(playlistID) {
    // debugger;

    if (!playlistID) {
        console.log("Not a valid youtube playlist ID  :)");
        throw new Error("invalidPlaylistID");
    }

    let countTotalVid = 0;
    let countPublicVid = 0;

    let totalDuration = {
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    //*Youtube API sends data as a form of pages, with max 50 results per page, and also the nextPageToken is sent with the current page, so we have to traverse through all the pages to get all results

    let fetchingFirstPage = true;
    let currPageToken = null;

    while (fetchingFirstPage || currPageToken) {
        fetchingFirstPage = false;

        try {
            const playlistContentDetail =
                await getPlaylistContentDetailsFromPlaylistID(
                    playlistID,
                    currPageToken
                );

            //get all video content details (promisees) of this page
            let promisesArr = [];
            for (let i = 0; i < playlistContentDetail.items.length; i++) {
                const videoID =
                    playlistContentDetail.items[i].contentDetails.videoId;
                // console.log(videoID);

                promisesArr.push(getVideoContentDetailsFromVideoID(videoID));
            }

            try {
                //when every promises has been resolved, sum up the durations
                const videoDatas = await Promise.all(promisesArr);
                for (let i = 0; i < videoDatas.length; i++) {
                    countTotalVid++;

                    //*if the video is private , then it wont have any items
                    if (videoDatas[i].items.length) {
                        countPublicVid++;

                        let currDuration = parseISO8601Duration(
                            videoDatas[i].items[0].contentDetails.duration
                        );

                        totalDuration = addDurations(
                            totalDuration,
                            currDuration
                        );
                    }
                }
            } catch (error) {
                // console.error("ERROR in fetching video contentDetails : " + error);
                throw error;
            }

            //*IMPORTANT : Go to next page____________________________________________________
            currPageToken = playlistContentDetail.nextPageToken;
            //*____________________________________________________________________
            //*____________________________________________________________________
            //*____________________________________________________________________
        } catch (error) {
            console.error(
                "ERROR in fetching playlist page contentDetails: " + error
            );
            throw error;
        }
    }

    return {
        totalDuration: totalDuration,
        countTotalVid: countTotalVid,
        countPublicVid: countPublicVid,
    };
}

async function getPlaylistDurationFromURL(URL) {
    // console.log("inside getPlaylistDurationFromURL");

    //remove spaces from start and end
    URL = URL.trim();

    if (!isYoutTubeURLValid(URL)) {
        // console.log("Error in getPlaylistDuration() : Not an YouTube URL");
        console.error("Error in getPlaylistDuration() : Not an YouTube URL :)");
        // console.log(new Error("invalidURL").message);
        throw new Error("invalidURL");
    }

    const playlistID = getPlaylistIDFromYouTubeURL(URL);
    console.log("playlist ID " + playlistID);

    try {
        const { totalDuration, countTotalVid, countPublicVid } =
            await getTotalDurationFromPlaylistID(playlistID);

        console.log("From Content Script : Total Duration Object : ");
        console.log(totalDuration);

        // const totalDurationString = durationObjectToString(totalDuration);
        // console.log("total duration : " + totalDurationString);
        // console.log("Total videos : " + countTotalVid);
        // console.log(`Total Public videos : ${countPublicVid}`);

        return { playlistID, totalDuration, countTotalVid, countPublicVid };
    } catch (error) {
        console.error("ERROR in getPlaylistDuration(): " + error);

        throw error;
    }
}
//
//

//
//
//
//

//
//
//
//
//
//
//
//
//
//
//
//
//
//

//*DESCRIPTION:___________________________________________________________________________

//*When the popup script sends message (request === "sendDurationPlz:)") asking for total duration of the current tab, this event is fired
//*the callback function returns an object ({status , data})

//*status : "done"   => means total duration of the playlist had been calculated through youtube API calls , and data is sent which is ({countPublicVid, countTotalVid , playlistID, totalDuration, totalDurationString})

//*status :  "alreadyComputed"    => means total duration ofor this URL had already been calculated previously,  so previous stored "data" is sent which is ({countPublicVid, countTotalVid , playlistID, totalDuration, totalDurationString})

//*status : "notValidYouTubePlaylistURL"   => means the current tab's URL is not a valid  youtube playlist URL

//*status : "quotaExceeded"   => means the current API key's quota for today has exceeded

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log("Message recieved in content script");

    //*if message is sent from extension, not from any tab
    if (!sender.tab) {
        // console.log("message from extension  : " + request);

        let messageToBeSent = { status: "none" };

        if (request === "sendDurationPlz:)") {
            let currTabURL = location.href;
            console.log("currTabURL in content script : " + currTabURL);

            if (!currTabURL || !isYoutTubeURLValid(currTabURL)) {
                console.log("NOT an YouTube URL");
                messageToBeSent = { status: "notValidYouTubePlaylistURL" };

                sendResponse(messageToBeSent);
                return;
            } else if (currTabURL && currTabURL === currURL) {
                console.log("Already computed duration for this URL   :)");
                messageToBeSent = {
                    status: "alreadyComputed",
                    data: currDurationObject,
                };

                sendResponse(messageToBeSent);
                return;
            }
            //* else : Display playlist Duration
            else {
                currURL = currTabURL;

                //*await inside try catch was not working , but .then.catch worked dunno why :) , so using .then.catch ezz

                getPlaylistDurationFromURL(currURL)
                    .then(function (data) {
                        currDurationObject = data;
                        currDurationObject["totalDurationString"] =
                            durationObjectToString(
                                currDurationObject.totalDuration
                            );

                        messageToBeSent = {
                            status: "done",
                            data: currDurationObject,
                        };

                        sendResponse(messageToBeSent);
                    })
                    .catch(function (error) {
                        console.error("ERROR in updateResult(): " + error);
                        if (error.message === "quotaExceeded") {
                            console.log("API key's quota exceeded");

                            messageToBeSent = { status: "quotaExceeded" };
                            sendResponse(messageToBeSent);
                            return;
                        } else if (error.message === "invalidURL") {
                            messageToBeSent = {
                                status: "notValidYouTubePlaylistURL",
                            };
                            sendResponse(messageToBeSent);
                            return;
                        } else {
                            console.log("something worng , Error : ");
                            console.error(error);
                            messageToBeSent = {
                                status: "notValidYouTubePlaylistURL",
                            };
                            sendResponse(messageToBeSent);
                            return;
                        }
                    });
            }
        }
    }

    return true;
});
