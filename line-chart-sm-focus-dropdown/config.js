config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSlinePalette,
	"sourceText": "Office for National Statistics and Ordnance Survey",
	"referenceCategory": "Great Britain",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"lineCurveType": "curveLinear", // Set the default line curve type
	// Examples of line curve types
	// "lineCurveType": "curveLinear", // Straight line segments
	// "lineCurveType": "curveStep", // Step-wise line
	// "lineCurveType": "curveStepBefore", // Step-before line
	// "lineCurveType": "curveStepAfter", // Step-after line
	// "lineCurveType": "curveBasis", // B-spline curve
	// "lineCurveType": "curveCardinal", // Cardinal spline curve
	// "lineCurveType": "curveCatmullRom" // Catmull-Rom spline curve
	// "lineCurveType": "curveMonotoneX" // Monotone spline curve
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,2000]
	"yDomainMin": "data",
	// "auto" (smart zero baseline), "data" (exact min), or numeric value
	"yDomainMax": "data",
	// "auto" (smart zero baseline), "data" (exact max), or numeric value
	"xAxisTickFormat": {
		"sm": "'%y",
		"md": "'%y",
		"lg": "'%y"
	},
	"dateFormat": "%Y",
	"xAxisNumberFormat": ".0f",
	"yAxisNumberFormat": ".0f",
	"xAxisLabel": "Year",
	"yAxisLabel": "Index",
	"zeroLine": 100,
	"chartEvery": {
		"sm": 2,
		"md": 3,
		"lg": 4
	},
	"aspectRatio": {
		"sm": [3, 4],
		"md": [3, 4],
		"lg": [3, 4]
	},
	"margin": {
		"sm": {
			"top": 50,
			"right": 10,
			"bottom": 50,
			"left": 25
		},
		"md": {
			"top": 50,
			"right": 10,
			"bottom": 50,
			"left": 25
		},
		"lg": {
			"top": 50,
			"right": 10,
			"bottom": 50,
			"left": 25
		}
	},
	"chartGap": 20,
	"xAxisTickMethod": "interval", // "interval" or "total"
	"xAxisTickCount": { // for "total" method
		"sm": 2,
		"md": 2,
		"lg": 2
	},
	"xAxisTickInterval": { // for "interval" method
		"unit": "year", // "year", "month", "quarter", "day"
		"step": { // every x "units"
			"sm": 2,
			"md": 2,
			"lg": 2
		}
	},
	"labelSpans": {
		"enabled": false,
		timeUnit: 'quarter',//set to "day","month",'quarter' or 'year'
		secondaryTimeUnit: 'auto'//can be 'auto' or false to disable. set to "day","month",'quarter' or 'year' to override
	},
	"yAxisTicks": {
		"sm": 4,
		"md": 4,
		"lg": 4
	},
	"dropYAxis": true,
	"freeYAxisScales": false, //If true dropYAxis will be ignored - each chart will always have a y-axis
	"addEndMarkers": false,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
