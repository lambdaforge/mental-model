


// Set up settings screen
initSettingsScreen = function() {

    listFactors(MappingType.drivers);
    listFactors(MappingType.consequences);

    populateSelectionForClass(HtmlClass.chooser.video, "video");
    populateSelectionForClass(HtmlClass.chooser.audio, "audio");
    populateSelectionForClass(HtmlClass.chooser.image, "images");

    $("#negative-arrows")[0].checked = settings.useNegativeArrows;
    $("input[name='mappingTypes'][value='" + settings.useMappings + "']" )[0].checked = true;

    let element1 = document.getElementById(SettingID.fixedFactorPos.drivers);
    element1.value = settings.factors.drivers.fixedPosition;
    let element2 = document.getElementById(SettingID.fixedFactorPos.consequences);
    element2.value = settings.factors.consequences.fixedPosition;

    if( settings.useMappings === MappingSetting.consequences) {
         $("#tab-consequences").click();
         $("#tab-drivers").hide();
    }
    else {
         $("#tab-drivers").click();

         if( settings.useMappings === MappingSetting.drivers ) {
            $("#tab-consequences").hide();
         }
    }
};


// Show factor tab for mapping type
openTab = function(mappingType) {
    var i, tabContent, tabLinks;

      // Get all elements with class="tabContent" and hide them
    tabContent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabContent.length; i++) {
       tabContent[i].style.display = "none";
    }

    // Get all elements with class="tabLinks" and remove the class "active"
    tabLinks = document.getElementsByClassName("tabLink");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(mappingType).style.display = "block";
    document.getElementById("tab-" + mappingType).className += " active";

    uistate.factorTabOpen = mappingType;
};


// Hide or show tab buttons based on choice of radio button
changeShownTabs = function() {
    var chosenValue = $(":checked[name='mappingTypes']")[0].value;
    var driverSelector = $("#tab-drivers");
    var consequenceSelector = $("#tab-consequences");

        switch (chosenValue) {
            case MappingType.consequences:
                driverSelector.hide();
                consequenceSelector.show();
                openTab(MappingType.consequences);
                break;
            case MappingType.drivers:
                driverSelector.show();
                consequenceSelector.hide();
                openTab(MappingType.drivers);
                break;
            default:
                driverSelector.show();
                consequenceSelector.show();
        }
};

// Synchronize value input on elements with same class in two tabs
synchronizeTabs = function(event) {
    var factorKey = event.target.name;
    var className = event.target.className;
    var elements = document.querySelectorAll("." + className + "[name=" + factorKey + "]");

    elements[0].value = event.target.value;
    elements[1].value = event.target.value;
};


// Returns cell with input element
createInputCell = function(tag, className, name, additionalSettings, inputCallback) {
    var td = document.createElement("td");
    var input = document.createElement(tag);
    input.className = className;
    input.name = name;

    var keys = Object.keys(additionalSettings);
    for (var i=0; i<keys.length; i++) {
        input[keys[i]] = additionalSettings[keys[i]]
    }

    if (inputCallback) {
        inputCallback(input);
    }
    td.appendChild(input);

    return td
};


// Behaviour when delete is pressed for a factor row
onDeleteFactorRow = function(event) {
    var factorKey = event.target.name;
    var elements = document.querySelectorAll( "button[name=" + factorKey + "]");

    elements[0].parentElement.parentElement.hidden = true;
    elements[1].parentElement.parentElement.hidden = true;
};


// Draw row for factor in table
factorRow = function(factorKey, used, defaultName, defaultImg, defaultAudio) {
    var tr = document.createElement("tr");
    tr.className = "factorRow";
    tr.name = factorKey;

    // Use?
    var checkboxValues = {"type": "checkbox", "checked": used};
    tr.appendChild(createInputCell("input", "useFactor", factorKey, checkboxValues));

    // Name
    var nameValues = {"type": "text", "defaultValue": defaultName, "onchange": synchronizeTabs};
    tr.appendChild(createInputCell("input", "factorName", factorKey, nameValues));

    // Image
    var imageValues = {"onchange": synchronizeTabs};
    var cb = function(input){ populateSelection(input, "images", defaultImg, false); };
    tr.appendChild(createInputCell("select", "factorImg", factorKey, imageValues, cb));

    // Sound
    var soundValues = {"onchange": synchronizeTabs};
    var cb2 = function(input){ populateSelection(input, "audio", defaultAudio, true); };
    tr.appendChild(createInputCell("select", "factorAudio", factorKey, soundValues, cb2));

    // Delete
    var buttonValues = {"innerHTML": "Delete", "onclick": onDeleteFactorRow};
    tr.appendChild(createInputCell("button", "deleteFactor", factorKey, buttonValues));

    return tr;
};


// Get list of factors present
listFactors = function(mappingType) {

    var fixedFactorElement = document.getElementById("fixed-factor-" + mappingType);
    populateSelection(fixedFactorElement, "images", settings.factors[mappingType].fixed, false);

    var factorTable = document.getElementById("factor-media-" + mappingType);
    for (var factorKey in settings.factorMedia){
        var factor = settings.factorMedia[factorKey];

        if (!factor.practice) {
            var used = (settings.factors[mappingType].dynamic.indexOf(factorKey) !== -1);
            var tr = factorRow(factorKey, used, factor["name"], factor["img"], factor["audio"]);

            factorTable.appendChild(tr);
        }
    }
};


// Add elements to media selection
populateSelection = function(element, mediaType, defaultValue, optional) {
    var option;
    if (optional) {
         option = document.createElement("option");

        option.value = "";
        option.textContent = "None";
        option.selected = true;

        element.appendChild(option);
    }

    var files = mediaSources[mediaType];
    for (var fileInd = 0; fileInd < files.length; fileInd++) {
        var filename = files[fileInd];
        option = document.createElement("option");

        option.value = filename;
        option.textContent = filename;

        element.appendChild(option);

        if (filename === defaultValue) option.selected = true;
    }
};


// Add elements to media selection of given type
populateSelectionForClass = function(className, mediaType) {
    var element = document.getElementsByClassName(className);

    for (var i = 0; i < element.length; i++) {
        var defaultValue = settings[element[i].id];
        populateSelection(element[i], mediaType, defaultValue, false);
    }
};


// New factor row
addFactorRow = function(mappingType) {
    //var factorTable = document.getElementById("factor-media-" + mappingType);
    var factorTables = document.querySelectorAll("table.factor-media");
    var key = "custom_key_" + settings.customFactorNumber;
    var tr = factorRow(key, false, key, "", "");
    var tr2 = factorRow(key, false, key, "", "");

    factorTables[0].appendChild(tr);
    factorTables[1].appendChild(tr2);

    settings.customFactorNumber += 1;
};


// Apply given changes
saveSettings = function() {

    // Set negative arrows option
    var arrowOption = document.getElementById(SettingID.negativeArrows);
    settings.useNegativeArrows = arrowOption.checked;

    // Set fixed symbol positions
    var fixedPos1 = document.getElementById(SettingID.fixedFactorPos.drivers);
    settings.factors.drivers.fixedPosition = fixedPos1.value;

    var fixedPos2 = document.getElementById(SettingID.fixedFactorPos.consequences);
    settings.factors.consequences.fixedPosition = fixedPos2.value;

    // Set decision on which mappings are used
    settings.useMappings = $(":checked[name='mappingTypes']")[0].value;
    switch (settings.useMappings) {
        case MappingSetting.consequences:
            $("#btn-mapping-drivers").hide();
            $("#btn-instructions-drivers").hide();
            $("#btn-mapping-consequences").show();
            $("#btn-instructions-consequences").show();
            break;
        case MappingSetting.drivers:
            $("#btn-mapping-drivers").show();
            $("#btn-instructions-drivers").show();
            $("#btn-mapping-consequences").hide();
            $("#btn-instructions-consequences").hide();
            break;
        default:
            $("#btn-mapping-drivers").show();
            $("#btn-instructions-drivers").show();
            $("#btn-mapping-consequences").show();
            $("#btn-instructions-consequences").show();
    }

    // Set media
    var mediaList = SettingID.media;

    for (var mediaInd = 0; mediaInd < mediaList.length; mediaInd++) {
        var item = mediaList[mediaInd];
        settings[item] = document.getElementById(item).value;
    }

    // Set used factors
    saveFactorMedia(uistate.factorTabOpen);
    saveFactors(MappingType.drivers);
    saveFactors(MappingType.consequences);

    // Store settings
    console.log("Settings changed to:", settings);
    localStorage.setItem(BrowserStorageKey.settings, JSON.stringify(settings));
};


// Save factor mappings to factor media
saveFactorMedia = function(mappingType) {

    var factorsElement = document.getElementById(mappingType);
    var factorRows = factorsElement.querySelectorAll(".factorRow");

    for (var rowInd = 0; rowInd < factorRows.length; rowInd++) {
        var row = factorRows[rowInd];
        var factorKey = row.name;
        if (!row.hidden) {
            var name  = row.querySelector("input.factorName[name=" + factorKey + "]").value;
            var img   = row.querySelector("select.factorImg[name=" + factorKey + "]").value;
            var audio = row.querySelector("select.factorAudio[name=" + factorKey + "]").value;

            settings.factorMedia[factorKey] = {"name": name, "img": img};
            if (audio) settings.factorMedia[factorKey]["audio"] = audio;
        }
        else {
            delete settings.factorMedia[factorKey];
        }
    }
};


// Save factors to settings
saveFactors = function(mappingType) {

    var fixedFactorsElement = document.getElementById("fixed-factor-" + mappingType);
    settings.factors[mappingType].fixed = fixedFactorsElement.value;

    var factorsElement = document.getElementById(mappingType);
    var factorRows = factorsElement.querySelectorAll(".factorRow");
    console.log(factorRows);
    settings.factors[mappingType].dynamic = [];
    for (var rowInd = 0; rowInd < factorRows.length; rowInd++) {
        var row = factorRows[rowInd];
        var factorKey = row.name;
        var use = row.querySelector("input.useFactor[name=" + factorKey + "]").checked;
        if (!row.hidden && use) {
            settings.factors[mappingType].dynamic.push(factorKey);
        }
    }
};
