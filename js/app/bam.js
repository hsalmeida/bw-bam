var urlServico = "http://10.10.89.180:8080/MonitorBW/MonitorView/2k8rjohmgbw03/SRV-1149-SRV-1149/50";
var urlArquivo = "js/app/data1.json";

$(document).ready(function () {
    var url = urlServico;

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    $.ajax({
        url: url,
        success: function (data) {
            waitingDialog.show("Carregando dados iniciais. Aguarde");
            var idInstance = data.idInstance;
            var host = data.host;

            var procRegister = data.procRegister;
            procRegister.reverse();
            //var xcategories = [];
            var series = [
                {
                    name: 'Total Process',
                    data: [],
                    marker: {
                        enabled: true,
                        radius: 3
                    }
                },
                {
                    name: 'Memory Process',
                    data: [],
                    marker: {
                        enabled: true,
                        radius: 3
                    }
                }
            ];

            var maxDate = 0;
            var lastData = [];
            for (var i = 0; i < procRegister.length; i++) {
                var date = new Date(procRegister[i].currentTime).getTime();
                if (date > maxDate) {
                    maxDate = date;
                    lastData = [
                        ['Used Memory', Number(procRegister[i].usedMemory)],
                        ['Free Memory', Number(procRegister[i].freeMemory)]
                    ];
                }
                series[0].data.push([date, procRegister[i].currentTotalprocess]);
                series[1].data.push([date, procRegister[i].currentMemoryProcess]);

                //var catDate = (date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear() +
                //" " + date.getHours() + "h" + date.getMinutes() + "m" + date.getSeconds() + "s");

                //xcategories.push(date);
            }

            var mDate = new Date();
            mDate.setTime(maxDate);
            var catDate = (mDate.getDate() + '/' + (mDate.getMonth() + 1) + '/' + mDate.getFullYear() +
            " " + mDate.getHours() + "h" + mDate.getMinutes() + "m" + mDate.getSeconds() + "s");

            $("#pie-canvas").highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false,
                    events: {
                        load: function () {
                            var series1 = this.series[0];
                            var chart = this;
                            setInterval(function () {
                                $.ajax({
                                    url: url,
                                    success: function (data) {
                                        var procRegister = data.procRegister;
                                        procRegister.reverse();
                                        var seriesData = [];
                                        for (var i = 0; i < procRegister.length; i++) {
                                            var date = new Date(procRegister[i].currentTime).getTime();
                                            if (date > maxDate) {
                                                maxDate = date;

                                                var mDate = new Date();
                                                mDate.setTime(maxDate);
                                                var catDate = (mDate.getDate() + '/' + (mDate.getMonth() + 1) + '/' + mDate.getFullYear() +
                                                " " + mDate.getHours() + "h" + mDate.getMinutes() + "m" + mDate.getSeconds() + "s");

                                                var data1 = ['Used Memory', Number(procRegister[i].usedMemory)];
                                                var data2 = ['Free Memory', Number(procRegister[i].freeMemory)];
                                                seriesData.push(data1);
                                                seriesData.push(data2);
                                                series1.setData(seriesData, true);
                                                chart.setTitle(null, { text: catDate });
                                            }
                                        }
                                    },
                                    error: function (d, msg) {
                                        console.log(d);
                                        console.log(msg);
                                    }
                                });

                            }, 1500);
                        }
                    }
                },
                title: {
                    text: 'Memory Usage'
                },
                exporting: {
                    enabled: false
                },
                subtitle: {
                    text: catDate
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: true,
                            distance: -50,
                            style: {
                                fontWeight: 'bold',
                                color: 'white',
                                textShadow: '0px 1px 2px black'
                            }
                        },
                        startAngle: -90,
                        endAngle: 90,
                        center: ['50%', '75%']
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Memory',
                    innerSize: '50%',
                    data: lastData
                }]
            });

            $("#chart-canvas").highcharts('StockChart', {
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1M'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5M'
                    }, {
                        count: 10,
                        type: 'minute',
                        text: '10M'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                exporting: {
                    enabled: false
                },
                chart: {
                    events: {
                        load: function () {
                            var series1 = this.series[0];
                            var series2 = this.series[1];

                            setInterval(function () {
                                $.ajax({
                                    url: url,
                                    success: function (data) {

                                        var procRegister = data.procRegister;
                                        procRegister.reverse();

                                        var last = series1.options.data.length !== 0 ?
                                            series1.options.data[series1.options.data.length - 1] : undefined;

                                        for (var i = 0; i < procRegister.length; i++) {

                                            var date = new Date(procRegister[i].currentTime).getTime();

                                            if (last && date > last[0]) {

                                                var y1 = procRegister[i].currentTotalprocess;
                                                var y2 = procRegister[i].currentMemoryProcess;

                                                series1.addPoint([date, y1], true, true);
                                                series2.addPoint([date, y2], true, true);
                                            }
                                        }

                                    },
                                    error: function (d, msg) {
                                        console.log(d);
                                        console.log(msg);
                                    }
                                });

                            }, 1500);
                        }
                    }
                },
                title: {
                    text: 'Business Activity Monitoring ' + idInstance
                },

                subtitle: {
                    text: 'Fonte: BW ' + host
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    plotLines: [{
                        value: 50,
                        width: 2,
                        color: 'green',
                        dashStyle: 'shortdash',
                        label: {
                            text: 'Valor médio'
                        }
                    }]
                },
                legend: {
                    enabled: true
                },
                series: series
            });
            waitingDialog.hide();
        },
        error: function (d, msg) {
            console.log(d);
            console.log(msg);
        }
    });
});