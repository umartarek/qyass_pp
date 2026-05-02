# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from qyass.qyass.doctype.organization_entry_records.organization_entry_records import OrganizationEntryRecords

class OrganizationEntry(Document):

	@frappe.whitelist()
	def get_elements(self, standard: str) -> dict:
		elements = frappe.get_all(
			"Standard Group Elements",
			fields=["*"],
			filters={"standard": standard},
		)
		return {"data": elements}

	def before_save(self):
		frappe.enqueue(OrganizationEntryRecords.create_organization_entry_records, queue="long", timeout=10000, job_name="before_save_OrganizationEntry", organization_entry=self)
