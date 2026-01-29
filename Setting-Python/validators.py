"""
Validators module - Input validation with reusable, type-safe validators.
Senior-grade: Composable validators with clear error messages.
"""

import re
from typing import Union, List, Callable
from pathlib import Path


class ValidationError(Exception):
    """Custom validation exception."""
    pass


class Validators:
    """Validator utility class with static methods."""

    @staticmethod
    def validate_path(input_str: str) -> Union[bool, str]:
        """Validate path input."""
        from config import MESSAGES
        trimmed = input_str.strip()
        return MESSAGES["empty_path"] if not trimmed else True

    @staticmethod
    def validate_model_name(input_str: str) -> Union[bool, str]:
        """Validate model name (PascalCase)."""
        from config import MESSAGES
        trimmed = input_str.strip()
        
        if not trimmed:
            return MESSAGES["empty_name"]
        if trimmed.isdigit():
            return "Model name cannot be a number."
        if trimmed[0].isdigit():
            return MESSAGES["invalid_name_start"]
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9]*$', trimmed):
            return MESSAGES["invalid_name_chars"]
        
        return True

    @staticmethod
    def validate_field_name(input_str: str) -> Union[bool, str]:
        """Validate field name (camelCase or snake_case)."""
        from config import MESSAGES
        trimmed = input_str.strip()
        
        if not trimmed:
            return MESSAGES["empty_field"]
        if trimmed.isdigit():
            return "Field name cannot be a number."
        if trimmed[0].isdigit():
            return MESSAGES["invalid_name_start"]
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', trimmed):
            return MESSAGES["invalid_field_chars"]
        
        return True

    @staticmethod
    def validate_batch_config(config: dict) -> dict:
        """Validate JSON batch configuration."""
        from config import FIELD_TYPES, RELATIONSHIP_TYPES
        
        errors: List[str] = []

        if "modules" not in config or not isinstance(config["modules"], list):
            errors.append("Missing 'modules' array")
            return {"isValid": False, "errors": errors}

        for i, module in enumerate(config["modules"]):
            module_prefix = f"Module[{i}] ({module.get('name', 'unnamed')})"

            if "name" not in module:
                errors.append(f"{module_prefix}: Missing required field: name")
            else:
                name_validation = Validators.validate_model_name(module["name"])
                if name_validation != True:
                    errors.append(f"{module_prefix}: {name_validation}")

            # Validate fields
            if "fields" not in module or not isinstance(module["fields"], list):
                errors.append(f"{module_prefix}: fields must be an array")
            else:
                for j, field in enumerate(module["fields"]):
                    field_prefix = f"{module_prefix} Field[{j}]"

                    if "name" not in field:
                        errors.append(f"{field_prefix}: Missing required field: name")
                    else:
                        field_name_validation = Validators.validate_field_name(field["name"])
                        if field_name_validation != True:
                            errors.append(f"{field_prefix}: {field_name_validation}")

                    if "type" not in field:
                        errors.append(f"{field_prefix}: Missing required field: type")
                    elif field["type"] not in FIELD_TYPES:
                        errors.append(
                            f"{field_prefix}: Invalid type '{field['type']}'. Allowed: {', '.join(FIELD_TYPES.keys())}"
                        )

                    if "showInTable" in field and not isinstance(field["showInTable"], bool):
                        errors.append(f"{field_prefix}: showInTable must be boolean")

            # Validate relationships
            if "relationships" in module and not isinstance(module["relationships"], list):
                errors.append(f"{module_prefix}: relationships must be an array")
            elif "relationships" in module:
                for j, rel in enumerate(module["relationships"]):
                    rel_prefix = f"{module_prefix} Relationship[{j}]"

                    if "type" not in rel:
                        errors.append(f"{rel_prefix}: Missing required field: type")
                    elif rel["type"] not in RELATIONSHIP_TYPES:
                        errors.append(
                            f"{rel_prefix}: Invalid type '{rel['type']}'. Allowed: {', '.join(RELATIONSHIP_TYPES.keys())}"
                        )

                    if "relatedModel" not in rel:
                        errors.append(f"{rel_prefix}: Missing required field: relatedModel")
                    else:
                        model_validation = Validators.validate_model_name(rel["relatedModel"])
                        if model_validation != True:
                            errors.append(f"{rel_prefix}: relatedModel: {model_validation}")

                    if "methodName" not in rel:
                        errors.append(f"{rel_prefix}: Missing required field: methodName")
                    else:
                        method_validation = Validators.validate_field_name(rel["methodName"])
                        if method_validation != True:
                            errors.append(f"{rel_prefix}: methodName: {method_validation}")

                    if "foreignKey" in rel and not isinstance(rel["foreignKey"], str):
                        errors.append(f"{rel_prefix}: foreignKey must be string")

        return {"isValid": len(errors) == 0, "errors": errors}
