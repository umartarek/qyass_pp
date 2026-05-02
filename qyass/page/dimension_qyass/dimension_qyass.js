frappe.pages['dimension-qyass'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        // title: ',
        single_column: true
    });

    // Ensure the wrapper is ready for dynamic chart insertion
    $(page.body).append(`
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vision Gauges</title>
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
                    width: 90%;
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

                .gauge-container {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                }

                .gauge-container div {
                    margin-right: 20px;
                }

                .gauge-container div:last-child {
                    margin-right: 0;
                }

                canvas {
                    width: 100% !important;
                    max-width: 250px;
                    height: 200px;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .gauge-container {
                        flex-direction: column;
                    }

                    .gauge-container div {
                        width: 100%;
                        margin-bottom: 15px;
                    }

                    .gauge-container div:last-child {
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
            h1{
            color:#5ECCB1;
            background:#312E65;
            padding:10px;
            border-radius:10px;
            }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
            <h1>ملخص عام للمحاور</h1>
            <div id="gauges-container"></div> <!-- This will hold the dynamic gauges -->
                	<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>

        </body>
    </html>
    `);

    // Fetch Data and Draw Charts
    async function fetchDataAndDrawCharts() {
        try {
            const response = await fetch('https://qyass.newerasofts.com/api/method/qyass.api.charts.dimensions1.get_completed_sum');
            const data = await response.json();

            if (data.message) {
                let apiData = data.message;

                // Sort the data based on the number at the beginning of the vision string
                apiData.sort((a, b) => {
                    const numA = parseInt(a.dimension.split(':')[0]);
                    const numB = parseInt(b.dimension.split(':')[0]);
                    return numA - numB;
                });

                // Create container for the gauges dynamically
                const container = document.getElementById('gauges-container');
                container.innerHTML = ''; // Clear existing content if any

                // Loop through each vision and draw its corresponding gauge charts
                apiData.forEach(item => {
                    const dimension = item["dimension"];
                    const total = item["totall"];
                    const completed = item["complete"];
                    const reviewed = item["reviewed"];

                    // Create a section for each vision
                    const section = document.createElement('div');
                    section.className = 'vision-section';
                    section.innerHTML = `
                        <h3>${dimension}</h3>
                        <div class="gauge-container">
                        <div><h3>المستندات المراجَعة (٪)<h2><br>${parseInt(reviewed / total *100)}%</h2><canvas id="gauge_reviewed_${sanitizeVisionName(dimension)}"></canvas></div>
                        <div><h3>المستندات المكتملة (٪)<h2><br>${parseInt(completed /total *100)}%</h2><canvas id="gauge_complete_${sanitizeVisionName(dimension)}"></canvas></div>
                        <div class="stats">
                        <h3>المكتمل: ${completed} <i class="fa-solid fa-check"></i></h3>
                        </div>
                        <div class="stats">
                        <h3>المراجَع: ${reviewed} <i class="fa-solid fa-check"></i><i class="fa-solid fa-check"></i></h3>
                        </div>
                        <div class="stats">
                        <h3>الكل: ${total}</h3>
                        </div>
                        </div>
                    `;
                    container.appendChild(section);

                    // Draw the gauges for each vision
                    drawGauges(dimension, reviewed / total, completed / total);
                });
            } else {
                alert('No data found.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data.');
        }
    }

    // Function to sanitize vision name for valid HTML ID usage
    function sanitizeVisionName(vision) {
        return vision.replace(/[^a-zA-Z0-9]/g, '_'); // Replace non-alphanumeric characters with underscores
    }

    // Draw Gauge Charts for each Vision using Chart.js
    function drawGauges(dimension, reviewedPercentage, completedPercentage) {
        const reviewedData = {
            type: 'doughnut',
            data: {
                labels: ['المراجَع%', ''],
                datasets: [{
                    data: [reviewedPercentage * 100, 100 - (reviewedPercentage * 100)],
                    backgroundColor: ['#3498db', '#e6e6e6'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                cutout: '80%',
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(1)}%`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        };

        const completedData = {
            type: 'doughnut',
            data: {
                labels: ['المكتمل%', ''],
                datasets: [{
                    data: [completedPercentage * 100, 100 - (completedPercentage * 100)],
                    backgroundColor: ['#2ecc71', '#e6e6e6'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                cutout: '80%',
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(1)}%`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        };

        const sanitizedVision = sanitizeVisionName(dimension);
        
        // Draw the charts on the canvas elements
        new Chart(document.getElementById(`gauge_reviewed_${sanitizedVision}`), reviewedData);
        new Chart(document.getElementById(`gauge_complete_${sanitizedVision}`), completedData);
    }

    // Call to fetch data and draw charts after the page is loaded
    fetchDataAndDrawCharts();
};
