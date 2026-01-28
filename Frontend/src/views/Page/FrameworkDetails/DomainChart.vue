<template>
    <div class="dashboard-section glass-card">
        <div class="section-header">
            <div class="header-content">
                <div class="header-icon controls-icon">
                    <i class="fas fa-sitemap"></i>
                </div>
                <div class="header-text">
                    <h2 class="section-title">Domain Status Distribution</h2>
                    <p class="section-subtitle">Control implementation status across all domains</p>
                </div>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-card">
                <highcharts :options="chartOptions" ref="chart"></highcharts>
            </div>
        </div>
    </div>
</template>

<script>
import { Chart as HighchartsVue } from 'highcharts-vue';

export default {
    name: 'DomainChart',
    components: { highcharts: HighchartsVue },
    props: {
        domainData: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            chartOptions: {
                chart: {
                    type: 'column',
                    height: 450,
                    backgroundColor: 'transparent'
                },
                title: { text: null },
                xAxis: {
                    categories: [],
                    title: { text: 'Domains' }
                },
                yAxis: {
                    min: -0.2,
                    title: { text: 'Percentage (%)' }
                },
                series: [],
                credits: { enabled: false }
            }
        };
    },
    watch: {
        domainData: {
            handler(newData) {
                this.prepareChartData(newData);
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        prepareChartData(data) {
            if (!data || Object.keys(data).length === 0) return;

            const labels = Object.keys(data);
            const series = {
                implemented: [],
                notImplemented: [],
                notApplicable: [],
                partiallyImplemented: []
            };

            labels.forEach(label => {
                const statuses = data[label];
                let percentages = { implemented: 0, notImplemented: 0, notApplicable: 0, partiallyImplemented: 0 };

                if (Array.isArray(statuses)) {
                    statuses.forEach(status => {
                        const percentage = parseFloat(status.percentage) || 0;
                        if (status.status_name === "Implemented") percentages.implemented = percentage;
                        else if (status.status_name === "Not Implemented") percentages.notImplemented = percentage;
                        else if (status.status_name === "Not Applicable") percentages.notApplicable = percentage;
                        else if (status.status_name === "Partially Implemented") percentages.partiallyImplemented = percentage;
                    });
                }

                series.implemented.push(percentages.implemented);
                series.notImplemented.push(percentages.notImplemented);
                series.notApplicable.push(percentages.notApplicable);
                series.partiallyImplemented.push(percentages.partiallyImplemented);
            });

            this.chartOptions.xAxis.categories = labels;
            this.chartOptions.series = [
                { name: 'Implemented', color: '#27ae60', data: series.implemented },
                { name: 'Not Implemented', color: '#c0392b', data: series.notImplemented },
                { name: 'Not Applicable', color: '#4b5563', data: series.notApplicable },
                { name: 'Partially Implemented', color: '#d68910', data: series.partiallyImplemented }
            ];
        }
    }
};
</script>
