frappe.pages['meetings'].on_page_load = function(wrapper) {
    console.log("--- Project Meeting Dashboard: Initializing (High Performance iframe Modal) ---");

    // 1. Create the standard page structure
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'اجتماعات المشاريع (Project Meetings)',
        single_column: true
    });

    // 2. Hide default Header for Full Screen mode
    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    // 3. Initialize the Dashboard
    new ProjectMeetingDashboard(wrapper, page);
};

class ProjectMeetingDashboard {
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
            #page-meetings { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header { display: none !important; }
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
                    <!-- Hero Section -->
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>لوحة اجتماعات المشاريع</h1>
                            <p>إدارة وتتبع جداول الاجتماعات وحالة التنفيذ بمرونة عالية.</p>
                            <button class="hero-btn" id="btn-new-meeting">
                                <i class="fa fa-plus-circle"></i> اجتماع جديد
                            </button>
                        </div>
                        
                        <!-- Stats -->
                        <div class="hero-stats">
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-users"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-count">0</span>
                                    <span class="stat-desc">إجمالي الاجتماعات</span>
                                </div>
                            </div>
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-check-circle"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-done">0</span>
                                    <span class="stat-desc">اجتماعات منجزة</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- List Area -->
                    <div class="list-section">
                        <div class="section-header">
                            <h2>سجل الاجتماعات</h2>
                            <span class="badge-pill" id="list-badge">0</span>
                        </div>

                        <!-- Search Box -->
                        <div class="search-box glass-card">
                            <i class="fa fa-search"></i>
                            <input type="text" id="meeting-search" placeholder="بحث بعنوان الاجتماع، التاريخ، الحالة أو المكان...">
                        </div>

                        <div id="meeting-list-wrapper" class="list-grid">
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

        // Bind Search Event
        let searchTimeout;
        layout.find('#meeting-search').on('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const value = e.target.value.toLowerCase();
                this.wrapper.find('.modern-list-item').each(function() {
                    const text = $(this).attr('data-search-text');
                    $(this).toggle(text.indexOf(value) > -1);
                });
            }, 250); 
        });

        // Bind New Meeting Button
        this.body.find('#btn-new-meeting').on('click', () => this.open_meeting_dialog(null));

        // Bind Click on List Item
        this.body.find('#meeting-list-wrapper').on('click', '.modern-list-item', (e) => {
            const docName = $(e.currentTarget).attr('data-name');
            this.open_meeting_dialog(docName);
        });
    }

    // --- NEW METHOD: Open Native Form in iFrame ---
    open_meeting_dialog(doc_name = null) {
        // Build routing URL
        const doctype_uri = 'project-meeting-2024';
        const url = doc_name 
            ? `/app/${doctype_uri}/${encodeURIComponent(doc_name)}` 
            : `/app/${doctype_uri}/new-${doctype_uri}`; 

        const title = doc_name ? `تعديل الاجتماع: ${doc_name}` : 'جدولة اجتماع مشروع جديد';

        let d = new frappe.ui.Dialog({
            title: title,
            size: 'extra-large',
            fields: [{ fieldname: 'iframe_html', fieldtype: 'HTML' }]
        });

        // Add class to apply kiosk modal styling
        d.$wrapper.addClass('native-form-dialog');

        // Setup iFrame structure
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

        // Modify iframe content after loading
        iframe.on('load', function() {
            try {
                let iframeContents = $(this).contents();

                const hideFrappeUIStyle = `
                    <style>
                        /* إخفاء القوائم العلوية والجانبية */
                        header.navbar, .layout-side-section { display: none !important; }
                        
                        /* إزالة مساحة الهيدر الافتراضية للسيستم */
                        body { padding-top: 0 !important; --navbar-height: 0px !important; }
                        
                        /* سحب المحتوى للأعلى لإخفاء المساحات الفارغة */
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

        // Refresh Data on close
        d.onhide = () => {
            this.fetch_data();
        };
    }

    fetch_data() {
        // Fetch values matching the updated Document JSON schema
        frappe.db.get_list('Project Meeting 2024', {
            fields: ['name', 'meeting_title', 'meeting_date', 'status', 'location', 'meeting_done'],
            limit: 500,
            order_by: 'meeting_date desc'
        }).then(data => {
            this.render_list(data);
        }).catch(err => {
            console.error(err);
            this.body.find('#meeting-list-wrapper').html(`
                <div class="alert alert-danger">خطأ في جلب البيانات: ${err.message}</div>
            `);
        });
    }

    render_list(data) {
        const container = this.body.find('#meeting-list-wrapper');
        const statCount = this.body.find('#stat-count');
        const statDone = this.body.find('#stat-done');
        const listBadge = this.body.find('#list-badge');
        
        const count = data.length;
        const doneCount = data.filter(item => item.meeting_done).length;
        
        statCount.text(count);
        statDone.text(doneCount);
        listBadge.text(count);

        if (count === 0) {
            container.html(`
                <div class="empty-state glass-card text-center p-5">
                    <i class="fa fa-calendar-times" style="font-size:3rem; opacity:0.3; margin-bottom:15px"></i>
                    <h3>لا توجد اجتماعات مسجلة</h3>
                    <p>ابدأ بجدولة الاجتماع الأول من خلال زر (اجتماع جديد)</p>
                </div>
            `);
            return;
        }

        let htmlBuilder = [];

        data.forEach((item, index) => {
            const delay = index < 15 ? (index * 30) : 0;
            const animClass = index < 15 ? 'animate-up' : '';
            
            const title = item.meeting_title || item.name;
            const date = item.meeting_date ? frappe.datetime.str_to_user(item.meeting_date) : 'غير محدد';
            const status = item.status || 'مسودة';
            const location = item.location || 'غير محدد';
            
            // Search string
            const searchText = `${title} ${date} ${status} ${location}`.toLowerCase();

            // Status Styling mapped to JSON arabic options
            let statusClass = 'status-default';
            if (status === 'دعوة الاجتماع') statusClass = 'status-info'; // Blue
            else if (status === 'قبل الاجتماع') statusClass = 'status-warning'; // Orange
            else if (status === 'بعد الاجتماع' || item.meeting_done) statusClass = 'status-success'; // Green
            else if (status === 'طباعة المحضر') statusClass = 'status-primary'; // Purple

            htmlBuilder.push(`
                <div class="modern-list-item glass-card ${animClass}" 
                     style="animation-delay: ${delay}ms"
                     data-name="${item.name}" data-search-text="${searchText}">
                    
                    <div class="item-left">
                        <div class="item-icon-box">
                            <span style="font-size: 1.2rem;">${moment(item.meeting_date).format('DD')}</span>
                        </div>
                        <div class="item-info">
                            <h3 class="item-title">${title}</h3>
                            <div class="item-meta">
                                <span class="meta-tag date-tag">
                                    <i class="fa fa-calendar-alt"></i> ${date}
                                </span>
                                <span class="meta-tag location-tag">
                                    <i class="fa fa-map-marker-alt"></i> ${location}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-right">
                        <div class="status-box">
                            <span class="status-badge ${statusClass}">${status}</span>
                        </div>
                        <div class="btn-arrow" title="فتح أو تعديل">
                            <i class="fa fa-external-link-alt"></i>
                        </div>
                    </div>
                </div>
            `);
        });

        container.html(htmlBuilder.join(''));
    }

    setup_styles() {
        if ($('#qyass-meeting-theme-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
            .page-body { max-width:100vw !important; }
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
            
            /* --- UPDATED MAX WIDTH (Matching Element Style) --- */
            .dashboard-container { position: relative; z-index: 2; max-width: 1100px; margin: 0 auto; padding: 20px; }
            
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 30px; background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.5);
            }
            .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: #0369a1; }
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
                background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-radius: 16px;
            }
            .stat-card { display: flex; align-items: center; gap: 15px; padding: 15px 25px; min-width: 180px; }
            .stat-icon { width: 45px; height: 45px; background: rgba(14, 165, 233, 0.1); color: #0369a1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
            .stat-num { font-size: 1.5rem; font-weight: 800; line-height: 1; }
            .stat-desc { font-size: 0.8rem; color: #64748b; }

            .list-section { margin-top: 20px; }
            .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
            .section-header h2 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #0f172a; }
            .badge-pill { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-weight: 700; }

            .search-box {
                display: flex; align-items: center; gap: 10px; padding: 12px 20px; margin-bottom: 20px;
                background: rgba(255,255,255,0.9); border-radius: 12px; border: 1px solid rgba(255,255,255,1);
            }
            .search-box input { border: none; background: transparent; width: 100%; outline: none; font-family: 'Tajawal'; color: #0c4a6e; }

            .list-grid { display: flex; flex-direction: column; gap: 12px; }
            
            .modern-list-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 20px; cursor: pointer; transition: transform 0.2s, background 0.2s;
                content-visibility: auto; 
                contain-intrinsic-size: 80px;
            }
            .modern-list-item.animate-up {
                opacity: 0; animation: slideUp 0.4s ease forwards;
            }
            
            .modern-list-item:hover { transform: translateX(-5px); background: #ffffff; border-color: #0ea5e9; }
            @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

            .item-left { display: flex; align-items: center; gap: 20px; flex: 1; }
            .item-icon-box {
                width: 45px; height: 45px; background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;
            }
            .item-info { flex: 1; min-width: 0; }
            .item-title { font-size: 1.1rem; margin: 0 0 5px 0; color: #0f172a; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            
            .item-meta { display: flex; gap: 10px; flex-wrap: wrap; }
            .meta-tag { font-size: 0.8rem; padding: 2px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
            .date-tag { background: #fff7ed; color: #c2410c; }
            .location-tag { background: #f1f5f9; color: #64748b; }

            .item-right { display: flex; align-items: center; gap: 25px; flex-shrink: 0; }
            .status-badge { font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; font-weight: 700; display: inline-block; }
            .status-default { background: #f1f5f9; color: #64748b; }
            .status-info { background: #eff6ff; color: #3b82f6; } /* Invited */
            .status-warning { background: #fef3c7; color: #d97706; } /* Before */
            .status-success { background: #dcfce7; color: #166534; } /* Done / After */
            .status-primary { background: #e0e7ff; color: #4f46e5; } /* Print */
            
            .btn-arrow { width: 35px; height: 35px; border-radius: 8px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 1.1rem; }
            .modern-list-item:hover .btn-arrow { background: #e0f2fe; color: #0369a1; }

            /* --- NATIVE IFRAME DIALOG STYLES (From Elements Page) --- */
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
                .item-right { width: 100%; justify-content: space-between; }
                .hero-section { justify-content: center; text-align: center; }
                .hero-stats { width: 100%; flex-wrap: wrap; }
                .stat-card { flex: 1; }
            }
        `;

        $('<style id="qyass-meeting-theme-css">').text(css).appendTo('head');
    }
}