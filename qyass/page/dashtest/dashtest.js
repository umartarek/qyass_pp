frappe.pages['dashtest'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'لوحة الأداء',
        single_column: true
    });

    // Add HTML structure
    $(page.body).html(`
        <style>
            :root {
                --primary-color: #1abc9c;
                --background-color: #f4f6f9;
                --card-background: #ffffff;
                --text-color: #333;
                --text-light: #777;
                --border-color: #e0e0e0;
                --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

                /* Dashboard Theme Colors */
                --status-compliant: #28a745;       /* Green */
                --status-partial: #ffc107;         /* Yellow */
                --status-non-compliant: #dc3545;   /* Red */
                --status-na: #bdc3c7;              /* Gray */

                --progress-bar-bg: #f0f0f0;
                --progress-bar-fill: #8e44ad;
            }

            .dashboard-container {
                max-width: 1200px;
                margin: 0 auto;
                font-family: 'Tajawal', sans-serif;
                direction: rtl;
                padding-bottom: 50px;
            }

            /* --- Filter Section Styles --- */
            .filter-section {
                background-color: var(--card-background);
                padding: 20px;
                border-radius: 12px;
                box-shadow: var(--shadow);
                margin-bottom: 25px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .filter-group label {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-light);
            }

            .filter-group select {
                padding: 10px;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                background-color: var(--background-color);
                font-family: inherit;
                color: var(--text-color);
                outline: none;
                transition: border-color 0.2s;
            }

            .filter-group select:focus {
                border-color: var(--primary-color);
            }

            /* --- Dashboard Content Styles --- */
            .dashboard-content {
                background-color: var(--card-background);
                padding: 30px;
                border-radius: 12px;
                box-shadow: var(--shadow);
                display: flex;
                flex-direction: column;
                gap: 40px;
            }

            .card {
                background: var(--card-background);
                border-radius: 8px;
                padding: 20px;
                border: 1px solid var(--border-color);
            }

            .card-title {
                font-weight: 700;
                font-size: 1.1rem;
                color: var(--primary-color);
                margin-bottom: 15px;
                border-bottom: 2px solid var(--primary-color);
                padding-bottom: 10px;
                display: inline-block;
            }

            .summary-section {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 30px;
                align-items: flex-start;
            }

            .summary-main {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .score-comparison {
                display: flex;
                gap: 20px;
            }

            .score-box {
                flex: 1;
                padding: 15px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
            }
            
            .score-box h3 {
                margin: 0 0 10px;
                font-size: 0.9rem;
                color: var(--text-light);
                font-weight: 500;
            }

            .score-box .score-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-weight: 700;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .score-box .score-content .score-id {
                background-color: var(--background-color);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.9rem;
            }

            .compliance-summary {
                padding: 15px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
            }
            
            .compliance-summary h3 {
                margin: 0 0 15px;
                font-size: 0.9rem;
                color: var(--text-light);
                font-weight: 500;
            }
            
            .compliance-items {
                display: flex;
                justify-content: space-around;
                text-align: center;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .compliance-item .value {
                font-size: 2rem;
                font-weight: 700;
            }
            
            .compliance-item .label {
                font-size: 0.9rem;
                color: var(--text-light);
            }

            #compliance-total .value { color: var(--status-compliant); }
            #compliance-partial .value { color: var(--status-partial); }
            #compliance-none .value { color: var(--status-non-compliant); }
            #compliance-na .value { color: var(--status-na); }

            .summary-chart-container {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .donut-chart {
                position: relative;
                width: 160px;
                height: 160px;
                border-radius: 50%;
                background: conic-gradient(var(--primary-color) 0deg, var(--background-color) 0deg);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .donut-chart::before {
                content: '';
                position: absolute;
                width: 80%;
                height: 80%;
                background: var(--card-background);
                border-radius: 50%;
            }
            
            .donut-chart-info {
                position: relative;
                text-align: center;
                z-index: 1;
            }
            
            .donut-chart-value {
                font-size: 2.2rem;
                font-weight: 700;
                color: var(--text-color);
            }
            
            .donut-chart-label {
                font-size: 0.9rem;
                color: var(--text-light);
            }

            .details-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .details-list-item {
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 15px;
                align-items: center;
                font-size: 0.95rem;
            }
            
            .item-label {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .item-id {
                background-color: var(--progress-bar-fill);
                color: white;
                padding: 4px 8px;
                font-size: 0.8rem;
                border-radius: 4px;
            }
            
            .progress-bar-container {
                width: 100%;
                height: 10px;
                background-color: var(--progress-bar-bg);
                border-radius: 5px;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background-color: var(--progress-bar-fill);
                width: 0;
                transition: width 0.5s ease-in-out;
            }
            
            .item-percentage {
                font-weight: 500;
                min-width: 50px;
                text-align: left;
            }

            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 15px;
            }
            
            .status-item {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-weight: 700;
                color: white;
                margin: 0 auto;
                font-size: 0.9rem;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .status-item:hover {
                transform: scale(1.1);
            }
            
            .status-compliant { background-color: var(--status-compliant); }
            .status-partial { background-color: var(--status-partial); }
            .status-non-compliant { background-color: var(--status-non-compliant); }
            .status-na { background-color: var(--status-na); color: white; }

            /* Custom Status Colors for Details Grid */
            .custom-status-not-started { border: 3px solid var(--status-not-started); }
            .custom-status-in-progress { border: 3px solid var(--status-in-progress); }
            .custom-status-quality { border: 3px solid var(--status-quality); }
            .custom-status-review { border: 3px solid var(--status-review); }
            .custom-status-approved { border: 3px solid var(--status-approved); }

            .dashboard-footer {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 25px;
                padding-top: 10px;
                flex-wrap: wrap;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9rem;
            }
            
            .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 50%;
            }

            .loading {
                text-align: center;
                padding: 40px;
                color: var(--text-light);
            }

            @media (max-width: 992px) {
                .summary-section {
                    grid-template-columns: 1fr;
                }
                .summary-chart-container {
                    order: -1;
                    margin-bottom: 20px;
                }
            }

            @media (max-width: 768px) {
                .dashboard-content {
                    padding: 20px;
                }
                .score-comparison {
                    flex-direction: column;
                }
                .details-list-item {
                    grid-template-columns: 1fr;
                    gap: 8px;
                    border: 1px solid var(--border-color);
                    padding: 10px;
                    border-radius: 6px;
                }
                .filter-section {
                    grid-template-columns: 1fr;
                }
            }
        </style>

        <div class="dashboard-container">
            <!-- Filter Section -->
            <div class="filter-section">
                <div class="filter-group">
                    <label for="filter-department">الإدارة (Department)</label>
                    <select id="filter-department">
                        <option value="">الكل</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter-officer">مسؤول التحول الرقمي (Digital Officer)</label>
                    <select id="filter-officer">
                        <option value="">الكل</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter-employee">الموظف المسؤول (Employee In Charge)</label>
                    <select id="filter-employee">
                        <option value="">الكل</option>
                    </select>
                </div>
            </div>

            <div class="loading" id="loading">جاري تحميل البيانات...</div>
            <main class="dashboard-content" id="dashboard-content" style="display: none;">
                <section class="summary-section">
                    <div class="summary-main">
                        <div class="score-comparison">
                            <div class="score-box">
                                <h3>أعلى نتيجة للمسار</h3>
                                <div class="score-content" id="highest-score">
                                    <span>-</span>
                                    <span class="score-id">-</span>
                                    <strong>0%</strong>
                                </div>
                            </div>
                            <div class="score-box">
                                <h3>أقل نتيجة للمحاور</h3>
                                <div class="score-content" id="lowest-score">
                                    <span>-</span>
                                    <span class="score-id">-</span>
                                    <strong>0%</strong>
                                </div>
                            </div>
                        </div>
                        <div class="compliance-summary">
                            <h3>ملخص الالتزام بالمعايير</h3>
                            <div class="compliance-items">
                                <div class="compliance-item" id="compliance-total">
                                    <div class="value">0</div>
                                    <div class="label">التزام كلي</div>
                                </div>
                                <div class="compliance-item" id="compliance-partial">
                                    <div class="value">0</div>
                                    <div class="label">التزام جزئي</div>
                                </div>
                                <div class="compliance-item" id="compliance-none">
                                    <div class="value">0</div>
                                    <div class="label">عدم التزام</div>
                                </div>
                                <div class="compliance-item" id="compliance-na">
                                    <div class="value">0</div>
                                    <div class="label">لا ينطبق</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="summary-chart-container">
                        <div class="donut-chart" id="final-result-chart">
                            <div class="donut-chart-info">
                                <div class="donut-chart-value" id="final-result-value">0%</div>
                                <div class="donut-chart-label">النتيجة النهائية</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="card">
                    <h2 class="card-title">التفاصيل 1 - نسب المعايير (المحاور الرئيسية)</h2>
                    <ul class="details-list" id="details-list-1"></ul>
                </section>

                <footer class="dashboard-footer">
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: var(--status-compliant);"></span>
                        <span>التزام كلي</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: var(--status-partial);"></span>
                        <span>التزام جزئي</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: var(--status-non-compliant);"></span>
                        <span>عدم التزام</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: var(--status-na);"></span>
                        <span>لا ينطبق</span>
                    </div>
                </footer>
                
                <section class="card">
                <h2 class="card-title">التفاصيل 2 - حالة المعايير</h2>
                    <div class="status-grid" id="details-grid-2"></div>
                </section>

                <section class="card">
                    <h2 class="card-title">التفاصيل 1.2 - نسب جميع المعايير</h2>
                    <ul class="details-list" id="details-list-1-all"></ul>
                </section>

            </main>
        </div>
    `);

    // Initialize: Populate dropdowns then load data
    populateFilters().then(() => {
        loadDashboardData();
    });

    // Event Listeners for Filters
    $('#filter-department, #filter-officer, #filter-employee').on('change', function() {
        $('#dashboard-content').hide();
        $('#loading').show();
        loadDashboardData();
    });

    // Function to populate filter dropdowns from Doctypes
    function populateFilters() {
        return new Promise((resolve, reject) => {
            const p1 = frappe.call({
                method: 'frappe.client.get_list',
                args: { doctype: 'Department', fields: ['name'], limit_page_length: 0 }
            });
            
            // Assuming both Officer and Employee fields link to 'Employee' Doctype
            const p2 = frappe.call({
                method: 'frappe.client.get_list',
                args: { doctype: 'Employee', fields: ['name', 'employee_name'], limit_page_length: 0 }
            });

            Promise.all([p1, p2]).then(results => {
                const departments = results[0].message || [];
                const employees = results[1].message || [];

                // Populate Department
                const deptSelect = $('#filter-department');
                departments.forEach(d => {
                    deptSelect.append(`<option value="${d.name}">${d.name}</option>`);
                });

                // Populate Officer and Employee In Charge (Using the same Employee list)
                const officerSelect = $('#filter-officer');
                const empSelect = $('#filter-employee');

                employees.forEach(e => {
                    // Display name: Employee Name (ID) or just ID
                    const displayName = e.employee_name ? `${e.employee_name} (${e.name})` : e.name;
                    const optionHtml = `<option value="${e.name}">${displayName}</option>`;
                    
                    officerSelect.append(optionHtml);
                    empSelect.append(optionHtml);
                });

                resolve();
            }).catch(err => {
                console.error("Error populating filters", err);
                resolve(); // Resolve anyway to allow dashboard to load without filters
            });
        });
    }

    function loadDashboardData() {
        // Build filters object based on dropdown values
        let filters = {};
        
        const selectedDept = $('#filter-department').val();
        if (selectedDept) filters.department = selectedDept;

        const selectedOfficer = $('#filter-officer').val();
        if (selectedOfficer) filters.digital_transformation_officer = selectedOfficer;

        const selectedEmployee = $('#filter-employee').val();
        if (selectedEmployee) filters.the_employee_in_charge = selectedEmployee;

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: ['name', 'number', 'custom_status', 'dimension'],
                filters: filters, // Pass the dynamic filters here
                limit_page_length: 0
            },
            callback: function(response) {
                if (response.message && response.message.length > 0) {
                    // Get full documents to access Child Table (requirements)
                    const promises = response.message.map(item => {
                        return frappe.call({
                            method: 'frappe.client.get',
                            args: {
                                doctype: 'Elements-2024',
                                name: item.name
                            }
                        });
                    });

                    Promise.all(promises).then(results => {
                        const fullData = results.map(r => r.message);
                        processData(fullData);
                        $('#loading').hide();
                        $('#dashboard-content').show();
                    }).catch(error => {
                        console.error('Error loading data:', error);
                        $('#loading').html('حدث خطأ في تحميل البيانات');
                    });
                } else {
                    $('#loading').hide();
                    $('#dashboard-content').show(); // Show empty dashboard
                    // Clear displays if no data
                    $('#highest-score, #lowest-score').html('<span>-</span>');
                    $('.value').text('0');
                    renderFinalResult(0);
                    $('#details-list-1, #details-list-1-all, #details-grid-2').empty();
                    $('#details-grid-2').html('<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">لا توجد بيانات تطابق الفلاتر المختارة</p>');
                }
            },
            error: function(error) {
                console.error('Error:', error);
                $('#loading').html('حدث خطأ في تحميل البيانات');
            }
        });
    }

    function processData(elements) {
        // Map custom_status to CSS classes for borders
        const customStatusMap = {
            'لم يبدأ': 'not-started',
            'تحت الاجراء': 'in-progress',
            'الجودة': 'quality',
            'المراجعة': 'review',
            'تم الاعتماد': 'approved'
        };

        // Count compliance categories
        const complianceCounts = {
            compliant: 0,
            partial: 0,
            'non-compliant': 0,
            na: 0
        };

        // Group elements by dimension (for Details 1)
        const elementsByDimension = {};
        
        // This array will hold the processed data for the Grid
        const gridElements = [];
        const allElements = [];

        elements.forEach(element => {
            // --- LOGIC START ---
            const requirements = element.requirements || [];
            const total = requirements.length;

            // Check if any requirement has 'not' checked (N/A)
            const isNA = requirements.some(r => r['not'] == 1 || r['not'] === true);

            // Calculate progress
            const doneCount = requirements.filter(r => r.done == 1 || r.done === true).length;
            const notDone = total - doneCount;

            // Calculate percentage
            const percentage = total > 0 ? (doneCount / total) * 100 : 0;
            const elementProgress = parseFloat(percentage.toFixed(2));

            let statusCategory = 'non-compliant'; // Default

            // Logic Priority:
            // 1. If 'not' is checked -> Gray (na)
            // 2. If all done -> Green (compliant)
            // 3. If missing 1:
            //    a. If total is 1 -> Red (non-compliant)
            //    b. If total > 1 -> Yellow (partial)
            // 4. If missing > 1 -> Red (non-compliant)

            if (isNA) {
                statusCategory = 'na'; // Gray
            } else if (total > 0) {
                if (notDone === 0) {
                    statusCategory = 'compliant'; // Green
                } else if (notDone === 1) {
                    if (total === 1) {
                        statusCategory = 'non-compliant'; // Red
                    } else {
                        statusCategory = 'partial'; // Yellow
                    }
                } else {
                    statusCategory = 'non-compliant'; // Red
                }
            } else {
                statusCategory = 'non-compliant'; // Default
            }
            // --- LOGIC END ---

            // Update Counts
            complianceCounts[statusCategory]++;

            // Prepare Data for Grid
            gridElements.push({
                id: element.name,
                number: element.number || element.name,
                status: statusCategory, 
                customStatus: customStatusMap[element.custom_status] || '',
                progress: elementProgress
            });

            // Prepare Data for All List
            allElements.push({
                id: element.name,
                number: element.number || element.name,
                label: element.custom_name_ar || element.name_ar || element.arabic_name || element.title || element.name,
                value: elementProgress
            });

            // Group by dimension field
            const dimension = element.dimension || 'غير محدد';
            if (!elementsByDimension[dimension]) {
                elementsByDimension[dimension] = {
                    id: dimension,
                    label: dimension,
                    total: 0,
                    totalProgress: 0,
                    count: 0
                };
            }
            elementsByDimension[dimension].total++;
            elementsByDimension[dimension].totalProgress += elementProgress;
            elementsByDimension[dimension].count++;
        });

        // Update compliance summary
        $('#compliance-total .value').text(complianceCounts.compliant);
        $('#compliance-partial .value').text(complianceCounts.partial);
        $('#compliance-none .value').text(complianceCounts['non-compliant']);
        $('#compliance-na .value').text(complianceCounts.na);

        // Calculate final result (average of dimension percentages)
        const dimensionPercentages = Object.values(elementsByDimension).map(dim => {
            return dim.count > 0 ? (dim.totalProgress / dim.count) : 0;
        });
        const finalResult = dimensionPercentages.length > 0 
            ? (dimensionPercentages.reduce((sum, val) => sum + val, 0) / dimensionPercentages.length).toFixed(2)
            : 0;

        renderFinalResult(finalResult);

        // Render Details 1 (Progress bars by dimension)
        const dimensionElements = Object.values(elementsByDimension).map(dim => ({
            ...dim,
            value: dim.count > 0 ? (dim.totalProgress / dim.count) : 0
        })).sort((a, b) => b.value - a.value);

        renderDetailsList1(dimensionElements);

        // Render Details 1.2 (All elements list)
        renderDetailsListAll(allElements.sort((a, b) => b.value - a.value));

        // Find highest and lowest scores (from dimensions)
        if (dimensionElements.length > 0) {
            const highest = dimensionElements[0];
            const lowest = dimensionElements[dimensionElements.length - 1];

            $('#highest-score').html(`
                <span>${highest.label}</span>
                <span class="score-id">${highest.id}</span>
                <strong>${highest.value.toFixed(2)}%</strong>
            `);

            $('#lowest-score').html(`
                <span>${lowest.label}</span>
                <span class="score-id">${lowest.id}</span>
                <strong>${lowest.value.toFixed(2)}%</strong>
            `);
        } else {
             $('#highest-score, #lowest-score').html('<span>-</span>');
        }

        // Render Details 2 (Status grid)
        renderDetailsGrid2(gridElements);
    }

    function renderFinalResult(value) {
        const chart = document.getElementById('final-result-chart');
        const valueEl = document.getElementById('final-result-value');
        
        valueEl.textContent = `${value}%`;
        const degree = value * 3.6;
        chart.style.background = `conic-gradient(var(--primary-color) ${degree}deg, var(--background-color) ${degree}deg)`;
    }

    function renderDetailsList1(data) {
        const listContainer = $('#details-list-1');
        listContainer.empty();

        data.forEach(item => {
            const listItem = $(`
                <li class="details-list-item">
                    <div class="item-label">
                        <span class="item-name">${item.label}</span>
                        <span class="item-id">${item.count} معيار</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${item.value}%;"></div>
                    </div>
                    <div class="item-percentage">${item.value.toFixed(2)}%</div>
                </li>
            `);
            listContainer.append(listItem);
        });
    }

    function renderDetailsListAll(data) {
        const listContainer = $('#details-list-1-all');
        listContainer.empty();

        data.forEach(item => {
            const listItem = $(`
                <li class="details-list-item">
                    <div class="item-label">
                        <span class="item-name">${item.label}</span>
                        <span class="item-id">${item.number}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${item.value}%;"></div>
                    </div>
                    <div class="item-percentage">${item.value.toFixed(2)}%</div>
                </li>
            `);
            
            // Add click event to navigate to the element
            listItem.css('cursor', 'pointer');
            listItem.on('click', function() {
                frappe.set_route('Form', 'Elements-2024', item.id);
            });
            
            listContainer.append(listItem);
        });
    }

    function renderDetailsGrid2(data) {
        const gridContainer = $('#details-grid-2');
        gridContainer.empty();

        data.forEach(item => {
            const customStatusClass = item.customStatus ? `custom-status-${item.customStatus}` : '';
            // status-${item.status} handles Green, Yellow, Red, and Gray (na)
            const statusItem = $(`
                <div class="status-item status-${item.status} ${customStatusClass}" 
                     title="المعيار: ${item.number} - التقدم: ${item.progress}%" 
                     data-name="${item.id}">
                    ${item.number}
                </div>
            `);
            
            // Add click event to show details
            statusItem.on('click', function() {
                frappe.set_route('Form', 'Elements-2024', item.id);
            });
            
            gridContainer.append(statusItem);
        });
    }
};

frappe.pages['dashtest'].refresh = function(wrapper) {
    // Refresh logic if needed
};