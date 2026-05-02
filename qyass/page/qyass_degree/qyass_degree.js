frappe.pages['qyass-degree'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		// title: 'درجة قياس',
		single_column: true
	});

// Add multiple divs for charts
$(page.body).append(`
	<style>
	h1{
            color:#5ECCB1;
            background:#312E65;
            padding:10px;
            border-radius:10px;
			text-align: center;
                    margin-top: 20px;
            }
	</style>
	<h1>درجة قياس</h1>
	<div style="display: flex; flex-wrap: wrap;border-radius: 20px;background: #007edd1c; justify-content: space-between; margin-bottom: 20px;">
		<div class="cards" style="width: 200px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
			<h3>كل المستندات</h3>
			<p id="total_proofs_value" style="font-size: 24px; font-weight: bold;"></p>
		</div>
		<div class="cards" style="width: 200px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
			<h3>المستندات المراجعة</h3>
			<p id="reviewed_value" style="font-size: 24px; font-weight: bold;"></p>
		</div>
		<div class="cards" style="width: 200px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
			<h3>المستندات المكتملة</h3>
			<p id="completed_value" style="font-size: 24px; font-weight: bold;"></p>
		</div>
		<div class="cards" style="width: 200px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
			<h3>المستندات المتبقية</h3>
			<p id="notcom" style="font-size: 24px; font-weight: bold;"></p>
		</div>
	</div>
	<center>
		<div style='padding: 10px; margin: 10px; border: solid #90caf9; border-radius: 10px;'>
			<canvas id="reviewed_chart" style="width: 90%; height: 150px; display: block;"></canvas>
			<canvas id="goal_chart" style="width: 90%; height: 150px; display: block;"></canvas>
		</div>
		<div style='display:flex;justify-content:space-around;flex-wrap:wrap;padding: 10px; margin: 10px; border: solid #90caf9; border-radius: 10px;'>
			<canvas id="gauge_reviewed" style="max-height: 300px;max-width: 300px; display: inline-block;"></canvas>
			<canvas id="gauge_complete" style="max-height: 300px;max-width: 300px; display: inline-block;"></canvas>
		</div>
	</center>
`);

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

				document.getElementById('total_proofs_value').innerText = totalProofs;
				document.getElementById('reviewed_value').innerText = reviewedCount;
				document.getElementById('completed_value').innerText = completedCount;
				document.getElementById('notcom').innerText = notcom;

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

}
