frappe.pages['my_chart_page'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'My Chart Page',
        single_column: true
    });

    // Create a container for the chart
    $(wrapper).find('.layout-main-section').append('<canvas id="myChart" width="500" height="300"></canvas>');

    // JavaScript to render the chart
    const canvas = document.getElementById("myChart");
    const ctx = canvas.getContext("2d");

    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        values: [10, 20, 30, 40, 50]
    };

    const barWidth = 40;
    const barSpacing = 20;
    const maxValue = Math.max(...data.values);
    const scale = canvas.height / maxValue;

    data.values.forEach((value, index) => {
        const barHeight = value * scale;
        const x = barSpacing + index * (barWidth + barSpacing);
        const y = canvas.height - barHeight;

        ctx.fillStyle = "#3498db";
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = "#000";
        ctx.fillText(value, x + barWidth / 4, y - 5);
    });
};
