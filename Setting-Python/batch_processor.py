"""
Batch processor module - Main orchestrator for module generation.
Senior-grade: Clean orchestration logic with separation of concerns.
"""

import re
from typing import Dict, List, Any, Optional
from config import FIELD_TYPES, RELATIONSHIP_TYPES
from file_ops import FileOps
from file_creator import FileCreator
from route_manager import RouteManager
from model_ops import ModelOps
from relationship_generator import RelationshipGenerator
from generator_functions import FieldGenerator


class FieldConverter:
    """Convert batch field configuration to backend/frontend formats."""

    @staticmethod
    def convert_fields(fields: List[Dict], model_name: str) -> Dict:
        """Convert field configs to backend and frontend formats."""
        backend_fillable = []
        backend_validations = []
        frontend_fields = []

        for field in fields:
            field_type = field["type"]
            field_info = FIELD_TYPES.get(field_type)
            if not field_info:
                continue

            # Backend fillable
            backend_fillable.append(field["name"])

            # Backend validations
            backend_validations.append({
                "name": field["name"],
                "type": field_type,
                "rule": field_info.validation,
                "updateRule": field_info.update_validation,
                "testValue": field_info.test_value,
                "updateValue": field_info.update_value
            })

            # Frontend field
            frontend_field = {
                "name": field["name"],
                "type": field_type,
                "formType": field_info.form_type,
                "rules": field_info.validation,
                "col": field_info.col,
                "showInTable": field.get("showInTable", True),
                "tableDisplay": field_info.table_display,
                "description": field.get("description", ""),
            }

            if "options" in field:
                frontend_field["options"] = field["options"]

            if field.get("isDynamic"):
                frontend_field.update({
                    "isDynamic": True,
                    "moduleName": field.get("module"),
                    "optionLabel": field.get("optionLabel", "name"),
                    "optionValue": field.get("optionValue")
                })

            if field.get("isMultiple"):
                frontend_field["multiple"] = True

            frontend_fields.append(frontend_field)

        return {
            "backendFillable": backend_fillable,
            "backendValidations": backend_validations,
            "frontendFields": frontend_fields
        }


class BatchModuleProcessor:
    """Process a single module from batch configuration."""

    @staticmethod
    def _get_default_inverse_method(rel_type: str, model_name: str) -> str:
        """Get default inverse method name."""
        lower_name = model_name.lower()
        if rel_type in ["hasMany", "belongsToMany"]:
            return lower_name + "s"
        return lower_name

    @staticmethod
    async def process(
        module_config: Dict,
        backend_path: str,
        frontend_path: str,
        gen_backend: bool,
        gen_frontend: bool
    ) -> Dict:
        """Process a single module from batch config."""
        result = {
            "name": module_config["name"],
            "success": False,
            "errors": [],
            "warnings": []
        }

        try:
            name = module_config["name"]
            name_kebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', name).lower()
            name_lower = name.lower()

            # Convert fields
            field_conv = FieldConverter.convert_fields(module_config.get("fields", []), name)
            backend_fillable = field_conv["backendFillable"]
            backend_validations = field_conv["backendValidations"]
            frontend_fields = field_conv["frontendFields"]

            # Process relationships
            relationships = await BatchModuleProcessor._process_relationships(
                module_config.get("relationships", []),
                name,
                backend_fillable,
                backend_validations
            )

            # Generate backend
            if gen_backend:
                await BatchModuleProcessor._generate_backend(
                    backend_path,
                    name,
                    name_kebab,
                    backend_fillable,
                    backend_validations,
                    relationships,
                    result
                )

            # Generate frontend
            if gen_frontend:
                await BatchModuleProcessor._generate_frontend(
                    frontend_path,
                    name,
                    name_kebab,
                    name_lower,
                    frontend_fields,
                    result
                )

            result["success"] = len(result["errors"]) == 0
            return result

        except Exception as error:
            result["errors"].append(str(error))
            return result

    @staticmethod
    async def _process_relationships(
        module_rels: List[Dict],
        model_name: str,
        backend_fillable: List[str],
        backend_validations: List[Dict]
    ) -> List[Dict]:
        """Convert relationship configs."""
        relationships = []

        for rel in module_rels:
            rel_type = rel["type"]
            rel_info = RELATIONSHIP_TYPES.get(rel_type)
            if not rel_info:
                continue

            relationship = {
                "methodName": rel["methodName"],
                "type": rel_type,
                "relatedModel": rel["relatedModel"],
                "foreignKey": rel.get("foreignKey", f"{rel['relatedModel'].lower()}_id"),
                "localKey": rel.get("localKey"),
                "inverse": True,
                "inverseMethod": rel.get("inverseMethod", BatchModuleProcessor._get_default_inverse_method(rel_type, model_name)),
                "inverseType": rel.get("inverseType", rel_info.inverse)
            }

            # Add FK fields for belongsTo/belongsToMany
            if rel_type == "belongsTo":
                if relationship["foreignKey"] not in backend_fillable:
                    backend_fillable.append(relationship["foreignKey"])
                    backend_validations.append({
                        "name": relationship["foreignKey"],
                        "type": "string",
                        "rule": "required|string",
                        "updateRule": "required|string",
                        "testValue": '"507f1f77bcf86cd799439011"',
                        "updateValue": '"507f1f77bcf86cd799439012"'
                    })
            elif rel_type == "belongsToMany":
                fk = relationship["foreignKey"]
                if fk not in backend_fillable:
                    backend_fillable.append(fk)
                    backend_validations.append({
                        "name": fk,
                        "type": "array",
                        "rule": "nullable|array",
                        "updateRule": "nullable|array",
                        "testValue": "['507f1f77bcf86cd799439011']",
                        "updateValue": "['507f1f77bcf86cd799439013']"
                    })

                inv_field = relationship.get("localKey", {}).get("inverseField") or f"{model_name.lower()}_ids"
                relationship["localKey"] = {
                    "inverseField": inv_field,
                    "addSyncMethods": True
                }

            relationships.append(relationship)

        return relationships

    @staticmethod
    async def _generate_backend(
        backend_path: str,
        name: str,
        name_kebab: str,
        backend_fillable: List[str],
        backend_validations: List[Dict],
        relationships: List[Dict],
        result: Dict
    ) -> None:
        """Generate backend files."""
        model_exists = await FileOps.check_backend_model_exists(backend_path, name)

        if model_exists:
            # Update existing model
            existing_fields = await FileOps.get_existing_fields(backend_path, name)
            for field in backend_fillable:
                if field not in existing_fields:
                    await FileOps.add_field_to_model(backend_path, name, field)

            for rel in relationships:
                try:
                    await ModelOps.add_relationship(
                        backend_path,
                        name,
                        {
                            "name": rel["methodName"],
                            "code": RelationshipGenerator.generate_single_relationship(rel)
                        },
                        rel["relatedModel"]
                    )
                except Exception as err:
                    result["warnings"].append(str(err))
        else:
            # Create new backend files
            backend_files = [
                ("Model", "model.txt"),
                ("Repository", "repositories.txt"),
                ("Service", "services.txt"),
                ("Controller", "controller.txt"),
                ("Routes", "route.txt"),
                ("ControllerTest", "test.txt")
            ]

            for file_type, template in backend_files:
                await FileCreator.create_backend_file(
                    file_type,
                    backend_path,
                    template,
                    name,
                    name_kebab,
                    backend_fillable,
                    backend_validations if file_type in ["Service", "ControllerTest"] else [],
                    relationships if file_type in ["Model", "Repository"] else []
                )

            await RouteManager.register_backend_route(backend_path, name)

        result["backend"] = {"model": "✓"}

        # Handle inverse relationships
        for rel in relationships:
            if rel.get("inverse") and rel.get("inverseMethod"):
                try:
                    related_exists = await FileOps.check_backend_model_exists(backend_path, rel["relatedModel"])
                    if not related_exists:
                        continue

                    inv_type = rel.get("inverseType", RELATIONSHIP_TYPES[rel["type"]].inverse)
                    inverse_rel = {
                        "methodName": rel["inverseMethod"],
                        "type": inv_type,
                        "relatedModel": name,
                        "foreignKey": rel["localKey"]["inverseField"] if rel["type"] == "belongsToMany" else rel["foreignKey"],
                        "localKey": {"inverseField": rel["foreignKey"]} if rel["type"] == "belongsToMany" else None
                    }

                    inv_code = RelationshipGenerator.generate_single_relationship(inverse_rel)
                    await ModelOps.add_relationship(backend_path, rel["relatedModel"], {
                        "name": rel["inverseMethod"],
                        "code": inv_code
                    }, name)

                    if rel["type"] == "belongsToMany" and rel.get("localKey", {}).get("inverseField"):
                        inv_field = rel["localKey"]["inverseField"]
                        related_fields = await FileOps.get_existing_fields(backend_path, rel["relatedModel"])
                        if inv_field not in related_fields:
                            await FileOps.add_field_to_model(backend_path, rel["relatedModel"], inv_field)

                except Exception as err:
                    result["warnings"].append(f"Inverse rel {rel.get('inverseMethod')}: {err}")

    @staticmethod
    async def _generate_frontend(
        frontend_path: str,
        name: str,
        name_kebab: str,
        name_lower: str,
        frontend_fields: List[Dict],
        result: Dict
    ) -> None:
        """Generate frontend files."""
        frontend_files = [
            ("API", "api.txt"),
            ("Page", "page.txt"),
            ("Router", "router.txt")
        ]

        for file_type, template in frontend_files:
            await FileCreator.create_frontend_file(
                file_type,
                frontend_path,
                template,
                name,
                name_kebab,
                name_lower,
                frontend_fields if file_type == "Page" else None
            )

        await RouteManager.update_frontend_router_index(frontend_path, name)
        result["frontend"] = {"api": "✓", "page": "✓", "router": "✓"}
