"""
Setting-Python: Professional Module Generation

A professional-grade module generation system for Laravel + Vue.js fullstack projects.
Implements clean architecture with separation of concerns following SOLID principles.

Modern API (Recommended):
    from setting_python import BatchModuleProcessor, Validators, FieldGenerator
    
    result = await BatchModuleProcessor.process(
        config, 
        backend_path, 
        frontend_path
    )

Legacy API (Backward Compatible):
    from setting_python import validate_model_name, generate_form_fields
    
    name_valid = validate_model_name("Product")
    form_fields = generate_form_fields(fields, "product")

Architecture Modules:
    - config.py: Constants and type definitions (immutable dataclasses)
    - validators.py: Input validation with composable validators
    - file_ops.py: File system operations (async)
    - generator_functions.py: Frontend generation (tables, forms, translations)
    - relationship_generator.py: PHP Eloquent relationship code generation
    - file_creator.py: Template-based file creation
    - route_manager.py: Backend and frontend route management
    - model_ops.py: Model field and relationship injection
    - batch_processor.py: Main orchestrator for module generation
    - module_deletor.py: Safe module deletion with cleanup
    - integrations.py: Service abstractions (LLM, ClickUp)
"""

__version__ = "2.0.0"
__author__ = "Senior Python Developer"
__license__ = "MIT"
__description__ = "Professional module generation for Laravel + Vue.js"

# ============================================================================
# Core Imports (Modern API)
# ============================================================================

from config import FIELD_TYPES, RELATIONSHIP_TYPES, MESSAGES, FieldConfig, RelationshipConfig
from validators import Validators, ValidationError
from file_ops import FileOps
from generator_functions import FieldGenerator
from relationship_generator import RelationshipGenerator
from file_creator import FileCreator
from route_manager import RouteManager
from model_ops import ModelOps
from batch_processor import BatchModuleProcessor, FieldConverter
from module_deletor import ModuleDeleteor
from integrations import (
    LLMService,
    ClickUpService,
    OpenAILLMService,
    ClickUpAPIService,
    IntegrationFactory
)

# ============================================================================
# Backward Compatibility Layer (Legacy API)
# ============================================================================
# These maintain the original API for existing code that imports from this package

def validate_model_name(name: str) -> str | bool:
    """Legacy: Validate model name (PascalCase only). Returns True or error message."""
    return Validators.validate_model_name(name)

def validate_field_name(name: str) -> str | bool:
    """Legacy: Validate field name (camelCase/snake_case). Returns True or error message."""
    return Validators.validate_field_name(name)

def validate_path(path: str) -> str | bool:
    """Legacy: Validate path (non-empty). Returns True or error message."""
    return Validators.validate_path(path)

def validate_batch_config(config: dict) -> dict:
    """Legacy: Validate entire batch configuration. Returns validation result dict."""
    return Validators.validate_batch_config(config)

def generate_form_fields(fields: list, module_name: str, language: str = "en") -> dict:
    """Legacy: Generate form field definitions from field list."""
    return FieldGenerator.generate_form_fields(fields, module_name, language)

def generate_table_columns(fields: list, module_name: str) -> list:
    """Legacy: Generate table column definitions for DataTable display."""
    return FieldGenerator.generate_table_columns(fields, module_name)

def generate_translations(module_name: str, fields: list, language: str = "en") -> dict:
    """Legacy: Generate translation keys and labels."""
    return FieldGenerator.generate_translations(module_name, fields, language)

def format_options_array(options: list) -> list:
    """Legacy: Format options for select/dropdown fields."""
    return FieldGenerator.format_options_array(options)

async def process_batch_config(
    config: dict,
    backend_path: str,
    frontend_path: str,
    gen_backend: bool = True,
    gen_frontend: bool = True
) -> dict:
    """Legacy: Process batch configuration. Wrapper for BatchModuleProcessor.process()."""
    return await BatchModuleProcessor.process(
        config,
        backend_path,
        frontend_path,
        gen_backend,
        gen_frontend
    )

# ============================================================================
# Public API Exports
# ============================================================================

__all__ = [
    # Configuration and Types
    "FIELD_TYPES",
    "RELATIONSHIP_TYPES",
    "MESSAGES",
    "FieldConfig",
    "RelationshipConfig",
    
    # Validators (Modern)
    "Validators",
    "ValidationError",
    
    # Validators (Legacy Aliases)
    "validate_model_name",
    "validate_field_name",
    "validate_path",
    "validate_batch_config",
    
    # File Operations
    "FileOps",
    
    # Generators (Modern)
    "FieldGenerator",
    "RelationshipGenerator",
    "FileCreator",
    
    # Generators (Legacy Aliases)
    "generate_form_fields",
    "generate_table_columns",
    "generate_translations",
    "format_options_array",
    
    # Managers
    "RouteManager",
    "ModelOps",
    
    # Orchestration
    "BatchModuleProcessor",
    "FieldConverter",
    "ModuleDeleteor",
    "process_batch_config",
    
    # Integrations
    "LLMService",
    "ClickUpService",
    "OpenAILLMService",
    "ClickUpAPIService",
    "IntegrationFactory",
]
