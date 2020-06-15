
// Initial positions of factors
factorPositions = function(leftSideLineHeight, leftSideWidth, nFactors, factorsPerRow) {
    var positions = [];
    var horizontalIconSpace = leftSideWidth / factorsPerRow;
    for (var i = 0; i < nFactors; i++) {
        var x = horizontalIconSpace * ((i % factorsPerRow) + 0.5);
        var row = 1 + Math.floor(i/factorsPerRow);
        var y = leftSideLineHeight * (row + 0.5);
        positions.push({x: x, y: y});
    }
    return positions;
};


// Positions of arrows on right side of screen
arrowPositions = function(h, w, rightSideWidth, leftSideLineHeight, nArrows) {
    var positions = [];
    var x = w - rightSideWidth/2;
    var yOffset = leftSideLineHeight;
    var verticalIconSpace = (h - 2*leftSideLineHeight) / nArrows;
    for (var i = 0; i < nArrows; i++) {
        var y = yOffset + verticalIconSpace * (i + 0.5);
        positions.push({x: x, y: y});
    }
    return positions;
};


// Get weights of arrow actually used in this mapping
getUsedArrows = function(weights, negativeUsed, mappingType) {
    var arrows = [];
    for (var i = 0; i < weights.length; i++) {
        if (weights[i] > 0 || (negativeUsed && (mappingType !== "practice")) ) {
            arrows.push(weights[i]);
        }
    }
    return arrows;
};


// Get maximum absolute value of array
getAbsoluteMax = function(array) {
    var max = 0;
    for (var i = 0; i < array.length; i++) {
        var value = Math.abs(array[i]);
        if (value > max) max = value;
    }
    return max;
};


// Use current window size to determine positions on canvas
getPixelSizes = function(w, h, mappingType, settings) { // "main" or "practice"

    var factorsPerRow = 3;
    var rightSideWidth = w/8;
    var leftSideWidth = w/4.5;

    var nFactors = settings.factors[mappingType].dynamic.length;
    var nFactorLines = Math.ceil( nFactors / factorsPerRow);
    var leftSideLineHeight = h / (2 + nFactorLines);

    var availableHeight = h - 2*leftSideLineHeight;
    var mappingScreenWidth = w - leftSideWidth - rightSideWidth;
    var mappingCenterX = leftSideWidth + mappingScreenWidth/2;

    var arrowsUsed = getUsedArrows(settings.arrowWeights, settings.useNegativeArrows, mappingType);
    var maxArrowWidth = h/40;
    var minArrowWidth = 2;
    var maxAbsWeight = getAbsoluteMax(arrowsUsed);
    var arrowWidthSteps = (maxArrowWidth - minArrowWidth ) / (maxAbsWeight-1);
    var arrowHeadSize = h/20;
    var iconSize = Math.min(0.9 * leftSideLineHeight, leftSideWidth/3);

    return {
        height: h,
        width: w,

        rightSideWidth: rightSideWidth,
        leftSideWidth: leftSideWidth,
        borderWidth: 1,
        availableWidth: mappingScreenWidth,
        availableHeight: availableHeight,
        leftSideLineHeight: leftSideLineHeight,

        xFixedFactor: { right: w - rightSideWidth - 1.5*iconSize,
                        left:  leftSideWidth + 1.5*iconSize,
                        middle: leftSideWidth + 0.5*mappingScreenWidth },
        yFixedFactor: (mappingType === "practice") ? h * 3 / 4 : h / 2,

        practiceImageY: h * 0.15,
        practiceImageX: mappingCenterX,
        practiceImageHeight: h * 0.3,

        buttonSize: iconSize,
        iconSize: iconSize,
        minIconDistance: iconSize,

        factorsPerRow: factorsPerRow,
        initialFactorPositions: factorPositions(leftSideLineHeight, leftSideWidth, nFactors, factorsPerRow),
        arrowPositions: arrowPositions(h, w, rightSideWidth, leftSideLineHeight, arrowsUsed.length),

        maxArrowWidth: maxArrowWidth,
        minArrowWidth: minArrowWidth,
        arrowLength: 0.7 * rightSideWidth,
        arrowHead: arrowHeadSize,
        arrowButtonMargin: arrowHeadSize * 0.5,
        arrowSideSpacing:  arrowHeadSize * 0.5,
        arrowMargin: arrowHeadSize/4,
        arrowMinLength: arrowHeadSize,
        arrowsUsed: arrowsUsed,

        arrowLineWidth: function(weight) { return minArrowWidth + (weight-1) * arrowWidthSteps},

        highlightMargin: leftSideLineHeight / 5,

        centerRightSide: w - rightSideWidth/2,
        centerLeftSide: leftSideWidth/2,

        color: {
            sidePanels: "#EAEAEA",
            leftDivider: "#BBBBBB",
            rightDivider: "#AAAAAA"
        }

    };

};
