frappe.pages['performance-indicator'].on_page_load = function(wrapper) {


	//   // //
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Dashboard',
		single_column: true
	});
	frappe.breadcrumbs.add("Setup");

	$("<div class='row performance-indicator' id='performance-indicator'></div>").appendTo(
		page.main
	);

	wrapper.performance_indicator = new PerfomanceIndicator(wrapper);

	page.body.addClass("no-border")

}

class PerfomanceIndicator {
	constructor(wrapper) {
		this.wrapper = wrapper;
		this.page = wrapper.page;
		this.body = $(this.wrapper).find(".performance-indicator");
		this.make();
	}

	make() {
		// this.make_organization_dialog();
		this.setup_page();
		this.render_cards()
	}

	render_cards() {
		$(`
		<div class="widget-group evaluation mx-3">
		<div class="widget-group-head">
			<div class="widget-title">حالة المعيار</div>
			<div class="widget-group-control"></div>
		</div>
		<div class="widget-group-body ">
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Declaration Submitted">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">التزام كلى</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">eval1</div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Salary Structure">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">لاينطبق</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined"></div>
						<div class="card-stats green-stat">
							<!-- <span class="percentage-stat-area">
								<span class="indicator-pill-round green">
									<svg class="icon  icon-xs" style="">
										<use class="" href="#icon-arrow-up-right"></use>
									</svg>
								</span>
								<span class="percentage-stat">
									20 %
								</span>
							</span>
							<span class="stat-period text-muted">
								since last month
							</span> -->
						</div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Incentive Given(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">عدم الالتزام</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Outgoing Salary(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">التزام جزئى</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Outgoing Salary(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">عدد المعايير</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
		</div>
	</div>
	<div class="widget-group prep mx-3">
		<div class="widget-group-head">
			<div class="widget-title">مرحلة الاعداد وتحليل المخرجات</div>
			<div class="widget-group-control"></div>
		</div>
		<div class="widget-group-body ">
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Declaration Submitted">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">التزام كلى</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">eval1</div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Salary Structure">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">لاينطبق</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined"></div>
						<div class="card-stats green-stat">
							<!-- <span class="percentage-stat-area">
								<span class="indicator-pill-round green">
									<svg class="icon  icon-xs" style="">
										<use class="" href="#icon-arrow-up-right"></use>
									</svg>
								</span>
								<span class="percentage-stat">
									20 %
								</span>
							</span>
							<span class="stat-period text-muted">
								since last month
							</span> -->
						</div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Incentive Given(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">عدم الالتزام</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Outgoing Salary(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">التزام جزئى</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Outgoing Salary(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">عدد المعايير</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
		</div>
	</div>
	<div class="widget-group comp mx-3">
		<div class="widget-group-head">
			<div class="widget-title">مرحلة المستندات او الوثائق</div>
			<div class="widget-group-control"></div>
		</div>
		<div class="widget-group-body ">
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Declaration Submitted">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">التزام كلى</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">eval1</div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Salary Structure">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">لاينطبق</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined"></div>
						<div class="card-stats green-stat">
							<!-- <span class="percentage-stat-area">
								<span class="indicator-pill-round green">
									<svg class="icon  icon-xs" style="">
										<use class="" href="#icon-arrow-up-right"></use>
									</svg>
								</span>
								<span class="percentage-stat">
									20 %
								</span>
							</span>
							<span class="stat-period text-muted">
								since last month
							</span> -->
						</div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Incentive Given(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">عدم الالتزام</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Outgoing Salary(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">التزام جزئى</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box"
				data-widget-name="Total Outgoing Salary(Last month)">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">عدد المعايير</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">ر.س 0.00 </div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
		</div>
	</div>
	<div class="widget-group mx-3">
		<div class="widget-group-head">
			<div class="widget-title">مرحلة اكتمال المستندات</div>
			<div class="widget-group-control"></div>
		</div>
		<div class="widget-group-body ">
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Declaration Submitted">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">التزام كلى</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined">eval1</div>
					</div>
				</div>
				<div class="widget-footer">
				</div>
			</div>
			<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Salary Structure">
				<div class="widget-head">
					<div class="widget-label">
						<div class="widget-title">
							<div class="number-label">لاينطبق</div>
						</div>
						<div class="widget-subtitle"></div>
					</div>
	
				</div>
				<div class="widget-body">
					<div class="widget-content">
						<div class="number" style="color:undefined"></div>
					</div>
				</div>
			</div>
			<div class="widget-footer">
			</div>
		</div>
		<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Incentive Given(Last month)">
			<div class="widget-head">
				<div class="widget-label">
					<div class="widget-title">
						<div class="number-label">عدم الالتزام</div>
					</div>
					<div class="widget-subtitle"></div>
				</div>
			</div>
			<div class="widget-body">
				<div class="widget-content">
					<div class="number" style="color:undefined">ر.س 0.00 </div>
				</div>
			</div>
			<div class="widget-footer">
			</div>
		</div>
		<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Outgoing Salary(Last month)">
			<div class="widget-head">
				<div class="widget-label">
					<div class="widget-title">
						<div class="number-label">التزام جزئى</div>
					</div>
					<div class="widget-subtitle"></div>
				</div>
			</div>
			<div class="widget-body">
				<div class="widget-content">
					<div class="number" style="color:undefined">ر.س 0.00 </div>
				</div>
			</div>
			<div class="widget-footer">
			</div>
		</div>
		<div class="widget         widget-shadow    number-widget-box" data-widget-name="Total Outgoing Salary(Last month)">
			<div class="widget-head">
				<div class="widget-label">
					<div class="widget-title">
						<div class="number-label">عدد المعايير</div>
					</div>
					<div class="widget-subtitle"></div>
				</div>
			</div>
			<div class="widget-body">
				<div class="widget-content">
					<div class="number" style="color:undefined">ر.س 0.00 </div>
				</div>
			</div>
			<div class="widget-footer">
			</div>
		</div>
	</div>
	
		`).appendTo(this.body);
		// this.make_chart()
		this.add_styles()
	}

	// make_chart() {
	// 	// $(`<script src="test.js"></script>`).appendTo(this.wrapper);
	// 	const data = {
	// 		datasets: [
	// 		  {
	// 			name: "Some Data",
	// 			values: [],
	// 		  },
	// 		],
	// 	  };
		  
	// 	  // Realtime Chart initialization
	// 	  let chart = new frappe.ui.RealtimeChart("#chart", "test_event", 8, {
	// 		title: "My Realtime Chart",
	// 		data: data,
	// 		type: "line",
	// 		height: 250,
	// 		colors: ["#7cd6fd", "#743ee2"]
	// 	  });
	// 	// this.script = `
	// 	// const xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
	// 	// const yValues = [55, 49, 44, 24, 15];
	// 	// const barColors = ["red", "green","blue","orange","brown"];

	// 	// new Chart("mychart", {
	// 	// type: "bar",
	// 	// data: {
	// 	// 	labels: xValues,
	// 	// 	datasets: [{
	// 	// 	backgroundColor: barColors,
	// 	// 	data: yValues
	// 	// 	}]
	// 	// },
	// 	// options: {
	// 	// 	legend: {display: false},
	// 	// 	title: {
	// 	// 	display: true,
	// 	// 	text: "World Wine Production 2018"
	// 	// 	}
	// 	// }
	// 	// });
	// 	// `
	// 	// $(`<script type="text/javascript">${this.script}</script>`).appendTo(this.body);
	// 	// let page_chart = $.getScript("https://cdn.jsdelivr.net/npm/frappe-charts@1.1.0/dist/frappe-charts.min.iife.js",function() {

	// 	// 	console.log("hi from page_chart")
			
	// 	// 	// import { Chart } from "frappe-charts"
	// 	// 	const data = {
	// 	// 		labels: ["12am-3am", "3am-6pm", "6am-9am", "9am-12am",
	// 	// 			"12pm-3pm", "3pm-6pm", "6pm-9pm", "9am-12am"
	// 	// 		],
	// 	// 		datasets: [
	// 	// 			{
	// 	// 				name: "Some Data", type: "bar",
	// 	// 				values: [25, 40, 30, 35, 8, 52, 17, -4]
	// 	// 			},
	// 	// 			{
	// 	// 				name: "Another Set", type: "line",
	// 	// 				values: [25, 50, -10, 15, 18, 32, 27, 14]
	// 	// 			}
	// 	// 		]
	// 	// 	}
			
	// 	// 	const chart = new frappe.Chart("#mychart", {  // or a DOM element,
	// 	// 												// new Chart() in case of ES6 module with above usage
	// 	// 		title: "My Awesome Chart",
	// 	// 		data: data,
	// 	// 		type: 'axis-mixed', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
	// 	// 		height: 250,
	// 	// 		colors: ['#7cd6fd', '#743ee2']
	// 	// 	})
	// 	// })
	// 	// page_chart()

	// }
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
				frappe.set_route("performance-indicator", this.get_evaluation());
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
		// frappe.call({
		// 	module: "qyass.qyass",
		// 	page: "performance_indicator",
		// 	method: "get_elements",
		// 	args: {"organization": this.organization, "evaluation": evaluation, "department": department, "digital_transformation_officer": digital_transformation_officer, "standard": standard},
		// }).then(
		// 	(r) => {
		// 		this.elements = r.message.elements;
		// 		this.render(r.message.elements);
		// 	}
		// );
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
						<div target="_blank" rel="noopener noreferrer" class="frappe-card performance-indicator-card">
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
			.performance-indicator {
				font-size: var(--text-base);
			}
			.widget{
				// color : white !important;
				width:150px !important;
				background-color:red !important;
				margin:5px !important;
			}
			.widget-title {
				color: #4cb1bb !important;
			}
			.widget .widget-title {
				color: #70e1c2 !important;
			}
			.widget-group-body {
				border-radius: 10px !important;
				padding: 10px !important;
				background-color:#4cb1bb  !important;
				border:1px solid black !imortant;
				display:flex !important;
				flex-directoin:row !important;
			}
			
			.performance-indicator-card {
				display: block;
				text-decoration: none;
				margin-bottom: var(--margin-lg);
			}
			
			.performance-indicator-card:hover {
				box-shadow: var(--shadow-md);
				text-decoration: none;
			}
		`;
		$(`<style>${this.style}</style>`).appendTo(this.wrapper);
	}
}

// // //
// const xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
// const yValues = [55, 49, 44, 24, 15];
// const barColors = ["red", "green","blue","orange","brown"];

// new Chart("performance-indicator", {
//   type: "bar",
//   data: {
//     labels: xValues,
//     datasets: [{
//       backgroundColor: barColors,
//       data: yValues
//     }]
//   },
//   options: {
//     legend: {display: false},
//     title: {
//       display: true,
//       text: "World Wine Production 2018"
//     }
//   }
// });
