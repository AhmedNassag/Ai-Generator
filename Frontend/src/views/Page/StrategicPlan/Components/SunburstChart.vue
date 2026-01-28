<template>
  <div class="chart-container">
    <!-- Color Legend Section -->
    <div class="color-legend">
      <h3>{{ $t("strategicplan.Color Map") }}</h3>
      <div class="legend-items">
        <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
          <div class="color-box" :style="{ backgroundColor: item.color }"></div>
          <span class="legend-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
    
    <!-- Chart Container -->
    <div id="sunburst-chart" class="container"></div>
  </div>
</template>

<script>
import FusionCharts from "fusioncharts";
import Charts from "fusioncharts/fusioncharts.charts";
import PowerCharts from "fusioncharts/fusioncharts.powercharts";
import FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";

// Register FusionCharts modules
Charts(FusionCharts);
PowerCharts(FusionCharts);
FusionTheme(FusionCharts);

// license key here
// FusionCharts.options.license({
//   key: 'YOUR_LICENSE_KEY_HERE',
//   creditLabel: false
// })

export default {
  name: "SunburstChart",
  props: {
    strategicPlanDetails: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  data() {
    return {
      chartInstance: null,
    };
  },
  
  computed: {
    legendItems() {
      return [
        { color: "#3498db", label: this.$t("strategicplan.strategicplan") },
        { color: "#27ae60", label: this.$t("strategicplan.objectives") },
        { color: "#e74c3c", label: this.$t("strategicplan.initiatives") },
        { color: "#9b59b6", label: this.$t("strategicplan.programs") },
        { color: "#f39c12", label: this.$t("strategicplan.projects") },
      ];
    }
  },

  mounted() {
    this.renderChart();
  },

  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  },

  methods: {
    renderChart() {
      // Generate the dynamic data structure
      const chartData = this.generateSunburstData();

      const chartConfig = {
        type: "sunburst",
        renderAt: "sunburst-chart",
        width: "100%",
        height: "125%",
        dataFormat: "json",
        ringWidth: "50",
        dataSource: {
          chart: {
            caption: this.strategicPlanDetails?.name || "Strategic Plan",
            // subcaption: this.getTruncatedDescription(),
            captionFontSize: "24",
            captionFontColor: "#2c3e50",
            captionFontBold: "1",
            captionFont: "Verdana",
            subCaptionFontSize: "16",
            subCaptionFontColor: "#7f8c8d",
            subCaptionFont: "Verdana",
            showplotborder: "1",
            theme: "fusion",
            use3dlighting: "0",
            showtooltip: "1",
            plotfillalpha: "90",
            plotbordercolor: "#ffffff",
            plotborderthickness: "4",
            baseFontColor: "#000000",
            baseFontSize: "16",
            baseFont: "Verdana Bold",
            baseFontBold: "1",
            toolTipBgColor: "#2c3e50",
            toolTipColor: "#ffffff",
            toolTipBorderRadius: "6",
            toolTipFontSize: "14",
            toolTipFont: "Verdana",
            animation: "1",
            animationDuration: "1.5",
            labelFontSize: "16",
            labelFont: "Verdana",
            labelFontBold: "1",
            labelFontColor: "#000000",
            showLabels: "1",
            enableSmartLabels: "1",
            labelDistance: "0",
            centerLabelFontSize: "18",
            centerLabelFont: "Verdana",
            centerLabelFontBold: "100",
            centerLabelFontColor: "#ffffff",
            showCenterLabel: "1",
            textOutline: "1",
            textOutlineColor: "#ffffff",
            textOutlineThickness: "1",
          },
          data: chartData,
        },
      };

      try {
        this.chartInstance = new FusionCharts(chartConfig);
        this.chartInstance.render();
      } catch (error) {
        console.error("Error rendering chart:", error);
      }
    },
    /**/
    generateSunburstData() {
      const data = [];

      // Level 0: Strategic Plan
      data.push({
        id: "0.0",
        parent: "",
        label: this.strategicPlanDetails?.code.toString() || "Strategic Plan",
        tooltext: this.strategicPlanDetails?.name || "Strategic Plan",
        fontColor: "#ffffff",
        fontSize: "18",
        fontBold: "1",
        color: "#3498db",
      });

      // Level 1: Objectives
      this.strategicPlanDetails?.objectives?.forEach((objective, objIndex) => {
        data.push({
          id: `1.${objIndex}`,
          parent: "0.0",
          label: objective?.code.toString() || `Objective ${objIndex + 1}`,
          tooltext: objective?.name || `Objective ${objIndex + 1}`,
          value: 1,
          color: this.getColor(objIndex, 1),
          fontColor: "#ffffff",
          fontSize: "16",
          fontBold: "1",
        });

        // Level 2: Initiatives
        objective.initiatives?.forEach((initiative, initIndex) => {
          data.push({
            id: `2.${objIndex}.${initIndex}`,
            parent: `1.${objIndex}`,
            label: initiative?.code.toString() || `Initiative ${initIndex + 1}`,
            tooltext: initiative?.name || `Initiative ${initIndex + 1}`,
            value: 1,
            color: this.getColor(initIndex, 2),
            fontColor: "#ffffff",
            fontSize: "14",
            fontBold: "1",
          });

          // NEW Level 3: Direct Projects (under Initiative)
          initiative.projects?.forEach((project, projIndex) => {
            data.push({
              id: `3.${objIndex}.${initIndex}.d${projIndex}`,
              parent: `2.${objIndex}.${initIndex}`,
              label: project?.code.toString() || `Project ${projIndex + 1}`,
              tooltext: project?.name || `Project ${projIndex + 1}`,
              value: 1,
              color: this.getColor(projIndex, 3),
              fontColor: "#000000",
              fontSize: "12",
              fontBold: "1",
            });
          });

          // Level 4: Programs (under Initiative)
          initiative.programs?.forEach((program, progIndex) => {
            data.push({
              id: `3.${objIndex}.${initIndex}.p${progIndex}`,
              parent: `2.${objIndex}.${initIndex}`,
              label: program?.code.toString() || `Program ${progIndex + 1}`,
              tooltext: program?.name || `Program ${progIndex + 1}`,
              value: 1,
              color: this.getColor(progIndex, 4),
              fontColor: "#000000",
              fontSize: "12",
              fontBold: "1",
            });

            // Level 5: Projects (under Program)
            program.projects?.forEach((project, projIndex) => {
              data.push({
                id: `4.${objIndex}.${initIndex}.p${progIndex}.${projIndex}`,
                parent: `3.${objIndex}.${initIndex}.p${progIndex}`,
                label: project?.code.toString() || `Project ${projIndex + 1}`,
                tooltext: project?.name || `Project ${projIndex + 1}`,
                value: 1,
                color: this.getColor(projIndex, 5),
                fontColor: "#000000",
                fontSize: "12",
                fontBold: "1",
              });
            });
          });
        });
      });

      return data;
    },

    getColor(index, level) {
      const colorSchemes = [
        ["#1f618d" /*, "#2980b9", "#1f618d"*/], // Strategic Plan (blues)
        ["#27ae60" /*, "#27ae60", "#219653"*/], // Objectives (greens)
        ["#e74c3c" /*, "#c0392b", "#a93226"*/], // Initiatives (reds)
        ["#f39c12" /*, "#d35400", "#b9770e"*/], // Direct Projects (oranges)
        ["#9b59b6" /*, "#8e44ad", "#7d3c98"*/], // Programs (purples)
        ["#f39c12" /*, "#16a085", "#138d75"*/], // Program Projects (teals)
      ];

      return colorSchemes[level][index % colorSchemes[level].length];
    },
    /**/
    updateChartData(newData) {
      if (this.chartInstance) {
        this.chartInstance.setJSONData(newData);
      }
    },

    getTruncatedDescription() {
      const description = this.strategicPlanDetails?.description || "";
      return this.stripHtml(this.truncateText(description));
    },

    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    truncateText(text) {
      if (!text) {
        return ""; // Return an empty string if the text is null or undefined
      }
      // If text length is 50 or more, truncate and add "..."
      if (text.length >= 50) {
        return text.substring(0, 50) + "...";
      }
      // If text length is less than 50, return it as is
      return text;
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  background: #ffffff;
  min-height: 50vh;
}
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
}
.sunburst-chart-container {
  padding: 20px;
  background-color: #fff;
}

.sunburst-chart-container h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
}

/* */
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
}

.color-legend {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.color-legend h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.legend-label {
  font-size: 14px;
  color: #34495e;
}

/* Keep your existing container styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  background: #ffffff;
  min-height: 50vh;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 10px;
  }
}
/* */
</style>
