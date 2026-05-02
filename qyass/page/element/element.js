frappe.pages['element'].on_page_load = function(wrapper) {
    console.log("--- Qyass Elements: Initializing (High Performance) ---");

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'المعايير (Elements)',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    new QyassElementsDashboard(wrapper, page);
};

class QyassElementsDashboard {
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
            #page-element{ margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header{ display: none !important; }
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
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>لوحة قياس المعايير</h1>
                            <p>متابعة نسب الإنجاز وحالة تنفيذ معايير الاستراتيجية.</p>
                            <button class="hero-btn" id="btn-new-element">
                                <i class="fa fa-plus-circle"></i> إضافة عنصر جديد
                            </button>
                        </div>
                        
                        <div class="hero-stats">
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-list-ul"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-count">0</span>
                                    <span class="stat-desc">إجمالي المعايير</span>
                                </div>
                            </div>
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-chart-pie"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-progress">0%</span>
                                    <span class="stat-desc">متوسط الإنجاز</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="list-section">
                        <div class="section-header">
                            <h2>سجل المعايير</h2>
                            <span class="badge-pill" id="list-badge">0</span>
                        </div>

                        <div class="search-box glass-card">
                            <i class="fa fa-search"></i>
                            <input type="text" id="element-search" placeholder="بحث باسم العنصر، الرقم، أو الحالة...">
                        </div>

                        <div id="element-list-wrapper" class="list-grid">
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

        let searchTimeout;
        layout.find('#element-search').on('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const value = e.target.value.toLowerCase();
                this.wrapper.find('.modern-list-item').each(function() {
                    const text = $(this).attr('data-search-text');
                    $(this).toggle(text.indexOf(value) > -1);
                });
            }, 250); 
        });

        this.body.find('#btn-new-element').on('click', () => this.open_element_dialog(null));
        
        this.body.find('#element-list-wrapper').on('click', '.modern-list-item', (e) => {
            const docName = $(e.currentTarget).attr('data-name');
            this.open_element_dialog(docName);
        });
    }

    open_element_dialog(doc_name = null) {
        const url = doc_name 
            ? `/app/elements-2024/${encodeURIComponent(doc_name)}` 
            : `/app/elements-2024/new-elements-2024`; 

        const title = doc_name ? `تعديل العنصر: ${doc_name}` : 'إضافة عنصر جديد';

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
                        
                        /* 🟢 قص 100 بيكسل من الأعلى كما طلبت عن طريق السحب للأعلى 🟢 */
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

        d.onhide = () => {
            this.fetch_data();
        };
    }

    fetch_data() {
        frappe.db.get_list('Elements-2024', {
            fields: [
                'name', 'element', 'number', 'custom_status', 
                'complete_percent', 'expected_end_date', 'department'
            ],
            limit: 500
        }).then(data => {
            // الترتيب المنطقي للأرقام (1.1, 1.2, 1.10, 2.1) بدلاً من الترتيب الأبجدي العادي
            data.sort((a, b) => {
                const numA = (a.number || "").toString();
                const numB = (b.number || "").toString();
                return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
            });

            this.render_list(data);
        }).catch(err => {
            console.error(err);
            this.body.find('#element-list-wrapper').html(`
                <div class="alert alert-danger">خطأ في جلب البيانات: ${err.message}</div>
            `);
        });
    }

    render_list(data) {
        const container = this.body.find('#element-list-wrapper');
        const statCount = this.body.find('#stat-count');
        const statProgress = this.body.find('#stat-progress');
        const listBadge = this.body.find('#list-badge');
        
        const count = data.length;
        const totalProgress = data.reduce((acc, item) => acc + (parseFloat(item.complete_percent) || 0), 0);
        const avgProgress = count > 0 ? (totalProgress / count).toFixed(1) : 0;

        statCount.text(count);
        statProgress.text(avgProgress + '%');
        listBadge.text(count);

        if (count === 0) {
            container.html(`
                <div class="empty-state glass-card text-center p-5">
                    <i class="fa fa-tasks" style="font-size:3rem; opacity:0.3; margin-bottom:15px"></i>
                    <h3>لا توجد معايير</h3>
                    <p>انقر على "إضافة عنصر جديد" للبدء</p>
                </div>
            `);
            return;
        }

        let htmlBuilder = [];

        data.forEach((item, index) => {
            const title = item.element || 'بدون عنوان';
            const number = item.number || '#';
            const status = item.custom_status || 'لم يبدأ';
            const department = item.department || 'عام';
            const progress = parseFloat(item.complete_percent) || 0;
            const date = item.expected_end_date ? frappe.datetime.str_to_user(item.expected_end_date) : 'غير محدد';
            
            const searchText = `${title} ${number} ${status} ${department}`.toLowerCase();
            
            let statusClass = 'status-default';
            if(status.includes('جودة') || status.includes('Quality')) statusClass = 'status-info';
            else if(status.includes('اعتماد') || status.includes('Completed')) statusClass = 'status-success';
            else if(status.includes('اجراء') || status.includes('Progress')) statusClass = 'status-warning';

            const delay = index < 15 ? (index * 30) : 0;
            const animClass = index < 15 ? 'animate-up' : '';

            htmlBuilder.push(`
                <div class="modern-list-item glass-card ${animClass}" style="animation-delay: ${delay}ms" 
                     data-name="${item.name}" data-search-text="${searchText}">
                    <div class="item-left">
                        <div class="item-icon-box">
                            <span>${number}</span>
                        </div>
                        <div class="item-info">
                            <h3 class="item-title">${title}</h3>
                            <div class="item-meta">
                                <span class="meta-tag department-tag">
                                    <i class="fa fa-building"></i> ${department}
                                </span>
                                <span class="meta-tag date-tag">
                                    <i class="fa fa-calendar-alt"></i> ${date}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="item-right">
                        <div class="status-box">
                            <span class="status-badge ${statusClass}">${status}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-labels">
                                <span>الإنجاز</span>
                                <span>${progress}%</span>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill ${statusClass}" style="width: ${Math.min(progress, 100)}%"></div>
                            </div>
                        </div>
                        <div class="btn-arrow" title="فتح واجهة السجل">
                            <i class="fa fa-external-link-alt"></i>
                        </div>
                    </div>
                </div>
            `);
        });

        container.html(htmlBuilder.join(''));
    }

    setup_styles() {
        if ($('#qyass-elements-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
            
            .page-body { max-width:100vw !important; }
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
            .shape-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; right: -5%; width: 600px; height: 600px; background: #22d3ee; }
            .dashboard-container { position: relative; z-index: 2; max-width: 1100px; margin: 0 auto; padding: 20px; }
            
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
            
            .hero-section { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin: 30px 0; gap: 20px; }
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
                color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 1rem; flex-shrink: 0;
            }
            .item-info { flex: 1; min-width: 0; }
            .item-title { font-size: 1.1rem; margin: 0 0 5px 0; color: #0f172a; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .item-meta { display: flex; gap: 10px; flex-wrap: wrap; }
            .meta-tag { font-size: 0.8rem; padding: 2px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
            .department-tag { background: #f1f5f9; color: #64748b; }
            .date-tag { background: #fff7ed; color: #c2410c; }
            
            .item-right { display: flex; align-items: center; gap: 25px; flex-shrink: 0; }
            .status-badge { font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; font-weight: 700; }
            .status-default { background: #f1f5f9; color: #64748b; }
            .status-info { background: #e0f2fe; color: #0369a1; }
            .status-success { background: #dcfce7; color: #166534; }
            .status-warning { background: #fef9c3; color: #854d0e; }
            
            .progress-container { width: 120px; }
            .progress-labels { display: flex; justify-content: space-between; font-size: 0.7rem; color: #64748b; margin-bottom: 3px; }
            .progress-track { width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
            .progress-fill { height: 100%; background: #0ea5e9; border-radius: 3px; }
            .progress-fill.status-success { background: #22c55e; }
            .progress-fill.status-warning { background: #eab308; }
            
            .btn-arrow { width: 35px; height: 35px; border-radius: 8px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 1.1rem; }
            .modern-list-item:hover .btn-arrow { background: #e0f2fe; color: #0369a1; }

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
                .item-right { width: 100%; justify-content: space-between; }
                .progress-container { width: 100%; flex: 1; margin: 0 15px; }
            }
        `;

        $('<style id="qyass-elements-css">').text(css).appendTo('head');
    }
}