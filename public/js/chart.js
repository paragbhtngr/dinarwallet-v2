google.charts.load('current', {'packages':['corechart']});
//google.charts.setOnLoadCallback(function(){drawChart([])});
function drawChart(data, color) {
	console.log(data);
	if(!color) {
		color = '#e9d482';
	}
	if(!google.visualization) {
		setTimeout(function(){drawChart(data, color)}, 1000)
	}
    var data = google.visualization.arrayToDataTable(data, true);

    var options = {
    	legend:'none',
    	colors: ['blue'],
    	candlestick: {
	    	fallingColor: { strokeWidth: 0, fill: 'red'},
	    	risingColor: { strokeWidth: 0, fill: 'green'} 
    	},
    	vAxis: {
	    	title:"Price",
	    	titleTextStyle: {color: color},
	    	textStyle: {color: color}
    	},
    	hAxis: {
	    	title:"Time", 
	    	titleTextStyle: {color: color},
	    	textStyle: {color: color}
    	},
    	chartArea:{width:'80%'},
    	backgroundColor: 'none'
    };

    var chart = new google.visualization.CandlestickChart(document.getElementById('chart_div'));

	chart.draw(data, options);
}