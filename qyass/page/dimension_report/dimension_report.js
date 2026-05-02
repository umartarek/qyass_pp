frappe.pages['dimension-report'].on_page_load = function(wrapper) {
    console.log("--- Qyass Dimension Analytics Report: Initializing ---");

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Dimension Analytics Report',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    new DimensionAnalyticsDashboard(wrapper, page);
};

class DimensionAnalyticsDashboard {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);
        
        this.selected_dimension = '';
        this.chart_instance = null;
        this.current_data = [];
        
        this.setup_styles();
        this.force_full_screen();
        this.render_skeleton();
        this.build_smart_filter();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-dimension-report { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
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
            <div class="modern-dashboard" dir="rtl">
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
                        <button class="action-btn" onclick="window.history.back()">
                            <i class="fa fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    
                    <!-- Filter Card -->
                    <div class="glass-card p-4 mb-4 filter-wrapper filter-card-container">
                        <div id="smart-filter-container" class="w-100">
                            <!-- سيتم حقن حقل البحث الذكي هنا -->
                        </div>
                        <div>
                            <button class="hero-btn" id="btn-export">
                                <i class="fa fa-file-excel"></i> تصدير التقرير
                            </button>
                        </div>
                    </div>

                    <!-- Chart Card -->
                    <div class="glass-card mb-4 chart-wrapper fade-in-up" style="padding: 25px; min-height: 420px;">
                        <div class="chart-header">
                            <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: #0f172a;">
                                <i class="fa fa-chart-pie text-primary mr-2"></i> الإنجاز التفصيلي للمعايير
                            </h3>
                            <span class="chart-subtitle" id="chart-subtitle">الرجاء اختيار محور لعرض البيانات</span>
                        </div>
                        <div id="analytics-chart" class="mt-4">
                            <div class="empty-chart-state">
                                <i class="fa fa-search"></i>
                                <p>ابحث عن محور واختاره من القائمة أعلاه ليتم رسم البيانات هنا</p>
                            </div>
                        </div>
                    </div>

                    <!-- Table Area -->
                    <div class="glass-table-wrapper fade-in-up" style="animation-delay: 0.1s;">
                        <table class="qyass-table">
                            <thead>
                                <tr>
                                    <th width="40%">المعيار</th>
                                    <th width="15%" class="text-center">اجمالي المستندات</th>
                                    <th width="15%" class="text-center">مكتمل</th>
                                    <th width="15%" class="text-center">غير مكتمل</th>
                                    <th width="15%" class="text-center">النسبة</th>
                                </tr>
                            </thead>
                            <tbody id="report-table-body">
                                <tr>
                                    <td colspan="5" class="text-center p-5" style="color: #64748b;">
                                        <div class="empty-chart-state" style="min-height: 150px;">
                                            <i class="fa fa-table" style="font-size: 2.5rem; opacity: 0.2; margin-bottom: 10px;"></i>
                                            <p style="margin:0;">الجدول بانتظار تحديد المحور...</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        `);

        this.body.html(layout);
        this.body.find('#btn-export').on('click', () => this.export_to_csv());
    }

    build_smart_filter() {
        let me = this;
        this.dimension_field = frappe.ui.form.make_control({
            parent: this.body.find('#smart-filter-container'),
            df: {
                fieldtype: 'Link',
                options: 'Dimension', 
                fieldname: 'dimension',
                label: 'ابحث واختر المحور للتحليل (Dimension)',
                placeholder: 'اكتب اسم المحور للبحث...',
                onchange: function() {
                    me.selected_dimension = this.value;
                    if (me.selected_dimension) {
                        me.fetch_report_data();
                    } else {
                        me.clear_data();
                    }
                }
            },
            render_input: true
        });
        this.dimension_field.refresh();
        this.dimension_field.$wrapper.find('.control-input').addClass('custom-frappe-input');
        this.dimension_field.$wrapper.find('label').css({ 'font-weight': '800', 'color': '#0369a1', 'margin-bottom':'10px' });
    }

    clear_data() {
        this.body.find('#chart-subtitle').text('الرجاء اختيار محور لعرض البيانات');
        this.body.find('#analytics-chart').html(`
            <div class="empty-chart-state">
                <i class="fa fa-search"></i>
                <p>ابحث عن محور واختاره من القائمة أعلاه ليتم رسم البيانات هنا</p>
            </div>
        `);
        this.body.find('#report-table-body').html(`
            <tr><td colspan="5" class="text-center p-5 text-muted">اختر محور من القائمة للبدء</td></tr>
        `);
    }

    fetch_report_data() {
        this.body.find('#chart-subtitle').html(`<i class="fa fa-spinner fa-spin"></i> جاري تحليل بيانات: ${this.selected_dimension}`);
        this.body.find('#report-table-body').html(`
            <tr><td colspan="5" class="text-center p-5"><i class="fa fa-spinner fa-spin fa-2x" style="color:#0369a1;"></i><br><small class="mt-2 text-muted">جاري بناء التقرير...</small></td></tr>
        `);

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                filters: { dimension: this.selected_dimension },
                fields: [
                    'element',
                    'sum(proof_count) as total',
                    'sum(completed_count) as completed'
                ],
                group_by: 'element',
                limit_page_length: 2000 
            },
            callback: (r) => {
                let data = r.message || [];
                this.process_and_render_data(data);
            }
        });
    }

    process_and_render_data(raw_data) {
        if (!raw_data || raw_data.length === 0) {
            this.clear_data();
            this.body.find('#chart-subtitle').text(`لا توجد بيانات متاحة للمحور: ${this.selected_dimension}`);
            return;
        }

        this.body.find('#chart-subtitle').html(`<span class="badge-blue"><i class="fa fa-check-circle"></i> تم التحليل بنجاح</span> المحور الحالي: <strong>${this.selected_dimension}</strong>`);

        this.current_data = raw_data.map(item => {
            let total = parseFloat(item.total) || 0;
            let completed = parseFloat(item.completed) || 0;
            let not_completed = total - completed;
            if (not_completed < 0) not_completed = 0;
            let complete_percent = total > 0 ? Math.floor((completed / total) * 100) : 0;

            return {
                element: item.element,
                total: total, completed: completed, not_completed: not_completed, complete_percent: complete_percent
            };
        });

        this.render_dashboard(this.current_data);
    }

    render_dashboard(data) {
        let chart_labels = [];
        let ds_total = [];
        let ds_completed = [];
        let ds_incomplete = [];

        const tbody = this.body.find('#report-table-body');
        tbody.empty();

        data.forEach((item, index) => {
            let label = item.element || 'بدون اسم';
            chart_labels.push(label.length > 30 ? label.substring(0, 30) + '...' : label);
            
            ds_total.push(item.total);
            ds_completed.push(item.completed);
            ds_incomplete.push(item.not_completed);

            const row = $(`
                <tr style="animation: fadeInRow 0.3s ease forwards; animation-delay: ${index * 15}ms; opacity: 0;">
                    <td class="font-weight-bold" style="color: #0f172a; font-size: 1.05rem;">
                        <i class="fa fa-cube text-muted mr-2" style="font-size:0.8rem; opacity:0.5;"></i> ${item.element || '-'}
                    </td>
                    <td class="text-center font-weight-bold text-dark" style="font-size: 1.1rem; background: rgba(244, 114, 182, 0.05);">${item.total}</td>
                    <td class="text-center font-weight-bold" style="color: #3b82f6; font-size: 1.1rem; background: rgba(59, 130, 246, 0.05);">${item.completed}</td>
                    <td class="text-center font-weight-bold" style="color: #10b981; font-size: 1.1rem; background: rgba(16, 185, 129, 0.05);">${item.not_completed}</td>
                    <td class="text-center">
                        <span class="percent-badge ${item.complete_percent >= 100 ? 'bg-success text-white' : (item.complete_percent > 0 ? 'bg-warning text-dark' : 'bg-light text-dark border')}">
                            ${item.complete_percent}%
                        </span>
                    </td>
                </tr>
            `);
            tbody.append(row);
        });

        this.render_chart(chart_labels, ds_total, ds_completed, ds_incomplete);
    }

    render_chart(labels, total, completed, incomplete) {
        const container = this.body.find('#analytics-chart')[0];
        $(container).empty();

        this.chart_instance = new frappe.Chart(container, {
            data: {
                labels: labels,
                datasets: [
                    { name: 'إجمالي المستندات', values: total },
                    { name: 'المكتملة', values: completed },
                    { name: 'غير المكتملة', values: incomplete }
                ]
            },
            title: '',
            type: 'bar',
            height: 420, 
            colors: ['#f472b6', '#3b82f6', '#10b981'], 
            barOptions: {
                spaceRatio: 0.25, 
                radius: 4 
            },
            axisOptions: {
                xIsSeries: 1, 
                xAxisMode: 'tick'
            },
            tooltipOptions: {
                formatTooltipX: d => d,
                formatTooltipY: d => d + ' مستند'
            }
        });
    }

    export_to_csv() {
        if (!this.current_data || this.current_data.length === 0) {
            frappe.msgprint('لا توجد بيانات لتصديرها');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += "المعيار,اجمالي المستندات,المكتملة,غير مكتملة,النسبة\n"; 
        this.current_data.forEach(item => {
            let row = [
                `"${item.element || ''}"`,
                item.total, item.completed, item.not_completed,
                `${item.complete_percent}%`
            ].join(",");
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `تقرير_لوحة_التحليل_${frappe.datetime.nowdate()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setup_styles() {
        if ($('#qyass-analytics-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            .modern-dashboard { font-family: 'Tajawal', sans-serif; color: #0c4a6e; position: relative; overflow-x: hidden; }
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(90px); z-index: 0; opacity: 0.25; pointer-events: none;}
            .shape-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; left: -10%; width: 600px; height: 600px; background: #22d3ee; }
            .dashboard-container { position: relative; z-index: 2; max-width: 1400px; margin: 0 auto; padding: 25px; }
            
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 18px 35px; background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(15px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.8);
                box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            }
            .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.3rem; color: #0369a1; }
            .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size:1.1rem; box-shadow: 0 4px 10px rgba(14,165,233,0.3);}
            
            .action-btn { background: white; border: 1px solid #bae6fd; color: #0369a1; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 700;}
            .action-btn:hover { background: #f0f9ff; box-shadow: 0 2px 10px rgba(3,105,161,0.1); transform: translateY(-1px);}
            
            .hero-btn {
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                color: white; border: none; padding: 10px 25px; border-radius: 8px;
                font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(3, 105, 161, 0.3);
                display: inline-flex; align-items: center; gap: 8px; transition: 0.3s;
                height: 44px; margin-top: 28px;
            }
            .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(3, 105, 161, 0.4); }

            /* Z-Index Fix */
            .filter-card-container { position: relative; z-index: 9999 !important; }
            .chart-wrapper { position: relative; z-index: 1 !important; }
            .awesomplete ul { z-index: 99999 !important; max-height: 350px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; border-radius: 10px !important; border: 1px solid #e2e8f0 !important; overflow: hidden !important;}
            .awesomplete li { padding: 10px 15px !important; font-family: 'Tajawal', sans-serif; transition: 0.2s;}
            .awesomplete li:hover { background: #f0f9ff !important; color: #0369a1 !important;}

            .glass-card {
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(25px);
                border: 1px solid rgba(255,255,255,1); box-shadow: 0 10px 40px rgba(0,0,0,0.04); border-radius: 20px;
            }
            
            .chart-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px dashed #e2e8f0; padding-bottom: 15px;}
            .chart-subtitle { font-size: 0.9rem; color: #64748b; font-weight: 600; background: #f8fafc; padding: 5px 12px; border-radius: 6px;}
            .empty-chart-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #94a3b8;}
            .empty-chart-state i { font-size: 4rem; opacity: 0.3; margin-bottom: 15px; color: #0ea5e9;}
            .empty-chart-state p { font-size: 1.1rem; font-weight: 600;}

            .filter-wrapper { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; }
            #smart-filter-container { flex: 1; min-width: 300px; }

            .custom-frappe-input .input-with-feedback { 
                background: rgba(248,250,252,0.9) !important; 
                border: 2px solid #cbd5e1 !important; 
                border-radius: 10px !important; 
                padding: 6px 15px !important;
                font-family: 'Tajawal', sans-serif !important; font-size: 1.05rem !important;
                color: #0f172a !important; transition: all 0.3s ease !important; height: 46px !important;
            }
            .custom-frappe-input .input-with-feedback:focus-within { border-color: #0ea5e9 !important; box-shadow: 0 0 0 4px rgba(14,165,233,0.1) !important; background: white !important;}

            .glass-table-wrapper {
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
                border: 1px solid white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.04);
                overflow-x: auto; padding: 5px; margin-top: 15px; position: relative; z-index: 1;
            }
            .qyass-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: right; }
            .qyass-table th {
                padding: 18px 15px; color: #475569; font-weight: 800; font-size: 0.95rem;
                background: #f8fafc; border-bottom: 2px solid #e2e8f0; white-space: nowrap;
            }
            .qyass-table th:first-child { border-top-right-radius: 15px; }
            .qyass-table th:last-child { border-top-left-radius: 15px; }
            .qyass-table td { padding: 15px; border-bottom: 1px dashed #e2e8f0; color: #475569; vertical-align: middle; transition: 0.2s; }
            .qyass-table tr:hover td { background: white; transform: scale(1.002); box-shadow: 0 4px 15px rgba(0,0,0,0.03); z-index: 10; position: relative;}
            .qyass-table tr:last-child td { border-bottom: none; }

            .badge-blue { background: #eff6ff; color: #2563eb; padding: 5px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 700;}
            .percent-badge { padding: 5px 12px; border-radius: 50px; font-size: 0.9rem; font-weight: bold; display: inline-block; min-width: 55px; text-align: center;}
            
            /* ألوان وخطوط المفاتيح (Legend) */
            .frappe-chart .chart-legend text { font-family: 'Tajawal', sans-serif !important; font-size: 14px; font-weight: 700; fill: #475569;}
            text { font-family: 'Tajawal', sans-serif !important; }

            /* تأثيرات حركية وظلال ناعمة لأعمدة الرسم البياني */
            .frappe-chart .bar {
                filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.08));
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .frappe-chart .bar:hover {
                filter: drop-shadow(0px 8px 15px rgba(0,0,0,0.2));
                opacity: 0.85;
                cursor: pointer;
            }

            /* ستايل المربع الزجاجي المنبثق (Tooltip) */
            .graph-svg-tip {
                background: rgba(255, 255, 255, 0.95) !important;
                backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(255, 255, 255, 1) !important;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
                border-radius: 12px !important;
                color: #0f172a !important;
                font-family: 'Tajawal', sans-serif !important;
                padding: 12px 18px !important;
                direction: rtl;
                text-align: right;
            }
            .graph-svg-tip .title { font-weight: 800 !important; color: #0f172a !important; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px; font-size: 0.95rem !important;}
            .graph-svg-tip ul.data-point-list li { font-weight: 700 !important; font-size: 0.9rem !important;}

            .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInRow { to { opacity: 1; } }
        `;

        $('<style id="qyass-analytics-css">').text(css).appendTo('head');
    }
}