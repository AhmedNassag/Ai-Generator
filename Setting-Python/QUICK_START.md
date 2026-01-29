# Quick Start Guide: Setting-Python

## 🚀 Installation

```bash
cd Setting-Python
pip install -r requirements.txt
```

---

## 📖 Basic Usage

### 1. Modern API (Recommended)

```python
import asyncio
from setting_python import BatchModuleProcessor, Validators

async def main():
    # Create module config
    config = {
        "name": "Product",
        "fields": [
            {"name": "title", "type": "string", "length": 255},
            {"name": "price", "type": "decimal", "precision": 10, "scale": 2},
            {"name": "description", "type": "textarea"}
        ]
    }
    
    # Process module generation
    result = await BatchModuleProcessor.process(
        config,
        backend_path="../Backend",
        frontend_path="../Frontend",
        gen_backend=True,
        gen_frontend=True
    )
    
    print(f"Generated: {result['success']}")

asyncio.run(main())
```

---

### 2. Legacy API (Backward Compatible)

```python
from setting_python import (
    validate_model_name,
    generate_form_fields,
    generate_table_columns
)

# Validate input
if validate_model_name("Product") == True:
    print("✓ Valid model name")

# Generate fields
form_config = generate_form_fields(fields, "product")
table_config = generate_table_columns(fields, "product")
```

---

## 🛠️ Module Examples

### Validators

```python
from setting_python import Validators

# Validate model name (PascalCase)
result = Validators.validate_model_name("Product")  # True
result = Validators.validate_model_name("product")  # Error message

# Validate field name (camelCase/snake_case)
result = Validators.validate_field_name("product_id")  # True
result = Validators.validate_field_name("ProductId")   # Error message

# Validate batch config
config = {...}
validation = Validators.validate_batch_config(config)
print(f"Valid: {validation['isValid']}")
for error in validation['errors']:
    print(f"Error: {error}")
```

### File Operations

```python
import asyncio
from setting_python import FileOps

async def main():
    # Check if paths exist
    backend_ok = await FileOps.check_backend_app_exists("../Backend")
    frontend_ok = await FileOps.check_frontend_src_exists("../Frontend")
    
    # Get existing fields from model
    fields = await FileOps.get_existing_fields("../Backend", "Product")
    print(f"Existing fields: {fields}")
    
    # Add field to existing model
    await FileOps.add_field_to_model("../Backend", "Product", "sku")

asyncio.run(main())
```

### Generators

```python
from setting_python import FieldGenerator

fields = [
    {"name": "title", "type": "string"},
    {"name": "price", "type": "decimal"},
    {"name": "is_active", "type": "boolean"}
]

# Generate table columns
table_cols = FieldGenerator.generate_table_columns(fields, "product")
print(table_cols)
# Output: [{"key": "title", "label": "Title", ...}, ...]

# Generate form fields
form_fields = FieldGenerator.generate_form_fields(fields, "product")
print(form_fields)
# Output: {"title": {"type": "text", ...}, "price": {"type": "number", ...}, ...}

# Generate translations
translations = FieldGenerator.generate_translations("product", fields)
print(translations)
# Output: {"product.title": "Title", "product.price": "Price", ...}
```

### Relationships

```python
from setting_python import RelationshipGenerator

relationship = {
    "type": "belongsTo",
    "relatedModel": "Category",
    "methodName": "category",
    "foreignKey": "category_id"
}

# Generate PHP code
php_code = RelationshipGenerator.generate_single_relationship(relationship)
print(php_code)
# Output: public function category() { return $this->belongsTo(Category::class); }

# Generate use statements
use_stmts = RelationshipGenerator.generate_use_statements([relationship])
print(use_stmts)
# Output: use App\Models\Category;
```

### Route Management

```python
import asyncio
from setting_python import RouteManager

async def main():
    # Register backend route
    await RouteManager.register_backend_route("../Backend", "Product")
    
    # Update frontend router
    await RouteManager.update_frontend_router_index("../Frontend", "Product")
    
    # Remove routes when deleting
    await RouteManager.remove_from_routes_file("../Backend", "Product")
    await RouteManager.remove_from_router_index("../Frontend", "Product")

asyncio.run(main())
```

### Module Deletion

```python
import asyncio
from setting_python import ModuleDeleteor

async def main():
    result = await ModuleDeleteor.delete(
        backend_path="../Backend",
        frontend_path="../Frontend",
        module_name="Product",
        delete_backend=True,
        delete_frontend=True
    )
    
    print(f"Deleted: {result['success']}")

asyncio.run(main())
```

### Integrations (LLM & ClickUp)

```python
import asyncio
from setting_python import IntegrationFactory

async def main():
    # Get LLM service (OpenAI)
    llm = IntegrationFactory.get_llm_service()
    
    schema = await llm.generate_schema(
        "Create a blog module with title, content, author, and publication date"
    )
    
    import json
    config = json.loads(schema)
    print(config)
    
    # Get ClickUp service
    clickup = IntegrationFactory.get_clickup_service()
    task = await clickup.get_task("task_id_123")
    print(f"Task: {task['name']}")

asyncio.run(main())
```

---

## 📚 Configuration

### Field Types

```python
from setting_python import FIELD_TYPES

# Available field types:
field_types = list(FIELD_TYPES.keys())
print(field_types)
# Output: ['string', 'email', 'password', 'phone', 'number', 'decimal', 
#          'integer', 'date', 'datetime', 'boolean', 'checkbox', 'image', 
#          'file', 'array', 'json', 'textarea', 'lazy_select', 'user_select', 
#          'team_select', 'url', 'text']

# Get field configuration
config = FIELD_TYPES["email"]
print(config)
# Output: FieldConfig(
#     form_type='email',
#     validation='required|email|unique:@@table@@,email',
#     test_value='john@example.com',
#     col=4,
#     has_options=False
# )
```

### Relationship Types

```python
from setting_python import RELATIONSHIP_TYPES

# Available relationship types:
rel_types = list(RELATIONSHIP_TYPES.keys())
print(rel_types)
# Output: ['belongsTo', 'hasOne', 'hasMany', 'belongsToMany']

# Get relationship configuration
rel = RELATIONSHIP_TYPES["belongsTo"]
print(rel)
# Output: {
#     'description': 'One-to-One Inverse (many to one)',
#     'method': 'belongsTo',
#     'inverse': 'hasMany',
#     'hasFK': True
# }
```

---

## ⚙️ Environment Setup

### .env File

```ini
# OpenAI LLM
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_MODEL=gpt-4

# ClickUp Integration
CLICKUP_API_KEY=xxxxxxxxxxxx
CLICKUP_API_URL=https://api.clickup.com/api/v2

# Paths (optional)
BACKEND_PATH=../Backend
FRONTEND_PATH=../Frontend
```

---

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run all tests
pytest

# Run specific test
pytest tests/test_validators.py

# Run with coverage
pytest --cov=setting_python
```

### Example Test

```python
import pytest
from setting_python import Validators

def test_validate_model_name():
    """Test model name validation"""
    # Valid names
    assert Validators.validate_model_name("Product") == True
    assert Validators.validate_model_name("UserGroup") == True
    
    # Invalid names
    assert "cannot be empty" in Validators.validate_model_name("")
    assert "cannot start with a number" in Validators.validate_model_name("1Product")
    assert "PascalCase" in Validators.validate_model_name("product")

def test_validate_field_name():
    """Test field name validation"""
    assert Validators.validate_field_name("product_id") == True
    assert Validators.validate_field_name("productId") == True
    assert "camelCase" in Validators.validate_field_name("ProductId")
```

---

## 📊 Data Flow

```
Input Config
    ↓
Validators.validate_batch_config()
    ↓
BatchModuleProcessor.process()
    ├─→ FieldConverter.convert_fields()
    ├─→ FileOps.check_backend_app_exists()
    ├─→ FileOps.check_frontend_src_exists()
    ├─→ FileCreator.create_backend_file()
    ├─→ FileCreator.create_frontend_file()
    ├─→ RouteManager.register_backend_route()
    ├─→ RouteManager.update_frontend_router_index()
    └─→ ModelOps.add_relationship()
    ↓
Generated Files + Routes + Models
```

---

## 🐛 Troubleshooting

### Import Errors

```python
# ❌ Wrong
from fullstack_generator import validate_model_name

# ✅ Correct
from setting_python import validate_model_name
# or
from setting_python import Validators
result = Validators.validate_model_name("Product")
```

### Async Issues

```python
# ❌ Wrong (won't work)
result = FileOps.check_backend_app_exists("../Backend")

# ✅ Correct (use await or asyncio.run)
import asyncio
result = await FileOps.check_backend_app_exists("../Backend")

# or
asyncio.run(FileOps.check_backend_app_exists("../Backend"))
```

### Configuration Validation

```python
from setting_python import Validators

config = {...}
validation = Validators.validate_batch_config(config)

if not validation["isValid"]:
    print("Configuration errors:")
    for error in validation["errors"]:
        print(f"  - {error}")
else:
    print("✓ Configuration is valid")
```

---

## 📞 Common Questions

**Q: How do I generate a module?**
A: Use `BatchModuleProcessor.process()` with a configuration dict containing module name, fields, and relationships.

**Q: How do I delete a module?**
A: Use `ModuleDeleteor.delete()` with the module name and paths.

**Q: How do I use LLM integration?**
A: Call `IntegrationFactory.get_llm_service()` to get an LLM service, then use `generate_schema()`.

**Q: How do I use ClickUp integration?**
A: Call `IntegrationFactory.get_clickup_service()` to get a ClickUp service, then use `get_task()`.

**Q: Can I use the old API?**
A: Yes! All legacy functions are available through backward compatibility layer.

---

## 📖 Further Reading

- [REFACTORING_GUIDE.md](REFACTORING_GUIDE.md) - Comprehensive architecture documentation
- [config.py](config.py) - Field type and relationship type definitions
- [validators.py](validators.py) - Input validation logic
- [batch_processor.py](batch_processor.py) - Main generation orchestration

---

**Last Updated:** January 29, 2026  
**Version:** 2.0.0
