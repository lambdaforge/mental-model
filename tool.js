uistate = {

    iconPositions: [],
    highlight: "",
    audioCue: false,
    blockUI: false,
    mousePosition: [],

    session: {
        start: null,
        name: "",
        comment: ""
    },

    newArrow: {
        state: "select-arrow", // select-start, select-end
        startIcon: "",
        weight: 0
    },


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
    var d = 10;
    var a = new fabric.Rect({
        top: b.top - d / 2,
        left: b.left - d / 2,
        width: b.width + d,
        height: b.height + d,
        selectable: false,
        fill: settings.highlightColor
    });
    a.iconName = "highlight";
    canvas.add(a);
    canvas.bringToFront(icon);
    uistate.highlight = icon.iconName;
};


// Remove bounding box from icon
removeHighlight = function() {
    var icon = getIconByName("highlight"); // only call "highlight?"
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
showScreen = function(screenName, param) {
    $(".screen").hide();
    $("#" + screenName).show();

    switch (screenName) {
        case "display-video":
            $("#video")[0].src = "video/" + param;
            break;
        case "mapping-task":
            setupMapping(param);
            if (param === "main") {
                uistate.session.start = new Date();
                $("#audio")[0].src = "audio/" + settings.mainMappingAudio;
            }
            else {
                $("#audio")[0].src = "audio/" + settings.practiceMappingAudio;
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
            $("#negarrows")[0].checked = settings.useNegativeArrows;
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
    var width = Math.floor(Math.abs(arrowWeight)*2.5);
    var cChoice = settings.arrowColor;
    var color =  arrowWeight < 0 ? cChoice.negative : cChoice.positive;
    return {"color": color, "lineWidth": width}
};


// Draw arrow in arrow menu
drawMenuArrow = function(arrowInd, arrowWeight, arrowMenu) {

    var style = arrowStyle(arrowWeight);

    var yPos = arrowMenu.top + arrowInd * arrowMenu.spacing;

    var leftTop = { x: arrowMenu.left, y: yPos };
    var rightTop = { x: arrowMenu.right, y: yPos };

    var arrowOutline = arrowPath(leftTop, rightTop, style.lineWidth);
    var arrowAttributes =  { fill: style.color, originY: "center" };

    var arrow = new fabric.Polygon(arrowOutline, arrowAttributes);
    var arrowBox = new fabric.Rect({
        top: arrowMenu.top + arrowInd * arrowMenu.spacing - 36,
        left: 1140,
        width: 120,
        height: 50,
        stroke: "transparent",
        fill: "transparent"
    });

    var icon = new fabric.Group([arrow, arrowBox]);
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
drawArrowMenu = function() {

    // Only use negative arrows if specified in settings

    var arrows = settings.arrowWeights;
    if (!settings.useNegativeArrows) {
        console.log("no neg");
        arrows = settings.arrowWeights.filter(function(value) {
            return value >= 0;
        });
    }

    // Draw right side of canvas

    var rightSide = new fabric.Rect({
        top: 0,
        left: 1121,
        width: 259,
        height: 800,
        fill: "#EAEAEA",
        selectable: false
    });

    var border = new fabric.Rect({
        top: 0,
        left: 1120,
        width: 1,
        height: 800,
        fill: "#AAAAAA",
        selectable: false
    });
    canvas.add(rightSide);
    canvas.add(border);

    // Draw arrow area

    var arrowMenuBB = {
        left: 1150,
        right: 1250,
        spacing: arrows.length < 6 ? 100 : (500 / arrows.length)
    };

    arrowMenuBB.height = arrowMenuBB.spacing * ( arrows.length - 1) + settings.arrowHead[0];
    arrowMenuBB.top = (420 - arrowMenuBB.height / 2);

    for (var arrowInd = 0; arrowInd < arrows.length; arrowInd++) {
        drawMenuArrow(arrowInd, arrows[arrowInd], arrowMenuBB);
    }
};


// Draw icon on canvas
drawFactorIcon = function(iconName, xLeft, yTop, fixed) {
    var factorImage = "images/factors/" + settings.factorMedia[iconName]["img"];
    fabric.Image.fromURL( factorImage, function(icon) {
        icon.scale(settings.iconSize / (icon.height > icon.width ? icon.height : icon.width));
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

    var selectionBorder = settings.mappingArea.left2;
    for (var factor of factors) {

        if ( icon.iconName !== factor.iconName ) {
            var distance = getDist(icon, factor);
            if (icon.left > selectionBorder && factor.left > selectionBorder) { // both icons on canvas
                if (distance < settings.minIconDistance) return true;
            } else {
                if (icon.left <= selectionBorder && factor.left < selectionBorder) { // both in selection
                    if (distance < settings.iconSize) return true;
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

    if (icon.left > settings.mappingArea.left2 ) {
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

    var bottomLimit = settings.mappingArea.bottom - offset;
    var topLimit    = settings.mappingArea.top    + offset;
    var rightLimit  = settings.mappingArea.right  - offset;
    var leftLimit   = offset;
    if (hasConnection) leftLimit +=  settings.mappingArea.left2;
    else               leftLimit +=  settings.mappingArea.left1;

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

        if (distance > settings.minIconDistance + settings.arrowMargin) {
            var g = settings.iconSize / 2 + settings.arrowMargin;
        } else {
            var g = (distance / 2 - 10)
        }
        var leftAnchor = {
            x: startPos.x + g * dirVec.x,
            y: startPos.y + g * dirVec.y + settings.arrowHead[0] / 2
        };
        var e = {
            x: endPos.x - g * dirVec.x,
            y: endPos.y - g * dirVec.y + settings.arrowHead[0] / 2
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
            // if right of mapping area
            if (arrow.oCoords.mr.x > settings.mappingArea.right + 10 || arrow.oCoords.ml.x > settings.mappingArea.right + 10) {
                canvas.remove(arrow);
            } else {
                canvas.remove(arrow);
                drawConnection(startIconName, endIconName, weight);
            }
        });
        canvas.add(arrow);
    }
};


// Layout of factor menu on left side of screen
setupSelection = function(factors) {
    var factorMenu = new fabric.Rect({
        top: 0,
        left: 0,
        width: 285,
        height: 800,
        fill: "#EAEAEA",
        selectable: false
    });
    var border = new fabric.Rect({
        top: 0,
        left: 285,
        width: 1,
        height: 800,
        fill: "#BBBBBB",
        selectable: false
    });
    canvas.add(factorMenu);
    canvas.add(border);

    var c = Math.ceil(factors.length / 5);
    for (var factorInd = 0; factorInd < factors.length; factorInd++) {
        var xLeft = (5 + ((4 - c) * settings.iconSize / 2)) + ((10 + settings.iconSize) * (factorInd % c));
        var yTop = (100 + settings.iconSize / 2) + ((30 + settings.iconSize) * Math.floor(factorInd / c));
        drawFactorIcon(factors[factorInd], xLeft, yTop, false);
    }
};


// Layout and behaviour of drawing screen
setupMapping = function(type) {
    console.log("Setting up: " + type);

    var factors =  settings.factors[type];

    var dynamicFactors = factors["dynamic"];
    var fixedFactor = factors["fixed"];
    var ffpos = factors["fixedPos"];

    canvas.clear();

    // Set up icons and arrows

    drawFactorIcon(fixedFactor, ffpos.xLeft, ffpos.yTop, true);
    setupSelection(dynamicFactors);
    drawArrowMenu();

    // Setup "question" button

    drawButton("question", 100, 700, function() {
        resetUIstate();
        uistate.audioCue = true;
        var questionIcon = getIconByName("question");
        drawHighlight(questionIcon);
    });

    // Setup "next" button
    drawButton("next", 1170, 700, function() {
        if (type === "practice") {
            if (practiceSolutionCorrect()) {
                showScreen("display-video", settings.instructionVideo);
            }
        } else {
            showScreen("thank-you", "");
            saveResult();
        }
    });

    if (type === "practice") {
        fabric.Image.fromURL("images/" + settings.solutionImage, function(image) {
            image.scale(0.2);
            image.top = 10;
            image.originX = "right";
            image.left = 1110;
            image.selectable = false;
            image.opacity = 0.5;
            canvas.add(image)
        })
    }
};

/*
function download(content, filename, contentType) // TODO: rewrite
{
    if(!contentType) contentType = 'application/octet-stream';
    var a = document.createElement('a');
    var blob = new Blob([content], {'type':contentType});
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}*/

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

    var o = settings.arrowHead[0];
    var c = settings.arrowHead[1];

    var n = getDirv(leftAnchor, rightAnchor);
    var j = getOrtho(leftAnchor, rightAnchor);
    var m = rightAnchor;
    var l = {
        x: rightAnchor.x - n.x * c / 2 + j.x * o / 2,
        y: rightAnchor.y - n.y * c / 2 + j.y * o / 2
    };
    var d = {
        x: rightAnchor.x - n.x * c / 2 - j.x * o / 2,
        y: rightAnchor.y - n.y * c / 2 - j.y * o / 2
    };
    var k = {
        x: rightAnchor.x - n.x * c / 2 + j.x * lineWidth / 2,
        y: rightAnchor.y - n.y * c / 2 + j.y * lineWidth / 2
    };
    var e = {
        x: rightAnchor.x - n.x * c / 2 - j.x * lineWidth / 2,
        y: rightAnchor.y - n.y * c / 2 - j.y * lineWidth / 2
    };
    var h = {
        x: leftAnchor.x + j.x * lineWidth / 2,
        y: leftAnchor.y + j.y * lineWidth / 2
    };
    var g = {
        x: leftAnchor.x - j.x * lineWidth / 2,
        y: leftAnchor.y - j.y * lineWidth / 2
    };
    return [m, l, k, h, g, e, d]
};

// Download data, as defined in browser
downloadData = function() {
    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += localStorage.getItem("mmetool");

    console.log("download clicked");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mmetool_data.csv");
    document.body.appendChild(link); // Required for firefox

    link.click();

};

// Behaviour on startUp
window.onload = function() {

    canvas = new fabric.Canvas("mapping-canvas");
    canvas.selection = false;
    canvas.hoverCursor = "default";
    $("body").on("click", function(a) { // changed
        if (settings.fullScreen) {
            var screen = document.getElementById("mme-tool").children[0]; // correct????
        /*    if (screen.webkitRequestFullscreen) { // TODO: fix
                screen.webkitRequestFullscreen();
            }*/
        }
    });
    $("#audio").on("loadeddata", function(a) {
        a.target.play();
    });
    $("#video").on("ended", function(a) { // ?????
        showScreen("mapping-task", a.target.currentSrc.indexOf("introduction") !== -1 ? "practice" : "main");
    });
    $("#btn-introduction").on("click", function() {
        showScreen("display-video", settings.introductionVideo);
    });
    $("#btn-practice").on("click", function() {
        showScreen("mapping-task", "practice")
    });
    $("#btn-instructions").on("click", function() {
        showScreen("display-video", settings.instructionVideo);
    });
    $("#btn-mapping").on("click", function() {
        uistate.sessionName = $("#session")[0].value;
        uistate.sessionComment = $("#comment")[0].value;
        showScreen("mapping-task", "main");
    });
    $("#btn-ty-back").on("click", function() { // on thank you screen
        showScreen("mapping-task", "");
    });
    $("#btn-data").on("click", function() {
        showScreen("show-data", "");
    });
    $("#btn-download").on("click", function() {
        downloadData();
    });
    $("#btn-settings").on("click", function() {
        showScreen("settings", "");
    });
    $("#btn-save-settings").on("click", function() { // on settings screen
        saveSettings();
        showScreen("menu", "");
    });
    $("#btn-cancel-settings").on("click", function() { // on settings screen
        showScreen("menu", "");
    });
    showScreen("menu", "");
};

saveSettings = function () {
    var mediaList = [
        {id: "#instructionvid",  setting: "instructionVideo"     },
        {id: "#introductionvid", setting: "introductionVideo"    },
        {id: "#thankyouimg",     setting: "thankYouImage"        },
        {id: "#thankyouaud",     setting: "thankYouAudio"        },
        {id: "#mappingaud",      setting: "mainMappingAudio"     },
        {id: "#practiceaud",     setting: "practiceMappingAudio" },
    ];

    if ($("#negarrows")[0]) {
        settings.useNegativeArrows = $("#negarrows")[0].checked;
    }
    console.log("neg arrows",$("#negarrows")[0].checked);

    /*  console.log("save settings");
     console.log($("#instructionvid")[0].value);
     console.log($("#introductionvid")[0].value);*/

    /*

    console.log("testfile"); // Problem: fake path gets shown
    console.log($("#test")[0]);
    for (var item of mediaList) {
        var mediaFile = $(item.id)[0].value;

        if (mediaFile) {
            settings[item.setting] = mediaFile;
            console.log($(item.id)[0]);
            console.log(mediaFile);
        }

    }*/


    console.log("settings");
    console.log(settings);
    localStorage.setItem("mmetool_settings", JSON.stringify(settings));
};
