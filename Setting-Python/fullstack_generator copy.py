import os
import sys
import json
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any, Union
import inquirer
import shutil

# ============================================================================
# FIELD TYPES - Combined with comprehensive validation
# ============================================================================
FIELD_TYPES = {
    "string": {
        "formType": "text",
        "validation": "required|string|max:255",
        "updateValidation": "required|string|max:255",
        "tableDisplay": "text",
        "testValue": '"Sample text"',
        "updateValue": '"Updated sample text"',
        "col": 6,
    },
    "email": {
        "formType": "text",
        "validation": "required|email|unique:@@table@@,email",
        "updateValidation": "required|email|unique:@@table@@,email,{$id}",
        "tableDisplay": "text",
        "testValue": '"test@example.com"',
        "updateValue": '"updated@example.com"',
        "col": 6,
    },
    "password": {
        "formType": "password",
        "validation": "required|min:8",
        "updateValidation": "nullable|min:8",
        "tableDisplay": "hidden",
        "testValue": '"password123"',
        "updateValue": '"newpassword123"',
        "col": 6,
    },
    "phone": {
        "formType": "text",
        "validation": "required|regex:/^([0-9\\s\\-\\+\\(\\)]*)$/|min:10|max:20",
        "updateValidation": "required|regex:/^([0-9\\s\\-\\+\\(\\)]*)$/|min:10|max:20",
        "tableDisplay": "text",
        "testValue": '"+1234567890"',
        "updateValue": '"+9876543210"',
        "col": 6,
    },
    "url": {
        "formType": "text",
        "validation": "required|url|max:500",
        "updateValidation": "required|url|max:500",
        "tableDisplay": "text",
        "testValue": '"https://example.com"',
        "updateValue": '"https://updated.example.com"',
        "col": 6,
    },
    "number": {
        "formType": "number",
        "validation": "required|integer|min:0",
        "updateValidation": "required|integer|min:0",
        "tableDisplay": "number",
        "testValue": "42",
        "updateValue": "52",
        "col": 6,
    },
    "integer": {
        "formType": "number",
        "validation": "required|integer|min:0",
        "updateValidation": "required|integer|min:0",
        "tableDisplay": "number",
        "testValue": "42",
        "updateValue": "52",
        "col": 6,
    },
    "decimal": {
        "formType": "number",
        "validation": "required|numeric|min:0",
        "updateValidation": "required|numeric|min:0",
        "tableDisplay": "number",
        "testValue": "99.99",
        "updateValue": "109.99",
        "col": 6,
    },
    "date": {
        "formType": "date",
        "validation": "required|date",
        "updateValidation": "required|date",
        "tableDisplay": "date",
        "testValue": '"2024-01-01"',
        "updateValue": '"2024-12-31"',
        "col": 6,
    },
    "datetime": {
        "formType": "datetime",
        "validation": "required|date",
        "updateValidation": "required|date",
        "tableDisplay": "date",
        "testValue": '"2024-01-01 10:30:00"',
        "updateValue": '"2024-12-31 15:45:00"',
        "col": 6,
    },
    "boolean": {
        "formType": "checkbox",
        "validation": "required|boolean",
        "updateValidation": "required|boolean",
        "tableDisplay": "boolean",
        "testValue": "true",
        "updateValue": "false",
        "col": 6,
    },
    "checkbox": {
        "formType": "checkbox",
        "validation": "required",
        "updateValidation": "required",
        "tableDisplay": "boolean",
        "testValue": "true",
        "updateValue": "false",
        "col": 6,
    },
    "image": {
        "formType": "file",
        "validation": "nullable|image|mimes:jpeg,png,jpg,gif|max:2048",
        "updateValidation": "nullable|image|mimes:jpeg,png,jpg,gif|max:2048",
        "tableDisplay": "image",
        "testValue": "null",
        "updateValue": "null",
        "col": 6,
    },
    "file": {
        "formType": "file",
        "validation": "nullable|file|mimes:pdf,doc,docx|max:5120",
        "updateValidation": "nullable|file|mimes:pdf,doc,docx|max:5120",
        "tableDisplay": "file",
        "testValue": "null",
        "updateValue": "null",
        "col": 6,
    },
    "array": {
        "formType": "options",
        "validation": "required|array",
        "updateValidation": "required|array",
        "tableDisplay": "text",
        "testValue": "['item1', 'item2']",
        "updateValue": "['updated1', 'updated2', 'updated3']",
        "col": 6,
        "hasOptions": True,
    },
    "select": {
        "formType": "options",
        "validation": "required",
        "updateValidation": "required",
        "tableDisplay": "text",
        "testValue": '"option1"',
        "updateValue": '"option2"',
        "col": 6,
        "hasOptions": True,
    },
    "textarea": {
        "formType": "textarea",
        "validation": "required",
        "updateValidation": "required",
        "tableDisplay": "text",
        "testValue": '"Long text content"',
        "updateValue": '"Updated long text content"',
        "col": 12,
    },
    "json": {
        "formType": "textarea",
        "validation": "required|json",
        "updateValidation": "required|json",
        "tableDisplay": "text",
        "testValue": '\'{"key": "value"}\'',
        "updateValue": '\'{"key": "updated_value", "new_key": "new_value"}\'',
        "col": 12,
    },
    "text": {
        "formType": "textarea",
        "validation": "required|string",
        "updateValidation": "required|string",
        "tableDisplay": "text",
        "testValue": '"Long text content"',
        "updateValue": '"Updated long text content"',
        "col": 12,
    },
}

# ============================================================================
# RELATIONSHIP TYPES
# ============================================================================
RELATIONSHIP_TYPES = {
    "belongsTo": {
        "description": "Many-to-One (stores foreign key as string)",
        "method": "belongsTo",
        "inverse": "hasMany",
        "supported": True,
    },
    "hasOne": {
        "description": "One-to-One (referenced or embedded)",
        "method": "hasOne",
        "inverse": "belongsTo",
        "supported": True,
    },
    "hasMany": {
        "description": "One-to-Many (array of references)",
        "method": "hasMany",
        "inverse": "belongsTo",
        "supported": True,
    },
    "belongsToMany": {
        "description": "Many-to-Many (array of IDs, no pivot table)",
        "method": "belongsToMany",
        "inverse": "belongsToMany",
        "supported": True,
    },
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def display_banner():
    print("\n╔══════════════════════════════════════════════════════════════════╗")
    print("║  🚀 Full Stack Module Generator (Complete Edition)              ║")
    print("║     Backend: MongoDB + Jenssegers | Frontend: Vue 3             ║")
    print("║     With Relationships, Auto-Models, and Update Support         ║")
    print("╚══════════════════════════════════════════════════════════════════╝\n")

def display_completion_banner():
    print("\n╔══════════════════════════════════════════════════════════════════╗")
    print("║   ✅ Full Stack Module Generation Complete!                     ║")
    print("╚══════════════════════════════════════════════════════════════════╝\n")

def validate_path(input_value: str) -> Union[bool, str]:
    trimmed = input_value.strip()
    if len(trimmed) == 0:
        return "Path cannot be empty."
    return True

def validate_model_name(input_value: str) -> Union[bool, str]:
    trimmed = input_value.strip()
    if len(trimmed) == 0:
        return "Model name cannot be empty."
    if trimmed.isdigit():
        return "Model name cannot be a number."
    if trimmed[0].isdigit():
        return "Model name cannot start with a number."
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9]*$", trimmed):
        return "Model name must contain only letters and numbers."
    return True

def validate_field_name(input_value: str) -> Union[bool, str]:
    trimmed = input_value.strip()
    if len(trimmed) == 0:
        return "Field name cannot be empty."
    if trimmed.isdigit():
        return "Field name cannot be a number."
    if trimmed[0].isdigit():
        return "Field name cannot start with a number."
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9_]*$", trimmed):
        return "Field name must contain only letters, numbers, and underscores."
    return True

def check_backend_app_exists(backend_path: str) -> bool:
    try:
        return (Path(backend_path) / "app").is_dir()
    except:
        return False

def check_frontend_src_exists(frontend_path: str) -> bool:
    try:
        return (Path(frontend_path) / "src").is_dir()
    except:
        return False

def check_backend_model_exists(backend_path: str, model_name: str) -> bool:
    try:
        model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
        return model_path.exists()
    except:
        return False

def file_exists(file_path: str) -> bool:
    try:
        return Path(file_path).exists()
    except:
        return False

# ============================================================================
# MODEL MANIPULATION
# ============================================================================

def get_existing_fields(backend_path: str, model_name: str) -> List[str]:
    try:
        model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
        content = model_path.read_text(encoding="utf-8")
        
        fillable_match = re.search(r'protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];', content)
        
        if fillable_match:
            fillable_content = fillable_match.group(1)
            fields = [
                f.strip().strip("'\"")
                for f in fillable_content.split(",")
                if f.strip()
            ]
            return fields
        return []
    except:
        return []

def add_field_to_model(backend_path: str, model_name: str, field_name: str) -> bool:
    try:
        model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
        content = model_path.read_text(encoding="utf-8")
        
        fillable_match = re.search(r'protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];', content)
        if not fillable_match:
            return False
        
        fillable_content = fillable_match.group(1)
        if f"'{field_name}'" in fillable_content or f'"{field_name}"' in fillable_content:
            return False
        
        trimmed_content = fillable_content.strip()
        new_field = f"'{field_name}'"
        
        if len(trimmed_content) == 0:
            new_fillable_content = new_field
        else:
            new_fillable_content = trimmed_content + f",\n        {new_field}"
        
        new_content = re.sub(
            r'protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];',
            f'protected $fillable = [\n        {new_fillable_content}\n    ];',
            content
        )
        
        model_path.write_text(new_content, encoding="utf-8")
        return True
    except:
        return False

def register_backend_route(backend_path: str, model_name: str) -> bool:
    try:
        indexPath = Path(backend_path) / "routes" / "API" / "index.php"
        if not file_exists(str(indexPath)):
            return False
        
        content = indexPath.read_text(encoding="utf-8")
        route_include = f"@include('Modules/{model_name}/{model_name}Routes.php');"
        
        if route_include in content:
            return False
        
        php_tag_index = content.find("<?php")
        if php_tag_index == -1:
            return False
        
        insert_position = php_tag_index + 5
        new_content = (
            content[:insert_position] + "\n" + route_include + content[insert_position:]
        )
        
        indexPath.write_text(new_content, encoding="utf-8")
        return True
    except:
        return False

def update_frontend_router_index(frontend_path: str, name: str) -> bool:
    try:
        indexPath = Path(frontend_path) / "src" / "router" / "index.ts"
        if not file_exists(str(indexPath)):
            return False
        
        content = indexPath.read_text(encoding="utf-8")
        import_statement = f'import {name} from "@/router/modules/{name}/{name}";'
        
        if import_statement not in content:
            import_regex = r'import\s+\w+\s+from\s+["\']@/router/modules/[^"\']+["\'];'
            imports = re.findall(import_regex, content)
            
            if imports:
                last_import = imports[-1]
                last_import_index = content.rfind(last_import)
                insert_position = last_import_index + len(last_import)
                content = (
                    content[:insert_position] + "\n" + import_statement + content[insert_position:]
                )
        
        route_statement = f"      ...{name},"
        if f"...{name}" not in content:
            children_match = re.search(r'children:\s*\[', content)
            if children_match:
                children_index = children_match.start() + len(children_match.group())
                content = (
                    content[:children_index] + "\n" + route_statement + content[children_index:]
                )
        
        indexPath.write_text(content, encoding="utf-8")
        return True
    except:
        return False

# ============================================================================
# FIELD GENERATION
# ============================================================================

def generate_table_columns(fields: List[Dict], name_lower: str) -> str:
    columns = []
    for f in fields:
        if not f.get("showInTable", True):
            continue
            
        if f.get("tableDisplay") == "boolean":
            columns.append(
                f'      {{ id: "{f["name"]}", title: this.$t("{name_lower}.{f["name"]}"), '
                f'data: "{f["name"]}", defaultContent: "N/A", render: (data) => data ? "✓" : "✗" }},'
            )
        elif f.get("tableDisplay") == "date":
            columns.append(
                f'      {{ id: "{f["name"]}", title: this.$t("{name_lower}.{f["name"]}"), '
                f'data: "{f["name"]}", defaultContent: "N/A", '
                f'render: (data) => new Date(data).toLocaleDateString() }},'
            )
        else:
            columns.append(
                f'      {{ id: "{f["name"]}", title: this.$t("{name_lower}.{f["name"]}"), '
                f'data: "{f["name"]}", defaultContent: "N/A" }},'
            )
    return "\n".join(columns)

def format_options_array(options: List[Dict]) -> str:
    if not options:
        return "[]"
    
    options_str = ",\n".join([
        f'          {{\n            id: "{opt["id"]}",\n            name: "{opt["name"]}"\n          }}'
        for opt in options
    ])
    return f"[\n{options_str}\n        ]"

def generate_form_fields(fields: List[Dict], name_lower: str) -> str:
    form_fields = []
    
    for f in fields:
        field_obj = f'      {{\n        name: "{f["name"]}",\n        label: this.$t("{name_lower}.{f["name"]}"),\n        type: "{f["formType"]}",\n        col: {f.get("col", 6)}'
        
        # Process rules
        if "rules" in f and f["rules"]:
            rules_array = f["rules"].split('|')
            
            if 'required' in rules_array:
                field_obj += ',\n        rules: "required"'
            elif 'nullable' in rules_array:
                field_obj += ',\n        rules: "nullable"'
            elif f["rules"].strip():
                field_obj += ',\n        rules: ""'
        
        if f.get("isDynamic"):
            field_obj += f',\n        options: "{f["moduleName"]}",\n        optionLabel: "{f["optionLabel"]}"'
            if f.get("optionValue"):
                field_obj += f',\n        optionValue: "{f["optionValue"]}"'
        elif f.get("options"):
            options_str = format_options_array(f["options"])
            field_obj += f',\n        options: {options_str},\n        optionLabel: "name"'
        
        if f.get("type") == "select" and f.get("multiple"):
            field_obj += ',\n        multiple: true'
        
        if f.get("description"):
            field_obj += f',\n        description: "{f["description"]}"'
        
        field_obj += "\n      }"
        form_fields.append(field_obj)
    
    return ",\n".join(form_fields)

def generate_translations(name_lower: str, fields: List[Dict]) -> Dict:
    translations = {
        name_lower: {
            name_lower: name_lower.capitalize()
        }
    }
    
    for f in fields:
        label = re.sub(r'([A-Z])', r' \1', f["name"].replace('_', ' '))
        label = ' '.join(word.capitalize() for word in label.split())
        translations[name_lower][f["name"]] = label
    
    return translations

# ============================================================================
# RELATIONSHIP GENERATION
# ============================================================================

def generate_belongs_to_many_repository_methods(relationships: List[Dict], model_name: str) -> str:
    belongs_to_many_rels = [
        r for r in relationships 
        if r["type"] == "belongsToMany" and r.get("localKey", {}).get("addSyncMethods") is True
    ]
    
    if not belongs_to_many_rels:
        return ""
    
    model_var = model_name.lower()
    methods = "\n"
    
    methods += f"""    /**
     * Create a new {model_name} with belongsToMany relationships
     * 
     * @param array|null $data
     * @return {model_name}
     */
    public function create($data = null)
    {{
        ${model_var} = parent::create($data);
"""
    
    for rel in belongs_to_many_rels:
        methods += f"""        if (isset($data['{rel["foreignKey"]}'])) {{
            ${model_var}->{rel["methodName"]}()->attach($data['{rel["foreignKey"]}'] ?? []);
        }}
"""
    
    methods += f"""        return ${model_var};
    }}
"""
    
    methods += f"""    /**
     * Update {model_name} with belongsToMany relationships
     * 
     * @param mixed $id
     * @param array|null $data
     * @return {model_name}
     */
    public function update($id, $data = null)
    {{
        ${model_var} = parent::update($id, $data);
"""
    
    for rel in belongs_to_many_rels:
        methods += f"""        if (isset($data['{rel["foreignKey"]}'])) {{
            ${model_var}->{rel["methodName"]}()->detach();
            ${model_var}->{rel["methodName"]}()->attach($data['{rel["foreignKey"]}']);
        }}
"""
    
    methods += f"""        return ${model_var};
    }}"""
    
    return methods

def generate_single_relationship(rel: Dict) -> str:
    rel_info = RELATIONSHIP_TYPES.get(rel["type"], {})
    
    code = f"""
    /**
     * {rel["type"]} relationship with {rel["relatedModel"]}"""
    
    if rel["type"] == "belongsToMany":
        code += f"""
     * MongoDB: '{rel["foreignKey"]}' in THIS model, '{rel.get("localKey", {{}}).get("inverseField", rel["relatedModel"].lower() + "_ids")}' in {rel["relatedModel"]}"""
    
    code += f"""
     */
    public function {rel["methodName"]}()
    {{"""
    
    if rel["type"] in ["hasOne", "hasMany"]:
        code += f"""
        return $this->{rel_info.get("method", rel["type"])}({rel["relatedModel"]}::class);
    }}"""
    elif rel["type"] == "belongsTo":
        code += f"""
        return $this->{rel_info.get("method", "belongsTo")}({rel["relatedModel"]}::class, '{rel["foreignKey"]}');
    }}"""
    elif rel["type"] == "belongsToMany":
        related_model_field = rel.get("localKey", {}).get("inverseField", f'{rel["relatedModel"].lower()}_ids')
        code += f"""
        // MongoDB: '{rel["foreignKey"]}' in THIS model, '{related_model_field}' in {rel["relatedModel"]}
        return $this->{rel_info.get("method", "belongsToMany")}({rel["relatedModel"]}::class, null, '{related_model_field}', '{rel["foreignKey"]}');
    }}"""
    else:
        code += f"""
        return $this->{rel_info.get("method", rel["type"])}({rel["relatedModel"]}::class, '{rel.get("foreignKey", "")}');
    }}"""
    
    code += "\n"
    return code

def generate_use_statements(relationships: List[Dict]) -> str:
    if not relationships:
        return ""
    
    related_models = list(set(r["relatedModel"] for r in relationships))
    use_statements = "\n".join([
        f"use App\\Models\\{model}\\{model};"
        for model in related_models
    ])
    
    return f"\n{use_statements}" if use_statements else ""

def generate_relationship_methods(relationships: List[Dict]) -> str:
    if not relationships:
        return ""
    
    methods = "\n    /**\n     * RELATIONSHIPS\n     */\n"
    
    for rel in relationships:
        methods += generate_single_relationship(rel)
    
    return methods

# ============================================================================
# FILE CREATION - FIXED PATHS
# ============================================================================

def create_backend_file(
    file_type: str,
    backend_path: str,
    template_file: str,
    name: str,
    namekebab: str,
    name_fillable: List[str],
    validations: Optional[List[Dict]] = None,
    relationships: Optional[List[Dict]] = None
) -> None:
    try:
        backend_path_obj = Path(backend_path)
        
        if file_type == "Model":
            new_path = backend_path_obj / "app" / "Models" / name
        elif file_type == "Repository":
            new_path = backend_path_obj / "app" / "Repositories" / "Eloquent" / name
        elif file_type == "Service":
            new_path = backend_path_obj / "app" / "Services" / "Eloquent" / name
        elif file_type == "ControllerTest":
            new_path = backend_path_obj / "tests" / "Unit" / name
        elif file_type == "Routes":
            new_path = backend_path_obj / "routes" / "API" / "Modules" / name
        else:
            new_path = backend_path_obj / "app" / "Http" / "Controllers" / name
        
        new_path.mkdir(parents=True, exist_ok=True)
        
        if file_type == "Model":
            file_name = f"{name}.php"
        elif file_type == "ControllerTest":
            file_name = f"{name}ControllerTest.php"
        elif file_type == "Routes":
            file_name = f"{name}Routes.php"
        else:
            file_name = f"{name}{file_type}.php"
        
        file_path = new_path / file_name
        
        # FIXED: Use backend_path to construct template path
        template_path = backend_path_obj / "generator-setting-backend" / template_file
        data = template_path.read_text(encoding="utf-8")
        
        # Format fillable array with quotes around each field name
        fillable_formatted = ", ".join([f"'{field}'" for field in name_fillable]) if name_fillable else ""
        
        text = data.replace("@@Name@@", name) \
                   .replace("@@Namekebab@@", namekebab) \
                   .replace("@@NameFillable@@", fillable_formatted)
        
        if file_type == "Model":
            use_statements = generate_use_statements(relationships) if relationships else ""
            relationship_methods = generate_relationship_methods(relationships) if relationships else ""
            text = text.replace("@@UseStatements@@", use_statements) \
                       .replace("@@Relationships@@", relationship_methods)
        
        if file_type == "Repository" and relationships:
            belongs_to_many_methods = generate_belongs_to_many_repository_methods(relationships, name)
            if belongs_to_many_methods:
                last_brace_index = text.rfind("}")
                if last_brace_index != -1:
                    text = text[:last_brace_index] + belongs_to_many_methods + "\n" + text[last_brace_index:]
        
        if file_type == "Service" and validations:
            store_rules = "\n".join([
                f"                '{v['name']}' => '{v['rule'].replace('@@table@@', namekebab + 's')}',"
                for v in validations
            ])
            
            update_rules = "\n".join([
                f"                '{v['name']}' => '{v['updateRule'].replace('@@table@@', namekebab + 's')}',"
                for v in validations
            ])
            
            text = text.replace("@@StoreValidation@@", store_rules) \
                       .replace("@@UpdateValidation@@", update_rules)
        
        if file_type == "ControllerTest" and validations:
            test_data_str = "\n".join([
                f"            '{v['name']}' => {v['testValue']},"
                for v in validations
            ])
            update_data_str = "\n".join([
                f"            '{v['name']}' => {v['updateValue']},"
                for v in validations
            ])
            fields_list = ", ".join([f"'{v['name']}'" for v in validations])
            
            text = text.replace("@@TestData@@", test_data_str) \
                       .replace("@@UpdateTestData@@", update_data_str) \
                       .replace("@@FieldsList@@", fields_list)
        
        file_path.write_text(text, encoding="utf-8")
    except Exception as err:
        print(f"❌ Error creating {file_type}: {err}")
        raise err

def create_frontend_file(
    file_type: str,
    frontend_path: str,
    template_file: str,
    name: str,
    namekebab: str,
    name_lower: str,
    fields: List[Dict]
) -> None:
    try:
        frontend_path_obj = Path(frontend_path)
        
        if file_type == "API":
            base_path = "src/API/"
        elif file_type == "Page":
            base_path = "src/views/Page/"
        elif file_type == "Router":
            base_path = "src/router/modules/"
        else:
            base_path = ""
        
        new_path = frontend_path_obj / base_path / name
        new_path.mkdir(parents=True, exist_ok=True)
        
        ext = ".vue" if file_type == "Page" else ".ts"
        file_path = new_path / f"{name}{ext}"
        
        # FIXED: Use frontend_path to construct template path
        template_path = frontend_path_obj / "generator-setting-frontend" / template_file
        template = template_path.read_text(encoding="utf-8")
        
        template = template.replace("@@Name@@", name) \
                           .replace("@@Namekebab@@", namekebab) \
                           .replace("@@name@@", name_lower)
        
        if file_type == "Page":
            table_columns = generate_table_columns(fields, name_lower)
            form_fields = generate_form_fields(fields, name_lower)
            
            template = template.replace("@@TableColumns@@", table_columns) \
                               .replace("@@FormFields@@", form_fields)
        
        file_path.write_text(template, encoding="utf-8")
    except Exception as err:
        print(f"❌ Error creating {file_type}: {err}")
        raise err

# ============================================================================
# HELPER FUNCTIONS - RELATIONSHIP MANAGEMENT
# ============================================================================

def add_use_statement_to_model(
    backend_path: str,
    model_name: str,
    related_model_name: str
) -> bool:
    model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
    
    try:
        content = model_path.read_text(encoding="utf-8")
        use_statement = f"use App\\Models\\{related_model_name}\\{related_model_name};"
        
        if use_statement in content:
            return True
        
        namespace_match = re.search(r'namespace\s+([^;]+);', content)
        if not namespace_match:
            print(f"   ⚠️  Could not find namespace in {model_name}")
            return False
        
        namespace_end_index = content.find(";", namespace_match.start()) + 1
        class_match = re.search(r'class\s+\w+', content)
        if not class_match:
            print(f"   ⚠️  Could not find class in {model_name}")
            return False
        
        class_start_index = class_match.start()
        between_content = content[namespace_end_index:class_start_index]
        import_use_statements = re.findall(r'use\s+[^;]*\\[^;]+;', between_content)
        
        insert_position: int
        if import_use_statements:
            last_use = import_use_statements[-1]
            last_use_index = content.find(last_use)
            insert_position = content.find(";", last_use_index) + 1
        else:
            insert_position = namespace_end_index
        
        before_use = content[:insert_position]
        after_use = content[insert_position:]
        new_content = before_use + "\n" + use_statement + after_use
        
        model_path.write_text(new_content, encoding="utf-8")
        print(f"   ✅ Added namespace: use App\\Models\\{related_model_name}\\{related_model_name}")
        
        return True
    except Exception as error:
        print(f"   ❌ Error adding use statement: {error}")
        return False

def add_relationship_to_model(
    backend_path: str,
    model_name: str,
    relationship_method: Dict,
    related_model_name: Optional[str] = None
) -> bool:
    model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
    
    try:
        content = model_path.read_text(encoding="utf-8")
        
        if related_model_name:
            add_use_statement_to_model(backend_path, model_name, related_model_name)
            content = model_path.read_text(encoding="utf-8")
        
        if f"function {relationship_method['name']}()" in content:
            print(f"   ⚠️  Relationship {relationship_method['name']}() already exists in {model_name}")
            return False
        
        last_brace_index = content.rfind("}")
        if last_brace_index == -1:
            print(f"   ❌ Could not find closing brace in {model_name}")
            return False
        
        has_relationships_section = "RELATIONSHIPS" in content
        
        relationship_code = ""
        if not has_relationships_section:
            relationship_code = "\n    /**\n     * ======================\n     * RELATIONSHIPS\n     * ======================\n     */\n"
        
        relationship_code += relationship_method["code"]
        
        content = content[:last_brace_index] + relationship_code + "\n" + content[last_brace_index:]
        
        model_path.write_text(content, encoding="utf-8")
        print(f"   ✅ Added relationship {relationship_method['name']}() to {model_name}")
        
        return True
    except Exception as error:
        print(f"   ❌ ERROR in add_relationship_to_model: {error}")
        raise error

# ============================================================================
# DELETE MODULE FUNCTIONALITY
# ============================================================================

def remove_line_from_file(file_path: str, search_pattern: str) -> bool:
    try:
        content = Path(file_path).read_text(encoding="utf-8")
        lines = content.split("\n")
        filtered = [line for line in lines if search_pattern not in line]
        
        if len(filtered) < len(lines):
            Path(file_path).write_text("\n".join(filtered), encoding="utf-8")
            return True
        return False
    except:
        return False

def remove_import_statement(file_path: str, module_name: str) -> bool:
    try:
        content = Path(file_path).read_text(encoding="utf-8")
        
        # Remove Vue/JS imports
        content = re.sub(
            r'import\s+.*?from\s+[\'"]/.*/' + re.escape(module_name.lower()) + r'/.*?[\'"]\n?',
            '',
            content
        )
        content = re.sub(
            r'import\s+.*?from\s+[\'"]\./.*' + re.escape(module_name) + r'.*?[\'"]\n?',
            '',
            content
        )
        
        # Remove PHP use statements
        content = re.sub(
            r'use\s+App\\\\\\w+\\\\' + re.escape(module_name) + r'\\\\' + re.escape(module_name) + r'.*?;\n?',
            '',
            content
        )
        
        Path(file_path).write_text(content, encoding="utf-8")
        return True
    except:
        return False

def remove_from_router_index(frontend_path: str, module_name: str) -> bool:
    router_index_path = Path(frontend_path) / "src" / "router" / "index.js"
    
    try:
        content = router_index_path.read_text(encoding="utf-8")
        name_kebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', module_name).lower()
        
        # Remove import
        content = re.sub(
            r'import\s+.*' + re.escape(module_name) + r'.*from\s+[\'"].*' + re.escape(name_kebab) + r'.*[\'"]\n?',
            '',
            content
        )
        content = re.sub(
            r'import\s+' + re.escape(module_name) + r'Page\s+from\s+[\'"].*' + re.escape(name_kebab) + r'.*[\'"]\n?',
            '',
            content
        )
        
        # Remove route object
        content = re.sub(
            r'\{\s*path:\s*[\'"]/' + re.escape(name_kebab) + r'.*?component:\s*' + re.escape(module_name) + r'Page\s*\}.,?\n?',
            '',
            content,
            flags=re.DOTALL
        )
        
        # Clean up extra blank lines
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        router_index_path.write_text(content, encoding="utf-8")
        return True
    except Exception as error:
        print(f"   ⚠️  Could not remove from router index: {error}")
        return False

def delete_directory(dir_path: str) -> bool:
    try:
        dir_path_obj = Path(dir_path)
        if not dir_path_obj.exists():
            return True
            
        for item in dir_path_obj.iterdir():
            if item.is_dir():
                delete_directory(str(item))
            else:
                item.unlink()
        
        dir_path_obj.rmdir()
        return True
    except Exception as error:
        print(f"   ⚠️  Could not delete directory: {error}")
        return False

def delete_module(
    backend_path: str,
    frontend_path: str,
    module_name: str,
    delete_backend: bool = True,
    delete_frontend: bool = True
) -> Dict:
    results = {
        "deletedBackend": [],
        "deletedFrontend": [],
        "errors": []
    }
    
    try:
        print(f"\n🗑️  Deleting module: {module_name}")
        print("─────────────────────────────────────────────────────────")
        
        if delete_backend:
            # Delete backend Model
            model_dir = Path(backend_path) / "app" / "Models" / module_name
            if delete_directory(str(model_dir)):
                print(f"   ✓ Deleted backend model: app/Models/{module_name}")
                results["deletedBackend"].append(f"Models/{module_name}")
            
            # Delete backend Repository
            repo_dir = Path(backend_path) / "app" / "Repositories" / "Eloquent" / module_name
            if delete_directory(str(repo_dir)):
                print(f"   ✓ Deleted backend repository: app/Repositories/Eloquent/{module_name}")
                results["deletedBackend"].append(f"Repositories/{module_name}")
            
            # Delete backend Service
            service_dir = Path(backend_path) / "app" / "Services" / "Eloquent" / module_name
            if delete_directory(str(service_dir)):
                print(f"   ✓ Deleted backend service: app/Services/Eloquent/{module_name}")
                results["deletedBackend"].append(f"Services/{module_name}")
            
            # Delete backend Controller
            controller_dir = Path(backend_path) / "app" / "Http" / "Controllers" / module_name
            if delete_directory(str(controller_dir)):
                print(f"   ✓ Deleted backend controller: app/Http/Controllers/{module_name}")
                results["deletedBackend"].append(f"Controllers/{module_name}")
            
            # Delete backend Route files
            route_dir = Path(backend_path) / "routes" / "API" / "Modules" / module_name
            if delete_directory(str(route_dir)):
                print(f"   ✓ Deleted backend routes: routes/API/Modules/{module_name}")
                results["deletedBackend"].append(f"Routes/{module_name}")
            
            # Delete backend ControllerTest files
            test_dir = Path(backend_path) / "tests" / "Unit" / module_name
            if delete_directory(str(test_dir)):
                print(f"   ✓ Deleted backend test: tests/Unit/{module_name}")
                results["deletedBackend"].append(f"Tests/{module_name}")
            
            # Remove from routes/api.php or routes/API/index.php
            api_routes_path_alt = Path(backend_path) / "routes" / "API" / "index.php"
            api_routes_path_orig = Path(backend_path) / "routes" / "api.php"
            
            api_routes_path = api_routes_path_alt if file_exists(str(api_routes_path_alt)) else api_routes_path_orig
            
            try:
                route_content = api_routes_path.read_text(encoding="utf-8")
                name_kebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', module_name).lower()
                
                # Split into lines and filter out the @include line for this module
                lines = route_content.split("\n")
                filtered_lines = []
                for line in lines:
                    # Remove @include for this specific module (case-insensitive)
                    if not re.search(
                        r'@include\s*\(\s*[\'"]Modules/' + re.escape(module_name) + r'/' + re.escape(module_name) + r'Routes\.php[\'"]\s*\)',
                        line,
                        re.IGNORECASE
                    ):
                        filtered_lines.append(line)
                route_content = "\n".join(filtered_lines)
                
                # Remove Route::apiResource registration
                route_content = re.sub(
                    r'Route::apiResource\([\'"]' + re.escape(name_kebab) + r'[\'"],\s*' + re.escape(module_name) + r'Controller::class\);?\n?',
                    '',
                    route_content,
                    flags=re.IGNORECASE
                )
                
                # Remove use statements
                route_content = re.sub(
                    r'use\s+App\\\\Http\\\\Controllers\\\\' + re.escape(module_name) + r'\\\\' + re.escape(module_name) + r'Controller;\n?',
                    '',
                    route_content,
                    flags=re.IGNORECASE
                )
                
                # Clean up extra blank lines
                route_content = re.sub(r'\n\n\n+', '\n\n', route_content)
                
                api_routes_path.write_text(route_content, encoding="utf-8")
                print("   ✓ Removed @include from routes file")
            except Exception as err:
                print(f"   ⚠️  Could not remove from routes: {err}")
        
        if delete_frontend:
            name_kebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', module_name).lower()
            
            # Delete frontend API file
            api_file_path = Path(frontend_path) / "src" / "api" / f"{name_kebab}.js"
            try:
                if api_file_path.exists():
                    api_file_path.unlink()
                    print(f"   ✓ Deleted frontend API: src/api/{name_kebab}.js")
                    results["deletedFrontend"].append(f"api/{name_kebab}.js")
                else:
                    print("   ⚠️  Frontend API file not found")
            except:
                print("   ⚠️  Frontend API file not found")
            
            # Delete frontend Page component
            page_file_path = Path(frontend_path) / "src" / "pages" / f"{module_name}Page.vue"
            try:
                if page_file_path.exists():
                    page_file_path.unlink()
                    print(f"   ✓ Deleted frontend page: src/pages/{module_name}Page.vue")
                    results["deletedFrontend"].append(f"pages/{module_name}Page.vue")
                else:
                    print("   ⚠️  Frontend page file not found")
            except:
                print("   ⚠️  Frontend page file not found")
            
            # Delete frontend Router component
            router_file_path = Path(frontend_path) / "src" / "router" / f"{name_kebab}.js"
            try:
                if router_file_path.exists():
                    router_file_path.unlink()
                    print(f"   ✓ Deleted frontend router: src/router/{name_kebab}.js")
                    results["deletedFrontend"].append(f"router/{name_kebab}.js")
                else:
                    print("   ⚠️  Frontend router file not found")
            except:
                print("   ⚠️  Frontend router file not found")
            
            # Remove from router/index.js
            remove_from_router_index(frontend_path, module_name)
            print("   ✓ Removed from router/index.js")
            
            # Try to remove from main.js or app.js
            for main_file in ["src/main.js", "src/App.js"]:
                main_path = Path(frontend_path) / main_file
                try:
                    if main_path.exists():
                        remove_import_statement(str(main_path), module_name)
                except:
                    # File might not exist
                    pass
        
        print("\n✅ Module deletion complete!\n")
        return results
    except Exception as error:
        print(f"\n❌ Error deleting module: {error}")
        raise error

# ============================================================================
# BATCH MODE - JSON FILE PROCESSING
# ============================================================================

def validate_batch_config(config: Dict) -> Dict:
    errors = []
    
    if "modules" not in config:
        errors.append("Missing required field: modules")
    elif not isinstance(config["modules"], list):
        errors.append("modules must be an array")
    
    if errors:
        return {"isValid": False, "errors": errors}
    
    # Validate each module
    for i, module in enumerate(config["modules"]):
        module_prefix = f"Module[{i}] ({module.get('name', 'unnamed')})"
        
        if "name" not in module:
            errors.append(f"{module_prefix}: Missing required field: name")
        else:
            name_validation = validate_model_name(module["name"])
            if name_validation is not True:
                errors.append(f"{module_prefix}: {name_validation}")
        
        # Validate fields
        if "fields" not in module:
            errors.append(f"{module_prefix}: Missing required field: fields")
        elif not isinstance(module["fields"], list):
            errors.append(f"{module_prefix}: fields must be an array")
        else:
            for j, field in enumerate(module["fields"]):
                field_prefix = f"{module_prefix} Field[{j}]"
                
                if "name" not in field:
                    errors.append(f"{field_prefix}: Missing required field: name")
                else:
                    field_name_validation = validate_field_name(field["name"])
                    if field_name_validation is not True:
                        errors.append(f"{field_prefix}: {field_name_validation}")
                
                if "type" not in field:
                    errors.append(f"{field_prefix}: Missing required field: type")
                elif field["type"] not in FIELD_TYPES:
                    errors.append(
                        f"{field_prefix}: Invalid type '{field['type']}'. Allowed: {', '.join(FIELD_TYPES.keys())}"
                    )
                
                if "showInTable" in field and not isinstance(field["showInTable"], bool):
                    errors.append(f"{field_prefix}: showInTable must be boolean")
        
        # Validate relationships (optional)
        if "relationships" in module:
            if not isinstance(module["relationships"], list):
                errors.append(f"{module_prefix}: relationships must be an array")
            else:
                for k, rel in enumerate(module["relationships"]):
                    rel_prefix = f"{module_prefix} Relationship[{k}]"
                    
                    if "type" not in rel:
                        errors.append(f"{rel_prefix}: Missing required field: type")
                    elif rel["type"] not in RELATIONSHIP_TYPES:
                        errors.append(
                            f"{rel_prefix}: Invalid type '{rel['type']}'. Allowed: {', '.join(RELATIONSHIP_TYPES.keys())}"
                        )
                    
                    if "relatedModel" not in rel:
                        errors.append(f"{rel_prefix}: Missing required field: relatedModel")
                    else:
                        model_validation = validate_model_name(rel["relatedModel"])
                        if model_validation is not True:
                            errors.append(f"{rel_prefix}: relatedModel: {model_validation}")
                    
                    if "methodName" not in rel:
                        errors.append(f"{rel_prefix}: Missing required field: methodName")
                    else:
                        method_validation = validate_field_name(rel["methodName"])
                        if method_validation is not True:
                            errors.append(f"{rel_prefix}: methodName: {method_validation}")
                    
                    if "foreignKey" in rel and not isinstance(rel["foreignKey"], str):
                        errors.append(f"{rel_prefix}: foreignKey must be string")
    
    return {"isValid": len(errors) == 0, "errors": errors}

def convert_batch_fields(fields: List[Dict], name: str) -> Dict:
    backend_fillable = []
    backend_validations = []
    frontend_fields = []
    
    for field in fields:
        field_info = FIELD_TYPES[field["type"]]
        
        backend_fillable.append(field["name"])
        backend_validations.append({
            "name": field["name"],
            "type": field["type"],
            "rule": field_info["validation"],
            "updateRule": field_info["updateValidation"],
            "testValue": field_info["testValue"],
            "updateValue": field_info["updateValue"],
        })
        
        frontend_field = {
            "name": field["name"],
            "type": field["type"],
            "formType": field_info["formType"],
            "rules": field_info["validation"],
            "description": field.get("description", ""),
            "showInTable": field.get("showInTable", True),
            "options": field.get("options", None),
            "isDynamic": field.get("isDynamic", False),
            "isMultiple": field.get("isMultiple", False),
            "customType": field.get("customType", None),
            "module": field.get("module", None),
            "optionLabel": field.get("optionLabel", "name"),
            "col": field_info["col"],
        }
        frontend_fields.append(frontend_field)
    
    return {
        "backendFillable": backend_fillable,
        "backendValidations": backend_validations,
        "frontendFields": frontend_fields,
    }

def get_default_inverse_method(rel_type: str, model_name: str) -> str:
    lower_name = model_name.lower()
    if rel_type in ["hasMany", "belongsToMany"]:
        return lower_name + "s"
    return lower_name

def process_batch_module(
    module_config: Dict,
    backend_path: str,
    frontend_path: str,
    gen_backend: bool,
    gen_frontend: bool
) -> Dict:
    result = {
        "name": module_config["name"],
        "success": False,
        "errors": [],
        "warnings": [],
    }
    
    try:
        name = module_config["name"]
        namekebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', name).lower()
        name_lower = name.lower()
        
        # Convert fields
        fields_result = convert_batch_fields(module_config["fields"], name)
        backend_fillable = fields_result["backendFillable"]
        backend_validations = fields_result["backendValidations"]
        frontend_fields = fields_result["frontendFields"]
        
        # Process relationships
        relationships = []
        if "relationships" in module_config and isinstance(module_config["relationships"], list):
            for rel in module_config["relationships"]:
                relationship = {
                    "methodName": rel["methodName"],
                    "type": rel["type"],
                    "relatedModel": rel["relatedModel"],
                    "foreignKey": rel.get("foreignKey", f"{rel['relatedModel'].lower()}_id"),
                    "localKey": rel.get("localKey", None),
                    "inverse": True,
                    "inverseMethod": rel.get("inverseMethod", get_default_inverse_method(rel["type"], name)),
                    "inverseType": rel.get("inverseType", RELATIONSHIP_TYPES[rel["type"]]["inverse"]),
                }
                relationships.append(relationship)
                
                # Add foreign key fields to fillable and validations for belongsTo and belongsToMany
                if relationship["type"] == "belongsTo":
                    if relationship["foreignKey"] not in backend_fillable:
                        backend_fillable.append(relationship["foreignKey"])
                        backend_validations.append({
                            "name": relationship["foreignKey"],
                            "type": "string",
                            "rule": "required|string",
                            "updateRule": "required|string",
                            "testValue": '"507f1f77bcf86cd799439011"',
                            "updateValue": '"507f1f77bcf86cd799439012"',
                        })
                elif relationship["type"] == "belongsToMany":
                    array_field_name = relationship["foreignKey"] or f"{relationship['relatedModel'].lower()}_ids"
                    
                    if array_field_name not in backend_fillable:
                        backend_fillable.append(array_field_name)
                        backend_validations.append({
                            "name": array_field_name,
                            "type": "array",
                            "rule": "nullable|array",
                            "updateRule": "nullable|array",
                            "testValue": "['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']",
                            "updateValue": "['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014']",
                        })
                    
                    inverse_field_name = relationship.get("localKey", {}).get("inverseField", f"{module_config['name'].lower()}_ids")
                    
                    relationship["foreignKey"] = array_field_name
                    relationship["localKey"] = {
                        "inverseField": inverse_field_name,
                        "addSyncMethods": True,
                    }
        
        if gen_backend:
            try:
                model_exists = check_backend_model_exists(backend_path, name)
                
                if model_exists:
                    print(f"   ℹ️  Model {name} already exists, updating...")
                    
                    existing_fields = get_existing_fields(backend_path, name)
                    for field in backend_fillable:
                        if field not in existing_fields:
                            add_field_to_model(backend_path, name, field)
                            print(f"   ✅ Added field '{field}' to {name}")
                    
                    for rel in relationships:
                        try:
                            add_relationship_to_model(
                                backend_path,
                                name,
                                {
                                    "name": rel["methodName"],
                                    "code": generate_single_relationship(rel),
                                },
                                rel["relatedModel"],
                            )
                        except Exception as err:
                            print(f"   ⚠️  {err}")
                else:
                    create_backend_file(
                        "Model",
                        backend_path,
                        "model.txt",
                        name,
                        namekebab,
                        backend_fillable,
                        backend_validations,
                        relationships,
                    )
                    print("   ✓ Model created")
                    
                    create_backend_file(
                        "Repository",
                        backend_path,
                        "repositories.txt",
                        name,
                        namekebab,
                        backend_fillable,
                        [],
                        relationships,
                    )
                    print("   ✓ Repository created")
                    
                    create_backend_file(
                        "Service",
                        backend_path,
                        "services.txt",
                        name,
                        namekebab,
                        backend_fillable,
                        backend_validations,
                    )
                    print("   ✓ Service created")
                    
                    create_backend_file(
                        "Controller",
                        backend_path,
                        "controller.txt",
                        name,
                        namekebab,
                        backend_fillable,
                    )
                    print("   ✓ Controller created")
                    
                    create_backend_file(
                        "Routes",
                        backend_path,
                        "route.txt",
                        name,
                        namekebab,
                        backend_fillable,
                    )
                    print("   ✓ Routes created")
                    
                    create_backend_file(
                        "ControllerTest",
                        backend_path,
                        "test.txt",
                        name,
                        namekebab,
                        backend_fillable,
                        backend_validations,
                    )
                    print("   ✓ Test created")
                    
                    register_backend_route(backend_path, name)
                    print("   ✓ Route registered")
                
                result["backend"] = {"model": "✓"}
                
                for rel in relationships:
                    if rel.get("inverse") and rel.get("inverseMethod"):
                        try:
                            related_model_exists = check_backend_model_exists(
                                backend_path,
                                rel["relatedModel"]
                            )
                            
                            if not related_model_exists:
                                print(f"   ⚠️  Related model {rel['relatedModel']} not found, skipping inverse relationship")
                                continue
                            
                            inverse_type = rel.get("inverseType", RELATIONSHIP_TYPES[rel["type"]]["inverse"])
                            
                            inverse_rel = {
                                "methodName": rel["inverseMethod"],
                                "type": inverse_type,
                                "relatedModel": name,
                                "foreignKey": (
                                    rel["localKey"]["inverseField"]
                                    if rel["type"] == "belongsToMany" and "localKey" in rel
                                    else rel["foreignKey"]
                                ),
                                "localKey": (
                                    {"inverseField": rel["foreignKey"]}
                                    if rel["type"] == "belongsToMany"
                                    else None
                                ),
                                "embedded": False,
                            }
                            
                            inverse_code = generate_single_relationship(inverse_rel)
                            
                            add_relationship_to_model(
                                backend_path,
                                rel["relatedModel"],
                                {
                                    "name": rel["inverseMethod"],
                                    "code": inverse_code,
                                },
                                name,
                            )
                            
                            if rel["type"] == "belongsToMany" and "localKey" in rel and "inverseField" in rel["localKey"]:
                                inverse_field_name = rel["localKey"]["inverseField"]
                                related_fields = get_existing_fields(
                                    backend_path,
                                    rel["relatedModel"]
                                )
                                
                                if inverse_field_name not in related_fields:
                                    add_field_to_model(
                                        backend_path,
                                        rel["relatedModel"],
                                        inverse_field_name,
                                    )
                                    print(f"   ✅ Added field '{inverse_field_name}' to {rel['relatedModel']}")
                        except Exception as err:
                            result["warnings"].append(f"Inverse relationship {rel.get('inverseMethod', 'unknown')}: {err}")
                            print(f"   ⚠️  {err}")
            except Exception as err:
                result["errors"].append(f"Backend generation: {err}")
        
        if gen_frontend:
            try:
                create_frontend_file(
                    "API",
                    frontend_path,
                    "api.txt",
                    name,
                    namekebab,
                    name_lower,
                    frontend_fields,
                )
                result["frontend"] = {"api": "✓"}
                
                create_frontend_file(
                    "Page",
                    frontend_path,
                    "page.txt",
                    name,
                    namekebab,
                    name_lower,
                    frontend_fields,
                )
                result["frontend"]["page"] = "✓"
                
                create_frontend_file(
                    "Router",
                    frontend_path,
                    "router.txt",
                    name,
                    namekebab,
                    name_lower,
                    frontend_fields,
                )
                result["frontend"]["router"] = "✓"
                
                update_frontend_router_index(frontend_path, name)
                result["frontend"]["routerIndex"] = "✓"
            except Exception as err:
                result["errors"].append(f"Frontend generation: {err}")
        
        result["success"] = len(result["errors"]) == 0
        return result
    except Exception as error:
        result["errors"].append(str(error))
        return result

# ============================================================================
# AI & CLICKUP MODE WIZARD
# ============================================================================

def ai_clickup_mode_wizard():
    print("\n🤖 AI & ClickUp Mode")
    print("─────────────────────────────────────────────────────────")
    print("This mode fetches task details from ClickUp and uses AI")
    print("to generate module configuration automatically.")
    print("─────────────────────────────────────────────────────────")
    
    try:
        # STEP 1: Get paths
        print("\n📝 Step 1: Path Configuration")
        print("─────────────────────────────────────────────────────────")
        
        questions = [
            inquirer.Text(
                "backend_path",
                message="Backend path (e.g., ../Backend):",
                default="../Backend",
                validate=lambda _, x: validate_path(x)
            ),
            inquirer.Text(
                "frontend_path",
                message="Frontend path (e.g., ../Frontend):",
                default="../Frontend",
                validate=lambda _, x: validate_path(x)
            ),
        ]
        answers = inquirer.prompt(questions)
        backend_path = answers["backend_path"]
        frontend_path = answers["frontend_path"]
        
        # STEP 2: Get ClickUp Task ID
        print("\n📝 Step 2: ClickUp Task ID")
        print("─────────────────────────────────────────────────────────")
        
        task_id_question = [
            inquirer.Text(
                "task_id",
                message="ClickUp Task ID:",
                validate=lambda _, x: bool(x.strip())
            ),
        ]
        task_answer = inquirer.prompt(task_id_question)
        task_id = task_answer["task_id"]
        
        print("\n⏳ Fetching task from ClickUp...")
        
        # Fetch task from ClickUp
        try:
            # Import the ClickUp integration module
            from ClickUpIntegration import get_task
            # Note: get_task should be a regular function, not async
            task_data = get_task(task_id)
            print(f"✅ Task fetched: {task_data}")
        except Exception as error:
            print(f"\n❌ {error}")
            retry_question = [
                inquirer.Confirm(
                    "retry",
                    message="Would you like to try again?",
                    default=True
                ),
            ]
            retry_answer = inquirer.prompt(retry_question)
            if retry_answer["retry"]:
                return ai_clickup_mode_wizard()
            else:
                main_menu()
                return
        
        print(f"\n📋 Task Information:")
        print(f"   Name: {task_data}")
        truncated_desc = task_data[:100] + "..." if len(task_data) > 100 else task_data
        print(f"   Description: {truncated_desc}")
        
        confirm_question = [
            inquirer.Confirm(
                "confirm_generate",
                message="Generate module configuration using AI?",
                default=True
            ),
        ]
        confirm_answer = inquirer.prompt(confirm_question)
        
        if not confirm_answer["confirm_generate"]:
            print("\n❌ Operation cancelled\n")
            main_menu()
            return
        
        print("\n🤖 Generating configuration with OpenAI...")
        
        # Generate config using AI
        try:
            from LLMIntegaration import generate_schema
            # Note: generate_schema should be a regular function, not async
            generated_config = generate_schema(task_data)
            print("✅ Configuration generated successfully!")
        except Exception as error:
            print(f"\n❌ {error}")
            manual_question = [
                inquirer.Confirm(
                    "manual_mode",
                    message="Would you like to switch to manual mode instead?",
                    default=True
                ),
            ]
            manual_answer = inquirer.prompt(manual_question)
            if manual_answer["manual_mode"]:
                return wizard()
            else:
                main_menu()
                return
        
        # Parse the generated config
        try:
            parsed_config = json.loads(generated_config)
        except Exception as error:
            print(f"\n❌ Failed to parse generated configuration: {error}")
            print(f"Raw config: {generated_config}")
            main_menu()
            return
        
        # Ensure the structure is correct
        if "modules" not in parsed_config or not isinstance(parsed_config["modules"], list):
            print("\n❌ Generated configuration is missing 'modules' array")
            print(f"Received structure: {parsed_config}")
            main_menu()
            return
        
        # Ensure each module has required arrays and fix names
        for module in parsed_config["modules"]:
            if "name" in module and " " in module["name"]:
                old_name = module["name"]
                module["name"] = module["name"].replace(" ", "")
                print(f"⚠️  Fixed module name: '{old_name}' → '{module['name']}'")
            
            if "fields" not in module:
                print(f"⚠️  Module '{module.get('name', 'unknown')}' missing fields array, adding empty array")
                module["fields"] = []
            if "relationships" not in module:
                module["relationships"] = []
        
        # Display generated config
        print("\n📄 Generated Configuration:")
        print("─────────────────────────────────────────────────────────")
        print(json.dumps(parsed_config, indent=2))
        print("─────────────────────────────────────────────────────────")
        
        save_question = [
            inquirer.Confirm(
                "save_config",
                message="Save this configuration to a JSON file?",
                default=True
            ),
        ]
        save_answer = inquirer.prompt(save_question)
        
        if save_answer["save_config"]:
            config_question = [
                inquirer.Text(
                    "config_file_name",
                    message="Config file name:",
                    default=f"clickup-{task_id}-config.json",
                    validate=lambda _, x: bool(x.strip()) and x.endswith(".json")
                ),
            ]
            config_answer = inquirer.prompt(config_question)
            config_file_name = config_answer["config_file_name"]
            
            try:
                with open(config_file_name, "w", encoding="utf-8") as f:
                    json.dump(parsed_config, f, indent=2)
                print(f"\n✅ Configuration saved to: {config_file_name}")
            except Exception as error:
                print(f"\n⚠️  Could not save file: {error}")
        
        proceed_question = [
            inquirer.Confirm(
                "proceed_generation",
                message="Proceed with module generation?",
                default=True
            ),
        ]
        proceed_answer = inquirer.prompt(proceed_question)
        
        if not proceed_answer["proceed_generation"]:
            print("\n❌ Generation cancelled\n")
            main_menu()
            return
        
        # Validate configuration
        validation = validate_batch_config(parsed_config)
        if not validation["isValid"]:
            print("\n❌ Generated configuration has errors:")
            for err in validation["errors"]:
                print(f"   • {err}")
            
            fix_question = [
                inquirer.Confirm(
                    "fix_manually",
                    message="Would you like to fix the configuration manually and continue?",
                    default=False
                ),
            ]
            fix_answer = inquirer.prompt(fix_question)
            
            if not fix_answer["fix_manually"]:
                main_menu()
                return
            
            print("\nPlease edit the saved JSON file and use Batch Mode to continue.")
            main_menu()
            return
        
        # Check paths
        backend_valid = check_backend_app_exists(backend_path)
        frontend_valid = check_frontend_src_exists(frontend_path)
        
        if not backend_valid and not frontend_valid:
            print("\n❌ Neither backend nor frontend paths are valid!")
            main_menu()
            return
        
        gen_backend = backend_valid
        gen_frontend = frontend_valid
        
        if not backend_valid:
            print(f"⚠️  Backend path not found: {backend_path}")
        if not frontend_valid:
            print(f"⚠️  Frontend path not found: {frontend_path}")
        
        print("\n🚀 Starting module generation...\n")
        
        results = []
        for i, module in enumerate(parsed_config["modules"]):
            print(f"\n📝 [{i+1}/{len(parsed_config['modules'])}] Processing: {module['name']}")
            print("─────────────────────────────────────────────────────────")
            
            result = process_batch_module(
                module,
                backend_path,
                frontend_path,
                gen_backend,
                gen_frontend,
            )
            results.append(result)
            
            if result["success"]:
                print(f"✅ {module['name']} generated successfully")
                if "backend" in result:
                    print(f"   Backend: {', '.join(result['backend'].values())}")
                if "frontend" in result:
                    print(f"   Frontend: {', '.join(result['frontend'].values())}")
            else:
                print(f"❌ {module['name']} generation failed:")
                for err in result["errors"]:
                    print(f"   • {err}")
            
            if result["warnings"]:
                print(f"   ⚠️  Warnings:")
                for warn in result["warnings"]:
                    print(f"   • {warn}")
        
        # Display summary
        display_completion_banner()
        print("📊 AI Generation Summary:")
        print("─────────────────────────────────────────────────────────")
        
        success_count = sum(1 for r in results if r["success"])
        failure_count = sum(1 for r in results if not r["success"])
        
        print(f"ClickUp Task: {task_data} ({task_id})")
        print(f"Total modules: {len(parsed_config['modules'])}")
        print(f"✅ Successful: {success_count}")
        if failure_count > 0:
            print(f"❌ Failed: {failure_count}")
        print("\nGenerated modules:")
        
        for result in results:
            status = "✓" if result["success"] else "✗"
            print(f"   [{status}] {result['name']}")
            for err in result["errors"]:
                print(f"       └─ {err}")
        
        print("\n")
        
        continue_question = [
            inquirer.Confirm(
                "continue_loop",
                message="Return to main menu?",
                default=True
            ),
        ]
        continue_answer = inquirer.prompt(continue_question)
        
        if continue_answer["continue_loop"]:
            main_menu()
        else:
            print("\nGoodbye! 👋\n")
            sys.exit(0)
    except Exception as error:
        print(f"\n❌ Error: {error}")
        import traceback
        traceback.print_exc()
        
        back_question = [
            inquirer.Confirm(
                "back_to_menu",
                message="Return to main menu?",
                default=True
            ),
        ]
        back_answer = inquirer.prompt(back_question)
        
        if back_answer["back_to_menu"]:
            main_menu()
        else:
            sys.exit(1)

# ============================================================================
# BATCH MODE WIZARD
# ============================================================================

def batch_mode_wizard():
    print("\n📦 Batch Mode Configuration")
    print("─────────────────────────────────────────────────────────")
    
    try:
        # STEP 1: Ask for paths FIRST
        print("\n📝 Step 1: Path Configuration")
        print("─────────────────────────────────────────────────────────")
        
        questions = [
            inquirer.Text(
                "backend_path",
                message="Backend path (e.g., ../Backend):",
                default="../Backend",
                validate=lambda _, x: validate_path(x)
            ),
            inquirer.Text(
                "frontend_path",
                message="Frontend path (e.g., ../Frontend):",
                default="../Frontend",
                validate=lambda _, x: validate_path(x)
            ),
        ]
        answers = inquirer.prompt(questions)
        backend_path = answers["backend_path"]
        frontend_path = answers["frontend_path"]
        
        # STEP 2: Ask for JSON config file
        print("\n📝 Step 2: JSON Configuration File")
        print("─────────────────────────────────────────────────────────")
        
        config_question = [
            inquirer.Text(
                "config_path",
                message="Path to JSON configuration file:",
                validate=lambda _, x: bool(x.strip()) and x.endswith(".json")
            ),
        ]
        config_answer = inquirer.prompt(config_question)
        config_path = config_answer["config_path"]
        
        # Read JSON file
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config_content = f.read()
        except Exception as error:
            print(f"\n❌ Error reading file: {error}")
            sys.exit(1)
        
        # Parse JSON
        try:
            config = json.loads(config_content)
        except Exception as error:
            print(f"\n❌ Invalid JSON format: {error}")
            sys.exit(1)
        
        # Validate configuration
        validation = validate_batch_config(config)
        if not validation["isValid"]:
            print("\n❌ Configuration validation errors:")
            for err in validation["errors"]:
                print(f"   • {err}")
            sys.exit(1)
        
        print("\n✓ Configuration validated successfully")
        print(f"📦 Found {len(config['modules'])} module(s) to generate\n")
        
        # Check paths from wizard input
        backend_valid = check_backend_app_exists(backend_path)
        frontend_valid = check_frontend_src_exists(frontend_path)
        
        if not backend_valid and not frontend_valid:
            print("\n❌ Neither backend nor frontend paths are valid!")
            sys.exit(1)
        
        gen_backend = backend_valid
        gen_frontend = frontend_valid
        
        if not backend_valid:
            print(f"⚠️  Backend path not found: {backend_path}")
        if not frontend_valid:
            print(f"⚠️  Frontend path not found: {frontend_path}")
        
        # Confirm processing
        confirm_question = [
            inquirer.Confirm(
                "confirm",
                message=f"\nGenerate {len(config['modules'])} module(s)?",
                default=True
            ),
        ]
        confirm_answer = inquirer.prompt(confirm_question)
        
        if not confirm_answer["confirm"]:
            print("\n❌ Operation cancelled\n")
            main_menu()
            return
        
        print("\n🚀 Starting batch generation...\n")
        
        results = []
        for i, module in enumerate(config["modules"]):
            print(f"\n📝 [{i+1}/{len(config['modules'])}] Processing: {module['name']}")
            print("─────────────────────────────────────────────────────────")
            
            # Use wizard paths instead of config paths
            result = process_batch_module(
                module,
                backend_path,
                frontend_path,
                gen_backend,
                gen_frontend,
            )
            results.append(result)
            
            if result["success"]:
                print(f"✅ {module['name']} generated successfully")
                if "backend" in result:
                    print(f"   Backend: {', '.join(result['backend'].values())}")
                if "frontend" in result:
                    print(f"   Frontend: {', '.join(result['frontend'].values())}")
            else:
                print(f"❌ {module['name']} generation failed:")
                for err in result["errors"]:
                    print(f"   • {err}")
            
            if result["warnings"]:
                print(f"   ⚠️  Warnings:")
                for warn in result["warnings"]:
                    print(f"   • {warn}")
        
        # Display summary
        display_completion_banner()
        print("📊 Batch Generation Summary:")
        print("─────────────────────────────────────────────────────────")
        
        success_count = sum(1 for r in results if r["success"])
        failure_count = sum(1 for r in results if not r["success"])
        
        print(f"Total modules: {len(config['modules'])}")
        print(f"✅ Successful: {success_count}")
        if failure_count > 0:
            print(f"❌ Failed: {failure_count}")
        print("\nGenerated modules:")
        
        for result in results:
            status = "✓" if result["success"] else "✗"
            print(f"   [{status}] {result['name']}")
            for err in result["errors"]:
                print(f"       └─ {err}")
        
        print("\n")
        
        continue_question = [
            inquirer.Confirm(
                "continue_loop",
                message="Return to main menu?",
                default=True
            ),
        ]
        continue_answer = inquirer.prompt(continue_question)
        
        if continue_answer["continue_loop"]:
            main_menu()
        else:
            print("\nGoodbye! 👋\n")
            sys.exit(0)
    except Exception as error:
        print(f"\n❌ Error: {error}")
        sys.exit(1)

# ============================================================================
# EXAMPLE CONFIG GENERATOR
# ============================================================================

def generate_example_config():
    example_config = {
        "backendPath": "../Backend",
        "frontendPath": "../Frontend",
        "modules": [
            {
                "name": "Product",
                "fields": [
                    {
                        "name": "title",
                        "type": "string",
                        "description": "Product title",
                        "showInTable": True,
                    },
                    {
                        "name": "description",
                        "type": "textarea",
                        "description": "Product description",
                        "showInTable": False,
                    },
                    {
                        "name": "price",
                        "type": "decimal",
                        "description": "Product price",
                        "showInTable": True,
                    },
                    {
                        "name": "stock",
                        "type": "integer",
                        "description": "Stock quantity",
                        "showInTable": True,
                    },
                    {
                        "name": "isActive",
                        "type": "boolean",
                        "description": "Is product active",
                        "showInTable": True,
                    },
                ],
                "relationships": [
                    {
                        "type": "belongsTo",
                        "relatedModel": "Category",
                        "methodName": "category",
                        "foreignKey": "category_id",
                        "inverseMethod": "products",
                        "inverseType": "hasMany",
                    },
                ],
            },
            {
                "name": "Category",
                "fields": [
                    {
                        "name": "name",
                        "type": "string",
                        "description": "Category name",
                        "showInTable": True,
                    },
                    {
                        "name": "slug",
                        "type": "string",
                        "description": "URL slug",
                        "showInTable": True,
                    },
                ],
            },
        ],
    }
    
    example_path = Path.cwd() / "batch-config-example.json"
    try:
        with open(example_path, "w", encoding="utf-8") as f:
            json.dump(example_config, f, indent=2)
        print(f"\n✅ Example configuration created: {example_path}\n")
    except Exception as error:
        print(f"\n❌ Error creating example: {error}\n")

# ============================================================================
# DELETE MODULE WIZARD
# ============================================================================

def delete_module_wizard():
    print("\n📝 Module Deletion Wizard")
    print("─────────────────────────────────────────────────────────")
    
    try:
        questions = [
            inquirer.Text(
                "backend_path",
                message="Backend path (e.g., ../Backend):",
                default="../Backend",
                validate=lambda _, x: validate_path(x)
            ),
            inquirer.Text(
                "frontend_path",
                message="Frontend path (e.g., ../Frontend):",
                default="../Frontend",
                validate=lambda _, x: validate_path(x)
            ),
        ]
        answers = inquirer.prompt(questions)
        backend_path = answers["backend_path"]
        frontend_path = answers["frontend_path"]
        
        backend_valid = check_backend_app_exists(backend_path)
        frontend_valid = check_frontend_src_exists(frontend_path)
        
        module_question = [
            inquirer.Text(
                "module_name",
                message="Module name to delete (e.g., Product):",
                validate=lambda _, x: validate_model_name(x)
            ),
        ]
        module_answer = inquirer.prompt(module_question)
        module_name = module_answer["module_name"]
        
        delete_options = []
        if backend_valid:
            delete_options.append("Backend only")
        if frontend_valid:
            delete_options.append("Frontend only")
        if backend_valid and frontend_valid:
            delete_options.append("Both (Backend + Frontend)")
        
        delete_question = [
            inquirer.List(
                "delete_what",
                message="What would you like to delete?",
                choices=delete_options,
                default=len(delete_options) - 1 if delete_options else 0,
            ),
        ]
        delete_answer = inquirer.prompt(delete_question)
        
        confirm_question = [
            inquirer.Confirm(
                "confirm",
                message=f'⚠️  Are you sure you want to delete "{module_name}"? This cannot be undone!',
                default=False
            ),
        ]
        confirm_answer = inquirer.prompt(confirm_question)
        
        if not confirm_answer["confirm"]:
            print("\n❌ Deletion cancelled.\n")
            return
        
        delete_backend = "Backend" in delete_answer["delete_what"]
        delete_frontend = "Frontend" in delete_answer["delete_what"]
        
        delete_module(
            backend_path,
            frontend_path,
            module_name,
            delete_backend,
            delete_frontend,
        )
        
        again_question = [
            inquirer.Confirm(
                "again",
                message="Would you like to perform another action?",
                default=True
            ),
        ]
        again_answer = inquirer.prompt(again_question)
        
        if again_answer["again"]:
            main_menu()
        else:
            print("\nGoodbye! 👋\n")
            sys.exit(0)
    except Exception as error:
        print(f"\n❌ Error: {error}")
        sys.exit(1)

# ============================================================================
# MAIN WIZARD
# ============================================================================

def wizard():
    try:
        # STEP 1: Ask for paths
        print("\n📝 Step 1: Path Configuration")
        print("─────────────────────────────────────────────────────────")
        
        questions = [
            inquirer.Text(
                "backend_path",
                message="Backend path (e.g., ../Backend):",
                default="../Backend",
                validate=lambda _, x: validate_path(x)
            ),
            inquirer.Text(
                "frontend_path",
                message="Frontend path (e.g., ../Frontend):",
                default="../Frontend",
                validate=lambda _, x: validate_path(x)
            ),
        ]
        answers = inquirer.prompt(questions)
        backend_path = answers["backend_path"]
        frontend_path = answers["frontend_path"]
        
        backend_valid = check_backend_app_exists(backend_path)
        frontend_valid = check_frontend_src_exists(frontend_path)
        
        if not backend_valid:
            print(f"   ⚠️  Backend app directory not found at {backend_path}")
        if not frontend_valid:
            print(f"   ⚠️  Frontend src directory not found at {frontend_path}")
        
        if not backend_valid and not frontend_valid:
            print("   ❌ Neither backend nor frontend paths are valid!")
            sys.exit(1)
        
        # STEP 2: Ask what to generate
        print("\n📝 Step 2: Generation Options")
        print("─────────────────────────────────────────────────────────")
        
        generation_choices = []
        if backend_valid:
            generation_choices.append("Backend Only")
        if frontend_valid:
            generation_choices.append("Frontend Only")
        if backend_valid and frontend_valid:
            generation_choices.append("Both (Backend + Frontend)")
        
        generate_question = [
            inquirer.List(
                "generate_what",
                message="What would you like to generate?",
                choices=generation_choices,
                default=0,
            ),
        ]
        generate_answer = inquirer.prompt(generate_question)
        
        gen_backend = "Backend" in generate_answer["generate_what"]
        gen_frontend = "Frontend" in generate_answer["generate_what"]
        
        # STEP 3: Module name
        print("\n📝 Step 3: Module Name")
        print("─────────────────────────────────────────────────────────")
        
        name_question = [
            inquirer.Text(
                "name",
                message="Module name (e.g., Product, User):",
                validate=lambda _, x: validate_model_name(x)
            ),
        ]
        name_answer = inquirer.prompt(name_question)
        name = name_answer["name"]
        
        namekebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', name).lower()
        name_lower = name.lower()
        
        # STEP 4: Fields
        print("\n📝 Step 4: Fields")
        print("─────────────────────────────────────────────────────────")
        
        num_fields_question = [
            inquirer.Text(
                "num_fields",
                message="How many fields?",
                default="2",
                validate=lambda _, x: x.isdigit() and int(x) >= 1
            ),
        ]
        num_fields_answer = inquirer.prompt(num_fields_question)
        num_fields = int(num_fields_answer["num_fields"])
        
        field_type_options = list(FIELD_TYPES.keys())
        backend_fillable = []
        backend_validations = []
        frontend_fields = []
        
        for i in range(num_fields):
            print(f"\n   Field {i + 1}:")
            
            field_name_question = [
                inquirer.Text(
                    "field_name",
                    message="Field name:",
                    validate=lambda _, x: validate_field_name(x)
                ),
            ]
            field_name_answer = inquirer.prompt(field_name_question)
            field_name = field_name_answer["field_name"]
            
            field_type_question = [
                inquirer.List(
                    "field_type",
                    message="Field type:",
                    choices=field_type_options,
                    default="string",
                ),
            ]
            field_type_answer = inquirer.prompt(field_type_question)
            field_type = field_type_answer["field_type"]
            
            field_info = FIELD_TYPES[field_type]
            
            backend_fillable.append(field_name)
            backend_validations.append({
                "name": field_name,
                "type": field_type,
                "rule": field_info["validation"],
                "updateRule": field_info["updateValidation"],
                "testValue": field_info["testValue"],
                "updateValue": field_info["updateValue"],
            })
            
            if gen_frontend:
                show_in_table_question = [
                    inquirer.Confirm(
                        "show_in_table",
                        message="Show in table?",
                        default=field_info["tableDisplay"] != "hidden"
                    ),
                ]
                show_in_table_answer = inquirer.prompt(show_in_table_question)
                
                description_question = [
                    inquirer.Text(
                        "description",
                        message="Field description (optional):",
                        default=""
                    ),
                ]
                description_answer = inquirer.prompt(description_question)
                
                options = None
                is_multiple = False
                is_dynamic = False
                module_name = None
                option_label = "name"
                option_value = None
                
                if field_info.get("hasOptions"):
                    options_type_question = [
                        inquirer.List(
                            "options_type",
                            message="Options type:",
                            choices=["Static options", "Dynamic (from API/Module)"],
                            default="Static options",
                        ),
                    ]
                    options_type_answer = inquirer.prompt(options_type_question)
                    
                    if options_type_answer["options_type"] == "Static options":
                        num_options_question = [
                            inquirer.Text(
                                "num_options",
                                message="How many options?",
                                default="2",
                                validate=lambda _, x: x.isdigit() and int(x) >= 1
                            ),
                        ]
                        num_options_answer = inquirer.prompt(num_options_question)
                        num_options = int(num_options_answer["num_options"])
                        
                        options = []
                        for j in range(num_options):
                            option_id_question = [
                                inquirer.Text(
                                    "option_id",
                                    message=f"Option {j + 1} ID:",
                                    default=f"option{j + 1}"
                                ),
                            ]
                            option_id_answer = inquirer.prompt(option_id_question)
                            
                            option_name_question = [
                                inquirer.Text(
                                    "option_name",
                                    message=f"Option {j + 1} Name:",
                                    default=f"Option {j + 1}"
                                ),
                            ]
                            option_name_answer = inquirer.prompt(option_name_question)
                            
                            options.append({
                                "id": option_id_answer["option_id"],
                                "name": option_name_answer["option_name"],
                            })
                    else:
                        is_dynamic = True
                        dynamic_config_questions = [
                            inquirer.Text(
                                "custom_type",
                                message="Type property value (e.g., options, user-select):",
                                default="options"
                            ),
                            inquirer.Text(
                                "module",
                                message="Module/API name:",
                                validate=lambda _, x: validate_model_name(x)
                            ),
                            inquirer.Text(
                                "option_label",
                                message="Option label field:",
                                default="name"
                            ),
                            inquirer.Text(
                                "option_value",
                                message='Option value field (leave empty for "id"):',
                                default=""
                            ),
                        ]
                        dynamic_config_answers = inquirer.prompt(dynamic_config_questions)
                        
                        module_name = dynamic_config_answers["module"]
                        option_label = dynamic_config_answers["option_label"].strip()
                        option_value = dynamic_config_answers["option_value"].strip() or None
                        field_info["formType"] = dynamic_config_answers["custom_type"].strip()
                    
                    multiple_question = [
                        inquirer.Confirm(
                            "multiple",
                            message="Allow multiple selection?",
                            default=False
                        ),
                    ]
                    multiple_answer = inquirer.prompt(multiple_question)
                    is_multiple = multiple_answer["multiple"]
                
                frontend_field = {
                    "name": field_name,
                    "type": field_type,
                    "formType": field_info["formType"],
                    "rules": field_info["validation"],
                    "col": field_info["col"],
                    "showInTable": show_in_table_answer["show_in_table"],
                    "tableDisplay": field_info["tableDisplay"],
                    "description": description_answer["description"],
                    "options": options,
                    "isDynamic": is_dynamic,
                    "moduleName": module_name,
                    "optionLabel": option_label,
                    "optionValue": option_value,
                    "multiple": is_multiple,
                }
                frontend_fields.append(frontend_field)
            
            print(f"      ✓ Added: {field_name}")
        
        # STEP 5: Relationships
        relationships = []
        models_to_create = []
        is_update = False  # fullstack-generator always creates new modules
        
        if gen_backend:
            print("\n📝 Step 5: Relationships")
            print("─────────────────────────────────────────────────────────")
            print("   ✅ belongsTo    - Many-to-One (stores foreign key)")
            print("   ✅ hasOne       - One-to-One (referenced or embedded)")
            print("   ✅ hasMany      - One-to-Many (foreign key in related model)")
            print("   ✅ belongsToMany- Many-to-Many (array of IDs, NO pivot)")
            
            add_relationships_question = [
                inquirer.Confirm(
                    "add_relationships",
                    message="Add relationships?",
                    default=False
                ),
            ]
            add_relationships_answer = inquirer.prompt(add_relationships_question)
            
            if add_relationships_answer["add_relationships"]:
                num_relations_question = [
                    inquirer.Text(
                        "num_relations",
                        message="How many relationships?",
                        default="0",
                        validate=lambda _, x: x.isdigit() and int(x) >= 0
                    ),
                ]
                num_relations_answer = inquirer.prompt(num_relations_question)
                num_relations = int(num_relations_answer["num_relations"])
                
                relationship_type_options = ["belongsTo", "hasOne", "hasMany", "belongsToMany"]
                
                for i in range(num_relations):
                    print(f"\n   Relationship {i + 1}:")
                    
                    rel_questions = [
                        inquirer.List(
                            "relation_type",
                            message="Type:",
                            choices=relationship_type_options,
                        ),
                        inquirer.Text(
                            "related_model",
                            message="Related model name:",
                            validate=lambda _, x: validate_model_name(x)
                        ),
                    ]
                    rel_answers = inquirer.prompt(rel_questions)
                    
                    relation_type = rel_answers["relation_type"]
                    related_model = rel_answers["related_model"]
                    
                    related_model_exists = check_backend_model_exists(
                        backend_path,
                        related_model
                    )
                    create_related_model = False
                    
                    if not related_model_exists:
                        print(f"      ⚠️  Warning: {related_model} model doesn't exist yet!")
                        
                        create_choice_question = [
                            inquirer.Confirm(
                                "create_choice",
                                message=f"Auto-create {related_model} module?",
                                default=True
                            ),
                        ]
                        create_choice_answer = inquirer.prompt(create_choice_question)
                        
                        if create_choice_answer["create_choice"]:
                            create_related_model = True
                            print(f"      ✓ Will create {related_model} model")
                        else:
                            continue_anyway_question = [
                                inquirer.Confirm(
                                    "continue_anyway",
                                    message="Continue anyway?",
                                    default=False
                                ),
                            ]
                            continue_anyway_answer = inquirer.prompt(continue_anyway_question)
                            
                            if not continue_anyway_answer["continue_anyway"]:
                                print(f"      ⏭️  Skipped relationship with {related_model}")
                                continue
                    
                    method_name_question = [
                        inquirer.Text(
                            "method_name",
                            message="Method name:",
                            default=related_model.lower()
                        ),
                    ]
                    method_name_answer = inquirer.prompt(method_name_question)
                    method_name = method_name_answer["method_name"]
                    
                    relation_info = RELATIONSHIP_TYPES.get(relation_type)
                    
                    if not relation_info:
                        print(f"      ⚠️  Unknown type: {relation_type}, skipping...")
                        continue
                    
                    foreign_key_name = None
                    local_key = None
                    inverse_method_name = None
                    add_inverse_relationship = False
                    
                    if relation_type == "belongsTo":
                        default_fk = f"{related_model.lower()}_id"
                        foreign_key_question = [
                            inquirer.Text(
                                "foreign_key",
                                message="Foreign key field:",
                                default=default_fk
                            ),
                        ]
                        foreign_key_answer = inquirer.prompt(foreign_key_question)
                        foreign_key_name = foreign_key_answer["foreign_key"]
                        
                        if not is_update:
                            backend_fillable.append(foreign_key_name)
                            backend_validations.append({
                                "name": foreign_key_name,
                                "type": "string",
                                "rule": "required|string",
                                "updateRule": "required|string",
                                "testValue": '"507f1f77bcf86cd799439011"',
                                "updateValue": '"507f1f77bcf86cd799439012"',
                            })
                        
                        print(f"      ✓ Field: {foreign_key_name} (string)")
                        
                        if related_model_exists or create_related_model:
                            add_inverse_question = [
                                inquirer.Confirm(
                                    "add_inverse",
                                    message=f"Add inverse hasMany to {related_model}?",
                                    default=False
                                ),
                            ]
                            add_inverse_answer = inquirer.prompt(add_inverse_question)
                            
                            if add_inverse_answer["add_inverse"]:
                                add_inverse_relationship = True
                                default_inverse = name.lower() + "s"
                                
                                inverse_method_question = [
                                    inquirer.Text(
                                        "inverse_method",
                                        message=f"Method name in {related_model}:",
                                        default=default_inverse
                                    ),
                                ]
                                inverse_method_answer = inquirer.prompt(inverse_method_question)
                                inverse_method_name = inverse_method_answer["inverse_method"]
                    
                    elif relation_type == "belongsToMany":
                        print(f"      ℹ️  MongoDB uses array of IDs (no pivot table needed)")
                        default_array_field = f"{related_model.lower()}_ids"
                        array_field_question = [
                            inquirer.Text(
                                "array_field",
                                message="Array field name:",
                                default=default_array_field
                            ),
                        ]
                        array_field_answer = inquirer.prompt(array_field_question)
                        foreign_key_name = array_field_answer["array_field"]
                        
                        if not is_update:
                            backend_fillable.append(foreign_key_name)
                            backend_validations.append({
                                "name": foreign_key_name,
                                "type": "array",
                                "rule": "nullable|array",
                                "updateRule": "nullable|array",
                                "testValue": "['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']",
                                "updateValue": "['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014']",
                            })
                        
                        print(f"      ✓ Field: {foreign_key_name} (array)")
                        
                        inverse_field = None
                        add_inverse_question = [
                            inquirer.Confirm(
                                "add_inverse",
                                message=f"Add inverse belongsToMany to {related_model}?",
                                default=False
                            ),
                        ]
                        add_inverse_answer = inquirer.prompt(add_inverse_question)
                        
                        if add_inverse_answer["add_inverse"]:
                            add_inverse_relationship = True
                            default_inverse = name.lower() + "s"
                            
                            inverse_answers_questions = [
                                inquirer.Text(
                                    "inverse_method",
                                    message=f"Method name in {related_model}:",
                                    default=default_inverse
                                ),
                                inquirer.Text(
                                    "inverse_field",
                                    message="Array field name in related model:",
                                    default=f"{name.lower()}_ids"
                                ),
                            ]
                            inverse_answers = inquirer.prompt(inverse_answers_questions)
                            
                            inverse_method_name = inverse_answers["inverse_method"]
                            inverse_field = inverse_answers["inverse_field"]
                            
                            if create_related_model:
                                existing_model = next(
                                    (m for m in models_to_create if m["name"] == related_model),
                                    None
                                )
                                if not existing_model:
                                    model = {
                                        "name": related_model,
                                        "fields": [
                                            {
                                                "name": inverse_field,
                                                "type": "array",
                                            }
                                        ],
                                        "relationships": [],
                                        "relatedModels": [name],
                                    }
                                    models_to_create.append(model)
                                else:
                                    if not any(f["name"] == inverse_field for f in existing_model["fields"]):
                                        existing_model["fields"].append({
                                            "name": inverse_field,
                                            "type": "array",
                                        })
                        
                        sync_choice_question = [
                            inquirer.List(
                                "sync_choice",
                                message="Which Repository should manage this relationship (attach/detach)?",
                                choices=[f"{name} Repository", f"{related_model} Repository"],
                                default=f"{name} Repository",
                            ),
                        ]
                        sync_choice_answer = inquirer.prompt(sync_choice_question)
                        
                        add_sync_methods = False
                        add_inverse_sync_methods = False
                        
                        if sync_choice_answer["sync_choice"] == f"{name} Repository":
                            add_sync_methods = True
                            add_inverse_sync_methods = False
                            print(f"      ✓ {name} Repository will manage the relationship")
                        else:
                            add_sync_methods = False
                            add_inverse_sync_methods = True
                            print(f"      ✓ {related_model} Repository will manage the relationship")
                        
                        local_key = {
                            "inverseField": inverse_field or f"{name.lower()}_ids",
                            "addSyncMethods": add_sync_methods,
                            "addInverseSyncMethods": add_inverse_sync_methods,
                        }
                        
                        if create_related_model and add_inverse_sync_methods:
                            existing_model = next(
                                (m for m in models_to_create if m["name"] == related_model),
                                None
                            )
                            if existing_model:
                                existing_model["addSyncMethods"] = True
                    
                    relationship = {
                        "type": relation_type,
                        "relatedModel": related_model,
                        "methodName": method_name,
                        "foreignKey": foreign_key_name,
                        "localKey": local_key,
                        "embedded": relation_info.get("embedded", False),
                        "createModel": create_related_model,
                        "inverseMethod": inverse_method_name,
                        "addInverse": add_inverse_relationship,
                        "inverseType": relation_info["inverse"],
                    }
                    relationships.append(relationship)
                    
                    print(f"      ✓ Added: {method_name} ({relation_type})")
        
        # STEP 6: Create missing models
        if models_to_create:
            print(f"\n📝 Step 6: Creating Related Models")
            print("─────────────────────────────────────────────────────────")
            
            for model in models_to_create:
                model_name = model["name"]
                print(f"\n   Creating module for {model_name}...")
                
                model_namekebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', model_name).lower()
                model_name_fillable = ["name"]
                
                try:
                    create_backend_file(
                        "Model",
                        backend_path,
                        "model.txt",
                        model_name,
                        model_namekebab,
                        model_name_fillable,
                    )
                    print("      ✓ Model created")
                    
                    create_backend_file(
                        "Repository",
                        backend_path,
                        "repositories.txt",
                        model_name,
                        model_namekebab,
                        model_name_fillable,
                    )
                    print("      ✓ Repository created")
                    
                    create_backend_file(
                        "Service",
                        backend_path,
                        "services.txt",
                        model_name,
                        model_namekebab,
                        model_name_fillable,
                        [
                            {
                                "name": "name",
                                "rule": "required|string|max:255",
                                "updateRule": "required|string|max:255",
                            }
                        ],
                    )
                    print("      ✓ Service created")
                    
                    create_backend_file(
                        "Controller",
                        backend_path,
                        "controller.txt",
                        model_name,
                        model_namekebab,
                        model_name_fillable,
                    )
                    print("      ✓ Controller created")
                    
                    register_backend_route(backend_path, model_name)
                    print("      ✓ Route registered")
                except Exception as err:
                    print(f"      ❌ Error: {err}")
        
        # STEP 7: Generate main module
        step_num = 7 if models_to_create else 6
        print(f"\n📝 Step {step_num}: Generating Module")
        print("─────────────────────────────────────────────────────────")
        
        if gen_backend:
            try:
                create_backend_file(
                    "Model",
                    backend_path,
                    "model.txt",
                    name,
                    namekebab,
                    backend_fillable,
                    [],
                    relationships,
                )
                print("   ✓ Model created")
                
                create_backend_file(
                    "Repository",
                    backend_path,
                    "repositories.txt",
                    name,
                    namekebab,
                    backend_fillable,
                    [],
                    relationships,
                )
                print("   ✓ Repository created")
                
                create_backend_file(
                    "Service",
                    backend_path,
                    "services.txt",
                    name,
                    namekebab,
                    backend_fillable,
                    backend_validations,
                )
                print("   ✓ Service created")
                
                create_backend_file(
                    "Controller",
                    backend_path,
                    "controller.txt",
                    name,
                    namekebab,
                    backend_fillable,
                )
                print("   ✓ Controller created")
                
                create_backend_file(
                    "Routes",
                    backend_path,
                    "route.txt",
                    name,
                    namekebab,
                    backend_fillable,
                )
                print("   ✓ Routes created")
                
                create_backend_file(
                    "ControllerTest",
                    backend_path,
                    "test.txt",
                    name,
                    namekebab,
                    backend_fillable,
                    backend_validations,
                )
                print("   ✓ Test created")
                
                register_backend_route(backend_path, name)
                print("   ✓ Route registered")
                
                # Add inverse relationships
                has_inverse_relationships = any(
                    r.get("addInverse") and r.get("inverseMethod")
                    for r in relationships
                )
                
                if has_inverse_relationships:
                    print(f"\n   Adding Inverse Relationships...")
                    
                    for rel in relationships:
                        if rel.get("addInverse") and rel.get("inverseMethod"):
                            related_model_exists = check_backend_model_exists(
                                backend_path,
                                rel["relatedModel"]
                            )
                            
                            if not related_model_exists:
                                print(f"   ❌ Model {rel['relatedModel']} not found!")
                                continue
                            
                            inverse_type = rel.get("inverseType", RELATIONSHIP_TYPES[rel["type"]]["inverse"])
                            if not inverse_type:
                                print(f"   ⚠️  No inverse type defined for {rel['type']}")
                                continue
                            
                            inverse_rel = {
                                "type": inverse_type,
                                "relatedModel": name,
                                "methodName": rel["inverseMethod"],
                                "foreignKey": (
                                    rel["localKey"]["inverseField"]
                                    if rel["type"] == "belongsToMany" and "localKey" in rel
                                    else rel["foreignKey"]
                                ),
                                "localKey": (
                                    {"inverseField": rel["foreignKey"]}
                                    if rel["type"] == "belongsToMany"
                                    else None
                                ),
                                "embedded": False,
                            }
                            
                            inverse_code = generate_single_relationship(inverse_rel)
                            
                            try:
                                add_relationship_to_model(
                                    backend_path,
                                    rel["relatedModel"],
                                    {
                                        "name": rel["inverseMethod"],
                                        "code": inverse_code,
                                    },
                                    name,
                                )
                            except Exception as error:
                                print(f"   ❌ Error adding relationship: {error}")
            except Exception as err:
                print(f"   ❌ Error: {err}")
        
        if gen_frontend:
            try:
                create_frontend_file(
                    "API",
                    frontend_path,
                    "api.txt",
                    name,
                    namekebab,
                    name_lower,
                    frontend_fields,
                )
                print("   ✓ API file created")
                
                create_frontend_file(
                    "Page",
                    frontend_path,
                    "page.txt",
                    name,
                    namekebab,
                    name_lower,
                    frontend_fields,
                )
                print("   ✓ Page component created")
                
                create_frontend_file(
                    "Router",
                    frontend_path,
                    "router.txt",
                    name,
                    namekebab,
                    name_lower,
                    frontend_fields,
                )
                print("   ✓ Router file created")
                
                update_frontend_router_index(frontend_path, name)
                print("   ✓ Router index updated")
                
                translations = generate_translations(name_lower, frontend_fields)
                print("\n📝 Translation Keys (add to your i18n file):")
                print("─────────────────────────────────────────────────────────")
                print(json.dumps(translations, indent=2))
            except Exception as err:
                print(f"   ❌ Error: {err}")
        
        display_completion_banner()
        
        print("📊 Summary:")
        print(f"   Module: {name}")
        print(f"   Route: /{namekebab}")
        if gen_backend:
            print(f"   Backend Fields: {len(backend_fillable)}")
            print(f"   Relationships: {len(relationships)}")
        if gen_frontend:
            print(f"   Frontend Fields: {len(frontend_fields)}")
        print("\n")
        
        continue_question = [
            inquirer.Confirm(
                "continue_loop",
                message="Would you like to perform another action?",
                default=True
            ),
        ]
        continue_answer = inquirer.prompt(continue_question)
        
        if continue_answer["continue_loop"]:
            main_menu()
        else:
            print("\nGoodbye! 👋\n")
            sys.exit(0)
    except Exception as error:
        print(f"\n❌ Error: {error}")
        sys.exit(1)

# ============================================================================
# MAIN MENU
# ============================================================================

def main_menu():
    display_banner()
    
    try:
        questions = [
            inquirer.List(
                "action",
                message="What would you like to do?",
                choices=[
                    ("✨ Create new module", "create"),
                    ("📦 Batch mode (from JSON file)", "batch"),
                    ("🤖 AI & ClickUp mode", "ai-clickup"),
                    ("📋 Generate example config", "example"),
                    ("🗑️  Delete module", "delete"),
                    ("❌ Exit", "exit"),
                ],
            ),
        ]
        answers = inquirer.prompt(questions)
        action = answers["action"]
        
        if action == "exit":
            print("\nGoodbye! 👋\n")
            sys.exit(0)
        elif action == "create":
            wizard()
        elif action == "batch":
            batch_mode_wizard()
        elif action == "ai-clickup":
            ai_clickup_mode_wizard()
        elif action == "example":
            generate_example_config()
            main_menu()
        elif action == "delete":
            delete_module_wizard()
    except Exception as error:
        print(f"\n❌ Error: {error}")
        sys.exit(1)

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)