frappe.pages['employee-qyass'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        // title: 'الموظفين',
        single_column: true
    });

    // Add container for charts
    $(page.body).append(`
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-top: 20px;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .vision-section {
            margin: 30px 0;
            padding: 20px;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
        }
        .vision-section h3 {
            width: 100%;
            font-size: 20px;
            color: #34495e;
            text-align: left;
            margin-bottom: 10px;
        }
        .chart-container {
            width: 48%;
            margin-bottom: 20px;
        }
        .chart-container canvas {
                        max-width: 300px;
            max-height:300px;
        }
        .stats {
            width: 150px;
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 10px;
            margin:3px;
            text-align: center;
        }
        .stats h3 {
            margin: 5px 0;
            color: #2c3e50;
        }
        @media (max-width: 768px) {
            .chart-container, .stats {
                width: 100%;
            }
        }
            h1{
            color:#5ECCB1;
            background:#312E65;
            padding:10px;
            border-radius:10px;
            }
    </style>

    <h1>الموظفين</h1>
        <div id="charts-container" class="container"></div>
                        	<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>

    `);

    // Load Chart.js
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = fetchDataAndDrawCharts;
    script.onerror = function () {
        alert('Failed to load Chart.js library.');
    };
    document.head.appendChild(script);

    // Fetch data and draw charts
    async function fetchDataAndDrawCharts() {
        try {
            const response = await fetch('https://qyass.newerasofts.com/api/method/qyass.api.charts.employee1.get_completed_sum');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message) {
                const apiData = data.message;
                apiData.sort((a, b) => parseInt(a.digital_transformation_officer.split(':')[0]) - parseInt(b.digital_transformation_officer.split(':')[0]));

                // Clear existing content
                const container = document.getElementById('charts-container');
                container.innerHTML = '';

                apiData.forEach((item, index) => {
                    const officer = item["digital_transformation_officer"];
                    const total = item["totall"];
                    const completed = item["complete"];
                    const reviewed = item["reviewed"];
                    const completedPercentage = (completed / total) * 100;
                    const reviewedPercentage = (reviewed / total) * 100;

                    // Create section for each officer
                    const section = document.createElement('div');
                    section.className = 'vision-section';
                    section.innerHTML = `
                        <h3>${officer}</h3>
                        <div class="chart-container">
                
                            <canvas id="donut_completed_${sanitizeName(officer, index)}"></canvas>
                        </div>
                        <div class="chart-container">

                            <canvas id="donut_reviewed_${sanitizeName(officer, index)}"></canvas>
                        </div>
                        <div class="stats">
                            <h3>المكتمل: ${completed} <i class="fa-solid fa-check"></i></h3>
                        </div>
                        <div class="stats">
                            <h3>المراجَع: ${reviewed} <i class="fa-solid fa-check"></i><i class="fa-solid fa-check"></i></h3>
                        </div>
                        <div class="stats">
                            <h3>الكل: ${total}</h3>
                        </div>
                    `;
                    container.appendChild(section);

                    // Draw donut charts
                    drawDonutChart(`donut_completed_${sanitizeName(officer, index)}`, 'المكتمل %', completedPercentage, '#4caf50');
                    drawDonutChart(`donut_reviewed_${sanitizeName(officer, index)}`, 'المراجَع %', reviewedPercentage, '#2196f3');
                });
            } else {
                alert('No data found in the response.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please check the API URL or network connection.');
        }
    }

    // Draw donut chart
    function drawDonutChart(containerId, label, percentage, color) {
        const ctx = document.getElementById(containerId).getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [label, 'المتبقي %'],
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [color, '#e0e0e0'],
                    borderWidth: 1
                }]
            },
            options: {
                cutout: '80%',
                plugins: {
                    title: {
                        display: true,
                        text: label,
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Sanitize names for valid HTML ID usage
    function sanitizeName(name, index) {
        return `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
    }
};
