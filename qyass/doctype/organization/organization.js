// Copyright (c) 2023, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on("Organization", {
	setup(frm) {
        frm.set_query("city", () => {
            return {filters: { region: frm.doc.region } };
        });
	},

    open_website(frm) {
        if (frm.doc.website) {
            window.open(frm.doc.website);
        }
    },
});
