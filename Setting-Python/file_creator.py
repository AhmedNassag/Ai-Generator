"""
File creation module - Create backend and frontend files from templates.
Senior-grade: DRY, with template substitution pattern and proper error handling.
"""

from pathlib import Path
from typing import List, Dict, Optional
from generator_functions import FieldGenerator
from relationship_generator import RelationshipGenerator


class FileCreator:
    """Create project files from templates with substitution."""

    @staticmethod
    async def create_backend_file(
        file_type: str,
        backend_path: str,
        template_file: str,
        name: str,
        name_kebab: str,
        name_fillable: List[str],
        validations: Optional[List[Dict]] = None,
        relationships: Optional[List[Dict]] = None
    ) -> None:
        """Create a backend file from template."""
        backend_path_obj = Path(backend_path)

        # Determine destination directory
        dest_dirs = {
            "Model": backend_path_obj / "app" / "Models" / name,
            "Repository": backend_path_obj / "app" / "Repositories" / "Eloquent" / name,
            "Service": backend_path_obj / "app" / "Services" / "Eloquent" / name,
            "ControllerTest": backend_path_obj / "tests" / "Unit" / name,
            "Routes": backend_path_obj / "routes" / "API" / "Modules" / name,
        }
        
        new_path = dest_dirs.get(file_type, backend_path_obj / "app" / "Http" / "Controllers" / name)
        new_path.mkdir(parents=True, exist_ok=True)

        # Determine file name
        file_names = {
            "Model": f"{name}.php",
            "ControllerTest": f"{name}ControllerTest.php",
            "Routes": f"{name}Routes.php",
        }
        
        file_name = file_names.get(file_type, f"{name}{file_type}.php")
        file_path = new_path / file_name

        # Read template
        template_path = backend_path_obj / "generator-setting-backend" / template_file
        if not template_path.exists():
            raise FileNotFoundError(f"Template not found: {template_path}")

        content = template_path.read_text(encoding="utf-8")

        # Replace basic placeholders
        fillable_formatted = ", ".join(f"'{field}'" for field in name_fillable) if name_fillable else ""
        content = content.replace("@@Name@@", name)
        content = content.replace("@@Namekebab@@", name_kebab)
        content = content.replace("@@NameFillable@@", fillable_formatted)

        # Model-specific replacements
        if file_type == "Model":
            use_stmts = RelationshipGenerator.generate_use_statements(relationships or [])
            rel_methods = RelationshipGenerator.generate_relationship_methods(relationships or [])
            content = content.replace("@@UseStatements@@", use_stmts)
            content = content.replace("@@Relationships@@", rel_methods)

        # Repository-specific replacements
        if file_type == "Repository" and relationships:
            btm_methods = RelationshipGenerator.generate_belongs_to_many_repository_methods(relationships, name)
            if btm_methods:
                last_brace_idx = content.rfind("}")
                if last_brace_idx != -1:
                    content = content[:last_brace_idx] + btm_methods + "\n" + content[last_brace_idx:]

        # Service-specific replacements
        if file_type == "Service" and validations:
            store_rules = "\n".join([
                f"                '{v['name']}' => '{v.get('rule', '').replace('@@table@@', name_kebab + 's')}',"
                for v in validations
            ])
            update_rules = "\n".join([
                f"                '{v['name']}' => '{v.get('updateRule', '').replace('@@table@@', name_kebab + 's')}',"
                for v in validations
            ])
            content = content.replace("@@StoreValidation@@", store_rules)
            content = content.replace("@@UpdateValidation@@", update_rules)

        # Test-specific replacements
        if file_type == "ControllerTest" and validations:
            test_data = "\n".join([f"            '{v['name']}' => {v.get('testValue', 'null')}," for v in validations])
            update_data = "\n".join([f"            '{v['name']}' => {v.get('updateValue', 'null')}," for v in validations])
            fields_list = ", ".join([f"'{v['name']}'" for v in validations])
            content = content.replace("@@TestData@@", test_data)
            content = content.replace("@@UpdateTestData@@", update_data)
            content = content.replace("@@FieldsList@@", fields_list)

        # Write file
        file_path.write_text(content, encoding="utf-8")

    @staticmethod
    async def create_frontend_file(
        file_type: str,
        frontend_path: str,
        template_file: str,
        name: str,
        name_kebab: str,
        name_lower: str,
        fields: Optional[List[Dict]] = None
    ) -> None:
        """Create a frontend file from template."""
        frontend_path_obj = Path(frontend_path)

        # Determine base path
        base_paths = {
            "API": frontend_path_obj / "src" / "API",
            "Router": frontend_path_obj / "src" / "router" / "modules",
            "Page": frontend_path_obj / "src" / "views" / "Page",
        }
        
        base_path = base_paths.get(file_type, frontend_path_obj / "src" / "views" / "Page")
        new_path = base_path / name
        new_path.mkdir(parents=True, exist_ok=True)

        # Determine file extension
        ext = ".vue" if file_type == "Page" else ".ts"
        file_path = new_path / f"{name}{ext}"

        # Read template
        template_path = frontend_path_obj / "generator-setting-frontend" / template_file
        if not template_path.exists():
            raise FileNotFoundError(f"Template not found: {template_path}")

        template = template_path.read_text(encoding="utf-8")

        # Replace basic placeholders
        template = template.replace("@@Name@@", name)
        template = template.replace("@@Namekebab@@", name_kebab)
        template = template.replace("@@name@@", name_lower)

        # Page-specific replacements
        if file_type == "Page" and fields:
            table_cols = FieldGenerator.generate_table_columns(fields, name_lower)
            form_fields = FieldGenerator.generate_form_fields(fields, name_lower)
            template = template.replace("@@TableColumns@@", table_cols)
            template = template.replace("@@FormFields@@", form_fields)

        # Write file
        file_path.write_text(template, encoding="utf-8")
