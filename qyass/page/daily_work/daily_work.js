frappe.pages['daily-work'].on_page_load = function(wrapper) {
    console.log("--- Qyass Daily Work: Initializing (High Performance) ---");

    // 1. Create standard page structure
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'المهام اليومية (Daily Tasks)',
        single_column: true
    });

    // 2. Clear default elements
    page.set_title('');
    
    // 3. Initialize the Dashboard
    new QyassDailyWorkDashboard(wrapper, page);
};

class QyassDailyWorkDashboard {
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
        // Hides Navbar, Sidebar, and maximizes space
        const kioskStyle = `
            #page-daily-work{ margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            .page-body{ margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header.navbar { display: none !important; }
            .page-head { display: none !important; }
            .layout-side-section { display: none !important; }
            .layout-main-section-wrapper { grid-template-columns: 1fr !important; padding: 0 !important; margin: 0 !important; }
            .layout-main-section { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; }
            .page-container { background-color: #f0f9ff !important; margin: 0 !important; width: 100% !important; padding-top: 0 !important; }
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
                            <i class="fa fa-home"></i> الرئيسية
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <!-- Hero -->
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>سجل الإنجاز اليومي</h1>
                            <p>متابعة تقارير الموظفين وإنجاز مهام المعايير.</p>
                            <!-- Changed to ID for event binding -->
                            <button class="hero-btn" id="btn-new-dailywork">
                                <i class="fa fa-plus-circle"></i> تسجيل انجاز جديد
                            </button>
                        </div>
                        
                        <!-- Stats -->
                        <div class="hero-stats">
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-file-invoice"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-count">0</span>
                                    <span class="stat-desc">تقارير مسجلة</span>
                                </div>
                            </div>
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-check-circle"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-completed">0</span>
                                    <span class="stat-desc">مهام منجزة</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- List Section -->
                    <div class="list-section">
                        <div class="section-header">
                            <h2>التقارير الأخيرة</h2>
                            <span class="badge-pill" id="list-badge">0</span>
                        </div>

                        <!-- Search -->
                        <div class="search-box glass-card">
                            <i class="fa fa-search"></i>
                            <input type="text" id="task-search" placeholder="بحث باسم الموظف، القسم، أو المعيار...">
                        </div>

                        <div id="task-list-wrapper" class="list-grid">
                            <div class="text-center p-5" style="color: #64748b;">
                                <i class="fa fa-circle-notch fa-spin fa-2x"></i>
                                <div class="mt-2">جاري جلب البيانات...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.body.html(layout);

        // Search Logic
        layout.find('#task-search').on('keyup', (e) => {
            const value = e.target.value.toLowerCase();
            this.wrapper.find('.modern-list-item').filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });

        // Bind Button Click (New Iframe Popup)
        this.body.find('#btn-new-dailywork').on('click', () => this.open_dailywork_dialog(null));
    }

    // --- NEW METHOD: Iframe Dialog (Same as Element/Dashboard) ---
    open_dailywork_dialog(doc_name = null) {
        // تحديد المسار بناءً على ما إذا كان إضافة أو تعديل
        const url = doc_name 
            ? `/app/qyass_emp_dailywork/${encodeURIComponent(doc_name)}` 
            : `/app/qyass_emp_dailywork/new-qyass_emp_dailywork`; 

        const title = doc_name ? `تعديل التقرير: ${doc_name}` : 'تسجيل إنجاز يومي جديد';

        let d = new frappe.ui.Dialog({
            title: title,
            size: 'extra-large',
            fields: [{ fieldname: 'iframe_html', fieldtype: 'HTML' }]
        });

        d.$wrapper.addClass('native-form-dialog');

        d.fields_dict.iframe_html.$wrapper.html(`
            <div id="iframe-loader" class="text-center p-5" style="color: #0ea5e9; height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <i class="fa fa-circle-notch fa-spin fa-3x mb-3"></i>
                <h4 style="font-family: 'Tajawal'">جاري تحميل واجهة النظام الأساسية...</h4>
            </div>
            <iframe id="frappe-native-iframe" src="${url}" style="width: 100%; height: 80vh; border: none; display: none; border-radius: 8px;"></iframe>
        `);

        d.show();

        const iframe = d.$wrapper.find('#frappe-native-iframe');
        const loader = d.$wrapper.find('#iframe-loader');

        iframe.on('load', function() {
            try {
                let iframeContents = $(this).contents();

                const hideFrappeUIStyle = `
                    <style>
                        /* إخفاء القوائم العلوية والجانبية */
                        header.navbar, .layout-side-section { display: none !important; }
                        
                        /* إزالة مساحة الهيدر الافتراضية للسيستم */
                        body { padding-top: 0 !important; --navbar-height: 0px !important; }
                        
                        /* قص مسافة من الأعلى */
                        .main-section { margin-top: -100px !important; }
                        
                        /* تعديلات المظهر الداخلي */
                        .page-head { padding: 15px 20px !important; border-bottom: 1px solid #eee !important; background: #fff; }
                        .layout-main-section-wrapper { grid-template-columns: 1fr !important; padding-top: 0px !important; }
                        .layout-main-section { border: none !important; }
                        .page-container { padding-top: 0 !important; background-color: #fff !important; }
                    </style>
                `;
                
                iframeContents.find('head').append(hideFrappeUIStyle);

                loader.hide();
                $(this).fadeIn(200); 

            } catch (e) {
                console.error("Iframe Error:", e);
                loader.hide();
                $(this).fadeIn(200);
            }
        });

        // عند إغلاق النافذة، قم بتحديث القائمة
        d.onhide = () => {
            this.fetch_data();
        };
    }

    fetch_data() {
        frappe.db.get_list('Qyass_emp_dailywork', {
            fields: ['name', 'employee', 'department', 'trans_date', 'element', 'completed'],
            limit: 200,
            order_by: 'trans_date desc'
        }).then(data => {
            this.render_list(data);
        }).catch(err => {
            console.error(err);
            this.body.find('#task-list-wrapper').html(`
                <div class="alert alert-danger">خطأ: ${err.message}</div>
            `);
        });
    }

    render_list(data) {
        const container = this.body.find('#task-list-wrapper');
        const statCount = this.body.find('#stat-count');
        const statCompleted = this.body.find('#stat-completed');
        const listBadge = this.body.find('#list-badge');
        
        container.empty();

        const count = data.length;
        const completedCount = data.filter(item => item.completed).length;

        statCount.text(count);
        statCompleted.text(completedCount);
        listBadge.text(count);

        if (count === 0) {
            container.html(`
                <div class="empty-state glass-card">
                    <i class="fa fa-calendar-times" style="font-size:3rem; opacity:0.3; margin-bottom:15px"></i>
                    <h3>لا توجد تقارير</h3>
                    <p>ابدأ بتسجيل مهامك اليومية</p>
                </div>
            `);
            return;
        }

        data.forEach((item, index) => {
            const delay = Math.min(index * 50, 1000);
            
            const employee = item.employee || 'موظف غير محدد';
            const department = item.department || 'عام';
            const element = item.element || 'بدون معيار';
            const date = item.trans_date ? frappe.datetime.str_to_user(item.trans_date) : '';
            
            const isCompleted = item.completed;
            const statusClass = isCompleted ? 'status-success' : 'status-pending';
            const statusText = isCompleted ? 'تم الإنجاز' : 'قيد العمل';
            const iconClass = isCompleted ? 'fa-check' : 'fa-hourglass-half';

            // إزالة onclick="location.href=..." وربط النقر برمجياً لفتح النافذة
            const card = $(`
                <div class="modern-list-item glass-card" style="animation-delay: ${delay}ms; cursor: pointer;">
                    <div class="item-left">
                        <div class="item-icon-box ${isCompleted ? 'bg-green' : 'bg-blue'}">
                            <i class="fa ${isCompleted ? 'fa-check' : 'fa-user'}"></i>
                        </div>
                        <div class="item-info">
                            <h3 class="item-title">${employee}</h3>
                            <div class="item-meta">
                                <span class="meta-tag dept-tag">
                                    <i class="fa fa-building"></i> ${department}
                                </span>
                                <span class="meta-tag date-tag">
                                    <i class="fa fa-clock"></i> ${date}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-center">
                        <div class="element-info">
                            <span class="element-label">المعيار المرتبط</span>
                            <span class="element-val"><i class="fa fa-link"></i> ${element}</span>
                        </div>
                    </div>

                    <div class="item-right">
                        <div class="status-box">
                            <span class="status-badge ${statusClass}">
                                <i class="fa ${iconClass}"></i> ${statusText}
                            </span>
                        </div>
                        <div class="btn-arrow">
                            <i class="fa fa-chevron-left"></i>
                        </div>
                    </div>
                </div>
            `);

            // ربط الحدث هنا
            card.on('click', () => {
                this.open_dailywork_dialog(item.name);
            });

            container.append(card);
        });
    }

    setup_styles() {
        if ($('#qyass-daily-css').length) return;

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

            /* Animations */
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.5; }
            .shape-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; right: -5%; width: 600px; height: 600px; background: #22d3ee; }

            .dashboard-container { position: relative; z-index: 2; max-width: 1000px; margin: 0 auto; padding: 20px; }

            /* Header */
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 30px; background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.5);
            }
            .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: #0369a1; }
            .brand-icon { width: 35px; height: 35px; background: #0369a1; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .action-btn { background: white; border: 1px solid #e0f2fe; color: #0369a1; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-family: 'Tajawal'; font-weight: 600; display:flex; align-items:center; gap:5px; transition: 0.2s;}
            .action-btn:hover { background: #0369a1; color: white; }

            /* Hero */
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

            /* List */
            .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
            .section-header h2 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #0f172a; }
            .badge-pill { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-weight: 700; }

            .search-box {
                display: flex; align-items: center; gap: 10px; padding: 12px 20px; margin-bottom: 20px;
                background: rgba(255,255,255,0.8); border-radius: 12px; border: 1px solid rgba(255,255,255,0.9);
            }
            .search-box input { border: none; background: transparent; width: 100%; outline: none; font-family: 'Tajawal'; color: #0c4a6e; }

            .list-grid { display: flex; flex-direction: column; gap: 12px; }
            
            .modern-list-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 20px; cursor: pointer; transition: transform 0.2s, background 0.2s;
                opacity: 0; animation: slideUp 0.4s ease forwards;
            }
            .modern-list-item:hover { transform: translateX(-5px); background: white; border-color: #0369a1; }
            @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

            .item-left { display: flex; align-items: center; gap: 20px; flex: 2; }
            .item-icon-box {
                width: 50px; height: 50px; color: white; 
                border-radius: 14px; display: flex; align-items: center; justify-content: center;
                font-size: 1.2rem; flex-shrink: 0;
            }
            .bg-blue { background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); }
            .bg-green { background: linear-gradient(135deg, #15803d 0%, #22c55e 100%); }

            .item-info { flex: 1; min-width: 0; }
            .item-title { font-size: 1.1rem; margin: 0 0 5px 0; color: #0f172a; font-weight: 700; }
            
            .meta-tag { font-size: 0.8rem; padding: 3px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; }
            .dept-tag { background: #f1f5f9; color: #64748b; }
            .date-tag { background: #fff7ed; color: #c2410c; }

            .item-center { flex: 2; padding: 0 15px; }
            .element-info { display: flex; flex-direction: column; }
            .element-label { font-size: 0.7rem; color: #94a3b8; }
            .element-val { font-size: 0.9rem; color: #0369a1; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }

            .item-right { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
            
            .status-badge { font-size: 0.75rem; padding: 5px 15px; border-radius: 20px; font-weight: 700; display: flex; align-items: center; gap: 5px; }
            .status-pending { background: #f1f5f9; color: #64748b; }
            .status-success { background: #dcfce7; color: #166534; }

            .btn-arrow { width: 32px; height: 32px; border-radius: 50%; background: #f8fafc; color: #cbd5e1; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .modern-list-item:hover .btn-arrow { background: #e0f2fe; color: #0369a1; }
            
            .empty-state { text-align: center; padding: 40px; }

            /* --- NATIVE IFRAME DIALOG STYLES --- */
            .modal-backdrop.show {
                backdrop-filter: blur(8px) !important;
                -webkit-backdrop-filter: blur(8px) !important;
                background-color: rgba(15, 23, 42, 0.6) !important;
            }

            .native-form-dialog .modal-dialog { 
                max-width: 85vw !important;
                width: 85vw !important;
                margin: 5vh auto !important;
            }
            
            .native-form-dialog .modal-content {
                font-family: 'Tajawal', sans-serif !important;
                border-radius: 12px !important;
                border: none;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
                overflow: hidden;
            }
            
            .native-form-dialog .modal-body {
                padding: 0 !important; 
                background: #f3f4f6;
            }

            .native-form-dialog .modal-footer {
                display: none !important;
            }

            @media (max-width: 900px) {
                .native-form-dialog .modal-dialog {
                    max-width: 98vw !important;
                    width: 98vw !important;
                    margin: 1vh auto !important;
                }
                .modern-list-item { flex-direction: column; align-items: flex-start; gap: 15px; }
                .item-center { padding: 0; width: 100%; }
                .item-right { width: 100%; justify-content: space-between; }
                .hero-section { justify-content: center; text-align: center; }
                .hero-stats { width: 100%; justify-content: center; }
            }
        `;

        $('<style id="qyass-daily-css">').text(css).appendTo('head');
    }
}