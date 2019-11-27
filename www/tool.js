

// Program state
uistate = {

    factorSettings: MappingSetting.all,
    factorTabOpen: "",

    session: {
        start: { drivers: null, consequences: null },
        name: "",
        comment: "",
        state: State.homeScreen
    },

    newArrow: {
        startIcon: "",
        weight: 0,
        state: ArrowDrawing.notStarted
    },

    iconPositions: [],
    highlight: "",
    audioCue: false,
    blockUI: false,
    activeCanvas: CanvasID.practice,
};


// Load saved settings or use defaults
settings = defaultSettings;

var data = localStorage.getItem(BrowserStorageKey.settings);

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
    var video = document.getElementById(HtmlID.video);
    console.log("Play Video: " + videoFile);
    video.src = "video/" + videoFile;
    video.play();
};


// Load audio file and activate DOM audio element
playAudio = function(audioFile) {
    var audio = document.getElementById(HtmlID.audio);
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
    var screens = document.getElementsByClassName(HtmlClass.screen);
    var currentScreen = document.getElementById(screenName);
    var video = document.getElementById(HtmlID.video);
    var audio = document.getElementById(HtmlID.audio);

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
displayVideo = function(videoState) {

    uistate.session.state = videoState;

    showScreen("display-video");
    switch (uistate.session.state) {
        case State.introduction:             playVideo(settings.introductionVideo); break;
        case State.driversInstructions:      playVideo(settings.instructionVideoDrivers); break;
        case State.consequencesInstructions: playVideo(settings.instructionVideoConsequences); break;
        default: console.log("Unknown or non-video state: ", uistate.session.state);
    }
};


// Change to thank you screen
displayThankYouScreen = function() {

    uistate.session.state = State.thankYouScreen;

    showScreen(ScreenID.thankYou);
    playAudio(settings.thankYouAudio);
};


// Prepare and show mapping screen
displayMapping = function(mappingState) {

    uistate.session.state = mappingState;

    var mappingType;
    switch (mappingState) {
        case State.practiceMapping:
            showScreen(ScreenID.mappingPractice);
            uistate.activeCanvas = CanvasID.practice;
            playAudio(settings.mappingAudioPractice);
            mappingType = MappingType.practice;
            break;
        case State.driversMapping:
            showScreen(ScreenID.mappingDrivers);
            uistate.activeCanvas = CanvasID.drivers;
            playAudio(settings.mappingAudioDrivers);
            mappingType = MappingType.drivers;
            break;
        case State.consequencesMapping:
            showScreen(ScreenID.mappingConsequences);
            uistate.activeCanvas = CanvasID.consequences;
            playAudio(settings.mappingAudioConsequences);
            mappingType = MappingType.consequences;
            break;
        default:
            console.log("Unknown or non-mapping state.");
            return;
    }

    console.log("Start mapping: " + mappingType);
    if (!canvas[uistate.activeCanvas]) {
        startSession(mappingType);
        setupMapping(mappingType);
    }

    resetUIstate();
};

startSession = function(mappingType) {
    var sessionElement = document.getElementById(HtmlID.session);
    var commentElement = document.getElementById(HtmlID.comment);
    uistate.session.start[mappingType] = new Date();
    uistate.session.name = sessionElement.value;
    uistate.session.comment = commentElement.value;
};

// Download data, as defined in browser
downloadData = function() {
    var csvContent = "data:text/csv;charset=utf-8,";

    var data = localStorage.getItem(BrowserStorageKey.data);
    data = data? data : "No data";
    csvContent += data;

    console.log("Data to download:");
    console.log(csvContent);

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    console.log(encodedUri);
    link.setAttribute("download", settings.dataFileName);
    document.body.appendChild(link); // Required for firefox

    link.click();
};


// Action for settings button on menu screen
displaySettings = function() {
    showScreen(ScreenID.settings);
};


// Action for apply button settings screen
leaveAndSaveSettings = function() {
    saveSettings();
    showScreen(ScreenID.menu);
};


// Behaviour on start up
window.onload = function() {

    $("#video")[0].src = "video/" + settings.introductionVideo;
    $("#audio")[0].src = "audio/" + settings.mappingAudioConsequences;

    $("#video").on("ended", function() {
        var nextState = nextSessionState();
        switch (uistate.session.state) {
            case State.introduction:              displayMapping(nextState); break;
            case State.driversInstructions:       displayMapping(nextState); break;
            case State.consequencesInstructions:  displayMapping(nextState); break;
            default: console.log("Unknown or non-video session state: ", uistate.session.state)
        }
    });

    $("#audio").on("click", function(a) {
        a.target.play()
    });

    // On menu screen
    $("#btn-introduction").on("click", function() {
        displayVideo(State.introduction);
    });
    $("#btn-practice").on("click", function() {
        displayMapping(State.practiceMapping);
    });
    $("#btn-instructions-drivers").on("click", function() {
        displayVideo(State.driversInstructions);
    });
    $("#btn-mapping-drivers").on("click", function() {
        displayMapping(State.driversMapping);
    });
    $("#btn-instructions-consequences").on("click", function() {
        displayVideo(State.consequencesInstructions);
    });
    $("#btn-mapping-consequences").on("click", function() {
        displayMapping(State.consequencesMapping);
    });
    $("#btn-download").on("click", downloadData);
    $("#btn-settings").on("click", displaySettings);

    // On thank you screen
    var url = "images/" + settings.thankYouImage;
    $("#thank-you").css("background-image", "url(" + url + ")");
    $("#btn-ty-back").on("click", onPreviousButtonClicked);
    $("#btn-ty-to-main").on("click", function() {
        canvas[CanvasID.practice] = null;
        canvas[CanvasID.drivers] = null;
        canvas[CanvasID.consequences] = null;
        showScreen(ScreenID.menu);
    });

    // On settings screen
    $("#btn-save-settings").on("click", leaveAndSaveSettings);
    $("#btn-cancel-settings").on("click", function() {
        showScreen(ScreenID.menu);
    });
    $("#btn-add-drivers-factor").on("click", function() {
        addFactorRow(MappingType.drivers);
    });
    $("#btn-add-consequences-factor").on("click", function() {
        addFactorRow(MappingType.consequences);
    });
    $("#tab-drivers").on("click", function() {
        openTab(MappingType.drivers);
    });
    $("#tab-consequences").on("click", function() {
        openTab(MappingType.consequences);
    });
    $("[name='mappingTypes']").on("click", changeShownTabs);


    initSettingsScreen();

    showScreen(ScreenID.menu);

};

