frappe.pages['elements-page'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Elements Page'),
		single_column: true
	});

	frappe.prompt(
		{
			label: __('Organization Entry'),
			fieldname: 'organization',
			fieldtype: 'Link',
			options: 'Organization Entry',
		},
		(values) => {
		frappe.breadcrumbs.add("Setup");

		$(frappe.render_template("elements_page", values)).appendTo(page.body.addClass("no-border"));
	}, __("Enter Organization"), __("Submit _"));

}
