
defaultSettings = {

	iconSize: 85,
	minIconDistance: 100,
	arrowMargin: 5,
	fullScreen: true,
	highlightColor: "lightskyblue",

	mappingArea: {
		top: 0,
		bottom: 800,
		left1: 0,
		left2: 290, // drawing canvas border
		right: 1120
	},

	audioBlock: true,

	useNegativeArrows: true,

	arrowHead: [20, 20],
	arrowWeights: [3, 2, 1, -1, -2, -3], // choose (limited) amount?
	arrowColor: { positive: "blue", negative: "red", neutral: "black" }, // use neutral? for 0? when not using neg?

	factors: {
		main: {
			dynamic: [
				"awareness", "breeding_grounds", "climate_change", "corruption", "demand", "destructive_gear",
				"fishing_regulations", "monitoring", "open_access", "overfishing", "overpopulation", "pollution",
				"poverty", "water_hyacinth", "water_level"
			],
			fixed: "nile_perch",
			fixedPos:  { xLeft: 1000, yTop: 400}
		},

		practice: {
			dynamic: [
				"work", "food", "money", "sleep", "friends"
			],
			fixed: "smile",
			fixedPos:  { xLeft: 1000, yTop: 600}
		},
	},


	solutionImage: "solution.png", // .png
	practiceSolution: ["food smile 3", "work money 2", "money smile 2",  "sleep smile 1"],


	//
	// Changeable media
	//


	factorMedia: {
		"awareness":           {"img": "awareness.png",           "audio": "awareness.m4a"          },
		"breeding_grounds":    {"img": "breeding_grounds.png",    "audio": "breeding_grounds.m4a"   },
		"climate_change":      {"img": "climate_change.png",      "audio": "climate_change.m4a"     },
		"corruption":          {"img": "corruption.png",          "audio": "corruption.m4a"         },
		"demand":              {"img": "demand.png",              "audio": "demand.m4a"             },
		"destructive_gear":    {"img": "destructive_gear.png",    "audio": "destructive_gear.m4a"   },
		"fishing_regulations": {"img": "fishing_regulations.png", "audio": "fishing_regulations.m4a"},
		"monitoring":          {"img": "monitoring.png",          "audio": "monitoring.m4a"         },
		"open_access":         {"img": "open_access.png",         "audio": "open_access.m4a"        },
		"overfishing":         {"img": "overfishing.png",         "audio": "overfishing.m4a"        },
		"overpopulation":      {"img": "overpopulation.png",      "audio": "overpopulation.m4a"     },
		"pollution":           {"img": "pollution.png",           "audio": "pollution.m4a"          },
		"poverty":             {"img": "poverty.png",             "audio": "poverty.m4a"            },
		"water_hyacinth":      {"img": "water_hyacinth.png",      "audio": "water_hyacinth.m4a"     },
		"water_level":         {"img": "water_level.png",         "audio": "water_level.m4a"        },
		"nile_perch":          {"img": "nile_perch.png"                                             },
		"work":                {"img": "work.png",                "audio": "work.m4a"               },
		"food":                {"img": "food.png",                "audio": "food.m4a"               },
		"money":               {"img": "money.png",               "audio": "money.m4a"              },
		"sleep":               {"img": "sleep.png",               "audio": "sleep.m4a"              },
		"friends":             {"img": "friends.png",             "audio": "friends.m4a"            },
		"smile":               {"img": "smile.png"                                                  },
	},

	instructionVideo: "instructions.mp4",
	introductionVideo: "introduction.mp4",

	practiceMappingAudio: "practice.m4a",
	//mainMappingAudio: "main.m4a",
	mainMappingAudio: "",

	thankYouImage: "thank_you.png",
	thankYouAudio: "thank_you.m4a",

};
