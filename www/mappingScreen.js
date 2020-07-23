
var canvasStyle = null;

var canvas = {
    "mapping-canvas-practice": null,
    "mapping-canvas-drivers": null,
    "mapping-canvas-consequences": null
};


// ---------------------------------------------------------------------
// Setting up the canvas layout
// ---------------------------------------------------------------------

// Set up canvas according to current window size
setupCanvas = function() {

    canvas[uistate.activeCanvas] = new fabric.Canvas(uistate.activeCanvas, {
        width: $(window).width(),
        height: $(window).height()
    });
    canvas[uistate.activeCanvas].on("mouse:down", onCanvasClicked);
    canvas[uistate.activeCanvas].selection = false;
    canvas[uistate.activeCanvas].hoverCursor = "default";
};

// Layout and behaviour of drawing screen
setupMapping = function(mappingType) {
    console.log("Setting up: " + mappingType);
    console.log("Use mappings: " + settings.useMappings);

    if (!canvas[uistate.activeCanvas]) { // using new fabric canvas is not possible
        setupCanvas();
    }
    canvas[uistate.activeCanvas].clear();

    var factors =  settings.factors[mappingType];
    var dynamicFactors = factors.dynamic;
    var fixedFactor = factors.fixed;

    // Adjust Sizes
    var h = $(window).height();
    var w = $(window).width();
    canvasStyle = getPixelSizes(w, h, mappingType, settings);

    // Set up arrows and factors
    divideCanvas();
    setupArrows();
    setupFactorMenu(dynamicFactors);

    if (fixedFactor !== "") {
        var xFixed = canvasStyle.xFixedFactor[factors.fixedPosition];
        var yFixed = canvasStyle.yFixedFactor;

        drawFactorIcon(fixedFactor, xFixed,  yFixed, true);
    }

    // Setup buttons
    var halfButton = canvasStyle.buttonSize / 2;
    drawButton(Button.question, canvasStyle.centerLeftSide,  h - halfButton, onQuestionButtonClicked);
    drawButton(Button.next,     canvasStyle.centerRightSide, h - halfButton, onNextButtonClicked);
    drawButton(Button.bin,      canvasStyle.centerRightSide,           halfButton, onBinButtonClicked);

    if (mappingType === MappingType.consequences && settings.useMappings === MappingSetting.all) {
        drawButton(Button.previous, canvasStyle.centerLeftSide, halfButton, onPreviousButtonClicked);
    }

    if (mappingType === MappingType.practice) {
        fabric.Image.fromURL("images/" + settings.solutionImage, function(image) {
            var maxHeightScale = canvasStyle.practiceImageHeight / image.height;
            var maxWidthScale = canvasStyle.availableWidth / image.width;
            console.log("w", maxWidthScale);
            console.log("h", maxHeightScale);
            image.scale( Math.min(maxHeightScale, maxWidthScale));
            image.top = canvasStyle.practiceImageY;
            image.originX = "center";
            image.originY = "middle";
            image.left = canvasStyle.practiceImageX;
            image.selectable = false;
            image.opacity = 0.5;
            canvas[uistate.activeCanvas].add(image);
            canvas[uistate.activeCanvas].bringToFront(image);
        });
    }

    canvas[uistate.activeCanvas].renderAll();

};


// Divide canvas into 3 areas
divideCanvas = function() {
    var leftSide = new fabric.Rect({
        top: 0,
        left: 0,
        width: canvasStyle.leftSideWidth,
        height: canvasStyle.height,
        fill: canvasStyle.color.sidePanels,
        selectable: false
    });
    var leftBorder = new fabric.Rect({
        top: 0,
        left: canvasStyle.leftSideWidth,
        width: canvasStyle.borderWidth,
        height: canvasStyle.height,
        fill: canvasStyle.color.leftDivider,
        selectable: false
    });
    var rightSide = new fabric.Rect({
        top: 0,
        left: canvasStyle.width - canvasStyle.rightSideWidth,
        width: canvasStyle.rightSideWidth,
        height: canvasStyle.height,
        fill: canvasStyle.color.sidePanels,
        selectable: false
    });
    var rightBorder = new fabric.Rect({
        top: 0,
        left: canvasStyle.width - canvasStyle.rightSideWidth - canvasStyle.borderWidth,
        width: canvasStyle.borderWidth,
        height: canvasStyle.height,
        fill: canvasStyle.color.rightDivider,
        selectable: false
    });

    canvas[uistate.activeCanvas].add(rightSide);
    canvas[uistate.activeCanvas].bringToFront(rightSide);
    canvas[uistate.activeCanvas].add(rightBorder);
    canvas[uistate.activeCanvas].bringToFront(rightBorder);
    canvas[uistate.activeCanvas].add(leftSide);
    canvas[uistate.activeCanvas].bringToFront(leftSide);
    canvas[uistate.activeCanvas].add(leftBorder);
    canvas[uistate.activeCanvas].bringToFront(leftBorder);
};


// Draw Arrow selection on right side of canvas
setupArrows = function() {

    // Only use negative arrows if specified in settings
    var arrows = canvasStyle.arrowsUsed;

    for (var arrowInd = 0; arrowInd < arrows.length; arrowInd++) {
        drawMenuArrow(arrowInd, arrows[arrowInd]);
    }
};


// Draw arrow in arrow menu
drawMenuArrow = function(arrowInd, arrowWeight) {

    var pos = canvasStyle.arrowPositions[arrowInd];
    var style = arrowStyle(arrowWeight);

    var halfLength =  canvasStyle.arrowLength / 2;
    var arrowStart = { x: pos.x - halfLength, y: pos.y };

    var buttonHeight = canvasStyle.arrowHead + 2 * canvasStyle.arrowButtonMargin;
    var buttonWidth = canvasStyle.arrowLength + 2 * canvasStyle.arrowButtonMargin;

    var arrowOutline = leftRightArrow(arrowStart, canvasStyle.arrowLength, style.lineWidth);
    var arrowAttributes =  { fill: style.color, originY: "center", originX: "middle"};

    var arrow = new fabric.Polygon(arrowOutline, arrowAttributes);
    var arrowButton = new fabric.Rect({
        top: pos.y ,
        left: pos.x,
        width: buttonWidth,
        height: buttonHeight,
        stroke: "transparent",
        originY: "center",
        originX: "middle",
        fill: "transparent"
    });

    var icon = new fabric.Group([arrow, arrowButton]);
    icon.iconType = "button";
    icon.iconName = "addConnection" + arrowWeight;
    icon.connectionWeight = arrowWeight;
    icon.selectable = false;
    icon.on("mousedown", onArrowButtonClicked);
    canvas[uistate.activeCanvas].add(icon);
    canvas[uistate.activeCanvas].bringToFront(icon);
};

// Layout of factor menu on left side of screen
setupFactorMenu = function(factors) {
    var positions = canvasStyle.initialFactorPositions;

    for (var factorInd = 0; factorInd < factors.length; factorInd++) {
        drawFactorIcon(factors[factorInd], positions[factorInd].x, positions[factorInd].y, false);
    }
};


// Add button
drawButton = function(name, xLeft, yTop, onmousedown) {
    fabric.Image.fromURL("buttons/" + name + ".png", function(icon) {
        icon.scaleToHeight(canvasStyle.buttonSize);
        icon.scaleToWidth(canvasStyle.buttonSize);
        icon.top = yTop;
        icon.left = xLeft;
        icon.originX = "center";
        icon.originY = "middle";
        icon.selectable = false;
        icon.iconType = IconType.button;
        icon.iconName = name;
        icon.on("mousedown", onmousedown);
        canvas[uistate.activeCanvas].add(icon);
        canvas[uistate.activeCanvas].bringToFront(icon);
    });
};


// ---------------------------------------------------------------------
// Drawing and removing of icons on canvas
// ---------------------------------------------------------------------


// Draw icon on canvas
drawFactorIcon = function(iconName, xLeft, yTop, fixed) {

    var factorImage;
    if (fixed) {
        factorImage = "images/" + iconName;
    } else {
        factorImage = "images/" + settings.factorMedia[iconName].img;
    }

    fabric.Image.fromURL( factorImage, function(icon) {
        icon.scale(canvasStyle.iconSize / Math.max(icon.height, icon.width));
        icon.hasControls = false;
        icon.borderColor = "transparent";
        icon.top = yTop;
        icon.left = xLeft;
        icon.iconType = IconType.factor;
        icon.originX = "center";
        icon.originY = "middle";
        icon.on("mousedown", onFactorIconClicked);
        icon.selectable = false; // causes immobility on dragging

        if (fixed) {
            icon.iconFixed = true;
            icon.iconName = "fg:" + iconName.substr(0, iconName.lastIndexOf("."));
        }
        else {
            icon.iconFixed = false;
            icon.iconName = iconName;
            icon.iconHomeX = xLeft;
            icon.iconHomeY = yTop;
        }
        canvas[uistate.activeCanvas].add(icon);
        canvas[uistate.activeCanvas].bringToFront(icon);
    });
};


// Draw arrow between symbols
drawConnection = function(startIconName, endIconName, weight) {

    if (startIconName !== endIconName) {
        var style = arrowStyle(weight);
        var startPos = getIconAnchor(startIconName);
        var endPos   = getIconAnchor(endIconName);
        var dirVec = getDirv(startPos, endPos);
        var factorDistance = getDist(startPos, endPos);

        var dFromCenter = 0;
        if ( factorDistance > canvasStyle.minIconDistance + canvasStyle.arrowMargin)
            dFromCenter = canvasStyle.iconSize / 2 + canvasStyle.arrowMargin;
        else
            dFromCenter = factorDistance / 2;

        var arrowLength = Math.max(canvasStyle.arrowMinLength, factorDistance - 2 * dFromCenter);

        var arrowStartX = startPos.x + dFromCenter * dirVec.x;
        var arrowStartY = startPos.y + dFromCenter * dirVec.y;
        var arrowStart = {x: arrowStartX, y: arrowStartY};

        var arrowOutline = leftRightArrow(arrowStart, arrowLength, style.lineWidth);

        var arrow = new fabric.Polygon(arrowOutline, {fill: style.color});
        arrow.centeredRotation = false;
        arrow.rotate(180 * Math.atan2(dirVec.y, dirVec.x) / Math.PI);
        arrow.borderColor = "transparent";
        arrow.hasControls = false;
        arrow.selectable = false;
        arrow.iconType = IconType.connection;
        arrow.iconName = startIconName + "-" + endIconName;
        arrow.connectionWeight = weight;
        arrow.on("mousedown", onArrowClicked);
        canvas[uistate.activeCanvas].add(arrow);
        canvas[uistate.activeCanvas].bringToFront(arrow);
    }
};


// Draw blue icon background
// Only one highlight at a time possible
drawHighlight = function(icon) {
    console.log("Highlight " + icon.iconName);
    removeHighlight();
    var bbox = icon.getBoundingRect();
    var margin = canvasStyle.highlightMargin;
    var highlight = new fabric.Rect({
        top: bbox.top - margin / 2,
        left: bbox.left - margin / 2,
        width: bbox.width + margin,
        height: bbox.height + margin,
        selectable: false,
        fill: settings.highlightColor
    });
    highlight.iconName = "highlight";
    canvas[uistate.activeCanvas].add(highlight);
    canvas[uistate.activeCanvas].bringToFront(highlight);
    canvas[uistate.activeCanvas].bringToFront(icon);
    uistate.highlight = icon.iconName;
};


// Remove arrows connected to icon
removeConnections = function(icon) {
    var connectedIcons = getFactorConnectionIcons(icon);
    for (var arrowInd = 0; arrowInd < connectedIcons.length; arrowInd++) {
        canvas[uistate.activeCanvas].remove(connectedIcons[arrowInd]);
    }
};


// Redraw arrows connected to icon
redrawConnections = function(factor) {
    var connectedIcons = getFactorConnectionIcons(factor);
    for (var arrowInd = 0; arrowInd < connectedIcons.length; arrowInd++) {
        var connectedIcon = connectedIcons[arrowInd];
        var factors = connectedIcon.iconName.split("-");

        canvas[uistate.activeCanvas].remove(connectedIcon);
        drawConnection(factors[0], factors[1], connectedIcon.connectionWeight);
    }
};


// Remove bounding box from icon
removeHighlight = function() {
    var icon = getIconByName("highlight");
    canvas[uistate.activeCanvas].remove(icon);
    uistate.highlight = "none";
};



// ---------------------------------------------------------------------
// Mouse interactions on canvas
// ---------------------------------------------------------------------


// Behaviour when canvas is clicked
onCanvasClicked = function(event) {

    console.log("Canvas clicked");

    var selectedIcon = uistate.highlight;

    if (!event.target && uistate.newArrow.state === ArrowDrawing.notStarted) {

        console.log("No object hit and no arrow selected, move factor: " + selectedIcon);

        var icon = getIconByName(selectedIcon);

        removeHighlight();

        if (icon && (icon.iconType === IconType.factor) && (icon.iconFixed === false)) {
            var pointer = canvas[uistate.activeCanvas].getPointer(event.e);
            var x = pointer.x;
            var y = pointer.y;

            if (!tooCloseToOtherFactors(pointer) && !withinMappingArea(x, y)) {

                icon.left = x;
                icon.top = y;

                // Necessary for fabric.js too detect new position:
                canvas[uistate.activeCanvas].remove(icon);
                canvas[uistate.activeCanvas].add(icon);
                canvas[uistate.activeCanvas].bringToFront(icon);

                redrawConnections(icon);
            }
        }

        // Necessary for iOS app, otherwise mousedown detected immediately over freshly moved icon
        disableIconForShortTime(selectedIcon);


    } else {
        console.log("Object hit or arrow selected");
    }
};


// Behaviour when questionmark is clicked
onQuestionButtonClicked = function() {
    console.log("Question clicked");
    resetUIstate();
    uistate.audioCue = true;
    var questionIcon = getIconByName("question");
    drawHighlight(questionIcon);
};


// Behaviour when bin is clicked
onBinButtonClicked = function() {
    console.log("Bin clicked");
    if (uistate.newArrow.state === ArrowDrawing.notStarted) {
        console.log(uistate.highlight);
        var icon = getIconByName(uistate.highlight);
        if (icon && !icon.iconFixed) {
            if (icon.iconType === IconType.factor) {
                console.log("Removing factor:", icon.iconName);

                removeConnections(icon);

                canvas[uistate.activeCanvas].remove(icon);
                icon.left = icon.iconHomeX;
                icon.top  = icon.iconHomeY;
                canvas[uistate.activeCanvas].add(icon);
                canvas[uistate.activeCanvas].bringToFront(icon);

            } else if (icon.iconType === IconType.connection) {
                canvas[uistate.activeCanvas].remove(icon);
            }
        }
    }
    resetUIstate();
};


// Behaviour when next is clicked; change to respective video instruction for next mapping
onNextButtonClicked = function() {
    console.log("Next clicked");
    var nextState;
    if (uistate.session.state === State.practiceMapping) {
        if (practiceSolutionCorrect()) {
            console.log("Practice solution is correct");

            nextState = nextSessionState();
            displayVideo(nextState);

        } else {
            console.log("Practice solution is incorrect");
        }

    } else {
        saveResult(uistate.session.state);

        nextState = nextSessionState();
        if (nextState === State.thankYouScreen) displayThankYouScreen();
        else                                    displayVideo(nextState);

    }

};


// Behaviour when previous is clicked
onPreviousButtonClicked = function() {
    console.log("Previous clicked");
    var nextState = previousMappingState();
    if (nextState !== State.none) displayMapping(nextState);
    else                          console.log("No previous mapping state");

};


// Behaviour when arrow button is clicked
onArrowButtonClicked = function(options) {
    var icon = options.target;
    if (!uistate.blockUI) {
        if (uistate.newArrow.weight !== icon.connectionWeight) {

            resetUIstate();
            uistate.newArrow.state = ArrowDrawing.typeSelected;
            uistate.newArrow.weight = icon.connectionWeight;
            drawHighlight(icon);
        } else {
            resetUIstate()
        }
        uistate.blockUI = true;
        setTimeout(function() {
            uistate.blockUI = false
        }, 500)
    }
};


// Behaviour on arrow click
onArrowClicked = function(options) {
    var icon = options.target;
    if (uistate.highlight === icon.iconName)    removeHighlight();
    else                                        drawHighlight(icon);
};


// Behaviour on icon click
onFactorIconClicked = function(options) {
    var icon = options.target;
    console.log("Clicked factor: " + icon.iconName);
    uistate.iconPositions = [
        [icon.left, icon.top]
    ];

    // Necessary for iOS
    if (uistate.disabledIcon === icon.iconName) return;

    if (uistate.highlight === icon.iconName)    removeHighlight();
    else                                        drawHighlight(icon);

    var factorMedia = settings.factorMedia[icon.iconName];
    if (uistate.audioCue && factorMedia.audio) { // when question mark clicked

        console.log("Playing factor audio for: " + icon.iconName);
        playAudio(factorMedia.audio);
        setTimeout(removeHighlight, 1000);
        uistate.audioCue = false;
        return;
    }

    if (icon.left > canvasStyle.leftSideWidth ) {
        console.log("Factor is on canvas");
        switch (uistate.newArrow.state) {
            case ArrowDrawing.notStarted:
                break;
            case ArrowDrawing.typeSelected:
                console.log("Select start for " + icon.iconName);
                uistate.newArrow.state = ArrowDrawing.tailPositioned;
                uistate.newArrow.startIcon = icon.iconName;

                break;
            case ArrowDrawing.tailPositioned:
                if (uistate.newArrow.startIcon === icon.iconName) {
                    console.log("Undo start selection");
                    undoArrowStartSelection();
                }
                else {
                    console.log("Create connection from " + uistate.newArrow.startIcon + " to " + icon.iconName);
                    drawConnection(uistate.newArrow.startIcon, icon.iconName, uistate.newArrow.weight);
                    resetUIstate();
                }
                break;
            default:
                console.log("Connection state is unknown");
                break;
        }
    }
    else {
        console.log("Factor is not on canvas");
    }

    // Necessary for iOS app, otherwise mousedown detected sometimes immediately again
    disableIconForShortTime(icon.iconName)
};



// ---------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------

//

disableIconForShortTime = function(selectedIcon) {
    uistate.disabledIcon = selectedIcon
        setTimeout(function(){
            uistate.disabledIcon = ""
        }, 1000);

}

// Get color and line width from arrow weight
arrowStyle = function(arrowWeight) {
    var width = canvasStyle.arrowLineWidth(Math.abs(arrowWeight));
    var colors = settings.arrowColor;
    var color = colors.neutral;

    if (settings.useNegativeArrows) {
        color = arrowWeight < 0 ? colors.negative : colors.positive;
    }
    return {"color": color, "lineWidth": width}
};


// Check if a factor icon is too close to the others
tooCloseToOtherFactors = function(pointer) {
    var factors = getIconsOfType("factor");

    for (var factorInd = 0; factorInd < factors.length; factorInd++) {

        var factor = factors[factorInd];
        var distance = getDist(pointer, {x: factor.left, y: factor.top});
        if (distance < canvasStyle.minIconDistance) return true;
    }
    return false;
};


// Retrieve icons from canvas. Types are "factor", "connection", "button"
getIconsOfType = function(type) {
    var icons = [];
    $.each(canvas[uistate.activeCanvas].getObjects(), function(c, obj) {
        if (obj.hasOwnProperty("iconType") && obj.iconType === type) {
            icons.push(obj);
        }
    });
    return icons;
};


// Get arrow objects from canvas
/*
getConnectionStrings = function() {
    var icons = getIconsOfType(IconType.connection);

    var arrows = [];
    for (var arrowInd = 0; arrowInd < icons.length; arrowInd++) {
        var icon = icons[arrowInd];
        var names = icon.iconName.split("-");
        var icon1 = getIconByName(names[0]);
        var icon2 = getIconByName(names[1]);
        var name1 = (icon1.iconFixed)? names[0].substring(3) : settings.factorMedia[names[0]].name;
        var name2 = (icon2.iconFixed)? names[1].substring(3) : settings.factorMedia[names[1]].name;
        var infoArray = [name1, name2, icon.connectionWeight];
        arrows.push(infoArray.join(settings.separator));
    }
    return arrows;
};*/

// Get arrow objects from canvas
getConnectionArrays = function() {
    var icons = getIconsOfType(IconType.connection);

    var arrows = [];
    for (var arrowInd = 0; arrowInd < icons.length; arrowInd++) {
        var icon = icons[arrowInd];
        var names = icon.iconName.split("-");
        var icon1 = getIconByName(names[0]);
        var icon2 = getIconByName(names[1]);
        var name1 = (icon1.iconFixed)? names[0].substring(3) : settings.factorMedia[names[0]].name;
        var name2 = (icon2.iconFixed)? names[1].substring(3) : settings.factorMedia[names[1]].name;
        var infoArray = [name1, name2, icon.connectionWeight];
        arrows.push(infoArray);
    }
    return arrows;
};


// Get icons connected to given icon
getFactorConnectionIcons = function(factor) {
    var connections = getIconsOfType(IconType.connection);

    var connectedIcons = [];
    for (var arrowInd = 0; arrowInd < connections.length; arrowInd++) {
        var arrow = connections[arrowInd];
        if (arrow.iconName.indexOf(factor.iconName) !== -1) {
            connectedIcons.push(arrow);
        }
    }
    return connectedIcons;
};


// Revert to of arrow start icon selection
undoArrowStartSelection = function() {
    uistate.newArrow.state = ArrowDrawing.notStarted;
    uistate.newArrow.startIcon = "";
    var arrow = getIconByName("addConnection" + uistate.newArrow.weight);
    drawHighlight(arrow);
};


// Distance to edge of mapping area
withinMappingArea = function(x, y) {

    var passOver = { x: 0, y: 0 };

    var offset = canvasStyle.iconSize / 2;

    var bottomLimit = canvasStyle.height - offset;
    var topLimit    = offset;
    var rightLimit  = canvasStyle.width - canvasStyle.rightSideWidth - offset;
    var leftLimit   = canvasStyle.leftSideWidth;

    if      (x < leftLimit)   passOver.x = x - leftLimit;
    else if (x > rightLimit)  passOver.x = x - rightLimit;
    if      (y < topLimit)    passOver.y = y - topLimit;
    else if (y > bottomLimit) passOver.y = y - bottomLimit;

    return (passOver.x !== 0 || passOver.y !== 0);
};


// Get object from canvas
getIconByName = function(iconName) {
    var objects = canvas[uistate.activeCanvas].getObjects();
    for (var objInd = 0; objInd < objects.length; objInd++) {
        var obj = objects[objInd];
        if (obj.hasOwnProperty("iconName") && obj.iconName === iconName) {
            return obj;
        }
    }
};


// Get anchor for arrow start and end
getIconAnchor = function(iconName) {
    var icon = getIconByName(iconName);
    return { x: icon.left, y: icon.top};
};


// Get Euclidean distance of two vectors
getDist = function(v, w) {
    if (v.hasOwnProperty("x")) {
        return Math.sqrt(Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2));
    } else {
        return Math.sqrt(Math.pow(w.left - v.left, 2) + Math.pow(w.top - v.top, 2));
    }
};


// Get normalized direction vector between positions
getDirv = function(v, w) {
    var d = getDist(v, w);
    if (v.hasOwnProperty("x"))  return { x: (w.x    - v.x)    / d, y: (w.y   - v.y)   / d };
    else                           return { x: (w.left - v.left) / d, y: (w.top - v.top) / d };
};


// Get orthogonal vector
getOrtho = function(v, w) {
    var dVec =  getDirv(v, w);
    return { x: dVec.y, y: -dVec.x };
};


// Calculate vertices for arrow path, right anchor is at arrow tip
leftRightArrow = function(arrowStart, arrowLength, lineWidth) {

    var halfHead = canvasStyle.arrowHead / 2;
    var halfLine = lineWidth / 2;
    var rightX = arrowStart.x + arrowLength;

    var arrowTip = { x: rightX,              y: arrowStart.y            };
    var headB    = { x: rightX - halfHead,   y: arrowStart.y + halfHead };
    var headT    = { x: rightX - halfHead,   y: arrowStart.y - halfHead };
    var br       = { x: rightX - halfHead,   y: arrowStart.y + halfLine };
    var tr       = { x: rightX - halfHead,   y: arrowStart.y - halfLine };
    var bl       = { x: arrowStart.x,        y: arrowStart.y + halfLine };
    var tl       = { x: arrowStart.x ,       y: arrowStart.y - halfLine };

    return [arrowTip, headB, br, bl, tl, tr, headT]
};


// Compares practice solution with drawn diagram
practiceSolutionCorrect = function() {
    var diagramDrawn = listOfLists2csv(getConnectionArrays().sort());
    console.log(diagramDrawn);
    var correctDiagram = listOfLists2csv(settings.practiceSolutionArray.sort());
    console.log(correctDiagram);

    return diagramDrawn === correctDiagram;
};


// Reset state on screen change?
resetUIstate = function() {
    removeHighlight();
    uistate.newArrow.state = ArrowDrawing.notStarted;
    uistate.newArrow.weight = 0;
    uistate.newArrow.startIcon = "";
    uistate.audioCue = false;
};


// Turn every list of the collection into a csv row and every item of a list into a csv cell
listOfLists2csv = function(list) {
    var res = "";
    for (var i = 0; i < list.length; i++) {
        res = res + list[i].join(settings.separator) + "\n";
    }
    return res;
};


// Return string with surrounding double quotes
quoted = function(string) {
    return "\"" + string + "\"";
};

// Save drawing and info to local storage
saveResult = function(mappingState) {
    var mappingType = (mappingState === State.driversMapping)? MappingType.drivers : MappingType.consequences;
    var duration = Math.round((new Date() -  uistate.session.start[mappingType]) / 100) / 10;

    var newInfoArray = [["session", quoted( uistate.session.name )],
                        ["comment", quoted( uistate.session.comment )],
                        ["start", quoted( uistate.session.start[mappingType] ) ],
                        ["duration", quoted( duration ) ],
                        ["mapping type", quoted( mappingType ) ],
                        ["connections"]].concat( getConnectionArrays() );

    console.log(newInfoArray)
    var newInfo = listOfLists2csv(newInfoArray)

    console.log(newInfo);

    var oldInfo = localStorage.getItem(BrowserStorageKey.data);
    oldInfo = (oldInfo == null ? "" : oldInfo);

    localStorage.setItem(BrowserStorageKey.data, oldInfo + "\n" + newInfo + "\n");
};
