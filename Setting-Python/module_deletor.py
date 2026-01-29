"""
Module deletor - Handle safe deletion of generated modules.
Senior-grade: Safe deletion with validation and cleanup.
"""

import re
import shutil
from pathlib import Path
from typing import Dict
from file_ops import FileOps
from route_manager import RouteManager


class ModuleDeleteor:
    """Delete entire modules safely."""

    @staticmethod
    async def delete(
        backend_path: str,
        frontend_path: str,
        module_name: str,
        delete_backend: bool = True,
        delete_frontend: bool = True
    ) -> Dict:
        """Delete module from backend and/or frontend."""
        results = {
            "deletedBackend": [],
            "deletedFrontend": [],
            "errors": []
        }

        try:
            if delete_backend:
                await ModuleDeleteor._delete_backend(backend_path, module_name, results)

            if delete_frontend:
                await ModuleDeleteor._delete_frontend(frontend_path, module_name, results)

            return results

        except Exception as error:
            results["errors"].append(str(error))
            return results

    @staticmethod
    async def _delete_backend(backend_path: str, module_name: str, results: Dict) -> None:
        """Delete backend module directories."""
        backend_dirs = [
            ("app/Models", "backend model"),
            ("app/Repositories/Eloquent", "backend repository"),
            ("app/Services/Eloquent", "backend service"),
            ("app/Http/Controllers", "backend controller"),
            ("routes/API/Modules", "backend routes"),
            ("tests/Unit", "backend test")
        ]

        for dir_suffix, desc in backend_dirs:
            dir_path = Path(backend_path) / dir_suffix / module_name
            if await FileOps.delete_directory(str(dir_path)):
                results["deletedBackend"].append(f"{dir_suffix}/{module_name}")

        # Remove from routes file
        await RouteManager.remove_from_routes_file(backend_path, module_name)

    @staticmethod
    async def _delete_frontend(frontend_path: str, module_name: str, results: Dict) -> None:
        """Delete frontend module directories."""
        name_kebab = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', module_name).lower()

        frontend_dirs = [
            f"src/API/{name_kebab}",
            f"src/views/Page/{module_name}",
            f"src/router/modules/{name_kebab}"
        ]

        for dir_path_str in frontend_dirs:
            dir_path = Path(frontend_path) / dir_path_str
            try:
                if dir_path.exists() and dir_path.is_dir():
                    shutil.rmtree(dir_path)
                    results["deletedFrontend"].append(dir_path_str)
            except Exception as e:
                results["errors"].append(f"Failed to delete {dir_path_str}: {e}")

        # Remove from router index
        await RouteManager.remove_from_router_index(frontend_path, module_name)
