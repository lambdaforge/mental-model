
defaultSettings = {

    factors: {
        drivers: {
            dynamic: [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O" ],
            fixed: "Y.png"
        },

        consequences: {
            dynamic: [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O" ],
            fixed: "Y.png"
        },

        practice: {
            dynamic: [
                "work", "food", "money", "sleep", "friends"
            ],
            fixed: "smile.png"
        },
    },


    //
    // Fixed settings
    //

    solutionImage: "solution.png",
    practiceSolution:  ["food\tsmile\t3", "work\tmoney\t2", "money\tsmile\t2",  "sleep\tsmile\t1"],

    audioBlock: true,
    arrowWeights: [3, 2, 1, -1, -2, -3],
    arrowColor: { positive: "blue", negative: "red", neutral: "black"},
    highlightColor: "lightskyblue",
    customFactorNumber: 0,


    //
    // Changeable settings
    //

    useNegativeArrows: false,
    useMappings: "both", // "both", "drivers", "consequences"


    //
    // Changeable media
    //

    factorMedia: {
        "A":       {"name": "A",       "img": "A.png",       "audio": "A.m4a"},
        "B":       {"name": "B",       "img": "B.png",       "audio": "B.m4a"},
        "C":       {"name": "C",       "img": "C.png",       "audio": "C.m4a"},
        "D":       {"name": "D",       "img": "D.png",       "audio": "D.m4a"},
        "E":       {"name": "E",       "img": "E.png",       "audio": "E.m4a"},
        "F":       {"name": "F",       "img": "F.png",       "audio": "F.m4a"},
        "G":       {"name": "G",       "img": "G.png",       "audio": "G.m4a"},
        "H":       {"name": "H",       "img": "H.png",       "audio": "H.m4a"},
        "I":       {"name": "I",       "img": "I.png",       "audio": "I.m4a"},
        "J":       {"name": "J",       "img": "J.png",       "audio": "J.m4a"},
        "K":       {"name": "K",       "img": "K.png",       "audio": "K.m4a"},
        "L":       {"name": "L",       "img": "L.png",       "audio": "L.m4a"},
        "M":       {"name": "M",       "img": "M.png",       "audio": "M.m4a"},
        "N":       {"name": "N",       "img": "N.png",       "audio": "N.m4a"},
        "O":       {"name": "O",       "img": "O.png",       "audio": "O.m4a"},
        "Y":       {"name": "Y",       "img": "Y.png"                        },
        "work":    {"name": "work",    "img": "work.png",    "audio": "work.m4a",    "practice": true},
        "food":    {"name": "food",    "img": "food.png",    "audio": "food.m4a",    "practice": true},
        "money":   {"name": "money",   "img": "money.png",   "audio": "money.m4a",   "practice": true},
        "sleep":   {"name": "sleep",   "img": "sleep.png",   "audio": "sleep.m4a",   "practice": true},
        "friends": {"name": "friends", "img": "friends.png", "audio": "friends.m4a", "practice": true},
        "smile":   {"name": "smile",   "img": "smile.png",                           "practice": true},
    },

    instructionVideo: "instructions.mp4",
    introductionVideo: "introduction.mp4",

    practiceMappingAudio: "practice.m4a",
    mainMappingAudio: "main.m4a",
    thankYouAudio: "thank_you.m4a",

    thankYouImage: "thank_you.png",



};
