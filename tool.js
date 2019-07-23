uistate = {

    mapping: "main", // "main" or "practice"
 //   current: "main", // introduction, practice, instructions, mapping, show-data, setings
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
 //   availableWidth: 734, // on mapping area (-546)
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
    blockUI: false

};

var canvas = null;

// Load saved settings or use defaults
settings = defaultSettings; // settings needs to be global
var data = localStorage.getItem("mmetool_settings");
//console.log(data);
if( data ) {
    settings = JSON.parse(data);
    console.log("Use stored settings");
}
else       console.log("Default settings used");
//console.log(settings);


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
    var b = icon.getBoundingRect();
    var d = canvasStyle.highlightMargin;
    var a = new fabric.Rect({
        top: b.top - d / 2,
        left: b.left - d / 2,
        width: b.width + d,
        height: b.height + d,
        selectable: false,
        fill: canvasStyle.highlightColor
    });
    a.iconName = "highlight";
    canvas.add(a);
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
    var screen = $("#" + screenName)
    screen.show();

    switch (screenName) {
        case "display-video":
            if(uistate.video === "introduction")
                $("#video")[0].src = "video/" + settings.introductionVideo;
            else
                $("#video")[0].src = "video/" + settings.instructionVideo;
            break;
        case "mapping-task":
            setupMapping();
            if (uistate.mapping === "practice")
                $("#audio")[0].src = "audio/" + settings.practiceMappingAudio;
            else {
                uistate.session.start = new Date();
                $("#audio")[0].src = "audio/" + settings.mainMappingAudio;
            }
            break;
        case "thank-you":
            var url = "images/" + settings.thankYouImage;
            $("#thank-you").css("background-image", "url(" + url + ")");
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
    var factor = canvasStyle.arrowWeightLinewidthFactor;
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

    var arrowOutline = arrowPath(left, right, style.lineWidth);
    var arrowAttributes =  { fill: style.color, originY: "center" };

    var arrow = new fabric.Polygon(arrowOutline, arrowAttributes);
    var arrowButton = new fabric.Rect({
       // top: arrowMenu.top + arrowInd * arrowMenu.spacing - 36,
        top: yCenter -  canvasStyle.arrowButtonHeight / 2,
        left: xCenter - canvasStyle.arrowButtonWidth / 2,
        width: canvasStyle.arrowButtonWidth,
        height: canvasStyle.arrowButtonHeight,
        stroke: "transparent",
        fill: "transparent"
    });

    var icon = new fabric.Group([arrow, arrowButton]);
    icon.iconType = "button";
    icon.iconName = "addConnection" + arrowWeight;
    icon.connectionWeight = arrowWeight;
    icon.selectable = false;
    icon.on("mousedown", function() {
        if (uistate.blockUI) {
            return
        }
        if (uistate.newArrow.weight !== icon.connectionWeight) {
            resetUIstate();
            uistate.newArrow.state = "select-start";
            uistate.newArrow.weight = arrowWeight;
            drawHighlight(icon);
        } else {
            resetUIstate()
        }
        uistate.blockUI = true;
        setTimeout(function() {
            uistate.blockUI = false
        }, 500)
    });
    canvas.add(icon);
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
      //  spacing: arrows.length < 6 ? 100 : (500 / arrows.length)
        spacing: Math.min((maxSpace, uistate.availableHeight / arrows.length))
    };

   // arrowMenuBB.height = arrowMenuBB.spacing * ( arrows.length - 1) + settings.arrowHead[0];
    arrowMenuBB.height = arrowMenuBB.spacing * arrows.length;
    arrowMenuBB.left = arrowMenuBB.right - arrowMenuBB.width;
    //arrowMenuBB.top = (420 - arrowMenuBB.height / 2);
    arrowMenuBB.top = uistate.yCenter - arrowMenuBB.height / 2;

    for (var arrowInd = 0; arrowInd < arrows.length; arrowInd++) {
        drawMenuArrow(arrowInd, arrows[arrowInd], arrowMenuBB);
    }
};


// Draw icon on canvas
drawFactorIcon = function(iconName, xLeft, yTop, fixed) {
    //var factorImage = "images/factors/" + settings.factorMedia[iconName]["img"];
    var factorImage = "images/" + settings.factorMedia[iconName]["img"];
    fabric.Image.fromURL( factorImage, function(icon) {
        icon.scale(settings.iconSize / (icon.height > icon.width ? icon.height : icon.width)); // scaling already working!! check if float division!
        icon.hasControls = false;
        icon.borderColor = "transparent";
        icon.top = yTop;
        icon.left = xLeft;
        icon.iconType = "factor";
        icon.originX = "center";
        icon.originY = "middle";
        icon.on("mousedown", function() {
            factorIconClick(this);
        });
        if (fixed) {
            icon.iconName = "fg:" + iconName;
            icon.selectable = false;
            //  getIconByName("fg:" + fixedFactor).bringToFront()?
        }
        else {
            icon.iconName = iconName;
            icon.on("mouseup", function(e) {
                repositionFactorIcon(this);
            });
            icon.on("moving", function(e) {
                if (icon.iconName === uistate.newArrow.startIcon) {
                    undoArrowStartSelection();
                }
                else {
                    factorIconMoving(this);
                }
            });
        }

        canvas.add(icon);
    })
};


// Check if factor icon are too close
belowMinimumDistance = function(icon) {
    var factors = getIconsOfType("factor");

    var selectionBorder = canvasStyle.leftSideWidth;
    for (var factor of factors) {

        if ( icon.iconName !== factor.iconName ) {
            var distance = getDist(icon, factor);
            if (icon.left > selectionBorder && factor.left > selectionBorder) { // both icons on canvas
                if (distance < canvasStyle.minIconDistance) return true;
            } else {
                if (icon.left <= selectionBorder && factor.left < selectionBorder) { // both in selection
                    if (distance < canvasStyle.iconSize) return true;
                }
            }
        }
    }
    return false;
};


// On mouse up: move icon to last valid position
repositionFactorIcon = function(icon) {
    while (belowMinimumDistance(icon) && uistate.iconPositions.length > 0) { // if intersection
        var lastPosition = uistate.iconPositions.pop();
        icon.left = lastPosition[0];
        icon.top = lastPosition[1];
    }
    canvas.remove(icon); // redraw icon
    canvas.add(icon);
    uistate.iconPositions = []
};


// Retrieve icons from canvas. Types are "factor", "connection", "button"
getIconsOfType = function(type) { // TODO: use!
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


//  Get icons connected to given icon
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


undoArrowStartSelection = function() {
    uistate.newArrow.state = "select-start";
    uistate.newArrow.startIcon = "";
    var arrow = getIconByName("addConnection" + uistate.newArrow.weight);
    drawHighlight(arrow);
};



// Behaviour on icon click
factorIconClick = function(icon) {
    console.log("Clicked factor: " + icon.iconName);
    uistate.iconPositions = [
        [icon.left, icon.top]
    ];

    if (uistate.audioCue) { // when question mark clicked
        console.log("Playing factor audio for: " + icon.iconName);
        $("audio")[0].src = "audio/factors/" + settings.factorMedia[icon.iconName]["audio"];
        drawHighlight(icon);
        setTimeout(function() {
            removeHighlight();
        }, 1000);
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
                drawHighlight(icon);
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
    var passOver = { left: 0, top: 0 };

    var offset = settings.iconSize / 2;
    var hasConnection = getFactorConnectionIcons(icon).length > 0;

    var bottomLimit = uistate.height - offset;
    var topLimit    = offset;
    var rightLimit  = uistate.width - canvasStyle.rightSideWidth - offset;
    var leftLimit   = offset;
    if (hasConnection) leftLimit +=  canvasStyle.leftSideWidth;

    if      (icon.left < leftLimit)   passOver.left = icon.left - leftLimit;
    else if (icon.left > rightLimit)  passOver.left = icon.left - rightLimit;
    if      (icon.top  < topLimit)    passOver.top  = icon.top  - topLimit;
    else if (icon.top  > bottomLimit) passOver.top  = icon.top  - bottomLimit;

    return passOver;
};


// Behaviour when icon is moved
factorIconMoving = function(icon) {

    uistate.moving = icon.iconName;
    uistate.iconPositions.push([icon.left, icon.top]); // save position (of mouse? not after passOvercheck?) for repositioning later

    // Do not allow passing over mapping area
    var passOver = iconPassOverDistance(icon);
    if (passOver.top !== 0 || passOver.left !== 0) {
        icon.left -= passOver.left;
        icon.top -= passOver.top;
        uistate.actualPosition = { // used?
            x: icon.left,
            y: icon.top
        }
    }

    // Redraw arrows on move
    var connIcons = getFactorConnectionIcons(icon);
    for (var icon of connIcons) {
        canvas.remove(icon);
        console.log("redraw");
        var factors = icon.iconName.split("-");
        drawConnection(factors[0], factors[1], icon.connectionWeight);
    }
    uistate.actualPosition = {};
};


// Get object from canvas
getIconByName = function(iconName) {
    for (var obj of canvas.getObjects()) {
        if (obj.hasOwnProperty("iconName") && obj.iconName === iconName) {
            return obj;
        }
    }
    return undefined;
};


// Get anchor for arrow start and end
getIconAnchor = function(iconName) {
    var icon = getIconByName(iconName);
    return { x: icon.left, y: icon.top};
};


// Draw arrow between symbols
drawConnection = function(startIconName, endIconName, weight) {

    if (startIconName !== endIconName) {
        var style = arrowStyle(weight);

        var startPos = getIconAnchor(startIconName);
        var endPos = getIconAnchor(endIconName);

        var dirVec = getDirv(startPos, endPos);
        var distance = getDist(startPos, endPos);

        if (distance > settings.minIconDistance + canvasStyle.arrowMargin) {
            var d = settings.iconSize / 2 + canvasStyle.arrowMargin;
        } else {
            var d = (distance / 2 - 10);
        }
        var leftAnchor = {
            x: startPos.x + d * dirVec.x,
            y: startPos.y + d * dirVec.y + canvasStyle.arrowHead / 2
        };
        var e = {
            x: endPos.x - d * dirVec.x,
            y: endPos.y - d * dirVec.y + canvasStyle.arrowHead / 2
        };
        var c = getDist(leftAnchor, e);
        c = c < 20 ? 20 : c;
        var rightAnchor = {
            x: leftAnchor.x + c,
            y: leftAnchor.y
        };

        var arrowOutline = arrowPath(leftAnchor, rightAnchor, style.lineWidth);
        var arrow = new fabric.Polygon(arrowOutline, { fill: style.color });
        arrow.centeredRotation = false;
        arrow.rotate(180 * Math.atan2(dirVec.y, dirVec.x) / Math.PI);
        arrow.borderColor = "transparent";
        arrow.hasControls = false;
        arrow.movable = true;
        arrow.iconType = "connection";
        arrow.iconName = startIconName + "-" + endIconName;
        arrow.connectionWeight = weight;
        arrow.on("mouseup", function() {
            // if right of mapping area remove arrow
            var rightLimit = uistate.width - canvasStyle.leftSideWidth + canvasStyle.arrowDeletionToleranceMargin;
            if (arrow.oCoords.mr.x > rightLimit || arrow.oCoords.ml.x > rightLimit) {
                canvas.remove(arrow);
            } else {
                canvas.remove(arrow);
                drawConnection(startIconName, endIconName, weight);
            }
        });
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
    console.log( xOffset);
    console.log(yOffset);
    for (var factorInd = 0; factorInd < factors.length; factorInd++) {
        var col = factorInd % nCols;
        var row = Math.floor(factorInd / nCols);
    //    var xLeft = (5 + ((4 - c) * settings.iconSize / 2)) + ((10 + settings.iconSize) * col);
        var xLeft = xOffset + ((canvasStyle.factorXPadding + canvasStyle.iconSize) * col) + canvasStyle.iconSize/2;
      //  var yTop = (100 + settings.iconSize / 2) + ((30 + settings.iconSize) * row);
        var yTop = yOffset + (canvasStyle.factorYPadding + canvasStyle.iconSize) * row + canvasStyle.iconSize/2;
        drawFactorIcon(factors[factorInd], xLeft, yTop, false);
    }
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
    drawFactorIcon(fixedFactor, uistate.xFixedFactor,  uistate.yFixedFactor[uistate.mapping], true);

    // Setup "question" button
    drawButton("question", 100, uistate.height - canvasStyle.buttonSize , function() {
        resetUIstate();
        uistate.audioCue = true;
        var questionIcon = getIconByName("question");
        drawHighlight(questionIcon);
    });

    // Setup "next" button
    drawButton("next", uistate.width - 110, uistate.height - canvasStyle.buttonSize, function() {
        if (uistate.mapping === "practice") {
            if (practiceSolutionCorrect()) {
                uistate.video = "instructions"
                showScreen("display-video");
            }
        } else {
            showScreen("thank-you");
            saveResult();
        }
    });


    if (uistate.mapping === "practice") {
        fabric.Image.fromURL("images/" + settings.solutionImage, function(image) {
            image.scale(0.2);
         //   image.top = 10;
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
getDist = function(d, c) {
    if (d.hasOwnProperty("x")) {
        return Math.sqrt(Math.pow(c.x - d.x, 2) + Math.pow(c.y - d.y, 2));
    } else {
        return Math.sqrt(Math.pow(c.left - d.left, 2) + Math.pow(c.top - d.top, 2));
    }
};


// Get normalized direction vector between positions
getDirv = function(d, c) {
    if (d.hasOwnProperty("x")) {
        return {
            x: (c.x - d.x) / getDist(d, c),
            y: (c.y - d.y) / getDist(d, c)
        };
    } else {
        return {
            x: (c.left - d.left) / getDist(d, c),
            y: (c.top - d.top) / getDist(d, c)
        };
    }
};


// Get orthogonal vector
getOrtho = function(d, c) {
    var dVec =  getDirv(d, c);
    return {
        x: dVec.y,
        y: -dVec.x
    }
};


// Calculate vertices for arrow path
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

    var data = localStorage.getItem("mmetool")
    data = data? data : "No data"
    csvContent += data;

    console.log("download clicked");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mmetool_data.csv");
    document.body.appendChild(link); // Required for firefox

    link.click();

};

adjustCanvasToScreen = function() {
    uistate.height = $(window).height();
    uistate.width = $(window).width();
    uistate.availableHeight = uistate.height - 2*canvasStyle.buttonSize;
    uistate.yCenter = uistate.height/2;
    uistate.maxFactors = Math.floor(uistate.availableHeight/canvasStyle.minIconDistance) * canvasStyle.factorsPerRow;

    uistate.xFixedFactor = uistate.width - canvasStyle.rightSideWidth - canvasStyle.iconSize - canvasStyle.fixedFactorDist;
    uistate.yFixedFactor.main = uistate.height/2 - canvasStyle.iconSize/2 ;
    uistate.yFixedFactor.practice = uistate.height * 3.0/4 - canvasStyle.iconSize/2;

};

setupCanvas = function() {

    adjustCanvasToScreen();

    canvas = new fabric.Canvas("mapping-canvas", {
        width: uistate.width,
        height: uistate.height
        });
    canvas.selection = false;
    canvas.hoverCursor = "default";
};
/*
resizeCanvas = function() { // test!!!
    canvas.setWidth( $(window).width());
    canvas.setHeight($(window).height());
    canvas.renderAll();
};
*/

//window.addEventListener("resize", resizeCanvas);


populateSelectionForClass = function(className, mediaType) {

    var element = document.getElementsByClassName(className);

    for (var i = 0; i< element.length; i++) {
        var defaultValue = settings[element[i].id];
        for (var filename of mediaSources[mediaType]) {
            var option = document.createElement("option");
            option.value = filename;
            option.textContent = filename;
            element[i].appendChild(option);
            if (filename === defaultValue) option.selected = true;
        }
    }
};


initSettings = function() {
    populateSelectionForClass("videoChooser", "video");
    populateSelectionForClass("audioChooser", "audio");
    populateSelectionForClass("imageChooser", "images");

    $("#negativeArrows")[0].checked = settings.useNegativeArrows;
};


// Behaviour on startUp
window.onload = function() {

    initSettings();
    setupCanvas();

    $("#audio").on("loadeddata", function(a) {
        a.target.play();
    });
    $("#video").on("ended", function(a) {
        uistate.mapping = (uistate.video === "introduction")? "practice" : "main"
        showScreen("mapping-task");
    });
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
        uistate.mapping = "main"
        showScreen("mapping-task");
    });
    $("#btn-ty-back").on("click", function() { // on thank you screen
        showScreen("mapping-task"); // check if data still drawn, otherwise skip setup
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
    $("#btn-save-settings").on("click", function() { // on settings screen
        saveSettings();
        showScreen("menu");
    });
    $("#btn-cancel-settings").on("click", function() { // on settings screen
        showScreen("menu");
    });
    showScreen("menu");
};


saveSettings = function () {
    var mediaList = [ "instructionVideo", "introductionVideo", "thankYouImage",
                      "thankYouAudio", "mainMappingAudio", "practiceMappingAudio"];

    var arrowOption = document.getElementById("negativeArrows");
    if (arrowOption) settings.useNegativeArrows = arrowOption.checked;

    for (var item of mediaList) {
        var element = document.getElementById(item);
        var mediaFile = element.options[element.selectedIndex].value;

        if (mediaFile) {
            settings[item] = mediaFile;
            console.log(item);
            console.log(mediaFile);
        }

    }

    localStorage.setItem("mmetool_settings", JSON.stringify(settings));
};
