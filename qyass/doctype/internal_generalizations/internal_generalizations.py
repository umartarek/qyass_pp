# Copyright (c) 2024, IT Systematic and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class InternalGeneralizations(Document):
	
	@frappe.whitelist()
	def send_generalization_email(self):
		doc = frappe.get_doc("Internal Generalizations", self.name)
		recipients = doc.generalization_recipient
		recip_list = []
		if recipients:
			for i in recipients:
				email = frappe.db.get_value("Employee",i.employee,'email')
				if email:
					recip_list.append(email)
		if recip_list:
			send_mail(doc,recip_list,doc.generalization_content,doc.generalization_subject)
			return "Sent Successfully"
		else :
			return "No Email Recipients"

def send_mail(doc, recipients, msg, title, attachments=None):
    email_args= {
        'recipients':recipients,
        'message':msg,
        'subject':title,
        'reference_doctype':doc.doctype,
        'reference_name':doc.name,
    }
    if attachments:email_args['attachments']=attachments
    frappe.enqueue(method=frappe.sendmail,queue='short',timeout=300,now=True,**email_args)