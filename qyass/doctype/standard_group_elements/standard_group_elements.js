// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on("Standard Group Elements", {
	setup(frm) {
        frm.set_query("standard", () => {
            return {
                query: "qyass.qyass.doctype.standard_group.standard_group.get_standard_list",
                filters: {},
            };
        });

        frm.set_query("group", () => {
            return {
                query: "qyass.qyass.doctype.standard_group_elements.standard_group_elements.get_standard_group_list",
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
    async evaluation(frm) {
        let element_count = 0
        await frm.call({method: "qyass.qyass.doctype.standard_group_elements.standard_group_elements.get_element_number",callback:(r) => {
            if (Object.keys(r.message).length>0){
                element_count = r.message.num
            }
        }})
        if (element_count > 0 ){
            if (frm.doc.evaluation == "التزام جزئي"){
                frm.set_value('weight',(1/element_count*2));
            }else if(frm.doc.evaluation == "التزام كلي"){
                frm.set_value('weight',(2/element_count*2));
            }else {
                frm.set_value('weight',0)
            }
        }
        frm.refresh_field('weight');
    },
});

// SELECT * FROM `tabElements Implementation` WHERE `parent`=%(param1)s AND `parenttype`=%(param2)s AND `parentfield`=%(param3)s ORDER BY `idx` ASC
// {'param1': '4.1.2', 'param2': 'Elements', 'param3': 'elements_implementation_table'}