AmCharts.makeChart("chartdiv",
				{
					"type": "serial",
					"categoryField": "date",
					"columnSpacing": 0,
					"columnWidth": 0,
					"dataDateFormat": "YYYY-MM",
					"startEffect": "bounce",
					"borderColor": "#98a6ad",
					"color": "#98a6ad",
					"theme": "light",
					"categoryAxis": {
						"minPeriod": "MM",
						"parseDates": true,
						"titleBold": false
					
					},
					"chartCursor": {
						"enabled": true,
						"categoryBalloonAlpha": 0.57,
						"categoryBalloonDateFormat": "MMM YYYY",
						"cursorAlpha": 0.21,
						"selectionAlpha": 0,
						"valueLineAlpha": 0,
						"zoomable": false
					},
					"trendLines": [],
					"graphs": [
						{
							"color": "#98a6ad",
							"fillAlphas": 0.7,
							"fillColors": "#E3F65A",
							"gapPeriod": 1,
							"id": "AmGraph-1",
							"legendColor": "#FF8000",
							"lineAlpha": 0,
							"lineColor": "#98a6ad",
							"minDistance": 0,
							"negativeFillColors": "#98a6ad",
							"title": "BTC",
							"topRadius": 0,
							"valueField": "column-1",
							"visibleInLegend": false
						},
						{
							"bulletBorderColor": "#136E6C",
							"bulletBorderThickness": 0,
							"bulletColor": "#136E6C",
							"bulletSize": 5,
							"fillAlphas": 0.7,
							"fillColors": "#136E6C",
							"id": "AmGraph-2",
							"legendColor": "#136E6C",
							"lineAlpha": 0,
							"title": "DNC",
							"valueField": "column-2"
						}
					],
					"guides": [],
					"valueAxes": [
						{
							"id": "ValueAxis-1",
							"stackType": "regular",
							"totalTextColor": "#98a6ad",
							"autoGridCount": false,
							"autoRotateAngle": 0,
							"axisAlpha": 0.48,
			"axisColor": "#98A6AD",
							
							"gridAlpha": 0,
							"gridColor": "#98a6ad",
							"labelRotation": -9,
							"minorGridAlpha": 0,
							"title": "",
							"titleBold": false
						}
					],
					"allLabels": [],
					"balloon": {},
					"legend": {
						"enabled": true,
						"align": "center",
						"equalWidths": false,
						"markerType": "circle",
						"reversedOrder": true,
						"color": "#98A6AD"
					},
					"categoryAxis": {
						"gridPosition": "start",
						"startOnAxis": true
					},
					
					"titles": [
						{
							"alpha": 0,
							"id": "Title-1",
							"size": 15,
							"text": ""
						}
					],
					"dataProvider": [
						{
							"date": "2016-01",
							"column-1": "440.00",
							"column-2": "570.20"
						},
						{
							"date": "2016-02",
							"column-1": "324.99",
							"column-2": "550.40"
						},
						{
							"date": "2016-03",
							"column-1": "234.44",
							"column-2": "470.20"
						},
						{
							"date": "2016-04",
							"column-1": "232.23",
							"column-2": "270.00"
						},
						{
							"date": "2016-05",
							"column-1": "555.90",
							"column-2": "870.20"
						},
						{
							"date": "2016-06",
							"column-1": "444.99",
							"column-2": "770.20"
						},
						{
							"date": "2016-07",
							"column-1": "222.22",
							"column-2": "530.10"
						}
					]
				}
			);




AmCharts.makeChart("btc_chart",
				{
					"type": "serial",
					"categoryField": "date",
					"columnSpacing": 0,
					"columnWidth": 0,
					"dataDateFormat": "YYYY-MM",
					"startEffect": "bounce",
					"borderColor": "#98a6ad",
					"color": "#98a6ad",
					"theme": "light",
					"categoryAxis": {
						"minPeriod": "MM",
						"parseDates": true,
						"titleBold": false
					
					},
					"chartCursor": {
						"enabled": true,
						"categoryBalloonAlpha": 0.57,
						"categoryBalloonDateFormat": "MMM YYYY",
						"cursorAlpha": 0.21,
						"selectionAlpha": 0,
						"valueLineAlpha": 0,
						"zoomable": false
					},
					"trendLines": [],
					"graphs": [
						{
							"color": "#98a6ad",
							"fillAlphas": 0.7,
							"fillColors": "#E3F65A",
							"gapPeriod": 1,
							"id": "AmGraph-1",
							"legendColor": "#FF8000",
							"lineAlpha": 0,
							"lineColor": "#98a6ad",
							"minDistance": 0,
							"negativeFillColors": "#98a6ad",
							"title": "BTC",
							"topRadius": 0,
							"valueField": "column-1",
							"visibleInLegend": false
						},
						{
							"bulletBorderColor": "#136E6C",
							"bulletBorderThickness": 0,
							"bulletColor": "#136E6C",
							"bulletSize": 5,
							"fillAlphas": 0.7,
							"fillColors": "#136E6C",
							"id": "AmGraph-2",
							"legendColor": "#136E6C",
							"lineAlpha": 0,
							"title": "BTC",
							"valueField": "column-2"
						}
					],
					"guides": [],
					"valueAxes": [
						{
							"id": "ValueAxis-1",
							"stackType": "regular",
							"totalTextColor": "#98a6ad",
							"autoGridCount": false,
							"autoRotateAngle": 0,
							"axisAlpha": 0.48,
			"axisColor": "#98A6AD",
							
							"gridAlpha": 0,
							"gridColor": "#98a6ad",
							"labelRotation": -9,
							"minorGridAlpha": 0,
							"title": "",
							"titleBold": false
						}
					],
					"allLabels": [],
					"balloon": {},
					"legend": {
						"enabled": true,
						"align": "center",
						"equalWidths": false,
						"markerType": "circle",
						"reversedOrder": true,
						"color": "#98A6AD"
					},
					"categoryAxis": {
						"gridPosition": "start",
						"startOnAxis": true
					},
					
					"titles": [
						{
							"alpha": 0,
							"id": "Title-1",
							"size": 15,
							"text": ""
						}
					],
					"dataProvider": [
						{
							"date": "2016-01",
							"column-1": "440.00",
							"column-2": "570.20"
						},
						{
							"date": "2016-02",
							"column-1": "324.99",
							"column-2": "550.40"
						},
						{
							"date": "2016-03",
							"column-1": "234.44",
							"column-2": "470.20"
						},
						{
							"date": "2016-04",
							"column-1": "232.23",
							"column-2": "270.00"
						},
						{
							"date": "2016-05",
							"column-1": "555.90",
							"column-2": "870.20"
						},
						{
							"date": "2016-06",
							"column-1": "444.99",
							"column-2": "770.20"
						},
						{
							"date": "2016-07",
							"column-1": "222.22",
							"column-2": "530.10"
						}
					]
				}
			);


AmCharts.makeChart("eth_chart",
				{
					"type": "serial",
					"categoryField": "date",
					"columnSpacing": 0,
					"columnWidth": 0,
					"dataDateFormat": "YYYY-MM",
					"startEffect": "bounce",
					"borderColor": "#98a6ad",
					"color": "#98a6ad",
					"theme": "light",
					"categoryAxis": {
						"minPeriod": "MM",
						"parseDates": true,
						"titleBold": false
					
					},
					"chartCursor": {
						"enabled": true,
						"categoryBalloonAlpha": 0.57,
						"categoryBalloonDateFormat": "MMM YYYY",
						"cursorAlpha": 0.21,
						"selectionAlpha": 0,
						"valueLineAlpha": 0,
						"zoomable": false
					},
					"trendLines": [],
					"graphs": [
						{
							"color": "#98a6ad",
							"fillAlphas": 0.7,
							"fillColors": "#E3F65A",
							"gapPeriod": 1,
							"id": "AmGraph-1",
							"legendColor": "#FF8000",
							"lineAlpha": 0,
							"lineColor": "#98a6ad",
							"minDistance": 0,
							"negativeFillColors": "#98a6ad",
							"title": "BTC",
							"topRadius": 0,
							"valueField": "column-1",
							"visibleInLegend": false
						},
						{
							"bulletBorderColor": "#136E6C",
							"bulletBorderThickness": 0,
							"bulletColor": "#136E6C",
							"bulletSize": 5,
							"fillAlphas": 0.7,
							"fillColors": "#136E6C",
							"id": "AmGraph-2",
							"legendColor": "#136E6C",
							"lineAlpha": 0,
							"title": "ETH",
							"valueField": "column-2"
						}
					],
					"guides": [],
					"valueAxes": [
						{
							"id": "ValueAxis-1",
							"stackType": "regular",
							"totalTextColor": "#98a6ad",
							"autoGridCount": false,
							"autoRotateAngle": 0,
							"axisAlpha": 0.48,
			"axisColor": "#98A6AD",
							
							"gridAlpha": 0,
							"gridColor": "#98a6ad",
							"labelRotation": -9,
							"minorGridAlpha": 0,
							"title": "",
							"titleBold": false
						}
					],
					"allLabels": [],
					"balloon": {},
					"legend": {
						"enabled": true,
						"align": "center",
						"equalWidths": false,
						"markerType": "circle",
						"reversedOrder": true,
						"color": "#98A6AD"
					},
					"categoryAxis": {
						"gridPosition": "start",
						"startOnAxis": true
					},
					
					"titles": [
						{
							"alpha": 0,
							"id": "Title-1",
							"size": 15,
							"text": ""
						}
					],
					"dataProvider": [
						{
							"date": "2016-01",
							"column-1": "440.00",
							"column-2": "570.20"
						},
						{
							"date": "2016-02",
							"column-1": "324.99",
							"column-2": "550.40"
						},
						{
							"date": "2016-03",
							"column-1": "234.44",
							"column-2": "470.20"
						},
						{
							"date": "2016-04",
							"column-1": "232.23",
							"column-2": "270.00"
						},
						{
							"date": "2016-05",
							"column-1": "555.90",
							"column-2": "870.20"
						},
						{
							"date": "2016-06",
							"column-1": "444.99",
							"column-2": "770.20"
						},
						{
							"date": "2016-07",
							"column-1": "222.22",
							"column-2": "530.10"
						}
					]
				}
			);
			
			
			
			
			AmCharts.makeChart("gsc_chart",
				{
					"type": "serial",
					"categoryField": "date",
					"columnSpacing": 0,
					"columnWidth": 0,
					"dataDateFormat": "YYYY-MM",
					"startEffect": "bounce",
					"borderColor": "#98a6ad",
					"color": "#98a6ad",
					"theme": "light",
					"categoryAxis": {
						"minPeriod": "MM",
						"parseDates": true,
						"titleBold": false
					
					},
					"chartCursor": {
						"enabled": true,
						"categoryBalloonAlpha": 0.57,
						"categoryBalloonDateFormat": "MMM YYYY",
						"cursorAlpha": 0.21,
						"selectionAlpha": 0,
						"valueLineAlpha": 0,
						"zoomable": false
					},
					"trendLines": [],
					"graphs": [
						{
							"color": "#98a6ad",
							"fillAlphas": 0.7,
							"fillColors": "#E3F65A",
							"gapPeriod": 1,
							"id": "AmGraph-1",
							"legendColor": "#FF8000",
							"lineAlpha": 0,
							"lineColor": "#98a6ad",
							"minDistance": 0,
							"negativeFillColors": "#98a6ad",
							"title": "BTC",
							"topRadius": 0,
							"valueField": "column-1",
							"visibleInLegend": false
						},
						{
							"bulletBorderColor": "#136E6C",
							"bulletBorderThickness": 0,
							"bulletColor": "#136E6C",
							"bulletSize": 5,
							"fillAlphas": 0.7,
							"fillColors": "#136E6C",
							"id": "AmGraph-2",
							"legendColor": "#136E6C",
							"lineAlpha": 0,
							"title": "GSC",
							"valueField": "column-2"
						}
					],
					"guides": [],
					"valueAxes": [
						{
							"id": "ValueAxis-1",
							"stackType": "regular",
							"totalTextColor": "#98a6ad",
							"autoGridCount": false,
							"autoRotateAngle": 0,
							"axisAlpha": 0.48,
			"axisColor": "#98A6AD",
							
							"gridAlpha": 0,
							"gridColor": "#98a6ad",
							"labelRotation": -9,
							"minorGridAlpha": 0,
							"title": "",
							"titleBold": false
						}
					],
					"allLabels": [],
					"balloon": {},
					"legend": {
						"enabled": true,
						"align": "center",
						"equalWidths": false,
						"markerType": "circle",
						"reversedOrder": true,
						"color": "#98A6AD"
					},
					"categoryAxis": {
						"gridPosition": "start",
						"startOnAxis": true
					},
					
					"titles": [
						{
							"alpha": 0,
							"id": "Title-1",
							"size": 15,
							"text": ""
						}
					],
					"dataProvider": [
						{
							"date": "2016-01",
							"column-1": "440.00",
							"column-2": "570.20"
						},
						{
							"date": "2016-02",
							"column-1": "324.99",
							"column-2": "550.40"
						},
						{
							"date": "2016-03",
							"column-1": "234.44",
							"column-2": "470.20"
						},
						{
							"date": "2016-04",
							"column-1": "232.23",
							"column-2": "270.00"
						},
						{
							"date": "2016-05",
							"column-1": "555.90",
							"column-2": "870.20"
						},
						{
							"date": "2016-06",
							"column-1": "444.99",
							"column-2": "770.20"
						},
						{
							"date": "2016-07",
							"column-1": "222.22",
							"column-2": "530.10"
						}
					]
				}
			);




			
			
			
			AmCharts.makeChart("dnd_chart",
				{
					"type": "serial",
					"categoryField": "date",
					"columnSpacing": 0,
					"columnWidth": 0,
					"dataDateFormat": "YYYY-MM",
					"startEffect": "bounce",
					"borderColor": "#98a6ad",
					"color": "#98a6ad",
					"theme": "light",
					"categoryAxis": {
						"minPeriod": "MM",
						"parseDates": true,
						"titleBold": false
					
					},
					"chartCursor": {
						"enabled": true,
						"categoryBalloonAlpha": 0.57,
						"categoryBalloonDateFormat": "MMM YYYY",
						"cursorAlpha": 0.21,
						"selectionAlpha": 0,
						"valueLineAlpha": 0,
						"zoomable": false
					},
					"trendLines": [],
					"graphs": [
						{
							"color": "#98a6ad",
							"fillAlphas": 0.7,
							"fillColors": "#E3F65A",
							"gapPeriod": 1,
							"id": "AmGraph-1",
							"legendColor": "#FF8000",
							"lineAlpha": 0,
							"lineColor": "#98a6ad",
							"minDistance": 0,
							"negativeFillColors": "#98a6ad",
							"title": "BTC",
							"topRadius": 0,
							"valueField": "column-1",
							"visibleInLegend": false
						},
						{
							"bulletBorderColor": "#136E6C",
							"bulletBorderThickness": 0,
							"bulletColor": "#136E6C",
							"bulletSize": 5,
							"fillAlphas": 0.7,
							"fillColors": "#136E6C",
							"id": "AmGraph-2",
							"legendColor": "#136E6C",
							"lineAlpha": 0,
							"title": "DND",
							"valueField": "column-2"
						}
					],
					"guides": [],
					"valueAxes": [
						{
							"id": "ValueAxis-1",
							"stackType": "regular",
							"totalTextColor": "#98a6ad",
							"autoGridCount": false,
							"autoRotateAngle": 0,
							"axisAlpha": 0.48,
			"axisColor": "#98A6AD",
							
							"gridAlpha": 0,
							"gridColor": "#98a6ad",
							"labelRotation": -9,
							"minorGridAlpha": 0,
							"title": "",
							"titleBold": false
						}
					],
					"allLabels": [],
					"balloon": {},
					"legend": {
						"enabled": true,
						"align": "center",
						"equalWidths": false,
						"markerType": "circle",
						"reversedOrder": true,
						"color": "#98A6AD"
					},
					"categoryAxis": {
						"gridPosition": "start",
						"startOnAxis": true
					},
					
					"titles": [
						{
							"alpha": 0,
							"id": "Title-1",
							"size": 15,
							"text": ""
						}
					],
					"dataProvider": [
						{
							"date": "2016-01",
							"column-1": "440.00",
							"column-2": "570.20"
						},
						{
							"date": "2016-02",
							"column-1": "324.99",
							"column-2": "550.40"
						},
						{
							"date": "2016-03",
							"column-1": "234.44",
							"column-2": "470.20"
						},
						{
							"date": "2016-04",
							"column-1": "232.23",
							"column-2": "270.00"
						},
						{
							"date": "2016-05",
							"column-1": "555.90",
							"column-2": "870.20"
						},
						{
							"date": "2016-06",
							"column-1": "444.99",
							"column-2": "770.20"
						},
						{
							"date": "2016-07",
							"column-1": "222.22",
							"column-2": "530.10"
						}
					]
				}
			);



