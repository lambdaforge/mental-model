
// Enums for program state

var State = {
    none: "",
    homeScreen: "homeScreen",
    introduction: "introduction",
    practiceMapping: "practiceMapping",
    driversInstructions: "driversInstructions",
    driversMapping: "driversMapping",
    consequencesInstructions: "consequencesInstructions",
    consequencesMapping: "consequencesMapping",
    thankYouScreen: "thankYouScreen"
};

var ArrowDrawing = {
    notStarted: "select-arrow",
    typeSelected: "select-start",
    tailPositioned: "select-end"
};


// Enums for settings
var MappingSetting = {
    drivers: "drivers",
    consequences: "consequences",
    all: "both"
};

var PositionOnCanvas = {
    left: "left",
    right: "right",
    middle: "middle"
};


// Enums for HTML IDs and names
var CanvasID = {
    practice: "mapping-canvas-practice",
    drivers: "mapping-canvas-drivers",
    consequences: "mapping-canvas-consequences"
};

var ScreenID = {
    menu: "menu",
    settings: "settings",
    video: "display-video",
    mappingPractice: "mapping-practice",
    mappingDrivers: "mapping-drivers",
    mappingConsequences: "mapping-consequences",
    thankYou: "thank-you"
};

var SettingID = {
    negativeArrows: "negative-arrows",
    fixedFactorPos: {
        drivers: "fixed-factor-drivers-pos",
        consequences: "fixed-factor-consequences-pos"
    },
    media: [
        "instructionVideoDrivers",
        "instructionVideoConsequences",
        "introductionVideo",
        "thankYouImage",
        "thankYouAudio",
        "mappingAudioPractice",
        "mappingAudioDrivers",
        "mappingAudioConsequences"
    ]
};

var HtmlID = {
    video: "video",
    audio: "audio",
    session: "session",
    comment: "comment"
};

var HtmlClass = {
    screen: "screen",
    chooser: {video: "videoChooser", audio: "audioChooser", image: "imageChooser"}
};


// Other Enums

var BrowserStorageKey = {
    settings: "nommet_settings",
    data: "nommet_data"
};

var MappingType = {
    practice: "practice",
    drivers: "drivers",
    consequences: "consequences",
};

var IconType = {
    connection: "connection",
    factor: "factor",
    button: "button"
};

var Button = {
    previous: "previous",
    next: "next",
    question: "question",
    bin: "bin"
};
