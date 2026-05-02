# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import json
import frappe
from frappe.model.document import Document


class ProjectMeeting2024(Document):

    @frappe.whitelist()
    def send_summary(self):
        if self.participate:
            participates_emails = []
            for item in self.participate:
                participates_emails.append(
                    frappe.db.get_value(item.participate_type, item.participate, ["email", "user_id"])
                )

            # names = (item.participate for item in self.participate)
            # participates_emails = frappe.db.get_list("Stakholder",
            #                                         filters={"name": ["IN", tuple(names)]}, fields=["email"])

            # Print Format
            html = frappe.get_print(self.doctype, self.name,)
            pdf_file = frappe.utils.pdf.get_pdf(html)
            standard_print_fromat = frappe.get_all("Print Format", {"doc_type": self.doctype, "standard": "Yes"})
            standard_print_fromat = standard_print_fromat[0].get("name") if len(standard_print_fromat) > 0 else None

            # Handle Emails
            emails_list = []
            for item in participates_emails:
                try:
                    if len(item) > 0:
                        if item[0]:
                            emails_list.append(item[0])
                        else:
                            if item[1]:
                                emails_list.append(item[1])
                except Exception as e:
                    print(e)

            email_kwargs = {
                "recipients": emails_list,
                "subject": f"Meeting Summary for {self.get('name')}",
                "message": str(self.get("meeting_summary")),
                "reference_doctype": self.doctype,
                "reference_name": self.name,
                "attachments": [{"print_format": standard_print_fromat, "html":"", "print_format_attachment": 1, "doctype": self.doctype, "name": self.name}] if standard_print_fromat else None,
                "doctype": self.doctype,
                "name": self.name,
            }
            # Send Email
            frappe.enqueue(
                method=frappe.sendmail, queue="short", timeout=300, now=True,
                **email_kwargs,
            )


@frappe.whitelist()
def set_multiple_status(names, status):
	names = json.loads(names)
	for name in names:
		task = frappe.get_doc("Project Meeting 2024", name)
		task.status = status
		task.save()

