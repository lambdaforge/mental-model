uistate = {

    mapping: "drivers", // "practice", "none", "drivers", "consequences" or "finished"
    video: "", // "introduction", "instructions"
    factorSettings: "both", // "drivers", "consequences" or "both"
    factorTabOpen: "",

    session: {
        start: null,
        name: "",
        comment: ""
    },

    newArrow: {
        state: "select-arrow", // select-start, select-end
        startIcon: "",
        weight: 0
    },

    iconPositions: [],
    highlight: "",
    audioCue: false,
    blockUI: false,
    activeCanvas: "mapping-canvas", // "mapping-canvas" or "mapping-canvas-consequences"
};


// Load saved settings or use defaults
settings = defaultSettings;

var data = localStorage.getItem("mmetool_settings");

if( data ) {
    settings = JSON.parse(data);
    console.log("Use stored settings");
}
else {
    console.log("Default settings used");
}

console.log("Current settings:", settings);


// Load video file and activate DOM video element
playVideo = function(videoFile) {
    var video = document.getElementById("video");
    console.log("Play Video: " + videoFile);
    video.src = "video/" + videoFile;
    video.play();
};


// Load audio file and activate DOM audio element
playAudio = function(audioFile) {
    var audio = document.getElementById("audio");
    console.log("Play Audio: " + audioFile);
    audio.src = "audio/" + audioFile;
    audio.click();
};


// Checks if an audio or video element is playing
isPlaying = function(media) {
    return media.currentTime > 0 && !media.paused && !media.ended && media.readyState > 2;
};


// Choose shown screen; stop media from previous screen
showScreen = function(screenName) {
    var screens = document.getElementsByClassName("screen");
    var currentScreen = document.getElementById(screenName);
    var video = document.getElementById("video");
    var audio = document.getElementById("audio");

    // Prevent media to resume playing
    if (isPlaying(audio)) audio.pause();
    if (isPlaying(video)) video.pause();

    for( var i=0; i<screens.length; i++ ) {
        screens[i].style.display = "none";
    }

    currentScreen.style.display = "block";

    console.log("Loaded screen: " + screenName);
};


// Change to video screen
displayVideo = function(videoType) {
    showScreen("display-video");
    uistate.video = videoType;
    if(videoType === "introduction") playVideo(settings.introductionVideo);
    else                             playVideo(settings.instructionVideo);

};


// Change to thank you screen
displayThankYouScreen = function() {
    showScreen("thank-you");
    playAudio(settings.thankYouAudio);
};


// Prepare and show mapping screen
displayMapping = function(mappingType, startNewMapping) {

    startNewMapping = (startNewMapping === undefined)? true : startNewMapping;
    uistate.mapping = mappingType;

    switch (mappingType) {
        case "practice":
            showScreen("mapping-task");
            uistate.activeCanvas = "mapping-canvas";
            playAudio(settings.practiceMappingAudio);
            break;
        case "drivers":
            showScreen("mapping-task");
            uistate.activeCanvas = "mapping-canvas";
            playAudio(settings.driversMappingAudio);
            break;
        case "consequences":
            showScreen("mapping-task-consequences");
            uistate.activeCanvas = "mapping-canvas-consequences";
            playAudio(settings.consequencesMappingAudio);
            break;
        default:
            console.log("Unknown mapping type");
    }

    console.log("Start mapping: " + mappingType);
    if (startNewMapping || !canvas[uistate.activeCanvas]) {
        var sessionElement = document.getElementById("session");
        var commentElement = document.getElementById("comment");

        setupMapping(mappingType);

        uistate.session.start = new Date();
        uistate.session.name = sessionElement.value;
        uistate.session.comment = commentElement.value;
    }


    resetUIstate();


};


// Download data, as defined in browser
downloadData = function() {
    var csvContent = "data:text/csv;charset=utf-8,";

    var data = localStorage.getItem("mmetool");
    data = data? data : "No data";
    csvContent += data;

    console.log("Data to download:");
    console.log(csvContent);

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    console.log(encodedUri);
    link.setAttribute("download", "mmetool_data.csv");
    document.body.appendChild(link); // Required for firefox

    link.click();
};


// Action for settings button on menu screen
displaySettings = function() {
    showScreen("settings");
};


// Action for apply button settings screen
leaveAndSaveSettings = function() {
    saveSettings();
    showScreen("menu");
};


// Action after instructions have ended or after next button on mapping screen
goToNextMapping = function(startNewMapping) {
    var setup = (startNewMapping === undefined)? false : startNewMapping;

    var available = true;
    if (uistate.mapping === "none") {
        switch (settings.useMappings) {
            case "drivers":      displayMapping("drivers",      setup); break;
            case "consequences": displayMapping("consequences", setup); break;
            case "both":         displayMapping("drivers",      setup); break;
            default:
                console.log("Unknown mapping setting");
                available = false;
        }
    }
    else {
        if (uistate.mapping === "drivers" && settings.useMappings === "both")
                                 displayMapping("consequences", setup);
        else available = false;
    }

    return available;
};


// Action for button on 'thank you' screen or previous button on mapping screen
goToLastMapping = function(startNewMapping) {
    var setup = (startNewMapping === undefined)? false : startNewMapping;

    var available = true;
    if (uistate.mapping === "finished") {
        switch (settings.useMappings) {
            case "drivers":      displayMapping("drivers",      setup); break;
            case "consequences": displayMapping("consequences", setup); break;
            case "both":         displayMapping("consequences", setup); break;
            default:
                console.log("Unknown mapping setting");
                available = false;
        }
    }
    else {
        if (uistate.mapping === "consequences" && settings.useMappings === "both")
                                 displayMapping("drivers",      setup);
        else available = false;
    }

    return available;
};


// Behaviour on start up
window.onload = function() {

    $("#video")[0].src = "video/" + settings.introductionVideo;
    $("#audio")[0].src = "audio/" + settings.practiceMappingAudio;

    $("#video").on("ended", function() {
        if (uistate.video === "introduction" )  displayMapping("practice",     true);
        else                                    goToNextMapping(true);
    });

    $("#audio").on("click", function(a) {
        a.target.play()
    });

    var url = "images/" + settings.thankYouImage;
    $("#thank-you").css("background-image", "url(" + url + ")");
    $("#thank-you").css("height", $(window).height());
    $("#thank-you").css("background-position", "center");

    // On menu screen
    $("#btn-introduction").on("click", function() {
        displayVideo("introduction");
    });
    $("#btn-practice").on("click", function() {
        displayMapping("practice", true);
    });
    $("#btn-instructions").on("click", function() {
        displayVideo("instructions");
    });
    $("#btn-mapping-drivers").on("click", function() {
        displayMapping("drivers", true);
    });
    $("#btn-mapping-consequences").on("click", function() {
        displayMapping("consequences", true);
    });
    $("#btn-download").on("click", downloadData);
    $("#btn-settings").on("click", displaySettings);

    // On thank you screen
    $("#btn-ty-back").on("click", goToLastMapping);
    $("#btn-ty-tomain").on("click", function() {
        showScreen("menu");
    });

    // On settings screen
    $("#btn-save-settings").on("click", leaveAndSaveSettings);
    $("#btn-cancel-settings").on("click", function() {
        showScreen("menu");
    });
    $("#btn-add-drivers-factor").on("click", function() {
        addFactorRow("drivers");
    });
    $("#btn-add-consequences-factor").on("click", function() {
        addFactorRow("consequences");
    });
    $("#tab-drivers").on("click", function() {
        openTab('drivers');
    });
    $("#tab-consequences").on("click", function() {
        openTab('consequences');
    });
    $("[name='mappingTypes']").on("click", changeShownTabs);

/*
    $("#audio").on("loadeddata", function(a) {
        a.target.play();
    });*/

    initSettingsScreen();

    showScreen("menu");

};

