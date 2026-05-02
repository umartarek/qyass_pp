# Copyright (c) 2023, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class StandardGroup(Document):
	pass


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_standard_list(doctype, txt, searchfield, start, page_len, filters):
	return frappe.get_all("Standards", fields=["name", "standard"], filters=filters, as_list=1)
