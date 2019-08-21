uistate = {

    mapping: "main", // "main" or "practice"
    video: "", // "introduction", "instructions"

    session: {
        start: null,
        name: "",
        comment: ""
    },

    // Canvas state, adjust on startup
    height: 800,
    width: 1280,
    availableHeight: 600, // (- 200)for arrow and factor selection
    yCenter: 400,
    maxFactors: 15,

    xFixedFactor: 1000,
    yFixedFactor: { main: 400, practice: 600 },


    newArrow: {
        state: "select-arrow", // select-start, select-end
        startIcon: "",
        weight: 0
    },

    iconPositions: [],
    highlight: "",
    audioCue: false,
    blockUI: false,

};

var canvas = null;

// Load saved settings or use defaults
settings = defaultSettings; // settings needs to be global
var data = localStorage.getItem("mmetool_settings");


if( data ) {
    settings = JSON.parse(data);
    console.log("Use stored settings");
}
else       console.log("Default settings used");

console.log(settings);

// Compares practice solution with drawn diagram
practiceSolutionCorrect = function() {
    var diagramDrawn = getConnectionStrings().sort().join("");
    var correctDiagram = settings.practiceSolution.sort().join("").replace(" ","\t");

    return diagramDrawn === correctDiagram;
};


// Draw blue icon background
// Only one highlight at a time possible
drawHighlight = function(icon) {
    removeHighlight();
    var bbox = icon.getBoundingRect();
    var margin = canvasStyle.highlightMargin;
    var highlight = new fabric.Rect({
        top: bbox.top - margin / 2,
        left: bbox.left - margin / 2,
        width: bbox.width + margin,
        height: bbox.height + margin,
        selectable: false,
        fill: canvasStyle.highlightColor
    });
    highlight.iconName = "highlight";
    canvas.add(highlight);
    canvas.bringToFront(icon);
    uistate.highlight = icon.iconName;
};


// Remove bounding box from icon
removeHighlight = function() {
    var icon = getIconByName("highlight");
    canvas.remove(icon);
    uistate.highlight = "none";
};


// Reset state  on screen change?
resetUIstate = function() {
    removeHighlight();
    uistate.newArrow.state = "select-arrow";
    uistate.newArrow.weight = 0;
    uistate.newArrow.startIcon = "";
    uistate.audioCue = false;
};


// Choose shown screen
showScreen = function(screenName) {
    $(".screen").hide();
    var screen = $("#" + screenName);
    screen.show();

    switch (screenName) {
        case "display-video":
            if(uistate.video === "introduction")
                $("#video")[0].src = "video/" + settings.introductionVideo;
            else
                $("#video")[0].src = "video/" + settings.instructionVideo;
            break;
        case "mapping-task":
            if (uistate.mapping === "practice") {
                setupMapping();
                $("#audio")[0].src = "audio/" + settings.practiceMappingAudio;
            }
            else if (uistate.mapping === "main") {
                setupMapping();
                uistate.session.start = new Date();
                $("#audio")[0].src = "audio/" + settings.mainMappingAudio;
            }
            break;
        case "thank-you":
            var url = "images/" + settings.thankYouImage;
            var sel = $("#thank-you");
            sel.css("background-image", "url(" + url + ")");
            sel.css("height", uistate.height);
            sel.css("background-position", "center");
            $("#audio")[0].src = "audio/" + settings.thankYouAudio;
            break;
        case "show-data":
            $("#show-data pre").text(localStorage.getItem("mmetool"));
            break;
        case "settings":
            break;
        case "menu":
            break;
        default:
            console.log("Name of screen unknown!");
            break;
    }

    console.log("Loaded screen: " + screenName);
};


// Save drawing and info to local storage
saveResult = function() {
    var duration = Math.round((new Date() -  uistate.session.start) / 100) / 10;

    var newInfo = "session\t" + uistate.session.name +
                  "\ncomment\t" + uistate.session.comment +
                  "\nstart\t" +  uistate.session.start +
                  "\nduration\t" + duration +
                  "\nconnections\n" +
                  getConnectionStrings().join("\n");

    console.log(newInfo);

    var oldInfo = localStorage.getItem("mmetool");
    oldInfo = (oldInfo == null ? "" : oldInfo);

    localStorage.setItem("mmetool", oldInfo + "\n" + newInfo + "\n");
};


// Add button
drawButton = function(name, xLeft, yTop, onmousedown) {
    fabric.Image.fromURL("buttons/" + name + ".png", function(icon) {
        icon.scaleToHeight(canvasStyle.buttonSize);
        icon.scaleToWidth(canvasStyle.buttonSize);
        icon.top = yTop;
        icon.left = xLeft;
        icon.selectable = false;
        icon.iconType = "button";
        icon.iconName = name;
        icon.on("mousedown", onmousedown);
        canvas.add(icon);
    })
};


// Get color and line width from arrow weight
arrowStyle = function(arrowWeight) {
    var factor = canvasStyle.arrowWeightLineWidthFactor;
    var width = Math.floor(Math.abs(arrowWeight)*factor);
    var cChoice = settings.arrowColor;
    var color =  arrowWeight < 0 ? cChoice.negative : cChoice.positive;
    return {"color": color, "lineWidth": width}
};


// Draw arrow in arrow menu
drawMenuArrow = function(arrowInd, arrowWeight, arrowMenu) {

    var style = arrowStyle(arrowWeight);

    var xCenter = arrowMenu.left + (arrowMenu.right - arrowMenu.left) / 2 ;
    var yCenter = arrowMenu.top + (arrowInd + 0.5) * arrowMenu.spacing;

    var left = { x: arrowMenu.left, y: yCenter };
    var right = { x: arrowMenu.right, y: yCenter };

    var arrowLength = getDist(left, right);
    var buttonHeight = canvasStyle.arrowHead + 2*canvasStyle.arrowButtonMargin;
    var buttonWidth = arrowLength + 2* canvasStyle.arrowButtonMargin;

    var arrowOutline = arrowPath(left, right, style.lineWidth);
    var arrowAttributes =  { fill: style.color, originY: "middle" };

    var arrow = new fabric.Polygon(arrowOutline, arrowAttributes);
    var arrowButton = new fabric.Rect({
        top: yCenter ,
        left: xCenter - buttonWidth / 2,
        width: buttonWidth,
        height: buttonHeight,
        stroke: "transparent",
        originY: "center",
        fill: "transparent"
    });

    var icon = new fabric.Group([arrow, arrowButton]);
    icon.iconType = "button";
    icon.iconName = "addConnection" + arrowWeight;
    icon.connectionWeight = arrowWeight;
    icon.selectable = false;
    icon.on("mousedown", onArrowButtonClicked);
    canvas.add(icon);
};


// Behaviour when arrow button is clicked
onArrowButtonClicked = function(options) {
    console.log("arrow clicked");
    var icon = options.target;
    if (!uistate.blockUI) {
        if (uistate.newArrow.weight !== icon.connectionWeight) {
            resetUIstate();
            uistate.newArrow.state = "select-start";
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

// Draw Arrow selection on right side of canvas
setupArrows = function() {

    // Only use negative arrows if specified in settings
    var arrows = settings.arrowWeights;
    if (!settings.useNegativeArrows) {
        arrows = settings.arrowWeights.filter(function(value) {
            return value >= 0;
        });
    }

    // Draw arrow area
    var maxSpace = canvasStyle.arrowMaxVertSpacing;
    var arrowMenuBB = {
        right:  uistate.width - canvasStyle.arrowSideSpacing,
        width: canvasStyle.rightSideWidth - 2*canvasStyle.arrowSideSpacing,
        spacing: Math.min(maxSpace, uistate.availableHeight / arrows.length)
    };

    arrowMenuBB.height = arrowMenuBB.spacing * arrows.length;
    arrowMenuBB.left = arrowMenuBB.right - arrowMenuBB.width;
    arrowMenuBB.top = uistate.yCenter - arrowMenuBB.height / 2;

    for (var arrowInd = 0; arrowInd < arrows.length; arrowInd++) {
        drawMenuArrow(arrowInd, arrows[arrowInd], arrowMenuBB);
    }
};

// Behaviour when icon is moved
onFactorIconMoving = function(options) {
    var icon = options.target;
    removeHighlight();
    if (icon.iconName === uistate.newArrow.startIcon) {
        undoArrowStartSelection();
    }
    else {
        uistate.moving = icon.iconName;
        uistate.iconPositions.push([icon.left, icon.top]);

        // Do not allow passing over mapping area
        var passOver = iconPassOverDistance(icon);
        if (passOver.top !== 0 || passOver.left !== 0) {
            icon.left -= passOver.left;
            icon.top -= passOver.top;
        }
        redrawConnections(icon);
    }
};

// Draw icon on canvas
drawFactorIcon = function(iconName, xLeft, yTop, homeX, homeY, fixed) {
    var factorImage = "images/" + settings.factorMedia[iconName]["img"];
    fabric.Image.fromURL( factorImage, function(icon) {
        icon.scale(canvasStyle.iconSize / Math.max(icon.height, icon.width));
        icon.hasControls = false;
        icon.borderColor = "transparent";
        icon.top = yTop;
        icon.left = xLeft;
        icon.iconType = "factor";
        icon.originX = "center";
        icon.originY = "middle";
        icon.on("mousedown", onFactorIconClicked);

        if (fixed) {
            icon.iconFixed = true;
            icon.iconName = "fg:" + iconName;
            icon.selectable = false;
        }
        else {
            icon.iconFixed = false;
            icon.selectable = false; // causes immobility
            icon.iconName = iconName;
            icon.iconHomeX = homeX;
            icon.iconHomeY = homeY;
        //    icon.on("mouseup", onFactorIconMouseUp);
          //  icon.on("moving", onFactorIconMoving);
        }
        canvas.add(icon);
    });
};

// Check if a factor icon is too close to the others
belowMinimumDistance = function(icon) {
    var factors = getIconsOfType("factor");
    var selectionBorder = canvasStyle.leftSideWidth;

    for (var factor of factors) {

        if ( icon.iconName !== factor.iconName ) {
            var distance = getDist(icon, factor);
            if (icon.left > selectionBorder && factor.left > selectionBorder) { // both icons on canvas
                if (distance < canvasStyle.minIconDistance) return true;
            } else {
                if (icon.left <= selectionBorder && factor.left < selectionBorder) { // both in selection menu
                    if (distance < canvasStyle.iconSize) return true;
                }
            }
        }
    }
    return false;
};


// On mouse up: move icon to last valid position
onFactorIconMouseUp = function(options) {
    var icon = options.target;
    while (belowMinimumDistance(icon) && uistate.iconPositions.length > 0) {
        var lastPosition = uistate.iconPositions.pop();
        icon.left = lastPosition[0];
        icon.top = lastPosition[1];
    }
    //canvas.remove(icon);
    //canvas.add(icon);
    redrawConnections(icon);
    uistate.iconPositions = []
};


// Retrieve icons from canvas. Types are "factor", "connection", "button"
getIconsOfType = function(type) {
    var icons = [];
    $.each(canvas.getObjects(), function(c, obj) {
        if (obj.hasOwnProperty("iconType") && obj.iconType === type) {
            icons.push(obj);
        }
    });
    return icons;
};


// Get arrow objects from canvas
getConnectionStrings = function() {
    var factors = getIconsOfType("connection");

    var arrows = [];
    for (var icon of factors) {
        var infoArray = icon.iconName.split("-").concat(icon.connectionWeight);
        arrows.push(infoArray.join("\t"));
    }
    return arrows;
};


// Get icons connected to given icon
getFactorConnectionIcons = function(icon) {
    var factors = getIconsOfType("connection");

    var connectedIcons = [];
    for (var factor of factors) {
        if (factor.iconName.indexOf(icon.iconName) !== -1) {
            connectedIcons.push(factor);
        }
    }
    return connectedIcons;
};


// Revert to of arrow start icon selection
undoArrowStartSelection = function() {
    uistate.newArrow.state = "select-start";
    uistate.newArrow.startIcon = "";
    var arrow = getIconByName("addConnection" + uistate.newArrow.weight);
    drawHighlight(arrow);
};



// Behaviour on icon click
onFactorIconClicked = function(options) {
    var icon = options.target;
    console.log("Clicked factor: " + icon.iconName);
    uistate.iconPositions = [
        [icon.left, icon.top]
    ];

    if (uistate.highlight === icon.iconName)    removeHighlight();
    else                                        drawHighlight(icon);

    var factorMedia = settings.factorMedia[icon.iconName];
    if (uistate.audioCue && factorMedia.audio) { // when question mark clicked

        console.log("Playing factor audio for: " + icon.iconName);
        $("audio")[0].src = "audio/" + factorMedia.audio;
        setTimeout(removeHighlight, 1000);
        uistate.audioCue = false;
        return;
    }

    if (icon.left > canvasStyle.leftSideWidth ) {
        console.log("Factor is on canvas");
        switch (uistate.newArrow.state) {
            case "select-arrow":
                break;
            case "select-start":
                console.log("select start: " + icon.iconName);
                uistate.newArrow.state = "select-end";
                uistate.newArrow.startIcon = icon.iconName;
                break;
            case "select-end":
                if (uistate.newArrow.startIcon === icon.iconName) {
                    console.log("Undo start selection");
                    undoArrowStartSelection();
                }
                else {
                    console.log("create connection from " + uistate.newArrow.startIcon + " to " + icon.iconName);
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
};


// Calculate signed x and y distance from allowable area
iconPassOverDistance = function(icon) {
    var hasConnection = getFactorConnectionIcons(icon).length > 0;

    return passOverDistance(icon.left, icon.top, hasConnection);
};

passOverDistance = function(x, y, withLeftSide=false) {
    var passOver = { x: 0, y: 0, occurs: false };

    var offset = canvasStyle.iconSize / 2;

    var bottomLimit = uistate.height - offset;
    var topLimit    = offset;
    var rightLimit  = uistate.width - canvasStyle.rightSideWidth - offset;
    var leftLimit   = offset;
    if (!withLeftSide) leftLimit +=  canvasStyle.leftSideWidth;

    if      (x < leftLimit)   passOver.x = x - leftLimit;
    else if (x > rightLimit)  passOver.x = x - rightLimit;
    if      (y < topLimit)    passOver.y = y - topLimit;
    else if (y > bottomLimit) passOver.y = y - bottomLimit;

    passOver.occurs = (passOver.x !== 0 || passOver.y !== 0);

    return passOver;
};


// Redraw arrows connected to icon
redrawConnections = function(icon) {
    var connIcons = getFactorConnectionIcons(icon);
    for (var connectedIcon of connIcons) {
        var factors = connectedIcon.iconName.split("-");

        canvas.remove(connectedIcon);
        drawConnection(factors[0], factors[1], connectedIcon.connectionWeight);
    }
};


// Remove arrows connected to icon
removeConnections = function(icon) {
    var connIcons = getFactorConnectionIcons(icon);
    for (var connectedIcon of connIcons) {
        canvas.remove(connectedIcon);
    }
};


// Get object from canvas
getIconByName = function(iconName) {
    for (var obj of canvas.getObjects()) {
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


// Behaviour on arrow click
onArrowClicked = function(options) {
    var icon = options.target;
    if (uistate.highlight === icon.iconName)    removeHighlight();
    else                                        drawHighlight(icon);
};


// Draw arrow between symbols, only horizontal?
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

        var leftAnchor = {
            x: startPos.x + dFromCenter * dirVec.x,
            y: startPos.y + dFromCenter * dirVec.y + canvasStyle.arrowHead / 2
        };

        var rightAnchor = {
            x: leftAnchor.x + arrowLength,
            y: leftAnchor.y
        };

        var arrowOutline = arrowPath(leftAnchor, rightAnchor, style.lineWidth);
        var arrow = new fabric.Polygon(arrowOutline, {fill: style.color});
        arrow.centeredRotation = false;
        arrow.rotate(180 * Math.atan2(dirVec.y, dirVec.x) / Math.PI);
        arrow.borderColor = "transparent";
        arrow.hasControls = false;
      //  arrow.movable = false;

        arrow.selectable = false;
        arrow.iconType = "connection";
        arrow.iconName = startIconName + "-" + endIconName;
        arrow.connectionWeight = weight;
        arrow.on("mousedown", onArrowClicked);
        /*
        arrow.on("mouseup", function () {
            // if right of mapping area remove arrow
            var rightLimit = uistate.width - canvasStyle.leftSideWidth + canvasStyle.arrowDeletionToleranceMargin;
            if (arrow.oCoords.mr.x > rightLimit || arrow.oCoords.ml.x > rightLimit) {
                canvas.remove(arrow);
            } else {
                canvas.remove(arrow);
                drawConnection(startIconName, endIconName, weight);
            }
        });*/
        canvas.add(arrow);
    }
};

// Divide canvas into 3 areas
divideCanvas = function() {
    var leftSide = new fabric.Rect({
        top: 0,
        left: 0,
        width: canvasStyle.leftSideWidth,
        height: uistate.height,
        fill: "#EAEAEA",
        selectable: false
    });
    var leftBorder = new fabric.Rect({
        top: 0,
        left: canvasStyle.leftSideWidth,
        width: canvasStyle.borderWidth,
        height: uistate.height,
        fill: "#BBBBBB",
        selectable: false
    });
    var rightSide = new fabric.Rect({
        top: 0,
        left: uistate.width - canvasStyle.rightSideWidth,
        width: canvasStyle.rightSideWidth,
        height: uistate.height,
        fill: "#EAEAEA",
        selectable: false
    });
    var rightBorder = new fabric.Rect({
        top: 0,
        left: uistate.width - canvasStyle.rightSideWidth - canvasStyle.borderWidth,
        width: canvasStyle.borderWidth,
        height: uistate.height,
        fill: "#AAAAAA",
        selectable: false
    });

    canvas.add(rightSide);
    canvas.add(rightBorder);
    canvas.add(leftSide);
    canvas.add(leftBorder);
};


// Layout of factor menu on left side of screen
setupFactorMenu = function(factors) {
    var nCols = canvasStyle.factorsPerRow;
    var nRows = Math.ceil(factors.length / nCols);
    var horIconSpace = nCols * canvasStyle.iconSize + canvasStyle.factorXPadding * (nCols - 1);
    var vertIconSpace = nRows * canvasStyle.iconSize + canvasStyle.factorYPadding * (nRows - 1);
    var xOffset = (canvasStyle.leftSideWidth - horIconSpace)/2;
    var yOffset = canvasStyle.buttonSize + (uistate.availableHeight - vertIconSpace)/2;

    for (var factorInd = 0; factorInd < factors.length; factorInd++) {
        var col = factorInd % nCols;
        var row = Math.floor(factorInd / nCols);
        var xLeft = xOffset + ((canvasStyle.factorXPadding + canvasStyle.iconSize) * col) + canvasStyle.iconSize/2;
        var yTop = yOffset + (canvasStyle.factorYPadding + canvasStyle.iconSize) * row + canvasStyle.iconSize/2;
        drawFactorIcon(factors[factorInd], xLeft, yTop, xLeft, yTop, false);
    }
};

onNextButtonClicked = function() {
    console.log("Next clicked");
    if (uistate.mapping === "practice") {
        if (practiceSolutionCorrect()) {
            uistate.mapping = "finished";
            uistate.video = "instructions";
            showScreen("display-video");
        }
    } else {
        uistate.mapping = "finished";
        showScreen("thank-you");
        saveResult();
    }
};

onQuestionButtonClicked = function() {
    console.log("Question clicked");
    resetUIstate();
    uistate.audioCue = true;
    var questionIcon = getIconByName("question");
    drawHighlight(questionIcon);
};

onBinButtonClicked = function() {
    console.log("Bin clicked");
    if (uistate.newArrow.state === "select-arrow") {
        console.log(uistate.highlight);
        var icon = getIconByName(uistate.highlight);
        if (icon && !icon.iconFixed) {
            if (icon.iconType === "factor") {
                console.log("Removing factor:", icon.iconName);

                removeConnections(icon);

                canvas.remove(icon);
                icon.left = icon.iconHomeX;
                icon.top  = icon.iconHomeY;
                canvas.add(icon);

            } else if (icon.iconType === "connection") {
                canvas.remove(icon);
            }
        }
    }
    resetUIstate();
};

// Layout and behaviour of drawing screen
setupMapping = function() {
    console.log("Setting up: " + uistate.mapping);

    var factors =  settings.factors[uistate.mapping];
    var dynamicFactors = factors["dynamic"];
    var fixedFactor = factors["fixed"];

    canvas.clear();

    // Set up arrows and factors
    divideCanvas();
    setupArrows();
    setupFactorMenu(dynamicFactors);
    console.log("Draw factors", dynamicFactors);
    drawFactorIcon(fixedFactor, uistate.xFixedFactor,  uistate.yFixedFactor[uistate.mapping], uistate.xFixedFactor,  uistate.yFixedFactor[uistate.mapping], true);

    // Setup buttons
    drawButton("question", 100, uistate.height - canvasStyle.buttonSize, onQuestionButtonClicked);
    drawButton("next", uistate.width - 110, uistate.height - canvasStyle.buttonSize, onNextButtonClicked);
    drawButton("bin", uistate.width - 130, 0 , onBinButtonClicked);

    if (uistate.mapping === "practice") {
        fabric.Image.fromURL("images/" + settings.solutionImage, function(image) {
            image.scale(0.2);
            image.top = uistate.height/4 - 170; // 170 is image height now
            image.originX = "right";
            image.left = uistate.width - canvasStyle.rightSideWidth;
            image.selectable = false;
            image.opacity = 0.5;
            canvas.add(image)
        })
    }
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
arrowPath = function(leftAnchor, rightAnchor, lineWidth) {
    var headSize = canvasStyle.arrowHead;
    var dLR = getDirv(leftAnchor, rightAnchor);
    var dTB = getOrtho(leftAnchor, rightAnchor);

    var arrowTip = rightAnchor;
    var headB = {
        x: rightAnchor.x + dTB.x * headSize / 2  - dLR.x * headSize / 2,
        y: rightAnchor.y + dTB.y * headSize / 2  - dLR.y * headSize / 2
    };
    var headT = {
        x: rightAnchor.x - dTB.x * headSize / 2  - dLR.x * headSize / 2,
        y: rightAnchor.y - dTB.y * headSize / 2  - dLR.y * headSize / 2
    };
    var br = {
        x: rightAnchor.x + dTB.x * lineWidth / 2 - dLR.x * headSize / 2,
        y: rightAnchor.y + dTB.y * lineWidth / 2 - dLR.y * headSize / 2
    };
    var tr = {
        x: rightAnchor.x - dTB.x * lineWidth / 2 - dLR.x * headSize / 2,
        y: rightAnchor.y - dTB.y * lineWidth / 2 - dLR.y * headSize / 2
    };
    var bl = {
        x: leftAnchor.x  + dTB.x * lineWidth / 2,
        y: leftAnchor.y  + dTB.y * lineWidth / 2
    };
    var tl = {
        x: leftAnchor.x  - dTB.x * lineWidth / 2,
        y: leftAnchor.y  - dTB.y * lineWidth / 2
    };
    return [arrowTip, headB, br, bl, tl, tr, headT]
};


// Download data, as defined in browser
downloadData = function() {
    var csvContent = "data:text/csv;charset=utf-8,";

    var data = localStorage.getItem("mmetool");
    data = data? data : "No data";
    csvContent += data;

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mmetool_data.csv");
    document.body.appendChild(link); // Required for firefox

    link.click();
};


// Use current window size to determine positions on canvas
adjustCanvasSizesToScreen = function() {

    uistate.height = $(window).height();
    uistate.width = $(window).width();
    uistate.availableHeight = uistate.height - 2*canvasStyle.buttonSize;
    uistate.yCenter = uistate.height/2;
    uistate.maxFactors = Math.floor(uistate.availableHeight/canvasStyle.minIconDistance) * canvasStyle.factorsPerRow;
    uistate.xFixedFactor = uistate.width - canvasStyle.rightSideWidth - canvasStyle.iconSize - canvasStyle.fixedFactorDist;
    uistate.yFixedFactor.main = uistate.height/2 - canvasStyle.iconSize/2 ;
    uistate.yFixedFactor.practice = uistate.height * 3.0/4 - canvasStyle.iconSize/2;

};


// Behaviour when canvas is clicked
onCanvasClicked = function(options) {
    console.log("canvas clicked");
    console.log("target");
    console.log(options.target);
    if (!options.target && uistate.newArrow.state === "select-arrow") {
        console.log("empty canvas clicked");
        console.log(uistate.highlight);
        var icon = getIconByName(uistate.highlight);
        console.log(icon);


        if (icon && (icon.iconType === "factor")) {
            var passOver = passOverDistance(options.e.clientX, options.e.clientY);
            if (!passOver.occurs) {
                removeHighlight();

                canvas.remove(icon);
                icon.left = options.e.clientX;
                icon.top = options.e.clientY;
                canvas.add(icon);

                redrawConnections(icon);
            }
        }
    }
};


// Set up canvas according to current window size
setupCanvas = function() {

    adjustCanvasSizesToScreen();

    canvas = new fabric.Canvas("mapping-canvas", {
        width: uistate.width,
        height: uistate.height
    });

    canvas.on("mouse:down", onCanvasClicked);

    canvas.selection = false;
    canvas.hoverCursor = "default";
};


// Add elements to media selection
populateSelection = function(element, mediaType, defaultValue, optional) {

    if (optional) {
        var option = document.createElement("option");

        option.value = "";
        option.textContent = "None";
        option.selected = true;

        element.appendChild(option);
    }

    for (var filename of mediaSources[mediaType]) {
        console.log(filename)
        var option = document.createElement("option");

        option.value = filename;
        option.textContent = filename;

        element.appendChild(option);

        if (filename === defaultValue) option.selected = true;
    }
};


// Add elements to media selection of given type
populateSelectionForClass = function(className, mediaType) {

    var element = document.getElementsByClassName(className);

    for (var i = 0; i< element.length; i++) {
        var defaultValue = settings[element[i].id];
        populateSelection(element[i], mediaType, defaultValue, false);
    }
};


// Draw row for factor in table
factorRow = function(factorKey, used, fixed, defaultName, defaultImg, defaultAudio) {
    var tr = document.createElement("tr");
    tr.className = "factorRow";
    tr.name = factorKey;

    // use?
    var td = document.createElement("td");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "useFactor";
    input.name = factorKey;
    input.checked = used;
    td.appendChild(input);
    tr.appendChild(td);


    // fixed?
    var td1 = document.createElement("td");
    var input1 = document.createElement("input");
    input1.type = "checkbox"; // only one may be checked
    input1.className = "fixedFactor";
    input1.name = factorKey;
    if (fixed) input1.checked = true;
    input1.onclick = function(v) {
        var box = v.target;
        if (box.checked === true) {
            $(".fixedFactor").prop("checked", false);
            box.checked = true;
            var f = $(".useFactor[name="+ box.name +"]")[0];
            f.checked = true;
        } else {
            box.checked = false;
        }
    };
    td1.appendChild(input1);
    tr.appendChild(td1);

    // name
    var td5 = document.createElement("td");
    var input5 = document.createElement("input");
    input5.type = "text";
    input5.className = "factorName";
    input5.name = factorKey;
    input5.defaultValue = defaultName;
    td5.appendChild(input5);
    tr.appendChild(td5);

    // Image
    var td2 = document.createElement("td");
    var input2 = document.createElement("select");
    input2.name = factorKey;
    input2.className = "factorImg";
    populateSelection(input2, "images", defaultImg, false);
    td2.appendChild(input2);
    tr.appendChild(td2);

    // Sound
    var td3 = document.createElement("td");
    var input3 = document.createElement("select");
    input3.name = factorKey;
    input3.className = "factorAudio";
    populateSelection(input3, "audio", defaultAudio, true);
    td3.appendChild(input3);
    tr.appendChild(td3);

    // Delete
    var td4 = document.createElement("td");
    var input4 = document.createElement("button");
    input4.name = factorKey;
    input4.onclick = function(v) {
        var row = v.target.parentElement.parentElement;
        row.hidden = true;
    };
    input4.innerHTML = "Delete";
    td4.appendChild(input4);
    tr.appendChild(td4);

    return tr;
};


// Get list of factors present
listFactors = function() {
    var factorTable = document.getElementById("factorMedia");
    for (var factorKey in settings.factorMedia){
        var factor = settings.factorMedia[factorKey];

        if (!factor.practice) {
            var fixed = settings.factors.main.fixed === factorKey;
          //  var used = settings.factors.main.dynamic.includes(factorKey) || fixed; // include not working on android
            var used = (settings.factors.main.dynamic.indexOf(factorKey) !== -1) || fixed;
            var tr = factorRow(factorKey, used, fixed, factor["name"], factor["img"], factor["audio"]);

            factorTable.appendChild(tr);
        }
    }
};


// New factor row
addFactorRow = function () {
    var factorTable = document.getElementById("factorMedia");
    var key = "custom_key_" + settings.customFactorNumber;
    var tr = factorRow(key, false, false, key, "", "");

    factorTable.appendChild(tr);
    settings.customFactorNumber += 1;
};


// Set up settings screen
initSettings = function() {

    listFactors();
    populateSelectionForClass("videoChooser", "video");
    populateSelectionForClass("audioChooser", "audio");
    populateSelectionForClass("imageChooser", "images");

    $("#negativeArrows")[0].checked = settings.useNegativeArrows;

};


// Apply given changes
saveSettings = function () {

    // Set negative arrows option
    var arrowOption = document.getElementById("negativeArrows");
    if (arrowOption) settings.useNegativeArrows = arrowOption.checked;

    // Set media
    var mediaList = [ "instructionVideo", "introductionVideo", "thankYouImage",
        "thankYouAudio", "mainMappingAudio", "practiceMappingAudio"];
    for (var item of mediaList) {
        var element = document.getElementById(item);
        var mediaFile = element.options[element.selectedIndex].value;
        if (mediaFile && mediaFile !== "") settings[item] = mediaFile;
    }

    // Set used factors
    settings.factors.main.fixed = "";
    settings.factors.main.dynamic = [];
    var factorRows = document.getElementsByClassName("factorRow");
    for (var row of factorRows) {
        var factorKey = row.name;
        if (!row.hidden) {
            var use = $("input.useFactor[name=" + factorKey + "]")[0].checked;
            var fixed = $("input.fixedFactor[name=" + factorKey + "]")[0].checked;
            var name = $("input.factorName[name=" + factorKey + "]")[0].value;
            var img = $("select.factorImg[name=" + factorKey + "]")[0].value;
            var audio = $("select.factorAudio[name=" + factorKey + "]")[0].value;

            settings.factorMedia[factorKey] = {"name": name, "img": img};
            if(audio) settings.factorMedia[factorKey]["audio"] = audio;

            if    (fixed) settings.factors.main.fixed = factorKey;
            else if (use) settings.factors.main.dynamic.push(factorKey);
        }
        else {
            delete settings.factorMedia[factorKey];
        }
    }

    localStorage.setItem("mmetool_settings", JSON.stringify(settings));
};


// Behaviour on startUp
window.onload = function() {

    initSettings();
    setupCanvas();

    $("#audio").on("loadeddata", function(a) {
        a.target.play();
    });
    $("#video").on("ended", function(a) {
        uistate.mapping = (uistate.video === "introduction")? "practice" : "main";
        showScreen("mapping-task");
    });

    // On menu screen
    $("#btn-introduction").on("click", function() {
        uistate.video = "introduction";
        showScreen("display-video", settings.introductionVideo);
    });
    $("#btn-practice").on("click", function() {
        uistate.mapping = "practice";
        showScreen("mapping-task")
    });
    $("#btn-instructions").on("click", function() {
        uistate.video = "instructions";
        showScreen("display-video", settings.instructionVideo);
    });
    $("#btn-mapping").on("click", function() {
        uistate.sessionName = $("#session")[0].value;
        uistate.sessionComment = $("#comment")[0].value;
        uistate.mapping = "main";
        showScreen("mapping-task");
    });
    $("#btn-data").on("click", function() {
        showScreen("show-data");
    });
    $("#btn-download").on("click", function() {
        downloadData();
    });
    $("#btn-settings").on("click", function() {
        showScreen("settings");
    });

    // On thank you screen
    $("#btn-ty-back").on("click", function() {
        showScreen("mapping-task");
        uistate.mapping = "main";
    });
    $("#btn-ty-tomain").on("click", function() {
        showScreen("menu");
    });

    // On settings screen
    $("#btn-save-settings").on("click", function() {
        saveSettings();
        showScreen("menu");
    });
    $("#btn-cancel-settings").on("click", function() {
        showScreen("menu");
    });
    $("#btn-add-factor").on("click", function() {
        addFactorRow();
    });

    showScreen("menu");
};

