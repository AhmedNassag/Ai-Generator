"""
Model operations module - Handle relationships and field management for existing models.
Senior-grade: Focused on model manipulation with proper error handling.
"""

import re
from pathlib import Path
from typing import Dict, Optional
from relationship_generator import RelationshipGenerator


class ModelOps:
    """Operations on existing Eloquent models."""

    @staticmethod
    async def add_use_statement(backend_path: str, model_name: str, related_model: str) -> bool:
        """Add use statement to model for a related model."""
        model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"

        try:
            content = model_path.read_text(encoding="utf-8")
            use_stmt = f"use App\\Models\\{related_model}\\{related_model};"

            if use_stmt in content:
                return True

            # Find namespace end
            ns_match = re.search(r'namespace\s+([^;]+);', content)
            if not ns_match:
                return False

            ns_end_idx = content.find(";", ns_match.start()) + 1
            
            # Find class start
            cls_match = re.search(r'class\s+\w+', content)
            if not cls_match:
                return False

            cls_start_idx = cls_match.start()
            between = content[ns_end_idx:cls_start_idx]
            use_stmts = re.findall(r'use\s+[^;]*\\[^;]+;', between)

            if use_stmts:
                last_use = use_stmts[-1]
                last_idx = content.rfind(last_use)
                insert_pos = content.find(";", last_idx) + 1
            else:
                insert_pos = ns_end_idx

            new_content = content[:insert_pos] + "\n" + use_stmt + content[insert_pos:]
            model_path.write_text(new_content, encoding="utf-8")
            return True

        except Exception:
            return False

    @staticmethod
    async def add_relationship(
        backend_path: str,
        model_name: str,
        relationship_method: Dict,
        related_model: Optional[str] = None
    ) -> bool:
        """Add relationship method to existing model."""
        model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"

        try:
            content = model_path.read_text(encoding="utf-8")

            # Add use statement if needed
            if related_model:
                await ModelOps.add_use_statement(backend_path, model_name, related_model)
                content = model_path.read_text(encoding="utf-8")

            # Check if relationship exists
            if f"function {relationship_method['name']}()" in content:
                return False

            # Find last closing brace
            last_brace_idx = content.rfind("}")
            if last_brace_idx == -1:
                return False

            # Add relationship code
            has_rel_section = "RELATIONSHIPS" in content
            rel_code = ""
            
            if not has_rel_section:
                rel_code = "\n    /**\n     * ======================\n     * RELATIONSHIPS\n     * ======================\n     */\n"

            rel_code += relationship_method["code"]

            new_content = content[:last_brace_idx] + rel_code + "\n" + content[last_brace_idx:]
            model_path.write_text(new_content, encoding="utf-8")
            return True

        except Exception:
            return False
