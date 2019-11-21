
// Determine the next state
nextSessionState = function() {
    switch (uistate.session.state) {
        case State.homeScreen: return State.introduction;
        case State.introduction: return State.practiceMapping;
        case State.practiceMapping: return (settings.useMappings === MappingSetting.consequences)? State.consequencesInstructions: State.driversInstructions;
        case State.driversInstructions: return State.driversMapping;
        case State.driversMapping: return (settings.useMappings === MappingSetting.drivers)? State.thankYouScreen: State.consequencesInstructions;
        case State.consequencesInstructions: return State.consequencesMapping;
        case State.consequencesMapping: return State.thankYouScreen;
        default:
            console.log("Unknown session state");
            return State.none
    }
};

// Determine the if last mapping state was mapping or driver mapping or none
previousMappingState = function() {
    switch (uistate.session.state) {
        case State.consequencesMapping: return (settings.useMappings === MappingSetting.all)? State.driversMapping: State.none;
        case State.thankYouScreen: return (settings.useMappings === MappingSetting.drivers)? State.driversMapping: State.consequencesMapping;
        default: return State.none
    }
};
