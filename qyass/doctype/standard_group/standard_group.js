// Copyright (c) 2023, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on("Standard Group", {
    setup(frm) {
        frm.set_query("standard", () => {
            return {
                query: "qyass.qyass.doctype.standard_group.standard_group.get_standard_list",
                filters: {},
            };
        });
    },

	async standard(frm) {
        if (frm.doc.standard) {
            await frm.call({
                method: "frappe.client.get_value",
                args: { doctype: "Standards", fieldname: "number",
                        filters: {"name": frm.doc.standard} },
                callback: (r) => {
                    frm.doc.subnumber = `${r.message.number}.`;
                    frm.refresh_field("subnumber");
                },
            });
        }
	},
});
