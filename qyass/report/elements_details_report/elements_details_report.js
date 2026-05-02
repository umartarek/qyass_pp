// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.query_reports["Elements Details Report"] = {
	"filters": [
		{
			"label": __("Standard"),
			"fieldname": "standard",
			"fieldtype": "Link",
			"options": "Standards",
			"get_query": () => {
				return {
					query: "qyass.qyass.doctype.standard_group.standard_group.get_standard_list",
					filters: {},
				};
			},
		},
		{
			"label": __("Group"),
			"fieldname": "group",
			"fieldtype": "Link",
			"options": "Standard Group",
			"get_query": () => {
				return {
					query: "qyass.qyass.doctype.standard_group_elements.standard_group_elements.get_standard_group_list",
					filters: { standard: frappe.query_report.get_filter_value('standard') }
				};
			}
		}
	]
};
