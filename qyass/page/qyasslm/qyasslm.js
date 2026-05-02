frappe.pages['qyasslm'].on_page_load = function(wrapper) {
    frappe.require([
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
        "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    ], function() {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const map = Object.assign(document.createElement("script"), {
            type: "importmap",
            textContent: JSON.stringify({
                imports: { "@google/generative-ai": "https://esm.run/@google/generative-ai" }
            })
        });
        document.body.appendChild(map);
  
        new SmartAssistantApp(wrapper);
    });
  };
  
  class SmartAssistantApp {
    constructor(wrapper) {
        this.wrapper = $(wrapper);
        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'Qyass LM',
            single_column: true
        });
  
        // --- CONFIGURATION ---
        this.API_KEY = "AIzaSyDu75cLLx1tZTvSq4qL7M61jUSmjxRur58"; 
        // ---------------------
  
        this.page.set_title('');
        $(wrapper).find('.page-head').hide();
  
        this.fullProofText = ""; 
        this.genAI = null;
        this.model = null;
        this.elementsList = [];
        this.currentDoc = null;
  
        this.force_full_screen();
        this.setup_styles();
        this.render_layout();
        this.bind_events();
        this.fetch_elements();
    }
  
    // فرض ملء الشاشة وإخفاء عناصر Frappe الافتراضية
    force_full_screen() {
        const fullScreenStyle = `
            /* إخفاء القوائم الجانبية والعلوية لنظام فرابيه */
            header, .navbar, .page-head, .layout-side-section { display: none !important; }
            
            /* إجبار محتوى الصفحة على ملء الشاشة بالكامل */
            body, html { margin: 0; padding: 0; height: 100vh; overflow: hidden !important; }
            .page-body { max-width: 100vw !important; height: 100vh !important; padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
            #page-qyasslm { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: var(--bg-light); margin: 0 !important; padding: 0 !important; }
            .layout-main-section-wrapper { display: block !important; padding: 0 !important; height: 100% !important; margin: 0 !important; }
            .layout-main-section { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; height: 100% !important; background: transparent !important;}
            .page-container { padding: 0 !important; margin: 0 !important; height: 100% !important; width: 100% !important; max-width: 100% !important; }
            .page-content { padding: 0 !important; margin: 0 !important; height: 100% !important; }
        `;
        $('<style>').text(fullScreenStyle).appendTo(this.wrapper);
    }
  
    setup_styles() {
        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
            
            :root {
                --primary: #0369a1;
                --primary-light: #0ea5e9;
                --bg-light: #f0f9ff;
                --bg-card: #ffffff;
                --text-primary: #0c4a6e;
                --text-secondary: #64748b;
                --border-color: #e0f2fe;
                --shadow-sm: 0 2px 8px rgba(3, 105, 161, 0.04);
                --shadow-md: 0 8px 24px rgba(3, 105, 161, 0.08);
                --shadow-lg: 0 16px 40px rgba(3, 105, 161, 0.12);
                --gradient-primary: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                
                --status-success-bg: #dcfce7;
                --status-success-border: #86efac;
                --status-success-text: #14532d;
                
                --status-error-bg: #fee2e2;
                --status-error-border: #fca5a5;
                --status-error-text: #7f1d1d;
            }
  
            .modern-dashboard {
                font-family: 'Tajawal', sans-serif; color: var(--text-primary); height: 100vh; 
                background: var(--bg-light); position: relative; overflow: hidden; direction: rtl; display: flex; flex-direction: column;
            }
            
            .bg-pattern { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 0; background-image: radial-gradient(circle at top right, rgba(14, 165, 233, 0.05) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(3, 105, 161, 0.05) 0%, transparent 50%); }
  
            .glass-header {
                display: flex; justify-content: space-between; align-items: center; padding: 0 2rem;
                background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px); z-index: 50;
                border-bottom: 1px solid var(--border-color); height: 70px; flex-shrink: 0; box-shadow: var(--shadow-sm);
            }
            .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.4rem; color: var(--primary); }
            .brand i { font-size: 1.6rem; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .header-actions { display: flex; align-items: center; gap: 15px; }
            
            .back-btn { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--primary); padding: 8px 16px; border-radius: 10px; font-family: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-sm); }
            .back-btn:hover { background: var(--primary); color: white; transform: translateY(-1px); }
  
            .menu-toggle-btn { background: var(--bg-light); border: 1px solid var(--border-color); color: var(--primary); font-size: 1.2rem; cursor: pointer; padding: 8px 12px; border-radius: 8px; display: block; transition: all 0.2s; }
            .menu-toggle-btn:hover { background: var(--border-color); }
  
            .app-grid { display: flex; flex-direction: column; flex: 1; position: relative; overflow: hidden; min-height: 0; z-index: 10; }
  
            /* الشريط الجانبي */
            .sidebar-panel {
                position: absolute; top: 0; right: 0; bottom: 0; width: 85%; max-width: 360px;
                background: var(--bg-card); z-index: 100;
                padding: 2rem; display: flex; flex-direction: column; gap: 24px;
                box-shadow: var(--shadow-lg); transform: translateX(110%); 
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); overflow-y: auto;
                border-left: 1px solid var(--border-color);
            }
            .sidebar-panel.is-open { transform: translateX(0); }
            
            .sidebar-panel::-webkit-scrollbar, .chat-history::-webkit-scrollbar { width: 6px; }
            .sidebar-panel::-webkit-scrollbar-track, .chat-history::-webkit-scrollbar-track { background: transparent; }
            .sidebar-panel::-webkit-scrollbar-thumb, .chat-history::-webkit-scrollbar-thumb { background: rgba(3, 105, 161, 0.2); border-radius: 4px; }
  
            .mobile-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(3, 105, 161, 0.2); backdrop-filter: blur(2px); z-index: 90; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
            .mobile-overlay.is-active { opacity: 1; pointer-events: auto; }
  
            .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .sidebar-header h3 { margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--text-primary); }
  
            .control-group label { display: block; font-weight: 700; color: var(--text-secondary); margin-bottom: 10px; font-size: 0.95rem; }
            .modern-select { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-light); font-family: 'Tajawal'; font-size: 0.95rem; outline: none; color: var(--text-primary); transition: all 0.3s ease; font-weight: 500; cursor: pointer; }
            .modern-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1); }
            
            .info-box { background: var(--bg-light); padding: 20px; border-radius: 16px; font-size: 0.9rem; border: 1px solid var(--border-color); color: var(--text-secondary); line-height: 1.6; }
            .info-box strong { color: var(--text-primary); font-size: 1rem; margin-bottom: 8px; display: inline-block; }
            .info-box span { font-weight: 800; color: var(--primary); font-size: 1.1rem; }
  
            .btn-primary-glass { background: var(--gradient-primary); color: white; border: none; padding: 16px; width: 100%; border-radius: 14px; font-size: 1rem; font-weight: 800; cursor: pointer; margin-top: 10px; box-shadow: var(--shadow-md); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px; }
            .btn-primary-glass:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
            .btn-primary-glass:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
  
            .status-badge { padding: 10px; border-radius: 8px; font-weight: 700; background: var(--bg-light); border: 1px solid var(--border-color); }
  
            /* مساحة المحادثة */
            .chat-panel { flex: 1; display: flex; flex-direction: column; position: relative; width: 100%; height: 100%; overflow: hidden; background: transparent; }
            .chat-history { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 24px; scroll-behavior: smooth; min-height: 0; }
            
            .msg-wrapper { display: flex; flex-direction: column; max-width: 850px; margin: 0 auto; width: 100%; animation: fadeIn 0.4s ease forwards; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            .msg-bubble { padding: 18px 24px; border-radius: 20px; font-size: 1rem; line-height: 1.8; position: relative; word-wrap: break-word; font-weight: 500; }
            
            .user-msg { align-items: flex-start; }
            .user-msg .msg-bubble { background: var(--gradient-primary); color: white; border-bottom-right-radius: 4px; box-shadow: var(--shadow-md); align-self: flex-start; margin-left: 2rem;}
            
            .ai-msg { align-items: flex-end; }
            .ai-msg .msg-bubble { background: var(--bg-card); color: var(--text-primary); border-bottom-left-radius: 4px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md); align-self: flex-end; margin-right: 2rem; width: 100%; }
            .ai-msg .msg-bubble strong { color: var(--primary); font-weight: 800; }
            
            .ai-msg .msg-bubble p { margin-bottom: 10px; margin-top: 0; }
            .ai-msg .msg-bubble p:last-child { margin-bottom: 0; }
            .ai-msg .msg-bubble ul, .ai-msg .msg-bubble ol { padding-right: 20px; margin: 10px 0; }
            .ai-msg .msg-bubble li { margin-bottom: 5px; }
  
            /* إدخال المحادثة */
            .input-container-wrapper { padding: 1.5rem 2rem; background: linear-gradient(to top, var(--bg-light) 60%, transparent); flex-shrink: 0; display: flex; justify-content: center; }
            .input-footer { max-width: 850px; width: 100%; background: var(--bg-card); padding: 8px; border-radius: 20px; display: flex; align-items: center; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); transition: all 0.3s ease; }
            .input-footer:focus-within { box-shadow: 0 10px 40px rgba(3, 105, 161, 0.15); border-color: var(--primary-light); transform: translateY(-2px); }
            .chat-input { flex: 1; border: none; padding: 16px 20px; font-family: 'Tajawal'; font-size: 1.05rem; outline: none; background: transparent; min-width: 0; font-weight: 500; color: var(--text-primary); }
            .chat-input::placeholder { color: var(--text-secondary); opacity: 0.7; }
            .send-btn { width: 50px; height: 50px; border-radius: 16px; border: none; background: var(--gradient-primary); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 5px; transition: all 0.2s; box-shadow: var(--shadow-sm); font-size: 1.1rem; }
            .send-btn:hover:not(:disabled) { transform: scale(1.05); }
            .send-btn:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }
  
            /* =========================================
               تحديث ستايل بطاقة النتيجة (Display Block)
               ========================================= */
            .result-card {
                padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid; 
                display: block; /* تغيير المطلوب لـ block لتجنب تداخل العناصر */
                box-shadow: var(--shadow-sm);
            }
            .res-card-header {
                display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
            }
            .res-icon { font-size: 24px; }
            .res-content h4 { margin: 0; font-weight: 800; font-size: 1.15rem; }
            .res-desc { margin: 0; font-size: 0.95rem; opacity: 0.95; line-height: 1.6; }
  
            .res-success { background: var(--status-success-bg); border-color: var(--status-success-border); color: var(--status-success-text); }
            .res-success .res-icon { color: var(--status-success-text); }
            
            .res-fail { background: var(--status-error-bg); border-color: var(--status-error-border); color: var(--status-error-text); }
            .res-fail .res-icon { color: var(--status-error-text); }
  
            /* Responsive */
            @media (min-width: 992px) {
                .menu-toggle-btn { display: none; }
                .app-grid { display: grid; grid-template-columns: 360px 1fr; }
                .sidebar-panel { position: relative; width: auto; max-width: none; transform: none; box-shadow: none; border-left: 1px solid var(--border-color); background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px); }
                .mobile-overlay { display: none; }
            }
            @media (max-width: 768px) {
                .glass-header { padding: 0 1rem; height: 60px; }
                .brand { font-size: 1.2rem; }
                .back-btn span { display: none; }
                .chat-history { padding: 1rem; }
                .input-container-wrapper { padding: 1rem; }
                .msg-bubble { padding: 14px 18px; font-size: 0.95rem; }
            }
        `;
        $('<style>').text(css).appendTo(this.wrapper);
    }
  
    render_layout() {
        const html = `
            <div class="modern-dashboard">
                <div class="bg-pattern"></div>
  
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
                    <div class="header-actions">
                        <button onclick="location.href='/app/qyass-dashboard'" class="back-btn"><i class="fas fa-arrow-right"></i> <span>العودة للرئيسية</span></button>
                        <button class="menu-toggle-btn" id="menu-btn"><i class="fa fa-sliders-h"></i></button>
                    </div>
                </div>
  
                <div class="app-grid">
                    <div class="mobile-overlay" id="mobile-overlay"></div>
  
                    <div class="sidebar-panel" id="sidebar">
                        <div class="sidebar-header">
                            <h3>إعدادات التحليل الذكي</h3>
                            <button class="menu-toggle-btn" id="close-menu-btn" style="display:block;"><i class="fa fa-times"></i></button>
                        </div>
  
                        <div class="control-group">
                            <label>اختر المعيار المطلوب تدقيقه</label>
                            <select id="element-select" class="modern-select">
                                <option value="" disabled selected>جاري تحميل المعايير...</option>
                            </select>
                        </div>
  
                        <div class="info-box" id="doc-info" style="display:none">
                            <strong>تفاصيل المعيار المختار:</strong><br>
                            يحتوي على <span id="req-count">0</span> متطلبات<br>
                            يحتوي على <span id="proof-count">0</span> ملفات إثبات مرفقة
                        </div>
  
                        <button id="check-btn" class="btn-primary-glass">
                            بدء التدقيق الآلي <i class="fa fa-robot"></i>
                        </button>
                        
                        <div id="status-text" class="status-badge" style="display:none; text-align:center;"></div>
                        
                        <div style="margin-top:auto; font-size:0.8rem; color:var(--text-secondary); text-align:center; font-weight:700;">
                            <i class="fas fa-bolt" style="color:#f59e0b;"></i> Powered by New Era Solutions
                        </div>
                    </div>
  
                    <div class="chat-panel">
                        <div class="chat-history" id="chat-container">
                            <div class="msg-wrapper ai-msg">
                                <div class="msg-bubble">
                                    <strong>مرحباً بك في Qyass LM 👋</strong><br>
                                    أنا المساعد الذكي لتدقيق الامتثال.<br>
                                    يرجى اختيار المعيار من القائمة الجانبية وسأقوم بقراءة ملفات PDF المرفقة والتحقق من تطابقها مع المتطلبات المحددة.
                                </div>
                            </div>
                        </div>
  
                        <div class="input-container-wrapper">
                            <div class="input-footer">
                                <input type="text" id="user-input" class="chat-input" placeholder="اكتب سؤالك هنا بعد انتهاء التدقيق..." disabled>
                                <button id="send-btn" class="send-btn" disabled>
                                    <i class="fa fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.wrapper.find('.layout-main-section').html(html);
    }
  
    fetch_elements() {
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: ['name', 'number', 'element'],
                limit_page_length: 500,
                order_by: 'number asc'
            },
            callback: (r) => {
                if(r.message) {
                    this.elementsList = r.message;
                    const select = $('#element-select');
                    select.empty().append('<option value="" disabled selected>-- اختر المعيار --</option>');
                    
                    this.elementsList.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  
                    this.elementsList.forEach(item => {
                        let label = `${item.number} - ${item.element}`;
                        if(label.length > 50) label = label.substring(0, 50) + '...';
                        select.append(`<option value="${item.name}">${label}</option>`);
                    });
                }
            }
        });
    }
  
    bind_events() {
        const els = {
            select: $('#element-select'),
            checkBtn: $('#check-btn'),
            status: $('#status-text'),
            chat: $('#chat-container'),
            input: $('#user-input'),
            send: $('#send-btn'),
            sidebar: $('#sidebar'),
            overlay: $('#mobile-overlay'),
            menuBtn: $('#menu-btn'),
            closeBtn: $('#close-menu-btn'),
            docInfo: $('#doc-info')
        };
  
        const toggleMenu = (show) => {
            if(show) { els.sidebar.addClass('is-open'); els.overlay.addClass('is-active'); }
            else { els.sidebar.removeClass('is-open'); els.overlay.removeClass('is-active'); }
        };
  
        els.menuBtn.on('click', () => toggleMenu(true));
        els.closeBtn.on('click', () => toggleMenu(false));
        els.overlay.on('click', () => toggleMenu(false));
  
        if(window.innerWidth > 992) {
            els.closeBtn.hide();
        }
  
        window.addEventListener('resize', () => {
            if(window.innerWidth > 992) { els.closeBtn.hide(); toggleMenu(false); }
            else { els.closeBtn.show(); }
        });
  
        els.select.on('change', async () => {
             const name = els.select.val();
             this.setStatus('جاري جلب البيانات...', 'var(--text-secondary)');
             try {
                 this.currentDoc = await this.get_doc(name);
                 const reqCount = this.currentDoc.requirements ? this.currentDoc.requirements.length : 0;
                 const proofCount = this.currentDoc.proof_document ? this.currentDoc.proof_document.length : 0;
                 
                 $('#req-count').text(reqCount);
                 $('#proof-count').text(proofCount);
                 els.docInfo.slideDown();
                 this.setStatus('جاهز للتدقيق', 'var(--primary)');
             } catch(e) {
                 this.setStatus('خطأ في جلب البيانات', 'var(--status-error-text)');
             }
        });
  
        els.checkBtn.on('click', async () => {
            if(!this.currentDoc) return this.setStatus('اختر المعيار أولاً', 'var(--status-error-text)');
            
            const proofs = this.currentDoc.proof_document || [];
            if(proofs.length === 0) {
                alert("عذراً، لا توجد ملفات مرفقة في جدول (Proof Document) لهذا العنصر.");
                return;
            }
  
            this.setStatus('جاري تحميل وقراءة الملفات... ⏳', 'var(--text-primary)');
            els.checkBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> جاري التحليل...');
            if(window.innerWidth <= 992) toggleMenu(false); 
  
            try {
                this.fullProofText = await this.process_all_proofs(proofs);
                
                if(!this.fullProofText.trim()) {
                     throw new Error("لم يتم العثور على نصوص قابلة للقراءة داخل ملفات PDF المرفقة. تأكد من أن الملفات ليست صوراً ممسوحة ضوئياً.");
                }
  
                await this.init_gemini();
  
                this.setStatus('تم تحليل الملفات! ✅', 'var(--status-success-text)');
                els.input.prop('disabled', false).focus();
                els.send.prop('disabled', false);
                els.checkBtn.hide();
  
                this.add_message('ai', `تمت قراءة ملفات الإثبات بنجاح. جاري تقييم حالة القبول...`);
                this.perform_audit();
  
            } catch(e) {
                console.error(e);
                this.setStatus('خطأ: ' + e.message, 'var(--status-error-text)');
                this.add_message('ai', `❌ حدث خطأ: ${e.message}`);
                els.checkBtn.prop('disabled', false).html('بدء التدقيق الآلي <i class="fa fa-robot"></i>');
            }
        });
  
        const handleSend = () => {
            const text = els.input.val().trim();
            if(!text) return;
            this.add_message('user', text);
            els.input.val('').prop('disabled', true);
            
            // إرسال كـ HTML مباشر لتخطي الـ Markdown (لأيقونة التحميل)
            const loadId = this.add_message('ai', '<i class="fa fa-circle-notch fa-spin"></i> جاري التفكير...', true);
            
            this.generate_response(text).then(response => {
                $(`#${loadId}`).remove();
                this.add_message('ai', response);
                els.input.prop('disabled', false).focus();
            }).catch(err => {
                $(`#${loadId} .msg-bubble`).html('عذراً، حدث خطأ.');
                els.input.prop('disabled', false);
            });
        };
  
        els.send.on('click', handleSend);
        els.input.on('keypress', (e) => { if(e.which === 13) handleSend(); });
    }
  
    async get_doc(name) {
        return new Promise((resolve, reject) => {
            frappe.call({
                method: 'frappe.client.get',
                args: { doctype: 'Elements-2024', name: name },
                callback: (r) => r.message ? resolve(r.message) : reject()
            });
        });
    }
  
    async process_all_proofs(proofs) {
        let combinedText = "";
        for (let i = 0; i < proofs.length; i++) {
            const filesToCheck = [proofs[i].attachments, proofs[i].attachments2];
            for(const fileUrl of filesToCheck) {
                if(!fileUrl) continue;
                if(fileUrl.toLowerCase().endsWith('.pdf')) {
                    const fullUrl = window.location.origin + fileUrl;
                    try {
                        const text = await this.extract_text_from_url(fullUrl);
                        combinedText += `\n--- FILE ATTACHED: ${fileUrl.split('/').pop()} ---\n${text}\n`;
                    } catch(err) {
                        console.warn(`Failed to read ${fileUrl}`, err);
                    }
                }
            }
        }
        return combinedText;
    }
  
    async extract_text_from_url(url) {
        const response = await fetch(url);
        if(!response.ok) throw new Error("Failed to fetch file");
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const promises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            promises.push(pdf.getPage(i).then(page => page.getTextContent().then(c => c.items.map(item => item.str).join(' '))));
        }
        return (await Promise.all(promises)).join('\n');
    }
  
    async perform_audit() {
        // إرسال كـ HTML مباشر لتخطي الـ Markdown (لأيقونة التحميل)
        const loadId = this.add_message('ai', '<i class="fa fa-circle-notch fa-spin"></i> جاري التدقيق والتحليل الشامل...', true);
        
        const prompt = `
            TASK: Determine if the Proof Documents meet the Requirements.
            OUTPUT FORMAT: 
            Start strictly with either "VERDICT: ACCEPTED" or "VERDICT: NOT ACCEPTED".
            Then provide a summary of WHY.
            Then provide the details in markdown.
        `;
        
        try {
            const responseText = await this.generate_response(prompt);
            $(`#${loadId}`).remove();
            
            let uiHtml = "";
            let cleanText = responseText;
  
            // معالجة HTML بطاقة النتيجة (مبنية بنظام Block)
            if(responseText.includes("VERDICT: ACCEPTED")) {
                const summary = responseText.split('\n')[1] || "تم استيفاء جميع المتطلبات.";
                uiHtml = `
                <div class="result-card res-success">
                    <div class="res-card-header">
                        <div class="res-icon"><i class="fa fa-check-circle"></i></div>
                        <div class="res-content"><h4>مقبول (Accepted)</h4></div>
                    </div>
                    <p class="res-desc">${summary.replace('SUMMARY:', '')}</p>
                </div>`;
                cleanText = responseText.replace("VERDICT: ACCEPTED", "").replace(/SUMMARY:.*(\n|$)/, "");
            } else if (responseText.includes("VERDICT: NOT ACCEPTED")) {
                const summary = responseText.split('\n')[1] || "لم يتم استيفاء بعض المتطلبات.";
                uiHtml = `
                <div class="result-card res-fail">
                    <div class="res-card-header">
                        <div class="res-icon"><i class="fa fa-times-circle"></i></div>
                        <div class="res-content"><h4>مرفوض (Not Accepted)</h4></div>
                    </div>
                    <p class="res-desc">${summary.replace('SUMMARY:', '')}</p>
                </div>`;
                cleanText = responseText.replace("VERDICT: NOT ACCEPTED", "").replace(/SUMMARY:.*(\n|$)/, "");
            }
  
            // تحويل الجزء الخاص بالتفاصيل فقط إلى HTML عبر marked
            const parsedMarkdownText = marked.parse(cleanText);
            
            // دمجهم وإرسالهم للدالة (ونخبر الدالة بأن تتخطى التحويل لأننا قمنا به مسبقاً)
            this.add_message('ai', uiHtml + parsedMarkdownText, true);
  
        } catch(e) {
            $(`#${loadId} .msg-bubble`).html("حدث خطأ أثناء التدقيق التلقائي.");
        }
    }
  
    async generate_response(question) {
        if(!this.model) throw new Error("Model not initialized");
  
        let reqText = "No specific requirements.";
        if(this.currentDoc.requirements) {
            reqText = this.currentDoc.requirements
                .map((r, i) => `${i+1}. ${r['العنوان'] || r.requirement || 'No Title'}`)
                .join('\n');
        }
  
        const prompt = `
            Role: Strict Compliance Auditor.
            Task: Compare "Proof Documents" vs "Standard Requirements".
            Output Language: Arabic.
  
            Standard: ${this.currentDoc.number} - ${this.currentDoc.element}
  
            REQUIREMENTS:
            ${reqText}
  
            PROOF DOCUMENTS TEXT:
            ${this.fullProofText}
  
            USER COMMAND:
            ${question}
  
            INSTRUCTIONS:
            1. If ALL requirements are explicitly found in the text, verdict is ACCEPTED.
            2. If ANY requirement is missing or partial, verdict is NOT ACCEPTED.
            3. Start response EXACTLY with "VERDICT: ACCEPTED" or "VERDICT: NOT ACCEPTED".
            4. Line 2 must be "SUMMARY: [One sentence reason]".
            5. Line 3+ must be detailed justification.
        `;
  
        const result = await this.model.generateContent(prompt);
        return (await result.response).text();
    }
  
    async init_gemini() {
        const { GoogleGenerativeAI } = await import("https://esm.run/@google/generative-ai");
        this.genAI = new GoogleGenerativeAI(this.API_KEY);
        try {
            this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
            await this.model.generateContent("Test"); // quick ping
        } catch(e) {
            console.warn("Gemini 2.5 Exp failed, falling back");
            this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
        }
    }
  
    setStatus(msg, color) {
        const el = $('#status-text');
        el.show().text(msg).css({
            'color': color,
            'border-color': color
        });
    }
  
    // أضفت مُعامل (skipParsing) لتخطي معالجة الـ Markdown إذا كان النص جاهزاً بـ HTML
    add_message(role, text, skipParsing = false) {
        const id = 'msg-' + Date.now();
        
        let content = text;
        
        // لا نستخدم marked إلا إذا كان الرد من الذكاء الاصطناعي ولم نطلب تخطيه
        if (role === 'ai' && !skipParsing) {
            content = marked.parse(text);
        }
  
        const html = `
            <div class="msg-wrapper ${role}-msg" id="${id}">
                <div class="msg-bubble">${content}</div>
            </div>
        `;
        const container = document.getElementById('chat-container');
        $(container).append(html);
        
        // Scroll to bottom smoothly
        setTimeout(() => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }, 50);
        
        return id;
    }
  }