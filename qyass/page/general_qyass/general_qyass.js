frappe.pages['general-qyass'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        // title: 'ملخص عام للمناظير',
        single_column: true
    });

    // Add divs for charts and values
    $(page.body).append(`
    <style>
                /* Professional Style */
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
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .vision-section h3 {
                    width: 100%;
                    font-size: 18px;
                    color: #34495e;
                    text-align: left;
                }

                .chart-container {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                }

                .chart-container div {
                    margin-right: 20px;
                }

                .chart-container div:last-child {
                    margin-right: 0;
                }

                canvas {
                    width: 100% !important;
                    max-width: 300px;
                    max-height: 250px;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .chart-container {
                        flex-direction: column;
                    }

                    .chart-container div {
                        width: 100%;
                        margin-bottom: 15px;
                    }

                    .chart-container div:last-child {
                        margin-bottom: 0;
                    }
                }
        .stats {
            width: 150px;
            height:100px;
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
                        text-align: center;
                                margin-top: 20px;
                        }
    </style>

	<h1>ملخص عام للمناظير</h1>
    <div id="gauges-container" class="container"></div>
    
    	<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>
    `);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
        fetchDataAndDrawCharts();
    };
    script.onerror = function() {
        alert('Failed to load Chart.js library.');
    };
    document.head.appendChild(script);

    function sanitizeVisionName(vision) {
        return vision.replace(/[^a-zA-Z0-9]/g, '_');
    }

    async function fetchDataAndDrawCharts() {
        try {
            const response = await fetch('https://qyass.newerasofts.com/api/method/qyass.api.charts.general_charts3.get_completed_sum');
            const data = await response.json();

            if (data.message) {
                const apiData = data.message;
                apiData.sort((a, b) => parseInt(a.vision.split(':')[0]) - parseInt(b.vision.split(':')[0]));

                const container = document.getElementById('gauges-container');
                container.innerHTML = '';

                apiData.forEach(item => {
                    const { vision, totall, complete, reviewed } = item;
                    const completedPercentage = (complete / totall) * 100;
                    const reviewedPercentage = (reviewed / totall) * 100;

                    const section = document.createElement('div');
                    section.className = 'vision-section';
                    section.innerHTML = `
                        <h3>${vision}</h3>
                        <div class="chart-container">
                        <div><h3>المستندات المكتملة (٪)<h2><br>${parseInt(reviewed /totall *100)}%</h2><canvas id="chart_complete_${sanitizeVisionName(vision)}"></canvas></div>
                        <div><h3>المستندات المكتملة (٪)<h2><br>${parseInt(complete /totall *100)}%</h2><canvas id="chart_reviewed_${sanitizeVisionName(vision)}"></canvas></div>
                        <div class="stats">
                        
                        <h3>المكتمل: ${complete} <i class="fa-solid fa-check"></i></h3>
                        </div>
                        <div class="stats">
                        <h3>المراجَع: ${reviewed} <i class="fa-solid fa-check"></i><i class="fa-solid fa-check"></i></h3>
                        </div>
                        <div class="stats">
                        <h3>الكل: ${totall} <i class="fa-solid fa-bars"></i></h3>
                        </div>
                        </div>
                    `;
                    container.appendChild(section);

                    drawChart(`chart_complete_${sanitizeVisionName(vision)}`, 'المكتمل %', completedPercentage, '#4caf50');
                    drawChart(`chart_reviewed_${sanitizeVisionName(vision)}`, 'المراجَع %', reviewedPercentage, '#2196f3');
                });
            } else {
                alert('No data found.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data.');
        }
    }

    function drawChart(canvasId, label, percentage, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');
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
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
};
