frappe.pages['proof_docs_report'].on_page_load = function(wrapper) {
    frappe.require([
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    ], function() {
        new ProofDocsReport(wrapper);
    });
};

class ProofDocsReport {
    constructor(wrapper) {
        this.wrapper = $(wrapper);
        
        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'تقرير مستندات الإثبات',
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
            #page-proof_docs_report { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
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
            #vision-filter, #dimension-filter { min-width: 220px; }
            #vision-filter .frappe-control, #dimension-filter .frappe-control { margin-bottom: 0 !important; }
            #vision-filter input, #dimension-filter input {
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

            /* --- 2. Dynamic Report Styles --- */
            .report-card {
                background: rgba(255, 255, 255, 0.85); 
                backdrop-filter: blur(10px);
                border: 1px solid white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                margin-bottom: 25px;
            }
            
            .dimension-title {
                color: #0369a1; border-bottom: 2px solid #bae6fd; 
                padding-bottom: 10px; margin-top: 0; font-weight: 800; font-size: 1.5rem;
            }

            .element-box {
                margin-top: 15px; border: 1px solid #e2e8f0; 
                border-radius: 8px; padding: 20px; background: #f8fafc;
                page-break-inside: avoid;
                break-inside: avoid;
            }

            .element-header { margin: 0 0 15px 0; color: #0f172a; font-size: 1.1rem; font-weight: 700; }
            .element-chip { background:#3b82f6; padding:3px 8px; border-radius:4px; color:white; margin-left:10px; font-size: 0.9rem;}

            .element-details-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;
            }
            @media (max-width: 768px) {
                .element-details-grid { grid-template-columns: 1fr; }
            }

            .details-section { background: transparent; }
            .section-title {
                color: #0369a1; font-weight: 700; margin: 0 0 10px 0; font-size: 1rem;
                border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;
                display: flex; align-items: center; gap: 8px;
            }
            .items-list { display: flex; flex-direction: column; gap: 10px; }

            .list-item {
                background: white; padding: 12px; border-radius: 6px; 
                border: 1px solid #e2e8f0; display: flex; align-items: start; gap: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                height: auto !important;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .item-text { font-size: 0.9rem; color: #475569; font-weight: 500; line-height: 1.5; word-break: break-word;}

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
            .loading-content h3 { font-size: 1.5rem; font-weight: 700; margin: 0; font-family: 'Tajawal'; margin-top:15px;}
            .loading-content p { color: #64748b; margin-top: 5px; font-size: 1rem; }

            /* --- 4. PDF MODE FIXES --- */
            .pdf-mode {
                position: absolute; top: 0; left: 0;
                width: 1200px !important;
                background: white !important; 
                z-index: 9999; padding: 20px 40px !important;
                font-family: Arial, Tahoma, sans-serif !important; 
            }
            .pdf-mode .bg-shape, .pdf-mode .glass-header, .pdf-mode .hero-actions, .pdf-mode .user-actions { display: none !important; }
            .pdf-mode #vision-filter, .pdf-mode #dimension-filter { display: none !important; }
            .pdf-mode .dashboard-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            .pdf-mode .report-card { box-shadow: none !important; border-bottom: 2px solid #e2e8f0 !important; border-radius: 0 !important; background: white !important; backdrop-filter: none !important; margin-bottom: 20px !important;}
            .pdf-mode * { font-family: Arial, Tahoma, sans-serif !important; letter-spacing: normal !important; }
            .pdf-mode .element-box { border: 1px solid #cbd5e1 !important; background: #fff !important; }
            .pdf-mode .list-item { border: 1px solid #cbd5e1 !important; }
        `;
        
        $('#proof-docs-styles').remove();
        $('<style id="proof-docs-styles">').text(css).appendTo('head');
    }

    render_layout() {
        const html = `
            <div class="modern-dashboard" id="report-content">
                <div id="pdf-loading-overlay" class="loading-overlay" style="display:none;" data-html2canvas-ignore="true">
                    <div class="loading-content">
                        <svg class="fa-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="60" height="60" fill="#0ea5e9"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/></svg>
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
                        <button class="action-btn" onclick="window.history.back()">
                            <!-- Icon X -->
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="12" height="12" fill="currentColor"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                            إغلاق
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>تفاصيل مستندات الإثبات والمتطلبات</h1>
                        </div>
                        <div class="hero-actions">
                            <div id="vision-filter"></div>
                            <div id="dimension-filter"></div>
                            
                            <button class="hero-btn btn-pdf" id="btn-pdf">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="#fff"><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z"/></svg>
                                تحميل PDF
                            </button>
                            <button class="hero-btn btn-email" id="btn-email">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="#fff"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                                إرسال بريد
                            </button>
                        </div>
                    </div>

                    <div class="loading-state" style="text-align:center; padding:50px; font-size:1.2rem; color:#64748b;">
                        <svg class="fa-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="40" height="40" fill="#cbd5e1"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/></svg>
                        <div style="margin-top:10px">جاري جلب البيانات...</div>
                    </div>

                    <div id="dynamic-data-container" style="display:none;"></div>

                </div>
            </div>
        `;

        this.wrapper.find('.layout-main-section').html(html);

        this.vision_field = frappe.ui.form.make_control({
            parent: this.wrapper.find('#vision-filter'),
            df: {
                fieldtype: 'Link',
                options: 'Vision',
                fieldname: 'vision',
                placeholder: 'تصفية بالمنظار...',
                onchange: () => this.fetch_and_process_data()
            },
            render_input: true
        });

        this.dimension_field = frappe.ui.form.make_control({
            parent: this.wrapper.find('#dimension-filter'),
            df: {
                fieldtype: 'Link',
                options: 'Dimension',
                fieldname: 'dimension',
                placeholder: 'تصفية بالمحور...',
                get_query: () => {
                    let v = this.vision_field.get_value();
                    if(v) return { filters: { 'vision': v } };
                },
                onchange: () => this.fetch_and_process_data()
            },
            render_input: true
        });

        this.wrapper.find('#btn-pdf').on('click', () => this.generate_pdf('download'));
        this.wrapper.find('#btn-email').on('click', () => this.generate_pdf('email'));
    }

    async fetch_and_process_data() {
        this.wrapper.find('#dynamic-data-container').empty().hide();
        $('.loading-state').show();

        let filters = {};
        let selected_vision = this.vision_field ? this.vision_field.get_value() : null;
        if (selected_vision) { filters['vision'] = selected_vision; }

        let selected_dimension = this.dimension_field ? this.dimension_field.get_value() : null;
        if (selected_dimension) { filters['dimension'] = selected_dimension; }

        try {
            // 1. استدعاء قائمة أسماء المستندات لتخطي خطأ الصلاحيات الخاص بالجداول الفرعية
            let list_res = await frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'Elements-2024',
                    fields: ['name'],
                    filters: filters,
                    limit_page_length: 0
                }
            });

            if (!list_res.message || list_res.message.length === 0) {
                this.render_empty_state();
                return;
            }

            // 2. استخدام التوازي (Promise.all) مع الدالة الأساسية frappe.client.get للحصول على كل مستند بجداوله الفرعية
            // هذا يمنع خطأ الصلاحيات (Permission Error) لأننا نستعلم عن الأب وليس عن الجدول الفرعي مباشرة.
            const promises = list_res.message.map(item => {
                return frappe.call({
                    method: 'frappe.client.get',
                    args: { doctype: 'Elements-2024', name: item.name }
                });
            });

            const results = await Promise.all(promises);
            const fullData = results.map(res => res.message);

            this.process_data(fullData);

        } catch (error) {
            console.error("Error fetching data:", error);
            this.render_empty_state();
        }
    }

    render_empty_state() {
        this.wrapper.find('#dynamic-data-container').html(`
            <div class="report-card" style="text-align:center; padding:50px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="60" height="60" fill="#cbd5e1" style="margin-bottom:15px;"><path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z"/></svg>
                <h3 style="color:#64748b; font-family:'Tajawal';">لا توجد بيانات مطابقة للبحث</h3>
            </div>
        `);
        $('.loading-state').hide();
        $('#dynamic-data-container').fadeIn();
    }

    process_data(elements) {
        const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="#10b981" style="min-width:16px; min-height:16px; margin-top:3px;"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>`;
        const iconCross = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="#ef4444" style="min-width:16px; min-height:16px; margin-top:3px;"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>`;
        const iconInfo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="#94a3b8" style="margin-left:5px;"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>`;
        const iconReqList = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="#0369a1"><path d="M152.1 38.2c9.9 8.9 10.7 24.1 1.8 34L85.9 146.2c-8.9 9.9-24.1 10.7-34 1.8L11.8 111.8c-9.9-8.9-10.7-24.1-1.8-34s24.1-10.7 34-1.8l20.8 18.7 53.3-59.2c8.9-9.9 24.1-10.7 34-1.8zm0 160c9.9 8.9 10.7 24.1 1.8 34l-68 75.5c-8.9 9.9-24.1 10.7-34 1.8l-40-36c-9.9-8.9-10.7-24.1-1.8-34s24.1-10.7 34-1.8l20.8 18.7 53.3-59.2c8.9-9.9 24.1-10.7 34-1.8zm0 160c9.9 8.9 10.7 24.1 1.8 34l-68 75.5c-8.9 9.9-24.1 10.7-34 1.8l-40-36c-9.9-8.9-10.7-24.1-1.8-34s24.1-10.7 34-1.8l20.8 18.7 53.3-59.2c8.9-9.9 24.1-10.7 34-1.8zM224 96c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32z"/></svg>`;
        const iconProofFile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="#0369a1"><path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM112 192H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>`;

        const groupedData = {};
        elements.forEach(el => {
            let dim = el.dimension || 'عناصر بدون بعد محدد';
            if (!groupedData[dim]) groupedData[dim] = [];
            groupedData[dim].push(el);
        });

        let html = '';

        for (const [dimension, items] of Object.entries(groupedData)) {
            items.sort((a, b) => {
                let numA = a.number ? a.number.toString() : "";
                let numB = b.number ? b.number.toString() : "";
                return numA.localeCompare(numB, undefined, { numeric: true });
            });

            html += `
                <div class="report-card">
                    <h2 class="dimension-title">${dimension}</h2>
            `;

            items.forEach(el => {
                html += `
                    <div class="element-box">
                        <h4 class="element-header">
                            <span class="element-chip">${el.number || '#'}</span>
                            ${el.element || 'بدون اسم'}
                        </h4>
                        
                        <div class="element-details-grid">
                `;

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
                    html += `<div style="color: #94a3b8; font-size: 0.85rem; display:flex; align-items:center;">${iconInfo} لا توجد متطلبات.</div>`;
                }
                html += `</div></div>`;

                // Proof Documents
                html += `
                            <div class="details-section">
                                <h5 class="section-title">${iconProofFile} مستندات الإثبات</h5>
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
                    html += `<div style="color: #94a3b8; font-size: 0.85rem; display:flex; align-items:center;">${iconInfo} لا توجد مستندات إثبات.</div>`;
                }
                html += `</div></div>`;

                html += `</div></div>`; 
            });
            html += `</div>`;
        }

        this.wrapper.find('#dynamic-data-container').html(html);
        $('.loading-state').hide();
        $('#dynamic-data-container').fadeIn();
    }

    // --- Upgrade: Multi-page PDF Export Logic ---
    generate_pdf(action) {
        const element = document.getElementById('report-content');
        const overlay = $('#pdf-loading-overlay');
        const loadingText = $('#loading-text');

        if (action === 'download') loadingText.text('جاري إنشاء ملف PDF...');
        else if (action === 'email') loadingText.text('جاري إرسال البريد...');
        
        overlay.fadeIn(200);
        element.classList.add('pdf-mode');
        
        setTimeout(() => {
            html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
                letterRendering: 1, 
                allowTaint: true,
                ignoreElements: (el) => el.id === 'pdf-loading-overlay'
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                // إعداد الصفحة A4
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
                const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
                
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgProps = pdf.getImageProperties(imgData);
                
                // حساب الارتفاع الكلي للصورة بالنسبة لعرض A4
                const imgHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

                let heightLeft = imgHeightInPdf;
                let position = 0; 

                // إضافة الصفحة الأولى
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;

                // التكرار لإضافة باقي الصفحات في حال كان التقرير طويلاً
                while (heightLeft > 0) {
                    position = heightLeft - imgHeightInPdf; // حساب موضع القص
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
                    heightLeft -= pdfHeight;
                }

                if (action === 'download') {
                    pdf.save('Proof_Docs_Report.pdf');
                    element.classList.remove('pdf-mode');
                    overlay.fadeOut();
                    frappe.show_alert({message: 'تم التحميل بنجاح', indicator: 'green'});
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
                frappe.msgprint('حدث خطأ أثناء تصدير الـ PDF');
            });
        }, 500);
    }

    send_email(blob) {
        const file = new File([blob], "Proof_Docs_Report.pdf", { type: "application/pdf" });
        let formData = new FormData();
        formData.append('file', file, 'Proof_Docs_Report.pdf');
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
                    subject: 'تقرير مستندات الإثبات',
                    message: 'مرفق لكم تقرير مستندات الإثبات والمتطلبات بصيغة (PDF).',
                    attachments: [{
                        name: data.message.name,
                        file_name: 'Proof_Docs_Report.pdf',
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