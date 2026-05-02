frappe.pages['new-one'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: '',
        single_column: true
    });
    // Add HTML content to the page with Font Awesome icons
    page.main.append(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="bg-gray-100">

    <div class="flex h-screen">

        <!-- Sidebar -->
        <div class="w-64 bg-blue-500 text-#5ECCB1 p-4 rounded-lg">
            <ul>
                <li class="mb-4">
                    <a href="#" class="flex items-center space-x-2 text-lg hover:text-blue-400">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Overview</span>
                    </a>
                </li>
                <li class="mb-4">
                    <a href="#" class="flex items-center space-x-2 text-lg hover:text-blue-400">
                        <i class="fas fa-chart-line"></i>
                        <span>Analytics</span>
                    </a>
                </li>
                <li class="mb-4">
                    <a href="#" class="flex items-center space-x-2 text-lg hover:text-blue-400">
                        <i class="fas fa-cogs"></i>
                        <span>Settings</span>
                    </a>
                </li>
            </ul>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 p-6">

            <!-- Page Header -->
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-semibold text-#5ECCB1">Welcome ${frappe.session.user} to Your Dashboard</h1>
                <button class="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>

            <!-- Cards Section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Card 1 -->
                <div  class="bg-white p-6 rounded-lg shadow-md">

                <h3 class="text-xl font-semibold text-gray-800">Total Users</h3>
                    <p id="total_proofs_value" class="text-3xl font-bold text-gray-900 mt-4">$14,200</p>
                    <div class="mt-4 text-sm text-gray-500">
                    </div>
                </div>

                <!-- Card 2 -->
                <div  class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold text-gray-800">Total Users</h3>
                    <p id='reviewed_value' class="text-3xl font-bold text-gray-900 mt-4"></p>
                    <div class="mt-4 text-sm text-gray-500">
                    </div>
                    </div>
                    
                    <!-- Card 3 -->
                    <div  class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold text-gray-800">Total Users</h3>
                    <div id='completed_value' class="mt-4 text-sm text-gray-500">
                    <i class="fas fa-arrow-up text-green-500"></i> 8% increase from last month
                    </div>
                    </div>
                    
                    <!-- Card 4 -->
                    <div  class="bg-white p-6 rounded-lg shadow-md">
                    
                    <h3 class="text-xl font-semibold text-gray-800">Total Users</h3>
                    <div id='notcom' class="mt-4 text-sm text-gray-500">
                        <i class="fas fa-arrow-up text-green-500"></i> 8% increase from last month
                    
                </div>
                </div>
            </div>

            <!-- Chart Section (Placeholder) -->
            <div class="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 class="text-xl font-semibold text-gray-800">Sales Analytics</h3>
                <div class="mt-4">
                    <!-- Placeholder for Chart -->
                    <div class="h-64 bg-gray-200 flex justify-center items-center">
                        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

                            <canvas id="myChart"></canvas>
                    </div>
                </div>
            </div>

        </div>
    </div>


	<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>
	
	    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

	</body>
    <style>
    h1{
    color:#5ECCB1;
    }
    div.w-64{
    background:#312E65;    
    color:#5ECCB1;
    }
    </style>
</html>
    `);
}
// Load Chart.js Library
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
script.onload = function() {
	drawCharts();
};
script.onerror = function() {
	frappe.msgprint(__('Failed to load Chart.js library.'));
};
document.head.appendChild(script);

// Fetch Data and Draw Charts
function fetchDataAndDrawCharts() {
	frappe.call({
		method: "qyass.api.charts.qyass_degree7.get_completed_sum", // API Endpoint
		callback: function(response) {
			if (response.message) {
				const apiData = response.message;

				// Initialize variables for goal and reviewed counts
				let reviewedCount = 0;
				let completedCount = 0;
				let totalProofs = 0;
				let notcom = 0;

				// Loop through the API data and calculate totals
				apiData.forEach(item => {
					totalProofs = item["totall"];
					completedCount = item["complete"];
					reviewedCount = item["reviewed"];
					notcom = item["not_com"];
				});

				document.getElementById('total_proofs_value').innerHTML = `<h1 style='font-size:50px;'>${totalProofs}</h1>`;
				document.getElementById('reviewed_value').innerHTML = `<h1 style='font-size:50px;'>${completedCount}</h1>`;
				document.getElementById('completed_value').innerHTML  = `<h1 style='font-size:50px;'>${reviewedCount}</h1>`;
				document.getElementById('notcom').innerHTML  = `<h1 style='font-size:50px;'>${notcom}</h1>`;
				document.getElementById('user').innerHTML  = `<h1 style='font-size:50px;'>${frappe.session.user}</h1>`;

				// Draw the charts with the calculated values
				drawReviewedBarChart(reviewedCount, totalProofs);
				drawGoalChart(completedCount, totalProofs);
				drawGauges(reviewedCount / totalProofs, completedCount / totalProofs);
			} else {
				frappe.msgprint(__('No data found.'));
			}
		},
		error: function() {
			frappe.msgprint(__('Error fetching data.'));
		}
	});
}

// Draw Horizontal Bar Chart for Reviewed
function drawReviewedBarChart(reviewed, total) {
	const ctx = document.getElementById('reviewed_chart').getContext('2d');
	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['المراجع'],
			datasets: [{
				label: 'المراجع',
				data: [reviewed],
				backgroundColor: '#42a5f5',
				borderColor: '#1e88e5',
				borderWidth: 1
			}]
		},
		options: {
			cutout: '80%',

			indexAxis: 'y', // Horizontal Bar Chart
			scales: {
				x: {
					beginAtZero: true,
					ticks: {
						color: '#1565c0'
					}
				},
				y: {
					ticks: {
						color: '#1565c0'
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},
				title: {
					display: true,
					text: `المراجع من إجمالي ${total}`,
					color: '#0d47a1'
				}
			}
		}
	});
}

// Draw Horizontal Bar Chart for Goal
function drawGoalChart(completed, total) {
	const ctx = document.getElementById('goal_chart').getContext('2d');
	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: ['المكتمل'],
			datasets: [{
				label: 'المكتمل',
				data: [completed],
				backgroundColor: '#66bb6a',
				borderColor: '#43a047',
				borderWidth: 1
			}]
		},
		options: {
			indexAxis: 'y', // Horizontal Bar Chart
			scales: {
				x: {
					beginAtZero: true,
					ticks: {
						color: '#2e7d32'
					}
				},
				y: {
					ticks: {
						color: '#2e7d32'
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},
				title: {
					display: true,
					text: `المكتمل من إجمالي ${total}`,
					color: '#1b5e20'
				}
			}
		}
	});
}

// Draw Gauge Charts
function drawGauges(reviewedPercentage, completedPercentage) {
	const ctxReviewed = document.getElementById('gauge_reviewed').getContext('2d');
	const ctxCompleted = document.getElementById('gauge_complete').getContext('2d');

	new Chart(ctxReviewed, {
		type: 'doughnut',
		data: {
			labels: ['المراجع', 'متبقي'],
			datasets: [{
				data: [reviewedPercentage * 100, 100 - reviewedPercentage * 100],
				backgroundColor: ['#29b6f6', '#eeeeee'],
				borderWidth: 0
			}]
		},
		options: {
			plugins: {
				legend: {
					display: false
				},
				title: {
					display: true,
					text: 'المراجع (%)',
					color: '#01579b'
				}
			},
			cutout: '80%'
		}
	});

	new Chart(ctxCompleted, {
		type: 'doughnut',
		data: {
			labels: ['المكتمل', 'متبقي'],
			datasets: [{
				data: [completedPercentage * 100, 100 - completedPercentage * 100],
				backgroundColor: ['#81c784', '#eeeeee'],
				borderWidth: 0
			}]
		},
		options: {
			plugins: {
				legend: {
					display: false
				},
				title: {
					display: true,
					text: 'المكتمل (%)',
					color: '#1b5e20'
				}
			},
			cutout: '80%'
		}
	});
    
}

// Draw All Charts
function drawCharts() {
	fetchDataAndDrawCharts();
}

// Sample data for the chart
const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],  // X-axis labels
    datasets: [{
        label: 'Sales (in USD)',
        data: [5000, 8000, 3000, 2000, 6000, 9000],  // Data values
        backgroundColor: 'rgba(54, 162, 235, 0.2)',  // Bar fill color
        borderColor: 'rgba(54, 162, 235, 1)',  // Bar border color
        borderWidth: 1
    }]
};

// Chart configuration options
const config = {
    type: 'bar',  // Bar chart
    data: data,
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true  // Start Y-axis from zero
            }
        },
        plugins: {
            legend: {
                display: true,  // Show the legend
            },
            tooltip: {
                enabled: true,  // Show tooltips on hover
            }
        }
    }
};

// Render the chart
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, config);

