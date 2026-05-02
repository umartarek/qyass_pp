// Copyright (c) 2024, IT Systematic and contributors
// For license information, please see license.txt

frappe.query_reports["Departments-Elements"] = {
	"filters": [
		{
			"label": __("Department"),
			"fieldname": "department",
			"fieldtype": "Link",
			"options": "Departments",
		}
	]
};
