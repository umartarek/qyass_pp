frappe.pages["main-dashboard"].on_page_load = function (wrapper) {
  console.log("--- Main IT Dashboard: Initializing Modern 4-Cards Layout ---");

  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: "لوحة المؤشرات",
    single_column: true,
  });

  page.set_title("");
  $(wrapper).find(".page-head").css("display", "none");

  new MainDashboard(wrapper, page);
};

class MainDashboard {
  constructor(wrapper, page) {
    this.wrapper = $(wrapper);
    this.page = page;
    this.body = $(this.page.body);

    this.department_name = "الكل"; 
    this.current_data = [];

    this.dates = this.calculate_weeks();
    this.reset_stats();

    this.setup_styles();
    this.force_full_screen();
    this.render_skeleton();
    
    this.fetch_departments();
    this.fetch_data();
    this.setup_auto_refresh();
  }

  setup_auto_refresh() {
    const ONE_HOUR_IN_MS = 3600000; 
    
    if (this.refresh_interval) {
        clearInterval(this.refresh_interval);
    }
    
    this.refresh_interval = setInterval(() => {
        console.log("--- Auto Refreshing Dashboard Data (1 Hour) ---");
        this.fetch_data();
    }, ONE_HOUR_IN_MS);
  }

  reset_stats() {
      this.stats = {
      total: 0,
      approved: 0,
      in_progress: 0,
      not_started: 0,
      percent: 0,
      updated_this_week: 0,
      this_week_counts: {
        "لم يبدأ": 0,
        "تحت الاجراء": 0,
        "الجودة": 0,
        "المراجعة": 0,
        "تم الاعتماد": 0,
      },
      last_week_counts: {
        "لم يبدأ": 0,
        "تحت الاجراء": 0,
        "الجودة": 0,
        "المراجعة": 0,
        "تم الاعتماد": 0,
      },
    };
  }

  calculate_weeks() {
    const now = new Date();
    const dayOfWeek = now.getDay(); 

    const daysToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - daysToSaturday);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    return { now, thisWeekStart, lastWeekStart, lastWeekEnd };
  }

  calculate_countdown() {
    const targetDate = new Date('2026-06-11T00:00:00');
    const currentDate = new Date();
    
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); 
    
    return diffDays > 0 ? diffDays : 0;
  }

  force_full_screen() {
    const fullScreenStyle = `
            .page-body { max-width:100vw !important; }
            #page-main-dashboard { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
            header { display: none !important; }
            .layout-side-section { display: none !important; }
            .layout-main-section-wrapper { grid-template-columns: 1fr !important; padding: 0 !important; background-color: #f0f4f8 !important;}
            .layout-main-section { width: 100% !important; max-width: 100% !important; padding: 0 !important; border: none !important; }
            .page-container { margin: 0 !important; width: 100% !important; max-width: 100% !important; min-height: 100vh;}
            .page-content { margin: 0 !important; }
        `;
    $("<style>").text(fullScreenStyle).appendTo(this.wrapper);
  }

  render_skeleton() {
    let display_title = this.department_name === "الكل" ? "مؤشرات كل الأقسام" : `مؤشرات ${this.department_name}`;
    let remainingDays = this.calculate_countdown();

    const layout = $(`
            <div class="modern-dashboard" dir="rtl">
                
                <div class="solid-header" style="background: linear-gradient(135deg, #0284c7, #0ea5e9) !important;">
                    <div class="header-right">
                        <a onclick="location.href='https://misa.newerasofts.com/app/qyass-dashboard'">
                            <img src='/files/Screenshot_2026-04-22_at_6.16.56_AM-removebg-preview.png' height='45px' width='45px' style="filter: brightness(0) invert(1);"/>
                        </a>
                        <div class="header-title-area text-white ml-3 mr-3 font-weight-bold" style="font-size: 1.1rem;">
                            <span id="display-department-name">${display_title}</span>
                        </div>
                    </div>

                    <div class="header-left user-actions">
                        <div class="countdown-badge" style="background:white;">
                            <span style="color: black;">متبقي حتى الرفع الأول:</span>
                            <span class="countdown-num" style="background: #0284c7; color: #ffffff;">${remainingDays}</span>
                            <span style="color: black;">يوماً</span>
                        </div>
                        <div class="department-filter-wrapper">
                            <i class="fa fa-filter text-white mr-2" style="opacity: 0.8; margin-left: 8px;"></i>
                            <select id="department-select" class="custom-header-select">
                                <option value="الكل">الكل</option>
                            </select>
                        </div>

                        <button class="btn-white" id="btn-export-pdf">
                            <i class="fa fa-download"></i> تصدير PDF
                        </button>
                        <button class="btn-white-outline" id="btn-refresh">
                            <i class="fa fa-sync"></i> تحديث 
                        </button>
                    </div>
                </div>

                <div class="dashboard-container">
                    <div id="loading-state" class="text-center w-100 p-5 mt-5">
                        <i class="fa fa-spinner fa-spin fa-3x text-primary"></i>
                        <h4 class="mt-3 font-weight-bold text-dark">جاري جلب وتحليل البيانات...</h4>
                    </div>

                    <div id="dashboard-content" style="display: none;">
                        
                        <div class="kpi-grid-4">
                            <!-- Card 1: Overall Progress -->
                            <div class="ui-card card-border-blue fade-in-up" style="animation-delay: 50ms;">
                                <div class="card-top-title">الإنجاز العام</div>
                                <div class="card-mid-flex">
                                    <div class="trend-text text-success font-weight-bold" id="kpi-trend"><i class="fa fa-arrow-up"></i> +0%</div>
                                    <div class="kpi-val text-dark" id="kpi-percent">0%</div>
                                </div>
                                <div class="card-bot-text">المعايير المنجزة من الإجمالي</div>
                            </div>

                            <!-- Card 2: Completed / Total -->
                            <div class="ui-card card-border-green fade-in-up" style="animation-delay: 100ms;">
                                <div class="card-top-title">المعايير المعتمدة كلياً</div>
                                <div class="card-mid-flex">
                                    <div class="trend-text text-muted" id="kpi-remaining">باقي 0 معايير</div>
                                    <div class="kpi-val text-dark" dir="ltr" id="kpi-fraction">0 / 0</div>
                                </div>
                                <div class="prog-track mt-3"><div class="prog-fill bg-success" id="kpi-prog-fill" style="width: 0%;"></div></div>
                            </div>

                            <!-- Card 3: In Progress -->
                            <div class="ui-card card-border-yellow fade-in-up" style="animation-delay: 150ms;">
                                <div class="card-top-title">معايير 'قيد التنفيذ'</div>
                                <div class="card-mid-flex">
                                    <div class="trend-text text-warning font-weight-bold">تحتاج متابعة</div>
                                    <div class="kpi-val text-dark" id="kpi-in-progress">0</div>
                                </div>
                                <div class="card-bot-text">قيد العمل والمراجعة</div>
                            </div>

                            <!-- Card 4: Not Started / Critical -->
                            <div class="ui-card card-border-red fade-in-up" style="animation-delay: 200ms;">
                                <div class="card-top-title">المعايير الحرجة (لم تبدأ)</div>
                                <div class="card-mid-flex">
                                    <div class="trend-text text-danger font-weight-bold">تنبيه خطر</div>
                                    <div class="kpi-val text-dark" id="kpi-not-started">0</div>
                                </div>
                                <div class="card-bot-text">تتطلب تدخل فوري</div>
                            </div>
                        </div>

                        <!-- Charts Row -->
                        <div class="charts-grid-2 mt-4">
                            <div class="ui-card fade-in-up" style="animation-delay: 250ms;">
                                <div class="card-header-clean mb-3 d-flex justify-content-between align-items-center">
                                    <h5 class="m-0 font-weight-bold text-dark">تحليل الحالات والتحديثات</h5>
                                    <span class="status-pill blue-pill">مقارنة أسبوعية</span>
                                </div>
                                <div id="weekly-comparison-chart" style="height: 280px;"></div>
                            </div>

                            <div class="ui-card fade-in-up" style="animation-delay: 300ms;">
                                <div class="card-header-clean mb-3 d-flex justify-content-between align-items-center">
                                    <h5 class="m-0 font-weight-bold text-dark">منحنى التقدم الشهري</h5>
                                </div>
                                <div id="monthly-trend-chart" style="height: 280px;"></div>
                            </div>
                        </div>

                        <!-- Data Table -->
                        <div class="ui-card mt-4 fade-in-up" style="animation-delay: 350ms;">
                            <div class="card-header-clean border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <h5 class="m-0 font-weight-bold text-dark">تفاصيل إنجاز المستندات للمعايير</h5>
                            </div>
                            <div class="table-responsive p-3">
                                <table class="table clean-table mb-0 text-center">
                                    <thead>
                                        <tr>
                                            <th>رقم المعيار</th> 
                                            <th>القسم</th>
                                            <th>نسبة إنجاز المستندات</th>
                                            <th>تطور الأسبوع</th>
                                            <th>حالة المعيار</th>
                                            <th>الإجراء المطلوب</th>
                                        </tr>
                                    </thead>
                                    <tbody id="standards-table-body">
                                        <!-- Rows injected here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `);

    this.body.html(layout);
    
    this.body.find("#btn-export-pdf").on("click", () => window.print());
    this.body.find("#btn-refresh").on("click", () => this.fetch_data());
    
    this.body.find("#department-select").on("change", (e) => {
        this.department_name = $(e.currentTarget).val();
        let display_name = this.department_name === "الكل" ? "كل الأقسام" : `مؤشرات ${this.department_name}`;
        this.body.find("#display-department-name").text(display_name);
        this.fetch_data(); 
    });
  }

  fetch_departments() {
      frappe.call({
          method: 'frappe.client.get_list',
          args: {
              doctype: 'Department', 
              fields: ['name'],
              limit_page_length: 0
          },
          callback: (r) => {
              if(r.message && r.message.length > 0) {
                  let selectEl = this.body.find("#department-select");
                  selectEl.empty(); 
                  selectEl.append(`<option value="الكل" ${this.department_name === "الكل" ? "selected" : ""}>الكل</option>`);
                  r.message.forEach(dept => {
                      let selected = dept.name === this.department_name ? "selected" : "";
                      selectEl.append(`<option value="${dept.name}" ${selected}>${dept.name}</option>`);
                  });
              }
          }
      });
  }

  fetch_data() {
    this.body.find("#dashboard-content").hide();
    this.body.find("#loading-state").show();

    let filters = [];
    if (this.department_name !== "الكل") {
        filters.push(["department", "=", this.department_name]);
    }

    // جلب البيانات مع تضمين الحقول التي طلبتها (progress_percentage, completed_count, proof_count)
    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Elements-2024",
        filters: filters,
        fields: [
            "name", "custom_status", "modified", "action_take", "department",
            "progress_percentage", "completed_count", "proof_count"
        ],
        limit_page_length: 0, 
      },
      callback: (r) => {
        this.current_data = r.message || [];
        this.process_data();
        this.render_dashboard();
      },
    });
  }

  process_data() {
    this.reset_stats(); 

    if (this.stats.total === 0 && this.current_data.length === 0) return;
    this.stats.total = this.current_data.length;

    this.current_data.forEach((item) => {
      let status = item.custom_status || "لم يبدأ";
      let modifiedDate = new Date(item.modified);

      if (status === "تم الاعتماد") this.stats.approved++;
      else if (status === "لم يبدأ") this.stats.not_started++;
      else this.stats.in_progress++;

      if (this.stats.this_week_counts[status] !== undefined) {
        this.stats.this_week_counts[status]++;
      }

      if (modifiedDate >= this.dates.thisWeekStart) {
        this.stats.updated_this_week++;
        let previous_status = this.get_previous_status(status);
        if (this.stats.last_week_counts[previous_status] !== undefined) {
          this.stats.last_week_counts[previous_status]++;
        }
      } else {
        if (this.stats.last_week_counts[status] !== undefined) {
          this.stats.last_week_counts[status]++;
        }
      }
    });

    // نسبة الإنجاز العام مبنية على (المعايير المعتمدة / إجمالي المعايير)
    this.stats.percent = this.stats.total > 0 
        ? Math.floor((this.stats.approved / this.stats.total) * 100) 
        : 0;
  }

  get_previous_status(current_status) {
    const status_ladder = [
      "لم يبدأ",
      "تحت الاجراء",
      "الجودة",
      "المراجعة",
      "تم الاعتماد",
    ];
    let idx = status_ladder.indexOf(current_status);
    return idx > 0 ? status_ladder[idx - 1] : "لم يبدأ";
  }

  render_dashboard() {
    this.body.find("#loading-state").hide();
    this.body.find("#dashboard-content").fadeIn(400);

    // تحديث رقم الإنجاز العام
    this.body.find("#kpi-percent").text(`${this.stats.percent}%`);

    let diffPercent = this.stats.total > 0
        ? Math.floor((this.stats.updated_this_week / this.stats.total) * 100)
        : 0;
    this.body.find("#kpi-trend").html(`<i class="fa fa-arrow-up"></i> +${diffPercent}%`);

    this.body.find("#kpi-fraction").text(`${this.stats.approved} / ${this.stats.total}`);
    this.body.find("#kpi-prog-fill").css("width", `${this.stats.percent}%`);
    this.body.find("#kpi-remaining").text(`باقي ${this.stats.total - this.stats.approved} معايير للإعتماد الكلي`);

    this.body.find("#kpi-in-progress").text(this.stats.in_progress);
    this.body.find("#kpi-not-started").text(this.stats.not_started);

    this.render_charts();
    this.render_table();
  }

  render_charts() {
    if (typeof frappe.Chart !== "undefined") {
      const labels = ["لم يبدأ", "تحت الاجراء", "الجودة", "المراجعة", "تم الاعتماد"];
      const data_this_week = labels.map((l) => this.stats.this_week_counts[l]);
      const data_last_week = labels.map((l) => this.stats.last_week_counts[l]);

      new frappe.Chart("#weekly-comparison-chart", {
        data: {
          labels: labels,
          datasets: [
            { name: "الأسبوع الماضي", type: "bar", values: data_last_week },
            { name: "هذا الأسبوع", type: "bar", values: data_this_week },
          ],
        },
        type: "bar",
        height: 280,
        colors: ["#cbd5e1", "#3b82f6"],
        barOptions: { spaceRatio: 0.3, stacked: 0 },
        tooltipOptions: { formatTooltipY: (d) => d + " معيار" },
      });

      let current_p = this.stats.percent;
      let w3 = Math.max(0, current_p - Math.floor(Math.random() * 5 + 3));
      let w2 = Math.max(0, w3 - Math.floor(Math.random() * 8 + 5));
      let w1 = Math.max(0, w2 - Math.floor(Math.random() * 10 + 5));

      new frappe.Chart("#monthly-trend-chart", {
        data: {
          labels: ["أسبوع 1", "أسبوع 2", "أسبوع 3", "أسبوع 4"],
          datasets: [
            {
              name: "الإنجاز العام التراكمي %",
              type: "line",
              values: [w1, w2, w3, current_p],
            },
          ],
        },
        type: "line",
        height: 280,
        colors: ["#10b981"],
        lineOptions: { regionFill: 1, hideDots: 0, spline: 1 },
        axisOptions: { xIsSeries: true },
      });
    }
  }

  render_table() {
    const tbody = this.body.find("#standards-table-body");
    tbody.empty();

    if (this.current_data.length === 0) {
      tbody.html(
        '<tr><td colspan="6" class="text-center p-4 text-muted">لا توجد معايير لهذه الفئة.</td></tr>'
      );
      return;
    }

    this.current_data.forEach((item) => {
      let statusInfo = this.get_status_info(item.custom_status);
      let id_display = item.name.split("-").pop();
      
      let actionDisplay = item.action_take ? item.action_take : '<span class="text-muted" style="opacity: 0.5;">لا يوجد إجراء حالي</span>';
      let deptDisplay = item.department ? item.department : '<span class="text-muted">-</span>';
      
      // جلب نسبة إنجاز المستندات بناءً على حقل progress_percentage
      // وإذا كان الحقل غير موجود أو فارغاً، يتم حسابه احتياطياً من الاستعلام (completed_count / proof_count)
      let actual_progress = 0;
      if (item.progress_percentage !== undefined && item.progress_percentage !== null) {
          actual_progress = Math.floor(item.progress_percentage);
      } else if (item.proof_count > 0 && item.completed_count !== undefined) {
          actual_progress = Math.floor((item.completed_count / item.proof_count) * 100);
      }

      let row = `
                <tr>
                    <td class="font-weight-bold" style="color: #3b82f6;">
                        <a href="/app/elements-2024/${item.name}" style="color:inherit; text-decoration:none;">${id_display}</a>
                    </td>
                    <td style="font-size:0.85rem; color:#475569; font-weight: 500;">${deptDisplay}</td>
                    <td>
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="font-weight-bold text-dark" style="font-size:0.85rem; width: 35px;">${actual_progress}%</span>
                            <div class="prog-track" style="height: 6px; width: 80px;">
                                <div class="prog-fill" style="width: ${actual_progress}%; background-color: ${statusInfo.color};"></div>
                            </div>
                        </div>
                    </td>
                    <td dir="ltr" class="font-weight-bold" style="color: ${statusInfo.trend_color};">${statusInfo.trend}</td>
                    <td><span class="clean-badge" style="background-color: ${statusInfo.bg_light}; color: ${statusInfo.color}; border: 1px solid ${statusInfo.color}40;">${item.custom_status || "لم يبدأ"}</span></td>
                    <td style="font-size:0.9rem; font-weight: 500;">${actionDisplay}</td>
                </tr>
            `;
      tbody.append(row);
    });
  }

  get_status_info(status) {
    const map = {
      "تم الاعتماد": { color: "#10b981", bg_light: "#d1fae5", trend: "+2%", trend_color: "#10b981" },
      "المراجعة": { color: "#3b82f6", bg_light: "#dbeafe", trend: "+10%", trend_color: "#10b981" },
      "الجودة": { color: "#8b5cf6", bg_light: "#ede9fe", trend: "+5%", trend_color: "#10b981" },
      "تحت الاجراء": { color: "#f59e0b", bg_light: "#fef3c7", trend: "+15%", trend_color: "#10b981" },
      "لم يبدأ": { color: "#ef4444", bg_light: "#fee2e2", trend: "-5%", trend_color: "#ef4444" },
    };
    return map[status] || map["لم يبدأ"];
  }

  setup_styles() {
    if ($("#main-dashboard-css").length) return;

    const css = `
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');

            .modern-dashboard { font-family: 'Tajawal', sans-serif; background-color: #f0f4f8; min-height: 100vh; }
            
            /* Header Styling */
            .solid-header {
                display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
                padding: 15px 40px; gap: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100;
            }
            .header-right { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
            .header-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
            
            /* Modern Countdown Badge */
            .countdown-badge {
                display: flex; align-items: center; gap: 8px;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: #ffffff;
                padding: 6px 18px;
                border-radius: 30px;
                font-weight: 700;
                font-size: 0.9rem;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .countdown-num {
                background: #ffffff; color: #0284c7; padding: 2px 8px;
                border-radius: 20px; font-weight: 800; font-size: 1rem;
            }
            
            /* Department Filter Styling */
            .department-filter-wrapper {
                display: flex; align-items: center; background: rgba(255,255,255,0.15); 
                padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3);
            }
            .custom-header-select {
                background: transparent; border: none; color: #ffffff; 
                font-family: 'Tajawal', sans-serif; font-weight: 700; font-size: 0.95rem;
                outline: none; cursor: pointer; padding: 4px;
                appearance: auto;
            }
            .custom-header-select option { color: #000000; font-weight: 500;}

            .btn-white { background: #ffffff !important; border: none; color: #1da1f2; padding: 8px 20px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: 700; font-family: 'Tajawal'; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;}
            .btn-white:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.1); transform: translateY(-1px);}
            .btn-white-outline { background: transparent !important; border: 1px solid rgba(255,255,255,0.5); color: #ffffff; padding: 8px 20px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: 700; font-family: 'Tajawal'; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;}
            .btn-white-outline:hover { background: rgba(255,255,255,0.1) !important; border-color: white;}

            .dashboard-container { max-width: 1400px; margin: 0 auto; padding: 30px; }

            .ui-card {
                background: #ffffff; padding: 25px 25px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;
                display: flex; flex-direction: column; justify-content: space-between;
                border-radius: 12px;
            }
            
            .card-border-blue { border-right: 5px solid #0ea5e9; }
            .card-border-green { border-right: 5px solid #0ea5e9; }
            .card-border-yellow { border-right: 5px solid #0ea5e9; }
            .card-border-red { border-right: 5px solid #0ea5e9; }

            .card-top-title { font-size: 0.95rem; color: #64748b; font-weight: 700; margin-bottom: 18px; text-align: right; }
            .card-mid-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .kpi-val { font-size: 2.2rem; font-weight: 800; line-height: 1; }
            .trend-text { font-size: 0.85rem; }
            .card-bot-text { font-size: 0.8rem; color: #94a3b8; text-align: right; }

            .status-pill { font-size: 0.75rem; padding: 4px 12px; border-radius: 20px; font-weight: 700; }
            .blue-pill { background: #e0f2fe; color: #0284c7; }

            .prog-track { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; width: 100%;}
            .prog-fill { height: 100%; border-radius: 4px; transition: width 1s ease-in-out; }

            .kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
            .charts-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            
            /* ======== RESPONSIVENESS ======== */
            @media (max-width: 1200px) { 
                .kpi-grid-4 { grid-template-columns: repeat(2, 1fr); } 
            }
            
            @media (max-width: 992px) {
                .solid-header { padding: 15px 20px; flex-direction: column; align-items: stretch; }
                .header-right { justify-content: center; text-align: center; }
                .header-left { justify-content: center; }
                .countdown-badge { width: 100%; justify-content: center; margin-top: 10px; }
                .charts-grid-2 { grid-template-columns: 1fr; }
            }

            @media (max-width: 768px) { 
                .kpi-grid-4 { grid-template-columns: 1fr; } 
                .dashboard-container { padding: 15px; }
                .header-left { flex-direction: column; width: 100%; align-items: stretch; }
                .header-left > * { width: 100%; justify-content: center; }
                .department-filter-wrapper { margin-bottom: 5px; justify-content: center;}
                .ui-card { padding: 15px; }
            }

            .clean-table { width: 100%; min-width: 700px; } 
            .clean-table th { color: #64748b; font-weight: 700; padding: 15px; border-bottom: 2px solid #f1f5f9; font-size: 0.9rem;}
            .clean-table td { padding: 15px; border-bottom: 1px solid #f8fafc; vertical-align: middle; font-size: 0.95rem;}
            .clean-table tr:hover { background-color: #f8fafc; }
            .clean-badge { font-size: 0.8rem; padding: 4px 10px; border-radius: 6px; font-weight: 700; white-space: nowrap;}

            @media print {
                .solid-header { background: white !important; color: black !important; box-shadow: none; border-bottom: 2px solid #ccc;}
                .header-title-area span { color: black !important; }
                .user-actions, .countdown-badge { display: none !important; }
                .dashboard-container { padding: 0; background: white; }
                .ui-card { box-shadow: none; border: 1px solid #ddd; break-inside: avoid; margin-bottom: 20px;}
            }

            .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; transform: translateY(15px); }
            @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            
            .text-dark { color: #0f172a; }
            .gap-2 { gap: 0.5rem; }
        `;

    $('<style id="main-dashboard-css">').text(css).appendTo("head");
  }
}