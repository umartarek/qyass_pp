frappe.pages['elements-page-filter'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Elements Page'),
		single_column: true
	});

	frappe.breadcrumbs.add("Setup");

	$("<div class='row elements-page-filter'></div>").appendTo(
		page.main
	);

	wrapper.elements_page_filter = new ElementsPageFilter(wrapper);

	page.body.addClass("no-border")
}


class ElementsPageFilter {
	constructor(wrapper) {
		this.wrapper = wrapper;
		this.page = wrapper.page;
		this.body = $(this.wrapper).find(".elements-page-filter");
		this.make();
	}

	make() {
		this.make_organization_dialog();
	}

	make_organization_dialog() {
		frappe.prompt(
			{
				label: __('Organization'),
				fieldname: 'organization',
				fieldtype: 'Link',
				options: 'Organization',
			},
			(values) => {
				this.organization = values.organization;
				this.setup_page();
			}, __("Enter Organization"), __("Submit _"));
	}

	setup_page() {
		this.evaluation_select = this.wrapper.page.add_field({
			fieldname: 'evaluation_select',
			label: __('Evaluation'),
			fieldtype: 'Select',
			options: '\nالتزام كلي\nالتزام جزئي\nعدم التزام\nلا ينطبق',
			change: () => {
				frappe.set_route("elements-page-filter", this.get_evaluation());
				this.set_form_route();
			},
		});
		this.department = this.wrapper.page.add_field({
			fieldname: 'department',
			label: __('Department'),
			fieldtype: 'Link',
			options: 'Departments',
			change: () => {
				this.set_form_route();
			},
		});
		this.digital_transformation_officer = this.wrapper.page.add_field({
			fieldname: 'digital_transformation_officer',
			label: __('Digital Transformation Officer'),
			fieldtype: 'Link',
			options: 'Employee',
			change: () => {
				this.set_form_route();
			},
		});
		this.standard = this.wrapper.page.add_field({
			fieldname: 'standard',
			label: __('Standard'),
			fieldtype: 'Link',
			options: 'Standards',
			change: () => {
				this.set_form_route();
			},
			get_query: () => {
				return {
					query: "qyass.qyass.doctype.standard_group.standard_group.get_standard_list",
					filters: {},
				};
			},
		});
		this.set_form_route();
	}

	set_form_route() {
		// if (!this.evaluation_select) {
		// 	setTimeout(() => {
		// 		this.set_form_route();
		// 	}, 500);
		// 	return;
		// }
		// if (frappe.get_route()[1]) {
		// 	this.evaluation_select.set_value(frappe.get_route()[1]);
		// }
		this.refresh();
	}

	get_evaluation() {
		return this.evaluation_select.get_value();
	}

	get_department() {
		return this.department.get_value();
	}

	get_digital_transformation_officer() {
		return this.digital_transformation_officer.get_value();
	}

	get_standard() {
		return this.standard.get_value();
	}

	refresh() {

		let evaluation = this.get_evaluation();
		let department = this.get_department();
		let digital_transformation_officer = this.get_digital_transformation_officer();
		let standard = this.get_standard();

		/* GET Elements From Organization Entry that
		meet filters (Organization, Evaluation) */
		frappe.call({
			module: "qyass.qyass",
			page: "elements_page_filter",
			method: "get_elements",
			args: {"organization": this.organization, "evaluation": evaluation, "department": department, "digital_transformation_officer": digital_transformation_officer, "standard": standard},
		}).then(
			(r) => {
				this.elements = r.message.elements;
				this.render(r.message.elements);
			}
		);
	}

	render(elements) {
		this.body.empty();
		if (!this.elements.length) {
			return;
		}
		this.show_elements_cards(this.elements);
	}

	show_elements_cards(elements) {
		this.color = {'التزام كلي': '#00E676', 'التزام جزئي': '#FFA500', 'عدم التزام': '#FF0000', 'لا ينطبق': '#808080'};
		this.cards = [];
		for (let i=0; i<elements.length; i++) {
			$(`
					<div class="col-lg-3 col-md-4 col-12">
						<div target="_blank" rel="noopener noreferrer" class="frappe-card elements-page-filter-card">
							${this.get_element_link(elements[i])}
							${this.get_element_name(elements[i])}
							<hr/>
							${this.get_evaluation_tag(elements[i])}
							${this.get_recommendations(elements[i])}
						</div>
					</div>
				`).appendTo(this.body)
		}
		this.add_styles();
	}

	get_element_link(element) {
		return frappe.render(`<!-- jinja -->
				<div class="mt-2">
					<a href="/app/standard-group-elements/{{ element }}">{{ element }}</a>
				</div>`,
				{"element": element["element"]}
		);
	}

	get_element_name(element) {
		return frappe.render(`<!-- jinja -->
				<div class="mt-2" style="overflow-wrap: break-word;">
					<div>{{ element_name }}</div>
				</div>`,
				{"element_name": element["element_name"]}
		);
	}

	get_evaluation_tag(element) {
		return frappe.render(`<!-- jinja -->
				<div class="mt-2">
					<svg width="17" height="17">
						<circle cx="8" cy="8" r="7" fill="{{ color }}" />
					</svg>
					{{ evaluation }}
                </div>`,
				{"evaluation": element["evaluation"], "color": this.color[element["evaluation"]]}
		);
	}

	get_recommendations(element) {
		if (!element["recommendations"]) {
			return "<div></div>"
		}
		return frappe.render(`<!-- jinja -->
				<hr/>
                <div class="mt-2" style="overflow-wrap: break-word;">
					{{ recommendations }}
            </div>`,
			{"recommendations": element["recommendations"]}
			);
	}

	add_styles() {
		this.style = `
			.elements-page-filter {
				font-size: var(--text-base);
			}
			
			.elements-page-filter-card {
				display: block;
				text-decoration: none;
				margin-bottom: var(--margin-lg);
			}
			
			.elements-page-filter-card:hover {
				box-shadow: var(--shadow-md);
				text-decoration: none;
			}
		`;
		$(`<style>${this.style}</style>`).appendTo(this.wrapper);
	}
}
