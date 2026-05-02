import frappe
from frappe.core.doctype.communication.email import make
from frappe.utils.file_manager import save_file

def send_report_to_committee_members():
    # 1. Define the role name
    role_name = "Committee Member"

    # 2. Get the list of users with the specified role
    users_with_role = frappe.db.sql("""
        SELECT DISTINCT parent 
        FROM `tabHas Role` 
        WHERE role = %s AND parenttype = 'User' AND parent != 'Administrator'
    """, (role_name,), as_dict=True)

    # Extract email addresses of the users with the specified role
    recipients = [user['parent'] for user in users_with_role if frappe.db.get_value('User', user['parent'], 'enabled') == 1]

    if not recipients:
        frappe.log_error(f"No users found with the role: {role_name}", "Send Report to Committee Members")
        return

    # 3. Define the report you want to generate
    report_name = "Late Elements 2024"  # Replace with your actual report name

    # 4. Generate the report data
    report = frappe.get_doc("Report", report_name)
    report_data = report.get_data(limit=None)  # Get the full report data

    # 5. Format the report data as CSV (or any format you prefer)
    csv_data = frappe.render_template("templates/includes/report_template.csv", {
        "data": report_data["result"]
    })

    # 6. Save the report as a CSV file
    file_doc = save_file(
        f"{report_name}.csv",
        csv_data.encode("utf-8"),
        None,
        None,
        is_private=1
    )

    # 7. Define the email content
    subject = f"Scheduled Report - {report_name}"
    message = "Please find the attached report."

    # 8. Send the email with the report as an attachment to the filtered users
    make(
        recipients=recipients,
        subject=subject,
        content=message,
        attachments=[{
            "file_url": file_doc.file_url
        }],
        communication_medium="Email"
    )

    frappe.db.commit()  # Commit to ensure email is sent
