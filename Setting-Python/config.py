"""
Configuration module - Central constants and field/relationship types definitions.
Senior-grade: Immutable, type-safe configuration using dataclasses and Enum.
"""

from typing import Dict, Any, Final
from dataclasses import dataclass


@dataclass(frozen=True)
class FieldConfig:
    """Immutable field type configuration."""
    form_type: str
    validation: str
    update_validation: str
    table_display: str
    test_value: str
    update_value: str
    col: int
    has_options: bool = False


# Field types mapping - centralized, immutable
FIELD_TYPES: Final[Dict[str, FieldConfig]] = {
    "string": FieldConfig("text", "required|string|max:255", "required|string|max:255", "text", '"Sample text"', '"Updated sample text"', 6),
    "email": FieldConfig("text", "required|email|unique:@@table@@,email", "required|email|unique:@@table@@,email,{$id}", "text", '"test@example.com"', '"updated@example.com"', 6),
    "password": FieldConfig("password", "required|min:8", "nullable|min:8", "hidden", '"password123"', '"newpassword123"', 6),
    "phone": FieldConfig("text", "required|regex:/^([0-9\\s\\-\\+\\(\\)]*)$/|min:10|max:20", "required|regex:/^([0-9\\s\\-\\+\\(\\)]*)$/|min:10|max:20", "text", '"+1234567890"', '"+9876543210"', 6),
    "url": FieldConfig("text", "required|url|max:500", "required|url|max:500", "text", '"https://example.com"', '"https://updated.example.com"', 6),
    "number": FieldConfig("number", "required|integer|min:0", "required|integer|min:0", "number", "42", "52", 6),
    "integer": FieldConfig("number", "required|integer|min:0", "required|integer|min:0", "number", "42", "52", 6),
    "decimal": FieldConfig("number", "required|numeric|min:0", "required|numeric|min:0", "number", "99.99", "109.99", 6),
    "date": FieldConfig("date", "required|date", "required|date", "date", '"2024-01-01"', '"2024-12-31"', 6),
    "datetime": FieldConfig("datetime", "required|date", "required|date", "date", '"2024-01-01 10:30:00"', '"2024-12-31 15:45:00"', 6),
    "boolean": FieldConfig("checkbox", "required|boolean", "required|boolean", "boolean", "true", "false", 6),
    "checkbox": FieldConfig("checkbox", "required", "required", "boolean", "true", "false", 6),
    "image": FieldConfig("file", "nullable|image|mimes:jpeg,png,jpg,gif|max:2048", "nullable|image|mimes:jpeg,png,jpg,gif|max:2048", "image", "null", "null", 6),
    "file": FieldConfig("file", "nullable|file|mimes:pdf,doc,docx|max:5120", "nullable|file|mimes:pdf,doc,docx|max:5120", "file", "null", "null", 6),
    "array": FieldConfig("options", "required|array", "required|array", "text", "['item1', 'item2']", "['updated1', 'updated2', 'updated3']", 6, True),
    "lazy Select": FieldConfig("options", "required", "required", "text", '"option1"', '"option2"', 6, True),
    "user Select": FieldConfig("user-select", "required", "required", "text", '"option1"', '"option2"', 6, True),
    "team Select": FieldConfig("team-select", "required", "required", "text", '"option1"', '"option2"', 6, True),
    "textarea": FieldConfig("textarea", "required", "required", "text", '"Long text content"', '"Updated long text content"', 12),
    "json": FieldConfig("textarea", "required|json", "required|json", "text", '\'{"key": "value"}\'', '\'{"key": "updated_value", "new_key": "new_value"}\'', 12),
    "text": FieldConfig("textarea", "required|string", "required|string", "text", '"Long text content"', '"Updated long text content"', 12),
}


@dataclass(frozen=True)
class RelationshipConfig:
    """Immutable relationship type configuration."""
    description: str
    method: str
    inverse: str
    supported: bool


# Relationship types mapping - centralized, immutable
RELATIONSHIP_TYPES: Final[Dict[str, RelationshipConfig]] = {
    "belongsTo": RelationshipConfig("Many-to-One (stores foreign key as string)", "belongsTo", "hasMany", True),
    "hasOne": RelationshipConfig("One-to-One (referenced or embedded)", "hasOne", "belongsTo", True),
    "hasMany": RelationshipConfig("One-to-Many (array of references)", "hasMany", "belongsTo", True),
    "belongsToMany": RelationshipConfig("Many-to-Many (array of IDs, no pivot table)", "belongsToMany", "belongsToMany", True),
}


# UI Messages - centralized
MESSAGES: Final[Dict[str, str]] = {
    "banner": "\n╔══════════════════════════════════════════════════════════════════╗\n║  🚀 Full Stack Module Generator (Professional Edition)            ║\n║     Backend: MongoDB + Jenssegers | Frontend: Vue 3             ║\n║     With Relationships, Auto-Models, and Update Support         ║\n╚══════════════════════════════════════════════════════════════════╝\n",
    "completion": "\n╔══════════════════════════════════════════════════════════════════╗\n║   ✅ Full Stack Module Generation Complete!                     ║\n╚══════════════════════════════════════════════════════════════════╝\n",
    "empty_path": "Path cannot be empty.",
    "empty_name": "Model name cannot be empty.",
    "invalid_name_start": "Model name cannot start with a number.",
    "invalid_name_chars": "Model name must contain only letters and numbers.",
    "empty_field": "Field name cannot be empty.",
    "invalid_field_chars": "Field name must contain only letters, numbers, and underscores.",
}