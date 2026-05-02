frappe.pages['dga-report'].on_page_load = function(wrapper) {
    frappe.require([
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    ], function() {
        new DGADetailedReport(wrapper);
    });
    
};

class DGADetailedReport {
    constructor(wrapper) {
        this.wrapper = $(wrapper);
        
        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'التقرير بصيغة هيئة الحكومة الرقمية',
            single_column: true
        });

        this.page.set_title('');
        $(wrapper).find('.page-head').hide();
        
        this.setup_styles();
        this.force_full_screen();
        this.render_layout();
        this.fetch_and_process_data();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-dga-report { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header { display: none !important; }
            .layout-side-section { display: none !important; }
            .layout-main-section-wrapper { 
                grid-template-columns: 1fr !important; 
                padding: 0 !important;
            }
            .layout-main-section { 
                width: 100% !important; max-width: 100% !important; 
                padding: 0 !important; border: none !important;
            }
            .page-container {
                background-color: #f0f9ff !important; margin: 0 !important;
                width: 100% !important; max-width: 100% !important;
            }
            .page-content { margin: 0 !important; }
        `;
        $('<style>').text(fullScreenStyle).appendTo(this.wrapper);
    }

    setup_styles() {
        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
            
            /* --- 1. Main Dashboard UI --- */
            .modern-dashboard {
                font-family: 'Tajawal', sans-serif;
                color: #0c4a6e;
                min-height: 100vh;
                background: #f0f9ff;
                padding-bottom: 50px;
                position: relative;
                overflow-x: hidden;
                direction: rtl;
            }
            
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.5; }
            .shape-1 { top: -10%; right: -5%; width: 400px; height: 400px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; left: -10%; width: 500px; height: 500px; background: #22d3ee; }

            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 30px; background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.5);
            }
            .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: #0369a1; text-decoration: none; transition: 0.3s; cursor: pointer; }
            .brand:hover { color: #0284c7; }
            .brand-icon { width: 35px; height: 35px; background: #0369a1; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
            .brand:hover .brand-icon { background: #0284c7; }

            .user-actions .action-btn { background: transparent; border: 1px solid #0369a1; color: #0369a1; padding: 5px 15px; border-radius: 6px; cursor: pointer; font-family: 'Tajawal'; font-weight:700; transition:0.2s;}
            .user-actions .action-btn:hover { background: #0369a1; color: white; }

            .dashboard-container { position: relative; z-index: 2; max-width: 1300px; margin: 0 auto; padding: 20px; }

            .hero-section {
                display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
                margin: 30px 0; gap: 20px;
            }
            .hero-text h1 { font-size: 2rem; margin: 0 0 10px 0; color: #0f172a; font-weight: 800; }
            .hero-text p { color: #64748b; font-size: 1.1rem; }
            
            .hero-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
            
            /* --- Filter Styles --- */
            #department-filter, #dto-filter { min-width: 220px; }
            #department-filter .frappe-control, #dto-filter .frappe-control { margin-bottom: 0 !important; }
            #department-filter input, #dto-filter input {
                border-radius: 10px !important;
                border: 1px solid #bae6fd !important;
                background: rgba(255,255,255,0.9) !important;
                color: #0c4a6e !important;
                font-weight: 600;
                font-family: 'Tajawal', sans-serif !important;
                padding: 20px 20px !important;
                box-shadow: 0 5px 15px rgba(3, 105, 161, 0.05);
            }

            .hero-btn {
                border: none; padding: 10px 25px; border-radius: 50px;
                font-weight: 700; cursor: pointer; box-shadow: 0 5px 15px rgba(3, 105, 161, 0.2);
                display: inline-flex; align-items: center; gap: 8px; font-family: 'Tajawal'; transition: transform 0.2s;
            }
            .hero-btn:hover { transform: translateY(-2px); }
            .btn-pdf { background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%); color: white; }
            .btn-email { background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); color: white; }

            /* --- 2. Report Matrix Table Styles --- */
            .report-card {
                background: rgba(255, 255, 255, 0.85); 
                backdrop-filter: blur(10px);
                border: 1px solid white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }

            .matrix-table { width: 100%; border-collapse: separate; border-spacing: 8px; direction: ltr; }
            .matrix-table th { padding: 10px; color: white; font-weight: 700; border-radius: 6px; text-align: center; font-size: 0.9rem; }
            .matrix-table td { vertical-align: middle; border-radius: 6px; }

            .th-perspective, .col-perspective { background-color:#3b82f6 !important; color: white; }
            .th-dimension, .col-dimension { background-color: #8b5cf6; color: white; display:none; }
            
            .col-perspective, .col-dimension { font-weight: 700; text-align: center; padding: 0 10px; font-size: 0.9rem; }

            .domain-box {
                border: 1px solid #e2e8f0; border-radius: 6px; height: 100%;
                display: flex; flex-direction: column; background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .domain-title {
                background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;
                color: #334155; font-weight: 700; font-size: 0.8rem;
                text-align: center; padding: 8px 5px; border-radius: 6px 6px 0 0;
            }
            .chips-wrapper {
                padding: 8px; min-height: 45px; display: flex; 
                flex-direction: row; justify-content: center; flex-wrap: wrap; 
                gap: 5px; align-items: center;
            }
            .element-chip {
                padding: 3px 8px; border-radius: 4px; color: white;
                font-weight: 700; font-size: 0.75rem; min-width: 35px; 
                text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }

            .bg-green { background-color: #10b981 !important; }
            .bg-orange { background-color: #f59e0b !important; }
            .bg-red { background-color: #ef4444 !important; }
            .bg-grey { background-color: #94a3b8 !important; }

            .legend-container {
                margin-top: 20px; display: flex; justify-content: flex-end; gap: 15px;
                padding-top: 15px; border-top: 1px dashed #cbd5e1;
            }
            .legend-item { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #475569; font-size: 0.8rem; }
            .legend-box { width: 12px; height: 12px; border-radius: 2px; }

            /* --- 3. LOADING OVERLAY --- */
            .loading-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(5px);
                z-index: 20000; 
                display: flex; flex-direction: column;
                justify-content: center; align-items: center;
            }
            .loading-content { text-align: center; color: #0369a1; }
            .loading-content i { font-size: 4rem; margin-bottom: 20px; color: #0ea5e9; }
            .loading-content h3 { font-size: 1.5rem; font-weight: 700; margin: 0; font-family: 'Tajawal'; }
            .loading-content p { color: #64748b; margin-top: 5px; font-size: 1rem; }

            /* --- 4. PDF MODE FIXES --- */
            .pdf-mode {
                position: absolute; top: 0; left: 0;
                width: 1200px !important;
                background: white !important; 
                z-index: 9999; padding: 40px !important;
                font-family: Arial, Tahoma, sans-serif !important; 
            }
            
            .pdf-mode .bg-shape, .pdf-mode .glass-header, .pdf-mode .hero-actions, .pdf-mode .user-actions { 
                display: none !important; 
            }
            .pdf-mode #department-filter, .pdf-mode #dto-filter { display: none !important; }
            .pdf-mode .dashboard-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            .pdf-mode .report-card { box-shadow: none !important; border: none !important; padding: 0 !important; background: white !important; backdrop-filter: none !important; }
            .pdf-mode * { font-family: Arial, Tahoma, sans-serif !important; letter-spacing: normal !important; }
        `;
        
        $('#dga-styles').remove();
        $('<style id="dga-styles">').text(css).appendTo('head');
    }

    render_layout() {
        const html = `
            <div class="modern-dashboard" id="report-content">
                <!-- Loading Overlay -->
                <div id="pdf-loading-overlay" class="loading-overlay" style="display:none;" data-html2canvas-ignore="true">
                    <div class="loading-content">
                        <i class="fa fa-circle-notch fa-spin"></i>
                        <h3 id="loading-text">جاري المعالجة...</h3>
                        <p>يرجى الانتظار حتى اكتمال العملية</p>
                    </div>
                </div>

                <div class="bg-shape shape-1"></div>
                <div class="bg-shape shape-2"></div>
                
                <div class="glass-header">
                    <a onclick='location.href="https://misa.newerasofts.com/app/qyass-dashboard"' class="brand">
                                            <img src='/files/Screenshot_2026-04-22_at_6.16.56_AM-removebg-preview.png' height='40px' width='50px'/>

<style>
.glass-header{
    background:linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%) !important;
}
.action-btn{
background:white !important;
}
</style>
                    </a>
                    <div class="user-actions">

                                        <!-- MISA Countdown Component Start -->
<div style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); color: black; padding: 6px 18px; border-radius: 30px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); font-family: 'Tajawal', sans-serif; direction: rtl; white-space: nowrap;">
    <span>متبقي حتى الرفع الأول:</span>
    <span style="background: #0284c7; color: #ffffff; padding: 2px 10px; border-radius: 20px; font-weight: 800; font-size: 1rem; text-align: center; min-width: 25px; line-height: 1.2;">
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" onload="this.outerHTML = Math.max(0, Math.ceil((new Date('2026-06-11T00:00:00') - new Date()) / 86400000))" style="display:none;" alt="counter">
    </span>
    <span style="color: black;">يوماً</span>
</div>
<!-- MISA Countdown Component End -->

                        <button class="action-btn" onclick="window.history.back()">
                            <i class="fa fa-times"></i> إغلاق
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>النتائج التفصيلية للتحول الرقمي</h1>
                        </div>
                        <div class="hero-actions">
                            <!-- الفلاتر -->
                            <div id="department-filter"></div>
                            <div id="dto-filter"></div>
                            
                            <button class="hero-btn btn-pdf" id="btn-pdf">
                                <i class="fa fa-file-pdf"></i> تحميل PDF
                            </button>
                            <button class="hero-btn btn-email" id="btn-email">
                                <i class="fa fa-envelope"></i> إرسال بريد
                            </button>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="loading-state" style="text-align:center; padding:50px; font-size:1.2rem; color:#64748b;">
                            <i class="fa fa-circle-notch fa-spin fa-2x"></i>
                            <div style="margin-top:10px">جاري جلب واحتساب النتائج...</div>
                        </div>

                        <table class="matrix-table" id="matrix-table" style="display:none;">
                            <thead>
                                <tr>
                                    <th colspan="6" style="background:transparent; color:#333; text-align:right;"></th>
                                    <th class="th-dimension" style='background:transparent;'></th>
                                    <th class="th-perspective">المنظور</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- 1. Strategy -->
                                <tr>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">البنية المؤسسية</div><div class="chips-wrapper" id="cell-ent-arch"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">حوكمة التحول الرقمي</div><div class="chips-wrapper" id="cell-dig-gov"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">التخطيط للتحول الرقمي</div><div class="chips-wrapper" id="cell-dig-plan"></div></div></td>
                                    <td class="col-dimension">الإستراتيجية والتخطيط</td>
                                    <td class="col-perspective">الإستراتيجية والتخطيط</td>
                                </tr>
                                
                                <!-- 2. Organization -->
                                <tr>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">بناء الكفاءات</div><div class="chips-wrapper" id="cell-cap-build"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">تطوير قيادات التحول الرقمي</div><div class="chips-wrapper" id="cell-lead-dev"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">الثقافة والبيئة الرقمية</div><div class="chips-wrapper" id="cell-culture"></div></div></td>
                                    <td class="col-dimension">المنظمة والثقافة</td>
                                    <td class="col-perspective">المنظمة والثقافة</td>
                                </tr>
                                
                                <tr style="height:5px"></tr>

                                <!-- 3. Operations -->
                                <tr>
                                    <td colspan="6"><div class="domain-box"><div class="domain-title">إجراءات العمل</div><div class="chips-wrapper" id="cell-processes"></div></div></td>
                                    <td class="col-dimension">العمليات والتشغيل</td>
                                    <td class="col-perspective">العمليات والتشغيل</td>
                                </tr>
                                
                                <!-- 4. Risk -->
                                <tr>
                                    <td colspan="3"><div class="domain-box"><div class="domain-title">استمرارية الأعمال</div><div class="chips-wrapper" id="cell-bcm"></div></div></td>
                                    <td colspan="3"><div class="domain-box"><div class="domain-title">إدارة المخاطر</div><div class="chips-wrapper" id="cell-risk"></div></div></td>
                                    <td class="col-dimension">إدارة المخاطر واستمرارية الأعمال</td>
                                    <td class="col-perspective">إدارة المخاطر واستمرارية الأعمال</td>
                                </tr>

                                <tr style="height:5px"></tr>

                                <!-- 5. IT -->
                                <tr>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">البنية السحابية</div><div class="chips-wrapper" id="cell-cloud"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">البنية التحتية للخدمات التقنية</div><div class="chips-wrapper" id="cell-infra"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">الأنظمة الداعمة للتحول الرقمي</div><div class="chips-wrapper" id="cell-systems"></div></div></td>
                                    <td class="col-dimension">تقنية المعلومات</td>
                                    <td class="col-perspective">تقنية المعلومات</td>
                                </tr>
                                
                                <!-- 6. Whole Gov -->
                                <tr>
                                    <td colspan="6"><div class="domain-box"><div class="domain-title">منصات الحكومة الشاملة</div><div class="chips-wrapper" id="cell-whole-gov"></div></div></td>
                                    <td class="col-dimension">الحكومة الشاملة</td>
                                    <td class="col-perspective">الحكومة الشاملة</td>
                                </tr>

                                <tr style="height:5px"></tr>

                                <!-- 7. Channels -->
                                <tr>
                                    <td colspan="3"><div class="domain-box"><div class="domain-title">القنوات والخدمات الرقمية</div><div class="chips-wrapper" id="cell-channels"></div></div></td>
                                    <td colspan="3"><div class="domain-box"><div class="domain-title">جودة الخدمات الرقمية</div><div class="chips-wrapper" id="cell-quality"></div></div></td>
                                    <td class="col-dimension">القنوات والخدمات</td>
                                    <td class="col-perspective">القنوات والخدمات</td>
                                </tr>
                                
                                <!-- 8. User Centricity -->
                                <tr>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">تجربة المستفيد</div><div class="chips-wrapper" id="cell-ux"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">تعزيز العلاقة مع المستفيد</div><div class="chips-wrapper" id="cell-rel"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">مشاركة المستفيد</div><div class="chips-wrapper" id="cell-part"></div></div></td>
                                    <td class="col-dimension">مركزية المستفيد</td>
                                    <td class="col-perspective">مركزية المستفيد</td>
                                </tr>

                                <tr style="height:5px"></tr>

                                <!-- 9. Data -->
                                <tr>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">البيانات المفتوحة</div><div class="chips-wrapper" id="cell-open-data"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">استخدام وإتاحة البيانات</div><div class="chips-wrapper" id="cell-data-use"></div></div></td>
                                    <td colspan="2"><div class="domain-box"><div class="domain-title">حوكمة وإدارة البيانات</div><div class="chips-wrapper" id="cell-data-gov"></div></div></td>
                                    <td class="col-dimension">البيانات الحكومية</td>
                                    <td class="col-perspective">البيانات الحكومية</td>
                                </tr>
                                
                                <!-- 10. Innovation -->
                                <tr>
                                    <td colspan="3"><div class="domain-box"><div class="domain-title">الحلول الابتكارية</div><div class="chips-wrapper" id="cell-inn-sol"></div></div></td>
                                    <td colspan="3"><div class="domain-box"><div class="domain-title">الابتكار المؤسسي</div><div class="chips-wrapper" id="cell-inn-inst"></div></div></td>
                                    <td class="col-dimension">البحث والابتكار</td>
                                    <td class="col-perspective">البحث والابتكار</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="legend-container">
                            <div class="legend-item"><div class="legend-box bg-green"></div> التزام كلي</div>
                            <div class="legend-item"><div class="legend-box bg-orange"></div> التزام جزئي</div>
                            <div class="legend-item"><div class="legend-box bg-red"></div> عدم التزام</div>
                            <div class="legend-item"><div class="legend-box bg-grey"></div> لا ينطبق</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.wrapper.find('.layout-main-section').html(html);

        // إنشاء فلتر الإدارة
        this.department_field = frappe.ui.form.make_control({
            parent: this.wrapper.find('#department-filter'),
            df: {
                fieldtype: 'Link',
                options: 'Department',
                fieldname: 'department',
                placeholder: 'تصفية بالإدارة...',
                onchange: () => {
                    this.fetch_and_process_data();
                }
            },
            render_input: true
        });

        // إنشاء فلتر مسؤول التحول الرقمي
        this.dto_field = frappe.ui.form.make_control({
            parent: this.wrapper.find('#dto-filter'),
            df: {
                fieldtype: 'Link',
                options: 'Employee', // في حال كان مرتبطاً بـ Employee قم بتغيير User إلى Employee
                fieldname: 'digital_transformation_officer',
                placeholder: 'تصفية بمسؤول التحول...',
                filters: { type: 'موظف تحول رقمي' }, // فلتر لعرض الموظفين الذين يحملون هذا المسمى الوظيفي فقط
                onchange: () => {
                    this.fetch_and_process_data();
                }
            },
            render_input: true
        });

        this.wrapper.find('#btn-pdf').on('click', () => this.generate_pdf('download'));
        this.wrapper.find('#btn-email').on('click', () => this.generate_pdf('email'));
    }

    fetch_and_process_data() {
        // تفريغ الجدول في حال كان هناك بيانات سابقة (مهم عند تغيير الفلتر)
        this.wrapper.find('.chips-wrapper').empty();
        $('.loading-state').show();
        $('#matrix-table').hide();

        let filters = {};
        
        // جلب قيمة فلتر الإدارة
        let selected_dept = this.department_field ? this.department_field.get_value() : null;
        if (selected_dept) {
            filters['department'] = selected_dept;
        }

        // جلب قيمة فلتر مسؤول التحول
        let selected_dto = this.dto_field ? this.dto_field.get_value() : null;
        if (selected_dto) {
            filters['digital_transformation_officer'] = selected_dto;
        }

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: ['name', 'number'],
                filters: filters,
                limit_page_length: 0
            },
            callback: (r) => {
                if (r.message && r.message.length > 0) {
                    const promises = r.message.map(item => {
                        return frappe.call({
                            method: 'frappe.client.get',
                            args: { doctype: 'Elements-2024', name: item.name }
                        });
                    });

                    Promise.all(promises).then(results => {
                        const fullData = results.map(res => res.message);
                        this.process_data(fullData);
                        $('.loading-state').hide();
                        $('#matrix-table').fadeIn();
                    });
                } else {
                    // في حال لم تكن هناك بيانات مطابقة للبحث
                    this.process_data([]);
                    $('.loading-state').hide();
                    $('#matrix-table').fadeIn();
                }
            }
        });
    }

    process_data(elements) {
        const map = {
            '5.1.1': 'cell-dig-plan', '5.1.2': 'cell-dig-plan', '5.1.3': 'cell-dig-plan',
            '5.2.1': 'cell-dig-gov', '5.2.2': 'cell-dig-gov', '5.2.3': 'cell-dig-gov', '5.2.4': 'cell-dig-gov',
            '5.3.1': 'cell-ent-arch', '5.3.2': 'cell-ent-arch', '5.3.3': 'cell-ent-arch', '5.3.4': 'cell-ent-arch',
            '5.4.1': 'cell-culture', '5.4.2': 'cell-culture', '5.4.3': 'cell-culture',
            '5.5.1': 'cell-lead-dev', '5.5.2': 'cell-lead-dev', '5.5.3': 'cell-lead-dev', '5.5.4': 'cell-lead-dev',
            '5.6.1': 'cell-cap-build', '5.6.2': 'cell-cap-build', '5.6.3': 'cell-cap-build',
            '5.7.1': 'cell-processes', '5.7.2': 'cell-processes', '5.7.3': 'cell-processes', '5.7.4': 'cell-processes',
            '5.8.1': 'cell-risk', '5.8.2': 'cell-risk', '5.8.3': 'cell-risk', '5.8.4': 'cell-risk', '5.8.5': 'cell-risk',
            '5.9.1': 'cell-bcm', '5.9.2': 'cell-bcm', '5.9.3': 'cell-bcm', '5.9.4': 'cell-bcm', '5.9.5': 'cell-bcm', '5.9.6': 'cell-bcm', '5.9.7': 'cell-bcm',
            '5.10.1': 'cell-systems', '5.10.2': 'cell-systems', '5.10.3': 'cell-systems', '5.10.4': 'cell-systems', '5.10.5': 'cell-systems',
            '5.11.1': 'cell-infra', '5.11.2': 'cell-infra', '5.11.3': 'cell-infra', '5.11.4': 'cell-infra', '5.11.5': 'cell-infra', '5.11.6': 'cell-infra', '5.11.7': 'cell-infra',
            '5.12.1': 'cell-cloud', '5.12.2': 'cell-cloud', '5.12.3': 'cell-cloud',
            '5.13.1': 'cell-whole-gov', '5.13.2': 'cell-whole-gov', '5.13.3': 'cell-whole-gov', '5.13.4': 'cell-whole-gov', '5.13.5': 'cell-whole-gov', '5.13.6': 'cell-whole-gov', '5.13.7': 'cell-whole-gov', '5.13.8': 'cell-whole-gov', '5.13.9': 'cell-whole-gov',
            '5.14.1': 'cell-quality', '5.14.2': 'cell-quality', '5.14.3': 'cell-quality', '5.14.4': 'cell-quality',
            '5.15.1': 'cell-channels', '5.15.2': 'cell-channels', '5.15.3': 'cell-channels', '5.15.4': 'cell-channels',
            '5.16.1': 'cell-part', '5.16.2': 'cell-part', '5.16.3': 'cell-part', '5.16.4': 'cell-part',
            '5.17.1': 'cell-rel', '5.17.2': 'cell-rel', '5.17.3': 'cell-rel',
            '5.18.1': 'cell-ux', '5.18.2': 'cell-ux', '5.18.3': 'cell-ux', '5.18.4': 'cell-ux',
            '5.19.1': 'cell-data-gov', '5.19.2': 'cell-data-gov', '5.19.3': 'cell-data-gov',
            '5.20.1': 'cell-data-use', '5.20.2': 'cell-data-use', '5.20.3': 'cell-data-use',
            '5.21.1': 'cell-open-data', '5.21.2': 'cell-open-data', '5.21.3': 'cell-open-data',
            '5.22.1': 'cell-inn-inst', '5.22.2': 'cell-inn-inst', '5.22.3': 'cell-inn-inst', '5.22.4': 'cell-inn-inst',
            '5.23.1': 'cell-inn-sol', '5.23.2': 'cell-inn-sol'
        };

        elements.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

        elements.forEach(element => {
            const num = element.number;
            const requirements = element.requirements || [];
            const total = requirements.length;
            const isNA = requirements.some(r => r['not'] == 1 || r['not'] === true);
            const doneCount = requirements.filter(r => r.done == 1 || r.done === true).length;
            const notDone = total - doneCount;

            let colorClass = 'bg-red'; 
            if (isNA) { colorClass = 'bg-grey'; } 
            else if (total > 0) {
                if (notDone === 0) colorClass = 'bg-green';
                else if (notDone === 1) colorClass = (total === 1) ? 'bg-red' : 'bg-orange';
                else colorClass = 'bg-red';
            } else { colorClass = 'bg-grey'; }

            const targetId = map[num];
            if (targetId) {
                $(`#${targetId}`).append(`<div class="element-chip ${colorClass}">${num}</div>`);
            }
        });
    }

    generate_pdf(action) {
        const element = document.getElementById('report-content');
        const overlay = $('#pdf-loading-overlay');
        const loadingText = $('#loading-text');

        // 1. Show Loading Overlay
        if (action === 'download') loadingText.text('جاري إنشاء ملف PDF...');
        else if (action === 'email') loadingText.text('جاري إرسال البريد...');
        
        overlay.fadeIn(200);

        // 2. Prepare for Snapshot
        element.classList.add('pdf-mode');
        
        // Timeout allows the DOM to render the Overlay before freezing for html2canvas
        setTimeout(() => {
            html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
                letterRendering: 1, 
                allowTaint: true,
                // Ensures html2canvas ignores the loading overlay in the final image
                ignoreElements: (el) => el.id === 'pdf-loading-overlay'
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                const pageWidth = 210;
                const imgProps = pdf.getImageProperties(imgData);
                const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

                pdf.addImage(imgData, 'JPEG', 0, 10, pageWidth, pdfHeight);

                if (action === 'download') {
                    pdf.save('Detailed_Result_2025.pdf');
                    element.classList.remove('pdf-mode');
                    overlay.fadeOut();
                    frappe.show_alert({message: 'تم التحميل', indicator: 'green'});
                } 
                else if (action === 'email') {
                    const blob = pdf.output('blob');
                    element.classList.remove('pdf-mode');
                    this.send_email(blob);
                }

            }).catch(err => {
                console.error(err);
                element.classList.remove('pdf-mode');
                overlay.fadeOut();
                frappe.msgprint('حدث خطأ أثناء التصدير');
            });
        }, 300);
    }

    send_email(blob) {
        const file = new File([blob], "Detailed_Result.pdf", { type: "application/pdf" });
        let formData = new FormData();
        formData.append('file', file, 'Detailed_Result.pdf');
        formData.append('is_private', 1);

        fetch('/api/method/upload_file', {
            method: 'POST',
            headers: { 'X-Frappe-CSRF-Token': frappe.csrf_token },
            body: formData
        })
        .then(r => r.json())
        .then(data => {
            $('#pdf-loading-overlay').fadeOut();

            if (data.message) {
                new frappe.views.CommunicationComposer({
                    doc: {},
                    subject: 'تقرير النتيجة التفصيلية',
                    message: 'مرفق لكم تقرير النتيجة التفصيلية (PDF).',
                    attachments: [{
                        name: data.message.name,
                        file_name: 'Detailed_Result.pdf',
                        file_url: data.message.file_url,
                        is_private: 1
                    }]
                });
            }
        })
        .catch(err => {
             $('#pdf-loading-overlay').fadeOut();
             frappe.msgprint('فشل في رفع الملف');
        });
    }
}
