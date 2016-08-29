

$(document).ready(function () {

    var urlServico = "";
    var urlArquivo = "js/app/data1.json";
    var urlWebServer = "";

    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        var host = localStorage.getItem("bwBamLastHost");
        if(host) {
            $("#hostSelect").val(host);
        }
        var service = localStorage.getItem("bwBamLastService");
        if(service) {
            $("#serviceSelect").val(service);
        }
        urlWebServer = localStorage.getItem("bwBamUrlWebServer");
        if(urlWebServer) {
            urlWebServer = "http://10.10.89.180:8080/MonitorBW/MonitorView/";
        }
        urlServico = localStorage.getItem("bwBamLastUrlService");
        if(urlServico) {
            urlServico = "http://10.10.89.180:8080/MonitorBW/MonitorView/2k8rjohmgbw03/SRV-1149-SRV-1149";
        }
    } else {
        // Sorry! No Web Storage support..
        urlWebServer = "http://10.10.89.180:8080/MonitorBW/MonitorView/";
        urlServico = "http://10.10.89.180:8080/MonitorBW/MonitorView/2k8rjohmgbw03/SRV-1149-SRV-1149";
    }

    $("#errorMsg").hide();

    $("#webServer").val(urlWebServer);

    var url = urlServico;
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    createChart(url, 50);

    $(document).on('click', '#btnUpdateChart', function(e){
        var host = $("#hostSelect").val();
        var service = $("#serviceSelect").val();
        var webServer = $("#webServer").val();

        if(service === "arquivo") {
            createChart(urlArquivo, 0);
        } else {

            var selecionado = webServer + host + "/" + service;

            if (typeof(Storage) !== "undefined") {
                // Code for localStorage/sessionStorage.
                localStorage.setItem("bwBamLastHost", host);
                localStorage.setItem("bwBamLastService", service);
                localStorage.setItem("bwBamUrlWebServer", webServer);
                localStorage.setItem("bwBamLastUrlService", selecionado);
            }

            createChart(selecionado, 50);
        }

    });

    $(document).on('click', '.panel-heading span.clickable', function(e){
        var $this = $(this);
        if(!$this.hasClass('panel-collapsed')) {
            $this.parents('.panel').find('.panel-body').slideUp();
            $this.addClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            $this.parents('.panel').find('.panel-body').slideDown();
            $this.removeClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
    })

});


function createChart(url, intervalUrlNumber) {
    $("#errorMsg").hide();
    if($('#chart-canvas').highcharts()) {
        $('#chart-canvas').highcharts().destroy();
        $('#pie-canvas').highcharts().destroy();
    }
    waitingDialog.show("Carregando dados iniciais. Aguarde");
    $.ajax({
        url: url,
        success: function (data) {

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
                                var urlInterval = intervalUrlNumber === 0 ? url : url + "/" + intervalUrlNumber
                                $.ajax({
                                    url: urlInterval,
                                    success: function (data) {
                                        var procRegister = data.procRegister;
                                        procRegister.reverse();
                                        for (var i = 0; i < procRegister.length; i++) {
                                            var date = new Date(procRegister[i].currentTime).getTime();
                                            if (date > maxDate) {
                                                var seriesData = [];
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

                            }, 2000);
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
                        count: 30,
                        type: 'minute',
                        text: '30M'
                    }, {
                        count: 1,
                        type: 'hour',
                        text: '1H'
                    }, {
                        count: 1,
                        type: 'day',
                        text: '1D'
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
                                var urlInterval = intervalUrlNumber === 0 ? url : url + "/" + intervalUrlNumber
                                $.ajax({
                                    url: urlInterval,
                                    success: function (data) {

                                        var procRegister = data.procRegister;
                                        procRegister.reverse();
                                        if(series1.options) {
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
                                        }
                                    },
                                    error: function (d, msg) {
                                        console.log(d);
                                        console.log(msg);
                                    }
                                });

                            }, 2000);
                        }
                    }
                },
                title: {
                    text: idInstance
                },

                subtitle: {
                    text: 'Fonte: BW ' + host
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    plotLines: [{
                        value: 75,
                        width: 2,
                        color: 'green',
                        dashStyle: 'shortdash',
                        label: {
                            text: 'Valor médio: 75'
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
        error: function (d, msg, errorThrown) {
            waitingDialog.hide();
            if(msg === "error") {
                $("#errorMsg").show();
            }
        }
    });
}