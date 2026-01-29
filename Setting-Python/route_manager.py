"""
Route management module - Handle backend routes registration and frontend router updates.
Senior-grade: Isolated, reusable route operations.
"""

import re
from pathlib import Path
from typing import Optional


class RouteManager:
    """Manage backend routes and frontend router configuration."""

    @staticmethod
    async def register_backend_route(backend_path: str, model_name: str) -> bool:
        """Register API route for a new model."""
        try:
            routes_path = Path(backend_path) / "routes" / "API" / "index.php"
            if not routes_path.exists():
                return False

            content = routes_path.read_text(encoding="utf-8")
            route_include = f"@include('Modules/{model_name}/{model_name}Routes.php');"

            if route_include in content:
                return False

            php_tag_idx = content.find("<?php")
            if php_tag_idx == -1:
                return False

            insert_pos = php_tag_idx + 5
            new_content = content[:insert_pos] + "\n" + route_include + content[insert_pos:]
            routes_path.write_text(new_content, encoding="utf-8")
            return True
        except Exception:
            return False

    @staticmethod
    async def update_frontend_router_index(frontend_path: str, name: str) -> bool:
        """Update frontend router index with new module import."""
        try:
            index_path = Path(frontend_path) / "src" / "router" / "index.ts"
            if not index_path.exists():
                return False

            content = index_path.read_text(encoding="utf-8")
            import_stmt = f'import {name} from "@/router/modules/{name}/{name}";'

            if import_stmt not in content:
                import_regex = r'import\s+\w+\s+from\s+["\']@\/router\/modules\/[^"\']+["\'];'
                imports = re.findall(import_regex, content)

                if imports:
                    last_import = imports[-1]
                    last_idx = content.rfind(last_import)
                    insert_pos = last_idx + len(last_import)
                    content = content[:insert_pos] + "\n" + import_stmt + content[insert_pos:]

            route_stmt = f"      ...{name},"
            if f"...{name}" not in content:
                children_match = re.search(r'children:\s*\[', content)
                if children_match:
                    children_idx = children_match.end()
                    content = content[:children_idx] + "\n" + route_stmt + content[children_idx:]

            index_path.write_text(content, encoding="utf-8")
            return True
        except Exception:
            return False

    @staticmethod
    async def remove_from_router_index(frontend_path: str, module_name: str) -> bool:
        """Remove module from frontend router index."""
        router_path = Path(frontend_path) / "src" / "router" / "index.ts"

        if not router_path.exists():
            return False

        try:
            content = router_path.read_text(encoding="utf-8")
            lines = content.splitlines()
            new_lines = []
            removed = False

            for line in lines:
                line_lower = line.lower()

                # Remove import statement
                if 'import' in line_lower and module_name.lower() in line_lower and 'from' in line_lower:
                    if re.search(rf'\b{re.escape(module_name)}\b', line, re.IGNORECASE):
                        removed = True
                        continue

                # Remove spread operator
                spread_match = re.search(rf'\.\.\.{re.escape(module_name)}(,|$)', line, re.IGNORECASE)
                if spread_match:
                    if re.match(rf'^\s*\.\.\.{re.escape(module_name)},?\s*$', line, re.IGNORECASE):
                        removed = True
                        continue

                    new_line = re.sub(rf'\s*\.\.\.{re.escape(module_name)}\s*,?\s*', '', line, flags=re.IGNORECASE)
                    new_line = re.sub(r'^\s*,\s*', '', new_line)
                    new_line = re.sub(r',\s*$', '', new_line)

                    if new_line != line:
                        removed = True
                        line = new_line

                if line.strip():
                    new_lines.append(line)

            if not removed:
                return True

            new_content = '\n'.join(new_lines)
            new_content = re.sub(r'\n\n\n+', '\n\n', new_content)
            new_content = '\n'.join([line.rstrip() for line in new_content.splitlines()])

            if new_content and not new_content.endswith('\n'):
                new_content += '\n'

            router_path.write_text(new_content, encoding="utf-8")
            return True

        except Exception:
            return False

    @staticmethod
    async def remove_from_routes_file(backend_path: str, module_name: str) -> bool:
        """Remove module routes from backend routes file."""
        try:
            routes_paths = [
                Path(backend_path) / "routes" / "API" / "index.php",
                Path(backend_path) / "routes" / "api.php"
            ]

            for routes_path in routes_paths:
                if not routes_path.exists():
                    continue

                content = routes_path.read_text(encoding="utf-8")
                lines = content.split("\n")
                
                filtered = [
                    line for line in lines
                    if not re.search(
                        rf'@include\s*\(\s*[\'"]Modules/{re.escape(module_name)}/{re.escape(module_name)}Routes\.php[\'"]\s*\)',
                        line,
                        re.IGNORECASE
                    )
                ]

                content = "\n".join(filtered)
                content = re.sub(r'\n\n\n+', '\n\n', content)
                routes_path.write_text(content, encoding="utf-8")
                return True

            return False
        except Exception:
            return False
