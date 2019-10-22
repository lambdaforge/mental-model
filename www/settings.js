
defaultSettings = {

    factors: {
        drivers: {
            dynamic: [
                "awareness", "breeding_grounds", "climate_change", "corruption", "demand", "destructive_gear",
                "fishing_regulations", "monitoring", "open_access", "overfishing", "overpopulation", "pollution",
                "poverty", "water_hyacinth", "water_level"
            ],
            fixed: "nile_perch.png"
        },

        consequences: {
            dynamic: [
                "awareness", "breeding_grounds", "climate_change", "corruption", "demand", "destructive_gear",
                "fishing_regulations", "monitoring", "open_access", "overfishing", "overpopulation", "pollution",
                "poverty", "water_hyacinth", "water_level"
            ],
            fixed: "nile_perch.png"
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
        "awareness":           {"name": "awareness",           "img": "awareness.png",           "audio": "awareness.m4a"          },
        "breeding_grounds":    {"name": "breeding grounds",    "img": "breeding_grounds.png",    "audio": "breeding_grounds.m4a"   },
        "climate_change":      {"name": "climate change",      "img": "climate_change.png",      "audio": "climate_change.m4a"     },
        "corruption":          {"name": "corruption",          "img": "corruption.png",          "audio": "corruption.m4a"         },
        "demand":              {"name": "demand",              "img": "demand.png",              "audio": "demand.m4a"             },
        "destructive_gear":    {"name": "destructive gear",    "img": "destructive_gear.png",    "audio": "destructive_gear.m4a"   },
        "fishing_regulations": {"name": "fishing regulations", "img": "fishing_regulations.png", "audio": "fishing_regulations.m4a"},
        "monitoring":          {"name": "monitoring",          "img": "monitoring.png",          "audio": "monitoring.m4a"         },
        "open_access":         {"name": "open access",         "img": "open_access.png",         "audio": "open_access.m4a"        },
        "overfishing":         {"name": "overfishing",         "img": "overfishing.png",         "audio": "overfishing.m4a"        },
        "overpopulation":      {"name": "overpopulation",      "img": "overpopulation.png",      "audio": "overpopulation.m4a"     },
        "pollution":           {"name": "pollution",           "img": "pollution.png",           "audio": "pollution.m4a"          },
        "poverty":             {"name": "poverty",             "img": "poverty.png",             "audio": "poverty.m4a"            },
        "water_hyacinth":      {"name": "water hyacinth",      "img": "water_hyacinth.png",      "audio": "water_hyacinth.m4a"     },
        "water_level":         {"name": "water level",         "img": "water_level.png",         "audio": "water_level.m4a"        },
        "nile_perch":          {"name": "nile perch",          "img": "nile_perch.png"                                             },
        "work":                {"name": "work",                "img": "work.png",                "audio": "work.m4a",              "practice": true},
        "food":                {"name": "food",                "img": "food.png",                "audio": "food.m4a",              "practice": true},
        "money":               {"name": "money",               "img": "money.png",               "audio": "money.m4a",             "practice": true},
        "sleep":               {"name": "sleep",               "img": "sleep.png",               "audio": "sleep.m4a",             "practice": true},
        "friends":             {"name": "friends",             "img": "friends.png",             "audio": "friends.m4a",           "practice": true},
        "smile":               {"name": "smile",               "img": "smile.png",                                                 "practice": true},
    },

    instructionVideo: "instructions.mp4",
    introductionVideo: "introduction.mp4",

    practiceMappingAudio: "practice.m4a",
    mainMappingAudio: "main.m4a",
    thankYouAudio: "thank_you.m4a",

    thankYouImage: "thank_you.png",



};
