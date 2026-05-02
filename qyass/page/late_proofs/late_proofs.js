frappe.pages['late-proofs'].on_page_load = function(wrapper) {
    console.log("--- Qyass Late Proofs Report: Initializing ---");

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'تقرير المستندات المتأخرة',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    new LateProofsDashboard(wrapper, page);
};

class LateProofsDashboard {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);
        
        this.current_data = [];
        
        this.setup_styles();
        this.force_full_screen();
        this.render_skeleton();
        this.fetch_data();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-late-proofs { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
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
                            <i class="fa fa-file-excel"></i> تصدير التقرير
                        </button>
                        <button class="action-btn" onclick="window.history.back()" style="margin-right: 10px;">
                            <i class="fa fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    
                    <!-- Stats Bar -->
                    <div class="stats-bar fade-in-up">
                        <div class="stat-card glass-card">
                            <div class="s-icon"><i class="fa fa-exclamation-circle"></i></div>
                            <div class="s-info">
                                <span class="s-val" id="count-late">0</span>
                                <span class="s-lbl">إجمالي المتأخرات</span>
                            </div>
                        </div>
                        <div class="stat-card glass-card">
                            <div class="s-icon"><i class="fa fa-user-clock"></i></div>
                            <div class="s-info">
                                <span class="s-val" id="count-officers">0</span>
                                <span class="s-lbl">موظفين متأخرين</span>
                            </div>
                        </div>
                    </div>

                    <!-- Table Area -->
                    <div class="glass-table-wrapper fade-in-up" style="animation-delay: 0.1s;">
                        <table class="qyass-table">
                            <thead>
                                <tr>
                                    <th width="25%">الموظف</th>
                                    <th width="35%">المعيار</th>
                                    <th width="20%" class="text-center">التاريخ المتوقع</th>
                                    <th width="20%" class="text-center">الأيام المتأخرة</th>
                                </tr>
                            </thead>
                            <tbody id="late-table-body">
                                <tr><td colspan="4" class="text-center p-5 text-muted"><i class="fa fa-spinner fa-spin fa-2x"></i><br>جاري فحص التواريخ...</td></tr>
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
        let today = frappe.datetime.get_today();

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: ['digital_transformation_officer', 'element', 'expected_end_date'],
                filters: {
                    'expected_end_date': ['<', today],
                    'completed_count': ['<', 1] // عرض فقط غير المكتملة المتأخرة
                },
                order_by: 'digital_transformation_officer asc, element asc',
                limit_page_length: 5000 
            },
            callback: (r) => {
                let data = r.message || [];
                this.render_table(data);
            }
        });
    }

    render_table(data) {
        const tbody = this.body.find('#late-table-body');
        tbody.empty();

        if (!data || data.length === 0) {
            tbody.html(`<tr><td colspan="4" class="text-center p-5 text-muted">ممتاز! لا توجد مستندات متأخرة حالياً</td></tr>`);
            return;
        }

        let today = new Date();
        let uniqueOfficers = new Set();

        data.forEach((item, index) => {
            let dueDate = new Date(item.expected_end_date);
            let timeDiff = today.getTime() - dueDate.getTime();
            let daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            if(item.digital_transformation_officer) uniqueOfficers.add(item.digital_transformation_officer);

            const row = $(`
                <tr style="animation: fadeInRow 0.3s ease forwards; animation-delay: ${index * 15}ms; opacity: 0;">
                    <td class="font-weight-bold" style="color: #0c4a6e;">
                        <i class="fa fa-user-circle mr-2 opacity-50"></i> ${item.digital_transformation_officer || 'غير محدد'}
                    </td>
                    <td>${item.element || '-'}</td>
                    <td class="text-center"><span class="date-badge">${item.expected_end_date}</span></td>
                    <td class="text-center">
                        <span class="delay-badge">${daysLate} يوم</span>
                    </td>
                </tr>
            `);
            tbody.append(row);
        });

        this.body.find('#count-late').text(data.length);
        this.body.find('#count-officers').text(uniqueOfficers.size);
        this.current_data = data;
    }

    export_to_csv() {
        if (!this.current_data || this.current_data.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += "الموظف,المعيار,التاريخ المتوقع,الأيام المتأخرة\n"; 
        
        let today = new Date();
        this.current_data.forEach(item => {
            let daysLate = Math.floor((today.getTime() - new Date(item.expected_end_date).getTime()) / (1000 * 3600 * 24));
            let row = [`"${item.digital_transformation_officer || ''}"`, `"${item.element || ''}"`, item.expected_end_date, daysLate].join(",");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `المستندات_المتاخرة_${frappe.datetime.nowdate()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setup_styles() {
        if ($('#qyass-late-css').length) return;

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
            .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
            
            .action-btn { background: white; border: 1px solid #bae6fd; color: #0284c7; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 700;}
            .action-btn:hover { background: #f0f9ff; transform: translateY(-1px); border-color: #0284c7;}

            .stats-bar { display: flex; gap: 20px; margin-bottom: 25px; }
            .stat-card { flex: 1; display: flex; align-items: center; gap: 20px; padding: 20px 30px; }
            .s-icon { font-size: 2.5rem; color: #0ea5e9; opacity: 0.8; }
            .s-val { display: block; font-size: 2rem; font-weight: 800; color: #0c4a6e; line-height: 1; }
            .s-lbl { font-size: 0.9rem; font-weight: 700; color: #0284c7; }

            .glass-table-wrapper {
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
                border: 1px solid white; border-radius: 20px; box-shadow: 0 10px 40px rgba(2,132,199,0.05);
                overflow-x: auto; padding: 5px;
            }
            .qyass-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: right; }
            .qyass-table th {
                padding: 18px 15px; color: #0c4a6e; font-weight: 800; font-size: 0.95rem;
                background: #f0f9ff; border-bottom: 2px solid #bae6fd;
            }
            .qyass-table td { padding: 15px; border-bottom: 1px dashed #e0f2fe; color: #0f172a; vertical-align: middle; }
            .qyass-table tr:hover td { background: #f8fafc; }
            
            .date-badge { background: #f0f9ff; border: 1px solid #bae6fd; padding: 4px 10px; border-radius: 6px; font-weight: 700; color: #0284c7; font-size: 0.85rem;}
            .delay-badge { background: #0c4a6e; color: white; padding: 5px 15px; border-radius: 50px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(12, 74, 110, 0.2);}

            .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,1); border-radius: 20px; }
            .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInRow { to { opacity: 1; } }
        `;

        $('<style id="qyass-late-css">').text(css).appendTo('head');
    }
}