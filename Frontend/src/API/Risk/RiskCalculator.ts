import { ref, Ref } from "vue";
import RiskLevel from "@/API/RiskLevel/RiskLevel";
import SystemSetting from "@/API/SystemSetting/SystemSetting";

interface FormulaCalculation {
  calc: (base: number, impact?: number, likelihood?: number) => number;
  max: number | ((impactLen: number, likelihoodLen: number) => number);
}

interface RiskResult {
  risk: any;
  maxRisk?: any;
  impactValue: any;
  likelihoodValue: any;
  level: any;
  residual?: number;
}

interface RiskLevelData {
  from: number;
  color: string;
  [key: string]: any;
}

export class RiskCalculator {
  public systemSettingsApi: SystemSetting;
  private apiRiskLevel: RiskLevel;
  private impactList: Ref<string[]>;
  private likelihoodList: Ref<string[]>;
  private riskLevels: Ref<RiskLevelData[]>;
  private defaultFormula: Ref<string>;
  private readonly formulaCalculations: Record<string, FormulaCalculation>;
  private readonly defaultFormulaKey = "Likelihood x Impact";

  constructor() {
    this.systemSettingsApi = new SystemSetting();
    this.apiRiskLevel = new RiskLevel();
    this.impactList = ref([]);
    this.likelihoodList = ref([]);
    this.riskLevels = ref([]);
    this.defaultFormula = ref(this.defaultFormulaKey);

    this.formulaCalculations = {
      "Likelihood x Impact + 2(Impact)": {
        calc: (base, impact) => base + 2 * (impact || 0),
        max: (impactLen: number, likelihoodLen: number) =>
          impactLen * likelihoodLen + 2 * impactLen,
      },
      "Likelihood x Impact + Impact": {
        calc: (base, impact) => base + (impact || 0),
        max: (impactLen: number, likelihoodLen: number) =>
          impactLen * likelihoodLen + impactLen,
      },
      "Likelihood x Impact": {
        calc: (base) => base,
        max: (impactLen: number, likelihoodLen: number) =>
          impactLen * likelihoodLen,
      },
      "Likelihood x Impact + Likelihood": {
        calc: (base, _, likelihood) => base + (likelihood || 0),
        max: (impactLen: number, likelihoodLen: number) =>
          impactLen * likelihoodLen + likelihoodLen,
      },
      "Likelihood x Impact + 2(Likelihood)": {
        calc: (base, _, likelihood) => base + 2 * (likelihood || 0),
        max: (impactLen: number, likelihoodLen: number) =>
          impactLen * likelihoodLen + 2 * likelihoodLen,
      },
    };
  }

  /** Fetch all needed data from API */
  async initialize(): Promise<any> {
    const types = "impacts,likelihoods,risk_calculation_formula";

    const [settingsResponse, riskLevelResponse] = await Promise.all([
      this.systemSettingsApi.getAll({
        filterIn: `type|${types}`,
      }),
      this.apiRiskLevel.getAll({ sort: "from|asc" }),
    ]);

    // Define interface for settings items
    interface SettingItem {
      type: string;
      data?: any;
    }

    // Find each type in the response with proper typing
    const impactSetting = settingsResponse?.find(
      (item: SettingItem) => item.type === "impacts"
    );
    const likelihoodSetting = settingsResponse?.find(
      (item: SettingItem) => item.type === "likelihoods"
    );
    const formulaSetting = settingsResponse?.find(
      (item: SettingItem) => item.type === "risk_calculation_formula"
    );

    // FIX: Assign the data array, not the entire object
    if (impactSetting?.data) this.impactList.value = impactSetting.data;
    if (likelihoodSetting?.data)
      this.likelihoodList.value = likelihoodSetting.data;
    if (formulaSetting) this.defaultFormula.value = formulaSetting.data;
    if (riskLevelResponse?.length > 0)
      this.riskLevels.value = riskLevelResponse;

    console.log("RiskCalculator initialized with data:", {
      impacts: this.impactList.value,
      likelihoods: this.likelihoodList.value,
      formula: this.defaultFormula.value,
      riskLevels: this.riskLevels.value,
    });

    return {
      impacts: this.impactList.value,
      likelihoods: this.likelihoodList.value,
      formula: this.defaultFormula.value,
      riskLevels: this.riskLevels.value,
    };
  }

  /** Get selected formula object */
  private getSelectedFormula(): FormulaCalculation {
    if (this.defaultFormula.value in this.formulaCalculations) {
      return this.formulaCalculations[this.defaultFormula.value];
    }
    console.warn(
      `Invalid formula key "${this.defaultFormula.value}". Using default formula "${this.defaultFormulaKey}"`
    );
    return this.formulaCalculations[this.defaultFormulaKey];
  }

  /** Get risk color based on value */
  getRiskColor(value: number): any {
    const riskLevelList = this.riskLevels.value;
    if (!riskLevelList?.length) return undefined;

    for (let i = 0; i < riskLevelList.length; i++) {
      if (
        value >= riskLevelList[i].from &&
        i < riskLevelList.length - 1 &&
        value < riskLevelList[i + 1].from
      ) {
        return { color: riskLevelList[i].color, name: riskLevelList[i].name };
      }
      if (
        value >= riskLevelList[riskLevelList.length - 1].from &&
        i === riskLevelList.length - 1
      ) {
        return {
          color: riskLevelList[riskLevelList.length - 1].color,
          name: riskLevelList[riskLevelList.length - 1].name,
        };
      }
    }
    return undefined;
  }

  /** Calculate inherent risk using provided formula options */
  calculateInherentRisk(
    currentImpact: number | null = null,
    currentLikelihood: number | null = null,
    impactOptions: any[] = [],
    likelihoodOptions: any[] = [],
    riskFormulaOptions: any[] = []
  ): RiskResult {
    const impactValue = currentImpact ?? 0;
    console.log("impactValue:", impactValue);

    const likelihoodValue = currentLikelihood ?? 0;
    console.log("likelihoodValue:", likelihoodValue);

    const impactLen = impactOptions[0].data?.length || 0;
    console.log("impactLen:", impactOptions);

    const likelihoodLen = likelihoodOptions[0].data?.length || 0;
    console.log("likelihoodLen:", likelihoodLen);

    const baseRisk = likelihoodValue * impactValue;
    console.log("baseRisk:", baseRisk);

    // Map string formula to actual function
    const formulaString =
      riskFormulaOptions[0]?.data || this.defaultFormula.value;
    console.log("selectedFormula string:", formulaString);

    const selectedFormula =
      this.formulaCalculations[formulaString] || this.getSelectedFormula();
    console.log("selectedFormula object:", selectedFormula);

    let dynamicMax = 1;
    if (typeof selectedFormula.max === "function") {
      dynamicMax = selectedFormula.max(impactLen, likelihoodLen);
    } else {
      dynamicMax = selectedFormula.max;
    }
    console.log("dynamicMax:", dynamicMax);

    const finalRisk = selectedFormula.calc(
      baseRisk,
      impactValue,
      likelihoodValue
    );
    console.log("finalRisk:", finalRisk);

    const finalResult = (
      finalRisk *
      ((impactLen * likelihoodLen) / dynamicMax)
    ).toFixed(1);
    console.log("finalResult (scaled):", finalResult);

    const level = this.getRiskColor(Number(finalResult));
    console.log("risk level:", level);

    return {
      risk: finalResult,
      maxRisk: dynamicMax.toString(),
      impactValue,
      likelihoodValue,
      level,
    };
  }

  /** Calculate inherent risk using class default formula */
  calculateInherentRiskTable(
    currentImpact: number | null = null,
    currentLikelihood: number | null = null
  ): RiskResult {
    // Helper function to extract numeric value from array items
    const getHighestValueFromArray = (arr: any[]): number => {
      if (!Array.isArray(arr) || arr.length === 0) return 0;

      const values = arr.map((item) => {
        // Handle object with value property
        if (item && typeof item === "object" && "value" in item) {
          return Number(item.value) || 0;
        }
        // Handle direct number
        else if (typeof item === "number") {
          return item;
        }
        // Handle string - try to parse as JSON or as number
        else if (typeof item === "string") {
          try {
            const parsed = JSON.parse(item);
            if (parsed && typeof parsed === "object" && "value" in parsed) {
              return Number(parsed.value) || 0;
            }
          } catch {
            // If JSON parse fails, try to parse as number directly
            const num = parseInt(item, 10);
            return isNaN(num) ? 0 : num;
          }
        }
        // Default fallback
        return 0;
      });

      return Math.max(...values);
    };

    // Get the highest value from impactList if currentImpact is null
    const impactValue =
      currentImpact ??
      (Array.isArray(this.impactList.value)
        ? getHighestValueFromArray(this.impactList.value)
        : 0);
    console.log("impactValue:", impactValue);

    // Similarly for likelihood
    const likelihoodValue =
      currentLikelihood ??
      (Array.isArray(this.likelihoodList.value)
        ? getHighestValueFromArray(this.likelihoodList.value)
        : 0);
    console.log("likelihoodValue:", likelihoodValue);

    // FIX: Access the data array length properly
    const impactLen = Array.isArray(this.impactList.value)
      ? this.impactList.value.length
      : 0;
    console.log("impactLen:", impactLen);

    const likelihoodLen = Array.isArray(this.likelihoodList.value)
      ? this.likelihoodList.value.length
      : 0;
    console.log("likelihoodLen:", likelihoodLen);

    const baseRisk = likelihoodValue * impactValue;
    console.log("baseRisk:", baseRisk);

    const selectedFormula = this.getSelectedFormula();
    console.log("selectedFormula object:", selectedFormula);

    let dynamicMax: number;
    if (typeof selectedFormula.max === "function") {
      dynamicMax = selectedFormula.max(impactLen, likelihoodLen);
    } else {
      dynamicMax = selectedFormula.max;
    }
    console.log("dynamicMax:", dynamicMax);

    const finalRisk = selectedFormula.calc(
      baseRisk,
      impactValue,
      likelihoodValue
    );
    console.log("finalRisk:", finalRisk);

    const finalResult = (
      finalRisk *
      ((impactLen * likelihoodLen) / dynamicMax)
    ).toFixed(1);
    console.log("finalResult (scaled):", finalResult);

    const level = this.getRiskColor(Number(finalResult));
    console.log("risk level:", level);

    return {
      risk: finalResult,
      maxRisk: dynamicMax.toString(),
      impactValue,
      likelihoodValue,
      level,
    };
  }

  /** Refresh inherited risk including residual */
  async refreshInhertedRisk(
    rowData: any,
    controlOptions: any[],
    likelihoodOptions: any[],
    impactOptions: any[],
    riskFormulaOptions: any[]
  ): Promise<any> {
    let riskData = this.calculateInherentRisk(
      rowData?.current_impact,
      rowData?.current_likelihood,
      impactOptions,
      likelihoodOptions,
      riskFormulaOptions
    );

    let inherent_risk = 0;
    let residual_risk = 0;

    if (
      rowData?.mitigation_status !== "noMitigation" &&
      rowData?.selected_treatment_decision
    ) {
      const decision = rowData.selected_treatment_decision;
      riskData = this.calculateResidualRisk(
        decision,
        riskData,
        rowData,
        controlOptions
      );
      inherent_risk = riskData?.risk && riskData.risk > 0 ? riskData.risk : 0;
      residual_risk =
        riskData?.residual && riskData.residual > 0 ? riskData.residual : 0;
    } else {
      inherent_risk = riskData?.risk && riskData.risk > 0 ? riskData.risk : 0;
      residual_risk = riskData?.risk && riskData.risk > 0 ? riskData.risk : 0;
    }

    return {
      likelihoodOptions,
      impactOptions,
      riskData,
      inherent_risk,
      residual_risk,
    };
  }

  /** Handles residual risk based on mitigation decision */
  calculateResidualRisk(
    decision: string,
    riskData: RiskResult,
    rowData: any,
    controlOptions: any[]
  ): RiskResult {
    const inherent = parseFloat(String(riskData.risk || 0));
    let residual = inherent;

    if (decision === "mitigating") {
      const manualPct = parseFloat(String(rowData.mitigation_percent || 0));
      const controlPercents = (rowData.mitigation_control_ids || []).map(
        (id: any) => {
          const found = controlOptions.find((c) => c.id === id);
          return found ? found.mitigation_percent || 0 : 0;
        }
      );
      const maxControlPct =
        controlPercents.length > 0 ? Math.max(...controlPercents) : 0;
      const effectivePct = Math.max(manualPct, maxControlPct);
      residual = Number((inherent * (1 - effectivePct / 100)).toFixed(1));
    } else if (decision === "sharing") {
      const coverage = parseFloat(String(rowData?.coverage_percent || 0)) / 100;
      residual = Number((inherent - inherent * coverage).toFixed(1));
    } else if (decision === "avoiding") {
      residual = 0;
    } else if (decision === "accepting") {
      residual = inherent;
    }

    return { ...riskData, residual };
  }

  getImpactName(value: number, fallbackOptions?: any): string {
    if (!value) return "Not Specified";

    // Case 1: If fallbackOptions is an array and the first element has a data array
    if (Array.isArray(fallbackOptions) && fallbackOptions.length > 0) {
      const firstItem = fallbackOptions[0];

      if (firstItem && typeof firstItem === "object" && "data" in firstItem) {
        const dataArray = (firstItem as any).data;
        if (Array.isArray(dataArray)) {
          const foundItem = dataArray.find(
            (item: any) => item?.value === value
          );
          return foundItem?.name ?? "Not Specified";
        }
      }
    }

    // Case 2: If fallbackOptions itself is an object with a data array
    if (
      typeof fallbackOptions === "object" &&
      !Array.isArray(fallbackOptions) &&
      "data" in fallbackOptions
    ) {
      const dataArray = (fallbackOptions as any).data;
      if (Array.isArray(dataArray)) {
        const foundItem = dataArray.find((item: any) => item?.value === value);
        return foundItem?.name ?? "Not Specified";
      }
    }

    return "Not Specified";
  }

  getLikelihoodName(value: number, fallbackOptions?: any): string {
    if (!value) return "Not Specified";

    // Case 1: If fallbackOptions is an array and the first element has a data array
    if (Array.isArray(fallbackOptions) && fallbackOptions.length > 0) {
      const firstItem = fallbackOptions[0];

      if (firstItem && typeof firstItem === "object" && "data" in firstItem) {
        const dataArray = (firstItem as any).data;
        if (Array.isArray(dataArray)) {
          const foundItem = dataArray.find(
            (item: any) => item?.value === value
          );
          return foundItem?.name ?? "Not Specified";
        }
      }
    }

    // Case 2: If fallbackOptions itself is an object with a data array
    if (
      typeof fallbackOptions === "object" &&
      !Array.isArray(fallbackOptions) &&
      "data" in fallbackOptions
    ) {
      const dataArray = (fallbackOptions as any).data;
      if (Array.isArray(dataArray)) {
        const foundItem = dataArray.find((item: any) => item?.value === value);
        return foundItem?.name ?? "Not Specified";
      }
    }

    return "Not Specified";
  }
}
