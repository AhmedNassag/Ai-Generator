"""
File system operations module - Path checks, model checks, field management.
Senior-grade: Async operations with error handling and type hints.
"""

import re
from pathlib import Path
from typing import List, Optional


class FileOps:
    """File system operations for backend/frontend detection and checks."""

    @staticmethod
    async def check_backend_app_exists(backend_path: str) -> bool:
        """Check if backend app directory exists."""
        try:
            return (Path(backend_path) / "app").is_dir()
        except Exception:
            return False

    @staticmethod
    async def check_frontend_src_exists(frontend_path: str) -> bool:
        """Check if frontend src directory exists."""
        try:
            return (Path(frontend_path) / "src").is_dir()
        except Exception:
            return False

    @staticmethod
    async def check_backend_model_exists(backend_path: str, model_name: str) -> bool:
        """Check if backend model exists."""
        try:
            model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
            return model_path.exists()
        except Exception:
            return False

    @staticmethod
    async def file_exists(file_path: str) -> bool:
        """Check if file exists."""
        return Path(file_path).exists()

    @staticmethod
    async def get_existing_fields(backend_path: str, model_name: str) -> List[str]:
        """Extract existing fillable fields from a model."""
        try:
            model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
            content = model_path.read_text(encoding="utf-8")

            pattern = r'protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];'
            match = re.search(pattern, content)

            if match:
                fillable_content = match.group(1)
                fields = []
                for field in fillable_content.split(','):
                    field_clean = field.strip().strip('\'"')
                    if field_clean:
                        fields.append(field_clean)
                return fields
            return []
        except Exception:
            return []

    @staticmethod
    async def add_field_to_model(backend_path: str, model_name: str, field_name: str) -> bool:
        """Add a new field to an existing model's fillable array."""
        try:
            model_path = Path(backend_path) / "app" / "Models" / model_name / f"{model_name}.php"
            content = model_path.read_text(encoding="utf-8")

            pattern = r'protected\s+\$fillable\s*=\s*\[([\s\S]*?)\];'
            match = re.search(pattern, content)

            if not match:
                return False

            fillable_content = match.group(1)
            if f"'{field_name}'" in fillable_content or f'"{field_name}"' in fillable_content:
                return False

            trimmed_content = fillable_content.strip()
            new_field = f"'{field_name}'"

            if not trimmed_content:
                new_fillable_content = new_field
            else:
                new_fillable_content = trimmed_content + f",\n        {new_field}"

            updated_content = re.sub(
                pattern,
                f'protected $fillable = [\n        {new_fillable_content}\n    ];',
                content
            )

            model_path.write_text(updated_content, encoding="utf-8")
            return True
        except Exception:
            return False

    @staticmethod
    async def delete_directory(dir_path: str) -> bool:
        """Recursively delete a directory."""
        try:
            dir_path_obj = Path(dir_path)
            if not dir_path_obj.exists():
                return True

            for item in dir_path_obj.iterdir():
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    await FileOps.delete_directory(str(item))

            dir_path_obj.rmdir()
            return True
        except Exception:
            return False
