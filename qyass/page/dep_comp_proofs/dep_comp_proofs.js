frappe.pages['dep-comp-proofs'].on_page_load = function(wrapper) {
    console.log("--- Qyass Department Completed Proofs: Initializing ---");

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'المستندات المكتمله على مستوي الادارات',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    new DepartmentCompProofs(wrapper, page);
};

class DepartmentCompProofs {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);
        
        this.current_data = [];
        this.chart_instance = null;
        
        this.setup_styles();
        this.force_full_screen();
        this.render_skeleton();
        this.fetch_data();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-dep-comp-proofs { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header { display: none !important; }
            .layout-side-section { display: none !important; }
            .layout-main-section-wrapper { grid-template-columns: 1fr !important; padding: 0 !important; }
            .layout-main-section { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; }
            .page-container { background-color: #f0f9ff !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; min-height: 100vh;}
            .page-content { margin: 0 !important; }
        `;
        $('<style>').text(fullScreenStyle).appendTo(this.wrapper);
    }

    render_skeleton() {
        const layout = $(`
            <div class="modern-dashboard blue-theme" dir="rtl">
                <div class="bg-shape shape-1"></div>
                <div class="bg-shape shape-2"></div>
                
                <!-- Navbar -->
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
                    <div class="user-actions">
                        <button class="action-btn" id="btn-export">
                            <i class="fa fa-download"></i> تصدير البيانات
                        </button>
                        <button class="action-btn" onclick="window.history.back()" style="margin-right: 10px;">
                            <i class="fa fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    
                    <!-- Summary Cards -->
                    <div class="summary-cards-wrapper fade-in-up">
                        <div id="summary-cards-container" class="summary-cards-scroll">
                            <div class="text-center w-100 p-4 text-muted"><i class="fa fa-spinner fa-spin"></i> جاري تحميل إحصائيات الإدارات...</div>
                        </div>
                    </div>

                    <!-- Chart Card -->
                    <div class="glass-card mb-4 chart-wrapper fade-in-up" style="padding: 25px; min-height: 420px; animation-delay: 0.1s;">
                        <div class="chart-header">
                            <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: #0c4a6e;">
                                <i class="fa fa-chart-bar text-primary mr-2"></i> مقارنة الإنجاز بين الإدارات
                            </h3>
                        </div>
                        <div id="analytics-chart" class="mt-4">
                            <div class="text-center p-5 text-muted"><i class="fa fa-spinner fa-spin fa-2x"></i></div>
                        </div>
                    </div>

                    <!-- Table Area -->
                    <div class="glass-table-wrapper fade-in-up" style="animation-delay: 0.2s;">
                        <table class="qyass-table">
                            <thead>
                                <tr>
                                    <th width="40%">الإدارة</th>
                                    <th width="20%" class="text-center">مستندات مكتملة</th>
                                    <th width="20%" class="text-center">اجمالي المستندات المطلوبة</th>
                                    <th width="20%" class="text-center">النسبة</th>
                                </tr>
                            </thead>
                            <tbody id="report-table-body">
                                <tr><td colspan="4" class="text-center p-5 text-muted"><i class="fa fa-spinner fa-spin fa-2x"></i></td></tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        `);

        this.body.html(layout);
        this.body.find('#btn-export').on('click', () => this.export_to_csv());
    }

    fetch_data() {
        // SQL Match: select department, sum(completed_count), sum(proof_count) group by department
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: [
                    'department',
                    'sum(proof_count) as proof_count_sum',
                    'sum(completed_count) as proof_completed_sum'
                ],
                group_by: 'department',
                filters: { 'department': ['is', 'set'] },
                limit_page_length: 5000 
            },
            callback: (r) => {
                let data = r.message || [];
                this.process_and_render_data(data);
            }
        });
    }

    process_and_render_data(raw_data) {
        if (!raw_data || raw_data.length === 0) {
            this.body.find('#summary-cards-container').html('<div class="p-3 text-muted">لا توجد بيانات متاحة للإدارات</div>');
            this.body.find('#analytics-chart').empty();
            this.body.find('#report-table-body').html('<tr><td colspan="4" class="text-center p-5 text-muted">لا توجد بيانات</td></tr>');
            return;
        }

        this.current_data = raw_data.map(item => {
            let total = parseFloat(item.proof_count_sum) || 0;
            let completed = parseFloat(item.proof_completed_sum) || 0;
            // truncate(sum/sum, 2) * 100
            let percent = total > 0 ? Math.floor((completed / total) * 100) : 0;

            return {
                department: item.department || 'إدارة غير محددة',
                total: total,
                completed: completed,
                percent: percent
            };
        });

        this.render_summary_cards(this.current_data);
        this.render_dashboard(this.current_data);
    }

    render_summary_cards(data) {
        const container = this.body.find('#summary-cards-container');
        container.empty();

        data.forEach((item, index) => {
            let delay = index * 50;
            let card = $(`
                <div class="summary-card" style="animation: slideInRight 0.5s ease forwards; animation-delay: ${delay}ms; opacity: 0;">
                    <div class="summary-title" title="${item.department}">
                        <i class="fa fa-building mr-1"></i> ${item.department.length > 20 ? item.department.substring(0,20)+'...' : item.department}
                    </div>
                    <div class="summary-stats">
                        <div class="stat-box">
                            <span class="stat-label">مكتملة</span>
                            <span class="stat-value text-blue-bright">${item.completed}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">إجمالي المطلوب</span>
                            <span class="stat-value text-blue-dark">${item.total}</span>
                        </div>
                    </div>
                    <div class="summary-progress">
                        <div class="progress-info">
                            <span>نسبة الإنجاز</span>
                            <span>${item.percent}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${item.percent}%;"></div>
                        </div>
                    </div>
                </div>
            `);
            container.append(card);
        });
    }

    render_dashboard(data) {
        let chart_labels = [];
        let ds_completed = [];
        let ds_total = [];
        let ds_percent = [];

        const tbody = this.body.find('#report-table-body');
        tbody.empty();

        data.forEach((item, index) => {
            chart_labels.push(item.department.length > 25 ? item.department.substring(0, 25) + '...' : item.department);
            ds_completed.push(item.completed);
            ds_total.push(item.total);
            ds_percent.push(item.percent);

            let percentClass = item.percent >= 100 ? 'badge-blue-solid' : 'badge-blue-light';

            const row = $(`
                <tr style="animation: fadeInRow 0.3s ease forwards; animation-delay: ${index * 15}ms; opacity: 0;">
                    <td class="font-weight-bold" style="color: #0f172a; font-size: 1.05rem;">
                        <i class="fa fa-sitemap mr-2 text-blue-muted"></i> ${item.department}
                    </td>
                    <td class="text-center font-weight-bold" style="color: #0ea5e9; font-size: 1.1rem; background: rgba(14, 165, 233, 0.03);">${item.completed}</td>
                    <td class="text-center font-weight-bold" style="color: #0c4a6e; font-size: 1.1rem;">${item.total}</td>
                    <td class="text-center">
                        <span class="percent-badge ${percentClass}">${item.percent}%</span>
                    </td>
                </tr>
            `);
            tbody.append(row);
        });

        this.render_chart(chart_labels, ds_completed, ds_total, ds_percent);
    }

    render_chart(labels, completed, total, percent) {
        const container = this.body.find('#analytics-chart')[0];
        $(container).empty();

        this.chart_instance = new frappe.Chart(container, {
            data: {
                labels: labels,
                datasets: [
                    { name: 'مستندات مكتملة', values: completed },
                    { name: 'اجمالي المستندات المطلوبة', values: total },
                    { name: 'النسبة', values: percent }
                ]
            },
            title: '',
            type: 'bar',
            height: 420, 
            colors: ['#0284c7', '#0c4a6e', '#7dd3fc'], // ألوان زرقاء فقط
            barOptions: { spaceRatio: 0.25, radius: 4 },
            axisOptions: { xIsSeries: 1, xAxisMode: 'tick' },
            tooltipOptions: { formatTooltipX: d => d, formatTooltipY: d => d }
        });
    }

    export_to_csv() {
        if (!this.current_data || this.current_data.length === 0) {
            frappe.msgprint('لا توجد بيانات لتصديرها');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += "الإدارة,مستندات مكتملة,اجمالي المستندات المطلوبة,النسبة\n"; 
        
        this.current_data.forEach(item => {
            let row = [
                `"${item.department}"`,
                item.completed, item.total, `${item.percent}%`
            ].join(",");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `اكتمال_المستندات_للموظفين_${frappe.datetime.nowdate()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setup_styles() {
        if ($('#qyass-dep-comp-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            .blue-theme { font-family: 'Tajawal', sans-serif; color: #0c4a6e; position: relative; overflow-x: hidden; }
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(90px); z-index: 0; opacity: 0.15; pointer-events: none;}
            .shape-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: #0284c7; }
            .shape-2 { bottom: -10%; left: -10%; width: 600px; height: 600px; background: #38bdf8; }
            
            .dashboard-container { position: relative; z-index: 2; max-width: 1400px; margin: 0 auto; padding: 25px; }
            
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 18px 35px; background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(15px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(186, 230, 253, 0.5); 
                box-shadow: 0 4px 20px rgba(2, 132, 199, 0.05);
            }
            .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.3rem; color: #0c4a6e; }
            .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size:1.1rem; box-shadow: 0 4px 10px rgba(2,132,199,0.3);}
            
            .action-btn { background: white; border: 1px solid #bae6fd; color: #0284c7; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 700;}
            .action-btn:hover { background: #f0f9ff; box-shadow: 0 2px 10px rgba(2,132,199,0.15); transform: translateY(-1px); border-color: #0284c7;}

            .summary-cards-wrapper { margin-bottom: 25px; width: 100%; overflow: hidden; }
            .summary-cards-scroll {
                display: flex; gap: 15px; overflow-x: auto; padding: 5px 2px 15px 2px;
                scrollbar-width: thin; scrollbar-color: #bae6fd transparent;
            }
            .summary-cards-scroll::-webkit-scrollbar { height: 6px; }
            .summary-cards-scroll::-webkit-scrollbar-track { background: transparent; }
            .summary-cards-scroll::-webkit-scrollbar-thumb { background-color: #bae6fd; border-radius: 10px; }
            
            .summary-card {
                min-width: 280px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
                border: 1px solid #e0f2fe; border-radius: 16px; padding: 15px 20px;
                box-shadow: 0 8px 25px rgba(2,132,199,0.06); display: flex; flex-direction: column; gap: 12px;
                transition: transform 0.2s; border-right: 4px solid #0ea5e9;
            }
            .summary-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(2,132,199,0.12); }
            
            .summary-title { font-weight: 800; color: #0c4a6e; font-size: 0.95rem; display: flex; align-items: center;}
            .summary-title i { color: #38bdf8; }
            
            .summary-stats { display: flex; justify-content: space-between; border-bottom: 1px dashed #e0f2fe; padding-bottom: 10px;}
            .stat-box { display: flex; flex-direction: column; }
            .stat-label { font-size: 0.75rem; color: #7dd3fc; font-weight: 700;}
            .stat-value { font-size: 1.4rem; font-weight: 800; }
            .text-blue-bright { color: #0ea5e9; }
            .text-blue-dark { color: #082f49; }
            
            .summary-progress { display: flex; flex-direction: column; gap: 5px; }
            .progress-info { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #0369a1;}
            .progress-bar-bg { height: 6px; background: #f0f9ff; border-radius: 3px; overflow: hidden; width: 100%; border: 1px solid #e0f2fe;}
            .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #38bdf8, #0284c7); border-radius: 3px; transition: width 1s ease-in-out;}

            .glass-card {
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(25px);
                border: 1px solid rgba(255,255,255,1); box-shadow: 0 10px 40px rgba(2,132,199,0.05); border-radius: 20px;
            }
            
            .chart-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px dashed #e0f2fe; padding-bottom: 15px;}
            
            .glass-table-wrapper {
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
                border: 1px solid white; border-radius: 20px; box-shadow: 0 10px 40px rgba(2,132,199,0.05);
                overflow-x: auto; padding: 5px; margin-top: 15px; position: relative; z-index: 1;
            }
            .qyass-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: right; }
            .qyass-table th {
                padding: 18px 15px; color: #0c4a6e; font-weight: 800; font-size: 0.95rem;
                background: #f0f9ff; border-bottom: 2px solid #bae6fd; white-space: nowrap;
            }
            .qyass-table th:first-child { border-top-right-radius: 15px; }
            .qyass-table th:last-child { border-top-left-radius: 15px; }
            .qyass-table td { padding: 15px; border-bottom: 1px dashed #e0f2fe; color: #0f172a; vertical-align: middle; transition: 0.2s; }
            .qyass-table tr:hover td { background: #f8fafc; transform: scale(1.002); box-shadow: 0 4px 15px rgba(2,132,199,0.04); z-index: 10; position: relative;}
            .qyass-table tr:last-child td { border-bottom: none; }

            .text-blue-muted { color: #7dd3fc; }
            .percent-badge { padding: 5px 15px; border-radius: 50px; font-size: 0.9rem; font-weight: bold; display: inline-block; min-width: 60px; text-align: center;}
            .badge-blue-solid { background: #0284c7; color: white; box-shadow: 0 2px 8px rgba(2,132,199,0.3); } 
            .badge-blue-light { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; } 
            
            .frappe-chart .chart-legend text { font-family: 'Tajawal', sans-serif !important; font-size: 14px; font-weight: 700; fill: #0c4a6e;}
            text { font-family: 'Tajawal', sans-serif !important; }
            .frappe-chart .bar { filter: drop-shadow(0px 4px 6px rgba(2,132,199,0.1)); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .frappe-chart .bar:hover { filter: drop-shadow(0px 8px 15px rgba(2,132,199,0.25)); opacity: 0.85; cursor: pointer; }

            .graph-svg-tip {
                background: rgba(255, 255, 255, 0.95) !important; backdrop-filter: blur(12px) !important;
                border: 1px solid #bae6fd !important; box-shadow: 0 15px 35px rgba(2,132,199,0.15) !important;
                border-radius: 12px !important; color: #0c4a6e !important; font-family: 'Tajawal', sans-serif !important;
                padding: 12px 18px !important; direction: rtl; text-align: right;
            }
            .graph-svg-tip .title { font-weight: 800 !important; color: #0284c7 !important; border-bottom: 1px dashed #bae6fd; padding-bottom: 8px; margin-bottom: 8px; font-size: 0.95rem !important;}

            .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInRow { to { opacity: 1; } }
            @keyframes slideInRight { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;

        $('<style id="qyass-dep-comp-css">').text(css).appendTo('head');
    }
}