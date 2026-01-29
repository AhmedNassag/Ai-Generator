"""
Generator functions module - Field generation, translations, and rendering.
Senior-grade: Pure functions with type hints and clean separation of concerns.
"""

import re
import json
from typing import Dict, List, Any


class FieldGenerator:
    """Generate frontend form fields, table columns, and translations."""

    @staticmethod
    def generate_table_columns(fields: List[Dict], name_lower: str) -> str:
        """Generate table column definitions for Vue DataTable."""
        columns = []
        for field in fields:
            if field.get("showInTable", True):
                field_name = field["name"]
                
                if field.get("tableDisplay") == "boolean":
                    col = f'{{ id: "{field_name}", title: this.$t("{name_lower}.{field_name}"), data: "{field_name}", defaultContent: "N/A", render: (data) => data ? "✓" : "✗" }}'
                elif field.get("tableDisplay") == "date":
                    col = f'{{ id: "{field_name}", title: this.$t("{name_lower}.{field_name}"), data: "{field_name}", defaultContent: "N/A", render: (data) => new Date(data).toLocaleDateString() }}'
                else:
                    col = f'{{ id: "{field_name}", title: this.$t("{name_lower}.{field_name}"), data: "{field_name}", defaultContent: "N/A" }}'
                
                columns.append(f"      {col},")
        
        return "\n".join(columns)

    @staticmethod
    def format_options_array(options: List[Dict]) -> str:
        """Format options array for form field display."""
        if not options:
            return "[]"
        
        options_str = ",\n".join([
            f'''          {{
            id: "{opt["id"]}",
            name: "{opt["name"]}"
          }}''' for opt in options
        ])
        
        return f"[\n{options_str}\n        ]"

    @staticmethod
    def generate_form_fields(fields: List[Dict], name_lower: str) -> str:
        """Generate form field definitions for Vue component."""
        form_fields = []

        for field in fields:
            from config import FIELD_TYPES
            
            field_type = field.get("type", "")
            field_info = FIELD_TYPES.get(field_type, {})
            has_options = getattr(field_info, 'has_options', False) if hasattr(field_info, 'has_options') else False

            field_obj_lines = [
                f'      {{',
                f'        name: "{field["name"]}",',
                f'        label: this.$t("{name_lower}.{field["name"]}"),',
                f'        type: "{getattr(field_info, "form_type", "text")}",',
                f'        col: {field.get("col", getattr(field_info, "col", 6))}'
            ]

            # Add rules
            rules = field.get("rules") or getattr(field_info, "validation", "")
            if rules:
                rules_array = rules.split("|")
                if "required" in rules_array:
                    field_obj_lines.append('        rules: "required"')
                elif "nullable" in rules_array:
                    field_obj_lines.append('        rules: "nullable"')

            # Handle dynamic options
            is_dynamic = field.get("isDynamic", False)
            module_name = field.get("moduleName") or field.get("options") or ""
            module_name_valid = bool(module_name) and module_name not in ("None", "null")

            if is_dynamic and module_name_valid:
                field_obj_lines.append(f'        options: "{module_name}"')
                field_obj_lines.append(f'        optionLabel: "{field.get("optionLabel", "name")}"')
                option_value = field.get("optionValue") or "id"
                field_obj_lines.append(f'        optionValue: "{option_value}"')
            elif has_options:
                options = field.get("options")
                if isinstance(options, str) and options.strip() and options not in ("None", "null"):
                    field_obj_lines.append(f'        options: "{options}"')
                    field_obj_lines.append('        optionLabel: "name"')
                elif isinstance(options, list) and options:
                    field_obj_lines.append(f'        options: {FieldGenerator.format_options_array(options)}')
                    field_obj_lines.append('        optionLabel: "name"')

            # Handle multiple selection
            if field.get("multiple") or field.get("isMultiple"):
                field_obj_lines.append('        multiple: true')

            # Add description if present
            if field.get("description"):
                field_obj_lines.append(f'        description: "{field.get("description")}"')

            field_obj_lines.append('      }')
            form_fields.append("\n".join(field_obj_lines))

        return ",\n".join(form_fields)

    @staticmethod
    def generate_translations(name_lower: str, fields: List[Dict]) -> Dict:
        """Generate i18n translation keys from fields."""
        translations = {
            name_lower: {
                name_lower: name_lower.capitalize()
            }
        }

        for field in fields:
            # Convert field name to readable label
            label = field["name"]
            label = re.sub(r'_', ' ', label)
            label = re.sub(r'([A-Z])', r' \1', label)
            label = ' '.join(word.capitalize() for word in label.split())

            translations[name_lower][field["name"]] = label.strip()

        return translations
