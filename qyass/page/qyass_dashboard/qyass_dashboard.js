frappe.pages['qyass-dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'الرئيسية',
		single_column: true
	});

	// 1. Load Dependencies
	$('head').append('<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">');
	$('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">');

	// 2. Hide Standard Frappe UI Elements
	$('.navbar').hide();
	$('.page-head').hide();
	$('.page-body').css('min-height', '100vh');
	
	$(wrapper).css({
		'padding': '0',
		'margin': '0',
		'background-color': 'var(--bg-light)'
	});
	
	$('.main-section').css('margin-top', '0');
	$('.layout-main-section').css({
		'padding': '0',
		'border': 'none'
	});

	// 3. Define the HTML Structure
	const htmlContent = `
    <div class="qyass-wrapper" dir="rtl">
        <div class="bg-pattern"></div>

        <header class="custom-header">
            <div class="header-top">
                <div class="logo">
                    <img src='/files/Screenshot_2026-04-22_at_6.16.56_AM-removebg-preview.png' height='40px' width='50px'/>
                </div>

                
                <div class="header-actions">
                    <!-- MISA Countdown Component Start -->
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); color: black; padding: 6px 18px; border-radius: 30px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); font-family: 'Tajawal', sans-serif; direction: rtl; white-space: nowrap;">
                        <span>متبقي حتى الرفع الأول:</span>
                        <span style="background: #0284c7; color: #ffffff; padding: 2px 10px; border-radius: 20px; font-weight: 800; font-size: 1rem; text-align: center; min-width: 25px; line-height: 1.2;">
                            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" onload="this.outerHTML = Math.max(0, Math.ceil((new Date('2026-06-11T00:00:00') - new Date()) / 86400000))" style="display:none;" alt="counter">
                        </span>
                        <span style="color: black;">يوماً</span>
                    </div>
                    <!-- MISA Countdown Component End -->
                    <!-- Notifications Wrapper -->
                    <div class="action-wrapper">
                        <button class="header-btn" id="btn-notifications">
                            <i class="fas fa-bell"></i>
                            <span>الإشعارات</span>
                            <span class="notification-badge" style="display:none">0</span>
                        </button>
                        
                        <!-- Notifications Dropdown -->
                        <div class="custom-dropdown-menu notification-menu" id="dropdown-notifications">
                            <div class="dropdown-header">
                                <span>الإشعارات</span>
                                <div class="header-tabs">
                                    <span class="active">الكل</span>
                                </div>
                                <i class="fas fa-cog"></i>
                            </div>
                            <div class="notification-list" id="notification-list-container">
                                <div class="empty-state">جاري التحميل...</div>
                            </div>
                            <div class="dropdown-footer" id="view-all-notifications">
                                عرض كل الإشعارات
                            </div>
                        </div>
                    </div>

                    <!-- Account Wrapper -->
                    <div class="action-wrapper">
                        <button class="header-btn" id="btn-account">
                            <i class="fas fa-user-circle"></i>
                            <span>حسابي</span>
                        </button>

                        <!-- Account Dropdown -->
                        <div class="custom-dropdown-menu account-menu" id="dropdown-account">
                            <ul class="dropdown-list">
                                <li data-action="profile">
                                    <i class="fas fa-user"></i> ملفي الشخصي
                                </li>
                                <li data-action="settings">
                                    <i class="fas fa-cog"></i> الإعدادات
                                </li>
                                <li data-action="reload">
                                    <i class="fas fa-sync"></i> إعادة تحميل
                                </li>
                                <li data-action="website">
                                    <i class="fas fa-globe"></i> عرض الموقع
                                </li>
                                <li class="divider"></li>
                                <li data-action="logout" class="text-danger">
                                    <i class="fas fa-sign-out-alt"></i> تسجيل خروج
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button class="mobile-toggle" id="mobileToggle">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>

            <nav class="nav-container" id="navContainer">
                 <ul class="main-nav">
                    <!-- الاعمال الدورية -->
                    <li class="qyass-nav-item">
                        <button class="nav-trigger">
                            <span class="nav-label"><i class="fas fa-tasks"></i> الاعمال الدورية</span>
                            <i class="fas fa-chevron-down arrow-indicator"></i>
                        </button>
                        <div class="mega-menu">
                            <div class="menu-header">
                                <div class="menu-header-icon"><i class="fas fa-calendar-check"></i></div>
                                <div class="menu-header-text"><h3>الحركات</h3><p>إدارة المهام والأعمال اليومية</p></div>
                            </div>
                            <div class="menu-items">
                                <a onclick="location.href='/app/daily-work'" class="menu-link"><div class="link-icon"><i class="fas fa-clipboard-list"></i></div><span class="link-text">المهام اليومية</span></a>
                                <a onclick="location.href='/app/meetings'" class="menu-link"><div class="link-icon"><i class="fas fa-users"></i></div><span class="link-text">الاجتماعات</span></a>
                                <a onclick="location.href='/app/videos'" class="menu-link"><div class="link-icon"><i class="fas fa-video"></i></div><span class="link-text">شرح بالفيديو</span></a>
                                <a onclick="location.href='/app/dga'" class="menu-link"><div class="link-icon"><i class="fas fa-bullhorn"></i></div><span class="link-text">تعاميم قياس</span></a>
                                <a onclick="location.href='/app/q&a'" class="menu-link"><div class="link-icon"><i class="fas fa-question-circle"></i></div><span class="link-text">اسئله واجوبه</span></a>
                                <a onclick="location.href='/app/ig'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">تعاميم داخليه</span></a>
                            </div>
                        </div>
                    </li>

                    <!-- ادخال المعايير -->
                    <li class="qyass-nav-item">
                        <button class="nav-trigger">
                            <span class="nav-label"><i class="fas fa-sliders-h"></i> ادخال المعايير</span>
                            <i class="fas fa-chevron-down arrow-indicator"></i>
                        </button>
                        <div class="mega-menu">
                            <div class="menu-header">
                                <div class="menu-header-icon"><i class="fas fa-cogs"></i></div>
                                <div class="menu-header-text"><h3>ادخال المعايير</h3><p>إعداد وتحديث المعايير</p></div>
                            </div>
                            <div class="menu-items">
                                <a onclick="location.href='/app/element'" class="menu-link"><div class="link-icon"><i class="fas fa-ruler-combined"></i></div><span class="link-text">المعايير</span></a>
                                <a onclick="location.href='/app/dimensions'" class="menu-link"><div class="link-icon"><i class="fas fa-compass"></i></div><span class="link-text">المحاور</span></a>
                                <a onclick="location.href='/app/visions'" class="menu-link"><div class="link-icon"><i class="fas fa-binoculars"></i></div><span class="link-text">المناظير</span></a>
                                <a onclick="location.href='/app/planning'" class="menu-link"><div class="link-icon"><i class="fas fa-project-diagram"></i></div><span class="link-text">التخطيط</span></a>
                            </div>
                        </div>
                    </li>

                    <!-- تعريفات -->
                    <li class="qyass-nav-item">
                        <button class="nav-trigger">
                            <span class="nav-label"><i class="fas fa-database"></i> تعريفات</span>
                            <i class="fas fa-chevron-down arrow-indicator"></i>
                        </button>
                        <div class="mega-menu">
                            <div class="menu-header">
                                <div class="menu-header-icon"><i class="fas fa-folder-open"></i></div>
                                <div class="menu-header-text"><h3>تعريفات</h3><p>إدارة البيانات الأساسية</p></div>
                            </div>
                            <div class="menu-items">
                                <a onclick="location.href='/app/governance-committee'" class="menu-link"><div class="link-icon"><i class="fas fa-gavel"></i></div><span class="link-text">تعريف لجنة الحوكمة</span></a>
                                <a onclick="location.href='/app/consultants'" class="menu-link"><div class="link-icon"><i class="fas fa-user-tie"></i></div><span class="link-text">تعريف المستشارين</span></a>
                                <a onclick="location.href='/app/dep'" class="menu-link"><div class="link-icon"><i class="fas fa-building"></i></div><span class="link-text">تعريف الادارات</span></a>
                                <a onclick="location.href='/app/employees'" class="menu-link"><div class="link-icon"><i class="fas fa-id-badge"></i></div><span class="link-text">تعريف الموظفين</span></a>
                                <a onclick="location.href='/app/projects'" class="menu-link"><div class="link-icon"><i class="fas fa-folder"></i></div><span class="link-text">تعريف المشاريع</span></a>
                                <a onclick="location.href='/app/positions'" class="menu-link"><div class="link-icon"><i class="fas fa-briefcase"></i></div><span class="link-text">تعريف الوظائف</span></a>
                            </div>
                        </div>
                    </li>

                    <!-- لوحة قياس الاداء -->
                    <li class="qyass-nav-item">
                        <button class="nav-trigger">
                            <span class="nav-label"><i class="fas fa-database"></i>لوحة قياس الاداء</span>
                            <i class="fas fa-chevron-down arrow-indicator"></i>
                        </button>
                        <div class="mega-menu">
                            <div class="menu-header">
                                <div class="menu-header-icon"><i class="fas fa-chart-bar"></i></div>
                                <div class="menu-header-text"><h3>لوحة قياس الاداء</h3><p>قياس الاداء </p></div>
                            </div>
                            <div class="menu-items">
                              <a onclick="location.href='/app/main-dashboard'" class="menu-link"><div class="link-icon"><i class="fas fa-chart-bar"></i></div><span class="link-text">قياس الاداء للادارات</span></a>
                            </div>
                        </div>
                    </li>

                    <!-- التقارير -->
                    <li class="qyass-nav-item">
                        <button class="nav-trigger">
                            <span class="nav-label"><i class="fas fa-chart-bar"></i> التقارير</span>
                            <i class="fas fa-chevron-down arrow-indicator"></i>
                        </button>
                        <div class="mega-menu reports-menu">
                            <div class="menu-header">
                                <div class="menu-header-icon"><i class="fas fa-chart-line"></i></div>
                                <div class="menu-header-text"><h3>التقارير</h3><p>عرض وتحليل البيانات</p></div>
                            </div>
                            <div class="menu-items scrollable-menu">
                                
                                <div class="menu-category collapse-toggle">
                                    <span>تقرير عام</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="collapse-content" style="display: none;">
                                <a onclick="location.href='/app/dashtest'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">لوحة قياس الأداء </span></a>
                                    <a onclick="location.href='/app/qyass-report'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">لوحة قياس الأداء الشاملة للمستندات</span></a>
                                    <a onclick="location.href='/app/completed-proofs'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text"> التقرير العام لاكتمال المستندات</span></a>
                                    <a onclick="location.href='/app/tree'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">شجرة قياس </span></a>
                                    <a onclick="location.href='/app/dga-report'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">التقرير بصيغة هيئة الحكومة الرقمية </span></a>
                                    <a onclick="location.href='/app/proof_docs_report'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">تقرير متطلبات المعايير بصيغة هيئة الحكومة الرقمية </span></a>
                                </div>

                                <div class="menu-category collapse-toggle">
                                    <span>تقارير على مستوي الجهة</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="collapse-content" style="display: none;">
                                <a onclick="location.href='/app/dimension-reviewed-p'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">مستندات مكتملة لكل محور </span></a>
                                </div>

                                <div class="menu-category collapse-toggle">
                                    <span>تقارير على مستوي الادارة</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="collapse-content" style="display: none;">
                                <a onclick="location.href='/app/department-per'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">لوحة اداء الادارات</span></a>
                                <a onclick="location.href='/app/late-proofs'" class="menu-link"><div class="link-icon"><i class="fas fa-clock"></i></div><span class="link-text">تقرير المعايير المتاخرة</span></a>
                                <a onclick="location.href='/app/dep-comp-proofs'" class="menu-link"><div class="link-icon"><i class="fas fa-building"></i></div><span class="link-text">المستندات المكتمله للادارات</span></a>
                                </div>

                                <div class="menu-category collapse-toggle">
                                    <span>تقارير على مستوي الموظف </span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="collapse-content" style="display: none;">
                                    <a onclick="location.href='/app/employees-per'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">لوحة اداء الموظفين ككل </span></a>
                                    <a onclick="location.href='/app/digital-officer-per'" class="menu-link"><div class="link-icon"><i class="fas fa-file-alt"></i></div><span class="link-text">لوحة اداء موظفي التحول الرقمي</span></a>
                                    <a onclick="location.href='/app/employee-completed-p'" class="menu-link"><div class="link-icon"><i class="fas fa-users-cog"></i></div><span class="link-text">توزيع المستندات للموظفين</span></a>
                                </div>

                            </div>
                        </div>
                    </li>
                    
                    <!-- إجراء جديد -->
                    <li class="qyass-nav-item">
                        <a href="#" class="nav-direct-link" id="btn-open-remark-modal">
                            <span class="nav-label"><i class="fas fa-comment-dots"></i> إجراء جديد</span>
                        </a>
                    </li>

                    <!-- قياس LM -->
                    <li class="qyass-nav-item">
                        <a onclick='location.href="https://misa.newerasofts.com/app/qyasslm"' class="nav-direct-link">
                            <span class="nav-label"><i class="fas fa-brain"></i> قياس LM</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </header>

        <main class="content-area">
            <div class="dashboard-stats-wrapper">
                <div class="loading" id="dashboard-loading" style="text-align:center; padding: 2rem;">جاري تحميل البيانات...</div>
                
                <section class="summary-section" id="dashboard-content" style="display:none;">
                    
                    <!-- Right Side: Visions Summary -->
                    <div class="summary-col visions-col">
                        <h3 class="col-title"><i class="fas fa-binoculars"></i> ملخص المناظير</h3>
                        <div class="list-container scrollable-list" id="visions-list">
                            <!-- Items injected by JS -->
                        </div>
                    </div>

                    <!-- Middle: Final Result & Compliance Summary -->
                    <div class="summary-col middle-col">
                        <div class="summary-chart-container">
                            <h3 class="col-title" style="border:none; margin-bottom:0.5rem; justify-content:center;">النتيجة النهائية</h3>
                            <div class="donut-chart" id="final-result-chart">
                                <div class="donut-chart-info">
                                    <div class="donut-chart-value" id="final-result-value">0%</div>
                                </div>
                            </div>
                        </div>
                        <div class="compliance-summary">
                            <h3 class="col-title" style="border:none; justify-content:center; margin-bottom:10px;">ملخص الالتزام بالمعايير</h3>
                            <div class="compliance-items">
                                <div class="compliance-item" id="compliance-total">
                                    <div class="value">0</div>
                                    <div class="label">التزام كلي</div>
                                </div>
                                <div class="compliance-item" id="compliance-partial">
                                    <div class="value">0</div>
                                    <div class="label">التزام جزئي</div>
                                </div>
                                <div class="compliance-item" id="compliance-none">
                                    <div class="value">0</div>
                                    <div class="label">عدم التزام</div>
                                </div>
                                <div class="compliance-item" id="compliance-na">
                                    <div class="value">0</div>
                                    <div class="label">لا ينطبق</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Left Side: Departments Proofs -->
                    <div class="summary-col departments-col">
                        <h3 class="col-title"><i class="fas fa-building"></i> إنجاز الإدارات (مستندات)</h3>
                        <div class="list-container scrollable-list" id="departments-list">
                            <!-- Items injected by JS -->
                        </div>
                    </div>

                </section>

                <!-- Status Grid (Circles) Section -->
                <section class="summary-section" id="details-grid-section" style="display:none; margin-top: 24px; display:block;">
                    <div style="width:100%">
                        <div class="section-header">
                            <h3>حالة المعايير</h3>
                            <div class="header-line"></div>
                        </div>
                        <div class="status-grid" id="details-grid-2"></div>
                    </div>
                </section>

            </div>
        </main>

        <!-- Multi-View Remark Modal Overlay -->
        <div class="remark-modal-overlay" id="remarkModal" dir="rtl">
            <div class="remark-modal-card">
                
                <!-- VIEW 1: FORM -->
                <div id="rmk-view-form" class="rmk-view">
                    <div class="remark-header flex-header">
                        <h2>إجراء جديد</h2>
                        <button class="btn-text-link" id="btn-show-list">
                            <i class="fas fa-list-ul"></i> الإجراءات السابقة
                        </button>
                    </div>
                    <form id="remarkForm">
                        <div class="rmk-form-group">
                            <label>نوع الإجراء</label>
                            <div class="type-toggles">
                                <label class="toggle-btn">
                                    <input type="radio" name="remark_type" value="خدمة جديدة">
                                    <i class="fas fa-magic"></i> خدمة جديدة
                                </label>
                                <label class="toggle-btn active">
                                    <input type="radio" name="remark_type" value="حل مشكلة" checked>
                                    <i class="fas fa-bug"></i> حل مشكلة
                                </label>
                                <label class="toggle-btn">
                                    <input type="radio" name="remark_type" value="تعديل">
                                    <i class="fas fa-sync-alt"></i> تعديل
                                </label>
                            </div>
                        </div>
                        
                        <div class="rmk-form-row">
                            <div class="rmk-form-group rmk-half">
                                <label>ينتهي في</label>
                                <input type="datetime-local" name="end_date" class="rmk-control" required>
                            </div>
                            <div class="rmk-form-group rmk-half">
                                <label>الأولوية</label>
                                <select name="priority" class="rmk-control" required>
                                    <option value="عالي">عالي</option>
                                    <option value="متوسط" selected>متوسط</option>
                                    <option value="عادي">عادي</option>
                                </select>
                            </div>
                        </div>

                        <div class="rmk-form-group">
                            <label>تفاصيل الإجراء</label>
                            <textarea name="details" class="rmk-control" rows="3" placeholder="أدخل ملخص وتفاصيل الإجراء هنا..." required></textarea>
                        </div>

                        <!-- Frappe Built-in Upload Integration UI -->
                        <div class="rmk-form-group">
                            <label>إرفاق ملف أو صورة</label>
                            <div class="frappe-attach-wrapper">
                                <input type="hidden" name="attach_url" id="rmk-attach-url">
                                <button type="button" id="btn-trigger-upload" class="btn-attach-frappe">
                                    <i class="fas fa-paperclip"></i> <span>رفع مرفق عبر النظام</span>
                                </button>
                                <div id="attached-file-display" style="display:none;">
                                    <div class="attached-file-box">
                                        <i class="fas fa-file-alt" style="color:var(--modal-purple); margin-left:8px;"></i>
                                        <a href="#" id="attached-file-link" target="_blank">ملف مرفق</a>
                                        <button type="button" id="btn-remove-attach" class="btn-remove" title="حذف المرفق">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="rmk-form-group checkbox-group">
                            <label class="cb-container">
                                <input type="checkbox" name="is_done">
                                <span class="checkmark"></span>
                                <i>تحديد كـ (جاهز للاستخدام)</i>
                            </label>
                        </div>

                        <div class="rmk-actions">
                            <button type="submit" class="btn-submit">
                                <i class="fas fa-paper-plane"></i> إرسال الإجراء
                            </button>
                            <button type="button" class="btn-cancel btn-close-modal">إلغاء</button>
                        </div>
                    </form>
                </div>

                <!-- VIEW 2: LIST -->
                <div id="rmk-view-list" class="rmk-view" style="display: none;">
                    <div class="remark-header flex-header border-bottom">
                        <div class="flex-title">
                            <button class="btn-icon-back" id="btn-back-to-form"><i class="fas fa-arrow-right"></i></button>
                            <h2>الإجراءات السابقة</h2>
                        </div>
                        <button class="btn-icon-close btn-close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="rmk-list-container scrollable-list" id="rmk-list-body">
                        <!-- Items injected by JS -->
                    </div>
                </div>

                <!-- VIEW 3: DETAILS -->
                <div id="rmk-view-detail" class="rmk-view" style="display: none;">
                    <div class="remark-header flex-header border-bottom">
                        <div class="flex-title">
                            <button class="btn-icon-back" id="btn-back-to-list"><i class="fas fa-arrow-right"></i></button>
                            <h2>تفاصيل الإجراء</h2>
                        </div>
                    </div>
                    <div class="rmk-detail-content scrollable-list" id="rmk-detail-body">
                        <!-- Content injected by JS -->
                    </div>
                </div>

            </div>
        </div>

    </div>
	`;

	// 4. Define CSS
	const cssContent = `
        :root {
            --primary: #0369a1;
            --primary-light: #0ea5e9;
            --primary-dark: #075985;
            --accent: #06b6d4;
            --bg-light: #f0f9ff;
            --bg-card: #ffffff;
            --text-primary: #0c4a6e;
            --text-secondary: #64748b;
            --border-color: #e0f2fe;
            
            --shadow-sm: 0 2px 8px rgba(3, 105, 161, 0.04);
            --shadow-md: 0 8px 24px rgba(3, 105, 161, 0.08);
            --shadow-lg: 0 16px 40px rgba(3, 105, 161, 0.12);
            
            --gradient-primary: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
            
            --status-compliant: #28a745;
            --status-partial: #ffc107;
            --status-non-compliant: #dc3545;
            --status-na: #bdc3c7;
            
            /* New Remark Modal Specific Colors */
            --modal-purple: #5c4ce3;
            --modal-purple-light: #f3f0ff;
            --modal-border: #e2e8f0;
        }

        .qyass-wrapper { box-sizing: border-box; font-family: 'Tajawal', sans-serif; background: var(--bg-light); min-height: 100vh; width: 100%; position: absolute; top: 0; left: 0; right: 0; }
        .qyass-wrapper *, .qyass-wrapper *::before, .qyass-wrapper *::after { box-sizing: inherit; }
        .bg-pattern { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 0; background-image: radial-gradient(circle at top right, rgba(14, 165, 233, 0.03) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(3, 105, 161, 0.03) 0%, transparent 50%); }
        
        .custom-header { position: relative; z-index: 100; background: var(--bg-card); box-shadow: var(--shadow-sm); border-bottom: 1px solid rgba(3, 105, 161, 0.05); }
        .header-top { background: var(--gradient-primary); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.875rem; }
        
        .header-actions { display: flex; align-items: center; gap: 1rem; }
        .action-wrapper { position: relative; }
        .header-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); color: white; padding: 0.65rem 1.25rem; border-radius: 10px; font-family: inherit; font-size: 0.95rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 0.6rem; position: relative; backdrop-filter: blur(4px); }
        .header-btn:hover, .header-btn.active { background: rgba(255, 255, 255, 0.25); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .notification-badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; font-size: 0.75rem; font-weight: 700; height: 20px; min-width: 20px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 2px solid #065e8f; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4); }
        .mobile-toggle { display: none; background: transparent; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; transition: transform 0.2s; }

        .custom-dropdown-menu { position: absolute; top: calc(100% + 12px); left: 0; width: 300px; background: var(--bg-card); border-radius: 16px; box-shadow: var(--shadow-lg); border: 1px solid rgba(3, 105, 161, 0.08); z-index: 1000; opacity: 0; visibility: hidden; transform: translateY(12px) scale(0.98); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
        .custom-dropdown-menu.show { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }
        .account-menu { width: 240px; }
        .notification-menu { width: 380px; }
        .dropdown-list, .notification-list { max-height: 380px; overflow-y: auto; list-style: none; padding: 0.5rem 0; margin: 0; }
        .dropdown-list li { padding: 0.85rem 1.5rem; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 0.85rem; font-size: 0.95rem; font-weight: 500; transition: all 0.2s ease; }
        .dropdown-list li:hover { background: var(--bg-light); color: var(--primary); padding-right: 1.8rem; }
        .dropdown-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(3, 105, 161, 0.08); display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: var(--text-primary); background: #fafafa; }
        .notif-item { padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(3, 105, 161, 0.04); display: flex; gap: 1rem; cursor: pointer; transition: background 0.2s; }
        .notif-item:hover { background: var(--bg-light); }
        .notif-avatar { width: 44px; height: 44px; background: var(--bg-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; border: 1px solid rgba(3, 105, 161, 0.1); }
        .notif-content { flex: 1; }
        .notif-text { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); line-height: 1.4; margin-bottom: 0.25rem; }
        .notif-time { font-size: 0.8rem; color: var(--text-secondary); }
        .notif-item.unread .notif-text { color: var(--primary); }
        .dropdown-footer { padding: 1rem; text-align: center; color: var(--primary); font-weight: 700; cursor: pointer; background: #fafafa; border-top: 1px solid rgba(3, 105, 161, 0.08); transition: background 0.2s; font-size: 0.9rem; }
        .dropdown-footer:hover { background: var(--bg-light); }
        
        .nav-container { padding: 0 2rem; }
        .main-nav { display: flex; gap: 0.5rem; list-style: none; padding: 0; margin: 0; }
        .qyass-nav-item { position: relative !important; }
        
        .nav-trigger, .nav-direct-link { padding: 1.25rem 1.5rem; font-family: inherit; font-size: 1.05rem; font-weight: 700; color: var(--text-secondary); background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; width: 100%; transition: all 0.3s ease; position: relative; text-decoration: none; }
        .nav-label { display: flex; align-items: center; gap: 0.6rem; }
        
        @media (min-width: 769px) {
            .nav-trigger:hover, .nav-direct-link:hover { color: var(--primary); }
            .nav-trigger::after, .nav-direct-link::after { content: ''; position: absolute; bottom: 0; right: 50%; width: 0; height: 3px; background: var(--gradient-primary); border-radius: 3px 3px 0 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(50%); }
            .nav-trigger:hover::after, .nav-direct-link:hover::after { width: 80%; }
            .mega-menu { position: absolute; top: calc(100% + 10px); right: 80%; transform: translateX(50%) translateY(10px); min-width: 340px; background: var(--bg-card); border-radius: 20px; box-shadow: var(--shadow-lg); border: 1px solid rgba(3, 105, 161, 0.08); opacity: 0; visibility: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 900; overflow: hidden; text-align: right; }
            .qyass-nav-item:hover .mega-menu { opacity: 1; visibility: visible; transform: translateX(50%) translateY(0); }
            .qyass-nav-item::before { content: ''; position: absolute; top: 100%; left: 0; width: 100%; height: 20px; }
        }

        .menu-header { background: var(--gradient-primary); padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
        .menu-header-icon { width: 48px; height: 48px; background: rgba(255, 255, 255, 0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .menu-header-icon i { color: white; font-size: 1.25rem; }
        .menu-header-text h3 { color: white; font-size: 1.2rem; font-weight: 800; margin: 0 0 0.25rem 0; }
        .menu-header-text p { color: rgba(255, 255, 255, 0.85); font-size: 0.85rem; margin: 0; }
        .menu-items { padding: 1rem; }
        
        .menu-category { font-size: 0.8rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .collapse-toggle { display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s ease; border-radius: 8px; margin: 0.25rem 0; padding: 0.75rem 1rem; }
        .collapse-toggle:hover { background: var(--bg-light); color: var(--primary); }
        .collapse-toggle i { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 0.8rem; }
        .collapse-toggle.active { color: var(--primary); }
        .collapse-toggle.active i { transform: rotate(180deg); }
        .collapse-content { overflow: hidden; padding-right: 0.5rem; }
        
        .menu-link { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem; color: var(--text-primary); font-weight: 600; text-decoration: none; border-radius: 12px; transition: all 0.2s ease; position: relative; overflow: hidden; cursor: pointer; margin-bottom: 0.25rem; }
        .menu-link:hover { background: var(--bg-light); transform: translateX(-4px); text-decoration: none; color: var(--primary); }
        .link-icon { width: 40px; height: 40px; background: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(3, 105, 161, 0.06); transition: all 0.2s ease; }
        .link-icon i { color: var(--primary); font-size: 1.1rem; }
        .menu-link:hover .link-icon { background: var(--primary); box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2); }
        .menu-link:hover .link-icon i { color: white; }

        .content-area { padding: 4rem 2rem 6rem; position: relative; z-index: 1; max-width: 1400px; margin: 0 auto; }
        div .page-container { padding-top:0px !important; }
        .page-body { max-width:100vw !important; }

        /* --- NEW 3-COLUMN HERO SECTION STYLES --- */
        .summary-section {
            display: grid;
            grid-template-columns: 1fr 1.5fr 1fr;
            gap: 1.5rem;
            align-items: stretch;
            margin-bottom: 2.5rem;
        }

        .summary-col {
            display: flex;
            flex-direction: column;
            background: var(--bg-card);
            border: 1px solid rgba(3, 105, 161, 0.08);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
            max-height: 480px;
        }
        
        .middle-col {
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
            gap: 1.5rem;
        }

        .col-title {
            margin: 0 0 1rem 0;
            font-size: 1.05rem;
            color: var(--text-primary);
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 10px;
        }

        .list-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            overflow-y: auto;
            padding-right: 5px;
            flex: 1;
        }

        .list-container::-webkit-scrollbar, .scrollable-list::-webkit-scrollbar { width: 5px; }
        .list-container::-webkit-scrollbar-thumb, .scrollable-list::-webkit-scrollbar-thumb { background: rgba(3, 105, 161, 0.2); border-radius: 4px; }

        .summary-list-item {
            background: #f8fafc;
            border: 1px solid rgba(3, 105, 161, 0.05);
            border-radius: 10px;
            padding: 12px;
            transition: transform 0.2s;
        }
        .summary-list-item:hover {
            transform: translateX(-3px);
            border-color: var(--primary-light);
            background: #ffffff;
        }

        .summary-list-item .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 8px;
        }

        .mini-progress {
            width: 100%;
            height: 6px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        .mini-progress .fill {
            height: 100%;
            background: var(--gradient-primary);
            border-radius: 4px;
            transition: width 1s ease-in-out;
        }

        .compliance-summary { padding: 1.5rem; border: 1px solid rgba(3, 105, 161, 0.08); border-radius: 16px; background: var(--bg-card); box-shadow: var(--shadow-sm); }
        .compliance-items { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); text-align: center; gap: 1rem; }
        .compliance-item { padding: 0.75rem; border-radius: 12px; background: #f8fafc; transition: transform 0.2s ease; border: 1px solid transparent; }
        .compliance-item:hover { transform: scale(1.03); background: var(--bg-card); border-color: rgba(3, 105, 161, 0.1); box-shadow: var(--shadow-sm); }
        .compliance-item .value { font-size: 1.8rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem; }
        .compliance-item .label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 700; }
        #compliance-total .value { color: var(--status-compliant); }
        #compliance-partial .value { color: var(--status-partial); }
        #compliance-none .value { color: var(--status-non-compliant); }
        #compliance-na .value { color: var(--status-na); }
        
        .summary-chart-container { 
            background: var(--bg-card); 
            border-radius: 16px; 
            border: 1px solid rgba(3, 105, 161, 0.08); 
            padding: 1.5rem; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            flex: 1;
            box-shadow: var(--shadow-sm);
        }
        .donut-chart { position: relative; width: 180px; height: 180px; border-radius: 50%; background: conic-gradient(var(--primary) 0deg, #f1f5f9 0deg); display: flex; justify-content: center; align-items: center; transition: background 1.5s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 32px rgba(3, 105, 161, 0.1); margin: auto; }
        .donut-chart::before { content: ''; position: absolute; width: 78%; height: 78%; background: var(--bg-card); border-radius: 50%; box-shadow: inset 0 4px 12px rgba(0,0,0,0.03); }
        .donut-chart-info { position: relative; text-align: center; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .donut-chart-value { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); line-height: 1; }

        .section-header { margin-bottom: 24px; display: inline-block; position: relative; }
        .section-header h3 { font-size: 1.3rem; color: var(--text-primary); font-weight: 800; margin: 0 0 8px 0; }
        .header-line { width: 40px; height: 4px; background: var(--gradient-primary); border-radius: 2px; }

        .status-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); gap: 14px; padding: 0.5rem; }
        .status-item { width: 46px; height: 46px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 800; color: white; margin: 0 auto; font-size: 0.8rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 10px rgba(0,0,0,0.08); position: relative; }
        .status-item:hover { transform: scale(1.15) translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); z-index: 2; }
        .status-compliant { background: var(--status-compliant); }
        .status-partial { background: var(--status-partial); }
        .status-non-compliant { background: var(--status-non-compliant); }
        .status-na { background: var(--status-na); }

        /* --- NEW REMARK MODAL CSS --- */
        .remark-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); 
            z-index: 1030;
            display: none; align-items: center; justify-content: center;
        }
        .remark-modal-card {
            background: #ffffff; border-radius: 16px; width: 460px; max-width: 90%; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); font-family: 'Tajawal', sans-serif; 
            position: relative; animation: slideUp 0.3s ease-out; overflow: hidden;
            display: flex; flex-direction: column; max-height: 90vh;
        }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .rmk-view { display: flex; flex-direction: column; height: 100%; padding: 24px; }
        
        .remark-header { margin-bottom: 20px; text-align: right; }
        .remark-header.border-bottom { padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--modal-border); }
        .flex-header { display: flex; justify-content: space-between; align-items: center; }
        .flex-title { display: flex; align-items: center; gap: 12px; }
        .remark-header h2 { margin: 0; font-size: 1.3rem; font-weight: 800; color: #1f2937; }
        
        .btn-text-link { background: none; border: none; color: var(--modal-purple); font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; font-family: inherit; }
        .btn-text-link:hover { background: var(--modal-purple-light); }
        .btn-icon-back, .btn-icon-close { background: #f3f4f6; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4b5563; transition: all 0.2s; }
        .btn-icon-back:hover, .btn-icon-close:hover { background: #e5e7eb; color: #1f2937; }

        .rmk-form-group { margin-bottom: 18px; text-align: right; }
        .rmk-form-group label { display: block; font-size: 0.8rem; color: #6b7280; font-weight: 700; margin-bottom: 8px; letter-spacing: 0; }
        
        .type-toggles { display: flex; gap: 8px; }
        .type-toggles .toggle-btn { flex: 1; text-align: center; border: 1px solid var(--modal-border); border-radius: 10px; padding: 12px 6px; cursor: pointer; color: #9ca3af; font-size: 0.85rem; font-weight: 700; transition: all 0.2s; position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .type-toggles .toggle-btn input { display: none; }
        .type-toggles .toggle-btn i { font-size: 1.2rem; }
        .type-toggles .toggle-btn.active { border-color: var(--modal-purple); color: var(--modal-purple); background: var(--modal-purple-light); box-shadow: 0 2px 8px rgba(92, 76, 227, 0.15); }
        
        .rmk-form-row { display: flex; gap: 12px; }
        .rmk-half { flex: 1; }
        
        .rmk-control { width: 100%; padding: 12px; border: 1px solid var(--modal-border); border-radius: 8px; font-family: inherit; font-size: 0.9rem; transition: border-color 0.2s; background: #f9fafb; color: #1f2937; }
        .rmk-control:focus { border-color: var(--modal-purple); outline: none; background: #fff; box-shadow: 0 0 0 3px var(--modal-purple-light); }
        
        .btn-attach-frappe { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; color: #64748b; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .btn-attach-frappe:hover { border-color: var(--modal-purple); color: var(--modal-purple); background: var(--modal-purple-light); }
        .attached-file-box { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--modal-purple-light); border: 1px solid var(--modal-purple); border-radius: 8px; }
        .attached-file-box a { flex: 1; color: var(--modal-purple); font-weight: 700; text-decoration: none; word-break: break-all; font-size: 0.9rem; }
        .attached-file-box a:hover { text-decoration: underline; }
        .btn-remove { background: none; border: none; color: #ef4444; font-size: 1rem; cursor: pointer; padding: 4px; transition: transform 0.2s; }
        .btn-remove:hover { transform: scale(1.1); }

        .checkbox-group { display: flex; align-items: center; }
        .checkbox-group .cb-container { display: flex; align-items: center; cursor: pointer; user-select: none; color: #4b5563; font-size: 0.9rem; font-weight: 600; }
        .checkbox-group input { margin-left: 8px; margin-right: 0; accent-color: var(--modal-purple); width: 16px; height: 16px; cursor: pointer; }
        .checkbox-group i { font-style: normal; color: #374151; font-size: 0.9rem; }

        .rmk-actions { display: flex; gap: 12px; margin-top: 24px; flex-direction: row-reverse; }
        .btn-submit { flex: 2; background: var(--modal-purple); color: white; border: none; border-radius: 10px; padding: 14px; font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: background 0.2s, transform 0.1s; font-family: inherit; }
        .btn-submit:hover { background: #4a3bcf; }
        .btn-submit:active { transform: scale(0.98); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-cancel { flex: 1; background: #f3f4f6; color: #4b5563; border: none; border-radius: 10px; padding: 14px 20px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.2s; font-family: inherit; }
        .btn-cancel:hover { background: #e5e7eb; }

        .rmk-list-item { background: #f9fafb; border: 1px solid var(--modal-border); border-radius: 10px; padding: 14px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; text-align: right; }
        .rmk-list-item:hover { transform: translateY(-2px); border-color: var(--modal-purple); box-shadow: 0 4px 12px rgba(92,76,227,0.1); background: #ffffff; }
        .rmk-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .rmk-item-id { font-weight: 800; color: #1f2937; font-size: 0.95rem; }
        .rmk-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .rmk-item-body { display: flex; justify-content: space-between; color: #6b7280; font-size: 0.85rem; font-weight: 500; }
        .rmk-item-body span { display: flex; align-items: center; gap: 6px; }

        .rmk-detail-box { background: #f9fafb; border: 1px solid var(--modal-border); border-radius: 10px; padding: 16px; margin-bottom: 16px; text-align: right; }
        .rmk-detail-row { margin-bottom: 12px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 12px; }
        .rmk-detail-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        .rmk-detail-label { display: block; font-size: 0.75rem; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
        .rmk-detail-val { font-size: 0.95rem; color: #1f2937; font-weight: 600; word-break: break-word; white-space: pre-wrap; }
        .rmk-download-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--modal-purple-light); color: var(--modal-purple); padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 700; text-decoration: none; transition: background 0.2s; margin-top: 8px;}
        .rmk-download-btn:hover { background: #e0d9ff; }

        @media (max-width: 1200px) {
            .summary-section { grid-template-columns: 1fr 1fr; }
            .visions-col { order: 1; }
            .middle-col { order: 2; grid-column: span 2; flex-direction: row; align-items: stretch; max-height: max-content; }
            .middle-col > * { flex: 1; }
            .departments-col { order: 3; }
        }

        @media (max-width: 992px) {
            .summary-section { grid-template-columns: 1fr; }
            .middle-col { grid-column: span 1; flex-direction: column; }
        }

        @media (max-width: 768px) {
            .header-top { padding: 1rem; }
            .logo-text { font-size: 1.5rem; }
            .header-btn span { display: none; }
            .mobile-toggle { display: block; }
            .custom-dropdown-menu { position: fixed; top: 76px; right: 5% !important; left: 5% !important; width: 90%; max-width: none; transform: translateY(10px); border-radius: 16px; }
            .nav-container { display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-card); height: auto; border-bottom: 1px solid rgba(3, 105, 161, 0.08); box-shadow: 0 10px 20px rgba(0,0,0,0.05); padding: 0; z-index: 800; }
            .nav-container.active { display: block; }
            .main-nav { flex-direction: column; gap: 0; }
            .nav-trigger, .nav-direct-link { width: 100%; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(3, 105, 161, 0.05); display: flex; }
            .mega-menu { position: static; width: 100%; transform: none; opacity: 1; visibility: visible; display: none; box-shadow: none; border: none; border-bottom: 1px solid rgba(3, 105, 161, 0.05); border-radius: 0; background: #f8fafc; }
            .qyass-nav-item.mobile-active .mega-menu { display: block; }
            .qyass-nav-item.mobile-active .arrow-indicator { transform: rotate(180deg); }
            .content-area { padding: 2rem 1rem; }
            .compliance-items { grid-template-columns: 1fr 1fr; }
        }

        /* --- Tooltip CSS --- */
        .status-item { position: relative; }
        .custom-element-tooltip {
            position: absolute; bottom: 115%; left: 50%; transform: translateX(-50%); background: #0ea5e9 ; color: white; padding: 10px 14px; border-radius: 8px; font-size: 0.8rem; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1050; box-shadow: 0 4px 15px rgba(0,0,0,0.2); pointer-events: none; text-align: right; border: 1px solid rgba(255,255,255,0.1); line-height: 1.6;
        }
        .status-item:hover .custom-element-tooltip { background: #0ea5e9 ; color: white; opacity: 1; scale:0.8; visibility: visible; bottom: 130%; left: 0%; }
        .custom-element-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 6px; border-style: solid; border-color: #1f2937 transparent transparent transparent; }
        .tooltip-row { display: flex; gap: 8px; align-items: center; }
        .tooltip-label { color: white; font-weight: 800; }

        /* --- NATIVE IFRAME DIALOG STYLES (من صفحة Element) --- */
        .modal-backdrop.show { backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; background-color: rgba(15, 23, 42, 0.6) !important; }
        .native-form-dialog .modal-dialog { max-width: 85vw !important; width: 85vw !important; margin: 5vh auto !important; }
        .native-form-dialog .modal-content { font-family: 'Tajawal', sans-serif !important; border-radius: 12px !important; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); overflow: hidden; }
        .native-form-dialog .modal-body { padding: 0 !important; background: #f3f4f6; }
        .native-form-dialog .modal-footer { display: none !important; }
        @media (max-width: 900px) { .native-form-dialog .modal-dialog { max-width: 98vw !important; width: 98vw !important; margin: 1vh auto !important; } }
    `;

	// 5. Inject CSS and HTML
	frappe.dom.set_style(cssContent);
	$(page.body).append(htmlContent);

	// 6. Interactive Logic
	setTimeout(() => {
		
        // --- Header / Dropdown Logic ---
        function toggleDropdown(id, btnId) {
            const dropdown = $(id);
            const isActive = dropdown.hasClass('show');
            $('.custom-dropdown-menu').removeClass('show');
            $('.header-btn').removeClass('active');
            $('.nav-container').removeClass('active');
            if (!isActive) {
                dropdown.addClass('show');
                $(btnId).addClass('active');
            }
        }

        $('#btn-account').on('click', function(e) { e.stopPropagation(); toggleDropdown('#dropdown-account', '#btn-account'); });
        $('#btn-notifications').on('click', function(e) { e.stopPropagation(); toggleDropdown('#dropdown-notifications', '#btn-notifications'); loadNotifications(); });

        $('#mobileToggle').on('click', function(e) {
             e.stopPropagation();
             $('.custom-dropdown-menu').removeClass('show');
             $('.header-btn').removeClass('active');
             $('#navContainer').toggleClass('active');
             const icon = $(this).find('i');
             if($('#navContainer').hasClass('active')) { icon.removeClass('fa-bars').addClass('fa-times'); } else { icon.removeClass('fa-times').addClass('fa-bars'); }
        });

        $('.nav-trigger').on('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault(); e.stopPropagation();
                const parentLi = $(this).closest('.qyass-nav-item');
                parentLi.toggleClass('mobile-active');
            }
        });

        $(document).on('click', function(e) { 
            if (!$(e.target).closest('.action-wrapper').length && !$(e.target).closest('.header-top').length && !$(e.target).closest('.nav-container').length) { 
                $('.custom-dropdown-menu').removeClass('show'); $('.header-btn').removeClass('active'); $('#navContainer').removeClass('active'); $('#mobileToggle i').removeClass('fa-times').addClass('fa-bars');
            } 
        });

        $('.collapse-toggle').on('click', function(e) {
            e.preventDefault(); e.stopPropagation(); 
            const $this = $(this);
            const $content = $this.next('.collapse-content');
            $this.toggleClass('active');
            $content.slideToggle(250);
        });

        $('.account-menu li').on('click', function() {
            const action = $(this).data('action');
            if(!action) return;
            if (action === 'profile') frappe.set_route('Form', 'User', frappe.session.user);
            else if (action === 'settings') frappe.set_route('Form', 'User', frappe.session.user);
            else if (action === 'reload') window.location.reload();
            else if (action === 'website') window.open('/', '_blank');
            else if (action === 'logout') frappe.app.logout();
        });

        function loadNotifications() {
            const container = $('#notification-list-container');
            frappe.call({
                method: "frappe.client.get_list",
                args: { doctype: "Notification Log", fields: ["name", "subject", "creation", "read", "from_user", "document_type", "document_name", "email_content"], order_by: "creation desc", limit_page_length: 20 },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        const listHtml = r.message.map(item => {
                            const user = item.from_user || 'System';
                            const initial = user[0].toUpperCase();
                            let subject = item.subject;
                            if(!subject && item.email_content) subject = "New Notification";
                            if(!subject) subject = item.document_name || "New Notification";
                            const timeAgo = frappe.datetime.comment_when(item.creation);
                            const isUnread = !item.read ? 'unread' : '';
                            return `<div class="notif-item ${isUnread}" onclick="frappe.set_route('Form', 'Notification Log', '${item.name}')"><div class="notif-avatar">${initial}</div><div class="notif-content"><div class="notif-text">${subject}</div><div class="notif-time">${timeAgo}</div></div></div>`;
                        }).join('');
                        container.html(listHtml);
                        const unreadCount = r.message.filter(i => !i.read).length;
                        const badge = $('.notification-badge');
                        if(unreadCount > 0) { badge.text(unreadCount).show(); } else { badge.hide(); }
                    } else { container.html('<div class="empty-state" style="text-align:center; padding: 2rem; color: var(--text-secondary);">لا توجد إشعارات جديدة</div>'); }
                }
            });
        }
        loadNotifications();
        $('#view-all-notifications').on('click', function() { frappe.set_route('List', 'Notification Log'); });

        // --- NEW REMARK MODAL & MULTI-VIEW LOGIC ---
        const $remarkModal = $('#remarkModal');
        let previousRemarksData = [];
        
        function switchModalView(viewId) {
            $('.rmk-view').hide();
            $(`#${viewId}`).fadeIn(200);
        }

        $('#btn-open-remark-modal').on('click', function(e) {
            e.preventDefault();
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            $('input[name="end_date"]').val(now.toISOString().slice(0,16));
            
            switchModalView('rmk-view-form');
            $remarkModal.fadeIn(200).css('display', 'flex');
        });

        $('.btn-close-modal').on('click', function() { $remarkModal.fadeOut(200); });
        $remarkModal.on('click', function(e) { if (e.target === this) $remarkModal.fadeOut(200); });

        $('#btn-show-list').on('click', function(e) { e.preventDefault(); switchModalView('rmk-view-list'); loadPreviousRemarks(); });
        $('#btn-back-to-form').on('click', function(e) { e.preventDefault(); switchModalView('rmk-view-form'); });
        $('#btn-back-to-list').on('click', function(e) { e.preventDefault(); switchModalView('rmk-view-list'); });

        function loadPreviousRemarks() {
            const $listBody = $('#rmk-list-body');
            $listBody.html('<div style="text-align:center; padding: 40px; color: #6b7280;"><i class="fas fa-spinner fa-spin fa-2x"></i><div style="margin-top:10px;font-weight:600;">جاري التحميل...</div></div>');
            frappe.call({
                method: "frappe.client.get_list",
                args: { doctype: "Edits", fields: ["name", "type", "status", "creation", "end", "prioriity", "details", "attach"], order_by: "creation desc", limit_page_length: 30 },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        previousRemarksData = r.message;
                        const listHtml = r.message.map(doc => {
                            let statusColor = doc.status === 'جاهز للاستخدام' || doc.status === 'جاهز للأستخدام' ? '#28a745' : (doc.status === 'تحت التنفيذ' ? '#3498db' : '#f59e0b');
                            return `
                            <div class="rmk-list-item" data-id="${doc.name}">
                                <div class="rmk-item-header">
                                    <span class="rmk-item-id">${doc.name}</span>
                                    <span class="rmk-badge" style="background:${statusColor}15; color:${statusColor}">${doc.status || 'معلق'}</span>
                                </div>
                                <div class="rmk-item-body">
                                    <span><i class="fas fa-tag"></i> ${doc.type || 'غير محدد'}</span>
                                    <span><i class="fas fa-clock"></i> ${frappe.datetime.comment_when(doc.creation)}</span>
                                </div>
                            </div>`;
                        }).join('');
                        $listBody.html(listHtml);
                    } else {
                        $listBody.html('<div style="text-align:center; padding:40px; color:#9ca3af; font-weight:600;"><i class="fas fa-folder-open fa-2x" style="margin-bottom:10px;opacity:0.5;"></i><br>لا توجد إجراءات سابقة</div>');
                    }
                }
            });
        }

        $('#rmk-list-body').on('click', '.rmk-list-item', function() {
            const docName = $(this).data('id');
            const doc = previousRemarksData.find(d => d.name === docName);
            if(doc) {
                let statusColor = doc.status === 'جاهز للاستخدام' || doc.status === 'جاهز للأستخدام' ? '#28a745' : (doc.status === 'تحت التنفيذ' ? '#3498db' : '#f59e0b');
                let detailHtml = `<div class="rmk-detail-box">
                    <div class="rmk-detail-row" style="display:flex; justify-content:space-between; align-items:center;">
                        <div><span class="rmk-detail-label">رقم الإجراء</span><span class="rmk-detail-val" style="color:var(--modal-purple);">${doc.name}</span></div>
                        <span class="rmk-badge" style="background:${statusColor}15; color:${statusColor}">${doc.status || 'معلق'}</span>
                    </div>
                    <div class="rmk-detail-row" style="display:flex; gap:16px;">
                        <div style="flex:1;"><span class="rmk-detail-label">النوع</span><span class="rmk-detail-val">${doc.type || '-'}</span></div>
                        <div style="flex:1;"><span class="rmk-detail-label">الأولوية</span><span class="rmk-detail-val">${doc.prioriity || '-'}</span></div>
                    </div>
                    <div class="rmk-detail-row" style="display:flex; gap:16px;">
                        <div style="flex:1;"><span class="rmk-detail-label">تاريخ الإنشاء</span><span class="rmk-detail-val" style="font-size:0.85rem;">${doc.creation ? doc.creation.split(' ')[0] : '-'}</span></div>
                        <div style="flex:1;"><span class="rmk-detail-label">تاريخ الانتهاء</span><span class="rmk-detail-val" style="font-size:0.85rem;">${doc.end ? doc.end.split(' ')[0] : '-'}</span></div>
                    </div>
                    <div class="rmk-detail-row">
                        <span class="rmk-detail-label">التفاصيل</span>
                        <div class="rmk-detail-val" style="background:#fff; padding:10px; border-radius:8px; border:1px solid #e5e7eb; font-size:0.85rem; line-height:1.6;">${doc.details || 'لا توجد تفاصيل.'}</div>
                    </div>`;

                if(doc.attach) {
                    detailHtml += `<div class="rmk-detail-row" style="border:none;"><span class="rmk-detail-label">المرفقات</span><a href="${doc.attach}" target="_blank" class="rmk-download-btn"><i class="fas fa-external-link-alt"></i> عرض الملف المرفق</a></div>`;
                }
                detailHtml += `</div>`;
                
                $('#rmk-detail-body').html(detailHtml);
                switchModalView('rmk-view-detail');
            }
        });

        $('input[name="remark_type"]').on('change', function() {
            $('.toggle-btn').removeClass('active');
            $(this).closest('.toggle-btn').addClass('active');
        });

        $('#btn-trigger-upload').on('click', function(e) {
            e.preventDefault();
            new frappe.ui.FileUploader({
                folder: 'Home/Attachments',
                on_success: (file_doc) => {
                    const fileUrl = file_doc.file_url;
                    const fileName = file_doc.file_name;
                    $('#rmk-attach-url').val(fileUrl);
                    $('#attached-file-link').attr('href', fileUrl).text(fileName);
                    $('#btn-trigger-upload').hide();
                    $('#attached-file-display').fadeIn();
                }
            });
        });

        $('#btn-remove-attach').on('click', function(e) {
            e.preventDefault();
            $('#rmk-attach-url').val('');
            $('#attached-file-display').hide();
            $('#btn-trigger-upload').fadeIn();
        });

        function resetModalForm() {
            $('#remarkForm')[0].reset();
            $('.toggle-btn').removeClass('active');
            $('input[value="حل مشكلة"]').prop('checked', true).closest('.toggle-btn').addClass('active');
            $('#rmk-attach-url').val('');
            $('#attached-file-display').hide();
            $('#btn-trigger-upload').show();
        }

        $('#remarkForm').on('submit', function(e) {
            e.preventDefault();
            const btn = $(this).find('.btn-submit');
            btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...');

            const docData = {
                doctype: "Edits",
                type: $('input[name="remark_type"]:checked').val(),
                end: $('input[name="end_date"]').val().replace('T', ' ') + ':00',
                prioriity: $('select[name="priority"]').val(), 
                details: $('textarea[name="details"]').val(),
                status: $('input[name="is_done"]').is(':checked') ? "جاهز للأستخدام" : "معلق",
                attach: $('#rmk-attach-url').val() 
            };

            frappe.call({
                method: "frappe.client.insert",
                args: { doc: docData },
                callback: function(response) {
                    btn.prop('disabled', false).html('<i class="fas fa-paper-plane"></i> إرسال الإجراء');
                    if(response.message) {
                        frappe.show_alert({ message: __('تم إرسال الإجراء بنجاح'), indicator: 'green' });
                        $remarkModal.fadeOut(200);
                        resetModalForm();
                    }
                },
                error: function(err) {
                    btn.prop('disabled', false).html('<i class="fas fa-paper-plane"></i> إرسال الإجراء');
                    frappe.msgprint(__('حدث خطأ أثناء إرسال الإجراء، يرجى المحاولة مرة أخرى.'));
                }
            });
        });

        // --- DASHBOARD LOGIC ---
        function loadDashboardData() {
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    doctype: 'Elements-2024',
                    fields: ['name', 'number', 'custom_status', 'dimension', 'vision', 'department'],
                    limit_page_length: 0
                },
                callback: function(response) {
                    if (response.message && response.message.length > 0) {
                        const promises = response.message.map(item => {
                            return frappe.call({ method: 'frappe.client.get', args: { doctype: 'Elements-2024', name: item.name } });
                        });

                        Promise.all(promises).then(results => {
                            const fullData = results.map(r => r.message);
                            processData(fullData);
                            $('#dashboard-loading').hide();
                            $('#dashboard-content').fadeIn();
                            $('#details-grid-section').fadeIn();
                        }).catch(error => {
                            console.error('Error loading data:', error);
                            $('#dashboard-loading').html('حدث خطأ في تحميل البيانات');
                        });
                    } else {
                        $('#dashboard-loading').html('لا توجد بيانات متاحة حالياً');
                        $('#dashboard-content').show();
                    }
                }
            });
        }

        function processData(elements) {
            const customStatusMap = { 'لم يبدأ': 'not-started', 'تحت الاجراء': 'in-progress', 'الجودة': 'quality', 'المراجعة': 'review', 'تم الاعتماد': 'approved' };
            const complianceCounts = { compliant: 0, partial: 0, 'non-compliant': 0, na: 0 };
            const elementsByDimension = {};
            const elementsByVision = {};
            const elementsByDepartment = {};
            const gridElements = [];

            elements.forEach(element => {
                const requirements = element.requirements || [];
                const total = requirements.length;
                const isNA = requirements.some(r => r['not'] == 1 || r['not'] === true);
                const doneCount = requirements.filter(r => r.done == 1 || r.done === true).length;
                const notDone = total - doneCount;
                const percentage = total > 0 ? (doneCount / total) * 100 : 0;
                const elementProgress = parseFloat(percentage.toFixed(2));

                // 1. Status processing
                let statusCategory = 'non-compliant';
                if (isNA) { statusCategory = 'na'; }
                else if (total > 0) {
                    if (notDone === 0) statusCategory = 'compliant';
                    else if (notDone === 1) statusCategory = (total === 1) ? 'non-compliant' : 'partial';
                    else statusCategory = 'non-compliant';
                }

                complianceCounts[statusCategory]++;
                
                gridElements.push({
                    id: element.name,
                    number: element.number || element.name,
                    status: statusCategory, 
                    customStatus: customStatusMap[element.custom_status] || '',
                    progress: elementProgress,
                    dto: element.digital_transformation_officer || 'غير محدد',
                    eic: element.the_employee_in_charge || 'غير محدد'
                });

                // 2. Dimension Processing (For Final Result)
                const dimension = element.dimension || 'غير محدد';
                if (!elementsByDimension[dimension]) { elementsByDimension[dimension] = { id: dimension, label: dimension, totalProgress: 0, count: 0 }; }
                elementsByDimension[dimension].totalProgress += elementProgress;
                elementsByDimension[dimension].count++;

                // 3. Vision Processing
                const vision = element.vision || 'غير محدد';
                if (!elementsByVision[vision]) { elementsByVision[vision] = { label: vision, totalProgress: 0, count: 0 }; }
                elementsByVision[vision].totalProgress += elementProgress;
                elementsByVision[vision].count++;

                // 4. Department Proofs Processing
                const dept = element.department || 'غير محدد';
                if (!elementsByDepartment[dept]) { elementsByDepartment[dept] = { label: dept, totalProofs: 0, completedProofs: 0 }; }
                elementsByDepartment[dept].totalProofs += total;
                elementsByDepartment[dept].completedProofs += doneCount;
            });

            // Update Compliance Summary UI
            $('#compliance-total .value').text(complianceCounts.compliant);
            $('#compliance-partial .value').text(complianceCounts.partial);
            $('#compliance-none .value').text(complianceCounts['non-compliant']);
            $('#compliance-na .value').text(complianceCounts.na);

            // Update Visions UI (Right Column)
            const visionsList = $('#visions-list');
            visionsList.empty();
            Object.values(elementsByVision)
                .map(v => ({ ...v, avg: v.count > 0 ? (v.totalProgress / v.count) : 0 }))
                .sort((a, b) => b.avg - a.avg)
                .forEach(v => {
                    visionsList.append(`
                        <div class="summary-list-item">
                            <div class="item-header">
                                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:75%;" title="${v.label}">${v.label}</span> 
                                <span style="color:var(--primary); font-weight:800;">${v.avg.toFixed(1)}%</span>
                            </div>
                            <div class="mini-progress"><div class="fill" style="width: ${v.avg}%"></div></div>
                        </div>
                    `);
                });

            // Update Departments UI (Left Column)
            const deptList = $('#departments-list');
            deptList.empty();
            Object.values(elementsByDepartment)
                .map(d => ({ ...d, percent: d.totalProofs > 0 ? (d.completedProofs / d.totalProofs) * 100 : 0 }))
                .sort((a, b) => b.percent - a.percent)
                .forEach(d => {
                    deptList.append(`
                        <div class="summary-list-item">
                            <div class="item-header">
                                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;" title="${d.label}">${d.label}</span> 
                                <span style="color:var(--primary); font-weight:800; font-size:0.8rem;" dir="ltr">${d.completedProofs} / ${d.totalProofs}</span>
                            </div>
                            <div class="mini-progress"><div class="fill" style="width: ${d.percent}%"></div></div>
                        </div>
                    `);
                });

            // Calculate and Update Final Result Chart (Middle Column)
            const dimensionElements = Object.values(elementsByDimension).map(dim => ({
                ...dim,
                value: dim.count > 0 ? (dim.totalProgress / dim.count) : 0
            }));
            const finalResult = dimensionElements.length > 0 
                ? (dimensionElements.reduce((sum, dim) => sum + dim.value, 0) / dimensionElements.length).toFixed(2)
                : 0;

            renderFinalResult(finalResult);
            
            // Render Bottom Grid (Circles)
            gridElements.sort((a, b) => {
                return String(a.number || "").localeCompare(String(b.number || ""), undefined, { numeric: true, sensitivity: 'base' });
            });
            renderDetailsGrid2(gridElements);
        }

        function renderFinalResult(value) {
            $('#final-result-value').text(`${value}%`);
            const degree = value * 3.6;
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0369a1';
            $('#final-result-chart').css('background', `conic-gradient(${primaryColor} ${degree}deg, #f1f5f9 ${degree}deg)`);
        }

        // --- DASHBOARD NATIVE POPUP (منقولة من صفحة Element) ---
        function openDashboardElementDialog(doc_name) {
            const url = `/app/elements-2024/${encodeURIComponent(doc_name)}`;
            const title = `تعديل العنصر: ${doc_name}`;

            let d = new frappe.ui.Dialog({
                title: title,
                size: 'extra-large',
                fields: [{ fieldname: 'iframe_html', fieldtype: 'HTML' }]
            });

            d.$wrapper.addClass('native-form-dialog');

            d.fields_dict.iframe_html.$wrapper.html(`
                <div id="iframe-loader" class="text-center p-5" style="color: #0ea5e9; height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <i class="fa fa-circle-notch fa-spin fa-3x mb-3" style="margin-bottom: 15px;"></i>
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
                            header.navbar, .layout-side-section { display: none !important; }
                            body { padding-top: 0 !important; --navbar-height: 0px !important; }
                            .main-section { margin-top: -100px !important; }
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
                $('#dashboard-loading').show();
                $('#dashboard-content').hide();
                $('#details-grid-section').hide();
                loadDashboardData();
            };
        }
        
        function renderDetailsGrid2(data) {
            const gridContainer = $('#details-grid-2');
            gridContainer.empty();
            
            data.forEach(item => {
                const customStatusClass = item.customStatus ? `custom-status-${item.customStatus}` : '';
                
                const statusItem = $(`
                    <div class="status-item status-${item.status} ${customStatusClass}" data-name="${item.id}">
                        ${item.number}
                        <div class="custom-element-tooltip" dir="rtl">
                            <div class="tooltip-row">
                                <span class="tooltip-label"><i class="fas fa-chart-line"></i> الإنجاز:</span> 
                                <span>${item.progress}%</span>
                            </div>
                            <div class="tooltip-row" style="margin-top: 4px; border-top: 1px dashed #374151; padding-top: 4px;">
                                <span class="tooltip-label"><i class="fas fa-user-tie"></i> التحول الرقمي:</span> 
                                <span>${item.dto}</span>
                            </div>
                            <div class="tooltip-row">
                                <span class="tooltip-label"><i class="fas fa-user"></i> الموظف المسؤول:</span> 
                                <span>${item.eic}</span>
                            </div>
                        </div>
                    </div>
                `);

                statusItem.on('click', function() { 
                    openDashboardElementDialog(item.id); 
                });
                
                gridContainer.append(statusItem);
            });
        }

        loadDashboardData();

	}, 200);
}

// -------------------------------------------------------------
// قـســــم صفحة المعايير (Element Page) يظل كما هو ليعمل بنجاح
// -------------------------------------------------------------
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