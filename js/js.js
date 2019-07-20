// The Indexing functionality is yet to be added


var key = "" // Your API Key here
var url = '';

$(document).ready(function () {

    // Convert the query into URL 
    $('#query_button').on("click", function () {
        let query = $('#query').val();

        if (!(query == '')) {
            query = query.replace(/ /g, '+'); // replaces all spaces with '+'
            generate_url(query);

            // API Call: gets query search results
            loadJSON(url, function (response) {
                let info = JSON.parse(response);

                // check if there are no search results
                if (info.pageInfo.totalResults == 0) {
                    buildNoResultUI();
                }
                else {
                    for (var i = 0; i < info.pageInfo.resultsPerPage; i++) {
                        let videoId = info.items[i].id.videoId;
                        let url = "https://www.youtube.com/watch?v=" + videoId;
                        let title = info.items[i].snippet.title;
                        let thumbnail = info.items[i].snippet.thumbnails.high.url;
                        let channelTitle = info.items[i].snippet.channelTitle;
                        let videoStatsUrl = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + videoId + '&key=' + key;
                        var highestIndex = 0, lowestIndex = 0;

                        // API Call: gets Statistics about a perticular video
                        loadJSON(videoStatsUrl, function (response) {
                            let videoStats = response;
                            videoStats = JSON.parse(videoStats);

                            let likes = videoStats.items[0].statistics.likeCount || 1;
                            let dislikes = videoStats.items[0].statistics.dislikeCount || 1;
                            let views = videoStats.items[0].statistics.viewCount || 1;

                            rel_index = (likes * views) / dislikes;
                            if (rel_index > highestIndex)
                                highestIndex = rel_index;
                            if (rel_index < lowestIndex)
                                lowestIndex = rel_index;


                            buildUIwith(url, title, thumbnail, channelTitle, videoStats);
                        });
                    }

                }
            });
        }
    });


    // Submit the query on "Enter"
    $("#query").keyup(function (event) {
        if (event.keyCode === 13 && ($(this).val() != '')) {
            $('.top-wrap .header').removeClass('bounce');
            $('.top-wrap').addClass('searched');
            $("#query_button").click();
        }
    });


    // Theme changer
    var changed = false;
    $('.change_theme').on('click', function () {
        let root = document.documentElement;
        if (!changed) {
            root.style.setProperty('--background-color', '#FFF');
            root.style.setProperty('--tile-background', '#efefef');
            changed = true;
        } else {
            root.style.setProperty('--background-color', '#100e17');
            root.style.setProperty('--tile-background', '#100c1f');
            changed = false;
        }
    })
});

// Generate the url with the search query entered by user
function generate_url(query) {
    url = "https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&maxResults=20&q=" + query + "&type=video&videoDefinition=high&key=" + key;
    console.log(url);
}

// Builds the UI Elements with the results fetched
function buildUIwith(url, title, thumbnail, channelTitle, videoStats) {
    let list = document.getElementById("video_list");
    tile = '<li class="tile"> \
                <a href="' + url + '" style="background-image: url(' + thumbnail + ');" target="_blank"> \
                </a> \
                    <a class="info" href="' + url + '" target="_blank"> \
                    <p class="title">' + title + ' </p> \
                </a> \
                <p class="info channelTitle">' + channelTitle + '</p> \
                <p class="info likes">' + videoStats.items[0].statistics.viewCount + '&nbsp ' + videoStats.items[0].statistics.likeCount + '&nbsp' + videoStats.items[0].statistics.dislikeCount + '</p> \
                <div class="rel_wrapper"><p class="rel_index"> Relevance Index <br/><span>20</span></p></div> \
            </li>';

    list.innerHTML += tile;
}


// No results found
function buildNoResultUI() {

}


// Load the JSON file
function loadJSON(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // False for synchronouse request
    xmlHttp.send(null);
}



// Change the theme