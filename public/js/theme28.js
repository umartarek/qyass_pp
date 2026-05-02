// $(document).ready(function() {
//   // --- LANGUAGE DETECTION ---
//   const getCurrentLanguage = () => {
//     // Check Frappe's language setting
//     if (window.frappe && window.frappe.boot && window.frappe.boot.lang) {
//       return window.frappe.boot.lang;
//     }
//     // Fallback: check HTML lang attribute
//     const htmlLang = document.documentElement.lang || document.documentElement.getAttribute('lang');
//     if (htmlLang) {
//       return htmlLang.toLowerCase();
//     }
//     // Fallback: check for Arabic content in the page
//     const hasArabicText = document.body.textContent.match(/[\u0600-\u06FF]/);
//     return hasArabicText ? 'ar' : 'en';
//   };

//   const currentLang = getCurrentLanguage();
//   const isRTL = currentLang === 'ar' || currentLang.startsWith('ar');

//   // --- MENU TRANSLATIONS ---
//   const menuItems = {
//     ar: {
//       title: 'القائمة الرئيسية',
//       toggleText: 'القائمة',
//       dash: 'لوحة القيادة',
//       qyass: 'قياس',
//       employees: 'الموظفون',
//       reports: 'التقارير',
//       visions: 'المناظير',
//       elements: 'المعايير',
//       completeness: 'اكتمال المستندات',
//       Audiolibrary: 'مكتبة الصوتيات',
//       Tree: 'شجرة التخطيط الاستراتيجية'
//     },
//     en: {
//       title: 'Main Menu',
//       toggleText: 'Menu',
//       dash: 'Dashboard',
//       qyass: 'Qyass',
//       employees: 'Employees',
//       reports: 'Reports',
//       visions: 'Visions',
//       elements: 'Elements',
//       completeness: 'Completeness of Documents',
//       Audiolibrary: 'Audio Library',
//       Tree: 'Stratigic Planning Tree'
//     }
//   };

//   const currentTexts = menuItems[isRTL ? 'ar' : 'en'];

//   // Add fonts and icons
//   if (!$('link[href*="Almarai"]').length) {
//     $('head').append('<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;600&display=swap" rel="stylesheet">');
//   }
//   if (!$('link[href*="font-awesome"]').length) {
//     $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">');
//   }

//   // Create toggle button
//   const toggleButton = `
//     <div class="erp-toggle" style="
//         position: fixed;
//         top: 50%;
//         ${isRTL ? 'right: 0;' : 'left: 0;'}
//         transform: translateY(-50%);
//         z-index: 1001;
//         background: #2563eb;
//         color: white;
//         padding: 12px 6px;
//         border-radius: ${isRTL ? '8px 0 0 8px;' : '0 8px 8px 0;'}
//         cursor: pointer;
//         box-shadow: ${isRTL ? '-3px 0 10px rgba(37, 99, 235, 0.3);' : '3px 0 10px rgba(37, 99, 235, 0.3);'}
//         font-family: ${isRTL ? "'Almarai', sans-serif;" : "'Inter', 'Segoe UI', sans-serif;"}
//         font-weight: 600;
//         font-size: 11px;
//         transition: all 0.3s ease;
//         writing-mode: vertical-${isRTL ? 'rl' : 'lr'};
//         user-select: none;
//         direction: ${isRTL ? 'rtl' : 'ltr'};
//     ">
//         ${currentTexts.toggleText}
//     </div>
//   `;

//   // Create the simple sidebar (width changed to 170px)
//   const erpSidebar = `
//     <div class="erp-sidebar" style="
//         position: fixed;
//         top: 0;
//         ${isRTL ? 'right: -170px;' : 'left: -170px;'}
//         width: 170px;
//         height: 100vh;
//         background: white;
//         box-shadow: ${isRTL ? '-3px 0 15px rgba(0,0,0,0.1);' : '3px 0 15px rgba(0,0,0,0.1);'}
//         font-family: ${isRTL ? "'Almarai', sans-serif;" : "'Inter', 'Segoe UI', sans-serif;"}
//         z-index: 1000;
//         transition: ${isRTL ? 'right' : 'left'} 0.3s ease;
//         border-${isRTL ? 'left' : 'right'}: 1px solid #e5e7eb;
//         direction: ${isRTL ? 'rtl' : 'ltr'};
//     ">
//         <!-- Header -->
//         <div style="
//             background: #2563eb;
//             color: white;
//             padding: 16px;
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
            
//         ">
//             <h3 style="margin: 0; font-size: 14px; font-weight: 600; text-align: ${isRTL ? 'right' : 'left'};">${currentTexts.title}</h3>
//             <button class="close-btn" style="
//                 background: none;
//                 border: none;
//                 color: white;
//                 font-size: 18px;
//                 cursor: pointer;
//                 padding: 2px 6px;
//                 border-radius: 4px;
//             ">×</button>
//         </div>

//         <!-- Menu Items -->
//         <div style="padding: 8px 0;">
//                       <a href="/app/dashtest" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-ruler-combined" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.dash}</span>
//             </a>
            
//             <a href="/app/قياس" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-ruler-combined" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.qyass}</span>
//             </a>

//             <a href="/app/users" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-users" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.employees}</span>
//             </a>

//             <a href="/app/التقارير" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-chart-bar" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.reports}</span>
//             </a>

//             <a href="/app/المناظير" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-eye" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.visions}</span>
//             </a>

//             <a href="/app/المعايير" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-puzzle-piece" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.elements}</span>
//             </a>

//             <a href="/app/اكتمال-المستندات" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-file-circle-check" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.completeness}</span>
//             </a>
//             <a href="/app/tree" onclick="location.href='/app/tree'" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-file-circle-check" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.Tree}</span>
//             </a>
//             <a href="/audio" class="erp-item" style="
//                 display: flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 10px 12px;
//                 color: #374151;
//                 text-decoration: none;
//                 transition: all 0.2s ease;
//                 border-${isRTL ? 'right' : 'left'}: 3px solid transparent;
//                 text-align: ${isRTL ? 'right' : 'left'};
//             ">
//                 <i class="fas fa-file-circle-check" style="font-size: 14px; color: white; min-width: 16px; text-align: center;"></i>
//                 <span style="font-size: 12px; font-weight: 600;">${currentTexts.Audiolibrary}</span>
//             </a>
//         </div>
//     </div>

//     <!-- Overlay -->
//     <div class="sidebar-overlay" style="
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100vw;
//         height: 100vh;
//         background: rgba(0,0,0,0.2);
//         z-index: 999;
//         opacity: 0;
//         visibility: hidden;
//         transition: all 0.3s ease;
//     "></div>
//     <style>
//     *{
//   font-family: 'Almarai';
// }
// .app-logo{
//   max-height: none !important;
//   height: 20px !important;
//   cursor: pointer !important;
// }
// .navbar{
//   padding: 35px 0px !important;
//   background-color: #3b82f6  !important;
//   border-bottom: none !important;
//   border-bottom-left-radius: 50px !important;
//   position: fixed !important;
//   width: 100% !important;
// }
// #custom-arabic-menu{
//   position: fixed;
//   top: 70px;
//   right: 0px;
//   height: 90%;
// }
// .sidebar-toggle-btn{
//   display: none !important;
// }
// .layout-side-section{
//   display: none !important;
// }
// .page-container{
//   padding-right: 0px !important;
//   padding-top: 90px !important;
//   background: aliceblue !important;
// }
// .page-head {
//   background: aliceblue !important;
// }

// .title-text{
//   color: #3b82f6 !important;
// }

// .user-image{
//   margin: 0px !important;
// }

// @media (max-width: 480px) {
//   .app-logo{
//   height: 35px !important;
//    max-width: none !important;
//   }
// }
// @media (max-width: 1028px) {
//   .page-container {
//       padding-top: 90px !important;
//   }
// }
// .custom-menu{
//   padding-top: 50px!important;
//   top: 30px !important;
//   height: 90% !important;
//   margin-right: 0px !important;
//   border-bottom-left-radius: 50px !important;
// }
// .layout-main-section-wrapper{
//   padding-left: 0px !important;
//   padding-right: 0px !important;
// }
// .ellipsis{
//   color:#3b82f6 !important;
// }
// .layout-main-section{
//   background: transparent !important;
//   border: none !important;    
// }
// .custom-menu{
//   display: none !important;

// }
// .erp-sidebar{
//   background:#3b82f6  !important;

// }
// .erp-item{
//   color: #fff !important;
// }
// .shortcut-widget-box{
// padding: 10px !important;
// justify-content: center !important;
//   align-items: center !important;
//   transition: transform 0.3s ease !important;
//   }
//   .shortcut-widget-box:hover{
//   transform: translateY(-3px) !important;
//   background: lavender !important;
// }
//     </style>
//   `;

//   // Add elements to the page
//   $('body').append(toggleButton + erpSidebar);

//   // ==========================================
//   // --- FORCE APP LOGO CUSTOM REDIRECT ---
//   // ==========================================
//   // Using an interval because Frappe replaces the DOM dynamically on navigation
//   setInterval(function() {
//       $('.app-logo').each(function() {
//           var $logo = $(this);
          
//           // 1. Force modify the parent anchor link if it exists to disable Frappe routing
//           var $parentLink = $logo.closest('a');
//           if ($parentLink.length > 0) {
//               $parentLink.attr('href', 'https://misa.newerasofts.com/app/qyass-dashboard');
//               // Removing standard frappe routing attributes that intercept clicks
//               $parentLink.removeAttr('data-route'); 
//               $parentLink.removeClass('route-link');
//               $parentLink.off('click'); // remove existing jQuery clicks
//           }

//           // 2. Attach a native, highly aggressive "Capture Phase" event listener
//           if (!$logo.attr('data-click-forced')) {
//               $logo.attr('data-click-forced', 'true');
              
//               // Using vanilla JS 'true' (Capture Phase) ensures this fires BEFORE any framework code
//               this.addEventListener('click', function(e) {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   e.stopImmediatePropagation();
//                   window.location.href = 'https://misa.newerasofts.com/app/qyass-dashboard';
//               }, true); // The `true` here is the secret sauce.

//               // If clicking the parent anchor triggers it, apply capture there too
//               if ($parentLink.length > 0) {
//                   $parentLink[0].addEventListener('click', function(e) {
//                       e.preventDefault();
//                       e.stopPropagation();
//                       e.stopImmediatePropagation();
//                       window.location.href = 'https://misa.newerasofts.com/app/qyass-dashboard';
//                   }, true);
//               }
//           }
//       });
//   }, 500); // Check every 500ms to ensure the element is always overridden

//   // Toggle functionality
//   $('.erp-toggle').click(function() {
//     const sidebar = $('.erp-sidebar');
//     const currentPosition = isRTL ? sidebar.css('right') : sidebar.css('left');
//     const isOpen = currentPosition === '0px';
    
//     if (isOpen) {
//       closeSidebar();
//     } else {
//       openSidebar();
//     }
//   });

//   // Close button
//   $('.close-btn').click(function() {
//     closeSidebar();
//   });

//   // Overlay click to close
//   $('.sidebar-overlay').click(function() {
//     closeSidebar();
//   });

//   // Close sidebar when clicking on any menu item link
//   $('.erp-item').click(function() {
//     closeSidebar();
//   });

//   // Open sidebar function (updated for 170px width)
//   function openSidebar() {
//     if (isRTL) {
//       $('.erp-sidebar').css('right', '0px');
//       $('.erp-toggle').css('right', '170px');
//     } else {
//       $('.erp-sidebar').css('left', '0px');
//       $('.erp-toggle').css('left', '170px');
//     }
//     $('.sidebar-overlay').css({
//       'opacity': '1',
//       'visibility': 'visible'
//     });
//   }

//   // Close sidebar function (updated for 170px width)
//   function closeSidebar() {
//     if (isRTL) {
//       $('.erp-sidebar').css('right', '-170px');
//       $('.erp-toggle').css('right', '0px');
//     } else {
//       $('.erp-sidebar').css('left', '-170px');
//       $('.erp-toggle').css('left', '0px');
//     }
//     $('.sidebar-overlay').css({
//       'opacity': '0',
//       'visibility': 'hidden'
//     });
//   }

//   // Menu item hover effects (darker blue background)
//   $('.erp-item').hover(
//     function() {
//       $(this).css({
//         'background-color': '#1d4ed8',
//         'color': 'white',
//         [`border-${isRTL ? 'right' : 'left'}-color`]: '#ffffff'
//       });
//     },
//     function() {
//       $(this).css({
//         'background-color': 'transparent',
//         'color': '#374151',
//         [`border-${isRTL ? 'right' : 'left'}-color`]: 'transparent'
//       });
//     }
//   );

//   // Close button hover effect
//   $('.close-btn').hover(
//     function() {
//       $(this).css('background', 'rgba(255,255,255,0.2)');
//     },
//     function() {
//       $(this).css('background', 'none');
//     }
//   );

//   // Toggle button hover effect (darker blue)
//   $('.erp-toggle').hover(
//     function() {
//       $(this).css('background', '#1d4ed8');
//     },
//     function() {
//       $(this).css('background', '#2563eb');
//     }
//   );

//   // Keyboard shortcut (ESC to close)
//   $(document).keydown(function(e) {
//     if (e.keyCode === 27) {
//       closeSidebar();
//     }
//   });

//   // Language change detection and sidebar refresh
//   const handleLanguageChange = () => {
//     const newLang = getCurrentLanguage();
//     const wasRTL = isRTL;
//     const nowRTL = newLang === 'ar' || newLang.startsWith('ar');
    
//     if (wasRTL !== nowRTL) {
//       console.log(`Language changed from ${wasRTL ? 'Arabic' : 'English'} to ${nowRTL ? 'Arabic' : 'English'}, reloading sidebar...`);
//       $('.erp-sidebar, .erp-toggle, .sidebar-overlay').remove();
//       // Re-initialize with new language
//       setTimeout(() => {
//         location.reload(); // Simple approach - reload the page
//       }, 100);
//     }
//   };

//   // Listen for Frappe language changes
//   if (window.frappe) {
//     $(document).on('app_ready', handleLanguageChange);
//     $(document).on('page-change', handleLanguageChange);
//   }

//   console.log(`✅ Enhanced Bilingual Sidebar with Custom Menu Items (${isRTL ? 'Arabic RTL' : 'English LTL'}) loaded successfully.`);
// });

$(document).ready(function() {
  // --- LANGUAGE DETECTION ---
  const getCurrentLanguage = () => {
    // Check Frappe's language setting
    if (window.frappe && window.frappe.boot && window.frappe.boot.lang) {
      return window.frappe.boot.lang;
    }
    // Fallback: check HTML lang attribute
    const htmlLang = document.documentElement.lang || document.documentElement.getAttribute('lang');
    if (htmlLang) {
      return htmlLang.toLowerCase();
    }
    // Fallback: check for Arabic content in the page
    const hasArabicText = document.body.textContent.match(/[\u0600-\u06FF]/);
    return hasArabicText ? 'ar' : 'en';
  };

  const currentLang = getCurrentLanguage();
  const isRTL = currentLang === 'ar' || currentLang.startsWith('ar');

  // Add fonts and icons
  if (!$('link[href*="Almarai"]').length) {
    $('head').append('<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;600&display=swap" rel="stylesheet">');
  }
  if (!$('link[href*="font-awesome"]').length) {
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">');
  }

  // Preserve global CSS Overrides that were previously inside the sidebar template
  const globalStyles = `
    <style>
      *{
        font-family: 'Almarai';
      }
      .app-logo{
        max-height: none !important;
        height: 20px !important;
        cursor: pointer !important;
      }
      .navbar{
        padding: 35px 0px !important;
        background-color: #3b82f6  !important;
        border-bottom: none !important;
        border-bottom-left-radius: 50px !important;
        position: fixed !important;
        width: 100% !important;
      }
      #custom-arabic-menu{
        position: fixed;
        top: 70px;
        right: 0px;
        height: 90%;
      }
      .sidebar-toggle-btn{
        display: none !important;
      }
      .layout-side-section{
        display: none !important;
      }
      .page-container{
        padding-right: 0px !important;
        padding-top: 90px !important;
        background: aliceblue !important;
      }
      .page-head {
        background: aliceblue !important;
      }
      .title-text{
        color: #3b82f6 !important;
      }
      .user-image{
        margin: 0px !important;
      }
      @media (max-width: 480px) {
        .app-logo{
          height: 35px !important;
          max-width: none !important;
        }
      }
      @media (max-width: 1028px) {
        .page-container {
            padding-top: 90px !important;
        }
      }
      .custom-menu{
        padding-top: 50px!important;
        top: 30px !important;
        height: 90% !important;
        margin-right: 0px !important;
        border-bottom-left-radius: 50px !important;
        display: none !important;
      }
      .layout-main-section-wrapper{
        padding-left: 0px !important;
        padding-right: 0px !important;
      }
      .ellipsis{
        color:#3b82f6 !important;
      }
      .layout-main-section{
        background: transparent !important;
        border: none !important;    
      }
      .shortcut-widget-box{
        padding: 10px !important;
        justify-content: center !important;
        align-items: center !important;
        transition: transform 0.3s ease !important;
      }
      .shortcut-widget-box:hover{
        transform: translateY(-3px) !important;
        background: lavender !important;
      }
    </style>
  `;

  // Add styles to the page
  $('body').append(globalStyles);

  // ==========================================
  // --- FORCE APP LOGO CUSTOM REDIRECT ---
  // ==========================================
  // Using an interval because Frappe replaces the DOM dynamically on navigation
  setInterval(function() {
      $('.app-logo').each(function() {
          var $logo = $(this);
          
          // 1. Force modify the parent anchor link if it exists to disable Frappe routing
          var $parentLink = $logo.closest('a');
          if ($parentLink.length > 0) {
              $parentLink.attr('href', 'https://misa.newerasofts.com/app/qyass-dashboard');
              // Removing standard frappe routing attributes that intercept clicks
              $parentLink.removeAttr('data-route'); 
              $parentLink.removeClass('route-link');
              $parentLink.off('click'); // remove existing jQuery clicks
          }

          // 2. Attach a native, highly aggressive "Capture Phase" event listener
          if (!$logo.attr('data-click-forced')) {
              $logo.attr('data-click-forced', 'true');
              
              // Using vanilla JS 'true' (Capture Phase) ensures this fires BEFORE any framework code
              this.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  window.location.href = 'https://misa.newerasofts.com/app/qyass-dashboard';
              }, true); // The `true` here is the secret sauce.

              // If clicking the parent anchor triggers it, apply capture there too
              if ($parentLink.length > 0) {
                  $parentLink[0].addEventListener('click', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      window.location.href = 'https://misa.newerasofts.com/app/qyass-dashboard';
                  }, true);
              }
          }
      });
  }, 500); // Check every 500ms to ensure the element is always overridden

  // Language change detection to reload the page
  const handleLanguageChange = () => {
    const newLang = getCurrentLanguage();
    const wasRTL = isRTL;
    const nowRTL = newLang === 'ar' || newLang.startsWith('ar');
    
    if (wasRTL !== nowRTL) {
      console.log(`Language changed from ${wasRTL ? 'Arabic' : 'English'} to ${nowRTL ? 'Arabic' : 'English'}, reloading page...`);
      setTimeout(() => {
        location.reload(); 
      }, 100);
    }
  };

  // Listen for Frappe language changes
  if (window.frappe) {
    $(document).on('app_ready', handleLanguageChange);
    $(document).on('page-change', handleLanguageChange);
  }

  console.log(`✅ App overrides (${isRTL ? 'Arabic RTL' : 'English LTR'}) loaded successfully.`);
});