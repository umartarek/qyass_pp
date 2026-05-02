frappe.pages['department-per'].on_page_load = function(wrapper) {
    console.log("--- Qyass Department Cards: Initializing ---");

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'بطاقات أداء الإدارات',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    new DepartmentCards(wrapper, page);
};

class DepartmentCards {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);
        
        this.current_data = [];
        this.current_elements_docs = {}; // لتخزين بيانات المعايير لتسريع فتح المستوى الثالث
        
        this.setup_styles();
        this.force_full_screen();
        this.render_skeleton();
        this.fetch_data();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-department-per { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
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

                    </div>
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
                        <button class="action-btn" id="btn-export">
                            <i class="fa fa-download"></i> تصدير البيانات
                        </button>
                        <button class="action-btn" onclick="window.history.back()" style="margin-right: 10px;" id="btn-main-back">
                            <i class="fa fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <!-- Level 1: Cards Grid Area (Main View) -->
                    <div id="departments-cards-grid" class="cards-grid">
                        <div class="text-center w-100 p-5 text-muted loading-state" style="grid-column: 1 / -1;">
                            <i class="fa fa-spinner fa-spin fa-3x" style="color: #0284c7;"></i>
                            <h4 class="mt-3 font-weight-bold" style="color: #0c4a6e;">جاري جلب وبناء بطاقات الإدارات...</h4>
                        </div>
                    </div>

                    <!-- Level 2: Drilldown Area (Elements List) -->
                    <div id="drilldown-view" style="display: none;">
                        <div class="drilldown-header glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="drilldown-title" class="m-0 text-blue-dark font-weight-bold">معايير الإدارة</h3>
                                <p class="m-0 mt-2 text-blue-muted">تفاصيل المعايير الخاصة بهذه الإدارة</p>
                            </div>
                            <button class="action-btn btn-close-drilldown">
                                <i class="fa fa-times"></i> إغلاق وعودة للبطاقات
                            </button>
                        </div>
                        <div id="drilldown-content" class="drilldown-grid"></div>
                    </div>

                    <!-- Level 3: Element Details Area (Requirements & Documents) -->
                    <div id="element-details-view" style="display: none;">
                        <div class="drilldown-header glass-card mb-4 p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h3 id="element-details-title" class="m-0 text-blue-dark font-weight-bold">تفاصيل المعيار</h3>
                                <p class="m-0 mt-2 text-blue-muted">المتطلبات ومستندات الإثبات مع حالة الاكتمال</p>
                            </div>
                            <button class="action-btn btn-close-element-details">
                                <i class="fa fa-arrow-right"></i> رجوع للمعايير
                            </button>
                        </div>
                        <div id="element-details-content"></div>
                    </div>
                </div>
            </div>
        `);

        this.body.html(layout);
        this.body.find('#btn-export').on('click', () => this.export_to_csv());
        this.body.find('.btn-close-drilldown').on('click', () => this.hide_drilldown());
        this.body.find('.btn-close-element-details').on('click', () => this.hide_element_details());
    }

    fetch_data() {
        // جلب الإحصائيات العامة للبطاقات الخارجية (Level 1)
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: [
                    'department',
                    'count(name) as elements_count',
                    'sum(proof_count) as total_docs',
                    'sum(completed_count) as completed_docs',
                    'sum(reviewed_count) as reviewed_docs'
                ],
                group_by: 'department',
                filters: [['Elements-2024', 'department', '!=', '']], 
                limit_page_length: 5000 
            },
            callback: (r) => {
                let data = r.message || [];
                this.process_and_render_cards(data);
            }
        });
    }

    process_and_render_cards(raw_data) {
        const grid = this.body.find('#departments-cards-grid');
        grid.empty();
        
        if (!raw_data || raw_data.length === 0) {
            grid.html(`
                <div class="text-center w-100 p-5 glass-card" style="grid-column: 1 / -1; color: #64748b;">
                    <i class="fa fa-folder-open fa-3x mb-3" style="opacity:0.3; color: #0284c7;"></i>
                    <h4>لا توجد بيانات مسجلة للإدارات</h4>
                </div>
            `);
            return;
        }

        this.current_data = raw_data.map(item => {
            let elements = parseInt(item.elements_count) || 0;
            let total = parseFloat(item.total_docs) || 0;
            let completed = parseFloat(item.completed_docs) || 0;
            let reviewed = parseFloat(item.reviewed_docs) || 0;
            let percent = total > 0 ? Math.floor((reviewed / total) * 100) : 0;

            return { department: item.department, elements, total, completed, reviewed, percent };
        });

        this.current_data.sort((a, b) => b.percent - a.percent);

        this.current_data.forEach((item, index) => {
            let delay = index * 50; 
            let badgeClass = item.percent >= 100 ? 'badge-solid' : 'badge-light';
            let badgeText = item.percent >= 100 ? 'مكتمل 100%' : 'قيد الإنجاز';

            let card = $(`
                <div class="department-card glass-card fade-in-up clickable-card" style="animation-delay: ${delay}ms;">
                    <div class="card-header-area">
                        <div class="avatar"><i class="fa fa-sitemap"></i></div>
                        <div class="title-area">
                            <h3 class="department-name" title="${item.department}">${item.department}</h3>
                            <span class="status-badge ${badgeClass}">${badgeText}</span>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-box">
                            <span class="val text-blue-dark">${item.elements}</span>
                            <span class="lbl"><i class="fa fa-cube mr-1"></i> المعايير</span>
                        </div>
                        <div class="stat-box">
                            <span class="val text-blue-muted">${item.total}</span>
                            <span class="lbl"><i class="fa fa-file-alt mr-1"></i> إجمالي المستندات</span>
                        </div>
                        <div class="stat-box">
                            <span class="val text-blue-bright">${item.completed}</span>
                            <span class="lbl"><i class="fa fa-check mr-1"></i> مكتملة</span>
                        </div>
                        <div class="stat-box" style="background: rgba(14, 165, 233, 0.08); border-color: #bae6fd;">
                            <span class="val text-blue-primary">${item.reviewed}</span>
                            <span class="lbl font-weight-bold" style="color:#0369a1;"><i class="fa fa-check-double mr-1"></i> مراجعة</span>
                        </div>
                    </div>

                    <div class="card-footer-area">
                        <div class="prog-info">
                            <span class="prog-title">نسبة الأداء (المراجعة)</span>
                            <span class="prog-val">${item.percent}%</span>
                        </div>
                        <div class="prog-track">
                            <div class="prog-fill" style="width: ${item.percent}%;"></div>
                        </div>
                        <div class="text-center mt-3 click-hint">
                            <i class="fa fa-hand-pointer mr-1"></i> انقر لعرض تفاصيل المعايير
                        </div>
                    </div>
                </div>
            `);

            card.on('click', () => this.show_drilldown(item.department));
            grid.append(card);
        });
    }

    // --- Level 2: Drilldown Methods (Elements) ---

    async show_drilldown(department) {
        this.body.find('#departments-cards-grid').hide();
        this.body.find('#element-details-view').hide();
        this.body.find('#btn-main-back').hide();
        
        const drilldownView = this.body.find('#drilldown-view');
        this.body.find('#drilldown-title').text(`معايير الإدارة: ${department}`);
        
        const content = this.body.find('#drilldown-content');
        content.html(`
            <div class="text-center w-100 p-5 glass-card" style="grid-column: 1 / -1;">
                <i class="fa fa-spinner fa-spin fa-2x" style="color: #0284c7;"></i>
                <h5 class="mt-3 text-blue-dark">جاري جلب وعد الجداول الفرعية بدقة...</h5>
            </div>
        `);
        
        drilldownView.fadeIn(300);
        this.current_elements_docs = {}; // تفريغ الذاكرة المؤقتة

        try {
            // 1. جلب أسماء المعايير لهذه الإدارة
            let list_res = await frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'Elements-2024',
                    filters: { 'department': department },
                    fields: ['name'],
                    limit_page_length: 1000
                }
            });

            if (!list_res.message || list_res.message.length === 0) {
                this.render_drilldown_elements([]);
                return;
            }

            // 2. جلب كل مستند بالكامل (بما في ذلك جداوله الفرعية) باستخدام التوازي لتسريع العملية
            const promises = list_res.message.map(item => {
                return frappe.call({
                    method: 'frappe.client.get',
                    args: { doctype: 'Elements-2024', name: item.name }
                });
            });

            const results = await Promise.all(promises);
            const full_docs = results.map(res => res.message);

            this.render_drilldown_elements(full_docs);

        } catch (err) {
            console.error("Error fetching detailed child tables:", err);
            content.html(`
                <div class="text-center w-100 p-5 glass-card text-danger" style="grid-column: 1 / -1;">
                    <i class="fa fa-exclamation-triangle fa-2x mb-3"></i>
                    <h5>حدث خطأ أثناء جلب البيانات.</h5>
                </div>
            `);
        }
    }

    render_drilldown_elements(docs) {
        const content = this.body.find('#drilldown-content');
        content.empty();

        if (docs.length === 0) {
            content.html(`
                <div class="text-center w-100 p-5 glass-card" style="grid-column: 1 / -1; color: #64748b;">
                    <i class="fa fa-exclamation-circle fa-2x mb-3" style="opacity:0.5; color: #0284c7;"></i>
                    <h5>لا توجد تفاصيل معايير متاحة لهذه الإدارة.</h5>
                </div>
            `);
            return;
        }

        docs.forEach((doc, index) => {
            // حفظ المستند في الذاكرة لتسريع الـ Level 3
            this.current_elements_docs[doc.name] = doc;

            // --- العد الحقيقي (Real Accurate Numbers) ---
            // 1. المتطلبات
            let req_total = doc.requirements ? doc.requirements.length : 0;
            let req_done = doc.requirements ? doc.requirements.filter(r => r.done == 1 || r.done == true || r.done === "1").length : 0;

            // 2. مستندات الإثبات
            let proof_total = doc.proof_document ? doc.proof_document.length : 0;
            let proof_done = doc.proof_document ? doc.proof_document.filter(p => p.completed == 1 || p.completed == true || p.completed === "1").length : 0;

            // حساب النسبة الكلية الدقيقة (متطلبات + مستندات)
            let total_items = req_total + proof_total;
            let done_items = req_done + proof_done;
            let percent = total_items > 0 ? Math.floor((done_items / total_items) * 100) : 0;

            let delay = index * 30;

            let elCard = $(`
                <div class="element-card glass-card fade-in-up" style="animation-delay: ${delay}ms;">
                    <div class="el-header">
                        <i class="fa fa-cube text-blue-primary"></i>
                        <h4 class="m-0 text-blue-dark" style="font-size: 1rem; font-weight:700;" title="${doc.element || doc.name}">${doc.name}</h4>
                    </div>
                    
                    <div class="el-stats-grid">
                        <div class="stat-row">
                            <span><i class="fa fa-list-ul text-blue-muted"></i> المتطلبات المنجزة</span>
                            <strong><span class="text-blue-bright">${req_done}</span> / ${req_total}</strong>
                        </div>
                        <div class="stat-row">
                            <span><i class="fa fa-file-invoice text-blue-muted"></i> المستندات المكتملة</span>
                            <strong><span class="text-blue-primary">${proof_done}</span> / ${proof_total}</strong>
                        </div>
                    </div>

                    <div class="el-progress-area mt-3">
                        <div class="d-flex justify-content-between mb-1" style="font-size: 0.8rem; font-weight: 700;">
                            <span>الإنجاز الفعلي للمعيار</span>
                            <span class="text-blue-primary">${percent}%</span>
                        </div>
                        <div class="prog-track" style="height: 6px;">
                            <div class="prog-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>

                    <div class="mt-3 text-left d-flex" style="gap: 10px;">
                        <button class="view-docs-btn btn btn-sm btn-light text-white font-weight-bold flex-grow-1" style="background: linear-gradient(135deg, #0284c7, #0ea5e9); border: none; border-radius: 6px;" data-name="${doc.name}">
                            عرض التفاصيل <i class="fa fa-chevron-down ml-1"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-blue-dark font-weight-bold" style="border: 1px solid #bae6fd; border-radius: 6px;" onclick="frappe.set_route('Form', 'Elements-2024', '${doc.name.replace(/'/g, "\\'")}')" title="فتح السجل">
                            <i class="fa fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            `);
            content.append(elCard);
        });

        // ربط حدث النقر لفتح Level 3
        content.find('.view-docs-btn').on('click', (e) => {
            let name = $(e.currentTarget).attr('data-name');
            this.show_element_details(name);
        });
    }

    hide_drilldown() {
        this.body.find('#drilldown-view').hide();
        this.body.find('#element-details-view').hide();
        this.body.find('#departments-cards-grid').fadeIn(300);
        this.body.find('#btn-main-back').show();
    }

    // --- Level 3: Element Details Methods (Documents & Requirements) ---

    show_element_details(element_name) {
        this.body.find('#drilldown-view').hide();
        
        const detailsView = this.body.find('#element-details-view');
        this.body.find('#element-details-title').text(`المعيار: ${element_name}`);
        detailsView.fadeIn(300);

        // لم نعد بحاجة لعمل API Call! نأخذ البيانات مباشرة من الذاكرة (سريع جداً)
        let doc = this.current_elements_docs[element_name];
        if (doc) {
            this.render_element_docs(doc);
        } else {
            this.body.find('#element-details-content').html(`<div class="alert alert-danger">بيانات غير متوفرة</div>`);
        }
    }

    render_element_docs(el) {
        const content = this.body.find('#element-details-content');
        
        const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="#10b981" style="min-width:16px; min-height:16px; margin-top:3px;"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>`;
        const iconCross = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="#ef4444" style="min-width:16px; min-height:16px; margin-top:3px;"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>`;
        const iconInfo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="#94a3b8" style="margin-left:5px;"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>`;
        const iconReqList = `<i class="fa fa-list-ul text-blue-primary"></i>`;
        const iconProofFile = `<i class="fa fa-file-invoice text-blue-primary"></i>`;

        let html = `<div class="element-details-grid glass-card p-4">`;

        // Requirements
        html += `
            <div class="details-section">
                <h5 class="section-title">${iconReqList} المتطلبات</h5>
                <div class="items-list">
        `;
        if (el.requirements && el.requirements.length > 0) {
            el.requirements.forEach(req => {
                let reqText = req['العنوان'] || 'بدون عنوان';
                let isChecked = (req.done === 1 || req.done === true || req.done === "1");
                html += `
                    <div class="list-item">
                        ${isChecked ? iconCheck : iconCross}
                        <div class="item-text">${reqText}</div>
                    </div>
                `;
            });
        } else {
            html += `<div style="color: #94a3b8; font-size: 0.85rem; display:flex; align-items:center;">${iconInfo} لا توجد متطلبات مضافة.</div>`;
        }
        html += `</div></div>`;

        // Proof Documents
        html += `
            <div class="details-section">
                <h5 class="section-title">${iconProofFile} مستندات الإثبات المطلوبة</h5>
                <div class="items-list">
        `;
        if (el.proof_document && el.proof_document.length > 0) {
            el.proof_document.forEach(proof => {
                let proofText = proof.document_name || 'بدون عنوان';
                let isChecked = (proof.completed === 1 || proof.completed === true || proof.completed === "1");
                html += `
                    <div class="list-item">
                        ${isChecked ? iconCheck : iconCross}
                        <div class="item-text">${proofText}</div>
                    </div>
                `;
            });
        } else {
            html += `<div style="color: #94a3b8; font-size: 0.85rem; display:flex; align-items:center;">${iconInfo} لا توجد مستندات إثبات مضافة.</div>`;
        }
        html += `</div></div>`;

        html += `</div>`;
        content.html(html);
    }

    hide_element_details() {
        this.body.find('#element-details-view').hide();
        this.body.find('#drilldown-view').fadeIn(300);
    }

    // --- Utility Methods ---

    export_to_csv() {
        if (!this.current_data || this.current_data.length === 0) {
            frappe.msgprint('لا توجد بيانات لتصديرها');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
        csvContent += "الإدارة,عدد المعايير,إجمالي المستندات المطلوبة,المستندات المكتملة,المستندات المراجعة,النسبة\n"; 
        
        this.current_data.forEach(item => {
            let row = [
                `"${item.department}"`, item.elements, item.total, item.completed, item.reviewed, `${item.percent}%`
            ].join(",");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `بطاقات_الادارات_${frappe.datetime.nowdate()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setup_styles() {
        if ($('#qyass-department-cards-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            .blue-theme { font-family: 'Tajawal', sans-serif; color: #0c4a6e; position: relative; overflow-x: hidden; }
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(90px); z-index: 0; opacity: 0.15; pointer-events: none;}
            .shape-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: #0284c7; }
            .shape-2 { bottom: -10%; left: -10%; width: 600px; height: 600px; background: #38bdf8; }
            
            .dashboard-container { position: relative; z-index: 2; max-width: 1400px; margin: 0 auto; padding: 25px; }
            
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 18px 35px; background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%) !important;
                backdrop-filter: blur(15px); position: sticky; top: 0; z-index: 100;
                box-shadow: 0 4px 20px rgba(2, 132, 199, 0.05);
            }
            .brand { display: flex; align-items: center; gap: 12px; }
            
            .action-btn { background: white !important; border: 1px solid #bae6fd; color: #0284c7; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 700;}
            .action-btn:hover { background: #f0f9ff !important; box-shadow: 0 2px 10px rgba(2,132,199,0.15); transform: translateY(-1px);}

            .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 25px; }

            .glass-card {
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(25px);
                border: 1px solid #e0f2fe; box-shadow: 0 10px 30px rgba(2,132,199,0.06); border-radius: 20px;
            }
            .department-card { display: flex; flex-direction: column; transition: all 0.3s ease; overflow: hidden; }
            
            .clickable-card { cursor: pointer; }
            .clickable-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(2,132,199,0.2); border-color: #7dd3fc; }
            .click-hint { font-size: 0.75rem; color: #38bdf8; font-weight: bold; opacity: 0; transition: 0.3s; height: 0; }
            .clickable-card:hover .click-hint { opacity: 1; height: 20px; margin-top: 10px !important; }

            .card-header-area {
                display: flex; align-items: center; gap: 15px; padding: 25px 20px;
                border-bottom: 1px dashed #e0f2fe; background: linear-gradient(to right, rgba(240, 249, 255, 0.8), rgba(255, 255, 255, 0.5));
            }
            .avatar {
                width: 55px; height: 55px; background: white; border: 2px solid #bae6fd;
                border-radius: 14px; display: flex; align-items: center; justify-content: center;
                font-size: 1.5rem; color: #0284c7; box-shadow: 0 4px 10px rgba(2,132,199,0.1);
            }
            .title-area { display: flex; flex-direction: column; gap: 6px; }
            .department-name { margin: 0; font-size: 1.2rem; font-weight: 800; color: #082f49; line-height: 1.3;}
            
            .status-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; font-weight: 700; width: fit-content;}
            .badge-solid { background: #0284c7; color: white; box-shadow: 0 2px 8px rgba(2,132,199,0.3);}
            .badge-light { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd;}

            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; }
            .stat-box {
                background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 15px 10px;
                display: flex; flex-direction: column; align-items: center; text-align: center; transition: 0.2s;
            }
            .department-card:hover .stat-box { background: white; border-color: #e0f2fe; }
            
            .val { font-size: 1.6rem; font-weight: 800; line-height: 1; margin-bottom: 6px;}
            .lbl { font-size: 0.8rem; color: #64748b; font-weight: 700;}
            
            .text-blue-dark { color: #0c4a6e; }
            .text-blue-muted { color: #475569; }
            .text-blue-bright { color: #0ea5e9; }
            .text-blue-primary { color: #0284c7; }

            .card-footer-area { padding: 15px 20px 20px; background: rgba(240, 249, 255, 0.4); border-top: 1px dashed #e0f2fe; }
            .prog-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;}
            .prog-title { font-size: 0.9rem; font-weight: 800; color: #0369a1;}
            .prog-val { font-size: 1.1rem; font-weight: 800; color: #0284c7;}
            
            .prog-track { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; width: 100%; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);}
            .prog-fill { height: 100%; background: linear-gradient(90deg, #0ea5e9, #0284c7); border-radius: 4px; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);}

            /* Drilldown Specific Styles (Elements & Documents) */
            .drilldown-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
            }
            .element-card {
                padding: 20px; display: flex; flex-direction: column; justify-content: space-between;
                border-left: 4px solid #0284c7;
            }
            .el-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
            
            /* New Accurate Stats Grid */
            .el-stats-grid { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 0.9rem;}
            .stat-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5px; }
            .stat-row:last-child { border-bottom: none; padding-bottom: 0; }
            .stat-row span { color: #475569; font-weight: 600; display:flex; align-items:center; gap:6px;}
            .stat-row strong { font-size: 1rem; color: #0f172a; direction: ltr; display: inline-block;}

            /* Level 3 Details Styles */
            .element-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            @media (max-width: 768px) { .element-details-grid { grid-template-columns: 1fr; } }
            .details-section { background: transparent; }
            .section-title {
                color: #0369a1; font-weight: 700; margin: 0 0 15px 0; font-size: 1.1rem;
                border-bottom: 1px solid #bae6fd; padding-bottom: 8px;
                display: flex; align-items: center; gap: 8px;
            }
            .items-list { display: flex; flex-direction: column; gap: 10px; }
            .list-item {
            height:auto;
                background: rgba(255, 255, 255, 0.8); padding: 12px; border-radius: 8px; 
                border: 1px solid #e0f2fe; display: flex; align-items: start; gap: 10px;
                box-shadow: 0 2px 5px rgba(2, 132, 199, 0.05); transition: 0.2s;
            }
            .list-item:hover { background: white; border-color: #bae6fd; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.1); transform: translateY(-1px);}
            .item-text { font-size: 0.95rem; color: #475569; font-weight: 600; line-height: 1.5; word-break: break-word;}

            .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        `;

        $('<style id="qyass-department-cards-css">').text(css).appendTo('head');
    }
}