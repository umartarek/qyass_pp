frappe.pages['ag-dashboard'].on_page_load = function(wrapper) {
    console.log("--- Qyass Dashboard: Blue Theme + Image Components ---");

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'لوحة قياس التحول الرقمي',
        single_column: true
    });

    page.set_title('');
    $(wrapper).find('.page-head').css('display', 'none');
    
    new MainDashboard(wrapper, page);
};

class MainDashboard {
    constructor(wrapper, page) {
        this.wrapper = $(wrapper);
        this.page = page;
        this.body = $(this.page.body);
        
        this.current_data = [];
        
        this.setup_styles();
        this.force_full_screen();
        this.render_skeleton();
        this.fetch_data();
    }

    force_full_screen() {
        const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-ag-dashboard { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header { display: none !important; }
            .layout-side-section { display: none !important; }
            .layout-main-section-wrapper { grid-template-columns: 1fr !important; padding: 0 !important; }
            .layout-main-section { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; }
            .page-container { background-color: #f0f9ff !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; min-height: 100vh;}
            .page-content { margin: 0 !important; }
        `;
        $('<style>').text(fullScreenStyle).appendTo(this.wrapper);
    }

    get_formatted_date() {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('ar-EG', options);
    }

    render_skeleton() {
        const currentDate = this.get_formatted_date();

        const layout = $(`
            <div class="modern-dashboard blue-theme" dir="rtl">
                <!-- Background Shapes from your code -->
                <div class="bg-shape shape-1"></div>
                <div class="bg-shape shape-2"></div>
                
                <!-- Navbar (Cloned exactly from your code) -->
                <div class="glass-header">
                    <div class="brand">
                        <img src='/files/Screenshot_2026-04-22_at_6.16.56_AM-removebg-preview.png' height='40px' width='50px'/>
                        <div class="header-titles ml-3" style="margin-right: 15px;">
                            <h3 class="m-0 text-white font-weight-bold" style="font-size: 1.2rem;">لوحة قياس التحول الرقمي</h3>
                            <span class="text-white" style="font-size: 0.8rem; opacity: 0.8;">التقرير الدوري للإنجاز</span>
                        </div>
                    </div>
                    <div class="user-actions">
                        <!-- MISA Countdown Component Start -->
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); color: black; padding: 6px 18px; border-radius: 30px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); font-family: 'Tajawal', sans-serif; direction: rtl; white-space: nowrap;">
                            <span>متبقي حتى الرفع الأول:</span>
                            <span style="background: #0284c7; color: #ffffff; padding: 2px 10px; border-radius: 20px; font-weight: 800; font-size: 1rem; text-align: center; min-width: 25px; line-height: 1.2;" id="countdown-timer">
                                43
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
                    
                    <!-- Loading State -->
                    <div id="loading-state" class="text-center w-100 p-5 glass-card mb-4">
                        <i class="fa fa-spinner fa-spin fa-3x" style="color: #0284c7;"></i>
                        <h4 class="mt-3 font-weight-bold text-blue-dark">جاري جلب وتحليل البيانات...</h4>
                    </div>

                    <div id="dashboard-content" style="display: none;">
                        <!-- Top 4 KPI Cards (Image Style, Blue Colors) -->
                        <div class="kpi-grid">
                            <!-- Card 1 -->
                            <div class="kpi-card border-blue fade-in-up" style="animation-delay: 50ms;">
                                <div class="kpi-header">
                                    <span class="trend-up"><i class="fa fa-arrow-trend-up"></i> 3.3% عن الأسبوع السابق</span>
                                </div>
                                <div class="kpi-body">
                                    <p class="kpi-label">نسبة الإنجاز الكلية</p>
                                    <h3 class="kpi-value text-blue-primary" id="kpi-total">0%</h3>
                                </div>
                                <div class="kpi-footer-bar">
                                    <div class="progress-bg"><div class="progress-fill bg-blue-primary" id="kpi-total-bar" style="width: 0%"></div></div>
                                </div>
                            </div>

                            <!-- Card 2 -->
                            <div class="kpi-card border-sky fade-in-up" style="animation-delay: 100ms;">
                                <div class="kpi-header icon-only">
                                    <div class="kpi-icon text-blue-bright bg-blue-light"><i class="fa fa-check-circle"></i></div>
                                </div>
                                <div class="kpi-body">
                                    <p class="kpi-label">المعايير المكتملة</p>
                                    <h3 class="kpi-value text-blue-dark" id="kpi-completed">0 / 0</h3>
                                    <p class="kpi-subtext">بناءً على المعايير المعتمدة</p>
                                </div>
                            </div>

                            <!-- Card 3 -->
                            <div class="kpi-card border-orange fade-in-up" style="animation-delay: 150ms;">
                                <div class="kpi-header icon-only">
                                    <div class="kpi-icon text-orange bg-orange-light"><i class="fa fa-triangle-exclamation"></i></div>
                                </div>
                                <div class="kpi-body">
                                    <p class="kpi-label">تحديات حرجة</p>
                                    <h3 class="kpi-value text-orange">03</h3>
                                    <p class="kpi-subtext">تتطلب تدخل توجيهي</p>
                                </div>
                            </div>

                            <!-- Card 4 -->
                            <div class="kpi-card border-purple fade-in-up" style="animation-delay: 200ms;">
                                <div class="kpi-header icon-only">
                                    <div class="kpi-icon text-purple bg-purple-light"><i class="fa fa-users"></i></div>
                                </div>
                                <div class="kpi-body">
                                    <p class="kpi-label">الإدارات الملتزمة</p>
                                    <h3 class="kpi-value text-purple" id="kpi-departments-pct">85%</h3>
                                    <p class="kpi-subtext">نسبة التفاعل مع متطلبات القياس</p>
                                </div>
                            </div>
                        </div>

                        <!-- Main Grid (Matching the Image) -->
                        <div class="main-content-grid mt-4">
                            
                            <!-- Right Column -->
                            <div class="right-panel">
                                <!-- Chart -->
                                <div class="glass-card p-4 fade-in-up" style="animation-delay: 250ms;">
                                    <div class="section-header">
                                        <h4 class="section-title text-blue-dark"><i class="fa fa-chart-bar ml-2 text-blue-primary"></i> تفصيل الإنجاز حسب محاور "قياس" الأساسية</h4>
                                    </div>
                                    <div id="main-axis-chart" style="height: 300px;"></div>
                                    <div class="chart-legend text-center mt-2">
                                        <span class="legend-item"><span class="box bg-blue-dark"></span> الأسبوع الحالي</span>
                                        <span class="legend-item"><span class="box bg-blue-light"></span> الأسبوع السابق</span>
                                    </div>
                                </div>

                                <!-- Departments List -->
                                <div class="glass-card p-4 mt-4 fade-in-up" style="animation-delay: 300ms;">
                                    <div class="section-header">
                                        <h4 class="section-title text-blue-dark"><i class="fa fa-users-cog ml-2 text-blue-primary"></i> تقدم الإدارات المسؤولة عن التنفيذ</h4>
                                    </div>
                                    <div class="departments-list mt-4" id="departments-container">
                                        <!-- Departments injected here -->
                                    </div>
                                </div>
                            </div>

                            <!-- Left Column -->
                            <div class="left-panel">
                                
                                <!-- Challenges -->
                                <div class="glass-card p-4 text-center fade-in-up" style="animation-delay: 350ms;">
                                    <h4 class="section-title justify-center mb-4 text-blue-dark"><i class="fa fa-triangle-exclamation text-orange ml-2"></i> أهم التحديات في التنفيذ</h4>
                                    <div class="challenges-list">
                                        <div class="challenge-item">
                                            <span class="ch-text">تكامل البيانات مع الجهات الخارجية</span>
                                            <span class="ch-badge badge-red">عالي</span>
                                        </div>
                                        <div class="challenge-item">
                                            <span class="ch-text">تحديث البنية التحتية لبعض الفروع</span>
                                            <span class="ch-badge badge-orange">متوسط</span>
                                        </div>
                                        <div class="challenge-item">
                                            <span class="ch-text">سد فجوة الكفاءات الرقمية المتخصصة</span>
                                            <span class="ch-badge badge-orange">متوسط</span>
                                        </div>
                                        <div class="challenge-item border-0">
                                            <span class="ch-text">الامتثال الكامل لسياسات الحوكمة الجديدة</span>
                                            <span class="ch-badge badge-yellow">شبه تام</span>
                                        </div>
                                    </div>
                                    <button class="btn-outline-blue w-100 mt-3">عرض سجل المخاطر الكامل</button>
                                </div>

                                <!-- Directives (Solid Blue instead of Dark Green) -->
                                <div class="solid-blue-card mt-4 fade-in-up" style="animation-delay: 400ms;">
                                    <h4 class="text-white mb-3 font-weight-bold"><i class="fa fa-info-circle ml-2"></i> توجيهات مقترحة</h4>
                                    <ul class="directives-list">
                                        <li>تسريع ربط الأنظمة مع "مركز المعلومات الوطني" لرفع نسبة معيار تكامل البيانات.</li>
                                        <li>اعتماد خطة تدريب مكثفة لأعضاء النيابة على الأنظمة الرقمية المطورة.</li>
                                        <li>تفعيل التقييم الذاتي الشهري لضمان جاهزية الدورة القادمة من "قياس".</li>
                                    </ul>
                                </div>

                                <!-- Readiness Indicators -->
                                <div class="glass-card p-4 mt-4 fade-in-up" style="animation-delay: 450ms;">
                                    <h4 class="section-title justify-center mb-4 text-blue-muted" style="font-size: 0.95rem;">مؤشرات الجاهزية الرقمية</h4>
                                    <div class="readiness-grid">
                                        <div class="readiness-box">
                                            <span class="r-title">التحول السحابي</span>
                                            <span class="r-value text-blue-primary">92%</span>
                                        </div>
                                        <div class="readiness-box">
                                            <span class="r-title">الأمن السيبراني</span>
                                            <span class="r-value text-blue-primary">88%</span>
                                        </div>
                                        <div class="readiness-box">
                                            <span class="r-title">رضا المستفيد</span>
                                            <span class="r-value text-blue-primary">76%</span>
                                        </div>
                                        <div class="readiness-box">
                                            <span class="r-title">كفاءة الإنفاق</span>
                                            <span class="r-value text-blue-primary">81%</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `);

        this.body.html(layout);
        this.body.find('#btn-export').on('click', () => window.print());

        // Fix Countdown script dynamically
        let daysLeft = Math.max(0, Math.ceil((new Date('2026-06-11T00:00:00') - new Date()) / 86400000));
        this.body.find('#countdown-timer').text(daysLeft);
    }

    fetch_data() {
        // Safe Logic: Fetching only from Parent Table (Elements-2024) to avoid Permission Errors
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Elements-2024',
                fields: ['name', 'department', 'custom_status'],
                limit_page_length: 0
            },
            callback: (r) => {
                this.current_data = r.message || [];
                this.process_data();
                this.render_dashboard();
            }
        });
    }

    process_data() {
        let total = this.current_data.length;
        let completed = 0;
        let departmentsMap = {};

        this.current_data.forEach(item => {
            let isDone = (item.custom_status === "تم الاعتماد");
            if (isDone) completed++;
            
            if (item.department) {
                if (!departmentsMap[item.department]) {
                    departmentsMap[item.department] = { total: 0, completed: 0 };
                }
                departmentsMap[item.department].total++;
                if (isDone) {
                    departmentsMap[item.department].completed++;
                }
            }
        });

        this.stats = {
            total: total,
            completed: completed,
            percent: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
            departments: departmentsMap
        };
    }

    render_dashboard() {
        this.body.find('#loading-state').hide();
        this.body.find('#dashboard-content').fadeIn(400);

        // Update Top KPIs
        this.body.find("#kpi-total").text(`${this.stats.percent}%`);
        this.body.find("#kpi-total-bar").css("width", `${this.stats.percent}%`);
        
        // If system is empty, fallback to image numbers for demo purposes
        let comp_text = this.stats.total > 0 ? `${this.stats.completed} / ${this.stats.total}` : "185 / 142";
        this.body.find("#kpi-completed").text(comp_text);

        this.render_departments();
        this.render_chart();
    }

    render_departments() {
        const container = this.body.find("#departments-container");
        container.empty();

        let depts = [];
        if (Object.keys(this.stats.departments).length > 0) {
            Object.keys(this.stats.departments).forEach(key => {
                let d = this.stats.departments[key];
                let p = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                let status = p > 80 ? {t:'متقدم', c:'badge-light-green'} : (p > 50 ? {t:'مستقر', c:'badge-light-blue'} : {t:'يحتاج تحسن', c:'badge-light-orange'});
                depts.push({ name: key, percent: p, status: status.t, badge: status.c });
            });
        } else {
            // Static Data matching Image if DB is empty
            depts = [
                { name: "مركز تقنية المعلومات", percent: 92, status: "متقدم", badge: "badge-light-green" },
                { name: "إدارة التحول الرقمي", percent: 88, status: "متقدم", badge: "badge-light-green" },
                { name: "التميز المؤسسي", percent: 74, status: "مستقر", badge: "badge-light-blue" },
                { name: "الإدارة القانونية", percent: 68, status: "يحتاج تحسن", badge: "badge-light-orange" },
                { name: "الموارد البشرية", percent: 81, status: "مستقر", badge: "badge-light-blue" },
            ];
        }

        // Sort desc
        depts.sort((a, b) => b.percent - a.percent);

        depts.forEach(d => {
            let html = `
                <div class="dept-row">
                    <div class="dept-header-info">
                        <span class="dept-status ${d.badge}">${d.status}</span>
                        <span class="dept-name text-blue-dark">${d.name}</span>
                    </div>
                    <div class="dept-progress-area">
                        <span class="dept-percent text-blue-primary">${d.percent}%</span>
                        <div class="progress-bg"><div class="progress-fill bg-blue-primary" style="width: ${d.percent}%"></div></div>
                    </div>
                </div>
            `;
            container.append(html);
        });
    }

    render_chart() {
        if (typeof frappe.Chart !== "undefined") {
            const data = {
                labels: ["القيادة والتخطيط", "البنية التحتية", "الأنظمة والتطبيقات", "البيانات والذكاء الاصطناعي", "الأمن السيبراني", "القدرات الرقمية"],
                datasets: [
                    {
                        name: "الأسبوع الحالي", type: "bar",
                        values: [85, 72, 90, 78, 82, 88]
                    },
                    {
                        name: "الأسبوع السابق", type: "bar",
                        values: [80, 68, 85, 75, 70, 85]
                    }
                ]
            };

            // Using Blue Theme colors for Chart
            new frappe.Chart("#main-axis-chart", {
                data: data,
                type: 'bar',
                height: 300,
                colors: ['#0369a1', '#bae6fd'],
                barOptions: { spaceRatio: 0.2, stacked: 0 },
                axisOptions: { xIsSeries: 0, xAxisMode: 'tick' },
                tooltipOptions: { formatTooltipY: d => d + '%' }
            });
        }
    }

    setup_styles() {
        if ($('#qyass-dashboard-mixed-css').length) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

            .blue-theme { font-family: 'Tajawal', sans-serif; color: #0c4a6e; position: relative; overflow-x: hidden; }
            .bg-shape { position: fixed; border-radius: 50%; filter: blur(90px); z-index: 0; opacity: 0.15; pointer-events: none;}
            .shape-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: #0284c7; }
            .shape-2 { bottom: -10%; left: -10%; width: 600px; height: 600px; background: #38bdf8; }
            
            .dashboard-container { position: relative; z-index: 2; max-width: 1400px; margin: 0 auto; padding: 25px; }
            
            /* Navbar Cloned Exactly */
            .glass-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 15px 35px; background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%) !important;
                backdrop-filter: blur(15px); position: sticky; top: 0; z-index: 100;
                box-shadow: 0 4px 20px rgba(2, 132, 199, 0.05);
            }
            .brand { display: flex; align-items: center; }
            .action-btn { background: white !important; border: 1px solid #bae6fd; color: #0284c7; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 700; font-family: 'Tajawal'; display: inline-flex; align-items: center; gap: 5px;}
            .action-btn:hover { background: #f0f9ff !important; box-shadow: 0 2px 10px rgba(2,132,199,0.15); transform: translateY(-1px);}

            /* Glass Cards */
            .glass-card {
                background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(25px);
                border: 1px solid #e0f2fe; box-shadow: 0 10px 30px rgba(2,132,199,0.06); border-radius: 16px;
            }

            /* Utilities */
            .text-blue-dark { color: #082f49; }
            .text-blue-primary { color: #0284c7; }
            .text-blue-bright { color: #0ea5e9; }
            .text-blue-muted { color: #64748b; }
            .text-orange { color: #ea580c; }
            .text-purple { color: #7c3aed; }
            .text-white { color: white; }

            .bg-blue-primary { background-color: #0284c7; }
            .bg-blue-dark { background-color: #0369a1; }
            .bg-blue-light { background-color: #e0f2fe; }
            .bg-orange-light { background-color: #ffedd5; }
            .bg-purple-light { background-color: #ede9fe; }

            /* KPIs Grid (Image Layout) */
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
            .kpi-card {
                background: white; border-radius: 16px; padding: 20px;
                box-shadow: 0 4px 15px rgba(2,132,199,0.04); border: 1px solid #e0f2fe;
                display: flex; flex-direction: column; justify-content: space-between; position: relative;
            }
            .border-blue { border-right: 5px solid #0284c7; }
            .border-sky { border-right: 5px solid #38bdf8; }
            .border-orange { border-right: 5px solid #f97316; }
            .border-purple { border-right: 5px solid #8b5cf6; }

            .kpi-header { display: flex; justify-content: flex-start; margin-bottom: 10px; }
            .kpi-header.icon-only { justify-content: center; }
            .kpi-icon { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
            .trend-up { background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }

            .kpi-body { text-align: center; }
            .kpi-label { font-size: 0.95rem; color: #64748b; margin-bottom: 5px; font-weight: 700; }
            .kpi-value { font-size: 2.5rem; font-weight: 800; margin: 0; line-height: 1.2; direction: ltr; }
            .kpi-subtext { font-size: 0.8rem; color: #94a3b8; margin-top: 5px; }

            .kpi-footer-bar { margin-top: 15px; }
            .progress-bg { background: #f1f5f9; height: 6px; border-radius: 3px; width: 100%; overflow: hidden; }
            .progress-fill { height: 100%; border-radius: 3px; transition: width 1s; }

            /* Main Layout */
            .main-content-grid { display: grid; grid-template-columns: 7fr 3fr; gap: 25px; }
            
            .section-header { margin-bottom: 20px; }
            .section-title { font-size: 1.1rem; font-weight: 800; margin: 0; display: flex; align-items: center; }
            .justify-center { justify-content: center; }

            /* Chart Legend */
            .chart-legend { display: flex; justify-content: center; gap: 20px; }
            .legend-item { font-size: 0.85rem; color: #64748b; display: flex; align-items: center; gap: 6px; font-weight: 600;}
            .box { width: 12px; height: 12px; border-radius: 3px; }

            /* Departments List */
            .dept-row { display: flex; align-items: center; margin-bottom: 20px; gap: 15px; }
            .dept-header-info { width: 160px; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
            .dept-name { font-size: 0.95rem; font-weight: 800; }
            .dept-status { font-size: 0.75rem; padding: 3px 10px; border-radius: 12px; font-weight: 800; }
            .badge-light-green { background: #d1fae5; color: #065f46; }
            .badge-light-blue { background: #e0f2fe; color: #0369a1; }
            .badge-light-orange { background: #ffedd5; color: #9a3412; }
            .dept-progress-area { flex-grow: 1; display: flex; align-items: center; gap: 15px; flex-direction: row-reverse; }
            .dept-percent { font-size: 0.9rem; font-weight: 800; width: 35px; text-align: left; direction: ltr; }

            /* Challenges */
            .challenges-list { display: flex; flex-direction: column; gap: 15px; }
            .challenge-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 12px; }
            .ch-text { font-size: 0.9rem; font-weight: 700; color: #334155; text-align: right; }
            .ch-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; font-weight: 800; white-space: nowrap; }
            .badge-red { background: #fee2e2; color: #b91c1c; }
            .badge-orange { background: #ffedd5; color: #c2410c; }
            .badge-yellow { background: #fef9c3; color: #854d0e; }
            .btn-outline-blue { background: transparent; border: 1px solid #0284c7; color: #0284c7; padding: 10px; border-radius: 8px; font-weight: 800; font-family: 'Tajawal'; cursor: pointer; transition: 0.2s;}
            .btn-outline-blue:hover { background: #f0f9ff; }

            /* Directives (Solid Blue) */
            .solid-blue-card { background: linear-gradient(135deg, #0369a1, #0ea5e9); border-radius: 16px; padding: 25px; box-shadow: 0 10px 25px rgba(2,132,199,0.2);}
            .directives-list { padding-right: 20px; margin: 0; font-size: 0.9rem; line-height: 1.8; color: white;}
            .directives-list li { margin-bottom: 10px; font-weight: 600;}

            /* Readiness */
            .readiness-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .readiness-box { background: white; border: 1px solid #e0f2fe; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 2px 10px rgba(2,132,199,0.03);}
            .r-title { display: block; font-size: 0.85rem; color: #64748b; margin-bottom: 5px; font-weight: 700; }
            .r-value { display: block; font-size: 1.5rem; font-weight: 800; }

            /* Utils */
            .w-100 { width: 100%; } .mt-3 { margin-top: 15px; } .mt-4 { margin-top: 25px; } .mb-3 { margin-bottom: 15px; } .mb-4 { margin-bottom: 20px; } .ml-2 { margin-left: 8px; } .ml-3 { margin-left: 15px; }
            .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; transform: translateY(15px); }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

            @media (max-width: 1200px) {
                .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                .main-content-grid { grid-template-columns: 1fr; }
                .right-panel { order: 2; }
                .left-panel { order: 1; }
            }
            @media (max-width: 768px) {
                .kpi-grid { grid-template-columns: 1fr; }
                .glass-header { flex-direction: column; gap: 15px; text-align: center;}
                .brand { flex-direction: column; }
                .user-actions { flex-wrap: wrap; justify-content: center;}
            }
        `;

        $('<style id="qyass-dashboard-mixed-css">').text(css).appendTo('head');
    }
}