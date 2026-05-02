frappe.pages['qyass-report'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'لوحة قياس الأداء الشاملة للمستندات',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');

    new PerformanceDashboard(wrapper, page);
};

class PerformanceDashboard {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);

        this.stats = {
            totalStandards: 0,
            standards: { green: 0, yellow: 0, red: 0 },
            docs: { total: 0, green: 0, yellow: 0, red: 0 },
            matrix: {
                red:    { 'يعتمد': 0, 'تم المراجعة': 0, 'التعديل و التحسين': 0, 'التسليم': 0 },
                yellow: { 'يعتمد': 0, 'تم المراجعة': 0, 'التعديل و التحسين': 0, 'التسليم': 0 },
                green:  { 'يعتمد': 0, 'تم المراجعة': 0, 'التعديل و التحسين': 0, 'التسليم': 0 }
            },
            challenges: {}
        };

        this.setup_styles();
        this.force_full_screen();
        this.render_layout();
        this.bind_events();
        this.load_data();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            div .page-container { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header { display: none !important; }
            .layout-side-section { display: none !important; }
            .layout-main-section-wrapper { grid-template-columns: 1fr !important; padding: 0 !important; }
            .layout-main-section { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; }
            .page-container { background-color: #f0f9ff !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
            .page-content { margin: 0 !important; }
        `;
        $('<style>').text(fullScreenStyle).appendTo(this.wrapper);
    }

    setup_styles() {
        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            :root {
                --main-bg: #f0f9ff;
                --header-glass: rgba(255, 255, 255, 0.85);
                --card-glass: rgba(255, 255, 255, 0.7);
                --text-dark: #0f172a;
                --primary-blue: #0369a1;
                --dark-teal: #00695c;
                --teal: #009688;
                --light-teal: #4db6ac;
                --orange: #ff9800;
                --red: #d32f2f;
                --grey: #757575;
            }

            .modern-dashboard {
                font-family: 'Tajawal', sans-serif;
                direction: rtl;
                color: var(--text-dark);
                min-height: 100vh;
                background: var(--main-bg);
                padding-bottom: 50px;
                position: relative;
                overflow-x: hidden;
            }

            .bg-shape { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.5; pointer-events: none; }
            .shape-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; left: -10%; width: 600px; height: 600px; background: #22d3ee; }

            /* --- HEADER --- */
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 30px; background: var(--header-glass);
                backdrop-filter: blur(15px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.6);
                box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            }
            .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.3rem; color: var(--primary-blue); }
            .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
            
            .header-filters { display: flex; gap: 15px; align-items: center; }
            .filter-group { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.5); padding: 5px 10px; border-radius: 8px; border: 1px solid #e2e8f0; height: 38px; }
            .filter-label { font-size: 0.85rem; color: #64748b; font-weight: 600; }
            .custom-date-input { border: none; background: transparent; font-family: 'Tajawal'; color: var(--primary-blue); font-weight: bold; outline: none; }
            
            .refresh-btn {
                background: white; border: 1px solid #e2e8f0; color: var(--primary-blue);
                width: 38px; height: 38px; border-radius: 8px; cursor: pointer;
                transition: 0.2s; display: flex; align-items: center; justify-content: center;
            }

            /* --- HOME BUTTON --- */
            .home-btn {
                display: flex; align-items: center; gap: 8px;
                background: white; border: 1px solid #bae6fd;
                color: var(--primary-blue); padding: 0 16px;
                height: 38px; border-radius: 8px; font-weight: 700; font-size: 0.95rem;
                text-decoration: none !important; transition: 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            }
            .home-btn:hover {
                background: #f0f9ff;
                border-color: var(--primary-blue);
                color: var(--primary-blue);
            }

            .dashboard-container {
                position: relative; z-index: 2;
                max-width: 1400px;
                margin: 0 auto; padding: 25px;
            }

            .dash-card {
                background: var(--card-glass); backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 16px;
                padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }

            /* --- TOP SECTION --- */
            .top-section { display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px; margin-bottom: 25px; }

            .docs-summary { display: flex; align-items: center; justify-content: space-between; }
            .chart-area { width: 130px; height: 130px; display: flex; justify-content: center; align-items: center; position: relative;}
            .donut {
                width: 100%; height: 100%; border-radius: 50%;
                background: conic-gradient(var(--grey) 0deg 360deg);
                position: relative; transition: background 1s ease;
            }
            .donut::after { content: ""; position: absolute; top: 20%; left: 20%; right: 20%; bottom: 20%; background: rgba(255,255,255,0.9); border-radius: 50%; }
            .legend { display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem; }
            .legend-item { display: flex; align-items: center; gap: 8px; font-weight: 500;}
            .dot { width: 12px; height: 12px; border-radius: 3px; }
            .bg-teal { background-color: var(--teal); } .bg-orange { background-color: var(--orange); } .bg-red { background-color: var(--red); }

            .total-docs-box {
                background: linear-gradient(135deg, #00695c, #004d40); color: white;
                text-align: center; border-radius: 12px; overflow: hidden; min-width: 130px;
            }
            .total-docs-title { padding: 8px; font-size: 0.85rem; background: rgba(0,0,0,0.1); }
            .total-docs-val { padding: 15px; font-size: 2rem; font-weight: 800; }

            /* --- FLOW CHART --- */
            .standards-flow { display: flex; flex-direction: column; justify-content: center; }
            .flow-container { display: flex; gap: 15px; width: 100%; align-items: center; }
            .flow-box {
                flex: 1; text-align: center; color: white; position: relative;
                height: 80px; display: flex; flex-direction: column; justify-content: center; margin-left: 20px;
                border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            /* Desktop Arrows */
            .flow-box::after {
                content: ''; position: absolute; left: -20px; top: 0; width: 0; height: 0;
                border-top: 40px solid transparent; border-bottom: 40px solid transparent; border-right: 20px solid; z-index: 2;
            }
            .flow-box::before {
                content: ''; position: absolute; right: -20px; top: 0; width: 0; height: 0;
                border-top: 40px solid transparent; border-bottom: 40px solid transparent; border-left: 20px solid; z-index: 1;
            }
            
            .flow-box.box-total { background-color: var(--dark-teal); border-right-color: var(--dark-teal); }
            .flow-box.box-total::after { border-right-color: var(--dark-teal); }
            .flow-box.box-green { background-color: var(--teal); }
            .flow-box.box-green::after { border-right-color: var(--teal); }
            .flow-box.box-yellow { background-color: var(--orange); }
            .flow-box.box-yellow::after { border-right-color: var(--orange); }
            .flow-box.box-red { background-color: var(--red); }
            .flow-box.box-red::after { border-right-color: var(--red); }
            
            /* Update Grey Box for flex positioning */
            .flow-box.box-grey { background-color: var(--grey); } 
            .flow-box.box-grey::after { display: none; } 
            
            .flow-title { font-size: 0.85rem; margin-bottom: 5px; font-weight: 500; opacity: 0.9;}
            .flow-val { font-size: 1.8rem; font-weight: 800; }

            /* --- MATRIX --- */
            .middle-section { margin-bottom: 25px; overflow-x: auto; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .matrix-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 0.9rem; background: white; }
            .matrix-table th { color: white; padding: 12px 8px; border: 1px solid white; white-space: nowrap; }
            .matrix-table td { padding: 12px 8px; border: 1px solid #f1f5f9; font-weight: bold; color: #334155; }
            .th-green { background-color: var(--teal); } .th-yellow { background-color: var(--orange); }
            .th-red { background-color: var(--red); } .th-dark-teal { background-color: var(--dark-teal); }
            .row-workflow th { background-color: #5d9ba8; font-size: 0.8rem; }
            .row-data td.cell-green { background-color: rgba(0, 150, 136, 0.1); color: var(--teal); font-size: 1.4rem; }
            .row-data td.cell-yellow { background-color: rgba(255, 152, 0, 0.1); color: var(--orange); font-size: 1.4rem; }
            .row-data td.cell-red { background-color: rgba(211, 47, 47, 0.1); color: var(--red); font-size: 1.4rem; }

            /* --- BOTTOM --- */
            .bottom-section { display: grid; grid-template-columns: 1fr 2fr; gap: 25px; align-items: stretch; }
            .pie-container { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .pie-title { width: 100%; background: #e2e8f0; padding: 8px; text-align: center; color: var(--dark-teal); font-weight: 800; margin-bottom: 15px; border-radius: 8px; }
            .simple-pie { width: 140px; height: 140px; border-radius: 50%; background: var(--grey); border: 5px solid white; }
            .bottom-pie-legend { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; width: 100%; margin-top: 15px; font-weight: bold; }
            .gaps-header { display: grid; grid-template-columns: 1fr 60px; text-align: center; color: white; font-weight: bold; background: var(--primary-blue); padding: 10px; margin-bottom: 10px; border-radius: 8px; }
            .gap-row { display: grid; grid-template-columns: 1fr 60px; margin-bottom: 8px; text-align: center; align-items: stretch; font-size: 0.9rem; font-weight: 600; color: white; }
            .gap-row div { padding: 10px; display: flex; align-items: center; justify-content: center; border-radius: 6px; }

            #loading-overlay { position: absolute; inset: 0; background: rgba(240, 249, 255, 0.8); backdrop-filter: blur(5px); z-index: 50; display: none; align-items: center; justify-content: center; flex-direction: column; color: var(--primary-blue); font-size: 1.2rem; font-weight: bold; }

            /* ================= RESPONSIVE MEDIA QUERIES ================= */
            @media (max-width: 900px) {
                .dashboard-container { padding: 10px; }
                
                /* Navbar Stacking */
                .glass-header { flex-direction: column; align-items: stretch; gap: 15px; padding: 15px; }
                .header-filters { flex-direction: column; width: 100%; }
                .filter-group { width: 100%; justify-content: space-between; }
                .custom-date-input { text-align: left; }
                .brand { justify-content: center; margin-bottom: 5px; }
                
                /* Home Button Mobile Adjustment */
                .home-btn { justify-content: center; }
                
                /* Main Grids to Single Column */
                .top-section, .bottom-section { grid-template-columns: 1fr !important; gap: 15px; }

                /* Docs Summary Card Stacking on very small screens */
                .docs-summary { flex-wrap: wrap; justify-content: center; gap: 20px; text-align: center; }
                .legend { width: 100%; align-items: center; flex-direction: row; justify-content: center; flex-wrap: wrap; }
                .total-docs-box { width: 100%; margin-top: 10px; }

                /* Flow Chart Transformation: Arrows to Vertical List */
                .flow-container { flex-direction: column; gap: 10px; }
                .flow-box { 
                    margin-left: 0 !important; 
                    height: auto; 
                    padding: 15px 20px; 
                    width: 100%; 
                    flex-direction: row; 
                    justify-content: space-between; 
                    align-items: center; 
                    border-radius: 12px !important;
                }
                .flow-box::after, .flow-box::before { display: none !important; } /* Hide Triangles */
                .flow-title { margin-bottom: 0; text-align: right; font-size: 1rem; }
                .flow-val { font-size: 1.5rem; }

                /* Matrix Scrolling */
                .middle-section { overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .matrix-table { min-width: 900px; } /* Force scroll width */
                
                /* Font Tweaks */
                .gap-row, .gaps-header { font-size: 0.8rem; }
            }
        `;
        $('<style>').text(css).appendTo(this.wrapper);
    }

    render_layout() {
        const layout = $(`
            <div class="modern-dashboard">
                <div class="bg-shape shape-1"></div>
                <div class="bg-shape shape-2"></div>

                <div class="glass-header">
                    <div class="brand">
                                            <img src='/files/Screenshot_2026-04-22_at_6.16.56_AM-removebg-preview.png' height='40px' width='50px'/>
<style>
.glass-header{
    background:linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%) !important;
}
.action-btn{
background:white !important;
}
</style>
                    </div>

                    <div class="header-filters">
                        <div class="filter-group">
                            <span class="filter-label">من:</span>
                            <input type="date" id="filter-from" class="custom-date-input">
                        </div>
                        <div class="filter-group">
                            <span class="filter-label">إلى:</span>
                            <input type="date" id="filter-to" class="custom-date-input">
                        </div>
                        <button class="refresh-btn" id="btn-refresh" title="تحديث البيانات">
                            <i class="fa fa-sync-alt"></i>
                        </button>
                        
                        <!-- زر الرئيسية المضاف -->
                        <a onclick='href="https://misa.newerasofts.com/app/qyass-dashboard"' class="home-btn" title="العودة للرئيسية">
                            الرئيسية <i class="fa fa-home"></i>
                        </a>
                    </div>
                </div>

                <div class="dashboard-container">
                    <div id="loading-overlay">
                        <i class="fa fa-circle-notch fa-spin fa-2x"></i>
                        <span style="margin-top:10px">جاري معالجة البيانات...</span>
                    </div>

                    <!-- 1. Top Section -->
                    <div class="top-section">
                        <!-- Left: Documents -->
                        <div class="dash-card docs-summary">
                            <div class="chart-area"><div class="donut" id="top-donut"></div></div>
                            <div class="legend">
                                <div class="legend-item"><span class="dot bg-teal"></span> المستندات الملتزمة</div>
                                <div class="legend-item"><span class="dot bg-orange"></span> المستندات ذات التزام جزئي</div>
                                <div class="legend-item"><span class="dot bg-red"></span> المستندات الغير الملتزمة</div>
                            </div>
                            <div class="total-docs-box">
                                <div class="total-docs-title">مستندات الإثبات</div>
                                <div class="total-docs-val" id="total-docs-count">0</div>
                            </div>
                        </div>

                        <!-- Right: Standards -->
                        <div class="dash-card standards-flow">
                            <div class="flow-container">
                                <div class="flow-box box-green"><span class="flow-title">التزام كلي</span><span class="flow-val" id="count-green">0</span></div>
                                <div class="flow-box box-red"><span class="flow-title">عدم التزام</span><span class="flow-val" id="count-red">0</span></div>
                                <div class="flow-box box-yellow"><span class="flow-title">التزام جزئي</span><span class="flow-val" id="count-yellow">0</span></div>
                                <div class="flow-box box-grey"><span class="flow-title">لا ينطبق</span><span class="flow-val" id="count-na">0</span></div>
                                <div class="flow-box box-total"><span class="flow-title">عدد المعايير</span><span class="flow-val" id="count-total">0</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Matrix Section -->
                    <div class="middle-section">
                        <table class="matrix-table">
                            <tr class="row-cats">
                                <th colspan="4" class="th-red">معايير عدم الالتزام</th>
                                <th colspan="4" class="th-yellow">معايير الالتزام الجزئي</th>
                                <th colspan="4" class="th-green">معايير الالتزام الكلي</th>
                                <th class="th-dark-teal" rowspan="2" style="width: 100px;">التصنيف</th>
                            </tr>
                            <tr class="row-nums">
                                <th colspan="4" class="th-red" id="matrix-red-total">0</th>
                                <th colspan="4" class="th-yellow" id="matrix-yellow-total">0</th>
                                <th colspan="4" class="th-green" id="matrix-green-total">0</th>
                            </tr>
                            <tr class="row-workflow">
                                <th>يعتمد</th><th>تم المراجعة</th><th>التعديل و التحسين</th><th>التسليم</th>
                                <th>يعتمد</th><th>تم المراجعة</th><th>التعديل و التحسين</th><th>التسليم</th>
                                <th>يعتمد</th><th>تم المراجعة</th><th>التعديل و التحسين</th><th>التسليم</th>
                                <th class="th-dark-teal">حالة المستندات</th>
                            </tr>
                            <tr class="row-data">
                                <td class="cell-red" id="r-appr">0</td><td class="cell-red" id="r-rev">0</td><td class="cell-red" id="r-edit">0</td><td class="cell-red" id="r-del">0</td>
                                <td class="cell-yellow" id="y-appr">0</td><td class="cell-yellow" id="y-rev">0</td><td class="cell-yellow" id="y-edit">0</td><td class="cell-yellow" id="y-del">0</td>
                                <td class="cell-green" id="g-appr">0</td><td class="cell-green" id="g-rev">0</td><td class="cell-green" id="g-edit">0</td><td class="cell-green" id="g-del">0</td>
                                <td class="th-dark-teal"></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 3. Bottom Section (Gaps) -->
                    <div class="bottom-section">
                        <!-- Chart -->
                        <div class="dash-card pie-container">
                            <div class="pie-title">توزيع نسبة الفجوات والتحديات</div>
                            <div class="simple-pie" id="gaps-pie"></div>
                            <div class="bottom-pie-legend" id="gaps-legend"></div>
                        </div>

                        <!-- Table -->
                        <div class="dash-card gaps-table-container">
                            <div class="gaps-header">
                                <div>تصنيف الفجوات والتحديات</div>
                                <div>العدد</div>
                            </div>
                            <div id="gaps-rows-area"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.body.html(layout);

        // --- Default Date Filter Logic ---
        let today_date = frappe.datetime.get_today();
        let year_start = frappe.datetime.get_today().split('-')[0] + '-01-01';
        
        this.body.find('#filter-from').val(year_start);
        this.body.find('#filter-to').val(today_date);
    }

    bind_events() {
        this.body.find('#filter-from').on('change', () => this.load_data());
        this.body.find('#filter-to').on('change', () => this.load_data());
        this.body.find('#btn-refresh').on('click', () => {
            const btn = this.body.find('#btn-refresh i');
            btn.addClass('fa-spin');
            setTimeout(() => btn.removeClass('fa-spin'), 1000);
            this.load_data();
        });
    }

    load_data() {
        $('#loading-overlay').css('display', 'flex');
        
        this.stats = {
            totalStandards: 0,
            standards: { green: 0, yellow: 0, red: 0 },
            docs: { total: 0, green: 0, yellow: 0, red: 0 },
            matrix: {
                red:    { 'يعتمد': 0, 'تم المراجعة': 0, 'التعديل و التحسين': 0, 'التسليم': 0 },
                yellow: { 'يعتمد': 0, 'تم المراجعة': 0, 'التعديل و التحسين': 0, 'التسليم': 0 },
                green:  { 'يعتمد': 0, 'تم المراجعة': 0, 'التعديل و التحسين': 0, 'التسليم': 0 }
            },
            challenges: {}
        };

        let filters = [];
        let from_date = this.body.find('#filter-from').val();
        let to_date = this.body.find('#filter-to').val();

        if (from_date) filters.push(['Elements-2024', 'creation', '>=', from_date]);
        if (to_date) filters.push(['Elements-2024', 'creation', '<=', to_date]);

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: ['name'],
                filters: filters,
                limit_page_length: 0
            },
            callback: (r) => {
                if (r.message && r.message.length > 0) {
                    let promises = r.message.map(d => frappe.call({
                        method: 'frappe.client.get',
                        args: { doctype: 'Elements-2024', name: d.name }
                    }));

                    Promise.all(promises).then(results => {
                        let elements = results.map(res => res.message);
                        this.process_elements(elements);
                    });
                } else {
                    this.process_elements([]); 
                }
            }
        });
    }

    process_elements(elements) {
        this.stats.totalStandards = elements.length;

        elements.forEach(el => {
            let reqs = el.requirements || [];
            let reqTotal = reqs.length;
            let doneCount = reqs.filter(r => r.done).length;
            let notDone = reqTotal - doneCount;

            let category = 'red';
            if (reqTotal === 0) {
                this.stats.standards.red++; 
                category = 'red';
            } else if (notDone === 0) {
                this.stats.standards.green++;
                category = 'green';
            } else if (notDone === 1 && reqTotal > 1) {
                this.stats.standards.yellow++;
                category = 'yellow';
            } else {
                this.stats.standards.red++;
                category = 'red';
            }

            this.stats.docs.total += reqTotal;
            this.stats.docs.green += doneCount;
            this.stats.docs.red += notDone; 
            
            let proof_docs = el.proof_document || [];
            proof_docs.forEach(pd => {
                let status = pd.docu_status;
                if (status && this.stats.matrix[category][status] !== undefined) {
                    this.stats.matrix[category][status]++;
                }

                let challenge = pd.challenges;
                if (challenge) {
                    if (!this.stats.challenges[challenge]) {
                        this.stats.challenges[challenge] = 0;
                    }
                    this.stats.challenges[challenge]++;
                }
            });
        });

        this.update_ui();
    }

    update_ui() {
        const s = this.stats;

        $('#count-total').text(s.totalStandards);
        $('#count-green').text(s.standards.green);
        $('#count-yellow').text(s.standards.yellow);
        $('#count-red').text(s.standards.red);

        $('#matrix-green-total').text(s.standards.green);
        $('#matrix-yellow-total').text(s.standards.yellow);
        $('#matrix-red-total').text(s.standards.red);

        $('#r-appr').text(s.matrix.red['يعتمد']);
        $('#r-rev').text(s.matrix.red['تم المراجعة']);
        $('#r-edit').text(s.matrix.red['التعديل و التحسين']);
        $('#r-del').text(s.matrix.red['التسليم']);

        $('#y-appr').text(s.matrix.yellow['يعتمد']);
        $('#y-rev').text(s.matrix.yellow['تم المراجعة']);
        $('#y-edit').text(s.matrix.yellow['التعديل و التحسين']);
        $('#y-del').text(s.matrix.yellow['التسليم']);

        $('#g-appr').text(s.matrix.green['يعتمد']);
        $('#g-rev').text(s.matrix.green['تم المراجعة']);
        $('#g-edit').text(s.matrix.green['التعديل و التحسين']);
        $('#g-del').text(s.matrix.green['التسليم']);

        $('#total-docs-count').text(s.docs.total);
        let totalDocs = s.docs.total || 1;
        let pGreen = (s.docs.green / totalDocs) * 100;
        let degGreen = (pGreen / 100) * 360;
        
        if (s.docs.total === 0) {
             $('#top-donut').css('background', `var(--grey)`);
        } else {
             $('#top-donut').css('background', `conic-gradient(var(--teal) 0deg ${degGreen}deg, var(--red) ${degGreen}deg 360deg)`);
        }

        this.update_gaps_ui();
        $('#loading-overlay').fadeOut();
    }

    update_gaps_ui() {
        let container = $('#gaps-rows-area');
        let legendContainer = $('#gaps-legend');
        container.empty();
        legendContainer.empty();

        let gapsArr = [];
        let totalGaps = 0;
        for (let key in this.stats.challenges) {
            gapsArr.push({ name: key, count: this.stats.challenges[key] });
            totalGaps += this.stats.challenges[key];
        }
        gapsArr.sort((a, b) => b.count - a.count);

        const colors = ['#d32f2f', '#ff9800', '#757575', '#1976d2', '#009688'];
        let pieGradient = [];
        let currentDeg = 0;

        gapsArr.forEach((gap, index) => {
            let color = colors[index % colors.length];
            
            let html = `
                <div class="gap-row">
                    <div class="col-text" style="background-color: ${color};">${gap.name}</div>
                    <div class="col-num" style="background-color: ${color}; opacity: 0.9;">${gap.count}</div>
                </div>
            `;
            container.append(html);

            if (totalGaps > 0) {
                let percent = (gap.count / totalGaps) * 100;
                let deg = (percent / 100) * 360;
                let nextDeg = currentDeg + deg;
                pieGradient.push(`${color} ${currentDeg}deg ${nextDeg}deg`);
                currentDeg = nextDeg;
                legendContainer.append(`<span style="color:${color}">${Math.round(percent)}%</span>`);
            }
        });

        if (totalGaps === 0) {
            $('#gaps-pie').css('background', 'var(--grey)');
            container.append('<div style="text-align:center; padding:20px; color:#64748b; font-weight:bold">لا توجد فجوات مسجلة</div>');
        } else {
            $('#gaps-pie').css('background', `conic-gradient(${pieGradient.join(', ')})`);
        }
    }
}