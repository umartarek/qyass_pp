// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.ui.form.on("Organization Entry", {
	setup(frm) {
        // set query on Standard fields
        set_queries(frm, "standard", {});

        // make the Elements table field unhidden
        if (!frm.is_new()) {
            frm.set_df_property("elements", "hidden", 0);
            if (frm.doc.standard_two) {
                frm.set_df_property("elements_table_two", "hidden", 0);
            }
        }

        // set indicator for element in Child Table `Elements Child Table`
        frm.set_indicator_formatter("element", (doc) => {
            var colors = {
                'التزام كلي': 'green',
                'التزام جزئي': 'orange',
                'عدم التزام': 'red',
                'لا ينطبق': 'gray',
            };
            return colors[doc.evaluation];
        });

        // trigger the frappe chart
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
	},

    onload(frm) {
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
    },

    refresh(frm) {
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
    },

    onload_post_render(frm) {
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
    },

    after_save(frm) {
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
    },

    standard(frm) {
        set_queries(frm, "standard_two", { "name":  ["!=", frm.doc.standard] });
        get_elements(frm, frm.doc.standard, "elements");
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
    },

    standard_two(frm) {
        set_queries(frm, "standard", { "name":  ["!=", frm.doc.standard_two] });
        get_elements(frm, frm.doc.standard_two, "elements_table_two");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
    },
});


// for child table `Elements Child Table`
frappe.ui.form.on("Elements Child Table", {
    elements_delete(frm, cdt, cdn) {
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
    },

    evaluation(frm, cdt, cdn) {
        frm.refresh_field("elements");
        frm.refresh_field("elements_table_two");
        create_chart(frm, frm.doc.elements, "chart_one", "standard_results_one");
        create_chart(frm, frm.doc.elements_table_two, "chart_two", "standard_results_two");
    },
});


function create_chart(frm, list, id, htmlfield) {
    // Checks
    if (!list) { frm.refresh_field(htmlfield); return; }
    if (!document.getElementById(id)) { frm.refresh_field(htmlfield); return; }
    if (!list.length)
            { frm.refresh_field(htmlfield); return; }

        const colors = {
            'التزام كلي': '#00E676',
            'التزام جزئي': '#FFA500',
            'عدم التزام': '#FF0000',
            'لا ينطبق': '#808080',
        };
            var results = {
            'التزام كلي': 0,
            'التزام جزئي': 0,
            'عدم التزام': 0,
            'لا ينطبق': 0,
        };
        list.forEach( (r) => {
            results[r.evaluation] += 1;
        });
        const data = {
            labels: ["التزام كلي", "التزام جزئي", "عدم التزام", "لا ينطبق"],
            datasets: [
                {values: [results['التزام كلي'], results['التزام جزئي'], results['عدم التزام'], results['لا ينطبق']]}
            ],
        }
        const chart = new frappe.Chart(`#${id}`, {
            title: "Standard Results",
            data: data,
            type: "percentage",
            barOptions: {
                height: 25,          // default: 20
            },
            valuesOverPoints: 1, // default: 0
            colors: [colors['التزام كلي'], colors['التزام جزئي'], colors['عدم التزام'], colors['لا ينطبق']]
        });
}


function set_queries(frm, fieldname, filters) {
    frm.set_query(fieldname, () => {
        return {
            query: "qyass.qyass.doctype.standard_group.standard_group.get_standard_list",
            filters: filters,
        };
    });
}


function get_elements(frm, standard, tablefield) {
    if (!standard)
            return;
        let p = frappe.call({
            method: "get_elements",
            doc: frm.doc,
            args: {standard: standard},
        });
        p.then((r) => {
            if (r.message.data.length > 0) {
                frm.clear_table(tablefield);
                r.message.data.forEach((d) => {
                    frm.add_child(tablefield, {"element": d.name, "element_name": d.element, "evaluation": d.evaluation, "recommendations": d.recommendations, "status": d.custom_status});
                });
                frm.refresh_field(tablefield);
                frm.set_df_property(tablefield, "hidden", 0);
            }
        });
}

// {values: [results['التزام كلي'], results['التزام جزئي'], results['عدم التزام'], results['لا ينطبق']]},