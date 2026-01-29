"""
Relationship generator module - Generate PHP code for Eloquent relationships.
Senior-grade: Type-safe, clean code generation with validation.
"""

import re
from typing import Dict, List


class RelationshipGenerator:
    """Generate relationship code for PHP models."""

    @staticmethod
    def generate_single_relationship(rel: Dict) -> str:
        """Generate a single Eloquent relationship method."""
        from config import RELATIONSHIP_TYPES
        
        rel_info = RELATIONSHIP_TYPES.get(rel["type"])
        if not rel_info:
            return ""

        code = f'\n    /**\n     * {rel["type"]} relationship with {rel["relatedModel"]}'

        if rel["type"] == "belongsToMany":
            inv_field = rel.get("localKey", {}).get("inverseField") or f"{rel['relatedModel'].lower()}_ids"
            code += f"\n     * MongoDB: '{rel['foreignKey']}' in THIS model, '{inv_field}' in {rel['relatedModel']}"

        code += f'\n     */\n    public function {rel["methodName"]}()\n    {{'

        if rel["type"] in ["hasOne", "hasMany"]:
            code += f'\n        return $this->{rel_info.method}({rel["relatedModel"]}::class);\n    }}'
        elif rel["type"] == "belongsTo":
            code += f'\n        return $this->{rel_info.method}({rel["relatedModel"]}::class, \'{rel["foreignKey"]}\');\n    }}'
        elif rel["type"] == "belongsToMany":
            inv_field = rel.get("localKey", {}).get("inverseField") or f"{rel['relatedModel'].lower()}_ids"
            code += f'\n        return $this->{rel_info.method}({rel["relatedModel"]}::class, null, \'{inv_field}\', \'{rel["foreignKey"]}\');\n    }}'
        else:
            code += f'\n        return $this->{rel_info.method}({rel["relatedModel"]}::class, \'{rel["foreignKey"]}\');\n    }}'

        code += "\n"
        return code

    @staticmethod
    def generate_use_statements(relationships: List[Dict]) -> str:
        """Generate PHP use statements for related models."""
        if not relationships:
            return ""

        related_models = sorted(set(rel["relatedModel"] for rel in relationships))
        use_statements = "\n".join(f"use App\\Models\\{model}\\{model};" for model in related_models)

        return "\n" + use_statements if use_statements else ""

    @staticmethod
    def generate_relationship_methods(relationships: List[Dict]) -> str:
        """Generate all relationship methods for a PHP model."""
        if not relationships:
            return ""

        methods = "\n    /**\n     * RELATIONSHIPS\n     */\n"

        for rel in relationships:
            methods += RelationshipGenerator.generate_single_relationship(rel)

        return methods

    @staticmethod
    def generate_belongs_to_many_repository_methods(relationships: List[Dict], model_name: str) -> str:
        """Generate Repository create/update methods for belongsToMany relationships."""
        belongs_to_many_rels = [
            rel for rel in relationships
            if rel.get("type") == "belongsToMany" and rel.get("localKey", {}).get("addSyncMethods")
        ]

        if not belongs_to_many_rels:
            return ""

        model_var = model_name.lower()
        methods = "\n"

        methods += f'''    /**
     * Create a new {model_name} with belongsToMany relationships
     * 
     * @param array|null $data
     * @return {model_name}
     */
    public function create($data = null)
    {{
        ${model_var} = parent::create($data);
'''

        for rel in belongs_to_many_rels:
            methods += f'''        if (isset($data['{rel["foreignKey"]}'])) {{
            ${model_var}->{rel["methodName"]}()->attach($data['{rel["foreignKey"]}'] ?? []);
        }}
'''

        methods += f'''        return ${model_var};
    }}

    /**
     * Update {model_name} with belongsToMany relationships
     * 
     * @param mixed $id
     * @param array|null $data
     * @return {model_name}
     */
    public function update($id, $data = null)
    {{
        ${model_var} = parent::update($id, $data);
'''

        for rel in belongs_to_many_rels:
            methods += f'''        if (isset($data['{rel["foreignKey"]}'])) {{
            ${model_var}->{rel["methodName"]}()->detach();
            ${model_var}->{rel["methodName"]}()->attach($data['{rel["foreignKey"]}']);
        }}
'''

        methods += f'''        return ${model_var};
    }}'''

        return methods
