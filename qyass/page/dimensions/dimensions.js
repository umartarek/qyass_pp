frappe.pages['dimensions'].on_page_load = function(wrapper) {
    console.log("--- Qyass Dashboard: Initializing ---");

    // 1. Create the standard page structure
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Qyass Dashboard',
        single_column: true
    });

    // 2. Hide default Header
    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    // 3. Initialize the Dashboard
    new QyassModernDashboard(wrapper, page);
};

class QyassModernDashboard {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);
        
        this.setup_styles();
        this.force_full_screen();
        this.render_skeleton();
        this.fetch_data();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-dimensions { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
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
                        <button class="action-btn" onclick="location.href='/app/qyass-dashboard'">
                            <i class="fa fa-times"></i> خروج
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <!-- Hero -->
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>لوحة المحاور الاستراتيجية</h1>
                            <p>نظام إدارة الأداء والمتابعة</p>
                            <!-- Changed to ID for event binding -->
                            <button class="hero-btn" id="btn-new-dimension">
                                <i class="fa fa-plus-circle"></i> إضافة محور جديد
                            </button>
                        </div>
                        <div class="hero-stats">
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-layer-group"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-count">...</span>
                                    <span class="stat-desc">المحاور</span>
                                </div>
                            </div>
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-percentage"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-weight">...</span>
                                    <span class="stat-desc">الوزن</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- List Area -->
                    <div class="list-section">
                        <div id="modern-list-wrapper" class="list-grid">
                            <div class="text-center p-5" style="color: #64748b;">
                                <i class="fa fa-spinner fa-spin fa-2x"></i>
                                <div class="mt-2">جاري جلب البيانات...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.body.html(layout);

        // Bind the click event
        this.body.find('#btn-new-dimension').on('click', () => this.open_create_dialog());
    }

    // --- NEW METHOD: Create Dialog ---
    open_create_dialog() {
        let d = new frappe.ui.Dialog({
            title: 'إضافة محور استراتيجي جديد',
            size: 'large',
            fields: [
                {
                    label: 'البيانات الأساسية',
                    fieldtype: 'Section Break'
                },
                {
                    label: 'Vision',
                    fieldname: 'vision',
                    fieldtype: 'Link',
                    options: 'Vision',
                    reqd: 1
                },
                {
                    label: 'Dimension',
                    fieldname: 'dimension',
                    fieldtype: 'Data',
                    reqd: 1,
                    placeholder: 'اسم المحور'
                },
                {
                    fieldtype: 'Column Break'
                },
                {
                    label: 'Subnumber',
                    fieldname: 'subnumber',
                    fieldtype: 'Data',
                    placeholder: 'e.g. 1.1'
                },
                {
                    label: 'Weight',
                    fieldname: 'weight',
                    fieldtype: 'Data', // Mapped as Data in JSON, acts as float for stats
                    description: '%'
                },
                {
                    label: 'Total Number',
                    fieldname: 'total_number',
                    fieldtype: 'Data'
                },
                {
                    label: 'تفاصيل إضافية',
                    fieldtype: 'Section Break'
                },
                {
                    label: 'Notes',
                    fieldname: 'notes',
                    fieldtype: 'Text Editor'
                }
            ],
            primary_action_label: 'حفظ المحور',
            primary_action: (values) => {
                this.create_dimension(values, d);
            }
        });

        // Add Custom Theme Class
        d.$wrapper.addClass('qyass-theme-dialog');
        
        // Add Header Icon
        d.$wrapper.find('.modal-header').prepend('<div class="dialog-icon"><i class="fa fa-layer-group"></i></div>');

        d.show();
    }

    // --- NEW METHOD: Handle API Insert ---
    create_dimension(values, dialog) {
        frappe.call({
            method: 'frappe.client.insert',
            args: {
                doc: {
                    doctype: 'Dimension',
                    ...values
                }
            },
            freeze: true,
            freeze_message: 'جاري الحفظ...',
            callback: (r) => {
                if (!r.exc) {
                    dialog.hide();
                    frappe.show_alert({
                        message: `<i class="fa fa-check-circle"></i> تم إضافة المحور بنجاح`,
                        indicator: 'green'
                    }, 5);
                    this.fetch_data(); // Refresh list
                }
            }
        });
    }

    fetch_data() {
        frappe.db.get_list('Dimension', {
            fields: ['*'],
            limit: 200,
            order_by: 'creation desc'
        }).then(data => {
            this.render_list(data);
        }).catch(err => {
            console.error(err);
            this.body.find('#modern-list-wrapper').html(`
                <div class="alert alert-danger">حدث خطأ: ${err.message}</div>
            `);
        });
    }

    render_list(data) {
        const container = this.body.find('#modern-list-wrapper');
        const statCount = this.body.find('#stat-count');
        const statWeight = this.body.find('#stat-weight');
        
        container.empty();

        const count = data.length;
        let totalWeight = data.reduce((acc, item) => acc + (parseFloat(item.weight) || 0), 0);
        
        statCount.text(count);
        statWeight.text(totalWeight.toFixed(1) + '%');

        if (count === 0) {
            container.html(`
                <div class="empty-state glass-card">
                    <i class="fa fa-box-open" style="font-size:3rem; opacity:0.3; margin-bottom:15px"></i>
                    <h3>لا توجد بيانات</h3>
                    <p>لم يتم إضافة أي محاور بعد</p>
                </div>
            `);
            return;
        }

        data.forEach((item, index) => {
            const delay = Math.min(index * 100, 1000);
            const targetUrl = `/app/dimension/${item.name}`;

            const card = $(`
                <div class="modern-list-item glass-card" onclick="location.href='${targetUrl}'" style="animation-delay: ${delay}ms">
                    <div class="item-left">
                        <div class="item-icon-box">
                            <span>${item.subnumber || '#'}</span>
                        </div>
                        <div class="item-info">
                            <h3 class="item-title">${item.dimension || 'بدون اسم'}</h3>
                            <div class="item-meta">
                                <span class="meta-tag">
                                    <i class="fa fa-eye"></i> ${item.vision_name || item.vision || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-right">
                        <div class="weight-box">
                            <span class="weight-label">الوزن</span>
                            <span class="weight-val">${item.weight || 0}%</span>
                            <div class="weight-bar">
                                <div class="weight-fill" style="width: ${Math.min(item.weight || 0, 100)}%"></div>
                            </div>
                        </div>
                        <div class="btn-arrow">
                            <i class="fa fa-arrow-left"></i>
                        </div>
                    </div>
                </div>
            `);

            container.append(card);
        });
    }

    setup_styles() {
        if ($('#qyass-modern-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            /* --- Main Dashboard Styles --- */
            .modern-dashboard {
                font-family: 'Tajawal', sans-serif;
                color: #0c4a6e;
                min-height: 100vh;
                background: #f0f9ff;
                padding-bottom: 50px;
                position: relative;
                overflow-x: hidden;
            }
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.5; }
            .shape-1 { top: -10%; right: -5%; width: 400px; height: 400px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; left: -10%; width: 500px; height: 500px; background: #22d3ee; }
            .dashboard-container { position: relative; z-index: 2; max-width: 1000px; margin: 0 auto; padding: 20px; }
            
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 30px; background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.5);
            }
            .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: #0369a1; }
            .brand-icon { width: 35px; height: 35px; background: #0369a1; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .action-btn { background: transparent; border: 1px solid #0369a1; color: #0369a1; padding: 5px 15px; border-radius: 6px; cursor: pointer; }

            .hero-section {
                display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
                margin: 30px 0; gap: 20px;
            }
            .hero-text h1 { font-size: 2rem; margin: 0 0 10px 0; color: #0f172a; }
            .hero-btn {
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                color: white; border: none; padding: 10px 25px; border-radius: 50px;
                font-weight: 700; cursor: pointer; box-shadow: 0 5px 15px rgba(3, 105, 161, 0.3);
                display: inline-flex; align-items: center; gap: 8px;
            }

            .hero-stats { display: flex; gap: 15px; }
            .glass-card {
                background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-radius: 16px;
            }
            .stat-card { display: flex; align-items: center; gap: 15px; padding: 15px 25px; min-width: 180px; }
            .stat-icon { width: 40px; height: 40px; background: rgba(14, 165, 233, 0.1); color: #0369a1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
            .stat-num { font-size: 1.5rem; font-weight: 800; line-height: 1; }
            .stat-desc { font-size: 0.8rem; color: #64748b; }

            .list-grid { display: flex; flex-direction: column; gap: 15px; }
            .modern-list-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 25px; cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                opacity: 0; animation: slideUp 0.5s ease forwards;
            }
            .modern-list-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                background: white;
            }
            @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

            .item-left { display: flex; align-items: center; gap: 15px; }
            .item-icon-box {
                width: 45px; height: 45px; background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700;
            }
            .item-title { font-size: 1.05rem; margin: 0; color: #0f172a; }
            .meta-tag { font-size: 0.8rem; color: #64748b; background: rgba(255,255,255,0.6); padding: 2px 8px; border-radius: 4px; }

            .item-right { display: flex; align-items: center; gap: 20px; }
            .weight-box { text-align: center; min-width: 80px; }
            .weight-label { font-size: 0.7rem; color: #94a3b8; display: block; }
            .weight-val { font-size: 1rem; font-weight: 700; color: #0369a1; }
            .weight-bar { height: 4px; background: #e2e8f0; margin-top: 3px; border-radius: 2px; width: 100%; }
            .weight-fill { height: 100%; background: #0ea5e9; border-radius: 2px; }
            .btn-arrow { color: #cbd5e1; transition: 0.2s; }
            .modern-list-item:hover .btn-arrow { color: #0369a1; transform: translateX(-3px); }
            .empty-state { text-align: center; padding: 40px; }

            /* --- CUSTOM DIALOG THEME --- */
            .qyass-theme-dialog .modal-content {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 1);
                border-radius: 20px;
                box-shadow: 0 25px 60px rgba(14, 165, 233, 0.2);
                font-family: 'Tajawal', sans-serif !important;
            }
            .qyass-theme-dialog .modal-header {
                border-bottom: 1px solid rgba(0,0,0,0.05);
                padding: 20px 25px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .qyass-theme-dialog .modal-title {
                font-weight: 800;
                color: #0c4a6e;
                font-size: 1.3rem;
            }
            .qyass-theme-dialog .dialog-icon {
                width: 35px; height: 35px;
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                color: white;
                border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
            }
            .qyass-theme-dialog .modal-body {
                padding: 25px;
                background: transparent;
            }
            .qyass-theme-dialog .form-section {
                border-bottom: 1px dashed #e2e8f0;
                margin-bottom: 15px;
                padding-bottom: 10px;
            }
            .qyass-theme-dialog .form-section-heading {
                text-transform: uppercase;
                font-size: 0.8rem;
                color: #0369a1;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            .qyass-theme-dialog .form-group label {
                color: #64748b;
                font-weight: 600;
                font-size: 0.9rem;
            }
            .qyass-theme-dialog .form-control {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 10px;
                padding: 8px 15px;
                color: #0c4a6e;
                box-shadow: none;
            }
            .qyass-theme-dialog .form-control:focus {
                background: white;
                border-color: #0369a1;
                box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
            }
            .qyass-theme-dialog .modal-footer {
                border-top: none; padding: 10px 25px 25px; background: transparent; box-shadow: none;
            }
            .qyass-theme-dialog .btn-primary {
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                border: none; border-radius: 50px; padding: 8px 30px; font-weight: 700;
                box-shadow: 0 4px 15px rgba(3, 105, 161, 0.3); transition: transform 0.2s;
            }
            .qyass-theme-dialog .btn-primary:hover {
                transform: scale(1.02); box-shadow: 0 6px 20px rgba(3, 105, 161, 0.4);
            }
            .qyass-theme-dialog .standard-actions { background: transparent; }

            @media (max-width: 768px) {
                .modern-list-item { flex-direction: column; align-items: flex-start; gap: 15px; }
                .item-right { width: 100%; justify-content: space-between; }
                .hero-section { justify-content: center; text-align: center; }
                .hero-stats { width: 100%; }
            }
        `;

        $('<style id="qyass-modern-css">').text(css).appendTo('head');
    }
}