frappe.pages['dep'].on_page_load = function(wrapper) {
    console.log("--- Qyass Departments: Initializing ---");

    // 1. Create standard page structure
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'الادارات (Departments)',
        single_column: true
    });

    // 2. Clear default elements
    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    // 3. Initialize the Dashboard
    new QyassDepartmentDashboard(wrapper, page);
};

class QyassDepartmentDashboard {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);
        
        this.setup_styles();
        this.force_kiosk_mode(); 
        this.render_skeleton();
        this.fetch_data();
    }

    force_kiosk_mode() {
        const kioskStyle = `
            .page-body { max-width:100vw !important; }
            #page-dep{ margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header{ display: none !important; }
            header.navbar { display: none !important; }
            .page-head { display: none !important; }
            .layout-side-section { display: none !important; }
            .layout-main-section-wrapper { 
                grid-template-columns: 1fr !important; 
                padding: 0 !important; margin: 0 !important;
            }
            .layout-main-section { 
                width: 100% !important; max-width: 100% !important; 
                padding: 0 !important; border: none !important;
            }
            .page-container {
                background-color: #f0f9ff !important; margin: 0 !important;
                width: 100% !important; max-width: 100% !important;
                padding-top: 0 !important;
            }
            body { --navbar-height: 0px !important; }
            .main-section { margin-top: 0 !important; }
        `;
        $('<style>').text(kioskStyle).appendTo(this.wrapper);
    }

    render_skeleton() {
        const layout = $(`
            <div class="modern-dashboard" dir="rtl">
                <div class="bg-shape shape-1"></div>
                <div class="bg-shape shape-2"></div>
                
                <!-- Custom Glass Navbar -->
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
                            <i class="fa fa-home"></i> الرئيسية
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <!-- Hero Section -->
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>دليل الإدارات</h1>
                            <p>الهيكل التنظيمي والوحدات الإدارية في النظام.</p>
                            <!-- Changed to ID for event binding -->
                            <button class="hero-btn" id="btn-new-dept">
                                <i class="fa fa-plus-circle"></i> تعريف إدارة جديدة
                            </button>
                        </div>
                        
                        <!-- Stats -->
                        <div class="hero-stats">
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-building"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-count">...</span>
                                    <span class="stat-desc">إدارة مسجلة</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- List Area -->
                    <div class="list-section">
                        <div class="section-header">
                            <h2>الإدارات المسجلة</h2>
                            <span class="badge-pill" id="list-badge">0</span>
                        </div>

                        <!-- Search Box -->
                        <div class="search-box glass-card">
                            <i class="fa fa-search"></i>
                            <input type="text" id="dept-search" placeholder="بحث عن إدارة...">
                        </div>

                        <div id="dept-list-wrapper" class="list-grid">
                            <div class="text-center p-5" style="color: #64748b;">
                                <i class="fa fa-circle-notch fa-spin fa-2x"></i>
                                <div class="mt-2">جاري تحميل البيانات...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.body.html(layout);

        // Simple Client-side Search Logic
        layout.find('#dept-search').on('keyup', (e) => {
            const value = e.target.value.toLowerCase();
            this.wrapper.find('.modern-list-item').filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });

        // Bind Button Click
        this.body.find('#btn-new-dept').on('click', () => this.open_create_dialog());
    }

    // --- NEW METHOD: Create Dialog ---
    open_create_dialog() {
        let d = new frappe.ui.Dialog({
            title: 'إضافة إدارة جديدة',
            fields: [
                {
                    label: 'اسم الإدارة',
                    fieldname: 'department',
                    fieldtype: 'Data',
                    reqd: 1,
                    placeholder: 'أدخل اسم الإدارة هنا'
                }
            ],
            primary_action_label: 'حفظ الإدارة',
            primary_action: (values) => {
                this.create_department(values, d);
            }
        });

        // Add Custom Theme Class
        d.$wrapper.addClass('qyass-theme-dialog');
        
        // Add Header Icon
        d.$wrapper.find('.modal-header').prepend('<div class="dialog-icon"><i class="fa fa-building"></i></div>');

        d.show();
    }

    // --- NEW METHOD: Handle API Insert ---
    create_department(values, dialog) {
        frappe.call({
            method: 'frappe.client.insert',
            args: {
                doc: {
                    doctype: 'Department',
                    department: values.department
                }
            },
            freeze: true,
            freeze_message: 'جاري الحفظ...',
            callback: (r) => {
                if (!r.exc) {
                    dialog.hide();
                    frappe.show_alert({
                        message: `<i class="fa fa-check-circle"></i> تم إضافة الإدارة: ${r.message.department}`,
                        indicator: 'green'
                    }, 5);
                    this.fetch_data(); // Refresh list
                }
            }
        });
    }

    fetch_data() {
        frappe.db.get_list('Department', {
            fields: ['name', 'department', 'modified'],
            limit: 500,
            order_by: 'department asc'
        }).then(data => {
            this.render_list(data);
        }).catch(err => {
            console.error(err);
            this.body.find('#dept-list-wrapper').html(`
                <div class="alert alert-danger">خطأ: ${err.message}</div>
            `);
        });
    }

    render_list(data) {
        const container = this.body.find('#dept-list-wrapper');
        const statCount = this.body.find('#stat-count');
        const listBadge = this.body.find('#list-badge');
        
        container.empty();

        const count = data.length;
        statCount.text(count);
        listBadge.text(count);

        if (count === 0) {
            container.html(`
                <div class="empty-state glass-card">
                    <i class="fa fa-building" style="font-size:3rem; opacity:0.3; margin-bottom:15px"></i>
                    <h3>لا توجد إدارات</h3>
                    <p>النظام خالي من الإدارات حالياً</p>
                </div>
            `);
            return;
        }

        data.forEach((item, index) => {
            const delay = Math.min(index * 50, 1000);
            const title = item.department || item.name;
            const date = frappe.datetime.str_to_user(item.modified).split(' ')[0];
            const targetUrl = `/app/department/${item.name}`;

            const card = $(`
                <div class="modern-list-item glass-card" 
                     onclick="location.href='${targetUrl}'"
                     style="animation-delay: ${delay}ms">
                    <div class="item-left">
                        <div class="item-icon-box">
                            <i class="fa fa-briefcase"></i>
                        </div>
                        <div class="item-info">
                            <h3 class="item-title">${title}</h3>
                            <div class="item-meta">
                                <span class="meta-tag">
                                    <i class="fa fa-clock"></i> محدث: ${date}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-right">
                        <div class="btn-arrow">
                            <i class="fa fa-chevron-left"></i>
                        </div>
                    </div>
                </div>
            `);

            container.append(card);
        });
    }

    setup_styles() {
        if ($('#qyass-dept-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            .modern-dashboard {
                font-family: 'Tajawal', sans-serif;
                color: #0c4a6e;
                min-height: 100vh;
                background: #f0f9ff;
                padding-bottom: 50px;
                position: relative;
                overflow-x: hidden;
            }

            .search-box {
                display: flex; align-items: center; gap: 10px;
                padding: 12px 20px; margin-bottom: 20px;
                background: rgba(255,255,255,0.8);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.9);
            }
            .search-box i { color: #0369a1; }
            .search-box input {
                border: none; background: transparent; width: 100%; outline: none;
                font-family: 'Tajawal'; font-size: 1rem; color: #0c4a6e;
            }

            .bg-shape {
                position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.5;
            }
            .shape-1 { top: -10%; left: -5%; width: 400px; height: 400px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #22d3ee; }

            .dashboard-container {
                position: relative; z-index: 2; max-width: 900px; margin: 0 auto; padding: 20px;
            }

            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 30px; background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.5);
                box-shadow: 0 4px 20px rgba(0,0,0,0.02);
            }
            .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: #0369a1; }
            .brand-icon { width: 35px; height: 35px; background: #0369a1; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .action-btn { background: white; border: 1px solid #e0f2fe; color: #0369a1; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-family: 'Tajawal'; font-weight: 600; display:flex; align-items:center; gap:5px; transition: 0.2s;}
            .action-btn:hover { background: #0369a1; color: white; }

            .hero-section {
                display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
                margin: 30px 0; gap: 20px;
            }
            .hero-text h1 { font-size: 2rem; margin: 0 0 10px 0; color: #0f172a; }
            .hero-text p { color: #64748b; font-size: 1.1rem; }
            
            .hero-btn {
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                color: white; border: none; padding: 10px 25px; border-radius: 50px;
                font-weight: 700; cursor: pointer; box-shadow: 0 5px 15px rgba(3, 105, 161, 0.3);
                display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s;
            }
            .hero-btn:hover { transform: translateY(-2px); }

            .hero-stats { display: flex; gap: 15px; }
            .glass-card {
                background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-radius: 16px;
            }
            .stat-card { display: flex; align-items: center; gap: 15px; padding: 15px 25px; min-width: 180px; }
            .stat-icon { width: 45px; height: 45px; background: rgba(14, 165, 233, 0.1); color: #0369a1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
            .stat-num { font-size: 1.5rem; font-weight: 800; line-height: 1; }
            .stat-desc { font-size: 0.8rem; color: #64748b; }

            .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
            .section-header h2 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #0f172a; }
            .badge-pill { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-weight: 700; }

            .list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)); gap: 12px; }
            
            .modern-list-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 20px; cursor: pointer;
                transition: transform 0.2s, background 0.2s;
                opacity: 0; animation: slideUp 0.4s ease forwards;
            }
            .modern-list-item:hover {
                transform: translateX(-5px);
                background: white;
                border-color: #0369a1;
            }
            @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

            .item-left { display: flex; align-items: center; gap: 15px; }
            .item-icon-box {
                width: 40px; height: 40px; background: #f1f5f9;
                color: #64748b; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
                transition: 0.2s;
            }
            .modern-list-item:hover .item-icon-box { background: #0369a1; color: white; }

            .item-title { font-size: 1.05rem; margin: 0; color: #0f172a; font-weight: 600; }
            .meta-tag { font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 4px;}

            .btn-arrow { 
                width: 32px; height: 32px; border-radius: 50%; background: #f8fafc;
                color: #cbd5e1; display: flex; align-items: center; justify-content: center;
                transition: 0.2s;
            }
            .modern-list-item:hover .btn-arrow { background: #e0f2fe; color: #0369a1; }
            
            .empty-state { text-align: center; padding: 40px; }

            /* --- CUSTOM DIALOG THEME (Glassmorphism + Tajawal) --- */
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
                height: 45px;
            }
            .qyass-theme-dialog .form-control:focus {
                background: white;
                border-color: #0369a1;
                box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
            }
            .qyass-theme-dialog .modal-footer {
                border-top: none;
                padding: 10px 25px 25px;
                background: transparent;
                box-shadow: none;
            }
            .qyass-theme-dialog .btn-primary {
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                border: none;
                border-radius: 50px;
                padding: 8px 30px;
                font-weight: 700;
                box-shadow: 0 4px 15px rgba(3, 105, 161, 0.3);
                transition: transform 0.2s;
            }
            .qyass-theme-dialog .btn-primary:hover {
                transform: scale(1.02);
                box-shadow: 0 6px 20px rgba(3, 105, 161, 0.4);
            }
            .qyass-theme-dialog .standard-actions { background: transparent; }
            
            @media (max-width: 768px) {
                .hero-section { text-align: center; justify-content: center; }
                .hero-stats { width: 100%; justify-content: center; }
            }
        `;

        $('<style id="qyass-dept-css">').text(css).appendTo('head');
    }
}