$.ajax({
    url: "http://10.10.89.180:18080/MonitorBW/MonitorView/nthor028/CLIENTE_PERF-Cliente",
    success: function (data) {

        console.log(data);

        data = JSON.parse(data);
        var idInstance = data.idInstance;
        var host = data.host;

        var procRegister = data.procRegister;
        var xcategories = [];
        var series = [{name: 'Total', data: []}, {name: 'Memory', data: []}];

        for (var i = 0; i < procRegister.length; i++) {

            series[0].data.push(procRegister[i].currentTotalprocess);
            series[1].data.push(procRegister[i].currentMemoryProcess);

            xcategories.push(new Date(procRegister[i].currentTime));
        }

        $("#chart-canvas").highcharts({
            title: {
                text: 'Business Activity Monitoring ' + idInstance
            },

            subtitle: {
                text: 'Fonte: BW ' + host
            },

            xAxis: {
                categories: xcategories
            },

            yAxis: {
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },

            legend: {
                align: 'left',
                verticalAlign: 'top',
                y: 20,
                floating: true,
                borderWidth: 0
            },
            series: series
        });
    },
    error: function(d,msg) {
        console.log(d);
        console.log(msg);
    }
});
