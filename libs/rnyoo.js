var adapter = {};

function humanizedDateString(utcSeconds) {
    var date = new Date(utcSeconds);
    var isoDate = date.toISOString();
    var humanizedTime = moment(isoDate).fromNow();
    return humanizedTime;
}
// plugin call for change text into hyper link(using in hotspot - dialogbox - media - hotspot description )

function rnyooDataBind(adapter) {

    // if ("reportReview" in adapter) {
    //     $("#non-visible").hide();
    //     $("#report-container").show();
    // }

    var createdAt = adapter.createdAt_l;
    var lastUpdatedAt = adapter.lastUpdatedAt_l;
    var postId = adapter.rpostid_s;

    if (Object.keys(adapter.pod.hotspots).length === 1) {
        $('#showhotspots').hide();
    } else {
        $('#showhotspots').show();
    }
    if (createdAt == undefined) {
        return true;
    }
    var pod_createdat = adapter.hasOwnProperty('createdAt_l');
    var humanizedCreatedAt = humanizedDateString(createdAt);
    var humanizedUpdatedAt = humanizedDateString(lastUpdatedAt);

    $("#postCreatedAt").html(humanizedCreatedAt);
    $("#postUpdatedAt").html(" (Updated " + humanizedUpdatedAt + " )");
    if (adapter.postTtl) {
        var ttl = adapter.postTtl;
        var humanizedTtl = humanizedDateString(ttl);
        $("#postTtl").html(humanizedTtl);
    }
    if (adapter.channel_s != null && adapter.channel_s != "") {
        var channelArray = [];
        channelArray = (adapter.channel_s).split(',').map(function(item) {
            return item.trim();
        });
        var channels = '';
        for (var i = 0; i < channelArray.length; i++) {
            var acturl = '<a href="/search?in=channels&q=' + channelArray[i] + '" class="rny-btn">' + channelArray[i] + '</a>';
            var decodeurl = decodeURIComponent(acturl).replace("%27", /'/g);
            channels = channels + decodeurl;
        }
        $("#channels").html(channels);
    } else {
        $("#channels").html('');
    }

    var autolinker = new Autolinker();

    $('#pod_image').attr('src', adapter.pod.podImage.jpgUrl);
    //imgNotes() is plugin for hotspots

    var $img = $("#pod_image").imgNotes();
    $img.one("load", function() {
        // original image width and height
        var height_img = $(this).prop("naturalHeight");
        var width_img = $(this).prop("naturalWidth");

        // if image width is less than 400px, alert message
        if (width_img <= "400") {
            var $elmImg = $("<div class='image-alert'>This image is small and its original dimensions are retained for viewing.</div>");
            $(".rny-fullviewimg-container").prepend($elmImg);
            setTimeout(function() {
                $elmImg.fadeOut(500);
            }, 3000);
        }
        var hotspotObj = [];
        var hotspots = adapter.pod.hotspots;
        var addedHotspots = adapter.changeLog.added;
        var updatedHotspots = adapter.changeLog.changed;
        var updatedHotspotIds = [];
        for (var h in updatedHotspots) {
            if (updatedHotspots[h][0] === "hotspots") {
                updatedHotspotIds.push(updatedHotspots[h][1]);
            }
        }
        // console.log(updatedHotspotIds);
        for (var hotspot in hotspots) {
            var temp = {};
            temp['note'] = "";
            if (hotspots[hotspot].location.x == 0 && hotspots[hotspot].location.y == 0) {
                continue;
                $("#nohotspots").show();
            }
            temp["x"] = ((hotspots[hotspot].location.x + 30) / width_img);
            temp["y"] = ((hotspots[hotspot].location.y + 30) / height_img);
            if (hotspots[hotspot].media.audio.length === 0 &&
                hotspots[hotspot].media.images.length === 0 &&
                hotspots[hotspot].media.docs.length === 0 &&
                hotspots[hotspot].media.video.length === 0 &&
                hotspots[hotspot].clickUrl.length === 0 &&
                hotspots[hotspot].hotspotDescription_ts === ""
            ) {
                temp["note"] = temp["note"] + '<div class="hs-no-data">There is no data for this hotspot</div>';
            }
            if (hotspots[hotspot].hotspotDescription_ts.length > 0) {
                temp["note"] = '<div class="rny-hp-desc">' + autolinker.link(hotspots[hotspot].hotspotDescription_ts) + '</div>';
            }
            if (hotspots[hotspot].media.audio.length > 0) {
                var audioStreamStatus = hotspots[hotspot].media.audio[0].stream_status;
                // console.log(audioStreamStatus);
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img data-streamUrl= "' + hotspots[hotspot].media.audio[0].streamfile + '" data-status = "' + audioStreamStatus + '" class="audioStream" src="/images/audio_icon.png")></a></span>';
            }
            if (hotspots[hotspot].media.images.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages">';
                temp["note"] = temp["note"] + '<a href="' + hotspots[hotspot].media.images[0].imageUrl + '" data-lightbox="rny-media-images" class="imgMedia"><img src="/images/image_icon.png"></a>';
                for (var i = 1; i < hotspots[hotspot].media.images.length; i++) {
                    temp["note"] = temp["note"] + '<a href="' + hotspots[hotspot].media.images[i].imageUrl + '" data-lightbox="rny-media-images" class="imgMedia">';
                }
                temp["note"] = temp["note"] + '</a></span>';
            }
            if (hotspots[hotspot].media.docs.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img src="/images/doc_icon.png"></a></span>';
            }
            if (hotspots[hotspot].media.video.length > 0) {
                var fallbackUrl = hotspots[hotspot].media.video[0].streamfile;
                var videoStreamStatus = hotspots[hotspot].media.video[0].stream_status;
                // console.log(videoStreamStatus);
                // console.log(hotspots[hotspot].media.video[0].videoUrl);
                var videoMimeType = "application/x-mpegurl";
                // Get Stream URL headers here
                $.ajax({
                    url: hotspots[hotspot].media.video[0].streamfile,
                    type: 'GET',
                    async: false,
                    error: function(data) {
                        // console.log("Failure");
                        fallbackUrl = hotspots[hotspot].media.video[0].videoUrl;
                        videoMimeType = 'video/mp4';
                    }
                });
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img data-mimetype="' + videoMimeType + '" data-streamUrl= "' + fallbackUrl + '" data-status="' + videoStreamStatus + '" class="videoStream" src="/images/video_icon.png"></a></span>';
            }
            if (hotspots[hotspot].clickUrl.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="' + hotspots[hotspot].clickUrl + '" target="_blank"><img src="/images/url_icon.png"></a></span>';
            }
            // $elem for define css properties of hot spot and changing the color of hot spot dynamically
            var addedIdx = addedHotspots.indexOf(hotspots[hotspot].hotspotId);
            var updatedIdx = updatedHotspotIds.indexOf(hotspots[hotspot].hotspotId);
            if (addedIdx != -1 || updatedIdx != -1) {
                $elem = $('<div style="display:none;" class="tooltipLabel" title="' + hotspots[hotspot].hotspotLabel_ts + '"></div>').css({
                    width: "25px",
                    "max-width": "100%",
                    height: "25px",
                    transition: "all 1s ease"
                }).append('<div class="revolve hs-animation" style="background:' + hotspots[hotspot].markerColor + '"></div><div class="hs-label">' + hotspots[hotspot].hotspotLabel_ts + '</div>');
                temp["hs_color"] = $elem;
            } else {
                $elem = $('<div style="display:none;" class="tooltipLabel" title="' + hotspots[hotspot].hotspotLabel_ts + '"></div>').css({
                    width: "25px",
                    height: "25px",
                    "max-width": "100%",
                    transition: "all 1s ease"
                }).append('<div class="pulse hs-animation" style="background:' + hotspots[hotspot].markerColor + '"></div><div class="hs-label">' + hotspots[hotspot].hotspotLabel_ts + '</div>');
                temp["hs_color"] = $elem;
            }
            hotspotObj.push(temp);
        }
        $img.imgNotes("import", hotspotObj);
    });

    var $hide = $("#hide");
    var $show = $("#show");
    $("#show").hide();
    $("#hide").hide();
    $hide.on("click", function() {
        $img.imgNotes('hide_show_hotspots');
        $(this).hide();
        $(this).siblings("#show").show();
    });

    $show.on("click", function() {
        $img.imgNotes('hide_show_hotspots');
        $(this).hide();
        $(this).siblings("#hide").show();
    });

    $("#showhotspots").on("click", function() {
        $img.imgNotes('hide_show_hotspots');
        $hide.show();
        $(this).hide();
    });
}

$(document).on("click", ".closeAudio", function() {
    videojs('rnyooAudio').dispose();
    $("#modalAudio").css({ display: "none" });
});

$(document).on("click", '.closeVideo', function(e) {
    videojs('rnyooVideo').dispose();
    $("#modalVideo").css({ display: "none" });
});

$(document).on("click", '.audioStream', function(e) {
    var audioSource = $(this).attr('data-streamUrl');
    var dataStuts = $(this).attr('data-status');
    // console.log(dataStuts);
    var audioTag = '<audio id="rnyooAudio" class="video-js" width="100%" height="100%" data-setup=\'{ "controls": true, "autoplay": false, "preload": "auto" , "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'><source src="' + audioSource + '" type="audio/mp4"></audio>';
    if (dataStuts == "queued") {
        console.log(dataStuts);
        var audioTag = '<audio id="rnyooAudio" class="video-js" width="100%" height="100%" data-setup=\'{ "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'></audio>';
        $('.modal-content1-audio').append(audioTag);
        console.log(dataStuts);
        videojs("rnyooAudio").errors({
            errors: {
                audioQueueError: {
                    headline: 'Hey There! This Audio seems to be in queue for conversion. Please recheck in sometime.'
                }
            }
        });
        videojs("rnyooAudio").error({ code: 'audioQueueError', dismiss: true });
    } else if (dataStuts == "failed") {
        console.log(dataStuts);
        var audioTag = '<audio id="rnyooAudio" class="video-js" controls preload="auto" width="100%" height="100%" data-setup=\'{ "controls": true, "autoplay": false, "preload": "auto" , "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'></audio>';
        $('.modal-content1-audio').append(audioTag);
        videojs("rnyooAudio").errors({
            errors: {
                audioFailedError: {
                    headline: 'This Audio has failed for conversion.Please contact the publisher.'
                }
            }
        });
        videojs("rnyooAudio").error({ code: 'audioFailedError', dismiss: true });
    } else if (dataStuts == "completed") {
        console.log(dataStuts);
        $('.modal-content1-audio').append(audioTag);
        videojs("rnyooAudio").play();
    }
    $("#modalAudio").css({ display: "block" });
});

$(document).on("click", '.videoStream', function(e) {
    var videoSource = $(this).attr('data-streamUrl');
    var videoMimeType = $(this).attr('data-mimeType');
    var dataStuts = $(this).attr('data-status');
    // console.log(dataStuts);
    var videoTag = '<video id="rnyooVideo" class="video-js" width="100%" height="100%" data-setup=\'{"controls":true, "autoplay": false, "preload": "auto" , "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'><source src="' + videoSource + '" type="' + videoMimeType + '"></video>';
    if (dataStuts == "queued") {
        console.log(dataStuts);
        var videoTag = '<video id="rnyooVideo" class="video-js" width="100%" height="100%" data-setup=\'{ "controls": true, "aspectRatio": "640:480", "poster": "/images/image-1.jpg"}\'></video>';
        $('.modal-content1').append(videoTag);
        // console.log(dataStuts);
        videojs("rnyooVideo").errors({
            errors: {
                videoQueueError: {
                    headline: 'Hey There! This video seems to be in queue for conversion. Please recheck in sometime.'
                }
            }
        });
        videojs("rnyooVideo").error({ code: 'videoQueueError', dismiss: true });
    } else if (dataStuts == "failed") {
        console.log(dataStuts);
        var fvideoTag = '<video id="rnyooVideo" class="video-js" width="100%" height="100%" data-setup=\'{ "controls": true, "aspectRatio": "640:480", "poster": "/images/image-1.jpg"}\'></video>';
        $('.modal-content1').append(videoTag);
        videojs("rnyooVideo").errors({
            errors: {
                videoFailedError: {
                    headline: 'This Video has failed for conversion.Please contact the publisher.'
                }
            }
        });
        videojs("rnyooVideo").error({ code: 'videoFailedError', dismiss: true });
    } else if (dataStuts == "completed") {
        console.log(dataStuts);
        $('.modal-content1').append(videoTag);
        videojs("rnyooVideo").play();
    }
    $("#modalVideo").css({ display: "block" });
});

function hashtagText(text) {
    var replacedText = text.replace(/#(\w+)/g, '<a href="search?in=keywords&q=$1" class="postinfo-hashtags">#$1</a>');
    return replacedText;
}

function channelText(textdata) {
    if (textdata === null || textdata === undefined || textdata === "") {
        return " ";
    }
    var channel_text = textdata.split(',').map(function(item) {
        return item.trim();
    });
    var load_channels = "";
    for (var i in channel_text) {
        var acturl = '<a href="/search?in=channels&q=\'' + channel_text[i] + '\'" class="rny-btn">' + channel_text[i] + '</a>';
        var decodeurl = decodeURIComponent(acturl).replace("%27", /'/g);
        load_channels = load_channels + decodeurl;
    }
    return load_channels;
}
window.page_offsetY = window.pageYOffset,
    $win = $(window);

function getmodalContent(currentData) {
    page_offsetY = window.pageYOffset; //scroll behind overlay
    $("body, html").css({
        "position": "fixed",
        "width": "100%",
        "height": "'100%",
        "top": -page_offsetY + "px"
    });
    $("#fullview_modal_container").show();
    $.ajax({
        get: 'POST',
        url: 'https://renyoo.co/post/ov/' + currentData + '',
        dataType: 'json',
        beforeSend: function(html) {
            $("#modal_loader").show();
        },
        success: function(data) {
            console.log(JSON.stringify(data.responseJson));
            isIos();
            var pod_content = "";
            var createdAt = data.responseJson.createdAt_l;
            var lastUpdatedAt = data.responseJson.lastUpdatedAt_l;
            var timevalue = data.responseJson.hasOwnProperty('postTtl');
            var postQuestion = data.responseJson.hasOwnProperty('postQuestionCount');
            var humanizedCreatedAt = humanizedDateString(createdAt);
            var humanizedUpdatedAt = humanizedDateString(lastUpdatedAt);
            var humanizedTtl;
            var updateLessThanCreate = humanizedCreatedAt == humanizedUpdatedAt ? "" : '<span class="rny-lightgrey rny-post-updatetime">(Updated ' + humanizedUpdatedAt + ')</span>';

            //modal content
            if (Object.keys(data.responseJson.pod.hotspots).length === 1) {
                pod_content = pod_content + '<div class="rny-zoomblock rny-mobileview-zoomblock" id="zoomb"><ul><li><a href="#" class="psotinfo_showhide">Post Info</a></li><li><button class="rny-mobileviewzoommbutton" id="normal_image"><span>N</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_out_button"><span> -</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_in_button"><span> +</span></button></li><li class="fullviewZwidth"><span class="mobile-post-img" id="hide"><img src="images/hide.png" alt="rny-image"> hide</span><span class="mobile-post-img" id="show"><img src="images/show.png" alt="rny-image">show</span></li><li><a href="/post/fv/' + data.responseJson.rpostid_s + '" target="_blank"><img src="images/fullview.png" alt="rny-image" id="rny_Embed" class="rny-embed-icon"></a></li></ul><span class="modal-close"><img src="images/cancel.png" alt="rny-image" id="fullview_close"></span></div><div class="rny-fullviewimg-container"><img class="img-responsive" id="pod_image" src="' + data.responseJson.pod.podImage.jpgUrl + '" alt="rny-image"><div class="fullview-postInfo" style="display:none;"><div class="rny-flex" style="min-height: 500px;">';
                // console.log("hotspots");
            } else {
                pod_content = pod_content + '<div class="rny-zoomblock rny-mobileview-zoomblock" id="zoomb"><ul><li><a href="#" class="psotinfo_showhide">Post Info</a></li><li><button class="rny-mobileviewzoommbutton" id="normal_image"><span>N</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_out_button"><span> -</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_in_button"><span> +</span></button></li><li class="fullviewZwidth"><span class="mobile-post-img" id="hide"><img src="images/hide.png" alt="rny-image"> hide</span><span class="mobile-post-img" id="show"><img src="images/show.png" alt="rny-image">show</span></li><li><a href="/post/fv/' + data.responseJson.rpostid_s + '" target="_blank"><img src="images/fullview.png" alt="rny-image" id="rny_Embed" class="rny-embed-icon"></a></li></ul><span class="modal-close"><img src="images/cancel.png" alt="rny-image" id="fullview_close"></span></div><div class="rny-fullviewimg-container"><span class="tap-to-view" id="showhotspots">CLICK TO VIEW</span><img class="img-responsive" id="pod_image" src="' + data.responseJson.pod.podImage.jpgUrl + '" alt="rny-image"><div class="fullview-postInfo" style="display:none;"><div class="rny-flex" style="min-height: 500px;">';
            }

            if (timevalue === false) {
                pod_content = pod_content + "";
            } else {
                humanizedTtl = humanizedDateString(data.responseJson.postTtl);
                pod_content = pod_content + '<div class="rny-header"><img src="images/icon_clock.png" alt="rny-image"><span> < ' + humanizedTtl + ' </span></div>';
            }

            pod_content = pod_content + '<div class="rny-publisher"><span class="rny-avatar"> <img src="' + data.responseJson.avatar + '" onError="this.onerror=null;this.src=\'https://rnyooassets.s3.amazonaws.com/avatars/default.png\';" alt="rny-image"> </span><span class="rny-pub-name"><a href="/users/' + data.responseJson.screenName_s + '">' + data.responseJson.screenName_s + '</a></span><br></div><div class="rny-post-description">' + hashtagText(data.responseJson.postDescription_ts) + '</div><div class="rny-post-timeDetails"><span class="rny-lightgrey">posted</span> <br><span class="rny-midgrey">' + humanizedCreatedAt + '</span>' + updateLessThanCreate + '</div><div class="rny-post-locationDetails">';
            if (data.responseJson.location_ts === null || data.responseJson.location_ts === "") {
                pod_content = pod_content + '</div>';
            } else {
                pod_content = pod_content + '<div class="rny-post-locationDetails"><span class="rny-lightgrey">picture taken at</span><br><span class="rny-midgrey">' + data.responseJson.location_ts + '</span></div>';
            }
            pod_content = pod_content + '<div class="rny-btn-flex">' + channelText(data.responseJson.channel_s) + '</div>';
            var comments = "";
            for (var i in data.responseJson.hotspotStats) {
                if (data.responseJson.hotspotStats === null || data.responseJson.hotspotStats === undefined) {
                    continue;
                }
                comments = comments + data.responseJson.hotspotStats[i].commentCount + " ";
            }
            if (comments === null || comments === "") {
                comments = 0;
            }
            if (data.responseJson.postLikeCount !== undefined && data.responseJson.podCommentCount !== undefined && comments !== undefined && data.responseJson.noOfViews === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.podCommentCount !== undefined && comments !== undefined && data.responseJson.postLikeCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount !== undefined && data.responseJson.podCommentCount !== undefined && comments === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount !== undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount !== undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount !== undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount !== undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments !== undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount === undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount !== undefined && comments === undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            }
            pod_content = pod_content + '</div></div>';
            //modal content end
            $(".viewport").show();
            $(".rny-row-container").empty();
            $(".rny-row-container").html(pod_content);
            var adapter = data.responseJson;
            rnyooDataBind(adapter);

            var img_h, screen_h, container_h, zoombar_h;
            img_h = parseInt($("img#pod_image").css("height"));
            screen_h = parseInt($(window).height());
            container_h = parseInt($(".rny-fullviewimg-container").css("height"));
            zoombar_h = parseInt($('#zoomb').css("height"));
            if (img_h > screen_h) {
                $("img#pod_image").css("max-height", screen_h - zoombar_h);
                $("img#pod_image").css("max-width", "100%");
                $(".rny-fullviewimg-container").css("height", screen_h - zoombar_h);
            } else {
                $("img#pod_image").css("max-height", "100%");
                $("img#pod_image").css("max-width", "100%");
                $(".rny-fullviewimg-container").css("height", screen_h - zoombar_h - 6);
            }
            $("#modal_loader").hide();
            $('.psotinfo_showhide').click(function(event) {
                event.stopPropagation();
                $(".fullview-postInfo").slideToggle();
                $("#NoteDialog").css("display", "none");
            });
            $(".fullview-postInfo").on("click", function(event) {
                event.stopPropagation();
            });
            // post info block will close click out side of block
            $(".rny-fullviewimg-container, .viewport, .rny-mobileview-zoomblock").on("click", function() {
                $(".fullview-postInfo").hide();
            });
            $(".popUp").on("click", function() {
                $("#rny_app_download").stop().fadeIn(500);
            });

            $(".rny-app-close").on("click", function() {
                $("#rny_app_download").stop().fadeOut(500);
            });
        }
    });
}

$(document).on("click", "#closeios_detector", function() {
    $(".ios-detector").hide();
});
$(document).on("click", ".popUp", function() {
    $("#rny_app_download").stop().fadeIn(500);
});
$(document).on("click", ".rny-app-close", function() {
    $("#rny_app_download").stop().fadeOut(500);
});

$(document).on("click", "#fullview_close", function(e) {
    e.preventDefault();
    $("body, html").css({
        "position": "static",
        "width": "100%",
        "height": "100%"
    });
    $win.scrollTop(page_offsetY);
    $("#fullview_modal_container").scrollTop(0);
    $("#NoteDialog").css("display", "none");
    $(".viewport").hide();
    $("#fullview_modal_container").hide();
    $(".ios-detector").hide();
    $("#showhotspots").hide();
});

$(document).keyup(function(key) {
    if (key.keyCode == 27) {
        $("#NoteDialog").css("display", "none");
        $(".viewport").hide();
        $("body, html").css({
            "position": "static",
            "width": "100%",
            "height": "100%"
        });
        $win.scrollTop(page_offsetY);
        $("#fullview_modal_container").scrollTop(0);
        if ($("#rnyooVideo").css("display") == "block") {
            videojs('rnyooVideo').dispose();
        }
        if ($("#rnyooAudio").css("display") == "block") {
            videojs('rnyooAudio').dispose();
        }
        $("#modalVideo").hide();
        $("#modalAudio").hide();
        $("#fullview_modal_container").hide();
    }
});
$(document).ready(function() {

    // alert message for hotspot attached images
    $('body').on("click", '.imgMedia', function(e) {
        e.preventDefault();
        var $elmImg = $("<div class='hp-attach-image-alert'>Attached images are retained in their original size for viewing.</div>");
        $(".lightbox").prepend($elmImg);
        setTimeout(function() {
            $elmImg.fadeOut(500);
        }, 3000);
    });

    // right click event disable
    $('body').attr('oncontextmenu', 'return false;');

    $(".more-btn").click(function() {
        var nextStart = $("#nextStart").val();
        var morePublicTimeline = 'https://renyoo.co/public_timeline';
        $.ajax({
            get: 'POST',
            url: morePublicTimeline,
            beforeSend: function(html) {
                //Load the spinner here
                $("#loader").show();
                $(".more-btn").hide();
            },
            success: function(data) {
                // After loading the data unload the spinner
                var generatepostContainer = "";
                inextStart = data.next_start;
                $("#nextStart").val(inextStart);
                for (var i in data.posts) {
                    var createdAt = data.posts[i].createdAt_l;
                    var lastUpdatedAt = data.posts[i].lastUpdatedAt_l;
                    var timevalue = data.posts[i].hasOwnProperty('postTtl');
                    var postQuestion = data.posts[i].hasOwnProperty('postQuestionCount');
                    var humanizedCreatedAt = humanizedDateString(createdAt);
                    var humanizedUpdatedAt = humanizedDateString(lastUpdatedAt);
                    var humanizedTtl;
                    var updateLessThanCreate = humanizedCreatedAt == humanizedUpdatedAt ? "" : '<br><span class="postupdated-time">last updated ' + humanizedUpdatedAt + '</span>';
                    if ("reportReview" in data.posts[i]) {
                        generatepostContainer = generatepostContainer + '<div class="col-lg-6 col-sm-12 col-xs-12 rny-pub-container"><div class="rny-postinfo-block post-report"><div class="report-post-img"><img src="images/alert-icon.png"><br>This post was reported and is currently under review.</div><div class="pub-img-block post-report-overlay" style="background-image: url(' + data.posts[i].jpgUrl + ');background-size: cover;background-repeat: no-repeat;background-position: top center;"><span class="post-details-url" data-store="' + data.posts[i].rpostid_s + '"></span>'; //instead of anchor tag line have to add "<span class="post-details-url" onclick="getmodalContent('parameter')"></span>"//
                        if (timevalue === false) {
                            generatepostContainer = generatepostContainer + '</div>';
                        } else {
                            humanizedTtl = humanizedDateString(data.posts[i].postTtl);
                            generatepostContainer = generatepostContainer + '<span class="tag-btn"><img src="images/timer_icon.png" alt="rny-image">' + humanizedTtl + '</span></div>';
                        }
                        if (postQuestion === true) {
                            if (parseInt((data.posts[i].postQuestionCount)) != 0 && parseInt((data.posts[i].hotspotCount) - 1) != 0) {
                                generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content post-report-overlay"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/img-q.png" alt="rny-image"> ' + parseInt((data.posts[i].postQuestionCount)) + ' </span><span class="rny-hotspots"><img src="images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + '</span></div>';
                            } else if (parseInt((data.posts[i].postQuestionCount)) == 0 && parseInt((data.posts[i].hotspotCount) - 1) != 0) {
                                generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content post-report-overlay"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + '</span></div>';
                            } else if (parseInt((data.posts[i].postQuestionCount)) != 0 && parseInt((data.posts[i].hotspotCount) - 1) == 0) {
                                generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content post-report-overlay"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/img-q.png" alt="rny-image"> ' + parseInt((data.posts[i].postQuestionCount)) + ' </span></div>';
                            } else if (parseInt((data.posts[i].postQuestionCount)) == 0 && parseInt((data.posts[i].hotspotCount) - 1) == 0) {
                                generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content post-report-overlay"><div class="hotspot-num-block"></div>';
                            }
                        } else if (parseInt((data.posts[i].hotspotCount) - 1) != 0) {
                            generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content post-report-overlay"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + '</span></div>';
                        } else {
                            generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content post-report-overlay"><div class="hotspot-num-block"></div>';
                        }
                        generatepostContainer = generatepostContainer + '<div class="rny-trend-collection-block"><span class="post-seasons-collections">' + hashtagText(data.posts[i].postDescription_ts) + '</div><div class="postupdate-time-block"><span class="postinfo-time"> by</span><a href="/users/' + data.posts[i].screenName_s + '" class="rny-asphalt postinfo-publisher-name">' + data.posts[i].screenName_s + '</a><span class="postinfo-updatetimeDot">&#183;</span><span class="postinfo-updatetime">' + humanizedCreatedAt + '</span>' + updateLessThanCreate + '</div>';
                        if (data.posts[i].postLikeCount === undefined) {
                            generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/view.png" alt="rny-image"> ' + data.posts[i].noOfViews + ' views</span></li></ul></div>';
                        } else if (data.posts[i].noOfViews === undefined) {
                            generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/like.png" alt="rny-image"> ' + data.posts[i].postLikeCount + ' likes</span></li></ul></div>';
                        } else {
                            generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/like.png" alt="rny-image"> ' + data.posts[i].postLikeCount + ' likes</span></li><li><span class="rny-darkgrey popUp"><img src="images/view.png" alt="rny-image"> ' + data.posts[i].noOfViews + ' views</span></li></ul></div>';
                        }
                        generatepostContainer = generatepostContainer + '</div></div></div>';
                        continue;
                    }

                    generatepostContainer = generatepostContainer + '<div class="col-lg-6 col-sm-12 col-xs-12 rny-pub-container"><div class="rny-postinfo-block"><div class="pub-img-block" style="background-image: url(' + data.posts[i].jpgUrl + ');background-size: cover;background-repeat: no-repeat;background-position: top center;"><span class="post-details-url" data-store="' + data.posts[i].rpostid_s + '"></span>'; //instead of anchor tag line have to add "<span class="post-details-url" onclick="getmodalContent('parameter')"></span>"//
                    if (timevalue === false) {
                        generatepostContainer = generatepostContainer + '</div>';
                    } else {
                        humanizedTtl = humanizedDateString(data.posts[i].postTtl);
                        generatepostContainer = generatepostContainer + '<span class="tag-btn"><img src="images/timer_icon.png" alt="rny-image">' + humanizedTtl + '</span></div>';
                    }
                    if (postQuestion === true) {
                        if (parseInt((data.posts[i].postQuestionCount)) != 0 && parseInt((data.posts[i].hotspotCount) - 1) != 0) {
                            generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/img-q.png" alt="rny-image"> ' + parseInt((data.posts[i].postQuestionCount)) + ' </span><span class="rny-hotspots"><img src="images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + '</span></div>';
                        } else if (parseInt((data.posts[i].postQuestionCount)) == 0 && parseInt((data.posts[i].hotspotCount) - 1) != 0) {
                            generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + '</span></div>';
                        } else if (parseInt((data.posts[i].postQuestionCount)) != 0 && parseInt((data.posts[i].hotspotCount) - 1) == 0) {
                            generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/img-q.png" alt="rny-image"> ' + parseInt((data.posts[i].postQuestionCount)) + ' </span></div>';
                        } else if (parseInt((data.posts[i].postQuestionCount)) == 0 && parseInt((data.posts[i].hotspotCount) - 1) == 0) {
                            generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"></div>';
                        }
                    } else if (parseInt((data.posts[i].hotspotCount) - 1) != 0) {
                        generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + '</span></div>';
                    } else {
                        generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"></div>';
                    }
                    generatepostContainer = generatepostContainer + '<div class="rny-trend-collection-block"><span class="post-seasons-collections">' + hashtagText(data.posts[i].postDescription_ts) + '</div><div class="postupdate-time-block"><span class="postinfo-time"> by</span><a href="/users/' + data.posts[i].screenName_s + '" class="rny-asphalt postinfo-publisher-name">' + data.posts[i].screenName_s + '</a><span class="postinfo-updatetimeDot">&#183;</span><span class="postinfo-updatetime">' + humanizedCreatedAt + '</span>' + updateLessThanCreate + '</div>';
                    if (data.posts[i].postLikeCount === undefined) {
                        generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/view.png" alt="rny-image"> ' + data.posts[i].noOfViews + ' views</span></li></ul></div>';
                    } else if (data.posts[i].noOfViews === undefined) {
                        generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/like.png" alt="rny-image"> ' + data.posts[i].postLikeCount + ' likes</span></li></ul></div>';
                    } else {
                        generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/like.png" alt="rny-image"> ' + data.posts[i].postLikeCount + ' likes</span></li><li><span class="rny-darkgrey popUp"><img src="images/view.png" alt="rny-image"> ' + data.posts[i].noOfViews + ' views</span></li></ul></div>';
                    }
                    generatepostContainer = generatepostContainer + '</div></div></div>';
                }
                $(".row").append(generatepostContainer);
                $("#loader").hide();
                if (inextStart === -1) {
                    $(".more-btn").hide();
                    $("#end-message").show();
                } else {
                    $(".more-btn").show();
                }
            }
        });
    });

    $(".more-btn-user-posts").click(function() {
        var nextStart = $("#nextStart").val();
        var userScreenName = $("#userScreenName").val();
        var morePublicTimeline = '/users_public_posts?user=' + userScreenName + '&start=' + nextStart;
        $.ajax({
            get: 'POST',
            url: morePublicTimeline,
            beforeSend: function(html) {
                //Load the spinner here
                $("#loader").show();
                $(".more-btn").hide();
            },
            success: function(data) {
                // After loading the data unload the spinner
                var generatepostContainer = "";
                inextStart = data.next_start;
                console.log("Next Start");
                console.log(inextStart);
                $("#nextStart").val(inextStart);
                for (var i in data.posts) {
                    var createdAt = data.posts[i].createdAt_l;
                    var lastUpdatedAt = data.posts[i].lastUpdatedAt_l;
                    var timevalue = data.posts[i].hasOwnProperty('postTtl');
                    var postQuestion = data.posts[i].hasOwnProperty('postQuestionCount');
                    var humanizedCreatedAt = humanizedDateString(createdAt);
                    var humanizedUpdatedAt = humanizedDateString(lastUpdatedAt);
                    var humanizedTtl;

                    // if post is reported
                    if ("reportReview" in data.posts[i]) {
                        continue;
                    }

                    generatepostContainer = generatepostContainer + '<div class="col-lg-6 col-sm-12 col-xs-12 rny-pub-container"><div class="rny-postinfo-block"><div class="pub-img-block" style="background-image: url(' + data.posts[i].jpgUrl + ');background-size: cover;background-repeat: no-repeat;background-position: top center;"><span data-store="' + data.posts[i].rpostid_s + '" class="post-details-url"></a>';
                    if (timevalue === false) {
                        generatepostContainer = generatepostContainer + '</div>';
                    } else {
                        humanizedTtl = humanizedDateString(data.posts[i].postTtl);
                        generatepostContainer = generatepostContainer + '<span class="tag-btn"><img src="/images/timer_icon.png" alt="rny-image">' + humanizedTtl + '</span></div>';
                    }
                    if (postQuestion === true) {
                        generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="/images/img-q.png" alt="rny-image"> ' + data.posts[i].postQuestionCount + ' </span><span class="rny-hotspots"><img src="/images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + '</span></div>';
                    } else {
                        generatepostContainer = generatepostContainer + '<div class="rny-postinfo-content"><div class="hotspot-num-block"><span class="rny-hotspots"><img src="/images/icon_hotspot.png" alt="rny-image"> ' + parseInt((data.posts[i].hotspotCount) - 1) + ' </span></div>';
                    }
                    generatepostContainer = generatepostContainer + '<div class="rny-trend-collection-block"><span class="post-seasons-collections">' + hashtagText(data.posts[i].postDescription_ts) + '</div><div class="postupdate-time-block"><span class="postinfo-time"> by</span><a href="/users/' + data.posts[i].screenName_s + '" class="rny-asphalt postinfo-publisher-name">' + data.posts[i].screenName_s + '</a><span class="postinfo-updatetimeDot">&#183;</span><span class="postinfo-updatetime">' + humanizedCreatedAt + '</span><br><span class="postupdated-time">last updated ' + humanizedUpdatedAt + '</span></div>';
                    if (data.posts[i].postLikeCount === undefined) {
                        generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/view.png" alt="rny-image"> ' + data.posts[i].noOfViews + ' views</span></li></ul></div>';
                    } else if (data.posts[i].noOfViews === undefined) {
                        generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/like.png" alt="rny-image"> ' + data.posts[i].postLikeCount + ' likes</span></li></ul></div>';
                    } else {
                        generatepostContainer = generatepostContainer + '<div class="rny-likes-views-block"><ul class="rny-likes"><li><span class="rny-darkgrey popUp"><img src="images/like.png" alt="rny-image"> ' + data.posts[i].postLikeCount + ' likes</span></li><li><span class="rny-darkgrey popUp"><img src="/images/view.png" alt="rny-image"> ' + data.posts[i].noOfViews + ' views</span></li></ul></div>';
                    }
                    generatepostContainer = generatepostContainer + '</div></div></div>';
                }
                $(".row").append(generatepostContainer);
                $("#loader").hide();
                if (inextStart === -1) {
                    $(".more-btn").hide();
                    $("#end-message").show();
                } else {
                    $(".more-btn").show();
                }
            }
        });
    });

    $(document).on("click", ".post-details-url", function() {
        var storeData = $(this).attr('data-store');
        // console.log(storeData);
        getmodalContent(storeData);
    });

    $(document).on("click", ".scroll-top", function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    });
    $(window).scroll(function() {
        if ($(this).scrollTop() != 0) {
            $('.scroll-top').fadeIn();
        } else {
            $('.scroll-top').fadeOut();
        }
    });
    $(document).on("click", "#menu", function() {
        $(".menu-overlay").stop().fadeIn(1000);
    });
    $(document).on("click", ".menu-close", function() {
        $(".menu-overlay").stop().fadeOut(1000);
    });
    // mobile and tablet serach 
    $(document).on("click", ".search-icon", function() {
        $(".mobile-search-view").fadeIn(1000);
    });

    $('body').on("click", ".mb-search-btn", function() {
        $("form").submit();
    });

    $(document).on("click", ".search-close", function() {
        $(".mobile-search-view").fadeOut(1000);
    });

    $(document).on("click", "#select_one_option, .rny-select-option", function() {
        $(".selection-box").toggle();
    });

    $('input[name="name"]').keyup(function(event) {
        $nameval = $(this).val();
        if ($nameval == "" || $nameval == null) {
            $('.name-error').show();
            $(".name-characters-error").hide();
        } else {
            $('.name-error').hide();
        }
        validateName($nameval);
    });

    $('input[name="email"]').change(function(event) {
        $mailval = $(this).val();
        if ($mailval === "" || $mailval === null) {
            $(".email-error").show();
            $(".email-valid-error").hide();
        } else {
            $(".email-error").hide();
        }
        validateEmail($mailval);
    });

    $('input[name="number"]').keyup(function() {
        $numval = $(this).val();
        if ($numval == "" || $numval == null) {
            $('.num-error').show();
            $('.num-valid-error').hide();
        } else {
            $('.num-error').hide();
        }
        validateNumber($numval);
    });

    $('input[name="category"]').keyup(function() {
        $categoryval = $(this).val();
        if ($categoryval === "" || $categoryval === "I am a ..." || $categoryval === null) {
            $(".selectone-error").show();
        } else {
            $(".selectone-error").hide();
        }
    });

    $('textarea[name="comment"]').keyup(function() {
        $commentval = $(this).val();

        if ($commentval == "" || $commentval == null) {
            $('.comment-error').show();
        } else {
            $('.comment-error').hide();
        }
    });

});

function validateName($nameval) {
    var alphaExp = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;
    if ($nameval.match(alphaExp)) {
        $(".name-characters-error").hide();
    } else {
        $(".name-characters-error").show();
        $(".name-error").hide();
    }
}

function validateEmail($emailval) {
    var emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!emailReg.test($emailval)) {
        $(".email-valid-error").show();
        $(".email-error").hide();
    } else {
        $(".email-valid-error").hide();
    }
}

function validateNumber($numval) {
    var numberExp = /^[0-9+()\s]*$/;

    if ($numval.match(numberExp)) {
        $('.num-valid-error').hide();
    } else {
        $('.num-valid-error').show();
        $(".num-error").hide();
    }
}

function selectOne(id) {
    $("#select_one_option").val(id);
    $(".selection-box").hide();
}

function formSubmit() {

    var nameval = $("#nameval").val();
    var emailval = $("#emailval").val();
    var selectval = $("#select_one_option").val();
    var numval = $("#numval").val();
    var commentval = $("#commentval").val();
    var alphaExp = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;
    var emailExp = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var numberExp = /^[0-9+()\s]*$/;

    if (nameval === "" || !nameval.match(alphaExp)) {
        $(".name-error").show();
        $(".name-characters-error").hide();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".name-error").hide();
    }
    if (emailval === "" || emailExp.test(emailval) == false) {
        $(".email-error").show();
        $(".email-valid-error").hide();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".email-error").hide();
    }
    if (numval === "") {
        $(".num-error").show();
        $('.num-valid-error').hide();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".num-error").hide();
    }
    if (selectval === "I am a ..." || selectval === "") {
        $(".selectone-error").show();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".selectone-error").hide();
    }
    if (commentval === "" || commentval === null) {
        $(".comment-error").show();
        $("body").scrollTop(0);
        return false;
    }
    $(".hiddent_text").show();
    $("#nameval").val('');
    $("#emailval").val('');
    $("#select_one_option").val('I am a ...');
    $("#numval").val('');
    $("#commentval").val('');
    return true;
}

function isIos() {
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/) && navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
        return $(".ios-detector").show();
    }
}