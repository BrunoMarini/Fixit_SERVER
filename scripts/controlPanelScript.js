let reportNumbers;

function loadInfo() {
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(requestData);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function requestData() {
        const req = new XMLHttpRequest();
        req.open('GET', '/map/getReportNumbers', true);
        req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');
        req.send();

        req.onreadystatechange = function() {
            if(req.readyState == 4 && req.status == 200) {
                reportNumbers = JSON.parse(req.responseText);
            }
        }
            
    }
}

function drawPieChart() {
    hideAll();
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    
    const rows = [];
    for(let i = 0; i < reportNumbers.length; i++) {
        const temp = [];
        temp.push(reportNumbers[i].type);
        temp.push(reportNumbers[i].length);
        rows.push(temp);
    }
    
    data.addRows(rows);
    // Set chart options
    var options = {'title':'Problemas reportados',
                    'width': 'auto',
                    'height': 500,
                    'text-align': 'center',
                    'is3D': true,
                };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
                  //google.visualization.BarChart
    chart.draw(data, options);
    showDiv('chart_div');
}

function drawLineChart() {

}

function showDiv(id) {
    document.getElementById(id).style.visibility = 'visible';
}

function hideAll() {
    document.getElementById('default_text').style.visibility = 'hidden';
    document.getElementById('chart_div').style.visibility = 'hidden';
}