// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.query_reports["Expected Dimension Result"] = {
	"filters": [
		{
			"label": __("Dimension"),
			"fieldname": "dimension",
			"fieldtype": "Link",
			"options": "Dimension"
		},
		{
			"label": __("Vision"),
			"fieldname": "vision",
			"fieldtype": "Link",
			"options": "Vision",
			"hidden":0
		}
	]
};
