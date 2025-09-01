/**
 * Initialises the chart by clearing previous graphics, setting accessibility text,
 * and determining chart size based on the current screen width.
 * @param {string} size - Desired chart size; recalculated based on screen width.
 * @returns {string} 'sm', 'md', or 'lg' depending on breakpoints.
 */
export function initialise(size) {
  //population accessible summmary
  d3.select('#accessibleSummary').html(config.essential.accessibleSummary);

  // clear out existing graphics
  d3.select('#graphic').selectAll('*').remove();
  d3.select('#legend').selectAll('*').remove();

  let threshold_md = config.optional.mediumBreakpoint;
  let threshold_sm = config.optional.mobileBreakpoint;

  //set variables for chart dimensions dependent on width of #graphic
  if (parseInt(d3.select('#graphic').style('width')) < threshold_sm) {
    size = 'sm';
  } else if (parseInt(d3.select('#graphic').style('width')) < threshold_md) {
    size = 'md';
  } else {
    size = 'lg';
  }

  return size;
}

/**
 * Calculates the width for individual charts in a grid layout.
 * @param {Object} params
 * @param {number} params.screenWidth - Total available width.
 * @param {number} params.chartEvery - Number of charts per row.
 * @param {Object} params.chartMargin - Chart margins with 'left' and 'right' properties.
 * @param {number} [params.chartGap=10] - Space between charts in pixels.
 * @returns {number} Width of a single chart.
 */
export function calculateChartWidth({ screenWidth, chartEvery, chartMargin, chartGap = 10 }) {
  if (config.optional.dropYAxis) {
    // Chart width calculation allowing for {chartGap}px left margin between the charts
    const chartWidth = ((screenWidth - chartMargin.left - ((chartEvery - 1) * chartGap)) / chartEvery) - chartMargin.right;
    return chartWidth;
  } else {
    const chartWidth = ((screenWidth / chartEvery) - chartMargin.left - chartMargin.right);
    return chartWidth;
  }
}

export function addSvg({ svgParent, chart_width, height, margin }) {
  return svgParent
    .append('svg')
    .attr('width', chart_width + margin.left + margin.right)
    .attr('height', height)
    .attr('class', 'chart')
    // .style('background-color', '#fff')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

export function addDataLabels({ svgContainer = svg, data, chart_width, labelPositionFactor = 7, xScaleFunction = x, yScaleFunction = y, y2function = null }) {

  svgContainer
    .selectAll('text.dataLabels')
    .data(data)
    .join('text')
    .attr('class', 'dataLabels')
    .attr('x', (d) => d.value > 0 ? xScaleFunction(d.value) :
      Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? xScaleFunction(0) : xScaleFunction(d.value))
    .attr('dx', (d) => d.value > 0 ?
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? 3 : -3) :
      3)
    .attr('y', (d) => y2function ? yScaleFunction(d.name) + y2function(d.category) + y2function.bandwidth() / 2 :
      yScaleFunction(d.name) + yScaleFunction.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', (d) => d.value > 0 ?
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
      "start"
    )
    .attr('fill', (d) =>
      (Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
    )
    .text((d) =>
      d3.format(config.essential.dataLabels.numberFormat)(d.value)
    );
}

export function addDataLabelsVertical({ svgContainer = svg, data, xScaleFunction = x, yScaleFunction = y, y2function, minColumnLabelHeight = 20 }) {

  svgContainer
    .selectAll('text.dataLabels')
    .data(data)
    .join('text')
    .attr('class', 'dataLabels')
    .attr('x', (d) => xScaleFunction(d.name) + y2function(d.category) + y2function.bandwidth() / 2)
    .attr('y', (d) => {
      const columnHeight = Math.abs(yScaleFunction(d.value) - yScaleFunction(0));
      if (d.value > 0) {
        if (columnHeight < minColumnLabelHeight) {
          return yScaleFunction(d.value) - 5; // Outside the column (above)
        } else {
          return yScaleFunction(d.value) + 12; // Inside the column (bottom)
        }
      } else {
        if (columnHeight < minColumnLabelHeight) {
          return yScaleFunction(0) - 5; // Outside the column (above)
        } else {
          return yScaleFunction(d.value) - 10; // Inside the column (bottom)
        }
      }
    })
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', (d) => {
      const columnHeight = Math.abs(yScaleFunction(d.value) - yScaleFunction(0));
      if (d.value > 0) {
        if (columnHeight < minColumnLabelHeight) {
          return 'auto'; // Outside the column (above)
        } else {
          return 'middle'; // Inside the column (bottom)
        }
      } else {
        if (columnHeight < minColumnLabelHeight) {
          return 'auto'; // Outside the column (above)
        } else {
          return 'middle'; // Inside the column (bottom)
        }
      }
    })
    .attr('fill', (d) => {
      const columnHeight = Math.abs(yScaleFunction(d.value) - yScaleFunction(0));
      if (columnHeight < minColumnLabelHeight) {
        return '#414042'; // Outside the column
      } else {
        return '#ffffff'; // Inside the column
      }
    })
    .text((d) =>
      d3.format(config.essential.dataLabels.numberFormat)(d.value)
    );
}

export function addChartTitleLabel({
  svgContainer = svg, //Default values, but can be overwritten in the function call
  xPosition = 0, //Default values, but can be overwritten in the function call
  yPosition = -15, //Default values, but can be overwritten in the function call
  text,
  wrapWidth,
}) {
  svgContainer
    .append('g')
    .attr('transform', 'translate(0, 0)')
    .append('text')
    .attr('x', xPosition)
    .attr('y', yPosition)
    // .attr('dy', -15)
    .attr('class', 'title')
    .text(text)
    .attr('text-anchor', 'start')
    .call(wrap, wrapWidth);
}

export function addAxisLabel({
  svgContainer = svg,
  xPosition,
  yPosition,
  text,
  textAnchor = "end",
  wrapWidth,
}) {
  svgContainer
    .append("g")
    .append("text")
    .attr("x", xPosition)
    .attr("y", yPosition)
    .attr("class", "axis--label")
    .text(text)
    .attr("text-anchor", textAnchor)
    .call(wrap, wrapWidth);
}

export function addSource(elementId, sourceText) {
  if (sourceText.startsWith('Source')) console.error('Source text should not start with "Source".');
  if (sourceText.includes(' - ')) console.warn('Source text should use an en dash instead of -.');
  d3.select('#' + elementId).text('Source: ' + sourceText);
}

export function diamondShape(sideLength = 10) {
  // Calculate the distance from center to each point (diamond with sideLength sides)
  const distance = sideLength / Math.sqrt(2);

  // Define the diamond shape as a path
  const path = `
    M 0 ${-distance}
    L ${distance} 0
    L 0 ${distance}
    L ${-distance} 0
    Z
  `;

  return path; // Return the path string
}

// text wrap functions
export function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y") ? text.attr("y") : 0,
      x = text.attr("x") ? text.attr("x") : 0,
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", x);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("dy", lineHeight + "em")
          .text(word);
      }
    }
    let breaks = text.selectAll("tspan").size();
    text.attr("y", function () {
      return y - 6 * (breaks - 1);
    });
  });
}

export function wrap2(
  text,
  width,
  dyAdjust,
  lineHeightEms,
  lineHeightSquishFactor,
  splitOnHyphen,
  centreVertically
) {
  // Use default values for the last three parameters if values are not provided.
  if (!lineHeightEms) lineHeightEms = 1.05;
  if (!lineHeightSquishFactor) lineHeightSquishFactor = 1;
  if (splitOnHyphen == null) splitOnHyphen = true;
  if (centreVertically == null) centreVertically = "middle";

  text.each(function () {
    var text = d3.select(this),
      x = text.attr("x"),
      y = text.attr("y");

    var words = [];
    text
      .text()
      .split(/\s+/)
      .forEach(function (w) {
        if (splitOnHyphen) {
          var subWords = w.split("-");
          for (var i = 0; i < subWords.length - 1; i++)
            words.push(subWords[i] + "-");
          words.push(subWords[subWords.length - 1] + " ");
        } else {
          words.push(w + " ");
        }
      });

    text.text(null); // Empty the text element

    // `tspan` is the tspan element that is currently being added to
    var tspan = text.append("tspan");

    var line = ""; // The current value of the line
    var prevLine = ""; // The value of the line before the last word (or sub-word) was added
    var nWordsInLine = 0; // Number of words in the line
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      prevLine = line;
      line = line + word;
      ++nWordsInLine;
      tspan.text(line.trim());
      if (tspan.node().getComputedTextLength() > width && nWordsInLine > 1) {
        // The tspan is too long, and it contains more than one word.
        // Remove the last word and add it to a new tspan.
        tspan.text(prevLine.trim());
        prevLine = "";
        line = word;
        nWordsInLine = 1;
        tspan = text.append("tspan").text(word.trim());
      }
    }

    var tspans = text.selectAll("tspan");

    var h = lineHeightEms;
    // Reduce the line height a bit if there are more than 2 lines.
    if (tspans.size() > 2)
      for (var i = 0; i < tspans.size(); i++) h *= lineHeightSquishFactor;

    tspans.each(function (d, i) {
      // Calculate the y offset (dy) for each tspan so that the vertical centre
      // of the tspans roughly aligns with the text element's y position.
      var dy = i * h + dyAdjust;
      if (centreVertically === "middle") {
        dy -= ((tspans.size() - 1) * h) / 2;
      } else if (centreVertically === "top") {
        dy -= tspans.size() * h; // Shift the text up by its entire height
      } else {
        // For any other value of centreVertically (including "bottom"), do nothing (default behavior).
      };
      d3.select(this)
        .attr("y", y)
        .attr("x", x)
        .attr("dy", dy + "em");
    });
  });
}

//Annotations

// / arrowhead.js
export function setupArrowhead(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead")
    .attr("class", "annotation_arrow")
    .attr("refX", 9)
    .attr("refY", 10)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadMarker.append("path")
    .attr("d", "M2,5 L10,10 L2,15");
}


function draw_curve(xCoord, yCoord, xDifference, yDifference, curveRight) {

  //the height of the curve, as a proportion of the length of direct line from A to B. Default should be 0.25
  var curve_height = 0.25

  //   var xDifference = x2 - x1   
  //   var yDifference = y2 - y1
  //pythag to get the length of the line
  var M = ((Math.sqrt((Math.pow((xDifference), 2)) + (Math.pow((yDifference), 2))))) * curve_height
  if (curveRight == true) { var M = 0 - M }

  // Find midpoint J
  var Jx = xCoord + xDifference / 2
  var Jy = yCoord + yDifference / 2

  // We need a and b to find theta, and we need to know the sign of each to make sure that the orientation is correct.
  //   var a = x2 - x1
  var asign = (xDifference < 0 ? -1 : 1)
  //   var b = y2 - y1
  var bsign = (yDifference < 0 ? -1 : 1)
  var theta = Math.atan(yDifference / xDifference)

  // Find the point that's perpendicular to J on side
  var costheta = asign * Math.cos(theta)
  var sintheta = asign * Math.sin(theta)

  // Find c and d
  var c = M * sintheta
  var d = M * costheta

  // Use c and d to find Kx and Ky
  var Kx = Jx - c
  var Ky = Jy + d

  var x2coord = xCoord + xDifference
  var y2coord = yCoord + yDifference

  return "M" + x2coord + "," + y2coord +
    "Q" + Kx + "," + Ky +
    " " + xCoord + "," + yCoord

}

function annotationMobileAlternative(
  svgName,
  xValue,
  yValue,
  TextOffsetX,
  MobileCircleOffsetX,
  MobileCircleOffsetY,
  mobileTextNumber,
  wrapWidth,
  thisText,
  wrap2,
  centerWrap
) {

  // Add circle to the main SVG
  svgName.append('circle')
    .attr('cx', xValue + 1.7 * (TextOffsetX) + MobileCircleOffsetX)
    .attr('cy', yValue + MobileCircleOffsetY)
    .attr('r', 9)
    .attr('class', 'mobile-annotation-circle');

  // Add number inside circle
  svgName.append('text')
    .attr('x', xValue + 1.7 * (TextOffsetX) + MobileCircleOffsetX)
    .attr('y', yValue + MobileCircleOffsetY)
    .attr('class', 'mobile-annotation-circle-text')
    .text(mobileTextNumber)
    .attr('text-anchor', "middle")
    .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

  // Create footnote
  const emptyFootnotesDiv = d3.select('.mobile-annotation-footnotes-div');

  const footnoteRowDiv = emptyFootnotesDiv
    .append('div')
    .attr('class', 'mobile-annotation-footnote-row')
    .style('background-color', 'none')
    .style('display', 'flex')
    .style('font-size', '14px');

  // Add SVG circle and number to footnote
  const svg = footnoteRowDiv.append('svg')
    .attr('width', "30")
    .attr('height', '23')
    .style('background-color', 'none');

  svg.append('circle')
    .attr('cx', 15)
    .attr('cy', 10)
    .attr('r', 9)
    .attr('class', 'mobile-annotation-circle');

  svg.append('text')
    .attr('x', 15)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('class', 'mobile-annotation-circle-text')
    .text(mobileTextNumber);

  // Add text description to footnote
  footnoteRowDiv.append('div')
    .attr('height', '23')
    .text(thisText);
}


export function addAnnotationText(svgName,
  xValue,
  yValue, TextOffsetX, TextOffsetY, thisText, textAnchor, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size) {

  let centerWrap;
  if (

    mobileText != true
    ||
    size == "lg"
  ) {

    //adds text
    svgName.append('g')
      // .attr('transform', 'translate(0, 200)')
      .append('text')
      .attr('x', xValue + TextOffsetX)
      .attr('y', yValue + TextOffsetY)
      // .attr('dy', yScale(yValue) + yLength + TextOffsetY + arrowOffsetY)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }


}
export function addAnnotationArrow(svgName, xValue, yValue, arrowOffsetX, arrowOffsetY, xLength, yLength, curveRight, thisText, textPosition, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size) {

  let TextOffsetX, TextOffsetY, textAnchor, centerWrap;
  if (curveRight == 'right') { var curveRight = false } else { var curveRight = true }

  if (textPosition == "above") {
    TextOffsetX = 0; // No offset on the X-axis
    TextOffsetY = 0; // Offset above the arrow
    textAnchor = 'middle';
    centerWrap = "top";
  } else if (textPosition == "below") {
    TextOffsetX = 0; // No offset on the X-axis
    TextOffsetY = 10; // Offset below the arrow
    textAnchor = 'middle';
    centerWrap = "bottom";

  } else if (textPosition == "left") {
    TextOffsetX = -10; // Offset to the left of the arrow
    TextOffsetY = 0; // No offset on the Y-axis
    textAnchor = "end";
    centerWrap = 'middle';
  } else if (textPosition == "right") {
    TextOffsetX = 10; // Offset to the right of the arrow
    TextOffsetY = 0; // No offset on the Y-axis
    textAnchor = "start";
    centerWrap = 'middle';
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetX = 0;
    TextOffsetY = 0;
    textAnchor = "start";
    centerWrap = 'middle';
  }


  if (

    mobileText != true
    ||
    size == "lg"
  ) {

    //desktop

    svgName.append("path")
      .attr("class", "annotation_arrow")
      // .data()
      .attr("d", function (d) {
        return draw_curve(

          //arrow start x and y values
          xValue + arrowOffsetX,
          yValue + arrowOffsetY,

          //arrow end x and y values
          xLength,
          yLength,

          //arrow is curving right rather than left
          curveRight
        );

      })
      //attaches the arrowhead
      .attr("marker-end", "url(#annotation_arrowhead)")
      ;

    //adds text
    svgName.append('g')
      // .attr('transform', 'translate(0, 200)')
      .append('text')
      .attr('x', xValue + xLength + TextOffsetX + arrowOffsetX)
      .attr('y', yValue + yLength + TextOffsetY + arrowOffsetY)
      // .attr('dy', yScale(yValue) + yLength + TextOffsetY + arrowOffsetY)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
  }

  else {
    //mobile alternative
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}


export function addDirectionArrow(svgName,
  direction,
  arrowAnchor,
  xValue, yValue, alignment, thisText, wrapWidth, textAdjustY, wrapVerticalAlign = "middle", arrowColour = "#414042") {

  let centerWrap, arrowPadding, textAnchor, TextOffsetX, textPadding, TextOffsetY, TextOffsetAdjustY, arrowFillColour, thisPath;

  centerWrap = wrapVerticalAlign;
  arrowPadding = 5;
  textAnchor = 'start';
  TextOffsetX = 0;
  textPadding = 5;
  TextOffsetY = 5;
  TextOffsetAdjustY = -10;
  TextOffsetAdjustY = textAdjustY;
  arrowFillColour = arrowColour;

  //horizontal arrows
  // text x anchor
  if (direction == 'left' && arrowAnchor == 'end' || direction == 'right' && arrowAnchor == 'start') { TextOffsetX = 12.5 + textPadding }
  if (direction == 'right' && arrowAnchor == 'end' || direction == 'left' && arrowAnchor == 'start') { TextOffsetX = 0 - textPadding }

  //text anchor 
  if (direction == 'right' && arrowAnchor == 'end' || direction == 'left' && arrowAnchor == 'start') { textAnchor = 'end' }

  // arrow anchor
  if (direction == 'right' && arrowAnchor == 'start' || direction == 'left' && arrowAnchor == 'end') { xValue = xValue + arrowPadding }
  if (direction == 'right' && arrowAnchor == 'end' || direction == 'left' && arrowAnchor == 'start') { xValue = xValue - arrowPadding - 12.5 }

  //alginment
  if (direction == 'right' && alignment == 'above' || direction == 'left' && alignment == 'above') { yValue = yValue + arrowPadding }
  if (direction == 'right' && alignment == 'below' || direction == 'left' && alignment == 'below') { yValue = yValue - arrowPadding }

  //vertical arrows arrows
  // arrow anchor
  if (direction == 'down' && arrowAnchor == 'start' || direction == 'up' && arrowAnchor == 'end') { yValue = yValue + arrowPadding }
  if (direction == 'down' && arrowAnchor == 'end' || direction == 'up' && arrowAnchor == 'start') { yValue = yValue - arrowPadding - 14 }

  //x position for arrow
  if (direction == 'down' && alignment == 'right' || direction == 'up' && alignment == 'right') { xValue = xValue - arrowPadding - 12.5 }
  if (direction == 'down' && alignment == 'left' || direction == 'up' && alignment == 'left') { xValue = xValue + arrowPadding }

  //x anchor for text
  if (direction == 'down' && alignment == 'right' || direction == 'up' && alignment == 'right') { textAnchor = 'end' }
  if (direction == 'down' && alignment == 'left' || direction == 'up' && alignment == 'left') { textAnchor = 'start' }
  //

  // x offset for text
  if (direction == 'down' && alignment == 'right' || direction == 'up' && alignment == 'right') { TextOffsetX = 0 - textPadding }
  if (direction == 'down' && alignment == 'left' || direction == 'up' && alignment == 'left') { TextOffsetX = 10 + textPadding }
  //


  if (direction == 'up') {
    thisPath = "M5.5 1.5L5.5 12.5M5.5 1.5L9.5 5.5M5.5 1.5L1.5 5.5"
  } else if (direction == 'down') {
    thisPath = "M5.5 12.5L5.5 1.5M5.5 12.5L1.5 8.5M5.5 12.5L9.5 8.5"
  } else if (direction == 'left') {
    thisPath = "M1 5L12 5M1 5L5 1M1 5L5 9"
  } else if (direction == 'right') {
    thisPath = "M12 5L1 5M12 5L8 9M12 5L8 1"
  } else {
    thisPath = "M12 5L1 5M12 5L8 9M12 5L8 1"
  }

  svgName.append('path')
    .attr("d", thisPath)
    .attr("class", "direction-arrow")
    .attr("stroke", arrowFillColour)
    .attr("transform", "translate(" + xValue + "," + yValue + ")");;

  svgName.append('text')
    .attr('x', xValue + TextOffsetX)
    .attr('y', yValue + TextOffsetY + TextOffsetAdjustY)

    .attr('class', 'annotation-text')
    .text(thisText)
    .attr('text-anchor', textAnchor)
    .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

}

export function addElbowArrow(svgName,
  startX, startY,
  endX, endY,
  bendDirection, // 'horizontal-first' or 'vertical-first'
  arrowAnchor, // 'start' or 'end' - where the arrowhead appears
  thisText,
  wrapWidth,
  textAdjustY = 0,
  wrapVerticalAlign = "middle",
  arrowColour = "#414042",
  textAlignment = "center") { // 'start', 'center', 'end' - where text appears on the line

  let centerWrap, arrowPadding, textAnchor, TextOffsetX, textPadding, TextOffsetY, TextOffsetAdjustY, arrowFillColour;
  let bendX, bendY, pathString, textX, textY;

  centerWrap = wrapVerticalAlign;
  arrowPadding = 5;
  textAnchor = 'middle';
  TextOffsetX = 0;
  textPadding = 5;
  TextOffsetY = 5;
  TextOffsetAdjustY = textAdjustY;
  arrowFillColour = arrowColour;

  // Calculate bend point based on bend direction
  if (bendDirection === 'horizontal-first') {
    bendX = endX;
    bendY = startY;
  } else { // vertical-first
    bendX = startX;
    bendY = endY;
  }

  // Determine arrow direction and create arrowhead coordinates
  let arrowSize = 6;
  let arrowX, arrowY, finalDirection;

  if (arrowAnchor === 'end') {
    arrowX = endX;
    arrowY = endY;
    if (bendDirection === 'horizontal-first') {
      // Final segment is vertical: from bendPoint to end
      finalDirection = endY > bendY ? 'down' : 'up';
    } else {
      // Final segment is horizontal: from bendPoint to end
      finalDirection = endX > bendX ? 'right' : 'left';
    }
  } else {
    arrowX = startX;
    arrowY = startY;
    if (bendDirection === 'vertical-first') {
      // First segment is vertical: from start to bendPoint
      // Arrow points opposite to segment direction
      finalDirection = bendY > startY ? 'up' : 'down';
    } else {
      // First segment is horizontal: from start to bendPoint
      // Arrow points opposite to segment direction
      finalDirection = bendX > startX ? 'left' : 'right';
    }
  }

  // Create arrowhead points based on direction
  let arrowPoint1X, arrowPoint1Y, arrowPoint2X, arrowPoint2Y;

  if (finalDirection === 'up') {
    arrowPoint1X = arrowX - arrowSize;
    arrowPoint1Y = arrowY + arrowSize;
    arrowPoint2X = arrowX + arrowSize;
    arrowPoint2Y = arrowY + arrowSize;
  } else if (finalDirection === 'down') {
    arrowPoint1X = arrowX - arrowSize;
    arrowPoint1Y = arrowY - arrowSize;
    arrowPoint2X = arrowX + arrowSize;
    arrowPoint2Y = arrowY - arrowSize;
  } else if (finalDirection === 'left') {
    arrowPoint1X = arrowX + arrowSize;
    arrowPoint1Y = arrowY - arrowSize;
    arrowPoint2X = arrowX + arrowSize;
    arrowPoint2Y = arrowY + arrowSize;
  } else { // right
    arrowPoint1X = arrowX - arrowSize;
    arrowPoint1Y = arrowY - arrowSize;
    arrowPoint2X = arrowX - arrowSize;
    arrowPoint2Y = arrowY + arrowSize;
  }

  // Create the complete path with elbow and arrowhead
  pathString = `M${startX},${startY} L${bendX},${bendY} L${endX},${endY} M${arrowX},${arrowY} L${arrowPoint1X},${arrowPoint1Y} M${arrowX},${arrowY} L${arrowPoint2X},${arrowPoint2Y}`;

  // Calculate text position based on textAlignment
  if (textAlignment === 'start') {
    textX = startX;
    textY = startY;
  } else if (textAlignment === 'end') {
    textX = endX;
    textY = endY;
  } else { // center - position at the bend point
    textX = bendX;
    textY = bendY;
  }

  // Adjust text anchor based on line direction at text position
  if (textAlignment === 'center') {
    textAnchor = 'middle';
    TextOffsetX = 0;
    TextOffsetY = -textPadding;
  } else if (textAlignment === 'start') {
    if (bendDirection === 'horizontal-first') {
      textAnchor = endX > startX ? 'start' : 'end';
      TextOffsetX = endX > startX ? textPadding : -textPadding;
    } else {
      textAnchor = 'middle';
      TextOffsetX = 0;
      TextOffsetY = endY > startY ? textPadding : -textPadding;
    }
  } else { // end
    if (bendDirection === 'horizontal-first') {
      textAnchor = 'middle';
      TextOffsetX = 0;
      TextOffsetY = endY > bendY ? textPadding : -textPadding;
    } else {
      textAnchor = endX > bendX ? 'start' : 'end';
      TextOffsetX = endX > bendX ? textPadding : -textPadding;
    }
  }

  // Draw the complete elbow path with arrowhead
  svgName.append('path')
    .attr("d", pathString)
    .attr("class", "elbow-arrow")
    .attr("stroke", arrowFillColour)
    .attr("fill", "none")
    .attr("stroke-width", 1.5);

  // Add text
  if (thisText) {
    svgName.append('text')
      .attr('x', textX + TextOffsetX)
      .attr('y', textY + TextOffsetY + TextOffsetAdjustY)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
  }
}

/**
 * Adds a vertical annotation line to a chart, with optional text and mobile-friendly alternatives.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} height - Height of the line.
 * @param {number} xValue - X-coordinate of the line.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'left' or 'right' for text placement.
 * @param {number} [yValue=10] - Y-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {boolean} moveToBack - If true, sends line behind other elements.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 */
export function addAnnotationLineVertical(svgName, height, xValue, thisText, textPosition, yValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, moveToBack, size) {

  let TextOffsetX, textAnchor, centerWrap;
  if (!yValue) yValue = 10;

  if (textPosition == "left") {
    TextOffsetX = -9; // Offset to the left of the arrow
    textAnchor = "end";
    centerWrap = 'middle';
  } else if (textPosition == 'right') {
    TextOffsetX = 9; // Offset to the right of the arrow
    textAnchor = "start";
    centerWrap = 'middle';
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetX = 9;
    textAnchor = "start";
    centerWrap = 'middle';
  }

  svgName.append('line')
    //the 0.5 gets line placed exactly
    .attr('x1', xValue + 0.5)
    .attr('x2', xValue + 0.5)
    .attr('y1', 0)
    .attr('y2', height)
    .attr('class', 'annotation-line')
    .filter(function () {
      return moveToBack == true;
    })
    .lower();

  if (mobileText != true
    || size == "lg"
  ) {
    svgName.append('text')
      .attr('x', xValue + TextOffsetX)
      .attr('y', yValue)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

/**
 * Adds a horizontal annotation line with optional text and mobile-friendly alternative.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} width - Width of the line.
 * @param {number} yValue - Y-coordinate of the line.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'above' or 'below' for text placement.
 * @param {number} [xValue=10] - X-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {boolean} moveToBack - If true, sends line behind other elements.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 */
export function addAnnotationLineHorizontal(svgName, width, yValue, thisText, textPosition, xValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, moveToBack, size) {

  let TextOffsetY, textAnchor, centerWrap;
  if (!xValue) xValue = 10;

  if (textPosition == "above") {
    TextOffsetY = -9; // Offset above the line
    textAnchor = "start";
    centerWrap = 'middle';
  } else if (textPosition == 'below') {
    TextOffsetY = 15; // Offset below the line
    textAnchor = "start";
    centerWrap = 'middle';
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetY = 15;
    textAnchor = "start";
    centerWrap = 'middle';
  }

  svgName.append('line')
    //the 0.5 gets line placed exactly
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', yValue + 0.5)
    .attr('y2', yValue + 0.5)
    .attr('class', 'annotation-line')
    .filter(function () {
      return moveToBack == true;
    })
    .lower();

  if (mobileText != true
    || size == "lg"
  ) {
    svgName.append('text')
      .attr('x', xValue)
      .attr('y', yValue + TextOffsetY)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      0, // TextOffsetX - no horizontal offset needed for horizontal line
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

/**
 * Draws a shaded rectangular range vertically between two x-values, with optional text annotation.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} height - Height of the range.
 * @param {number} xValue - Start X-coordinate of range.
 * @param {number} xEndValue - End X-coordinate of range.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'left' or 'right' text alignment.
 * @param {string} textPosition2 - 'inside' or 'outside' placement relative to range.
 * @param {number} [yValue=10] - Y-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 */
export function addAnnotationRangeVertical(svgName, height, xValue, xEndValue, thisText, textPosition, textPosition2, yValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size) {

  let TextOffsetX, textAnchor, centerWrap, textStart;

  if (!yValue) yValue = 10;

  if (textPosition2 == 'inside' && textPosition == "left") {
    TextOffsetX = 10;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = xValue;
  } else if (textPosition2 == 'outside' && textPosition == 'left') {
    TextOffsetX = -9; // Offset to the right of the arrow
    textAnchor = "end";
    centerWrap = 'middle';
    textStart = xValue;
  } else if (textPosition2 == 'inside' && textPosition == 'right') {
    TextOffsetX = -9;
    textAnchor = "end";
    centerWrap = 'middle';
    textStart = xEndValue;
  } else if (textPosition2 == 'outside' && textPosition == 'right') {
    TextOffsetX = 9;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = xEndValue;
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetX = 10;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = xValue;
  }

  svgName.append('rect')
    .attr('x', xValue)
    .attr('width', xEndValue - xValue)
    .attr('y', 0)
    .attr('height', height)
    .attr('class', 'annotation-range')
    //moves range rectangle behind other elements
    .lower()

  if (mobileText != true
    || size == "lg"
  ) {

    svgName.append('text')
      .attr('x', xValue + TextOffsetX)
      .attr('y', yValue)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

/**
 * Draws a shaded horizontal range between two y-values, with optional text annotation.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} width - Width of the range.
 * @param {number} yValue - Start Y-coordinate of range.
 * @param {number} yEndValue - End Y-coordinate of range.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'above' or 'below' for text alignment.
 * @param {string} textPosition2 - 'inside' or 'outside' placement relative to range.
 * @param {number} [xValue=10] - X-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 */
export function addAnnotationRangeHorizontal(svgName, width, yValue, yEndValue, thisText, textPosition, textPosition2, xValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size) {

  let TextOffsetY, textAnchor, centerWrap, textStart;

  if (!xValue) xValue = 10;

  const topY = Math.min(yValue, yEndValue);
  const bottomY = Math.max(yValue, yEndValue);

  if (textPosition2 == 'inside' && textPosition == "above") {
    TextOffsetY = 15;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = topY;
  } else if (textPosition2 == 'outside' && textPosition == 'above') {
    TextOffsetY = -9; // Offset above the range
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = topY;
  } else if (textPosition2 == 'inside' && textPosition == 'below') {
    TextOffsetY = -9;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = bottomY;
  } else if (textPosition2 == 'outside' && textPosition == 'below') {
    TextOffsetY = 15;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = bottomY;
  } else {
    // Default values if textPosition is not specified or invalid
    TextOffsetY = 15;
    textAnchor = "start";
    centerWrap = 'middle';
    textStart = topY;
  }

  svgName.append('rect')
    .attr('x', 0)
    .attr('width', width)
    .attr('y', Math.min(yValue, yEndValue))
    .attr('height', Math.abs(yEndValue - yValue))
    .attr('class', 'annotation-range')
    //moves range rectangle behind other elements
    .lower()

  if (mobileText != true
    || size == "lg"
  ) {

    svgName.append('text')
      .attr('x', xValue)
      .attr('y', textStart + TextOffsetY)
      .attr('class', 'annotation-text')
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      textStart,
      0, // TextOffsetX - no horizontal offset needed
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}
//End annotations

// Voronoi functions
/**
 * Creates an interactive Voronoi/Delaunay overlay for scatter plots,
 * enabling mouse and keyboard interaction with tooltips.
 * @param {Object} params
 * @param {Object} params.svgContainer - D3 SVG selection.
 * @param {Array} params.data - Data points [{xvalue, yvalue, group, name}].
 * @param {number} params.chart_width - Chart width in pixels.
 * @param {number} params.height - Chart height in pixels.
 * @param {function} params.xScale - D3 x-axis scale.
 * @param {function} params.yScale - D3 y-axis scale.
 * @param {Object} [params.tooltipConfig] - Optional tooltip settings.
 * @param {*} params.shape - Shape function for points.
 * @param {number} params.circleSize - Size for circle points.
 * @param {number} params.squareSize - Size for square points.
 * @param {number} params.triangleSize - Size for triangle points.
 * @param {number} params.diamondSize - Size for diamond points.
 * @param {number} [params.radius=30] - Interaction radius in pixels.
 * @param {Object} params.margin - Chart margins {top, right, bottom, left}.
 * @returns {Object} Methods for managing overlay: cleanup(), highlightPoint(), clearHighlight().
 */
export function createDelaunayOverlay({
  svgContainer,
  data,
  chart_width,
  height,
  xScale,
  yScale,
  tooltipConfig = {},
  shape,
  circleSize,
  squareSize,
  triangleSize,
  diamondSize,
  radius = 30,
  margin
}) {
  const config = createTooltipConfig(tooltipConfig, margin);
  const delaunay = createDelaunayTriangulation(data, xScale, yScale);
  const tooltip = createTooltip(config);
  const state = createInteractionState();

  setupSVGForKeyboardNavigation(svgContainer);
  const overlay = createInteractionOverlay(svgContainer, chart_width, height);

  // Setup all event handlers
  setupMouseHandlers(overlay, delaunay, data, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize, radius, svgContainer);
  setupKeyboardHandlers(svgContainer, data, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize);

  return {
    cleanup: createCleanupFunction(tooltip, overlay, svgContainer, state),
    highlightPoint: (pointIndex) => highlightPointByIndex(pointIndex, data, svgContainer, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize),
    clearHighlight: () => clearHighlightAndDropdownMode(tooltip, svgContainer, state)
  };
}

// Create tooltip configuration with defaults
function createTooltipConfig(tooltipConfig, margin) {
  const defaultConfig = {
    xValueFormat: d3.format('.2f'),
    yValueFormat: d3.format('.2f'),
    xLabel: 'X',
    yLabel: 'Y',
    groupLabel: 'Group',
    showXValue: true,
    showYValue: true,
    showGroup: true,
    backgroundColor: '#F5F5F6',
    textColor: '#222222',
    borderRadius: '4px',
    padding: '8px 12px 10px 12px',
    fontSize: '14px',
    width: '200px',
    offset: { x: 10, y: -10 },
    margin: margin || { top: 0, bottom: 0, left: 0, right: 0 }
  };

  return { ...defaultConfig, ...tooltipConfig };
}

// Create Delaunay triangulation
function createDelaunayTriangulation(data, xScale, yScale) {
  return d3.Delaunay.from(
    data,
    d => xScale(d.xvalue),
    d => yScale(d.yvalue)
  );
}

// Create tooltip element
function createTooltip(config) {
  return d3.select('#graphic')
    .append('div')
    .attr('class', 'scatter-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', config.backgroundColor)
    .style('color', config.textColor)
    .style('border-radius', config.borderRadius)
    .style('padding', config.padding)
    .style('font-size', config.fontSize)
    .style('width', config.width)
    .style('word-wrap', 'break-word')
    .style('white-space', 'normal')
    .style('pointer-events', 'none')
    .style('z-index', '1')
    .style('box-shadow', 'box-shadow: 0 0 4px 1px rgba(136, 136, 136, 0.25)');
}

// Create interaction state object
function createInteractionState() {
  return {
    currentHighlight: null,
    keyboardIndex: 0,
    isKeyboardMode: false,
    isDropdownMode: false
  };
}

// Setup SVG for keyboard navigation
function setupSVGForKeyboardNavigation(svgContainer) {
  const svgElement = svgContainer.node().parentNode;
  d3.select(svgElement)
    .attr('tabindex', 0)
    .style('outline', 'none');
}

// Create invisible overlay for mouse events
function createInteractionOverlay(svgContainer, chart_width, height) {
  return svgContainer
    .append('rect')
    .attr('class', 'delaunay-overlay')
    .attr('width', chart_width)
    .attr('height', height)
    .attr('fill', 'transparent');
}

// Setup mouse event handlers
function setupMouseHandlers(overlay, delaunay, data, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize, radius, svgContainer) {
  overlay.on('mousemove', function (event) {
    if (state.isKeyboardMode || state.isDropdownMode) return;

    const [mouseX, mouseY] = d3.pointer(event, this);
    const nearestIndex = delaunay.find(mouseX, mouseY);
    const nearestPoint = data[nearestIndex];

    // Check if point is within radius
    const distance = Math.hypot(
      mouseX - xScale(nearestPoint.xvalue),
      mouseY - yScale(nearestPoint.yvalue)
    );

    if (distance > radius) {
      hideTooltipAndHighlight(tooltip, svgContainer, state);
      return;
    }

    if (state.currentHighlight !== nearestIndex) {
      state.currentHighlight = nearestIndex;
      updateHighlight(svgContainer, nearestPoint, xScale, yScale, shape, circleSize, squareSize, triangleSize, diamondSize);
      updateTooltip(tooltip, nearestPoint, config);
    }

    positionTooltip(tooltip, svgContainer, xScale(nearestPoint.xvalue), yScale(nearestPoint.yvalue), config);
  });

  overlay.on('mouseleave', function () {
    if (!state.isDropdownMode) {
      hideTooltipAndHighlight(tooltip, svgContainer, state);
    }
  });
}

// Setup keyboard event handlers
function setupKeyboardHandlers(svgContainer, data, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize) {
  const svgElement = svgContainer.node().parentNode;

  d3.select(svgElement).on('keydown', function (event) {
    if (state.isDropdownMode) return; // Disable keyboard navigation in dropdown mode

    if (event.key !== 'Tab') {
      event.preventDefault();
    }
    state.isKeyboardMode = true;

    const totalPoints = data.length;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        state.keyboardIndex = (state.keyboardIndex + 1) % totalPoints;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        state.keyboardIndex = (state.keyboardIndex - 1 + totalPoints) % totalPoints;
        break;
      case 'Home':
        state.keyboardIndex = 0;
        break;
      case 'End':
        state.keyboardIndex = totalPoints - 1;
        break;
      case 'Escape':
        hideTooltipAndHighlight(tooltip, svgContainer, state);
        state.isKeyboardMode = false;
        return;
      case 'Tab':
        hideTooltipAndHighlight(tooltip, svgContainer, state);
        state.isKeyboardMode = false;
        return; // Don't prevent default, allow normal tab navigation
      default:
        return;
    }

    handleKeyboardNavigation(svgContainer, data, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize);
  });

  d3.select(svgElement).on('focus', function () {
    if (!state.isKeyboardMode && data.length > 0) {
      state.keyboardIndex = 0;
      state.isKeyboardMode = true;
      handleKeyboardNavigation(svgContainer, data, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize);
    }
  });

  d3.select(svgElement).on('blur', function () {
    if (state.isKeyboardMode) {
      hideTooltipAndHighlight(tooltip, svgContainer, state);
      state.isKeyboardMode = false;
    }
  });
}

// Handle keyboard navigation updates
function handleKeyboardNavigation(svgContainer, data, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize) {
  const selectedPoint = data[state.keyboardIndex];
  state.currentHighlight = state.keyboardIndex;

  updateHighlight(svgContainer, selectedPoint, xScale, yScale, shape, circleSize, squareSize, triangleSize, diamondSize);
  updateTooltip(tooltip, selectedPoint, config);
  positionTooltip(tooltip, svgContainer, xScale(selectedPoint.xvalue), yScale(selectedPoint.yvalue), config);
}

// Update point highlight
function updateHighlight(svgContainer, point, xScale, yScale, shape, circleSize, squareSize, triangleSize, diamondSize) {
  svgContainer.selectAll('.point-highlight').remove();

  svgContainer
    .append('path')
    .attr('class', 'point-highlight')
    .attr('d', () => {
      switch (shape(point.group)) {
        case 'circle':
          return d3.symbol().type(d3.symbolCircle).size(circleSize + 50)();
        case 'square':
          return d3.symbol().type(d3.symbolSquare).size(squareSize + 50)();
        case 'triangle':
          return d3.symbol().type(d3.symbolTriangle).size(triangleSize + 50)();
        case 'diamond':
          return diamondShape((diamondSize + 50) / 10);
        default:
          return d3.symbol().type(d3.symbolCircle).size(circleSize + 50)();
      }
    })
    .attr('transform', `translate(${xScale(point.xvalue)},${yScale(point.yvalue)})`)
    .attr('fill', 'none')
    .attr('stroke', '#222')
    .attr('stroke-width', 2)
    .style('pointer-events', 'none');
}

// Update tooltip content
function updateTooltip(tooltip, point, config) {
  const xFormatted = point.formattedValue || config.xValueFormat(point.xvalue);
  const yFormatted = config.yValueFormat(point.yvalue);

  let tooltipContent = `<div style="font-weight: bold; margin-bottom: 8px;">${point.name}</div>`;

  if (config.showGroup) {
    tooltipContent += `<div style="margin-bottom: 2px;">${config.groupLabel}: ${point.group}</div>`;
  }

  if (config.showXValue) {
    const marginBottom = config.showYValue ? 'margin-bottom: 2px;' : '';
    tooltipContent += `<div style="${marginBottom}">${config.xLabel}: ${xFormatted}</div>`;
  }

  if (config.showYValue) {
    tooltipContent += `<div>${config.yLabel}: ${yFormatted}</div>`;
  }

  tooltip.html(tooltipContent);
}

// Position tooltip
function positionTooltip(tooltip, svgContainer, pointX, pointY, config) {
  const containerRect = svgContainer.node().getBoundingClientRect();
  const containerWidth = svgContainer.attr('width') || svgContainer.node().getBoundingClientRect().width;

  // Position tooltip on left if point is on right half of container
  const offsetX = pointX > containerWidth / 2 ? -config.offset.x - parseInt(config.width) + config.margin.left : config.offset.x + config.margin.left;

  tooltip
    .style('left', (containerRect.left + pointX + offsetX) + 'px')
    .style('top', (containerRect.top + pointY + config.offset.y + config.margin.top) + 'px')
    .style('visibility', 'visible');
}

// Hide tooltip and highlight
function hideTooltipAndHighlight(tooltip, svgContainer, state) {
  tooltip.style('visibility', 'hidden');
  svgContainer.selectAll('.point-highlight').remove();
  state.currentHighlight = null;
}

// Highlight point by index
function highlightPointByIndex(pointIndex, data, svgContainer, xScale, yScale, tooltip, config, state, shape, circleSize, squareSize, triangleSize, diamondSize) {
  if (pointIndex >= 0 && pointIndex < data.length) {
    const point = data[pointIndex];
    state.currentHighlight = pointIndex;
    state.isKeyboardMode = false;
    state.isDropdownMode = true; // Enable dropdown mode

    updateHighlight(svgContainer, point, xScale, yScale, shape, circleSize, squareSize, triangleSize, diamondSize);
    updateTooltip(tooltip, point, config);
    positionTooltip(tooltip, svgContainer, xScale(point.xvalue), yScale(point.yvalue), config);
  }
}

// Clear highlight and disable dropdown mode
function clearHighlightAndDropdownMode(tooltip, svgContainer, state) {
  hideTooltipAndHighlight(tooltip, svgContainer, state);
  state.isDropdownMode = false;
}

// Create cleanup function
function createCleanupFunction(tooltip, overlay, svgContainer, state) {
  return function cleanup() {
    tooltip.remove();
    overlay.remove();
    svgContainer.selectAll('.point-highlight').remove();
    const svgElement = svgContainer.node().parentNode;
    d3.select(svgElement).on('keydown', null).on('focus', null).on('blur', null);
    state.keyboardIndex = 0;
    state.isKeyboardMode = false;
    state.currentHighlight = null;
  };
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h, s, l };
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Calculate contrast ratio between two luminance values
function getContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05)
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function adjustColorForWhiteContrast(hex, requiredContrast = 3, saturationBoost = 0.1) {
  let rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // Boost saturation slightly for more vibrant result
  hsl.s = Math.min(1, hsl.s + saturationBoost);

  let luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  let contrast = getContrastRatio(1, luminance); // white is 1

  const step = 0.02;
  while (contrast < requiredContrast && hsl.l > 0) {
    hsl.l = Math.max(0, hsl.l - step);
    rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    contrast = getContrastRatio(1, luminance); //white is 1
  }

  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function getTextColorFromBackground(backgroundHex, requiredContrast = 3) {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return '#222'; // Return black if invalid hex

  const backgroundLuminance = getLuminance(rgb.r, rgb.g, rgb.b);

  const whiteLuminance = 1;
  const blackLuminance = 0;

  const whiteContrast = getContrastRatio(backgroundLuminance, whiteLuminance);
  const blackContrast = getContrastRatio(backgroundLuminance, blackLuminance);

  if (whiteContrast >= requiredContrast) {
    return '#ffffff';
  } else if (blackContrast >= requiredContrast) {
    return '#222';
  } else {
    return whiteContrast > blackContrast ? '#ffffff' : '#222';
  }
}