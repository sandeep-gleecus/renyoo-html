var adapter = {};

function rnyooPodDataBind(adapter) {
    if ("reportReview" in adapter) {
        $("#non-visible").hide();
        $("#report-container").show();
        $('body').css("background", "#959595")
    }
    
    var autolinker = new Autolinker({
        urls: {
            schemeMatches: true,
            wwwMatches: true,
            tldMatches: true
        },
        email: false,
        phone: false,
        mention: false,
        hashtag: false,
        stripPrefix: false,
        newWindow: true,
        truncate: {
            length: 0,
            location: 'end'
        },
        className: ''
    });
    $('#pod_image').attr('src', adapter.pod.podImage.jpgUrl);

    // assigning imagenote plugin to the image for zooming and hotspots functionality
    //and handling hotspots from the image note plugin js, calling methods from the plugin
    var $img = $("#pod_image").imgNotes();
    $img.one("load", function() {
        var height_img = $(this).prop("naturalHeight");
        var width_img = $(this).prop("naturalWidth");
        // original image width and height(not from view port image)
        //for hotspot co-ordinates getting original height and width of the image

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

        // if no hotspots tap to view disable
        if (Object.keys(hotspots).length === 1) {
            $('#showhotspots').hide();
        } else {
            $('#showhotspots').show();
        }

        for (var hotspot in hotspots) {
            var temp = {};
            temp['note'] = "";
            if (hotspots[hotspot].location.x == 0 && hotspots[hotspot].location.y == 0) {
                continue;
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
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img data-streamUrl= "' + hotspots[hotspot].media.audio[0].streamfile + '" embed-data-status="'+audioStreamStatus+'" class="embedAudioStream" src="/images/audio_icon.png")></a></span>';
            }
            if (hotspots[hotspot].media.images.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages">';
                temp["note"] = temp["note"] + '<a href="' + hotspots[hotspot].media.images[0].imageUrl + '" data-lightbox="rny-media-images" class="imgMedia"><img src="/images/image_icon.png"></a>';
                for (var i = 1; i < hotspots[hotspot].media.images.length; i++) {
                    temp["note"] = temp["note"] + '<a href="' + hotspots[hotspot].media.images[i].imageUrl + '" data-lightbox="rny-media-images">';
                }
                temp["note"] = temp["note"] + '</a></span>';
            }
            if (hotspots[hotspot].media.docs.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img src="/images/doc_icon.png"></a></span>';
            }
            if (hotspots[hotspot].media.video.length > 0) {
                var fallbackUrl = hotspots[hotspot].media.video[0].streamfile;
                var videoStreamStatus = hotspots[hotspot].media.video[0].stream_status;
                // console.log(fallbackUrl);
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
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img data-mimetype="' + videoMimeType + '" data-streamUrl= "' + fallbackUrl + '" embed-data-status="'+videoStreamStatus+'" class="embedVideoStream" src="/images/video_icon.png"></a></span>';
            }
            if (hotspots[hotspot].clickUrl.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="' + hotspots[hotspot].clickUrl + '" target="_blank"><img src="/images/url_icon.png"></a></span>';
            }
            // $elem for define css properties of hot spot and changing the color of hot spot dynamically
            $elem = $('<div style="display:none;"></div>').css({
                width: "25px",
                height: "25px",
                transition: "all 1s ease"
            }).append('<div class="pulse hs-animation" style="background:' + hotspots[hotspot].markerColor + '"></div><div class="hs-label">' + hotspots[hotspot].hotspotLabel_ts + '</div>');
            temp["hs_color"] = $elem;
            
            // var addedIdx = addedHotspots.indexOf(hotspots[hotspot].hotspotId);
            // var updatedIdx = updatedHotspotIds.indexOf(hotspots[hotspot].hotspotId);
            // if (addedIdx != -1 || updatedIdx != -1) {
            //     $elem = $('<div style="display:none;" class="tooltipLabel" title="' + hotspots[hotspot].hotspotLabel_ts + '"></div>').css({
            //         width: "25px",
            //         "max-width": "100%",
            //         height: "25px",
            //         transition: "all 1s ease"
            //     }).append('<div class="revolve hs-animation" style="background:' + hotspots[hotspot].markerColor + '"></div><div class="hs-label">' + hotspots[hotspot].hotspotLabel_ts + '</div>');
            //     temp["hs_color"] = $elem;
            // } else {
            //     $elem = $('<div style="display:none;" class="tooltipLabel" title="' + hotspots[hotspot].hotspotLabel_ts + '"></div>').css({
            //         width: "25px",
            //         height: "25px",
            //         "max-width": "100%",
            //         transition: "all 1s ease"
            //     }).append('<div class="pulse hs-animation" style="background:' + hotspots[hotspot].markerColor + '"></div><div class="hs-label">' + hotspots[hotspot].hotspotLabel_ts + '</div>');
            //     temp["hs_color"] = $elem;
            // }
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
$(document).on("click", ".embedCloseAudio", function() {
    videojs('embedRnyooAudio').dispose();
    $("#embedModalAudio").css({ display: "none" });
});

$(document).on("click", '.embedCloseVideo', function(e) {
    e.preventDefault()
    videojs('embedRnyooVideo').dispose();
    $("#embedModalVideo").css({ display: "none" });
});

$(document).on("click", '.embedAudioStream', function(e) {
    var audioSource = $(this).attr('data-streamUrl');
    var dataStatus = $(this).attr('embed-data-status');
    // console.log(audioSource);
    var embedAudioTag = '<audio id="embedRnyooAudio" class="video-js" controls preload="auto" width="100%" height="100%" data-setup=\'{ "controls": true, "autoplay": false, "preload": "auto" , "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'><source src="' + audioSource + '" type="audio/mp4"></audio>';

    if (dataStatus == "queued") {
        var embedAudioTag = '<audio id="embedRnyooAudio" class="video-js" width="100%" height="100%" data-setup=\'{ "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'></audio>';
        $('.embed-modal-content1-audio').append(embedAudioTag);
        console.log(dataStatus);
        videojs("embedRnyooAudio").errors({
            errors: {
                audioQueueError: {
                    headline: 'Hey There! This Audio seems to be in queue for conversion. Please recheck in sometime.'
                }
            }
        });
        videojs("embedRnyooAudio").error({ code: 'audioQueueError', dismiss: true });
    } else if (dataStatus == "failed") {
        console.log(dataStatus);
        var embedAudioTag = '<audio id="embedRnyooAudio" class="video-js" controls preload="auto" width="100%" height="100%" data-setup=\'{ "controls": true, "autoplay": false, "preload": "auto" , "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'></audio>';
        $('.embed-modal-content1-audio').append(embedAudioTag);
        videojs("embedRnyooAudio").errors({
            errors: {
                audioFailedError: {
                    headline: 'This Audio has failed for conversion.Please contact the publisher.'
                }
            }
        });
        videojs("embedRnyooAudio").error({ code: 'audioFailedError', dismiss: true });
    } else if (dataStatus == "completed") {
        console.log(dataStatus);
        e.preventDefault()
        $('.embed-modal-content1-audio').append(embedAudioTag);
        videojs("embedRnyooAudio").play();
    }
    $("#embedModalAudio").css({ display: "block" });
});

$(document).on("click", '.embedVideoStream', function(e) {
    var videoSource = $(this).attr('data-streamUrl');
    var videoMimeType = $(this).attr('data-mimeType');
    var dataStatus = $(this).attr('embed-data-status');
    var embedVideoTag = '<video id="embedRnyooVideo" class="video-js" controls preload="auto" width="100%" height="100%" data-setup=\'{ "controls": true, "autoplay": false, "preload": "auto" , "aspectRatio": "640:480", "poster": "/images/rnyoo-video-icon.jpg"}\'><source src="' + videoSource + '" type="' + videoMimeType + '"></video>';

    if (dataStatus == "queued") {
        var embedVideoTag = '<video id="embedRnyooVideo" class="video-js" width="100%" height="100%" data-setup=\'{ "controls": false, "aspectRatio": "640:480", "poster": "/images/image-1.jpg"}\'></video>';
        $('.embed-modal-content1').append(embedVideoTag);
        console.log(dataStatus);
        videojs("embedRnyooVideo").errors({
            errors: {
                videoQueueError: {
                    headline: 'Hey There! This video seems to be in queue for conversion. Please recheck in sometime.'
                }
            }
        });
        videojs("embedRnyooVideo").error({ code: 'videoQueueError', dismiss: true });
    } else if (dataStatus == "failed") {
        console.log(dataStatus);
        var embedVideoTag = '<video id="embedRnyooVideo" class="video-js" width="100%" height="100%" data-setup=\'{ "controls": false, "aspectRatio": "640:480", "poster": "/images/image-1.jpg"}\'></video>';
        $('.embed-modal-content1').append(embedVideoTag);
        videojs("embedRnyooVideo").errors({
            errors: {
                videoFailedError: {
                    headline: 'This Video has failed for conversion.Please contact the publisher.'
                }
            }
        });
        videojs("embedRnyooVideo").error({ code: 'videoFailedError', dismiss: true });
    } else if (dataStatus == "completed") {
        console.log(dataStatus);
        e.preventDefault()
        $('.embed-modal-content1').append(embedVideoTag);
        videojs("embedRnyooVideo").play();
    }
    $("#embedModalVideo").css({ display: "block" });
});

$(document).ready(function(){
    $('body').on("click", '.imgMedia', function(e) {
        e.preventDefault();
            var $elmImg = $("<div class='hp-attach-image-alert'>Attached images are retained in their original size for viewing.</div>");
            $(".lightbox").prepend($elmImg);
            setTimeout(function() {
                $elmImg.fadeOut(500);
            }, 3000);
    });
});