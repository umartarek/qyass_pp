frappe.pages['sections'].on_page_load = function(wrapper) {
    console.log("--- Qyass Sections: Initializing Full Operations ---");

    // 1. إنشاء الهيكل الأساسي للصفحة
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'الأقسام (Sections)',
        single_column: true
    });

    // 2. إخفاء العناصر الافتراضية
    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    // 3. تشغيل واجهة الأقسام
    new QyassSectionDashboard(wrapper, page);
};

class QyassSectionDashboard {
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
            .page-wrapper { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
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
				#page-sections{padding-top:0 !important;}
            .page-container {
                background-color: #f0f9ff !important; 
                margin: 0 !important;
                padding: 0 !important;
                padding-top: 0px !important;
                width: 100% !important; 
                max-width: 100% !important;
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
                            <h1>دليل الأقسام</h1>
                            <p>إدارة واستعراض الأقسام وربطها بالإدارات والوكالات.</p>
                            <button class="hero-btn" id="btn-new-section">
                                <i class="fa fa-plus-circle"></i> إضافة قسم جديد
                            </button>
                        </div>
                        
                        <!-- Stats -->
                        <div class="hero-stats">
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-puzzle-piece"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-count">...</span>
                                    <span class="stat-desc">قسم مسجل</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- List Area -->
                    <div class="list-section">
                        <div class="section-header">
                            <h2>الأقسام المسجلة</h2>
                            <span class="badge-pill" id="list-badge">0</span>
                        </div>

                        <!-- Search Box -->
                        <div class="search-box glass-card">
                            <i class="fa fa-search"></i>
                            <input type="text" id="section-search" placeholder="بحث عن قسم، إدارة، أو وكالة...">
                        </div>

                        <div id="section-list-wrapper" class="list-grid">
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

        // Client-side Search
        layout.find('#section-search').on('keyup', (e) => {
            const value = e.target.value.toLowerCase();
            this.wrapper.find('.modern-list-item').filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });

        // Open Create Dialog
        this.body.find('#btn-new-section').on('click', () => this.open_create_dialog());
    }

    // ==========================================
    // 1. DATA ENTRY (CREATE)
    // ==========================================
    open_create_dialog() {
        let d = new frappe.ui.Dialog({
            title: 'إضافة قسم جديد',
            fields: [
                { label: 'الوكالة', fieldname: 'الوكالة', fieldtype: 'Link', options: 'Agency', reqd: 1 },
                { label: 'الإدارة العليا', fieldname: 'الادارة_العليا', fieldtype: 'Link', options: 'Top Management', reqd: 1 },
                { label: 'الإدارة', fieldname: 'department', fieldtype: 'Link', options: 'Department', reqd: 1 },
                { fieldtype: 'Section Break' },
                { label: 'اسم القسم', fieldname: 'section', fieldtype: 'Data', reqd: 1, placeholder: 'أدخل اسم القسم هنا' }
            ],
            primary_action_label: 'حفظ القسم',
            primary_action: (values) => {
                frappe.call({
                    method: 'frappe.client.insert',
                    args: { 
                        doc: { 
                            doctype: 'Section', 
                            section: values.section,
                            'الوكالة': values['الوكالة'],
                            'الادارة_العليا': values['الادارة_العليا'],
                            department: values.department
                        } 
                    },
                    freeze: true,
                    freeze_message: 'جاري الحفظ...',
                    callback: (r) => {
                        if (!r.exc) {
                            d.hide();
                            frappe.show_alert({ message: `تم إضافة القسم: ${r.message.section}`, indicator: 'green' }, 3);
                            this.fetch_data();
                        }
                    }
                });
            }
        });

        // Dynamic Query Filters for Creation Dialog
        d.fields_dict['الادارة_العليا'].get_query = function() {
            return { filters: { "agency": d.get_value("الوكالة") } };
        };
        d.fields_dict['department'].get_query = function() {
            return { filters: { "top_management": d.get_value("الادارة_العليا") } };
        };

        this.apply_dialog_theme(d, 'fa-plus');
        d.show();
    }

    // ==========================================
    // 2. DATA EDIT (UPDATE)
    // ==========================================
    open_edit_dialog(doc) {
        let d = new frappe.ui.Dialog({
            title: 'تعديل بيانات القسم',
            fields: [
                { label: 'الوكالة', fieldname: 'الوكالة', fieldtype: 'Link', options: 'Agency', reqd: 1, default: doc['الوكالة'] },
                { label: 'الإدارة العليا', fieldname: 'الادارة_العليا', fieldtype: 'Link', options: 'Top Management', reqd: 1, default: doc['الادارة_العليا'] },
                { label: 'الإدارة', fieldname: 'department', fieldtype: 'Link', options: 'Department', reqd: 1, default: doc.department },
                { fieldtype: 'Section Break' },
                { label: 'اسم القسم الجديد', fieldname: 'section', fieldtype: 'Data', reqd: 1, default: doc.name }
            ],
            primary_action_label: 'تحديث البيانات',
            primary_action: (values) => {
                // دالة مساعدة لتحديث القيم بعد الانتهاء من تغيير الاسم (إذا لزم الأمر)
                const update_values = (docname) => {
                    frappe.call({
                        method: 'frappe.client.set_value',
                        args: {
                            doctype: 'Section',
                            name: docname,
                            fieldname: {
                                'الوكالة': values['الوكالة'],
                                'الادارة_العليا': values['الادارة_العليا'],
                                'department': values.department
                            }
                        },
                        freeze: true,
                        freeze_message: 'جاري تحديث البيانات...',
                        callback: (r) => {
                            if (!r.exc) {
                                d.hide();
                                frappe.show_alert({ message: `تم التحديث بنجاح`, indicator: 'blue' }, 3);
                                this.fetch_data();
                            }
                        }
                    });
                };

                // إذا تم تغيير اسم القسم، نقوم بعمل Rename أولاً، ثم نحدث باقي الحقول
                if(values.section !== doc.name) {
                    frappe.call({
                        method: 'frappe.rename_doc',
                        args: { doctype: 'Section', old: doc.name, new: values.section, merge: 0 },
                        freeze: true,
                        freeze_message: 'جاري تغيير الاسم...',
                        callback: (r) => {
                            if (!r.exc) update_values(values.section);
                        }
                    });
                } else {
                    update_values(doc.name); // تحديث الحقول فقط بدون تغيير الاسم
                }
            }
        });

        // Dynamic Query Filters for Edit Dialog
        d.fields_dict['الادارة_العليا'].get_query = function() {
            return { filters: { "agency": d.get_value("الوكالة") } };
        };
        d.fields_dict['department'].get_query = function() {
            return { filters: { "top_management": d.get_value("الادارة_العليا") } };
        };

        this.apply_dialog_theme(d, 'fa-pen');
        d.show();
    }

    // ==========================================
    // 3. DATA PREVIEW (READ-ONLY MODAL)
    // ==========================================
    open_preview_dialog(doc) {
        let d = new frappe.ui.Dialog({
            title: 'تفاصيل القسم',
            fields: [
                { label: 'القسم', fieldname: 'section', fieldtype: 'Data', read_only: 1, default: doc.name },
                { label: 'الإدارة', fieldname: 'department', fieldtype: 'Data', read_only: 1, default: doc.department },
                { label: 'الإدارة العليا', fieldname: 'الادارة_العليا', fieldtype: 'Data', read_only: 1, default: doc['الادارة_العليا'] },
                { label: 'الوكالة', fieldname: 'الوكالة', fieldtype: 'Data', read_only: 1, default: doc['الوكالة'] }
            ]
        });
        
        this.apply_dialog_theme(d, 'fa-eye');
        d.show();
        d.$wrapper.find('.modal-footer').hide(); // إخفاء الفوتر لمنع التعديل/الإغلاق بأزرار قياسية
    }

    // ==========================================
    // 4. DELETION
    // ==========================================
    delete_section(section_name) {
        frappe.confirm(`هل أنت متأكد من حذف القسم: <b>${section_name}</b>؟`, () => {
            frappe.call({
                method: 'frappe.client.delete',
                args: { doctype: 'Section', name: section_name },
                freeze: true,
                freeze_message: 'جاري الحذف...',
                callback: (r) => {
                    if (!r.exc) {
                        frappe.show_alert({ message: `تم الحذف بنجاح`, indicator: 'red' }, 3);
                        this.fetch_data();
                    }
                }
            });
        });
    }

    // --- Utility: Apply custom theme to Frappe Dialogs ---
    apply_dialog_theme(dialog, icon_class) {
        dialog.$wrapper.addClass('qyass-theme-dialog');
        dialog.$wrapper.find('.modal-header').prepend(`<div class="dialog-icon"><i class="fa ${icon_class}"></i></div>`);
    }

    // --- Fetch Data ---
    fetch_data() {
        frappe.db.get_list('Section', {
            fields: ['name', 'section', 'department', 'الادارة_العليا', 'الوكالة', 'modified'],
            limit: 500,
            order_by: 'modified desc'
        }).then(data => {
            this.render_list(data);
        }).catch(err => {
            console.error(err);
            this.body.find('#section-list-wrapper').html(`<div class="alert alert-danger">خطأ: ${err.message}</div>`);
        });
    }

    // --- Render List ---
    render_list(data) {
        const container = this.body.find('#section-list-wrapper');
        const statCount = this.body.find('#stat-count');
        const listBadge = this.body.find('#list-badge');
        
        container.empty();

        const count = data.length;
        statCount.text(count);
        listBadge.text(count);

        if (count === 0) {
            container.html(`
                <div class="empty-state glass-card">
                    <i class="fa fa-layer-group" style="font-size:3rem; opacity:0.3; margin-bottom:15px"></i>
                    <h3>لا توجد أقسام</h3>
                    <p>النظام خالي من الأقسام حالياً</p>
                </div>
            `);
            return;
        }

        data.forEach((item, index) => {
            const delay = Math.min(index * 50, 1000);
            const title = item.section || item.name;
            const deptName = item.department || '-';
            const topMngName = item['الادارة_العليا'] || '-';
            const agencyName = item['الوكالة'] || '-';

            const card = $(`
                <div class="modern-list-item glass-card" style="animation-delay: ${delay}ms">
                    <div class="item-left clickable-area">
                        <div class="item-icon-box">
                            <i class="fa fa-puzzle-piece"></i>
                        </div>
                        <div class="item-info">
                            <h3 class="item-title">${title}</h3>
                            <div class="item-meta">
                                <span class="meta-tag" title="الإدارة">
                                    <i class="fa fa-briefcase"></i> ${deptName}
                                </span>
                                <span class="meta-tag" title="الإدارة العليا">
                                    <i class="fa fa-building"></i> ${topMngName}
                                </span>
                                <span class="meta-tag" title="الوكالة">
                                    <i class="fa fa-sitemap"></i> ${agencyName}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-actions">
                        <button class="action-icon-btn btn-view" title="استعراض سريع">
                            <i class="fa fa-eye"></i>
                        </button>
                        <button class="action-icon-btn btn-edit" title="تعديل">
                            <i class="fa fa-pen"></i>
                        </button>
                        <button class="action-icon-btn btn-delete" title="حذف">
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `);

            // Event Listeners for CRUD actions (Passing full item object for context)
            card.find('.item-left, .btn-view').on('click', (e) => {
                e.stopPropagation();
                this.open_preview_dialog(item);
            });

            card.find('.btn-edit').on('click', (e) => {
                e.stopPropagation();
                this.open_edit_dialog(item);
            });

            card.find('.btn-delete').on('click', (e) => {
                e.stopPropagation(); 
                this.delete_section(item.name);
            });

            container.append(card);
        });
    }

    setup_styles() {
        if ($('#qyass-section-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            .modern-dashboard { font-family: 'Tajawal', sans-serif; color: #0c4a6e; min-height: 100vh; background: #f0f9ff; padding-bottom: 50px; position: relative; overflow-x: hidden; }
            .search-box { display: flex; align-items: center; gap: 10px; padding: 12px 20px; margin-bottom: 20px; background: rgba(255,255,255,0.8); border-radius: 12px; border: 1px solid rgba(255,255,255,0.9); }
            .search-box i { color: #0369a1; }
            .search-box input { border: none; background: transparent; width: 100%; outline: none; font-family: 'Tajawal'; font-size: 1rem; color: #0c4a6e; }
            
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.5; }
            .shape-1 { top: -10%; left: -5%; width: 400px; height: 400px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: #22d3ee; }
            
            .dashboard-container { position: relative; z-index: 2; max-width: 900px; margin: 0 auto; padding: 20px; }
            
            .glass-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.5); box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
            .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: #0369a1; }
            .brand-icon { width: 35px; height: 35px; background: #0369a1; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .action-btn { background: white; border: 1px solid #e0f2fe; color: #0369a1; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-family: 'Tajawal'; font-weight: 600; display:flex; align-items:center; gap:5px; transition: 0.2s;}
            .action-btn:hover { background: #0369a1; color: white; }

            .hero-section { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin: 30px 0; gap: 20px; }
            .hero-text h1 { font-size: 2rem; margin: 0 0 10px 0; color: #0f172a; }
            .hero-text p { color: #64748b; font-size: 1.1rem; }
            .hero-btn { background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); color: white; border: none; padding: 10px 25px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 5px 15px rgba(3, 105, 161, 0.3); display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s; }
            .hero-btn:hover { transform: translateY(-2px); }

            .hero-stats { display: flex; gap: 15px; }
            .glass-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.9); box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-radius: 16px; }
            .stat-card { display: flex; align-items: center; gap: 15px; padding: 15px 25px; min-width: 180px; }
            .stat-icon { width: 45px; height: 45px; background: rgba(14, 165, 233, 0.1); color: #0369a1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
            .stat-num { font-size: 1.5rem; font-weight: 800; line-height: 1; }
            .stat-desc { font-size: 0.8rem; color: #64748b; }

            .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
            .section-header h2 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #0f172a; }
            .badge-pill { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-weight: 700; }

            .list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)); gap: 12px; }
            .modern-list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; transition: transform 0.2s, background 0.2s, border-color 0.2s; opacity: 0; animation: slideUp 0.4s ease forwards; }
            .modern-list-item:hover { transform: translateX(-5px); background: white; border-color: #0369a1; }
            @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

            .item-left { display: flex; align-items: center; gap: 15px; flex: 1; cursor: pointer; }
            .item-icon-box { width: 40px; height: 40px; background: #f1f5f9; color: #64748b; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: 0.2s; }
            .modern-list-item:hover .item-icon-box { background: #0369a1; color: white; }
            .item-title { font-size: 1.05rem; margin: 0; color: #0f172a; font-weight: 600; }
            
            .item-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; }
            .meta-tag { font-size: 0.75rem; color: #64748b; background: #e2e8f0; padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px;}

            /* Action Buttons (CRUD) */
            .item-actions { display: flex; gap: 6px; align-items: center; }
            .action-icon-btn { width: 34px; height: 34px; border-radius: 8px; border: none; outline: none; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; background: #f8fafc; color: #94a3b8; }
            .btn-view:hover { background: #e0f2fe; color: #0284c7; }
            .btn-edit:hover { background: #fef3c7; color: #d97706; }
            .btn-delete:hover { background: #fee2e2; color: #dc2626; }
            
            .empty-state { text-align: center; padding: 40px; }

            /* --- CUSTOM DIALOG THEME --- */
            .qyass-theme-dialog .modal-content { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 1); border-radius: 20px; box-shadow: 0 25px 60px rgba(14, 165, 233, 0.2); font-family: 'Tajawal', sans-serif !important; }
            .qyass-theme-dialog .modal-header { border-bottom: 1px solid rgba(0,0,0,0.05); padding: 20px 25px; display: flex; align-items: center; gap: 15px; }
            .qyass-theme-dialog .modal-title { font-weight: 800; color: #0c4a6e; font-size: 1.3rem; }
            .qyass-theme-dialog .dialog-icon { width: 35px; height: 35px; background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .qyass-theme-dialog .modal-body { padding: 25px; background: transparent; }
            .qyass-theme-dialog .form-group label { color: #64748b; font-weight: 600; font-size: 0.9rem; }
            .qyass-theme-dialog .form-control { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 8px 15px; color: #0c4a6e; box-shadow: none; height: 45px; font-weight:500;}
            .qyass-theme-dialog .form-control:focus { background: white; border-color: #0369a1; box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1); }
            .qyass-theme-dialog .modal-footer { border-top: none; padding: 10px 25px 25px; background: transparent; box-shadow: none; }
            .qyass-theme-dialog .btn-primary { background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); border: none; border-radius: 50px; padding: 8px 30px; font-weight: 700; box-shadow: 0 4px 15px rgba(3, 105, 161, 0.3); transition: transform 0.2s; }
            .qyass-theme-dialog .btn-primary:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(3, 105, 161, 0.4); }
            
            @media (max-width: 768px) { .hero-section { text-align: center; justify-content: center; } .hero-stats { width: 100%; justify-content: center; } }
        `;
        $('<style id="qyass-section-css">').text(css).appendTo('head');
    }
}