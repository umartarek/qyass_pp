// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.query_reports["Expected Result"] = {
	"filters": [
		{
			"label": __("Elements-2024"),
			"fieldname": "element",
			"fieldtype": "Link",
			"options": "Elements-2024"
		},
		{
			"label": __("Dimension"),
			"fieldname": "dimension",
			"fieldtype": "Link",
			"options": "Dimension",
			"hidden":0
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
