frappe.pages['general-vision'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Task Progress',
        single_column: true
    });

    // Create chart container in the page body
    let chartContainer = '<div id="chart" style="max-width: 600px; margin: 35px auto;"></div>';
    $(page.body).append(chartContainer);
    // Dynamically load the ApexCharts library
    $.getScript("https://cdn.jsdelivr.net/npm/apexcharts", function() {
        console.log("ApexCharts library loaded successfully");

        var options = {
            series: [{
            data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
          }],
            chart: {
            type: 'bar',
            height: 350
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              borderRadiusApplication: 'end',
              horizontal: true,
            }
          },
          dataLabels: {
            enabled: false
          },
          xaxis: {
            categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan',
              'United States', 'China', 'Germany'
            ],
          }
          };
  
          var chart = new ApexCharts(document.querySelector("#chart"), options);
          chart.render();
    })
};
