// // Copyright (c) 2024, IT Systematic and contributors
// // For license information, please see license.txt

// frappe.ui.form.on('Project Meeting 2024', {
// 	refresh: function(frm) {
// 		if (!frm.doc.meeting_done && !in_list(["After", "Print"], frm.doc.status)) {
// 			frm.toolbar.print_icon.hide();
// 		}
// 		frm.toolbar.print_icon.on("click", (e) => {frm.set_value("status", "Print"); frm.save();});
// 		if (frm.doc.meeting_done) {
// 			frm.remove_custom_button('Start Meeting');
// 		}
// 		if (!frm.is_new() && !frm.doc.invitation_sent) {
// 			frm.add_custom_button(__("Send invitation"), function() {
// 				let parti=[]
// 				frm.doc.participate.forEach(part => {
// 					parti.push(part)
// 					console.log(parti)
// 				})
// 				frappe.call({
// 					method:"qyass.api.send_to_participate",
// 					args:{"parti": parti, "obj": frm.doc},
// 					callback:function(r){
// 						console.log(r)
// 						if (r.message) {
// 							frappe.show_alert({message: __(r.message), indicator: "#0369a1",});
// 							frm.set_value("invitation_sent", 1);
// 							frm.set_value("status", "Invited");
// 							// remove custom button
// 							frm.remove_custom_button('Send invitation');
// 							frm.save();
// 						}
// 				}
// 			})
// 			}).css({ 'background-color': '#25D366', 'color': 'white' });
// 		}
// 		if (frm.doc.invitation_sent && !frm.doc.meeting_done) {
// 			frm.add_custom_button(__("Start Meeting"), function() {
// 				frm.trigger("start_meeting")
// 			}).css({ 'background-color': '#25c7d3', 'color': 'white' });
// 		}
// 	},

// 	start_meeting: function(frm) {
// 		let parti=[]
// 		frm.doc.participate.forEach(part => {
// 			parti.push(part.participate)
			
// 			console.log(parti)
// 		})
// 		frappe.call({
// 			method:"qyass.api.send_to_participate",
// 			args:{"parti": parti, "obj": frm.doc},
// 			callback:function(r){
// 				console.log(r);
// 				// window.location.href = 'https://addon.newera-soft.com/meeting';
// 				window.open('https://qyass.newera-soft.com/meeting');
// 				frappe.confirm("The Meeting is Done?",
// 				() => {frm.set_value("meeting_done", 1); frm.set_value("status", "After");},
// 				() => {console.log("NO")}
// 				);
// 			}
// 		})
// 	},

// 	send_summary: async function(frm) {
// 		await frappe.call({
// 			method: "send_summary",
// 			doc : frm.doc,
// 			callback: (r) => {console.log(r);},
// 		});
// 	},

// 	onload_post_render: function(frm) {
// 		if (!frm.doc.meeting_done && !in_list(["After", "Print"], frm.doc.status)) {
// 			frm.toolbar.print_icon.hide();
// 		}
// 		frm.toolbar.print_icon.on("click", (e) => {frm.set_value("status", "Print"); frm.save();});
// 		if (frm.doc.meeting_done) {
// 			frm.remove_custom_button('Start Meeting');
// 		}
// 		if (frm.doc.meeting_done && in_list(["Invited", "After", "Print"], frm.doc.status)) {
// 			const UNTOUCHED_Fields = ["desction", "meeting_summary", "send_summary"]
// 			for (var field in frm.fields_dict) {
// 				var f = frm.fields_dict[field];
// 				if (!in_list(UNTOUCHED_Fields, f.df.fieldname)) {
// 					// console.log(f);
// 					f.df.read_only = 1;
// 				}
// 			}
// 			frm.refresh_fields();
// 		}
// 	},

// 	setup: function(frm) {
// 		if (frm.doc.meeting_done) {
// 			frm.remove_custom_button('Start Meeting');
// 		}

// 		frm.set_query("participate_type", "participate", function() {
// 			return {
// 				filters: {
// 					"name": ["in", ["Stakholder", "Employee"]]
// 				}
// 			}
// 		})
// 	},

// 	meeting_done: function(frm) {
// 		frm.set_value("status", "After");
// 	}
// });
// frappe.ui.form.on('Project Meeting Participate' ,{
// 	participate(frm,cdt,cdn){
// 		row = locals[cdt][cdn]
// 		if (row.participate && row.participate_type == 'Employee'){
// 			frappe.model.set_value('participate',cdt,cdn,'type','out')
// 		}
// 		frm.refresh_field('participate')
// 	}
// })
// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

// frappe.ui.form.on('Project Meeting 2024', {
// 	/**
// 	 * يتم تشغيله عند تحميل أو تحديث النموذج
// 	 */
// 	refresh: function(frm) {
// 		// التحكم في أيقونة الطباعة
// 		if (!frm.doc.meeting_done && !in_list(["After", "Print"], frm.doc.status)) {
// 			frm.toolbar.print_icon.hide();
// 		}
// 		frm.toolbar.print_icon.on("click", (e) => {
// 			frm.set_value("status", "طباعة المحضر");
// 			frm.save();
// 		});

// 		// إزالة زر "بدء الاجتماع" إذا انتهى الاجتماع
// 		if (frm.doc.meeting_done) {
// 			frm.remove_custom_button('Start Meeting');
// 		}

// 		// إضافة زر "إرسال الدعوة" إذا كان المستند محفوظًا ولم يتم إرسال الدعوات
// 		if (!frm.is_new() && !frm.doc.invitation_sent) {
// 			frm.add_custom_button(__("Send Invitation"), function() {
// 				// عرض مؤشر التحميل
// 				frappe.show_progress(__("Sending Invitations..."), frm.doc.participate.length, 0);

// 				// 1. تجهيز رسالة الاجتماع
// 				const meeting_date = frappe.datetime.str_to_user(frm.doc.meeting_date);
// 				const meeting_link = frm.doc.meeting_link || 'https://misa.newerasofts.com/meeting';
// 				let message = `
// 					<p>Dear Participant,</p>
// 					<p>You are invited to a project meeting on <strong>${meeting_date}</strong>.</p>
// 					<p>
// 						<a href='${meeting_link}' style="padding: 10px 15px; background-color: #0369a1; color: white; text-decoration: none; border-radius: 5px;">
// 							Press Here for Meeting
// 						</a>
// 					</p>
// 				`;

// 				// 2. إنشاء قائمة من الـ Promises لإرسال الإيميلات
// 				let email_promises = frm.doc.participate.map((participant, index) => {
// 					// التأكد من وجود بيانات المشارك
// 					if (!participant.participate_type || !participant.participate) {
// 						frappe.show_alert({message: __("Participant data is missing in row {0}", [index+1]), indicator: "orange"});
// 						return Promise.resolve(); // تخطي هذا المشارك
// 					}
					
// 					return frappe.db.get_value(participant.participate_type, participant.participate, "email")
// 						.then(r => {
// 							if (r.message && r.message.email) {
// 								let recipient_email = r.message.email;
								
// 								// 3. استدعاء دالة الإيميل المدمجة في Frappe
// 								return frappe.call({
// 									method: "frappe.core.doctype.communication.email.make",
// 									args: {
// 										recipients: recipient_email,
// 										subject: `Project Meeting Invitation: ${frm.doc.name}`,
// 										content: message,
// 										send_email: 1,
// 										doctype: "Project Meeting 2024",
// 										name: frm.doc.name
// 									}
// 								}).then(() => {
// 									// تحديث مؤشر التحميل بعد كل إرسال ناجح
// 									frappe.show_progress(__("Sending Invitations..."), frm.doc.participate.length, index + 1);
// 								});
// 							} else {
// 								frappe.show_alert({message: __("Email not found for {0}", [participant.participate]), indicator: "orange"});
// 								return Promise.resolve();
// 							}
// 						});
// 				});

// 				// 4. بعد انتهاء جميع عمليات الإرسال
// 				Promise.all(email_promises).then(() => {
// 					// إخفاء مؤشر التحميل
// 					frappe.hide_progress();
// 					frappe.show_alert({ message: __("All invitations have been sent."), indicator: "green" });
// 					frm.set_value("invitation_sent", 1);
// 					frm.set_value("status", "دعوة الاجتماع");
// 					frm.save();
// 					frm.remove_custom_button('Send Invitation');
// 				});
				
// 			}).css({ 'background-color': '#25D366', 'color': 'white' });
// 		}

// 		// إضافة زر "بدء الاجتماع" إذا تم إرسال الدعوات ولم ينتهِ الاجتماع
// 		if (frm.doc.invitation_sent && !frm.doc.meeting_done) {
// 			frm.add_custom_button(__("Start Meeting"), function() {
// 				// فتح رابط الاجتماع في نافذة جديدة
// 				window.open(frm.doc.meeting_link || 'https://misa.newerasofts.com/meeting');
				
// 				// سؤال المستخدم إذا انتهى الاجتماع
// 				frappe.confirm(
// 					__("Is the meeting finished?"),
// 					() => { // إذا كانت الإجابة "نعم"
// 						frm.set_value("meeting_done", 1);
// 						frm.set_value("status", "بعد الاجتماع");
// 						frm.save();
// 					},
// 					() => { // إذا كانت الإجابة "لا"
// 						// لا تفعل شيئًا
// 					}
// 				);
// 			}).css({ 'background-color': '#25c7d3', 'color': 'white' });
// 		}
// 	},

// 	/**
// 	 * يتم تشغيله عند تحميل النموذج لأول مرة
// 	 */
// 	onload: function(frm) {
// 		// الحفظ التلقائي للمستندات غير الجديدة وغير المنتهية
// 		if (frm.is_new() || frm.doc.meeting_done) {
// 			return;
// 		}

// 		// حفظ تلقائي كل 60 ثانية (يمكنك تغيير المدة)
// 		frm.autosave_interval = setInterval(() => {
// 			// تحقق إذا كانت هناك تغييرات لم يتم حفظها
// 			if (frm.is_dirty()) {
// 				// 'Save' يحفظ، 'null' لا يعرض رسالة نجاح، 'true' يحفظ في الخلفية بصمت
// 				frm.save('Save', null, null, true).then(() => {
// 					frappe.show_alert({message: __("Auto Saved"), indicator: "gray"});
// 				});
// 			}
// 		}, 60000); // 60000_MS = 1 minute
// 	},

// 	/**
// 	 * يتم تشغيله عند إغلاق أو مغادرة النموذج
// 	 */
// 	on_unload: function(frm) {
// 		// إيقاف الحفظ التلقائي لمنع تسريب الذاكرة
// 		if (frm.autosave_interval) {
// 			clearInterval(frm.autosave_interval);
// 		}
// 	},

// 	/**
// 	 * يتم تشغيله بعد رسم كل الحقول في الواجهة
// 	 */
// 	onload_post_render: function(frm) {
// 		// قفل الحقول بعد انتهاء الاجتماع
// 		if (frm.doc.meeting_done && in_list(["Invited", "After", "Print"], frm.doc.status)) {
// 			const UNTOUCHED_Fields = ["desction", "meeting_summary", "send_summary"];
// 			for (var field in frm.fields_dict) {
// 				var f = frm.fields_dict[field];
// 				if (!in_list(UNTOUCHED_Fields, f.df.fieldname)) {
// 					f.df.read_only = 1;
// 				}
// 			}
// 			frm.refresh_fields();
// 		}
// 	},

// 	/**
// 	 * يتم تشغيله مرة واحدة عند إعداد النموذج
// 	 */
// 	setup: function(frm) {
// 		// فلترة أنواع المشاركين لتقتصر على "Stakholder" و "Employee"
// 		frm.set_query("participate_type", "participate", function() {
// 			return {
// 				filters: {
// 					"name": ["in", ["Stakholder", "Employee"]]
// 				}
// 			}
// 		});
// 	},

// 	/**
// 	 * يتم تشغيله عند تغيير قيمة حقل "meeting_done"
// 	 */
// 	meeting_done: function(frm) {
// 		if (frm.doc.meeting_done) {
// 			frm.set_value("status", "بعد الاجتماع");
// 			// يمكنك هنا تشغيل الحفظ مباشرة أو تركه للحفظ التلقائي
// 			frm.save();
// 		}
// 	}
// });


// /**
//  * كود خاص بالجدول الفرعي "Project Meeting Participate"
//  */
// frappe.ui.form.on('Project Meeting Participate', {
// 	participate: function(frm, cdt, cdn) {
// 		let row = locals[cdt][cdn];
// 		if (row.participate && row.participate_type == 'Employee') {
// 			// يمكنك إضافة منطق إضافي هنا إذا لزم الأمر
// 			// frappe.model.set_value(cdt, cdn, 'type', 'out');
// 		}
// 		frm.refresh_field('participate');
// 	}
// });