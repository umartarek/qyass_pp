// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on('Projects Meeting', {
	refresh: function(frm) {
		if (!frm.doc.meeting_done && !in_list(["After", "Print"], frm.doc.status)) {
			frm.toolbar.print_icon.hide();
		}
		frm.toolbar.print_icon.on("click", (e) => {frm.set_value("status", "Print"); frm.save();});
		if (frm.doc.meeting_done) {
			frm.remove_custom_button('Start Meeting');
		}
		if (!frm.is_new() && !frm.doc.invitation_sent) {
			frm.add_custom_button(__("Send Invitation"), function() {
				let parti=[]
				frm.doc.participate.forEach(part => {
					parti.push(part)
					console.log(parti)
				})
				frappe.call({
					method:"qyass.api.send_to_participate",
					args:{"parti": parti, "obj": frm.doc},
					callback:function(r){
						console.log(r)
						if (r.message) {
							frappe.show_alert({message: __(r.message), indicator: "green",});
							frm.set_value("invitation_sent", 1);
							frm.set_value("status", "Invited");
							// remove custom button
							frm.remove_custom_button('Send Invitation');
							frm.save();
						}
				}
			})
			}).css({ 'background-color': '#25D366', 'color': 'white' });
		}
		if (frm.doc.invitation_sent && !frm.doc.meeting_done) {
			frm.add_custom_button(__("Start Meeting"), function() {
				frm.trigger("start_meeting")
			}).css({ 'background-color': '#25c7d3', 'color': 'white' });
		}
	},

	start_meeting: function(frm) {
		let parti=[]
		frm.doc.participate.forEach(part => {
			parti.push(part.participate)
			
			console.log(parti)
		})
		frappe.call({
			method:"qyass.api.send_to_participate",
			args:{"parti": parti, "obj": frm.doc},
			callback:function(r){
				console.log(r);
				// window.location.href = 'https://addon.newera-soft.com/meeting';
				window.open('https://qyass.newera-soft.com/meeting');
				frappe.confirm("The Meeting is Done?",
				() => {frm.set_value("meeting_done", 1); frm.set_value("status", "After");},
				() => {console.log("NO")}
				);
			}
		})
	},

	send_summary: async function(frm) {
		await frappe.call({
			method: "send_summary",
			doc : frm.doc,
			callback: (r) => {console.log(r);},
		});
	},

	onload_post_render: function(frm) {
		if (!frm.doc.meeting_done && !in_list(["After", "Print"], frm.doc.status)) {
			frm.toolbar.print_icon.hide();
		}
		frm.toolbar.print_icon.on("click", (e) => {frm.set_value("status", "Print"); frm.save();});
		if (frm.doc.meeting_done) {
			frm.remove_custom_button('Start Meeting');
		}
		if (frm.doc.meeting_done && in_list(["Invited", "After", "Print"], frm.doc.status)) {
			const UNTOUCHED_Fields = ["desction", "meeting_summary", "send_summary"]
			for (var field in frm.fields_dict) {
				var f = frm.fields_dict[field];
				if (!in_list(UNTOUCHED_Fields, f.df.fieldname)) {
					// console.log(f);
					f.df.read_only = 1;
				}
			}
			frm.refresh_fields();
		}
	},

	setup: function(frm) {
		if (frm.doc.meeting_done) {
			frm.remove_custom_button('Start Meeting');
		}

		frm.set_query("participate_type", "participate", function() {
			return {
				filters: {
					"name": ["in", ["Stakholder", "Employee"]]
				}
			}
		})
	},

	meeting_done: function(frm) {
		frm.set_value("status", "After");
	}
});
