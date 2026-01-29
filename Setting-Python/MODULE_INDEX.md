# Setting-Python: Module Index

Complete reference guide for all modules in the refactored Setting-Python package.

---

## 📑 Module Reference

### 1. config.py
**Purpose:** Centralized configuration management  
**Size:** 90 lines  
**Status:** ✨ Created  

**Key Components:**
- `FieldConfig` (dataclass) - Immutable field type configuration
- `FIELD_TYPES` (dict) - 20 field type definitions
- `RELATIONSHIP_TYPES` (dict) - 4 relationship type definitions
- `MESSAGES` (dict) - Centralized error messages

**Usage:**
```python
from setting_python import FIELD_TYPES, RELATIONSHIP_TYPES
field = FIELD_TYPES["email"]
rel = RELATIONSHIP_TYPES["belongsTo"]
```

**Exports:**
- FieldConfig, RelationshipConfig
- FIELD_TYPES, RELATIONSHIP_TYPES
- MESSAGES

---

### 2. validators.py
**Purpose:** Input validation with composable validators  
**Size:** 135 lines  
**Status:** ✨ Created  

**Key Components:**
- `ValidationError` (exception) - Custom validation error
- `Validators` (class) - Static validation methods

**Methods:**
- `validate_path(path: str)` - Check non-empty path
- `validate_model_name(name: str)` - Check PascalCase
- `validate_field_name(name: str)` - Check camelCase/snake_case
- `validate_batch_config(config: dict)` - Validate entire batch JSON

**Usage:**
```python
from setting_python import Validators
result = Validators.validate_model_name("Product")  # True
error = Validators.validate_field_name("ProductId")  # Error message
```

**Exports:**
- Validators
- ValidationError

---

### 3. file_ops.py
**Purpose:** File system operations (async)  
**Size:** 105 lines  
**Status:** ✨ Created  

**Key Components:**
- `FileOps` (class) - Static async file operations

**Methods:**
- `check_backend_app_exists(path)` - Check for /app directory
- `check_frontend_src_exists(path)` - Check for /src directory
- `check_backend_model_exists(path, name)` - Find model file
- `file_exists(path)` - Generic file check
- `get_existing_fields(path, model)` - Extract fillable array
- `add_field_to_model(path, model, field)` - Inject field
- `delete_directory(path)` - Recursive deletion

**Usage:**
```python
import asyncio
from setting_python import FileOps

async def main():
    fields = await FileOps.get_existing_fields("../Backend", "Product")
    await FileOps.add_field_to_model("../Backend", "Product", "sku")

asyncio.run(main())
```

**Exports:**
- FileOps

---

### 4. generator_functions.py
**Purpose:** Frontend code generation (Vue components)  
**Size:** 145 lines  
**Status:** ✨ Created  

**Key Components:**
- `FieldGenerator` (class) - Static generation methods

**Methods:**
- `generate_table_columns(fields, module)` - Vue DataTable columns
- `generate_form_fields(fields, module)` - Form field definitions
- `generate_translations(module, fields)` - i18n keys and labels
- `format_options_array(options)` - Format select options

**Usage:**
```python
from setting_python import FieldGenerator

columns = FieldGenerator.generate_table_columns(fields, "product")
form = FieldGenerator.generate_form_fields(fields, "product")
i18n = FieldGenerator.generate_translations("product", fields)
```

**Exports:**
- FieldGenerator

---

### 5. relationship_generator.py
**Purpose:** PHP Eloquent relationship code generation  
**Size:** 110 lines  
**Status:** ✨ Created  

**Key Components:**
- `RelationshipGenerator` (class) - Static generation methods

**Methods:**
- `generate_single_relationship(rel)` - Single PHP relationship method
- `generate_use_statements(rels)` - PHP use statements
- `generate_relationship_methods(rels)` - Combined relationship code
- `generate_belongs_to_many_repository_methods(rels)` - Repository methods

**Usage:**
```python
from setting_python import RelationshipGenerator

code = RelationshipGenerator.generate_single_relationship({
    "type": "belongsTo",
    "relatedModel": "Category"
})
```

**Exports:**
- RelationshipGenerator

---

### 6. file_creator.py
**Purpose:** Template-based async file creation  
**Size:** 120 lines  
**Status:** ✨ Created  

**Key Components:**
- `FileCreator` (class) - Static async file creation

**Methods:**
- `create_backend_file(path, type, name, content)` - Create PHP file
- `create_frontend_file(path, type, name, content)` - Create Vue file

**Usage:**
```python
import asyncio
from setting_python import FileCreator

async def main():
    await FileCreator.create_backend_file(
        "../Backend",
        "Model",
        "Product",
        model_content
    )

asyncio.run(main())
```

**Exports:**
- FileCreator

---

### 7. route_manager.py
**Purpose:** Backend and frontend route management  
**Size:** 130 lines  
**Status:** ✨ Created  

**Key Components:**
- `RouteManager` (class) - Static route management methods

**Methods:**
- `register_backend_route(path, name)` - Add to API routes
- `update_frontend_router_index(path, name)` - Update router config
- `remove_from_routes_file(path, name)` - Remove from API routes
- `remove_from_router_index(path, name)` - Remove from router

**Usage:**
```python
import asyncio
from setting_python import RouteManager

async def main():
    await RouteManager.register_backend_route("../Backend", "Product")
    await RouteManager.update_frontend_router_index("../Frontend", "Product")

asyncio.run(main())
```

**Exports:**
- RouteManager

---

### 8. model_ops.py
**Purpose:** Model field and relationship injection  
**Size:** 80 lines  
**Status:** ✨ Created  

**Key Components:**
- `ModelOps` (class) - Static model manipulation methods

**Methods:**
- `add_use_statement(content, model)` - Inject use statement
- `add_relationship(content, code)` - Inject relationship method

**Usage:**
```python
from setting_python import ModelOps

new_content = ModelOps.add_use_statement(model_content, "Category")
new_content = ModelOps.add_relationship(new_content, relationship_code)
```

**Exports:**
- ModelOps

---

### 9. batch_processor.py
**Purpose:** Main orchestrator for module generation  
**Size:** 280 lines  
**Status:** ✨ Created  

**Key Components:**
- `FieldConverter` (class) - Convert field configs
- `BatchModuleProcessor` (class) - Main generation orchestrator

**Methods:**
- `FieldConverter.convert_fields()` - Transform batch fields
- `BatchModuleProcessor.process()` - Main entry point
- `BatchModuleProcessor._process_relationships()` - Handle relationships
- `BatchModuleProcessor._generate_backend()` - Create backend files
- `BatchModuleProcessor._generate_frontend()` - Create frontend files

**Usage:**
```python
import asyncio
from setting_python import BatchModuleProcessor

async def main():
    result = await BatchModuleProcessor.process(
        config,
        "../Backend",
        "../Frontend"
    )
    print(f"Success: {result['success']}")

asyncio.run(main())
```

**Exports:**
- BatchModuleProcessor
- FieldConverter

---

### 10. module_deletor.py
**Purpose:** Safe module deletion with cleanup  
**Size:** 70 lines  
**Status:** ✨ Created  

**Key Components:**
- `ModuleDeleteor` (class) - Static deletion methods

**Methods:**
- `delete()` - Main deletion entry point
- `_delete_backend()` - Delete backend files
- `_delete_frontend()` - Delete frontend files

**Usage:**
```python
import asyncio
from setting_python import ModuleDeleteor

async def main():
    result = await ModuleDeleteor.delete(
        "../Backend",
        "../Frontend",
        "Product",
        delete_backend=True,
        delete_frontend=True
    )

asyncio.run(main())
```

**Exports:**
- ModuleDeleteor

---

### 11. integrations.py
**Purpose:** Service abstractions for external integrations  
**Size:** 150 lines  
**Status:** ✨ Created  

**Key Components:**
- `LLMService` (ABC) - Abstract LLM service
- `ClickUpService` (ABC) - Abstract ClickUp service
- `OpenAILLMService` (LLMService) - OpenAI implementation
- `ClickUpAPIService` (ClickUpService) - ClickUp API implementation
- `IntegrationFactory` (class) - Service factory

**Methods:**
- `LLMService.generate_schema()` - Generate config from prompt
- `ClickUpService.get_task()` - Get task from ClickUp
- `IntegrationFactory.get_llm_service()` - Get LLM instance
- `IntegrationFactory.get_clickup_service()` - Get ClickUp instance

**Usage:**
```python
import asyncio
from setting_python import IntegrationFactory

async def main():
    llm = IntegrationFactory.get_llm_service()
    schema = await llm.generate_schema("Create a blog module")
    
    clickup = IntegrationFactory.get_clickup_service()
    task = await clickup.get_task("task_id")

asyncio.run(main())
```

**Exports:**
- LLMService, ClickUpService
- OpenAILLMService, ClickUpAPIService
- IntegrationFactory

---

### 12. __init__.py
**Purpose:** Package initialization and public API  
**Size:** 170 lines  
**Status:** ✨ Updated  

**Features:**
- Imports all core components
- Provides backward compatibility layer
- Exports modern and legacy API
- Full type hints

**Legacy API:**
```python
from setting_python import (
    validate_model_name,
    validate_field_name,
    validate_path,
    generate_form_fields,
    generate_table_columns,
    generate_translations,
    format_options_array
)
```

**Modern API:**
```python
from setting_python import (
    Validators,
    FieldGenerator,
    FileOps,
    RelationshipGenerator,
    FileCreator,
    RouteManager,
    ModelOps,
    BatchModuleProcessor,
    ModuleDeleteor,
    IntegrationFactory
)
```

**Exports:**
- All core classes and constants
- Legacy function aliases
- Full __all__ declaration

---

## 📊 Module Dependencies

```
config.py (no dependencies)
    ↓
validators.py (depends on config)
    ↓
file_ops.py (depends on config)
    ↓
generator_functions.py (depends on config)
    ↓
relationship_generator.py (depends on config)
    ↓
file_creator.py (depends on generators)
    ↓
route_manager.py (no dependencies)
    ↓
model_ops.py (depends on generators)
    ↓
batch_processor.py (depends on all of above)
    ↓
module_deletor.py (depends on file_ops, route_manager)
    ↓
integrations.py (no dependencies)
    ↓
__init__.py (imports all modules)
```

---

## 🎯 Module Purposes

| Module | Purpose | Type |
|--------|---------|------|
| config | Define field/relationship types | Configuration |
| validators | Validate user input | Utility |
| file_ops | File system operations | I/O |
| generator_functions | Generate Vue components | Generator |
| relationship_generator | Generate PHP relationships | Generator |
| file_creator | Create files from templates | Generator |
| route_manager | Manage routes | Manager |
| model_ops | Manipulate models | Manager |
| batch_processor | Orchestrate generation | Orchestrator |
| module_deletor | Delete modules | Manager |
| integrations | External services | Service |
| __init__ | Package API | Package |

---

## ✨ Key Design Features

### Per-Module Features

**config.py**
- Frozen dataclasses for immutability
- Type-safe field definitions
- Centralized constants

**validators.py**
- Composable validators
- Clear error messages
- Type hints

**file_ops.py**
- Async I/O operations
- Cross-platform compatibility
- Error handling

**generator_functions.py**
- Pure functions
- Template-based generation
- Flexible output

**relationship_generator.py**
- PHP code generation
- Clean readable output
- All relationship types

**file_creator.py**
- Template-based creation
- Path normalization
- Content substitution

**route_manager.py**
- Route registration
- Route removal
- Pattern matching

**model_ops.py**
- Model field injection
- Relationship insertion
- Clean code formatting

**batch_processor.py**
- Orchestration logic
- Field conversion
- Error handling

**module_deletor.py**
- Safe deletion
- Cleanup operations
- Comprehensive removal

**integrations.py**
- Service abstraction
- Factory pattern
- Error handling

**__init__.py**
- Public API
- Backward compatibility
- Full documentation

---

## 📞 How to Use This Index

1. **Find what you need:** Look for the module name in this file
2. **Check the purpose:** Read the "Purpose" and "Key Components" sections
3. **See examples:** Check the "Usage" code examples
4. **Understand exports:** See what the module exports
5. **Reference code:** Look at the actual .py file for more details

---

## 🔗 Related Documentation

- [REFACTORING_GUIDE.md](REFACTORING_GUIDE.md) - Complete architecture guide
- [QUICK_START.md](QUICK_START.md) - Quick reference with examples
- [PROJECT_COMPLETION.md](PROJECT_COMPLETION.md) - Completion summary

---

**Last Updated:** January 29, 2026  
**Version:** 2.0.0
