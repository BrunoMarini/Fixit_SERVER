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
    hideAll();
    console.log("APARECEU AQUI");
    const req = new XMLHttpRequest();
    req.open('GET', '/map/getDateIndex', true);
    req.setRequestHeader('Content-Type', 'plain/text;charset=UTF-8');
    req.send();

    req.onreadystatechange = function() {
        if(req.readyState == 4 && req.status == 200) {
            const reportData = JSON.parse(req.responseText);

            if(reportData.length == 0) {
                console.log("OPOOOPA DEU BOSTA");
                return;
            }
            //The table is populated assuming the data is already sorted chronologically
            //Table exemple
            //  Date    | Type_1 | Type_2 | ... | Type_3
            //--------- | ------ | ------ | --- | ------
            //  Day X   | qtdRep | qtdRep | ... | qtdRep
            //  Day Y   | qtdRep | qtdRep | ... | qtdRep
            var data = new google.visualization.DataTable();
            data.addColumn('date', 'Dia');
            for(let i = 0; i < reportData[0].reports.length; i++) {
                data.addColumn('number', reportData[0].reports[i].type);
            }

            const rows = [];
            for(let i = 0; i < reportData.length; i++) {
                const temp = [];
                temp.push(new Date(reportData[i].date));
                for(let j = 0; j < reportData[i].reports.length; j++) {
                    temp.push(reportData[i].reports[j].length);
                }
                rows.push(temp);
            }
            data.addRows(rows);

            var options = {
                title: 'Reportes ao longo do tempo',
                curveType: 'function',
                'width': 'auto',
                'height': 500,
                'text-align': 'center',
                legend: { position: 'bottom' },
            };

            var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
            chart.draw(data, options);
            showDiv('chart_div');
        }
    }
}

function showDiv(id) {
    document.getElementById(id).style.visibility = 'visible';
}

function hideAll() {
    document.getElementById('default_text').style.visibility = 'hidden';
    document.getElementById('chart_div').style.visibility = 'hidden';
}