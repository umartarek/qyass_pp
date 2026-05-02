frappe.pages['late-elements'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        // title: 'الموظفين',
        single_column: true
    });

    // Add container for charts
    $(page.body).append(`
	<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>

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
        .containers {
            width: 100%;
            margin: 0 auto;
            display: flex;
          flex-wrap: wrap;
         gap: 15px;
        }
        .vision-section {
		width:300px;
            margin: 30px 0;
            padding: 20px;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
			flex-wrap:wrap;
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
            width: 220px;
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
    <h1> المعايير المتأخرة للموظفين </h1>
        <div id="charts-container" class="containers"></div>
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
            const response = await fetch('https://qyass.newerasofts.com/api/method/qyass.api.charts.late_proof3.get_completed_sum');

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
                    const total = item["total"];
                    const completed = item["complete"];
                    const reviewed = item["reviewed"];
                    const completedPercentage = (completed / total) * 100;
                    const reviewedPercentage = (reviewed / total) * 100;

                    // Create section for each officer
                    const section = document.createElement('div');
                    section.className = 'vision-section';
                    section.innerHTML = `
                        <h2>${officer}</h2>
                        <div class="stats">
						<a href='https://qyass.newerasofts.com/app/elements-2024?digital_transformation_officer=${officer}' class='stats'>تصفح المعايير</a>
						<h1><i class="fa-solid fa-clock"></i><br> ${total}</h1>
                        </div>
						
                    `;
                    container.appendChild(section);
				 });
            } else {
                alert('No data found in the response.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please check the API URL or network connection.');
        }
    }

    // Sanitize names for valid HTML ID usage
    function sanitizeName(name, index) {
        return `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
    }

	
};

