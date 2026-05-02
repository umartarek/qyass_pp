# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class OrganizationEntryRecords(Document):

	def on_update(self):
	# 	# When update Organization Entry Records update the corsponding child table record in Organization Entry
		organization_entry_doc = frappe.get_doc("Organization Entry", self.get("organization_entry"))
		frappe.db.sql(
			f"""
			UPDATE `tabElements Child Table`
			SET status = "{self.get("status")}"
			WHERE 
				element = "{self.get("element")}"
				AND parent = "{self.get("organization_entry")}";
			"""
		)
  
		frappe.db.sql(
			f"""
			UPDATE `tabStandard Group Elements`
			SET custom_status = "{self.get("status")}" , evaluation = "{self.get("evaluation")}", recommendations = "{self.get("recommendations")}"
			WHERE
				name = "{self.get("element")}";
			"""
		)

	@staticmethod
	def create_organization_entry_records(organization_entry):

		# child table fields names from Organization Entry
		CHILD_TABLE_FIELDS = ["elements", "elements_table_two"]

		for child in CHILD_TABLE_FIELDS:
			for element in organization_entry.get(child):

				element_doc = frappe.get_doc("Standard Group Elements", element.get("element"))

				# Fields to update or to use to create new Organization Entry Records
				update_fields = {
						"organization_entry": organization_entry.get('name'),
						"organization": organization_entry.get('organization'),
						"year": organization_entry.get('year'),
						"standard": organization_entry.get('standard') if child == "elements" else organization_entry.get('standard_two'),
						"element": element.get("element"),
						"element_name": element.get("element_name"),
						"department": element_doc.get("department"),
						"digital_transformation_officer": element_doc.get("digital_transformation_officer"),
						"evaluation": element.get("evaluation"),
						"recommendations": element.get("recommendations"),
						"status": element.get("status"),
					}

				# Initialize Organization Entry Records name
				organization_entry_name = f"{organization_entry.get('organization')}.{organization_entry.get('year')}"
				# Continue initialize Organization Entry Records name
				organization_entry_name += f".{organization_entry.get('standard')}" if child == "elements" else f".{organization_entry.get('standard_two')}"

				# If Organization Entry Records already exists, update it
				if doc_name := frappe.db.exists("Organization Entry Records", f"{organization_entry_name}.{element.get('element')}"):
					doc = frappe.get_doc("Organization Entry Records", doc_name)
					doc.update(update_fields)
					doc = doc.save(ignore_permissions=True)
				# If Organization Entry Records doesn't exist, create it
				else:
					doc = frappe.new_doc("Organization Entry Records")
					doc.update(update_fields)
					doc = doc.save(ignore_permissions=True)
