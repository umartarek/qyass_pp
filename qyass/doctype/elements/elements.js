// Copyright (c) 2023, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on("Elements", {
	setup(frm) {
        frm.set_query("standard", () => {
            return {
                query: "qyass.qyass.doctype.standard_group.standard_group.get_standard_list",
                filters: {},
            };
        });

        frm.set_query("group", () => {
            return {
                query: "qyass.qyass.doctype.elements.elements.get_standard_group_list",
                filters: { standard: frm.doc.standard }
            };
        });
	},

    async group(frm) {
        if (frm.doc.standard && frm.doc.group) {
            await frm.call({
                method: "frappe.client.get_value",
                args: { doctype: "Standard Group", fieldname: "subnumber",
                        filters: {"name": frm.doc.group} },
                callback: (r) => {
                    frm.doc.number = `${r.message.subnumber}.`;
                    frm.refresh_field("number");
                },
            });
        }
	},
});
