frappe.pages['tree'].on_page_load = function(wrapper) {
    console.log("--- Strategy Tree Dashboard: Initializing ---");

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'شجرة قياس ',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    new StrategyTreeDashboard(wrapper, page);
};

class StrategyTreeDashboard {
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
            .page-wrapper { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            #page-tree { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
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

                    </div>
                    <div class="user-actions">
                        <button class="action-btn" onclick="window.history.back();">
                            <i class="fa fa-arrow-right"></i> رجوع
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <!-- Hero Section -->
                    <div class="hero-section">
                        <div class="hero-text">
                            <h1>شجرة قياس </h1>
                            <p>استعراض الرؤى، الأبعاد، والمعايير مع مستندات الإثبات مرتبة تسلسلياً.</p>
                            <button class="hero-btn" id="btn-refresh-tree">
                                <i class="fa fa-refresh"></i> تحديث البيانات
                            </button>
                        </div>
                        
                        <!-- Stats -->
                        <div class="hero-stats">
                            <div class="stat-card glass-card">
                                <div class="stat-icon"><i class="fa fa-bullseye"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-visions">...</span>
                                    <span class="stat-desc">منظار</span>
                                </div>
                            </div>
                            <div class="stat-card glass-card">
                                <div class="stat-icon" style="color: var(--c-dim); background: rgba(39, 174, 96, 0.1);"><i class="fa fa-sitemap"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-dims">...</span>
                                    <span class="stat-desc">محور</span>
                                </div>
                            </div>
                            <div class="stat-card glass-card">
                                <div class="stat-icon" style="color: var(--c-elem); background: rgba(142, 68, 173, 0.1);"><i class="fa fa-cube"></i></div>
                                <div class="stat-info">
                                    <span class="stat-num" id="stat-elems">...</span>
                                    <span class="stat-desc">معيار</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tree Area -->
                    <div class="list-section">
                        <div class="glass-card tree-container-wrapper">
                            <div id="tree-root" class="tree-container">
                                <div class="text-center p-5" style="color: #0369a1;">
                                    <i class="fa fa-circle-o-notch fa-spin fa-3x"></i>
                                    <div class="mt-3 font-weight-bold">جاري بناء الشجرة...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.body.html(layout);

        this.body.find('#btn-refresh-tree').on('click', () => {
            let icon = this.body.find('#btn-refresh-tree i');
            icon.addClass('fa-spin');
            this.fetch_data().finally(() => icon.removeClass('fa-spin'));
        });

        this.attach_tree_events();
    }

    fetch_data() {
        this.body.find('#tree-root').html(`
            <div class="text-center p-5" style="color: #0369a1;">
                <i class="fa fa-circle-o-notch fa-spin fa-3x"></i>
                <div class="mt-3 font-weight-bold">جاري تحميل البيانات...</div>
            </div>
        `);

        const fetch = (dt, fields, orderBy = 'name asc') => frappe.call({
            method: 'frappe.client.get_list',
            args: { doctype: dt, fields: fields, limit_page_length: 99999, order_by: orderBy }
        }).then(r => r.message || []);

        return Promise.all([
            fetch('Vision', ['name']),
            fetch('Dimension', ['name', 'vision']),
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'Elements-2024',
                    fields: [
                        'name', 'dimension', 'number',
                        '`tabProof Document`.document_name',
                        '`tabProof Document`.attachments',
                        '`tabProof Document`.attachments2'
                    ],
                    limit_page_length: 99999,
                    order_by: 'number asc' // الترتيب الأولي من قاعدة البيانات
                }
            }).then(r => r.message || [])
        ]).then(([visions, dimensions, rawElements]) => {
            
            this.body.find('#stat-visions').text(visions.length);
            this.body.find('#stat-dims').text(dimensions.length);
            
            const processedElements = this.processRawElements(rawElements);
            this.body.find('#stat-elems').text(processedElements.length);

            // بناء الهيكل مع فرز جافاسكربت لضمان دقة الأرقام (Natural Sort)
            const tree = this.buildHierarchy(visions, dimensions, processedElements);
            const html = this.generateHTML(tree);
            
            if (!html) {
                 this.body.find('#tree-root').html(`
                    <div class="empty-state">
                        <i class="fa fa-tree" style="font-size:3rem; opacity:0.3; margin-bottom:15px"></i>
                        <h3>لا توجد بيانات للعرض</h3>
                    </div>
                 `);
            } else {
                 this.body.find('#tree-root').html(`<ul class="tree">${html}</ul>`);
            }

        }).catch(err => {
            console.error(err);
            this.body.find('#tree-root').html(`<div class="alert alert-danger text-center m-4">خطأ في جلب البيانات: ${err.message}</div>`);
        });
    }

    processRawElements(rows) {
        const elementsMap = {};
        const elementsList = [];

        rows.forEach(row => {
            if (!elementsMap[row.name]) {
                const newEl = {
                    name: row.name, dimension: row.dimension, number: row.number, docs: []
                };
                elementsMap[row.name] = newEl;
                elementsList.push(newEl);
            }
            if (row.document_name) {
                elementsMap[row.name].docs.push({
                    title: row.document_name, att1: row.attachments, att2: row.attachments2, parent: row.name
                });
            }
        });
        return elementsList;
    }

    buildHierarchy(visions, dimensions, elements) {
        const clean = s => String(s || '').trim();
        
        // دالة الفرز الطبيعي (تضمن أن 1.2 يظهر قبل 1.10)
        const naturalSort = (a, b, key) => {
            return (a[key] || "").localeCompare((b[key] || ""), undefined, { numeric: true, sensitivity: 'base' });
        };

        const elemMap = {};
        elements.forEach(el => {
            const p = clean(el.dimension);
            if(p) (elemMap[p] = elemMap[p] || []).push(el);
        });

        // فرز المعايير داخل كل بعد
        Object.keys(elemMap).forEach(key => {
            elemMap[key].sort((a, b) => naturalSort(a, b, 'number'));
        });

        const dimMap = {};
        dimensions.forEach(dim => {
            dim.children = elemMap[clean(dim.name)] || [];
            const p = clean(dim.vision);
            if(p) (dimMap[p] = dimMap[p] || []).push(dim);
        });

        // فرز الأبعاد داخل كل رؤية
        Object.keys(dimMap).forEach(key => {
            dimMap[key].sort((a, b) => naturalSort(a, b, 'name'));
        });

        // فرز الرؤى نفسها
        visions.sort((a, b) => naturalSort(a, b, 'name'));

        return visions.map(v => {
            v.children = dimMap[clean(v.name)] || [];
            return v;
        });
    }

    generateHTML(nodes, level = 'vision') {
        if (!nodes || !nodes.length) return '';
        
        return nodes.map(node => {
            let children = [];
            let nextLevel = '';
            
            if (level === 'vision') { children = node.children; nextLevel = 'dim'; }
            else if (level === 'dim') { children = node.children; nextLevel = 'elem'; }
            else if (level === 'elem') { children = node.docs; nextLevel = 'doc'; }
            
            const hasKids = children && children.length > 0;

            let type = 'vision', icon = 'fa-bullseye', label = 'منظار', title = node.name, sub = 'Level 1';

            if (level === 'dim') { type = 'dim'; icon = 'fa-sitemap'; label = 'محور'; sub = 'Level 2'; }
            if (level === 'elem') { type = 'elem'; icon = 'fa-cube'; label = 'معيار'; sub = node.number || ''; }
            if (level === 'doc') { 
                type = 'doc'; icon = 'fa-file-text-o'; label = 'ملف'; 
                title = node.title || 'بدون عنوان'; sub = 'مستند إثبات';
            }

            const routeType = level === 'doc' ? 'Elements-2024' : (level === 'elem' ? 'Elements-2024' : (level === 'dim' ? 'Dimension' : 'Vision'));
            const routeName = level === 'doc' ? node.parent : node.name;

            let attHtml = '';
            if (level === 'doc' && (node.att1 || node.att2)) {
                attHtml = '<div class="att-wrapper">';
                if(node.att1) attHtml += `<div class="att-chip preview-btn" data-url="${node.att1}"><i class="fa fa-eye"></i> عرض المرفق 1</div>`;
                if(node.att2) attHtml += `<div class="att-chip preview-btn" data-url="${node.att2}"><i class="fa fa-eye"></i> عرض المرفق 2</div>`;
                attHtml += '</div>';
            }

            const collapsedClass = hasKids ? 'collapsed' : '';

            return `
                <li class="${collapsedClass}">
                    <div class="node-card type-${type}" data-doctype="${routeType}" data-name="${routeName}">
                        <div class="node-icon"><i class="fa ${icon}"></i></div>
                        <div class="node-info">
                            <h4 class="node-title">${title}</h4>
                            <span class="node-sub">${label} ${sub ? '• ' + sub : ''}</span>
                            ${attHtml}
                        </div>
                        ${hasKids ? '<div class="toggler"><i class="fa fa-chevron-down"></i></div>' : ''}
                    </div>
                    ${hasKids ? `<ul>${this.generateHTML(children, nextLevel)}</ul>` : ''}
                </li>
            `;
        }).join('');
    }

    attach_tree_events() {
        const root = this.body;
        root.on('click', '.node-card', function(e) {
            if ($(e.target).closest('.preview-btn').length) {
                e.stopPropagation();
                e.preventDefault();
                const url = $(e.target).closest('.preview-btn').data('url');
                if(frappe.ui.FilePreview) {
                    new frappe.ui.FilePreview({
                        file: { file_url: url, file_name: url.split('/').pop() }
                    }).show();
                } else {
                    window.open(url, '_blank');
                }
                return;
            }
            e.stopPropagation();
            $(this).closest('li').toggleClass('collapsed');
        });
    }

    setup_styles() {
        if ($('#qyass-tree-theme-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            :root {
                --bg-main: #f0f9ff;
                --line-color: #cbd5e1;
                --c-vision: #0369a1; 
                --c-dim:    #27ae60; 
                --c-elem:   #8e44ad;
                --c-doc:    #e67e22;
            }

            .modern-dashboard {
                font-family: 'Tajawal', sans-serif;
                color: #0c4a6e; min-height: 100vh; background: var(--bg-main);
                padding-bottom: 50px; position: relative;
                overflow-x: clip; 
            }
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.5; }
            .shape-1 { top: -10%; right: -5%; width: 400px; height: 400px; background: #0ea5e9; }
            .shape-2 { bottom: -10%; left: -10%; width: 500px; height: 500px; background: #22d3ee; }
            
            .dashboard-container { 
                position: relative; z-index: 2; max-width: 1200px; 
                margin: 0 auto; padding: 20px; 
                padding-top: 100px; 
            }
            
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 30px; 
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%) !important;
                backdrop-filter: blur(10px); 
                position: fixed; top: 0; left: 0; right: 0; width: 100%;
                z-index: 1000; box-sizing: border-box;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: white; }
            .action-btn { background: white !important; border: none; color: #0369a1; padding: 6px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; transition: 0.2s; }
            .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

            .hero-section { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin: 10px 0 30px 0; gap: 20px; }
            .hero-text h1 { font-size: 2.2rem; margin: 0 0 10px 0; color: #0f172a; font-weight: 800; }
            .hero-text p { color: #64748b; font-size: 1.1rem; margin-bottom: 15px; }
            .hero-btn {
                background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
                color: white; border: none; padding: 10px 25px; border-radius: 50px;
                font-weight: 700; cursor: pointer; box-shadow: 0 5px 15px rgba(3, 105, 161, 0.3);
                display: inline-flex; align-items: center; gap: 8px; transition: 0.2s;
            }
            .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(3, 105, 161, 0.4); }

            .hero-stats { display: flex; gap: 15px; flex-wrap: wrap; }
            .glass-card {
                background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 1);
                box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-radius: 16px;
            }
            .stat-card { display: flex; align-items: center; gap: 15px; padding: 15px 25px; min-width: 160px; flex: 1; }
            .stat-icon { width: 45px; height: 45px; background: rgba(14, 165, 233, 0.1); color: #0369a1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
            .stat-num { font-size: 1.6rem; font-weight: 800; line-height: 1; color: #0f172a; display: block; margin-bottom: 3px; }
            .stat-desc { font-size: 0.85rem; color: #64748b; font-weight: 600; }

            .list-section { margin-top: 30px; }
            .tree-container-wrapper { padding: 30px; overflow-x: auto; min-height: 500px; }
            .tree-container { direction: rtl; font-family: 'Tajawal', sans-serif; }

            ul.tree, ul.tree ul { list-style: none; margin: 0; padding: 0; }
            ul.tree ul { margin-right: 35px; position: relative; }
            
            ul.tree ul::before {
                content: ""; position: absolute; top: 0; bottom: 0; right: -18px;
                border-right: 2px dashed var(--line-color);
            }
            
            ul.tree li { margin: 0; padding: 12px 0; position: relative; }
            
            ul.tree ul li::before {
                content: ""; position: absolute; top: 38px; right: -18px; width: 18px;
                border-top: 2px dashed var(--line-color);
            }
            
            ul.tree ul li:last-child::after {
                content: ""; position: absolute; top: 38px; bottom: 0; right: -20px; width: 4px;
                background: #fff; 
                z-index: 1;
            }

            .node-card {
                background: #ffffff; border-radius: 12px; padding: 12px 18px;
                display: inline-flex; align-items: flex-start; gap: 15px;
                min-width: 320px; max-width: 600px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.04);
                border: 1px solid #f1f5f9; cursor: pointer;
                position: relative; z-index: 2; transition: all 0.3s ease;
            }
            .node-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 10px 25px rgba(0,0,0,0.08); border-color: #e2e8f0; }

            .node-card::before {
                content: ''; position: absolute; top: 10px; bottom: 10px; right: 0; width: 5px; border-radius: 5px 0 0 5px;
            }
            .type-vision::before { background: var(--c-vision); }
            .type-dim::before { background: var(--c-dim); }
            .type-elem::before { background: var(--c-elem); }
            .type-doc::before { background: var(--c-doc); }

            .node-icon { 
                margin-top: 2px; font-size: 18px; width: 35px; height: 35px; 
                display: flex; align-items: center; justify-content: center;
                border-radius: 8px; background: #f8fafc;
            }
            .type-vision .node-icon { color: var(--c-vision); background: rgba(3, 105, 161, 0.1); }
            .type-dim .node-icon { color: var(--c-dim); background: rgba(39, 174, 96, 0.1); }
            .type-elem .node-icon { color: var(--c-elem); background: rgba(142, 68, 173, 0.1); }
            .type-doc .node-icon { color: var(--c-doc); background: rgba(230, 126, 34, 0.1); }

            .node-info { flex: 1; }
            .node-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; line-height: 1.4; }
            .node-sub { display: inline-block; font-size: 0.75rem; color: #64748b; margin-top: 4px; font-weight: 600; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }

            .att-wrapper { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
            .att-chip {
                font-size: 0.8rem; font-weight: 600; background: #f0f9ff; color: #0369a1; padding: 5px 12px;
                border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 6px;
                transition: 0.2s; border: 1px solid #bae6fd;
            }
            .att-chip:hover { background: #0369a1; color: #fff; border-color: #0369a1; transform: translateY(-2px); }

            .toggler { 
                width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; 
                border-radius: 50%; color: #94a3b8; background: #f8fafc; border: 1px solid #e2e8f0;
                transition: 0.3s; margin-top: 2px;
            }
            .node-card:hover .toggler { background-color: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
            
            li.collapsed > ul { display: none !important; }
            li.collapsed > .node-card .toggler { transform: rotate(90deg); }

            .empty-state { text-align: center; padding: 40px; color: #64748b; }

            @media (max-width: 768px) {
                .tree-container-wrapper { padding: 15px; }
                ul.tree ul { margin-right: 18px; }
                .node-card { width: 100%; min-width: unset; box-sizing: border-box; }
                .hero-section { justify-content: center; text-align: center; }
            }
        `;

        $('<style id="qyass-tree-theme-css">').text(css).appendTo('head');
    }
}