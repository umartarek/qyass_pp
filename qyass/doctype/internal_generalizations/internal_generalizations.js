// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on("Internal Generalizations", {
	refresh(frm) {
        // frappe.msgprint(frm.doc.generalization_subject,frm.doc.generalization_recipient,frm.doc.generalization_content)
        if (frm.doc.generalization_recipient.length > 0 && frm.doc.generalization_subject && frm.doc.generalization_content){
            frm.add_custom_button("Send Email",()=>{
                frappe.call({
                    method:"send_generalization_email",
                    doc:frm.doc,
                    callback: function(r){
                        if (r.message){
                            frappe.msgprint(r.message)
                        }
                    }
                })
            })

        }
	},
});
