import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import { getTask } from "./ClickUpIntegration.js";
import { generateSchema } from "./LLMIntegaration.js";
// ============================================================================
// FIELD TYPES - Combined with comprehensive validation
// ============================================================================
const FIELD_TYPES = {
  string: {
    formType: "text",
    validation: "required|string|max:255",
    updateValidation: "required|string|max:255",
    tableDisplay: "text",
    testValue: '"Sample text"',
    updateValue: '"Updated sample text"',
    col: 6,
  },
  email: {
    formType: "text",
    validation: "required|email|unique:@@table@@,email",
    updateValidation: "required|email|unique:@@table@@,email,{$id}",
    tableDisplay: "text",
    testValue: '"test@example.com"',
    updateValue: '"updated@example.com"',
    col: 6,
  },
  password: {
    formType: "password",
    validation: "required|min:8",
    updateValidation: "nullable|min:8",
    tableDisplay: "hidden",
    testValue: '"password123"',
    updateValue: '"newpassword123"',
    col: 6,
  },
  phone: {
    formType: "text",
    validation: "required|regex:/^([0-9\\s\\-\\+\\(\\)]*)$/|min:10|max:20",
    updateValidation: "required|regex:/^([0-9\\s\\-\\+\\(\\)]*)$/|min:10|max:20",
    tableDisplay: "text",
    testValue: '"+1234567890"',
    updateValue: '"+9876543210"',
    col: 6,
  },
  url: {
    formType: "text",
    validation: "required|url|max:500",
    updateValidation: "required|url|max:500",
    tableDisplay: "text",
    testValue: '"https://example.com"',
    updateValue: '"https://updated.example.com"',
    col: 6,
  },
  number: {
    formType: "number",
    validation: "required|integer|min:0",
    updateValidation: "required|integer|min:0",
    tableDisplay: "number",
    testValue: "42",
    updateValue: "52",
    col: 6,
  },
  integer: {
    formType: "number",
    validation: "required|integer|min:0",
    updateValidation: "required|integer|min:0",
    tableDisplay: "number",
    testValue: "42",
    updateValue: "52",
    col: 6,
  },
  decimal: {
    formType: "number",
    validation: "required|numeric|min:0",
    updateValidation: "required|numeric|min:0",
    tableDisplay: "number",
    testValue: "99.99",
    updateValue: "109.99",
    col: 6,
  },
  date: {
    formType: "date",
    validation: "required|date",
    updateValidation: "required|date",
    tableDisplay: "date",
    testValue: '"2024-01-01"',
    updateValue: '"2024-12-31"',
    col: 6,
  },
  datetime: {
    formType: "datetime",
    validation: "required|date",
    updateValidation: "required|date",
    tableDisplay: "date",
    testValue: '"2024-01-01 10:30:00"',
    updateValue: '"2024-12-31 15:45:00"',
    col: 6,
  },
  boolean: {
    formType: "checkbox",
    validation: "required|boolean",
    updateValidation: "required|boolean",
    tableDisplay: "boolean",
    testValue: "true",
    updateValue: "false",
    col: 6,
  },
  checkbox: {
    formType: "checkbox",
    validation: "required",
    updateValidation: "required",
    tableDisplay: "boolean",
    testValue: "true",
    updateValue: "false",
    col: 6,
  },
  image: {
    formType: "file",
    validation: "nullable|image|mimes:jpeg,png,jpg,gif|max:2048",
    updateValidation: "nullable|image|mimes:jpeg,png,jpg,gif|max:2048",
    tableDisplay: "image",
    testValue: "null",
    updateValue: "null",
    col: 6,
  },
  file: {
    formType: "file",
    validation: "nullable|file|mimes:pdf,doc,docx|max:5120",
    updateValidation: "nullable|file|mimes:pdf,doc,docx|max:5120",
    tableDisplay: "file",
    testValue: "null",
    updateValue: "null",
    col: 6,
  },
  array: {
    formType: "options",
    validation: "required|array",
    updateValidation: "required|array",
    tableDisplay: "text",
    testValue: "['item1', 'item2']",
    updateValue: "['updated1', 'updated2', 'updated3']",
    col: 6,
    hasOptions: true,
  },
  select: {
    formType: "options",
    validation: "required",
    updateValidation: "required",
    tableDisplay: "text",
    testValue: '"option1"',
    updateValue: '"option2"',
    col: 6,
    hasOptions: true,
  },
  textarea: {
    formType: "textarea",
    validation: "required",
    updateValidation: "required",
    tableDisplay: "text",
    testValue: '"Long text content"',
    updateValue: '"Updated long text content"',
    col: 12,
  },
  json: {
    formType: "textarea",
    validation: "required|json",
    updateValidation: "required|json",
    tableDisplay: "text",
    testValue: '\'{\"key\": \"value\"}\'',
    updateValue: '\'{\"key\": \"updated_value\", \"new_key\": \"new_value\"}\'',
    col: 12,
  },
  text: {
    formType: "textarea",
    validation: "required|string",
    updateValidation: "required|string",
    tableDisplay: "text",
    testValue: '"Long text content"',
    updateValue: '"Updated long text content"',
    col: 12,
  },
};

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================
const RELATIONSHIP_TYPES = {
  belongsTo: {
    description: "Many-to-One (stores foreign key as string)",
    method: "belongsTo",
    inverse: "hasMany",
    supported: true,
  },
  hasOne: {
    description: "One-to-One (referenced or embedded)",
    method: "hasOne",
    inverse: "belongsTo",
    supported: true,
  },
  hasMany: {
    description: "One-to-Many (array of references)",
    method: "hasMany",
    inverse: "belongsTo",
    supported: true,
  },
  belongsToMany: {
    description: "Many-to-Many (array of IDs, no pivot table)",
    method: "belongsToMany",
    inverse: "belongsToMany",
    supported: true,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function displayBanner() {
  console.log(
    "\n╔══════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  🚀 Full Stack Module Generator (Complete Edition)              ║",
  );
  console.log(
    "║     Backend: MongoDB + Jenssegers | Frontend: Vue 3             ║",
  );
  console.log(
    "║     With Relationships, Auto-Models, and Update Support         ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════╝\n",
  );
}

function displayCompletionBanner() {
  console.log(
    "\n╔══════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║   ✅ Full Stack Module Generation Complete!                     ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════╝\n",
  );
}

function validatePath(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0) return "Path cannot be empty.";
  return true;
}

function validateModelName(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0) return "Model name cannot be empty.";
  if (!isNaN(trimmed)) return "Model name cannot be a number.";
  if (/^\d/.test(trimmed)) return "Model name cannot start with a number.";
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(trimmed))
    return "Model name must contain only letters and numbers.";
  return true;
}

function validateFieldName(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0) return "Field name cannot be empty.";
  if (!isNaN(trimmed)) return "Field name cannot be a number.";
  if (/^\d/.test(trimmed)) return "Field name cannot start with a number.";
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmed))
    return "Field name must contain only letters, numbers, and underscores.";
  return true;
}

async function checkBackendAppExists(backendPath) {
  try {
    const stat = await fs.stat(path.join(backendPath, "app"));
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function checkFrontendSrcExists(frontendPath) {
  try {
    const stat = await fs.stat(path.join(frontendPath, "src"));
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function checkBackendModelExists(backendPath, modelName) {
  try {
    await fs.access(
      path.join(backendPath, "app/Models", modelName, `${modelName}.php`),
    );
    return true;
  } catch {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// MODEL MANIPULATION
// ============================================================================

async function getExistingFields(backendPath, modelName) {
  try {
    const modelPath = path.join(
      backendPath,
      "app/Models",
      modelName,
      `${modelName}.php`,
    );
    const content = await fs.readFile(modelPath, "utf8");
    const fillableMatch = content.match(
      /protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];/,
    );

    if (fillableMatch) {
      const fillableContent = fillableMatch[1];
      const fields = fillableContent
        .split(",")
        .map((f) => f.trim().replace(/['"]/g, ""))
        .filter((f) => f.length > 0);
      return fields;
    }
    return [];
  } catch {
    return [];
  }
}

async function addFieldToModel(backendPath, modelName, fieldName) {
  try {
    const modelPath = path.join(
      backendPath,
      "app/Models",
      modelName,
      `${modelName}.php`,
    );
    let content = await fs.readFile(modelPath, "utf8");

    const fillableMatch = content.match(
      /protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];/,
    );
    if (!fillableMatch) return false;

    const fillableContent = fillableMatch[1];
    if (fillableContent.includes(`'${fieldName}'`)) return false;

    // Check if there's already content in fillable array
    const trimmedContent = fillableContent.trim();
    const newField = `'${fieldName}'`;

    let newFillableContent;
    if (trimmedContent.length === 0) {
      // Empty array
      newFillableContent = newField;
    } else {
      // Add comma after existing content
      newFillableContent = trimmedContent + `,\n        ${newField}`;
    }

    content = content.replace(
      /protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];/,
      `protected $fillable = [\n        ${newFillableContent}\n    ];`,
    );

    await fs.writeFile(modelPath, content, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function registerBackendRoute(backendPath, modelName) {
  try {
    const indexPath = path.join(backendPath, "routes/API/index.php");
    if (!(await fileExists(indexPath))) return false;

    let content = await fs.readFile(indexPath, "utf8");
    const routeInclude = `@include('Modules/${modelName}/${modelName}Routes.php');`;

    if (content.includes(routeInclude)) return false;

    const phpTagIndex = content.indexOf("<?php");
    if (phpTagIndex === -1) return false;

    const insertPosition = phpTagIndex + 5;
    const newContent =
      content.substring(0, insertPosition) +
      "\n" +
      routeInclude +
      content.substring(insertPosition);

    await fs.writeFile(indexPath, newContent, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function updateFrontendRouterIndex(frontendPath, name) {
  try {
    const indexPath = path.join(frontendPath, "src/router/index.ts");
    if (!(await fileExists(indexPath))) return false;

    let content = await fs.readFile(indexPath, "utf8");
    const importStatement = `import ${name} from "@/router/modules/${name}/${name}";`;

    if (!content.includes(importStatement)) {
      const importRegex =
        /import\s+\w+\s+from\s+["']@\/router\/modules\/[^"']+["'];/g;
      const imports = content.match(importRegex);

      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;
        content =
          content.slice(0, insertPosition) +
          "\n" +
          importStatement +
          content.slice(insertPosition);
      }
    }

    const routeStatement = `      ...${name},`;
    if (!content.includes(`...${name}`)) {
      const childrenMatch = content.match(/children:\s*\[/);
      if (childrenMatch) {
        const childrenIndex = childrenMatch.index + childrenMatch[0].length;
        content =
          content.slice(0, childrenIndex) +
          "\n" +
          routeStatement +
          content.slice(childrenIndex);
      }
    }

    await fs.writeFile(indexPath, content, "utf8");
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// FIELD GENERATION
// ============================================================================

function generateTableColumns(fields, nameLower) {
  return fields
    .filter((f) => f.showInTable)
    .map((f) => {
      if (f.tableDisplay === "boolean") {
        return `      { id: "${f.name}", title: this.$t("${nameLower}.${f.name}"), data: "${f.name}", defaultContent: "N/A", render: (data) => data ? "✓" : "✗" },`;
      } else if (f.tableDisplay === "date") {
        return `      { id: "${f.name}", title: this.$t("${nameLower}.${f.name}"), data: "${f.name}", defaultContent: "N/A", render: (data) => new Date(data).toLocaleDateString() },`;
      } else {
        return `      { id: "${f.name}", title: this.$t("${nameLower}.${f.name}"), data: "${f.name}", defaultContent: "N/A" },`;
      }
    })
    .join("\n");
}

function formatOptionsArray(options) {
  const optionsStr = options
    .map((opt) => {
      return `          {\n            id: "${opt.id}",\n            name: "${opt.name}"\n          }`;
    })
    .join(",\n");

  return `[\n${optionsStr}\n        ]`;
}

function generateFormFields(fields, nameLower) {
  return fields
    .map((f) => {
      let fieldObj = `      {\n        name: "${f.name}",\n        label: this.$t("${nameLower}.${f.name}"),\n        type: "${f.formType}",\n        col: ${f.col}`;

      // Process rules
      if (f.rules) {
        let rulesArray = f.rules.split('|');
        
        // Check for required
        if (rulesArray.includes('required')) {
          fieldObj += `,\n        rules: "required"`;
        } 
        // Check for nullable (only if not required)
        else if (rulesArray.includes('nullable')) {
          fieldObj += `,\n        rules: "nullable"`;
        }
        // Keep other validation rules as-is
        else if (f.rules.trim() !== '') {
          fieldObj += `,\n        rules: ""`;
        }
        // If rules exist but empty after processing, don't add rules property
      }

      if (f.isDynamic) {
        fieldObj += `,\n        options: "${f.moduleName}",\n        optionLabel: "${f.optionLabel}"`;
        if (f.optionValue) {
          fieldObj += `,\n        optionValue: "${f.optionValue}"`;
        }
      } else if (f.options) {
        const optionsStr = formatOptionsArray(f.options);
        fieldObj += `,\n        options: ${optionsStr},\n        optionLabel: "name"`;
      }

      if (f.type === "select" && f.multiple) {
        fieldObj += `,\n        multiple: true`;
      }

      if (f.description) {
        fieldObj += `,\n        description: "${f.description}"`;
      }

      fieldObj += `\n      }`;
      return fieldObj;
    })
    .join(",\n");
}

function generateTranslations(nameLower, fields) {
  const translations = {
    [nameLower]: {
      [nameLower]: nameLower.charAt(0).toUpperCase() + nameLower.slice(1),
    },
  };

  fields.forEach((f) => {
    const label = f.name
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();

    translations[nameLower][f.name] = label;
  });

  return translations;
}

// ============================================================================
// RELATIONSHIP GENERATION
// ============================================================================

/**
 * Generate create/update methods for belongsToMany relationships in Repository
 */
function generateBelongsToManyRepositoryMethods(relationships, modelName) {
  const belongsToManyRels = relationships.filter(
    (r) => r.type === "belongsToMany" && r.localKey?.addSyncMethods === true,
  );

  if (belongsToManyRels.length === 0) return "";

  const modelVar = modelName.toLowerCase();
  let methods = "\n";

  methods += `    /**
     * Create a new ${modelName} with belongsToMany relationships
     * 
     * @param array|null $data
     * @return ${modelName}
     */
    public function create($data = null)
    {
        \$${modelVar} = parent::create($data);
`;

  belongsToManyRels.forEach((rel) => {
    methods += `        if (isset(\$data['${rel.foreignKey}'])) {
            \$${modelVar}->${rel.methodName}()->attach(\$data['${rel.foreignKey}'] ?? []);
        }
`;
  });

  methods += `        return \$${modelVar};
    }
`;

  methods += `    /**
     * Update ${modelName} with belongsToMany relationships
     * 
     * @param mixed $id
     * @param array|null $data
     * @return ${modelName}
     */
    public function update($id, $data = null)
    {
        \$${modelVar} = parent::update($id, \$data);
`;

  belongsToManyRels.forEach((rel) => {
    methods += `        if (isset(\$data['${rel.foreignKey}'])) {
            \$${modelVar}->${rel.methodName}()->detach();
            \$${modelVar}->${rel.methodName}()->attach(\$data['${rel.foreignKey}']);
        }
`;
  });

  methods += `        return \$${modelVar};
    }`;

  return methods;
}

function generateSingleRelationship(rel) {
  const RELATIONSHIP_TYPES = {
    hasOne: { method: "hasOne", inverse: "belongsTo" },
    hasMany: { method: "hasMany", inverse: "belongsTo" },
    belongsTo: { method: "belongsTo", inverse: "hasMany" },
    belongsToMany: { method: "belongsToMany", inverse: "belongsToMany" },
  };

  const relInfo = RELATIONSHIP_TYPES[rel.type];

  let code = `
    /**
     * ${rel.type} relationship with ${rel.relatedModel}`;

  if (rel.type === "belongsToMany") {
    code += `
     * MongoDB: '${rel.foreignKey}' in THIS model, '${rel.localKey?.inverseField || rel.relatedModel.toLowerCase() + "_ids"}' in ${rel.relatedModel}`;
  }

  code += `
     */
    public function ${rel.methodName}()
    {`;

  if (rel.type === "hasOne" || rel.type === "hasMany") {
    code += `
        return $this->${relInfo.method}(${rel.relatedModel}::class);
    }`;
  } else if (rel.type === "belongsTo") {
    code += `
        return $this->${relInfo.method}(${rel.relatedModel}::class, '${rel.foreignKey}');
    }`;
  } else if (rel.type === "belongsToMany") {
    const relatedModelField =
      rel.localKey?.inverseField || `${rel.relatedModel.toLowerCase()}_ids`;
    code += `
        // MongoDB: '${rel.foreignKey}' in THIS model, '${relatedModelField}' in ${rel.relatedModel}
        return $this->${relInfo.method}(${rel.relatedModel}::class, null, '${relatedModelField}', '${rel.foreignKey}');
    }`;
  } else {
    code += `
        return $this->${relInfo.method}(${rel.relatedModel}::class, '${rel.foreignKey}');
    }`;
  }

  code += `
`;

  return code;
}

function generateUseStatements(relationships) {
  if (!relationships || relationships.length === 0) return "";

  const relatedModels = [...new Set(relationships.map((r) => r.relatedModel))];
  const useStatements = relatedModels
    .map((model) => `use App\\Models\\${model}\\${model};`)
    .join("\n");

  return useStatements ? "\n" + useStatements : "";
}

function generateRelationshipMethods(relationships) {
  if (!relationships || relationships.length === 0) return "";

  let methods = "\n    /**\n     * RELATIONSHIPS\n     */\n";

  relationships.forEach((rel) => {
    methods += generateSingleRelationship(rel);
  });

  return methods;
}

// ============================================================================
// FILE CREATION - FIXED PATHS
// ============================================================================

async function createBackendFile(
  type,
  backendPath,
  templateFile,
  name,
  namekebab,
  nameFillable,
  validations,
  relationships,
) {
  try {
    let newPath;
    if (type === "Model") {
      newPath = path.join(backendPath, "app/Models", name);
    } else if (type === "Repository") {
      newPath = path.join(backendPath, "app/Repositories/Eloquent", name);
    } else if (type === "Service") {
      newPath = path.join(backendPath, "app/Services/Eloquent", name);
    } else if (type === "ControllerTest") {
      newPath = path.join(backendPath, "tests/Unit", name);
    } else if (type === "Routes") {
      newPath = path.join(backendPath, "routes/API/Modules", name);
    } else {
      newPath = path.join(backendPath, "app/Http/Controllers", name);
    }
    await fs.mkdir(newPath, { recursive: true });

    let fileName;
    if (type === "Model") {
      fileName = `${name}.php`;
    } else if (type === "ControllerTest") {
      fileName = `${name}ControllerTest.php`;
    } else if (type === "Routes") {
      fileName = `${name}Routes.php`;
    } else {
      fileName = `${name}${type}.php`;
    }
    const filePath = path.join(newPath, fileName);

    // FIXED: Use backendPath to construct template path
    const templatePath = path.join(backendPath, "generator-setting-backend", templateFile);
    const data = await fs.readFile(templatePath, "utf8");

    // Format fillable array with quotes around each field name
    const fillableFormatted =
      nameFillable && Array.isArray(nameFillable)
        ? nameFillable.map((field) => `'${field}'`).join(", ")
        : "";

    let text = data
      .replaceAll("@@Name@@", name)
      .replaceAll("@@Namekebab@@", namekebab)
      .replaceAll("@@NameFillable@@", fillableFormatted);

    if (type === "Model") {
      const useStatements =
        relationships && relationships.length > 0
          ? generateUseStatements(relationships)
          : "";
      const relationshipMethods =
        relationships && relationships.length > 0
          ? generateRelationshipMethods(relationships)
          : "";
      text = text
        .replaceAll("@@UseStatements@@", useStatements)
        .replaceAll("@@Relationships@@", relationshipMethods);
    }

    if (type === "Repository" && relationships && relationships.length > 0) {
      const belongsToManyMethods = generateBelongsToManyRepositoryMethods(
        relationships,
        name,
      );
      if (belongsToManyMethods) {
        const lastBraceIndex = text.lastIndexOf("}");
        if (lastBraceIndex !== -1) {
          text =
            text.substring(0, lastBraceIndex) +
            belongsToManyMethods +
            "\n" +
            text.substring(lastBraceIndex);
        }
      }
    }

    if (type === "Service" && validations) {
      const storeRules = validations
        .map(
          (v) =>
            `                '${v.name}' => '${v.rule.replace("@@table@@", namekebab + "s")}',`,
        )
        .join("\n");

      const updateRules = validations
        .map(
          (v) =>
            `                '${v.name}' => '${v.updateRule.replace("@@table@@", namekebab + "s")}',`,
        )
        .join("\n");

      text = text
        .replaceAll("@@StoreValidation@@", storeRules)
        .replaceAll("@@UpdateValidation@@", updateRules);
    }

    if (type === "ControllerTest" && validations) {
      const testDataStr = validations
        .map((v) => `            '${v.name}' => ${v.testValue},`)
        .join("\n");
      const updateDataStr = validations
        .map((v) => `            '${v.name}' => ${v.updateValue},`)
        .join("\n");
      const fieldsList = validations.map((v) => `'${v.name}'`).join(", ");

      text = text
        .replaceAll("@@TestData@@", testDataStr)
        .replaceAll("@@UpdateTestData@@", updateDataStr)
        .replaceAll("@@FieldsList@@", fieldsList);
    }

    await fs.writeFile(filePath, text, "utf8");
  } catch (err) {
    console.error(`❌ Error creating ${type}:`, err.message);
    throw err;
  }
}

async function createFrontendFile(
  type,
  frontendPath,
  templateFile,
  name,
  namekebab,
  nameLower,
  fields,
) {
  try {
    let basePath = type === "API" ? "src/API/" : "src/views/Page/";
    if (type === "Router") basePath = "src/router/modules/";

    const newPath = path.join(frontendPath, basePath, name);
    await fs.mkdir(newPath, { recursive: true });

    let ext = type === "Page" ? ".vue" : ".ts";
    const filePath = path.join(newPath, name + ext);

    // FIXED: Use frontendPath to construct template path
    const templatePath = path.join(frontendPath, "generator-setting-frontend", templateFile);
    let template = await fs.readFile(templatePath, "utf8");

    template = template
      .replaceAll("@@Name@@", name)
      .replaceAll("@@Namekebab@@", namekebab)
      .replaceAll("@@name@@", nameLower);

    if (type === "Page") {
      const tableColumns = generateTableColumns(fields, nameLower);
      const formFields = generateFormFields(fields, nameLower);

      template = template
        .replace("@@TableColumns@@", tableColumns)
        .replace("@@FormFields@@", formFields);
    }

    await fs.writeFile(filePath, template, "utf8");
  } catch (err) {
    console.error(`❌ Error creating ${type}:`, err.message);
    throw err;
  }
}

// ============================================================================
// HELPER FUNCTIONS - RELATIONSHIP MANAGEMENT
// ============================================================================

/**
 * Add use statement to model namespace
 */
async function addUseStatementToModel(
  backendPath,
  modelName,
  relatedModelName,
) {
  const modelPath = path.join(
    backendPath,
    "app/Models",
    modelName,
    `${modelName}.php`,
  );

  try {
    let content = await fs.readFile(modelPath, "utf8");

    const useStatement = `use App\\Models\\${relatedModelName}\\${relatedModelName};`;

    if (content.includes(useStatement)) {
      return true;
    }

    const namespaceMatch = content.match(/namespace\s+([^;]+);/);
    if (!namespaceMatch) {
      console.log(`   ⚠️  Could not find namespace in ${modelName}`);
      return false;
    }

    const namespaceEndIndex = content.indexOf(";", namespaceMatch.index) + 1;
    const classMatch = content.match(/class\s+\w+/);
    if (!classMatch) {
      console.log(`   ⚠️  Could not find class in ${modelName}`);
      return false;
    }

    const classStartIndex = classMatch.index;
    const betweenContent = content.substring(
      namespaceEndIndex,
      classStartIndex,
    );
    const importUseStatements = betweenContent.match(/use\s+[^;]*\\[^;]+;/g);

    let insertPosition;
    if (importUseStatements && importUseStatements.length > 0) {
      const lastUse = importUseStatements[importUseStatements.length - 1];
      const lastUseIndex = content.indexOf(lastUse);
      insertPosition = content.indexOf(";", lastUseIndex) + 1;
    } else {
      insertPosition = namespaceEndIndex;
    }

    const beforeUse = content.substring(0, insertPosition);
    const afterUse = content.substring(insertPosition);
    const newContent = beforeUse + "\n" + useStatement + afterUse;

    await fs.writeFile(modelPath, newContent, "utf8");
    console.log(
      `   ✅ Added namespace: use App\\Models\\${relatedModelName}\\${relatedModelName}`,
    );

    return true;
  } catch (error) {
    console.log(`   ❌ Error adding use statement: ${error.message}`);
    return false;
  }
}

/**
 * Add relationship to existing model (with namespace import)
 */
async function addRelationshipToModel(
  backendPath,
  modelName,
  relationshipMethod,
  relatedModelName,
) {
  const modelPath = path.join(
    backendPath,
    "app/Models",
    modelName,
    `${modelName}.php`,
  );

  try {
    let content = await fs.readFile(modelPath, "utf8");

    if (relatedModelName) {
      await addUseStatementToModel(backendPath, modelName, relatedModelName);
      content = await fs.readFile(modelPath, "utf8");
    }

    if (content.includes(`function ${relationshipMethod.name}()`)) {
      console.log(
        `   ⚠️  Relationship ${relationshipMethod.name}() already exists in ${modelName}`,
      );
      return false;
    }

    const lastBraceIndex = content.lastIndexOf("}");
    if (lastBraceIndex === -1) {
      console.log(`   ❌ Could not find closing brace in ${modelName}`);
      return false;
    }

    const hasRelationshipsSection = content.includes("RELATIONSHIPS");

    let relationshipCode = "";
    if (!hasRelationshipsSection) {
      relationshipCode =
        "\n    /**\n     * ======================\n     * RELATIONSHIPS\n     * ======================\n     */\n";
    }

    relationshipCode += relationshipMethod.code;

    content =
      content.substring(0, lastBraceIndex) +
      relationshipCode +
      "\n" +
      content.substring(lastBraceIndex);

    await fs.writeFile(modelPath, content, "utf8");
    console.log(
      `   ✅ Added relationship ${relationshipMethod.name}() to ${modelName}`,
    );

    return true;
  } catch (error) {
    console.log(`   ❌ ERROR in addRelationshipToModel: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// DELETE MODULE FUNCTIONALITY
// ============================================================================

/**
 * Remove line or block from file
 */
async function removeLineFromFile(filePath, searchPattern) {
  try {
    let content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");
    const filtered = lines.filter((line) => !line.includes(searchPattern));

    if (filtered.length < lines.length) {
      await fs.writeFile(filePath, filtered.join("\n"), "utf8");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Remove import/use statement from file (Vue, JS, or PHP)
 */
async function removeImportStatement(filePath, moduleName) {
  try {
    let content = await fs.readFile(filePath, "utf8");

    // Remove Vue/JS imports
    content = content.replace(
      new RegExp(
        `import\\s+.*?from\\s+['"]/.*/${moduleName.toLowerCase()}/.*?['"]\n?`,
        "g",
      ),
      "",
    );
    content = content.replace(
      new RegExp(
        `import\\s+.*?from\\s+['"]\\./.*${moduleName}.*?['"]\\n?`,
        "g",
      ),
      "",
    );

    // Remove PHP use statements
    content = content.replace(
      new RegExp(
        `use\\s+App\\\\\\w+\\\\${moduleName}\\\\${moduleName}.*?;\\n?`,
        "g",
      ),
      "",
    );

    await fs.writeFile(filePath, content, "utf8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove router entry for module
 */
async function removeFromRouterIndex(frontendPath, moduleName) {
  const routerIndexPath = path.join(frontendPath, "src/router/index.js");

  try {
    let content = await fs.readFile(routerIndexPath, "utf8");
    const nameKebab = moduleName
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();

    // Remove import
    content = content.replace(
      new RegExp(
        `import\\s+.*${moduleName}.*from\\s+['"].*${moduleNamekebab}.*['"]\\n?`,
        "g",
      ),
      "",
    );
    content = content.replace(
      new RegExp(
        `import\\s+${moduleName}Page\\s+from\\s+['"].*${nameKebab}.*['"]\\n?`,
        "g",
      ),
      "",
    );

    // Remove route object
    content = content.replace(
      new RegExp(
        `\\{\\s*path:\\s*['"]/${nameKebab}.*?component:\\s*${moduleName}Page\\s*\\},?\\n?`,
        "s",
      ),
      "",
    );

    // Clean up extra blank lines
    content = content.replace(/\n\n\n+/g, "\n\n");

    await fs.writeFile(routerIndexPath, content, "utf8");
    return true;
  } catch (error) {
    console.log(`   ⚠️  Could not remove from router index: ${error.message}`);
    return false;
  }
}

/**
 * Delete directory recursively
 */
async function deleteDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await deleteDirectory(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }

    await fs.rmdir(dirPath);
    return true;
  } catch (error) {
    console.log(`   ⚠️  Could not delete directory: ${error.message}`);
    return false;
  }
}

/**
 * Main function to delete entire module
 */
async function deleteModule(
  backendPath,
  frontendPath,
  moduleName,
  deleteBackend = true,
  deleteFrontend = true,
) {
  const results = {
    deletedBackend: [],
    deletedFrontend: [],
    errors: [],
  };

  try {
    console.log(`\n🗑️  Deleting module: ${moduleName}`);
    console.log("─────────────────────────────────────────────────────────");

    if (deleteBackend) {
      // Delete backend Model
      const modelDir = path.join(backendPath, "app/Models", moduleName);
      if (await deleteDirectory(modelDir)) {
        console.log(`   ✓ Deleted backend model: app/Models/${moduleName}`);
        results.deletedBackend.push(`Models/${moduleName}`);
      }

      // Delete backend Repository
      const repoDir = path.join(
        backendPath,
        "app/Repositories/Eloquent",
        moduleName,
      );
      if (await deleteDirectory(repoDir)) {
        console.log(
          `   ✓ Deleted backend repository: app/Repositories/Eloquent/${moduleName}`,
        );
        results.deletedBackend.push(`Repositories/${moduleName}`);
      }

      // Delete backend Service
      const serviceDir = path.join(
        backendPath,
        "app/Services/Eloquent",
        moduleName,
      );
      if (await deleteDirectory(serviceDir)) {
        console.log(
          `   ✓ Deleted backend service: app/Services/Eloquent/${moduleName}`,
        );
        results.deletedBackend.push(`Services/${moduleName}`);
      }

      // Delete backend Controller
      const controllerDir = path.join(
        backendPath,
        "app/Http/Controllers",
        moduleName,
      );
      if (await deleteDirectory(controllerDir)) {
        console.log(
          `   ✓ Deleted backend controller: app/Http/Controllers/${moduleName}`,
        );
        results.deletedBackend.push(`Controllers/${moduleName}`);
      }

      // Delete backend Route files
      const routeDir = path.join(backendPath, "routes/API/Modules", moduleName);
      if (await deleteDirectory(routeDir)) {
        console.log(
          `   ✓ Deleted backend routes: routes/API/Modules/${moduleName}`,
        );
        results.deletedBackend.push(`Routes/${moduleName}`);
      }

      // Delete backend ControllerTest files
      const testDir = path.join(backendPath, "tests/Unit", moduleName);
      if (await deleteDirectory(testDir)) {
        console.log(`   ✓ Deleted backend test: tests/Unit/${moduleName}`);
        results.deletedBackend.push(`Tests/${moduleName}`);
      }

      // Remove from routes/api.php or routes/API/index.php
      const apiRoutesPathAlt = path.join(backendPath, "routes/API/index.php");
      const apiRoutesPathOrig = path.join(backendPath, "routes/api.php");

      let apiRoutesPath = (await fileExists(apiRoutesPathAlt))
        ? apiRoutesPathAlt
        : apiRoutesPathOrig;

      try {
        let routeContent = await fs.readFile(apiRoutesPath, "utf8");
        const nameKebab = moduleName
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .toLowerCase();

        // Split into lines and filter out the @include line for this module
        const lines = routeContent.split("\n");
        const filteredLines = lines.filter((line) => {
          // Remove @include for this specific module (case-insensitive)
          return !line.match(
            new RegExp(
              `@include\\s*\\(\\s*['\"]Modules/${moduleName}/${moduleName}Routes\\.php['\"]\\s*\\)`,
              "i",
            ),
          );
        });
        routeContent = filteredLines.join("\n");

        // Remove Route::apiResource registration
        routeContent = routeContent.replace(
          new RegExp(
            `Route::apiResource\\(['\"]${nameKebab}['\"],\\s*${moduleName}Controller::class\\);?\\n?`,
            "gi",
          ),
          "",
        );

        // Remove use statements
        routeContent = routeContent.replace(
          new RegExp(
            `use\\s+App\\\\Http\\\\Controllers\\\\${moduleName}\\\\${moduleName}Controller;\\n?`,
            "gi",
          ),
          "",
        );

        // Clean up extra blank lines
        routeContent = routeContent.replace(/\n\n\n+/g, "\n\n");

        await fs.writeFile(apiRoutesPath, routeContent, "utf8");
        console.log(`   ✓ Removed @include from routes file`);
      } catch (err) {
        console.log(`   ⚠️  Could not remove from routes: ${err.message}`);
      }
    }

    if (deleteFrontend) {
      const nameKebab = moduleName
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();

      // Delete frontend API file
      const apiFilePath = path.join(frontendPath, `src/api/${nameKebab}.js`);
      try {
        await fs.unlink(apiFilePath);
        console.log(`   ✓ Deleted frontend API: src/api/${nameKebab}.js`);
        results.deletedFrontend.push(`api/${nameKebab}.js`);
      } catch {
        console.log(`   ⚠️  Frontend API file not found`);
      }

      // Delete frontend Page component
      const pageFilePath = path.join(
        frontendPath,
        `src/pages/${moduleName}Page.vue`,
      );
      try {
        await fs.unlink(pageFilePath);
        console.log(
          `   ✓ Deleted frontend page: src/pages/${moduleName}Page.vue`,
        );
        results.deletedFrontend.push(`pages/${moduleName}Page.vue`);
      } catch {
        console.log(`   ⚠️  Frontend page file not found`);
      }

      // Delete frontend Router component
      const routerFilePath = path.join(
        frontendPath,
        `src/router/${nameKebab}.js`,
      );
      try {
        await fs.unlink(routerFilePath);
        console.log(`   ✓ Deleted frontend router: src/router/${nameKebab}.js`);
        results.deletedFrontend.push(`router/${nameKebab}.js`);
      } catch {
        console.log(`   ⚠️  Frontend router file not found`);
      }

      // Remove from router/index.js
      await removeFromRouterIndex(frontendPath, moduleName);
      console.log(`   ✓ Removed from router/index.js`);

      // Try to remove from main.js or app.js
      for (const mainFile of ["src/main.js", "src/App.js"]) {
        const mainPath = path.join(frontendPath, mainFile);
        try {
          await removeImportStatement(mainPath, moduleName);
        } catch {
          // File might not exist
        }
      }
    }

    console.log("\n✅ Module deletion complete!\n");
    return results;
  } catch (error) {
    console.error(`\n❌ Error deleting module: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// BATCH MODE - JSON FILE PROCESSING
// ============================================================================

/**
 * Validates JSON batch configuration
 * @param {Object} config - The configuration object from JSON
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateBatchConfig(config) {
  const errors = [];

  // Validate top-level structure
  // if (!config.backendPath) errors.push("Missing required field: backendPath");
  // if (!config.frontendPath) errors.push("Missing required field: frontendPath");
  // if (!Array.isArray(config.modules)) errors.push("modules must be an array");

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate each module
  config.modules.forEach((module, index) => {
    const modulePrefix = `Module[${index}] (${module.name || "unnamed"})`;

    if (!module.name) {
      errors.push(`${modulePrefix}: Missing required field: name`);
    } else {
      const nameValidation = validateModelName(module.name);
      if (nameValidation !== true) {
        errors.push(`${modulePrefix}: ${nameValidation}`);
      }
    }

    // Validate fields
    if (!Array.isArray(module.fields)) {
      errors.push(`${modulePrefix}: fields must be an array`);
    } else {
      module.fields.forEach((field, fieldIndex) => {
        const fieldPrefix = `${modulePrefix} Field[${fieldIndex}]`;

        if (!field.name) {
          errors.push(`${fieldPrefix}: Missing required field: name`);
        } else {
          const fieldNameValidation = validateFieldName(field.name);
          if (fieldNameValidation !== true) {
            errors.push(`${fieldPrefix}: ${fieldNameValidation}`);
          }
        }

        if (!field.type) {
          errors.push(`${fieldPrefix}: Missing required field: type`);
        } else if (!FIELD_TYPES[field.type]) {
          errors.push(
            `${fieldPrefix}: Invalid type "${field.type}". Allowed: ${Object.keys(FIELD_TYPES).join(", ")}`,
          );
        }

        if (
          field.hasOwnProperty("showInTable") &&
          typeof field.showInTable !== "boolean"
        ) {
          errors.push(`${fieldPrefix}: showInTable must be boolean`);
        }
      });
    }

    // Validate relationships (optional)
    if (module.relationships) {
      if (!Array.isArray(module.relationships)) {
        errors.push(`${modulePrefix}: relationships must be an array`);
      } else {
        module.relationships.forEach((rel, relIndex) => {
          const relPrefix = `${modulePrefix} Relationship[${relIndex}]`;

          if (!rel.type) {
            errors.push(`${relPrefix}: Missing required field: type`);
          } else if (!RELATIONSHIP_TYPES[rel.type]) {
            errors.push(
              `${relPrefix}: Invalid type "${rel.type}". Allowed: ${Object.keys(RELATIONSHIP_TYPES).join(", ")}`,
            );
          }

          if (!rel.relatedModel) {
            errors.push(`${relPrefix}: Missing required field: relatedModel`);
          } else {
            const modelValidation = validateModelName(rel.relatedModel);
            if (modelValidation !== true) {
              errors.push(`${relPrefix}: relatedModel: ${modelValidation}`);
            }
          }

          if (!rel.methodName) {
            errors.push(`${relPrefix}: Missing required field: methodName`);
          } else {
            const methodValidation = validateFieldName(rel.methodName);
            if (methodValidation !== true) {
              errors.push(`${relPrefix}: methodName: ${methodValidation}`);
            }
          }

          if (rel.foreignKey && typeof rel.foreignKey !== "string") {
            errors.push(`${relPrefix}: foreignKey must be string`);
          }
        });
      }
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Converts field configurations from batch format
 * @param {Array} fields - Fields from JSON config
 * @returns {Object} - { backendFillable, backendValidations, frontendFields }
 */
function convertBatchFields(fields, name) {
  const backendFillable = [];
  const backendValidations = [];
  const frontendFields = [];

  fields.forEach((field) => {
    const fieldInfo = FIELD_TYPES[field.type];

    backendFillable.push(field.name);
    backendValidations.push({
      name: field.name,
      type: field.type,
      rule: fieldInfo.validation,
      updateRule: fieldInfo.updateValidation,
      testValue: fieldInfo.testValue,
      updateValue: fieldInfo.updateValue,
    });

    frontendFields.push({
      name: field.name,
      type: field.type,
      formType: fieldInfo.formType,
      rules: fieldInfo.validation,
      description: field.description || "",
      showInTable: field.showInTable !== false,
      options: field.options || null,
      isDynamic: field.isDynamic || false,
      isMultiple: field.isMultiple || false,
      customType: field.customType || null,
      module: field.module || null,
      optionLabel: field.optionLabel || "name",
      rules: fieldInfo.validation,
      col: fieldInfo.col,
    });
  });

  return { backendFillable, backendValidations, frontendFields };
}

/**
 * Processes a single module from batch config
 * @param {Object} moduleConfig - Module configuration
 * @param {string} backendPath - Backend path
 * @param {string} frontendPath - Frontend path
 * @param {boolean} genBackend - Generate backend
 * @param {boolean} genFrontend - Generate frontend
 * @returns {Object} - Processing result
 */
async function processBatchModule(
  moduleConfig,
  backendPath,
  frontendPath,
  genBackend,
  genFrontend,
) {
  const result = {
    name: moduleConfig.name,
    success: false,
    errors: [],
    warnings: [],
  };

  try {
    const name = moduleConfig.name;
    const namekebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const nameLower = name.toLowerCase();

    // Convert fields
    const { backendFillable, backendValidations, frontendFields } =
      convertBatchFields(moduleConfig.fields, name);

    // Process relationships
    let relationships = [];
    if (
      moduleConfig.relationships &&
      Array.isArray(moduleConfig.relationships)
    ) {
      relationships = moduleConfig.relationships.map((rel) => ({
        methodName: rel.methodName,
        type: rel.type,
        relatedModel: rel.relatedModel,
        foreignKey: rel.foreignKey || `${rel.relatedModel.toLowerCase()}_id`,
        localKey: rel.localKey || null,
        inverse: true,
        inverseMethod:
          rel.inverseMethod || getDefaultInverseMethod(rel.type, name),
        inverseType: rel.inverseType || RELATIONSHIP_TYPES[rel.type].inverse,
      }));

      // Add foreign key fields to fillable and validations for belongsTo and belongsToMany
      relationships.forEach((rel) => {
        if (rel.type === "belongsTo") {
          // Add foreign key field
          if (!backendFillable.includes(rel.foreignKey)) {
            backendFillable.push(rel.foreignKey);
            backendValidations.push({
              name: rel.foreignKey,
              type: "string",
              rule: "required|string",
              updateRule: "required|string",
              testValue: '"507f1f77bcf86cd799439011"',
              updateValue: '"507f1f77bcf86cd799439012"',
            });
          }
        } else if (rel.type === "belongsToMany") {
          // Determine the array field name for THIS model
          const arrayFieldName =
            rel.foreignKey || `${rel.relatedModel.toLowerCase()}_ids`;

          // Add array field for many-to-many in THIS model
          if (!backendFillable.includes(arrayFieldName)) {
            backendFillable.push(arrayFieldName);
            backendValidations.push({
              name: arrayFieldName,
              type: "array",
              rule: "nullable|array",
              updateRule: "nullable|array",
              testValue:
                "['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']",
              updateValue:
                "['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014']",
            });
          }

          // Store the inverse field in localKey for relationship generation
          const inverseFieldName =
            rel.localKey?.inverseField ||
            `${moduleConfig.name.toLowerCase()}_ids`;

          // Update the relationship object with complete localKey info
          rel.foreignKey = arrayFieldName;
          rel.localKey = {
            inverseField: inverseFieldName,
            addSyncMethods: true,
          };
        }
      });
    }

    if (genBackend) {
      try {
        // Check if model already exists
        const modelExists = await checkBackendModelExists(backendPath, name);

        if (modelExists) {
          console.log(`   ℹ️  Model ${name} already exists, updating...`);

          // Add new fields to existing model
          const existingFields = await getExistingFields(backendPath, name);
          for (const field of backendFillable) {
            if (!existingFields.includes(field)) {
              await addFieldToModel(backendPath, name, field);
              console.log(`   ✅ Added field '${field}' to ${name}`);
            }
          }

          // Add relationships to existing model
          for (const rel of relationships) {
            try {
              await addRelationshipToModel(
                backendPath,
                name,
                {
                  name: rel.methodName,
                  code: generateSingleRelationship(rel),
                },
                rel.relatedModel,
              );
            } catch (err) {
              console.log(`   ⚠️  ${err.message}`);
            }
          }
        } else {
          // Create new model
          await createBackendFile(
            "Model",
            backendPath,
            "model.txt",
            name,
            namekebab,
            backendFillable,
            backendValidations,
            relationships,
          );
          console.log("   ✓ Model created");

          await createBackendFile(
            "Repository",
            backendPath,
            "repositories.txt",
            name,
            namekebab,
            backendFillable,
            [],
            relationships,
          );
          console.log("   ✓ Repository created");

          await createBackendFile(
            "Service",
            backendPath,
            "services.txt",
            name,
            namekebab,
            backendFillable,
            backendValidations,
          );
          console.log("   ✓ Service created");

          await createBackendFile(
            "Controller",
            backendPath,
            "controller.txt",
            name,
            namekebab,
            backendFillable,
          );
          console.log("   ✓ Controller created");

          await createBackendFile(
            "Routes",
            backendPath,
            "route.txt",
            name,
            namekebab,
            backendFillable,
          );
          console.log("   ✓ Routes created");

          await createBackendFile(
            "ControllerTest",
            backendPath,
            "test.txt",
            name,
            namekebab,
            backendFillable,
            backendValidations,
          );
          console.log("   ✓ Test created");

          await registerBackendRoute(backendPath, name);
          console.log("   ✓ Route registered");
        }

        result.backend = { model: "✓" };

        // Handle inverse relationships for BOTH new and existing models
        for (const rel of relationships) {
          if (rel.inverse && rel.inverseMethod) {
            try {
              const relatedModelExists = await checkBackendModelExists(
                backendPath,
                rel.relatedModel,
              );

              if (!relatedModelExists) {
                console.log(
                  `   ⚠️  Related model ${rel.relatedModel} not found, skipping inverse relationship`,
                );
                continue;
              }

              // Determine inverse relationship details
              const inverseType =
                rel.inverseType || RELATIONSHIP_TYPES[rel.type]?.inverse;

              const inverseRel = {
                methodName: rel.inverseMethod,
                type: inverseType,
                relatedModel: name,
                foreignKey:
                  rel.type === "belongsToMany"
                    ? rel.localKey?.inverseField
                    : rel.foreignKey,
                localKey:
                  rel.type === "belongsToMany"
                    ? { inverseField: rel.foreignKey }
                    : null,
                embedded: false,
              };

              const inverseCode = generateSingleRelationship(inverseRel);

              // Add inverse relationship to related model
              await addRelationshipToModel(
                backendPath,
                rel.relatedModel,
                {
                  name: rel.inverseMethod,
                  code: inverseCode,
                },
                name,
              );

              // For belongsToMany, add the inverse field to the related model
              if (rel.type === "belongsToMany" && rel.localKey?.inverseField) {
                const inverseFieldName = rel.localKey.inverseField;
                const relatedFields = await getExistingFields(
                  backendPath,
                  rel.relatedModel,
                );

                if (!relatedFields.includes(inverseFieldName)) {
                  await addFieldToModel(
                    backendPath,
                    rel.relatedModel,
                    inverseFieldName,
                  );
                  console.log(
                    `   ✅ Added field '${inverseFieldName}' to ${rel.relatedModel}`,
                  );
                }
              }
            } catch (err) {
              result.warnings.push(
                `Inverse relationship ${rel.inverseMethod}: ${err.message}`,
              );
              console.log(`   ⚠️  ${err.message}`);
            }
          }
        }
      } catch (err) {
        result.errors.push(`Backend generation: ${err.message}`);
      }
    }
    if (genFrontend) {
      try {
        await createFrontendFile(
          "API",
          frontendPath,
          "api.txt",
          name,
          namekebab,
          nameLower,
          frontendFields,
        );
        result.frontend = { api: "✓" };

        await createFrontendFile(
          "Page",
          frontendPath,
          "page.txt",
          name,
          namekebab,
          nameLower,
          frontendFields,
        );
        result.frontend.page = "✓";

        await createFrontendFile(
          "Router",
          frontendPath,
          "router.txt",
          name,
          namekebab,
          nameLower,
          frontendFields,
        );
        result.frontend.router = "✓";

        await updateFrontendRouterIndex(frontendPath, name);
        result.frontend.routerIndex = "✓";
      } catch (err) {
        result.errors.push(`Frontend generation: ${err.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Gets default inverse method name based on relationship type
 * @param {string} type - Relationship type
 * @param {string} modelName - Related model name
 * @returns {string} - Inverse method name
 */
function getDefaultInverseMethod(type, modelName) {
  const lowerName = modelName.toLowerCase();
  if (type === "hasMany" || type === "belongsToMany") {
    return lowerName + "s";
  }
  return lowerName;
}

/**
 * AI & ClickUp Mode Wizard
 */
// async function aiClickUpModeWizard() {
//   console.log("\n🤖 AI & ClickUp Mode");
//   console.log("─────────────────────────────────────────────────────────");
//   console.log("This mode fetches task details from ClickUp and uses AI");
//   console.log("to generate module configuration automatically.");
//   console.log("─────────────────────────────────────────────────────────");

//   try {
//     // STEP 1: Get paths
//     console.log("\n📝 Step 1: Path Configuration");
//     console.log("─────────────────────────────────────────────────────────");

//     const { backendPath, frontendPath } = await inquirer.prompt([
//       {
//         type: "input",
//         name: "backendPath",
//         message: "Backend path (e.g., ../Backend):",
//         default: "../Backend",
//         validate: validatePath,
//       },
//       {
//         type: "input",
//         name: "frontendPath",
//         message: "Frontend path (e.g., ../Frontend):",
//         default: "../Frontend",
//         validate: validatePath,
//       },
//     ]);

//     // STEP 2: Get ClickUp Task ID
//     console.log("\n📝 Step 2: ClickUp Task ID");
//     console.log("─────────────────────────────────────────────────────────");

//     const { taskId } = await inquirer.prompt([
//       {
//         type: "input",
//         name: "taskId",
//         message: "ClickUp Task ID:",
//         validate: (input) => {
//           if (!input.trim()) return "Task ID cannot be empty";
//           return true;
//         },
//       },
//     ]);

//     console.log("\n⏳ Fetching task from ClickUp...");

//     // Fetch task from ClickUp
//     let taskData;
//     try {
//       taskData = await getTask(taskId);
//       console.log(`✅ Task fetched: ${taskData}`);
//     } catch (error) {
//       console.error(`\n❌ ${error.message}`);
//       const { retry } = await inquirer.prompt([
//         {
//           type: "confirm",
//           name: "retry",
//           message: "Would you like to try again?",
//           default: true,
//         },
//       ]);

//       if (retry) {
//         return await aiClickUpModeWizard();
//       } else {
//         await mainMenu();
//         return;
//       }
//     }

//     // Display task info
//     console.log("\n📋 Task Information:");
//     console.log(`   Name: ${taskData}`);
//     console.log(
//       `   Description: ${taskData?.substring(0, 100) || "N/A"}${taskData?.length > 100 ? "..." : ""}`,
//     );

//     const { confirmGenerate } = await inquirer.prompt([
//       {
//         type: "confirm",
//         name: "confirmGenerate",
//         message: "Generate module configuration using AI?",
//         default: true,
//       },
//     ]);

//     if (!confirmGenerate) {
//       console.log("\n❌ Operation cancelled\n");
//       await mainMenu();
//       return;
//     }

//     console.log("\n🤖 Generating configuration with OpenAI...");

//     // Generate config using AI
//     let generatedConfig;
//     try {
//       generatedConfig = await generateSchema(taskData);
//       console.log("✅ Configuration generated successfully!");
//     } catch (error) {
//       console.error(`\n❌ ${error.message}`);
//       const { manualMode } = await inquirer.prompt([
//         {
//           type: "confirm",
//           name: "manualMode",
//           message: "Would you like to switch to manual mode instead?",
//           default: true,
//         },
//       ]);

//       if (manualMode) {
//         return await wizard();
//       } else {
//         await mainMenu();
//         return;
//       }
//     }

//     // Parse the generated config
//     let parsedConfig;
//     try {
//       parsedConfig = JSON.parse(generatedConfig);
//     } catch (error) {
//       console.error(
//         "\n❌ Failed to parse generated configuration:",
//         error.message,
//       );
//       console.error("Raw config:", generatedConfig);
//       await mainMenu();
//       return;
//     }

//     // Ensure the structure is correct
//     if (!parsedConfig.modules || !Array.isArray(parsedConfig.modules)) {
//       console.error("\n❌ Generated configuration is missing 'modules' array");
//       console.error("Received structure:", parsedConfig);
//       await mainMenu();
//       return;
//     }

//     // Ensure each module has required arrays
//     parsedConfig.modules.forEach((module) => {
//       if (!module.fields) {
//         console.log(
//           `⚠️  Module '${module.name}' missing fields array, adding empty array`,
//         );
//         module.fields = [];
//       }
//       if (!module.relationships) {
//         module.relationships = [];
//       }
//     });

//     // Display generated config
//     console.log("\n📄 Generated Configuration:");
//     console.log("─────────────────────────────────────────────────────────");
//     console.log(JSON.stringify(parsedConfig, null, 2));
//     console.log("─────────────────────────────────────────────────────────");

//     const { saveConfig } = await inquirer.prompt([
//       {
//         type: "confirm",
//         name: "saveConfig",
//         message: "Save this configuration to a JSON file?",
//         default: true,
//       },
//     ]);

//     if (saveConfig) {
//       const { configFileName } = await inquirer.prompt([
//         {
//           type: "input",
//           name: "configFileName",
//           message: "Config file name:",
//           default: `clickup-${taskId}-config.json`,
//           validate: (input) => {
//             if (!input.trim()) return "File name cannot be empty";
//             if (!input.endsWith(".json")) return "File must end with .json";
//             return true;
//           },
//         },
//       ]);

//       try {
//         await fs.writeFile(
//           configFileName,
//           JSON.stringify(parsedConfig, null, 2),
//           "utf8",
//         );
//         console.log(`\n✅ Configuration saved to: ${configFileName}`);
//       } catch (error) {
//         console.error(`\n⚠️  Could not save file: ${error.message}`);
//       }
//     }

//     const { proceedGeneration } = await inquirer.prompt([
//       {
//         type: "confirm",
//         name: "proceedGeneration",
//         message: "Proceed with module generation?",
//         default: true,
//       },
//     ]);

//     if (!proceedGeneration) {
//       console.log("\n❌ Generation cancelled\n");
//       await mainMenu();
//       return;
//     }

//     // Validate configuration
//     const validation = validateBatchConfig(parsedConfig);
//     if (!validation.isValid) {
//       console.error("\n❌ Generated configuration has errors:");
//       validation.errors.forEach((err) => console.error(`   • ${err}`));

//       const { fixManually } = await inquirer.prompt([
//         {
//           type: "confirm",
//           name: "fixManually",
//           message:
//             "Would you like to fix the configuration manually and continue?",
//           default: false,
//         },
//       ]);

//       if (!fixManually) {
//         await mainMenu();
//         return;
//       }

//       console.log(
//         "\nPlease edit the saved JSON file and use Batch Mode to continue.",
//       );
//       await mainMenu();
//       return;
//     }

//     // Check paths
//     const backendValid = await checkBackendAppExists(backendPath);
//     const frontendValid = await checkFrontendSrcExists(frontendPath);

//     if (!backendValid && !frontendValid) {
//       console.error("\n❌ Neither backend nor frontend paths are valid!");
//       await mainMenu();
//       return;
//     }

//     const genBackend = backendValid;
//     const genFrontend = frontendValid;

//     if (!backendValid)
//       console.log(`⚠️  Backend path not found: ${backendPath}`);
//     if (!frontendValid)
//       console.log(`⚠️  Frontend path not found: ${frontendPath}`);

//     console.log("\n🚀 Starting module generation...\n");

//     const results = [];
//     for (let i = 0; i < parsedConfig.modules.length; i++) {
//       const module = parsedConfig.modules[i];
//       console.log(
//         `\n📝 [${i + 1}/${parsedConfig.modules.length}] Processing: ${module.name}`,
//       );
//       console.log("─────────────────────────────────────────────────────────");

//       const result = await processBatchModule(
//         module,
//         backendPath,
//         frontendPath,
//         genBackend,
//         genFrontend,
//       );
//       results.push(result);

//       if (result.success) {
//         console.log(`✅ ${module.name} generated successfully`);
//         if (result.backend)
//           console.log(
//             `   Backend: ${Object.values(result.backend).join(", ")}`,
//           );
//         if (result.frontend)
//           console.log(
//             `   Frontend: ${Object.values(result.frontend).join(", ")}`,
//           );
//       } else {
//         console.log(`❌ ${module.name} generation failed:`);
//         result.errors.forEach((err) => console.log(`   • ${err}`));
//       }

//       if (result.warnings.length > 0) {
//         console.log(`   ⚠️  Warnings:`);
//         result.warnings.forEach((warn) => console.log(`   • ${warn}`));
//       }
//     }

//     // Display summary
//     displayCompletionBanner();
//     console.log("📊 AI Generation Summary:");
//     console.log("─────────────────────────────────────────────────────────");

//     const successCount = results.filter((r) => r.success).length;
//     const failureCount = results.filter((r) => !r.success).length;

//     console.log(`ClickUp Task: ${taskData} (${taskId})`);
//     console.log(`Total modules: ${parsedConfig.modules.length}`);
//     console.log(`✅ Successful: ${successCount}`);
//     if (failureCount > 0) console.log(`❌ Failed: ${failureCount}`);
//     console.log("\nGenerated modules:");

//     results.forEach((result) => {
//       const status = result.success ? "✓" : "✗";
//       console.log(`   [${status}] ${result.name}`);
//       if (result.errors.length > 0) {
//         result.errors.forEach((err) => console.log(`       └─ ${err}`));
//       }
//     });

//     console.log("\n");

//     const { continueLoop } = await inquirer.prompt([
//       {
//         type: "confirm",
//         name: "continueLoop",
//         message: "Return to main menu?",
//         default: true,
//       },
//     ]);

//     if (continueLoop) {
//       await mainMenu();
//     } else {
//       console.log("\nGoodbye! 👋\n");
//       process.exit(0);
//     }
//   } catch (error) {
//     console.error("\n❌ Error:", error.message);
//     console.error(error.stack);
//     const { backToMenu } = await inquirer.prompt([
//       {
//         type: "confirm",
//         name: "backToMenu",
//         message: "Return to main menu?",
//         default: true,
//       },
//     ]);

//     if (backToMenu) {
//       await mainMenu();
//     } else {
//       process.exit(1);
//     }
//   }
// }
async function aiClickUpModeWizard() {
  console.log("\n🤖 AI & ClickUp Mode");
  console.log("─────────────────────────────────────────────────────────");
  console.log("This mode fetches task details from ClickUp and uses AI");
  console.log("to generate module configuration automatically.");
  console.log("─────────────────────────────────────────────────────────");

  try {
    // STEP 1: Get paths
    console.log("\n📝 Step 1: Path Configuration");
    console.log("─────────────────────────────────────────────────────────");

    const { backendPath, frontendPath } = await inquirer.prompt([
      {
        type: "input",
        name: "backendPath",
        message: "Backend path (e.g., ../Backend):",
        default: "../Backend",
        validate: validatePath,
      },
      {
        type: "input",
        name: "frontendPath",
        message: "Frontend path (e.g., ../Frontend):",
        default: "../Frontend",
        validate: validatePath,
      },
    ]);

    // STEP 2: Get ClickUp Task ID
    console.log("\n📝 Step 2: ClickUp Task ID");
    console.log("─────────────────────────────────────────────────────────");

    const { taskId } = await inquirer.prompt([
      {
        type: "input",
        name: "taskId",
        message: "ClickUp Task ID:",
        validate: (input) => {
          if (!input.trim()) return "Task ID cannot be empty";
          return true;
        },
      },
    ]);

    console.log("\n⏳ Fetching task from ClickUp...");

    // Fetch task from ClickUp
    let taskData;
    try {
      taskData = await getTask(taskId);
      console.log(`✅ Task fetched: ${taskData}`);
    } catch (error) {
      console.error(`\n❌ ${error.message}`);
      const { retry } = await inquirer.prompt([
        {
          type: "confirm",
          name: "retry",
          message: "Would you like to try again?",
          default: true,
        },
      ]);

      if (retry) {
        return await aiClickUpModeWizard();
      } else {
        await mainMenu();
        return;
      }
    }

    // Display task info
    console.log("\n📋 Task Information:");
    console.log(`   Name: ${taskData}`);
    console.log(
      `   Description: ${taskData?.substring(0, 100) || "N/A"}${taskData?.length > 100 ? "..." : ""}`,
    );

    const { confirmGenerate } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmGenerate",
        message: "Generate module configuration using AI?",
        default: true,
      },
    ]);

    if (!confirmGenerate) {
      console.log("\n❌ Operation cancelled\n");
      await mainMenu();
      return;
    }

    console.log("\n🤖 Generating configuration with OpenAI...");

    // Generate config using AI
    let generatedConfig;
    try {
      generatedConfig = await generateSchema(taskData);
      console.log("✅ Configuration generated successfully!");
    } catch (error) {
      console.error(`\n❌ ${error.message}`);
      const { manualMode } = await inquirer.prompt([
        {
          type: "confirm",
          name: "manualMode",
          message: "Would you like to switch to manual mode instead?",
          default: true,
        },
      ]);

      if (manualMode) {
        return await wizard();
      } else {
        await mainMenu();
        return;
      }
    }

    // Parse the generated config
    let parsedConfig;
    try {
      parsedConfig = JSON.parse(generatedConfig);
    } catch (error) {
      console.error(
        "\n❌ Failed to parse generated configuration:",
        error.message,
      );
      console.error("Raw config:", generatedConfig);
      await mainMenu();
      return;
    }

    // Ensure the structure is correct
    if (!parsedConfig.modules || !Array.isArray(parsedConfig.modules)) {
      console.error("\n❌ Generated configuration is missing 'modules' array");
      console.error("Received structure:", parsedConfig);
      await mainMenu();
      return;
    }

    // Ensure each module has required arrays and fix names
    parsedConfig.modules.forEach((module) => {
      // Remove spaces and special characters from module name
      if (module.name && module.name.includes(" ")) {
        const oldName = module.name;
        // Convert "External Hard Drive Types" to "ExternalHardDriveTypes"
        module.name = module.name.replace(/\s+/g, "");
        console.log(`⚠️  Fixed module name: "${oldName}" → "${module.name}"`);
      }

      if (!module.fields) {
        console.log(
          `⚠️  Module '${module.name}' missing fields array, adding empty array`,
        );
        module.fields = [];
      }
      if (!module.relationships) {
        module.relationships = [];
      }
    });

    // Display generated config
    console.log("\n📄 Generated Configuration:");
    console.log("─────────────────────────────────────────────────────────");
    console.log(JSON.stringify(parsedConfig, null, 2));
    console.log("─────────────────────────────────────────────────────────");

    const { saveConfig } = await inquirer.prompt([
      {
        type: "confirm",
        name: "saveConfig",
        message: "Save this configuration to a JSON file?",
        default: true,
      },
    ]);

    if (saveConfig) {
      const { configFileName } = await inquirer.prompt([
        {
          type: "input",
          name: "configFileName",
          message: "Config file name:",
          default: `clickup-${taskId}-config.json`,
          validate: (input) => {
            if (!input.trim()) return "File name cannot be empty";
            if (!input.endsWith(".json")) return "File must end with .json";
            return true;
          },
        },
      ]);

      try {
        await fs.writeFile(
          configFileName,
          JSON.stringify(parsedConfig, null, 2),
          "utf8",
        );
        console.log(`\n✅ Configuration saved to: ${configFileName}`);
      } catch (error) {
        console.error(`\n⚠️  Could not save file: ${error.message}`);
      }
    }

    const { proceedGeneration } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceedGeneration",
        message: "Proceed with module generation?",
        default: true,
      },
    ]);

    if (!proceedGeneration) {
      console.log("\n❌ Generation cancelled\n");
      await mainMenu();
      return;
    }

    // Validate configuration
    const validation = validateBatchConfig(parsedConfig);
    if (!validation.isValid) {
      console.error("\n❌ Generated configuration has errors:");
      validation.errors.forEach((err) => console.error(`   • ${err}`));

      const { fixManually } = await inquirer.prompt([
        {
          type: "confirm",
          name: "fixManually",
          message:
            "Would you like to fix the configuration manually and continue?",
          default: false,
        },
      ]);

      if (!fixManually) {
        await mainMenu();
        return;
      }

      console.log(
        "\nPlease edit the saved JSON file and use Batch Mode to continue.",
      );
      await mainMenu();
      return;
    }

    // Check paths
    const backendValid = await checkBackendAppExists(backendPath);
    const frontendValid = await checkFrontendSrcExists(frontendPath);

    if (!backendValid && !frontendValid) {
      console.error("\n❌ Neither backend nor frontend paths are valid!");
      await mainMenu();
      return;
    }

    const genBackend = backendValid;
    const genFrontend = frontendValid;

    if (!backendValid)
      console.log(`⚠️  Backend path not found: ${backendPath}`);
    if (!frontendValid)
      console.log(`⚠️  Frontend path not found: ${frontendPath}`);

    console.log("\n🚀 Starting module generation...\n");

    const results = [];
    for (let i = 0; i < parsedConfig.modules.length; i++) {
      const module = parsedConfig.modules[i];
      console.log(
        `\n📝 [${i + 1}/${parsedConfig.modules.length}] Processing: ${module.name}`,
      );
      console.log("─────────────────────────────────────────────────────────");

      const result = await processBatchModule(
        module,
        backendPath,
        frontendPath,
        genBackend,
        genFrontend,
      );
      results.push(result);

      if (result.success) {
        console.log(`✅ ${module.name} generated successfully`);
        if (result.backend)
          console.log(
            `   Backend: ${Object.values(result.backend).join(", ")}`,
          );
        if (result.frontend)
          console.log(
            `   Frontend: ${Object.values(result.frontend).join(", ")}`,
          );
      } else {
        console.log(`❌ ${module.name} generation failed:`);
        result.errors.forEach((err) => console.log(`   • ${err}`));
      }

      if (result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings:`);
        result.warnings.forEach((warn) => console.log(`   • ${warn}`));
      }
    }

    // Display summary
    displayCompletionBanner();
    console.log("📊 AI Generation Summary:");
    console.log("─────────────────────────────────────────────────────────");

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(`ClickUp Task: ${taskData} (${taskId})`);
    console.log(`Total modules: ${parsedConfig.modules.length}`);
    console.log(`✅ Successful: ${successCount}`);
    if (failureCount > 0) console.log(`❌ Failed: ${failureCount}`);
    console.log("\nGenerated modules:");

    results.forEach((result) => {
      const status = result.success ? "✓" : "✗";
      console.log(`   [${status}] ${result.name}`);
      if (result.errors.length > 0) {
        result.errors.forEach((err) => console.log(`       └─ ${err}`));
      }
    });

    console.log("\n");

    const { continueLoop } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueLoop",
        message: "Return to main menu?",
        default: true,
      },
    ]);

    if (continueLoop) {
      await mainMenu();
    } else {
      console.log("\nGoodbye! 👋\n");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    const { backToMenu } = await inquirer.prompt([
      {
        type: "confirm",
        name: "backToMenu",
        message: "Return to main menu?",
        default: true,
      },
    ]);

    if (backToMenu) {
      await mainMenu();
    } else {
      process.exit(1);
    }
  }
}

async function batchModeWizard() {
  console.log("\n📦 Batch Mode Configuration");
  console.log("─────────────────────────────────────────────────────────");

  try {
    // STEP 1: Ask for paths FIRST
    console.log("\n📝 Step 1: Path Configuration");
    console.log("─────────────────────────────────────────────────────────");

    const { backendPath, frontendPath } = await inquirer.prompt([
      {
        type: "input",
        name: "backendPath",
        message: "Backend path (e.g., ../Backend):",
        default: "../Backend",
        validate: validatePath,
      },
      {
        type: "input",
        name: "frontendPath",
        message: "Frontend path (e.g., ../Frontend):",
        default: "../Frontend",
        validate: validatePath,
      },
    ]);

    // STEP 2: Ask for JSON config file
    console.log("\n📝 Step 2: JSON Configuration File");
    console.log("─────────────────────────────────────────────────────────");

    const { configPath } = await inquirer.prompt([
      {
        type: "input",
        name: "configPath",
        message: "Path to JSON configuration file:",
        validate: (input) => {
          if (!input.trim()) return "Path cannot be empty";
          if (!input.endsWith(".json")) return "File must be .json";
          return true;
        },
      },
    ]);

    // Read JSON file
    let configContent;
    try {
      configContent = await fs.readFile(configPath, "utf8");
    } catch (error) {
      console.error(`\n❌ Error reading file: ${error.message}`);
      process.exit(1);
    }

    // Parse JSON
    let config;
    try {
      config = JSON.parse(configContent);
    } catch (error) {
      console.error(`\n❌ Invalid JSON format: ${error.message}`);
      process.exit(1);
    }

    // Validate configuration
    const validation = validateBatchConfig(config);
    if (!validation.isValid) {
      console.error("\n❌ Configuration validation errors:");
      validation.errors.forEach((err) => console.error(`   • ${err}`));
      process.exit(1);
    }

    console.log("\n✓ Configuration validated successfully");
    console.log(`📦 Found ${config.modules.length} module(s) to generate\n`);

    // Check paths from wizard input
    const backendValid = await checkBackendAppExists(backendPath);
    const frontendValid = await checkFrontendSrcExists(frontendPath);

    if (!backendValid && !frontendValid) {
      console.error("\n❌ Neither backend nor frontend paths are valid!");
      process.exit(1);
    }

    const genBackend = backendValid;
    const genFrontend = frontendValid;

    if (!backendValid)
      console.log(`⚠️  Backend path not found: ${backendPath}`);
    if (!frontendValid)
      console.log(`⚠️  Frontend path not found: ${frontendPath}`);

    // Confirm processing
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `\nGenerate ${config.modules.length} module(s)?`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log("\n❌ Operation cancelled\n");
      await mainMenu();
      return;
    }

    console.log("\n🚀 Starting batch generation...\n");

    const results = [];
    for (let i = 0; i < config.modules.length; i++) {
      const module = config.modules[i];
      console.log(
        `\n📝 [${i + 1}/${config.modules.length}] Processing: ${module.name}`,
      );
      console.log("─────────────────────────────────────────────────────────");

      // Use wizard paths instead of config paths
      const result = await processBatchModule(
        module,
        backendPath,
        frontendPath,
        genBackend,
        genFrontend,
      );
      results.push(result);

      if (result.success) {
        console.log(`✅ ${module.name} generated successfully`);
        if (result.backend)
          console.log(
            `   Backend: ${Object.values(result.backend).join(", ")}`,
          );
        if (result.frontend)
          console.log(
            `   Frontend: ${Object.values(result.frontend).join(", ")}`,
          );
      } else {
        console.log(`❌ ${module.name} generation failed:`);
        result.errors.forEach((err) => console.log(`   • ${err}`));
      }

      if (result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings:`);
        result.warnings.forEach((warn) => console.log(`   • ${warn}`));
      }
    }

    // Display summary
    displayCompletionBanner();
    console.log("📊 Batch Generation Summary:");
    console.log("─────────────────────────────────────────────────────────");

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(`Total modules: ${config.modules.length}`);
    console.log(`✅ Successful: ${successCount}`);
    if (failureCount > 0) console.log(`❌ Failed: ${failureCount}`);
    console.log("\nGenerated modules:");

    results.forEach((result) => {
      const status = result.success ? "✓" : "✗";
      console.log(`   [${status}] ${result.name}`);
      if (result.errors.length > 0) {
        result.errors.forEach((err) => console.log(`       └─ ${err}`));
      }
    });

    console.log("\n");

    const { continueLoop } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueLoop",
        message: "Return to main menu?",
        default: true,
      },
    ]);

    if (continueLoop) {
      await mainMenu();
    } else {
      console.log("\nGoodbye! 👋\n");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

/**
 * Example JSON configuration generator
 */
async function generateExampleConfig() {
  const exampleConfig = {
    backendPath: "../Backend",
    frontendPath: "../Frontend",
    modules: [
      {
        name: "Product",
        fields: [
          {
            name: "title",
            type: "string",
            description: "Product title",
            showInTable: true,
          },
          {
            name: "description",
            type: "textarea",
            description: "Product description",
            showInTable: false,
          },
          {
            name: "price",
            type: "decimal",
            description: "Product price",
            showInTable: true,
          },
          {
            name: "stock",
            type: "integer",
            description: "Stock quantity",
            showInTable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            description: "Is product active",
            showInTable: true,
          },
        ],
        relationships: [
          {
            type: "belongsTo",
            relatedModel: "Category",
            methodName: "category",
            foreignKey: "category_id",
            inverseMethod: "products",
            inverseType: "hasMany",
          },
        ],
      },
      {
        name: "Category",
        fields: [
          {
            name: "name",
            type: "string",
            description: "Category name",
            showInTable: true,
          },
          {
            name: "slug",
            type: "string",
            description: "URL slug",
            showInTable: true,
          },
        ],
      },
    ],
  };

  const examplePath = path.join(process.cwd(), "batch-config-example.json");
  try {
    await fs.writeFile(
      examplePath,
      JSON.stringify(exampleConfig, null, 2),
      "utf8",
    );
    console.log(`\n✅ Example configuration created: ${examplePath}\n`);
  } catch (error) {
    console.error(`\n❌ Error creating example: ${error.message}\n`);
  }
}

async function mainMenu() {
  displayBanner();

  try {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "✨ Create new module", value: "create" },
          { name: "📦 Batch mode (from JSON file)", value: "batch" },
          { name: "🤖 AI & ClickUp mode", value: "ai-clickup" },
          { name: "📋 Generate example config", value: "example" },
          { name: "🗑️  Delete module", value: "delete" },
          { name: "❌ Exit", value: "exit" },
        ],
      },
    ]);

    if (action === "exit") {
      console.log("\nGoodbye! 👋\n");
      process.exit(0);
    } else if (action === "create") {
      await wizard();
    } else if (action === "batch") {
      await batchModeWizard();
    } else if (action === "ai-clickup") {
      await aiClickUpModeWizard();
    } else if (action === "example") {
      await generateExampleConfig();
      await mainMenu();
    } else if (action === "delete") {
      await deleteModuleWizard();
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

/**
 * Wizard for deleting a module
 */
async function deleteModuleWizard() {
  console.log("\n📝 Module Deletion Wizard");
  console.log("─────────────────────────────────────────────────────────");

  try {
    const { backendPath, frontendPath } = await inquirer.prompt([
      {
        type: "input",
        name: "backendPath",
        message: "Backend path (e.g., ../Backend):",
        default: "../Backend",
        validate: validatePath,
      },
      {
        type: "input",
        name: "frontendPath",
        message: "Frontend path (e.g., ../Frontend):",
        default: "../Frontend",
        validate: validatePath,
      },
    ]);

    const backendValid = await checkBackendAppExists(backendPath);
    const frontendValid = await checkFrontendSrcExists(frontendPath);

    const { moduleName } = await inquirer.prompt([
      {
        type: "input",
        name: "moduleName",
        message: "Module name to delete (e.g., Product):",
        validate: validateModelName,
      },
    ]);

    const deleteOptions = [];
    if (backendValid) deleteOptions.push("Backend only");
    if (frontendValid) deleteOptions.push("Frontend only");
    if (backendValid && frontendValid)
      deleteOptions.push("Both (Backend + Frontend)");

    const { deleteWhat } = await inquirer.prompt([
      {
        type: "list",
        name: "deleteWhat",
        message: "What would you like to delete?",
        choices: deleteOptions,
        default: 2,
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `⚠️  Are you sure you want to delete "${moduleName}"? This cannot be undone!`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log("\n❌ Deletion cancelled.\n");
      return;
    }

    const deleteBackend = deleteWhat.includes("Backend");
    const deleteFrontend = deleteWhat.includes("Frontend");

    await deleteModule(
      backendPath,
      frontendPath,
      moduleName,
      deleteBackend,
      deleteFrontend,
    );

    const { again } = await inquirer.prompt([
      {
        type: "confirm",
        name: "again",
        message: "Would you like to perform another action?",
        default: true,
      },
    ]);

    if (again) {
      await mainMenu();
    } else {
      console.log("\nGoodbye! 👋\n");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

async function wizard() {
  try {
    // STEP 1: Ask for paths
    console.log("\n📝 Step 1: Path Configuration");
    console.log("─────────────────────────────────────────────────────────");

    const { backendPath, frontendPath } = await inquirer.prompt([
      {
        type: "input",
        name: "backendPath",
        message: "Backend path (e.g., ../Backend):",
        default: "../Backend",
        validate: validatePath,
      },
      {
        type: "input",
        name: "frontendPath",
        message: "Frontend path (e.g., ../Frontend):",
        default: "../Frontend",
        validate: validatePath,
      },
    ]);

    const backendValid = await checkBackendAppExists(backendPath);
    const frontendValid = await checkFrontendSrcExists(frontendPath);

    if (!backendValid)
      console.log(`   ⚠️  Backend app directory not found at ${backendPath}`);
    if (!frontendValid)
      console.log(`   ⚠️  Frontend src directory not found at ${frontendPath}`);

    if (!backendValid && !frontendValid) {
      console.log("   ❌ Neither backend nor frontend paths are valid!");
      process.exit(1);
    }

    // STEP 2: Ask what to generate
    console.log("\n📝 Step 2: Generation Options");
    console.log("─────────────────────────────────────────────────────────");

    const generationChoices = [];
    if (backendValid) generationChoices.push("Backend Only");
    if (frontendValid) generationChoices.push("Frontend Only");
    if (backendValid && frontendValid)
      generationChoices.push("Both (Backend + Frontend)");

    const { generateWhat } = await inquirer.prompt([
      {
        type: "list",
        name: "generateWhat",
        message: "What would you like to generate?",
        choices: generationChoices,
        default: 0,
      },
    ]);

    const genBackend = generateWhat.includes("Backend");
    const genFrontend = generateWhat.includes("Frontend");

    // STEP 3: Module name
    console.log("\n📝 Step 3: Module Name");
    console.log("─────────────────────────────────────────────────────────");

    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Module name (e.g., Product, User):",
        validate: validateModelName,
      },
    ]);

    const namekebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const nameLower = name.toLowerCase();

    // STEP 4: Fields
    console.log("\n📝 Step 4: Fields");
    console.log("─────────────────────────────────────────────────────────");

    const { numFields } = await inquirer.prompt([
      {
        type: "number",
        name: "numFields",
        message: "How many fields?",
        default: 2,
        validate: (value) => {
          if (value < 1) return "Must have at least 1 field.";
          if (!Number.isInteger(value))
            return "Please enter a valid whole number.";
          return true;
        },
      },
    ]);

    const fieldTypeOptions = Object.keys(FIELD_TYPES);
    let backendFillable = [];
    let backendValidations = [];
    let frontendFields = [];

    for (let i = 0; i < numFields; i++) {
      console.log(`\n   Field ${i + 1}:`);

      const { fieldName } = await inquirer.prompt([
        {
          type: "input",
          name: "fieldName",
          message: "Field name:",
          validate: validateFieldName,
        },
      ]);

      const { fieldType } = await inquirer.prompt([
        {
          type: "list",
          name: "fieldType",
          message: "Field type:",
          choices: fieldTypeOptions,
          default: "string",
          pageSize: 15,
          loop: false,
        },
      ]);

      const fieldInfo = FIELD_TYPES[fieldType];

      backendFillable.push(fieldName);
      backendValidations.push({
        name: fieldName,
        type: fieldType,
        rule: fieldInfo.validation,
        updateRule: fieldInfo.updateValidation,
        testValue: fieldInfo.testValue,
        updateValue: fieldInfo.updateValue,
      });

      if (genFrontend) {
        const { showInTable } = await inquirer.prompt([
          {
            type: "confirm",
            name: "showInTable",
            message: "Show in table?",
            default: fieldInfo.tableDisplay !== "hidden",
          },
        ]);

        const { description } = await inquirer.prompt([
          {
            type: "input",
            name: "description",
            message: "Field description (optional):",
            default: "",
          },
        ]);

        let options = null;
        let isMultiple = false;
        let isDynamic = false;
        let moduleName = null;
        let optionLabel = "name";
        let optionValue = null;

        if (fieldInfo.hasOptions) {
          const { optionsType } = await inquirer.prompt([
            {
              type: "list",
              name: "optionsType",
              message: "Options type:",
              choices: ["Static options", "Dynamic (from API/Module)"],
              default: "Static options",
            },
          ]);

          if (optionsType === "Static options") {
            const { numOptions } = await inquirer.prompt([
              {
                type: "number",
                name: "numOptions",
                message: "How many options?",
                default: 2,
                validate: (value) => {
                  if (value < 1) return "Must have at least 1 option.";
                  if (!Number.isInteger(value))
                    return "Please enter a valid whole number.";
                  return true;
                },
              },
            ]);

            options = [];
            for (let j = 0; j < numOptions; j++) {
              const { optionId, optionName } = await inquirer.prompt([
                {
                  type: "input",
                  name: "optionId",
                  message: `Option ${j + 1} ID:`,
                  default: `option${j + 1}`,
                },
                {
                  type: "input",
                  name: "optionName",
                  message: `Option ${j + 1} Name:`,
                  default: `Option ${j + 1}`,
                },
              ]);
              options.push({ id: optionId, name: optionName });
            }
          } else {
            isDynamic = true;
            const dynamicConfig = await inquirer.prompt([
              {
                type: "input",
                name: "customType",
                message: "Type property value (e.g., options, user-select):",
                default: "options",
              },
              {
                type: "input",
                name: "module",
                message: "Module/API name:",
                validate: validateModelName,
              },
              {
                type: "input",
                name: "optionLabel",
                message: "Option label field:",
                default: "name",
              },
              {
                type: "input",
                name: "optionValue",
                message: 'Option value field (leave empty for "id"):',
                default: "",
              },
            ]);

            moduleName = dynamicConfig.module;
            optionLabel = dynamicConfig.optionLabel.trim();
            optionValue = dynamicConfig.optionValue.trim() || null;
            fieldInfo.formType = dynamicConfig.customType.trim();
          }

          const { multiple } = await inquirer.prompt([
            {
              type: "confirm",
              name: "multiple",
              message: "Allow multiple selection?",
              default: false,
            },
          ]);
          isMultiple = multiple;
        }

        frontendFields.push({
          name: fieldName,
          type: fieldType,
          formType: fieldInfo.formType,
          rules: fieldInfo.validation,
          col: fieldInfo.col,
          showInTable: showInTable,
          tableDisplay: fieldInfo.tableDisplay,
          description: description,
          options: options,
          isDynamic: isDynamic,
          moduleName: moduleName,
          optionLabel: optionLabel,
          optionValue: optionValue,
          multiple: isMultiple,
        });
      }

      console.log(`      ✓ Added: ${fieldName}`);
    }

    // STEP 5: Relationships
    let relationships = [];
    let modelsToCreate = [];
    const isUpdate = false; // fullstack-generator always creates new modules

    if (genBackend) {
      console.log("\n📝 Step 5: Relationships");
      console.log("─────────────────────────────────────────────────────────");
      console.log("   ✅ belongsTo    - Many-to-One (stores foreign key)");
      console.log("   ✅ hasOne       - One-to-One (referenced or embedded)");
      console.log(
        "   ✅ hasMany      - One-to-Many (foreign key in related model)",
      );
      console.log("   ✅ belongsToMany- Many-to-Many (array of IDs, NO pivot)");

      const { addRelationships } = await inquirer.prompt([
        {
          type: "confirm",
          name: "addRelationships",
          message: "Add relationships?",
          default: false,
        },
      ]);

      if (addRelationships) {
        const { numRelations } = await inquirer.prompt([
          {
            type: "number",
            name: "numRelations",
            message: "How many relationships?",
            default: 0,
            validate: (value) => value >= 0 || "Please enter a valid number",
          },
        ]);

        const relationshipTypeOptions = [
          "belongsTo",
          "hasOne",
          "hasMany",
          "belongsToMany",
        ];

        for (let i = 0; i < numRelations; i++) {
          console.log(`\n   Relationship ${i + 1}:`);

          const relAnswers = await inquirer.prompt([
            {
              type: "list",
              name: "relationType",
              message: "Type:",
              choices: relationshipTypeOptions,
              pageSize: 10,
              loop: false,
            },
            {
              type: "input",
              name: "relatedModel",
              message: "Related model name:",
              validate: validateModelName,
            },
          ]);

          const relationType = relAnswers.relationType;
          const relatedModel = relAnswers.relatedModel;

          const relatedModelExists = await checkBackendModelExists(
            backendPath,
            relatedModel,
          );
          let createRelatedModel = false;

          if (!relatedModelExists) {
            console.log(
              `      ⚠️  Warning: ${relatedModel} model doesn't exist yet!`,
            );

            const { createChoice } = await inquirer.prompt([
              {
                type: "confirm",
                name: "createChoice",
                message: `Auto-create ${relatedModel} module?`,
                default: true,
              },
            ]);

            if (createChoice) {
              createRelatedModel = true;
              console.log(`      ✓ Will create ${relatedModel} model`);
            } else {
              const { continueAnyway } = await inquirer.prompt([
                {
                  type: "confirm",
                  name: "continueAnyway",
                  message: "Continue anyway?",
                  default: false,
                },
              ]);

              if (!continueAnyway) {
                console.log(
                  `      ⏭️  Skipped relationship with ${relatedModel}`,
                );
                continue;
              }
            }
          }

          const { methodName } = await inquirer.prompt([
            {
              type: "input",
              name: "methodName",
              message: "Method name:",
              default: relatedModel.toLowerCase(),
            },
          ]);

          const relationInfo = RELATIONSHIP_TYPES[relationType];

          if (!relationInfo) {
            console.log(`      ⚠️  Unknown type: ${relationType}, skipping...`);
            continue;
          }

          let foreignKeyName = null;
          let localKey = null;
          let inverseMethodName = null;
          let addInverseRelationship = false;

          if (relationType === "belongsTo") {
            const defaultFK = `${relatedModel.toLowerCase()}_id`;
            const { foreignKey } = await inquirer.prompt([
              {
                type: "input",
                name: "foreignKey",
                message: "Foreign key field:",
                default: defaultFK,
              },
            ]);
            foreignKeyName = foreignKey;

            if (!isUpdate) {
              backendFillable.push(foreignKeyName);
              backendValidations.push({
                name: foreignKeyName,
                type: "string",
                rule: "required|string",
                updateRule: "required|string",
                testValue: '"507f1f77bcf86cd799439011"',
                updateValue: '"507f1f77bcf86cd799439012"',
              });
            }

            console.log(`      ✓ Field: ${foreignKeyName} (string)`);

            if (relatedModelExists || createRelatedModel) {
              const { addInverse } = await inquirer.prompt([
                {
                  type: "confirm",
                  name: "addInverse",
                  message: `Add inverse hasMany to ${relatedModel}?`,
                  default: false,
                },
              ]);

              if (addInverse) {
                addInverseRelationship = true;
                const defaultInverse = name.toLowerCase() + "s";

                const { inverseMethod } = await inquirer.prompt([
                  {
                    type: "input",
                    name: "inverseMethod",
                    message: `Method name in ${relatedModel}:`,
                    default: defaultInverse,
                  },
                ]);
                inverseMethodName = inverseMethod;
              }
            }
          } else if (relationType === "belongsToMany") {
            console.log(
              `      ℹ️  MongoDB uses array of IDs (no pivot table needed)`,
            );
            const defaultArrayField = `${relatedModel.toLowerCase()}_ids`;
            const { arrayField } = await inquirer.prompt([
              {
                type: "input",
                name: "arrayField",
                message: "Array field name:",
                default: defaultArrayField,
              },
            ]);
            foreignKeyName = arrayField;

            if (!isUpdate) {
              backendFillable.push(arrayField);
              backendValidations.push({
                name: arrayField,
                type: "array",
                rule: "nullable|array",
                updateRule: "nullable|array",
                testValue:
                  "['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']",
                updateValue:
                  "['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014']",
              });
            }

            console.log(`      ✓ Field: ${arrayField} (array)`);

            let inverseField = null;
            // Always ask for inverse for belongsToMany, even if model doesn't exist yet
            const { addInverse } = await inquirer.prompt([
              {
                type: "confirm",
                name: "addInverse",
                message: `Add inverse belongsToMany to ${relatedModel}?`,
                default: false,
              },
            ]);

            if (addInverse) {
              addInverseRelationship = true;
              const defaultInverse = name.toLowerCase() + "s";

              const inverseAnswers = await inquirer.prompt([
                {
                  type: "input",
                  name: "inverseMethod",
                  message: `Method name in ${relatedModel}:`,
                  default: defaultInverse,
                },
                {
                  type: "input",
                  name: "inverseField",
                  message: "Array field name in related model:",
                  default: `${name.toLowerCase()}_ids`,
                },
              ]);

              inverseMethodName = inverseAnswers.inverseMethod;
              inverseField = inverseAnswers.inverseField;

              if (createRelatedModel) {
                let model = modelsToCreate.find((m) => m.name === relatedModel);
                if (!model) {
                  model = {
                    name: relatedModel,
                    fields: [
                      {
                        name: inverseField,
                        type: "array",
                      },
                    ],
                    relationships: [],
                    relatedModels: [name],
                  };
                  modelsToCreate.push(model);
                } else {
                  if (!model.fields.find((f) => f.name === inverseField)) {
                    model.fields.push({
                      name: inverseField,
                      type: "array",
                    });
                  }
                }
              }
            }

            const { syncChoice } = await inquirer.prompt([
              {
                type: "list",
                name: "syncChoice",
                message:
                  "Which Repository should manage this relationship (attach/detach)?",
                choices: [`${name} Repository`, `${relatedModel} Repository`],
                default: `${name} Repository`,
                loop: false,
              },
            ]);

            let addSyncMethods = false;
            let addInverseSyncMethods = false;

            if (syncChoice === `${name} Repository`) {
              addSyncMethods = true;
              addInverseSyncMethods = false;
              console.log(
                `      ✓ ${name} Repository will manage the relationship`,
              );
            } else {
              addSyncMethods = false;
              addInverseSyncMethods = true;
              console.log(
                `      ✓ ${relatedModel} Repository will manage the relationship`,
              );
            }

            localKey = {
              inverseField: inverseField || `${name.toLowerCase()}_ids`,
              addSyncMethods: addSyncMethods,
              addInverseSyncMethods: addInverseSyncMethods,
            };

            if (createRelatedModel && addInverseSyncMethods) {
              let model = modelsToCreate.find((m) => m.name === relatedModel);
              if (model) {
                model.addSyncMethods = true;
              }
            }
          }

          relationships.push({
            type: relationType,
            relatedModel: relatedModel,
            methodName: methodName,
            foreignKey: foreignKeyName,
            localKey: localKey,
            embedded: relationInfo.embedded || false,
            createModel: createRelatedModel,
            inverseMethod: inverseMethodName,
            addInverse: addInverseRelationship,
            inverseType: relationInfo.inverse,
          });

          console.log(`      ✓ Added: ${methodName} (${relationType})`);
        }
      }
    }

    // STEP 6: Create missing models
    if (modelsToCreate.length > 0) {
      console.log(`\n📝 Step 6: Creating Related Models`);
      console.log("─────────────────────────────────────────────────────────");

      for (const modelName of modelsToCreate) {
        console.log(`\n   Creating module for ${modelName}...`);

        const modelNamekebab = modelName
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .toLowerCase();
        const modelNameFillable = ["name"];

        try {
          await createBackendFile(
            "Model",
            backendPath,
            "model.txt",
            modelName,
            modelNamekebab,
            modelNameFillable,
          );
          console.log(`      ✓ Model created`);

          await createBackendFile(
            "Repository",
            backendPath,
            "repositories.txt",
            modelName,
            modelNamekebab,
            modelNameFillable,
          );
          console.log(`      ✓ Repository created`);

          await createBackendFile(
            "Service",
            backendPath,
            "services.txt",
            modelName,
            modelNamekebab,
            modelNameFillable,
            [
              {
                name: "name",
                rule: "required|string|max:255",
                updateRule: "required|string|max:255",
              },
            ],
          );
          console.log(`      ✓ Service created`);

          await createBackendFile(
            "Controller",
            backendPath,
            "controller.txt",
            modelName,
            modelNamekebab,
            modelNameFillable,
          );
          console.log(`      ✓ Controller created`);

          await registerBackendRoute(backendPath, modelName);
          console.log(`      ✓ Route registered`);
        } catch (err) {
          console.log(`      ❌ Error: ${err.message}`);
        }
      }
    }

    // STEP 7: Generate main module
    console.log(
      `\n📝 Step ${modelsToCreate.length > 0 ? "7" : "6"}: Generating Module`,
    );
    console.log("─────────────────────────────────────────────────────────");

    if (genBackend) {
      try {
        await createBackendFile(
          "Model",
          backendPath,
          "model.txt",
          name,
          namekebab,
          backendFillable,
          [],
          relationships,
        );
        console.log("   ✓ Model created");

        await createBackendFile(
          "Repository",
          backendPath,
          "repositories.txt",
          name,
          namekebab,
          backendFillable,
          [],
          relationships,
        );
        console.log("   ✓ Repository created");

        await createBackendFile(
          "Service",
          backendPath,
          "services.txt",
          name,
          namekebab,
          backendFillable,
          backendValidations,
        );
        console.log("   ✓ Service created");

        await createBackendFile(
          "Controller",
          backendPath,
          "controller.txt",
          name,
          namekebab,
          backendFillable,
        );
        console.log("   ✓ Controller created");

        await createBackendFile(
          "Routes",
          backendPath,
          "route.txt",
          name,
          namekebab,
          backendFillable,
        );
        console.log("   ✓ Routes created");

        await createBackendFile(
          "ControllerTest",
          backendPath,
          "test.txt",
          name,
          namekebab,
          backendFillable,
          backendValidations,
        );
        console.log("   ✓ Test created");

        await registerBackendRoute(backendPath, name);
        console.log("   ✓ Route registered");

        // Add inverse relationships
        const hasInverseRelationships =
          relationships.filter((r) => r.addInverse && r.inverseMethod).length >
          0;

        if (hasInverseRelationships) {
          console.log(`\n   Adding Inverse Relationships...`);

          for (const rel of relationships) {
            if (rel.addInverse && rel.inverseMethod) {
              const relatedModelExists = await checkBackendModelExists(
                backendPath,
                rel.relatedModel,
              );

              if (!relatedModelExists) {
                console.log(`   ❌ Model ${rel.relatedModel} not found!`);
                continue;
              }

              const inverseType =
                rel.inverseType || RELATIONSHIP_TYPES[rel.type]?.inverse;
              if (!inverseType) {
                console.log(`   ⚠️  No inverse type defined for ${rel.type}`);
                continue;
              }

              const inverseRel = {
                type: inverseType,
                relatedModel: name,
                methodName: rel.inverseMethod,
                foreignKey:
                  rel.type === "belongsToMany"
                    ? rel.localKey?.inverseField
                    : rel.foreignKey,
                localKey:
                  rel.type === "belongsToMany"
                    ? { inverseField: rel.foreignKey }
                    : null,
                embedded: false,
              };

              const inverseCode = generateSingleRelationship(inverseRel);

              try {
                await addRelationshipToModel(
                  backendPath,
                  rel.relatedModel,
                  {
                    name: rel.inverseMethod,
                    code: inverseCode,
                  },
                  name,
                );
              } catch (error) {
                console.log(
                  `   ❌ Error adding relationship: ${error.message}`,
                );
              }
            }
          }
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }
    }

    if (genFrontend) {
      try {
        await createFrontendFile(
          "API",
          frontendPath,
          "api.txt",
          name,
          namekebab,
          nameLower,
          frontendFields,
        );
        console.log("   ✓ API file created");

        await createFrontendFile(
          "Page",
          frontendPath,
          "page.txt",
          name,
          namekebab,
          nameLower,
          frontendFields,
        );
        console.log("   ✓ Page component created");

        await createFrontendFile(
          "Router",
          frontendPath,
          "router.txt",
          name,
          namekebab,
          nameLower,
          frontendFields,
        );
        console.log("   ✓ Router file created");

        await updateFrontendRouterIndex(frontendPath, name);
        console.log("   ✓ Router index updated");

        const translations = generateTranslations(nameLower, frontendFields);
        console.log("\n📝 Translation Keys (add to your i18n file):");
        console.log(
          "─────────────────────────────────────────────────────────",
        );
        console.log(JSON.stringify(translations, null, 2));
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }
    }

    displayCompletionBanner();

    console.log("📊 Summary:");
    console.log(`   Module: ${name}`);
    console.log(`   Route: /${namekebab}`);
    if (genBackend) {
      console.log(`   Backend Fields: ${backendFillable.length}`);
      console.log(`   Relationships: ${relationships.length}`);
    }
    if (genFrontend) {
      console.log(`   Frontend Fields: ${frontendFields.length}`);
    }
    console.log("\n");

    const { continueLoop } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueLoop",
        message: "Would you like to perform another action?",
        default: true,
      },
    ]);

    if (continueLoop) {
      await mainMenu();
    } else {
      console.log("\nGoodbye! 👋\n");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

mainMenu().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
