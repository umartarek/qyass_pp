frappe.pages['new-2'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'None',
        single_column: true
    });

    // Add external libraries (Vue, PrimeVue, Google Charts)
    const head = page.head;
    head.append(`
        <!-- Vue.js CDN -->
        <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js"></script>

        <!-- PrimeVue CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/primevue/resources/primevue.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/primeicons/primeicons.css">

        <!-- PrimeVue Components JS -->
        <script src="https://cdn.jsdelivr.net/npm/primevue@2.7.0/button/button.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/primevue@2.7.0/card/card.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/primevue@2.7.0/sidebar/sidebar.min.js"></script>

        <!-- Google Charts CDN -->
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    `);

    // Add the HTML structure to page.main
    page.main.append(`
        <div id="app">
            <p-sidebar :visible.sync="sidebarVisible" position="left" style="width: 250px;">
                <h3>Menu</h3>
                <ul>
                    <li><a href="#">Dashboard</a></li>
                    <li><a href="#">Profile</a></li>
                    <li><a href="#">Settings</a></li>
                </ul>
            </p-sidebar>

            <button @click="toggleSidebar" class="p-button p-component">Toggle Sidebar</button>
            <h2>PrimeVue Dashboard with Google Chart</h2>

            <!-- Dashboard Cards -->
            <div style="display: flex; gap: 20px;">
                <p-card title="Tasks Overview" style="width: 250px;">
                    <template #content>
                        <p>Completed Tasks: 80%</p>
                        <p>Pending Tasks: 20%</p>
                    </template>
                </p-card>

                <p-card title="Sales Overview" style="width: 250px;">
                    <template #content>
                        <p>Total Sales: $150,000</p>
                        <p>Last Month: $10,000</p>
                    </template>
                </p-card>

                <!-- Performance Pie Chart -->
                <p-card title="Performance" style="width: 250px;">
                    <template #content>
                        <div id="piechart" style="width: 100%; height: 200px;"></div>
                    </template>
                </p-card>
            </div>
        </div>
    `);

    // Initialize Vue instance after the page content is loaded
    frappe.after_ajax(function() {
        new Vue({
            el: '#app',
            data() {
                return {
                    sidebarVisible: false
                };
            },
            methods: {
                toggleSidebar() {
                    this.sidebarVisible = !this.sidebarVisible;
                }
            },
            mounted() {
                // Initialize Google Pie Chart
                google.charts.load('current', { packages: ['corechart', 'piechart'] });
                google.charts.setOnLoadCallback(this.drawChart);
            },
            methods: {
                drawChart() {
                    var data = google.visualization.arrayToDataTable([
                        ['Task', 'Hours per Day'],
                        ['Work', 8],
                        ['Eat', 2],
                        ['Sleep', 7],
                        ['Exercise', 2],
                        ['Relax', 5]
                    ]);
                    var options = { title: 'Performance', is3D: true };
                    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
                    chart.draw(data, options);
                }
            }
        });
    });
}
