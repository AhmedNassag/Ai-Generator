import sys
import os
import json
import subprocess
import traceback
from pathlib import Path
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QTextEdit, 
                             QLineEdit, QTabWidget, QGroupBox, QGridLayout,
                             QMessageBox, QFileDialog, QListWidget, QListWidgetItem,
                             QCheckBox, QComboBox, QSpinBox, QTableWidget, 
                             QTableWidgetItem, QHeaderView, QScrollArea, QSplitter,
                             QDialog, QProgressBar, QDialogButtonBox)
from PyQt5.QtCore import Qt, pyqtSignal, QThread, pyqtSlot, QTimer
from PyQt5.QtGui import QFont, QIcon, QColor, QTextCursor
import fullstack_generator
import asyncio

# Try to import ClickUp integration if available
try:
    from ClickUpIntegration import get_task
    CLICKUP_AVAILABLE = True
except ImportError:
    CLICKUP_AVAILABLE = False
    print("Note: ClickUpIntegration module not available")

# Try to import LLM integration if available
try:
    from LLMIntegaration import generate_schema
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("Note: LLMIntegaration module not available")

# Create synchronous wrapper functions for fullstack_generator async functions
def process_batch_module_sync(module_config, backend_path, frontend_path, gen_backend, gen_frontend):
    """Synchronous wrapper for process_batch_module"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(fullstack_generator.process_batch_module(
            module_config, backend_path, frontend_path, gen_backend, gen_frontend
        ))
    finally:
        loop.close()

def delete_module_sync(backend_path, frontend_path, module_name, delete_backend=True, delete_frontend=True):
    """Synchronous wrapper for delete_module"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(fullstack_generator.delete_module(
            backend_path, frontend_path, module_name, delete_backend, delete_frontend
        ))
    finally:
        loop.close()

class GenerationThread(QThread):
    """Thread for running generation tasks"""
    log_signal = pyqtSignal(str)
    progress_signal = pyqtSignal(int)
    finished_signal = pyqtSignal(bool, str)
    
    def __init__(self, task_type, **kwargs):
        super().__init__()
        self.task_type = task_type
        self.kwargs = kwargs
        
    def run(self):
        try:
            if self.task_type == "create_module":
                self.create_module()
            elif self.task_type == "batch":
                self.batch_generate()
            elif self.task_type == "ai_clickup":
                self.ai_clickup_generate()
            elif self.task_type == "delete":
                self.delete_module()
                
        except Exception as e:
            self.log_signal.emit(f"❌ Error: {str(e)}")
            self.log_signal.emit(traceback.format_exc())
            self.finished_signal.emit(False, str(e))
    
    def create_module(self):
        """Create a single module"""
        self.log_signal.emit("Starting module creation...")
        
        # Prepare config from GUI data
        config = {
            "modules": [{
                "name": self.kwargs.get("module_name"),
                "fields": self.kwargs.get("fields", []),
                "relationships": self.kwargs.get("relationships", [])
            }]
        }
        
        # Validate
        validation = fullstack_generator.validate_batch_config(config)
        if not validation["isValid"]:
            self.log_signal.emit("❌ Validation failed:")
            for err in validation["errors"]:
                self.log_signal.emit(f"   • {err}")
            self.finished_signal.emit(False, "Validation failed")
            return
        
        # Process module
        self.log_signal.emit(f"Processing module: {self.kwargs.get('module_name')}")
        result = process_batch_module_sync(
            config["modules"][0],
            self.kwargs.get("backend_path"),
            self.kwargs.get("frontend_path"),
            self.kwargs.get("gen_backend", True),
            self.kwargs.get("gen_frontend", True)
        )
        
        if result["success"]:
            self.log_signal.emit("✅ Module created successfully!")
            self.finished_signal.emit(True, "Module created successfully")
        else:
            self.log_signal.emit("❌ Module creation failed:")
            for err in result["errors"]:
                self.log_signal.emit(f"   • {err}")
            self.finished_signal.emit(False, "Module creation failed")
    
    def batch_generate(self):
        """Process batch generation"""
        self.log_signal.emit("Starting batch generation...")
        
        try:
            config = json.loads(self.kwargs.get("config_json", "{}"))
            validation = fullstack_generator.validate_batch_config(config)
            
            if not validation["isValid"]:
                self.log_signal.emit("❌ Validation failed:")
                for err in validation["errors"]:
                    self.log_signal.emit(f"   • {err}")
                self.finished_signal.emit(False, "Validation failed")
                return
            
            self.log_signal.emit(f"✅ Configuration validated. Found {len(config.get('modules', []))} modules")
            
            results = []
            total = len(config.get("modules", []))
            
            for i, module in enumerate(config.get("modules", []), 1):
                self.log_signal.emit(f"\n📝 [{i}/{total}] Processing: {module['name']}")
                self.progress_signal.emit(int((i / total) * 100))
                
                result = process_batch_module_sync(
                    module,
                    self.kwargs.get("backend_path"),
                    self.kwargs.get("frontend_path"),
                    self.kwargs.get("gen_backend", True),
                    self.kwargs.get("gen_frontend", True)
                )
                results.append(result)
                
                if result["success"]:
                    self.log_signal.emit(f"✅ {module['name']} generated successfully")
                else:
                    self.log_signal.emit(f"❌ {module['name']} generation failed")
            
            # Summary
            success_count = sum(1 for r in results if r["success"])
            self.log_signal.emit(f"\n📊 Summary: {success_count}/{total} modules successful")
            
            if success_count == total:
                self.finished_signal.emit(True, f"All {total} modules generated successfully")
            else:
                self.finished_signal.emit(False, f"{success_count}/{total} modules successful")
                
        except Exception as e:
            self.log_signal.emit(f"❌ Batch generation error: {str(e)}")
            self.finished_signal.emit(False, str(e))
    
    def ai_clickup_generate(self):
        """AI & ClickUp mode generation"""
        self.log_signal.emit("Starting AI & ClickUp mode...")
        
        if not CLICKUP_AVAILABLE:
            self.log_signal.emit("❌ ClickUpIntegration module not available")
            self.finished_signal.emit(False, "ClickUp integration not available")
            return
        
        if not LLM_AVAILABLE:
            self.log_signal.emit("❌ LLMIntegaration module not available")
            self.finished_signal.emit(False, "LLM integration not available")
            return
        
        try:
            task_id = self.kwargs.get("task_id")
            self.log_signal.emit(f"Fetching ClickUp task: {task_id}")
            
            # Fetch from ClickUp
            task_data = get_task(task_id)
            self.log_signal.emit(f"✅ Task fetched: {task_data}")
            
            # Generate schema with AI
            self.log_signal.emit("🤖 Generating configuration with AI...")
            generated_config = generate_schema(task_data)
            self.log_signal.emit("✅ AI configuration generated")
            
            # Parse and process
            parsed_config = json.loads(generated_config)
            
            if "modules" not in parsed_config:
                self.log_signal.emit("❌ Generated config missing 'modules' array")
                self.finished_signal.emit(False, "Invalid AI response")
                return
            
            # Fix module names
            for module in parsed_config["modules"]:
                if "name" in module and " " in module["name"]:
                    old_name = module["name"]
                    module["name"] = module["name"].replace(" ", "")
                    self.log_signal.emit(f"⚠️  Fixed module name: '{old_name}' → '{module['name']}'")
            
            self.log_signal.emit(f"📦 Found {len(parsed_config['modules'])} modules")
            
            # Process each module
            results = []
            total = len(parsed_config["modules"])
            
            for i, module in enumerate(parsed_config["modules"], 1):
                self.log_signal.emit(f"\n📝 [{i}/{total}] Processing: {module.get('name', 'Unnamed')}")
                self.progress_signal.emit(int((i / total) * 100))
                
                result = process_batch_module_sync(
                    module,
                    self.kwargs.get("backend_path"),
                    self.kwargs.get("frontend_path"),
                    True,
                    True
                )
                results.append(result)
            
            # Summary
            success_count = sum(1 for r in results if r["success"])
            self.log_signal.emit(f"\n📊 AI Generation Summary: {success_count}/{total} modules successful")
            
            if success_count == total:
                self.finished_signal.emit(True, f"AI generation completed: {success_count}/{total} successful")
            else:
                self.finished_signal.emit(False, f"AI generation partial: {success_count}/{total} successful")
                
        except Exception as e:
            self.log_signal.emit(f"❌ AI & ClickUp error: {str(e)}")
            self.log_signal.emit(traceback.format_exc())
            self.finished_signal.emit(False, str(e))
    
    def delete_module(self):
        """Delete a module"""
        self.log_signal.emit(f"Deleting module: {self.kwargs.get('module_name')}")
        
        try:
            results = delete_module_sync(
                self.kwargs.get("backend_path"),
                self.kwargs.get("frontend_path"),
                self.kwargs.get("module_name"),
                self.kwargs.get("delete_backend", True),
                self.kwargs.get("delete_frontend", True)
            )
            
            self.log_signal.emit("✅ Module deletion complete!")
            self.finished_signal.emit(True, "Module deleted successfully")
            
        except Exception as e:
            self.log_signal.emit(f"❌ Deletion error: {str(e)}")
            self.finished_signal.emit(False, str(e))

# [Rest of the code remains exactly the same from FieldDialog class to the end...]
# Keep all the other classes (FieldDialog, RelationshipDialog, ModuleCreationTab, 
# BatchModeTab, AIClickUpTab, DeleteModuleTab, MainWindow) exactly as they were
# in your original code, starting from line where FieldDialog is defined...

class FieldDialog(QDialog):
    """Dialog for editing a field"""
    def __init__(self, field_data=None, parent=None):
        super().__init__(parent)
        self.field_data = field_data or {}
        self.init_ui()
        
    def init_ui(self):
        self.setWindowTitle("Edit Field" if self.field_data else "Add Field")
        self.setModal(True)
        self.setMinimumWidth(500)
        
        layout = QVBoxLayout()
        
        # Field configuration grid
        grid = QGridLayout()
        
        # Field name
        grid.addWidget(QLabel("Field Name:"), 0, 0)
        self.field_name = QLineEdit()
        self.field_name.setText(self.field_data.get("name", ""))
        grid.addWidget(self.field_name, 0, 1, 1, 3)
        
        # Field type
        grid.addWidget(QLabel("Type:"), 1, 0)
        self.field_type = QComboBox()
        self.field_type.addItems(sorted(fullstack_generator.FIELD_TYPES.keys()))
        if "type" in self.field_data:
            self.field_type.setCurrentText(self.field_data["type"])
        self.field_type.currentTextChanged.connect(self.on_type_changed)
        grid.addWidget(self.field_type, 1, 1, 1, 3)
        
        # Show in table
        self.show_in_table = QCheckBox("Show in Table")
        self.show_in_table.setChecked(self.field_data.get("showInTable", True))
        grid.addWidget(self.show_in_table, 2, 0, 1, 2)
        
        # Column span
        grid.addWidget(QLabel("Column Span:"), 2, 2)
        self.col_span = QSpinBox()
        self.col_span.setRange(1, 12)
        self.col_span.setValue(self.field_data.get("col", 6))
        grid.addWidget(self.col_span, 2, 3)
        
        # Description
        grid.addWidget(QLabel("Description:"), 3, 0)
        self.description = QLineEdit()
        self.description.setText(self.field_data.get("description", ""))
        grid.addWidget(self.description, 3, 1, 1, 3)
        
        layout.addLayout(grid)
        
        # Options section (initially hidden)
        self.options_group = QGroupBox("Options")
        self.options_group.setVisible(False)
        options_layout = QVBoxLayout()
        
        # Options type
        options_type_layout = QHBoxLayout()
        options_type_layout.addWidget(QLabel("Options Type:"))
        self.options_type = QComboBox()
        self.options_type.addItems(["Static", "Dynamic"])
        self.options_type.currentTextChanged.connect(self.on_options_type_changed)
        options_type_layout.addWidget(self.options_type)
        options_layout.addLayout(options_type_layout)
        
        # Static options
        self.static_options_widget = QWidget()
        static_layout = QVBoxLayout()
        self.static_options_table = QTableWidget(0, 2)
        self.static_options_table.setHorizontalHeaderLabels(["ID", "Name"])
        self.static_options_table.horizontalHeader().setStretchLastSection(True)
        
        static_buttons = QHBoxLayout()
        btn_add_option = QPushButton("Add Option")
        btn_add_option.clicked.connect(self.add_static_option)
        static_buttons.addWidget(btn_add_option)
        
        btn_remove_option = QPushButton("Remove Selected")
        btn_remove_option.clicked.connect(self.remove_static_option)
        static_buttons.addWidget(btn_remove_option)
        
        static_layout.addWidget(self.static_options_table)
        static_layout.addLayout(static_buttons)
        self.static_options_widget.setLayout(static_layout)
        options_layout.addWidget(self.static_options_widget)
        
        # Dynamic options
        self.dynamic_options_widget = QWidget()
        dynamic_layout = QGridLayout()
        
        dynamic_layout.addWidget(QLabel("Module/API:"), 0, 0)
        self.dynamic_module = QLineEdit()
        dynamic_layout.addWidget(self.dynamic_module, 0, 1)
        
        dynamic_layout.addWidget(QLabel("Option Label:"), 1, 0)
        self.dynamic_option_label = QLineEdit()
        self.dynamic_option_label.setText("name")
        dynamic_layout.addWidget(self.dynamic_option_label, 1, 1)
        
        dynamic_layout.addWidget(QLabel("Option Value:"), 2, 0)
        self.dynamic_option_value = QLineEdit()
        self.dynamic_option_value.setText("id")
        dynamic_layout.addWidget(self.dynamic_option_value, 2, 1)
        
        self.dynamic_options_widget.setLayout(dynamic_layout)
        options_layout.addWidget(self.dynamic_options_widget)
        
        self.options_group.setLayout(options_layout)
        layout.addWidget(self.options_group)
        
        # Multiple selection
        self.multiple_checkbox = QCheckBox("Allow Multiple Selection")
        self.multiple_checkbox.setChecked(self.field_data.get("multiple", False))
        layout.addWidget(self.multiple_checkbox)
        
        # Dialog buttons
        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        
        self.setLayout(layout)
        
        # Load existing options if any
        if self.field_data:
            self.load_existing_options()
    
    def on_type_changed(self, field_type):
        """Show/hide options based on field type"""
        field_info = fullstack_generator.FIELD_TYPES.get(field_type, {})
        has_options = field_info.get("hasOptions", False)
        self.options_group.setVisible(has_options)
        self.multiple_checkbox.setVisible(has_options)
        
        # Update column span from field info
        if "col" in field_info:
            self.col_span.setValue(field_info["col"])
    
    def on_options_type_changed(self, options_type):
        """Switch between static and dynamic options"""
        is_static = options_type == "Static"
        self.static_options_widget.setVisible(is_static)
        self.dynamic_options_widget.setVisible(not is_static)
    
    def add_static_option(self):
        """Add a new row to static options table"""
        row = self.static_options_table.rowCount()
        self.static_options_table.insertRow(row)
        self.static_options_table.setItem(row, 0, QTableWidgetItem(f"option{row+1}"))
        self.static_options_table.setItem(row, 1, QTableWidgetItem(f"Option {row+1}"))
    
    def remove_static_option(self):
        """Remove selected rows from static options table"""
        selected = self.static_options_table.selectedItems()
        if selected:
            rows = set(item.row() for item in selected)
            for row in sorted(rows, reverse=True):
                self.static_options_table.removeRow(row)
    
    def load_existing_options(self):
        """Load existing options from field data"""
        if "options" in self.field_data and self.field_data["options"]:
            self.options_type.setCurrentText("Static")
            for opt in self.field_data["options"]:
                row = self.static_options_table.rowCount()
                self.static_options_table.insertRow(row)
                self.static_options_table.setItem(row, 0, QTableWidgetItem(str(opt.get("id", ""))))
                self.static_options_table.setItem(row, 1, QTableWidgetItem(str(opt.get("name", ""))))
        
        elif self.field_data.get("isDynamic", False):
            self.options_type.setCurrentText("Dynamic")
            self.dynamic_module.setText(self.field_data.get("moduleName", ""))
            self.dynamic_option_label.setText(self.field_data.get("optionLabel", "name"))
            self.dynamic_option_value.setText(self.field_data.get("optionValue", "id"))
    
    def get_field_data(self):
        """Get field configuration from dialog"""
        field_type = self.field_type.currentText()
        field_info = fullstack_generator.FIELD_TYPES.get(field_type, {})
        
        data = {
            "name": self.field_name.text(),
            "type": field_type,
            "description": self.description.text(),
            "showInTable": self.show_in_table.isChecked(),
            "col": self.col_span.value(),
            "formType": field_info.get("formType", "text")
        }
        
        # Add options if applicable
        if field_info.get("hasOptions", False):
            data["multiple"] = self.multiple_checkbox.isChecked()
            
            if self.options_type.currentText() == "Static":
                options = []
                for row in range(self.static_options_table.rowCount()):
                    id_item = self.static_options_table.item(row, 0)
                    name_item = self.static_options_table.item(row, 1)
                    if id_item and name_item:
                        options.append({
                            "id": id_item.text(),
                            "name": name_item.text()
                        })
                if options:
                    data["options"] = options
            else:
                data["isDynamic"] = True
                data["moduleName"] = self.dynamic_module.text()
                data["optionLabel"] = self.dynamic_option_label.text()
                data["optionValue"] = self.dynamic_option_value.text()
        
        return data

class RelationshipDialog(QDialog):
    """Dialog for editing a relationship"""
    def __init__(self, relationship_data=None, parent=None):
        super().__init__(parent)
        self.relationship_data = relationship_data or {}
        self.init_ui()
        
    def init_ui(self):
        self.setWindowTitle("Edit Relationship" if self.relationship_data else "Add Relationship")
        self.setModal(True)
        
        layout = QVBoxLayout()
        
        # Relationship configuration grid
        grid = QGridLayout()
        
        # Relationship type
        grid.addWidget(QLabel("Type:"), 0, 0)
        self.rel_type = QComboBox()
        self.rel_type.addItems(sorted(fullstack_generator.RELATIONSHIP_TYPES.keys()))
        if "type" in self.relationship_data:
            self.rel_type.setCurrentText(self.relationship_data["type"])
        self.rel_type.currentTextChanged.connect(self.on_type_changed)
        grid.addWidget(self.rel_type, 0, 1)
        
        # Related model
        grid.addWidget(QLabel("Related Model:"), 1, 0)
        self.related_model = QLineEdit()
        self.related_model.setText(self.relationship_data.get("relatedModel", ""))
        grid.addWidget(self.related_model, 1, 1)
        
        # Method name
        grid.addWidget(QLabel("Method Name:"), 2, 0)
        self.method_name = QLineEdit()
        self.method_name.setText(self.relationship_data.get("methodName", ""))
        grid.addWidget(self.method_name, 2, 1)
        
        # Foreign key (for belongsTo)
        self.fk_widget = QWidget()
        fk_layout = QHBoxLayout()
        fk_layout.addWidget(QLabel("Foreign Key:"))
        self.foreign_key = QLineEdit()
        self.foreign_key.setText(self.relationship_data.get("foreignKey", ""))
        fk_layout.addWidget(self.foreign_key)
        self.fk_widget.setLayout(fk_layout)
        grid.addWidget(self.fk_widget, 3, 0, 1, 2)
        
        # Inverse relationship options
        self.inverse_group = QGroupBox("Inverse Relationship")
        inverse_layout = QVBoxLayout()
        
        self.add_inverse = QCheckBox("Add Inverse Relationship")
        self.add_inverse.setChecked(self.relationship_data.get("addInverse", False))
        inverse_layout.addWidget(self.add_inverse)
        
        inverse_fields = QWidget()
        inverse_fields_layout = QGridLayout()
        
        inverse_fields_layout.addWidget(QLabel("Inverse Method:"), 0, 0)
        self.inverse_method = QLineEdit()
        self.inverse_method.setText(self.relationship_data.get("inverseMethod", ""))
        inverse_fields_layout.addWidget(self.inverse_method, 0, 1)
        
        inverse_fields_layout.addWidget(QLabel("Inverse Type:"), 1, 0)
        self.inverse_type = QComboBox()
        self.inverse_type.addItems(["belongsTo", "hasOne", "hasMany", "belongsToMany"])
        if "inverseType" in self.relationship_data:
            self.inverse_type.setCurrentText(self.relationship_data["inverseType"])
        inverse_fields_layout.addWidget(self.inverse_type, 1, 1)
        
        inverse_fields.setLayout(inverse_fields_layout)
        inverse_layout.addWidget(inverse_fields)
        
        self.inverse_group.setLayout(inverse_layout)
        grid.addWidget(self.inverse_group, 4, 0, 1, 2)
        
        layout.addLayout(grid)
        
        # Description
        desc_label = QLabel("Description:")
        layout.addWidget(desc_label)
        self.description = QTextEdit()
        self.description.setMaximumHeight(60)
        self.description.setText(self.relationship_data.get("description", ""))
        layout.addWidget(self.description)
        
        # Dialog buttons
        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        
        self.setLayout(layout)
        
        # Initial state
        self.on_type_changed(self.rel_type.currentText())
    
    def on_type_changed(self, rel_type):
        """Update UI based on relationship type"""
        # Show/hide foreign key field
        show_fk = rel_type == "belongsTo"
        self.fk_widget.setVisible(show_fk)
        
        # Set default foreign key if empty
        if show_fk and not self.foreign_key.text():
            related = self.related_model.text()
            if related:
                self.foreign_key.setText(f"{related.lower()}_id")
        
        # Set default method name if empty
        if not self.method_name.text():
            related = self.related_model.text()
            if related:
                self.method_name.setText(related.lower())
        
        # Set default inverse method if empty and inverse is checked
        if not self.inverse_method.text() and self.add_inverse.isChecked():
            self.inverse_method.setText(f"{self.parent().module_name.lower()}s")
    
    def get_relationship_data(self):
        """Get relationship configuration from dialog"""
        data = {
            "type": self.rel_type.currentText(),
            "relatedModel": self.related_model.text(),
            "methodName": self.method_name.text(),
            "description": self.description.toPlainText()
        }
        
        if self.rel_type.currentText() == "belongsTo":
            data["foreignKey"] = self.foreign_key.text()
        
        if self.add_inverse.isChecked():
            data["addInverse"] = True
            data["inverseMethod"] = self.inverse_method.text()
            data["inverseType"] = self.inverse_type.currentText()
        
        return data

class ModuleCreationTab(QWidget):
    """Tab for creating individual modules"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.fields = []
        self.relationships = []
        self.init_ui()
        
    def init_ui(self):
        main_layout = QVBoxLayout()
        
        # Module name
        name_layout = QHBoxLayout()
        name_layout.addWidget(QLabel("Module Name:"))
        self.module_name = QLineEdit()
        self.module_name.textChanged.connect(self.on_module_name_changed)
        name_layout.addWidget(self.module_name)
        main_layout.addLayout(name_layout)
        
        # Paths
        paths_group = QGroupBox("Paths")
        paths_layout = QGridLayout()
        
        paths_layout.addWidget(QLabel("Backend Path:"), 0, 0)
        self.backend_path = QLineEdit()
        self.backend_path.setText("../Backend")
        paths_layout.addWidget(self.backend_path, 0, 1)
        btn_backend = QPushButton("Browse...")
        btn_backend.clicked.connect(self.browse_backend)
        paths_layout.addWidget(btn_backend, 0, 2)
        
        paths_layout.addWidget(QLabel("Frontend Path:"), 1, 0)
        self.frontend_path = QLineEdit()
        self.frontend_path.setText("../Frontend")
        paths_layout.addWidget(self.frontend_path, 1, 1)
        btn_frontend = QPushButton("Browse...")
        btn_frontend.clicked.connect(self.browse_frontend)
        paths_layout.addWidget(btn_frontend, 1, 2)
        
        # Generation options
        paths_layout.addWidget(QLabel("Generate:"), 2, 0)
        self.gen_backend = QCheckBox("Backend")
        self.gen_backend.setChecked(True)
        paths_layout.addWidget(self.gen_backend, 2, 1)
        
        self.gen_frontend = QCheckBox("Frontend")
        self.gen_frontend.setChecked(True)
        paths_layout.addWidget(self.gen_frontend, 2, 2)
        
        paths_group.setLayout(paths_layout)
        main_layout.addWidget(paths_group)
        
        # Fields section
        fields_group = QGroupBox(f"Fields (0)")
        fields_layout = QVBoxLayout()
        
        self.fields_list = QListWidget()
        self.fields_list.itemDoubleClicked.connect(self.edit_field)
        fields_layout.addWidget(self.fields_list)
        
        fields_buttons = QHBoxLayout()
        btn_add_field = QPushButton("Add Field")
        btn_add_field.clicked.connect(self.add_field)
        fields_buttons.addWidget(btn_add_field)
        
        btn_edit_field = QPushButton("Edit Field")
        btn_edit_field.clicked.connect(self.edit_field)
        fields_buttons.addWidget(btn_edit_field)
        
        btn_remove_field = QPushButton("Remove Field")
        btn_remove_field.clicked.connect(self.remove_field)
        fields_buttons.addWidget(btn_remove_field)
        
        fields_layout.addLayout(fields_buttons)
        fields_group.setLayout(fields_layout)
        main_layout.addWidget(fields_group)
        
        # Relationships section
        rel_group = QGroupBox(f"Relationships (0)")
        rel_layout = QVBoxLayout()
        
        self.relationships_list = QListWidget()
        self.relationships_list.itemDoubleClicked.connect(self.edit_relationship)
        rel_layout.addWidget(self.relationships_list)
        
        rel_buttons = QHBoxLayout()
        btn_add_rel = QPushButton("Add Relationship")
        btn_add_rel.clicked.connect(self.add_relationship)
        rel_buttons.addWidget(btn_add_rel)
        
        btn_edit_rel = QPushButton("Edit Relationship")
        btn_edit_rel.clicked.connect(self.edit_relationship)
        rel_buttons.addWidget(btn_edit_rel)
        
        btn_remove_rel = QPushButton("Remove Relationship")
        btn_remove_rel.clicked.connect(self.remove_relationship)
        rel_buttons.addWidget(btn_remove_rel)
        
        rel_layout.addLayout(rel_buttons)
        rel_group.setLayout(rel_layout)
        main_layout.addWidget(rel_group)
        
        # Generate button
        self.btn_generate = QPushButton("Generate Module")
        self.btn_generate.clicked.connect(self.generate_module)
        self.btn_generate.setEnabled(False)
        self.btn_generate.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                font-weight: bold;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
            QPushButton:hover:!disabled {
                background-color: #45a049;
            }
        """)
        main_layout.addWidget(self.btn_generate)
        
        self.setLayout(main_layout)
        self.fields_group = fields_group
        self.rel_group = rel_group
        
    def on_module_name_changed(self, text):
        """Enable/disable generate button based on module name"""
        has_name = bool(text.strip())
        has_fields = len(self.fields) > 0
        self.btn_generate.setEnabled(has_name and has_fields)
        
    def browse_backend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Backend Directory")
        if path:
            self.backend_path.setText(path)
            
    def browse_frontend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Frontend Directory")
        if path:
            self.frontend_path.setText(path)
            
    def add_field(self):
        dialog = FieldDialog(parent=self)
        if dialog.exec_() == QDialog.Accepted:
            field_data = dialog.get_field_data()
            if field_data["name"]:
                self.fields.append(field_data)
                self.update_fields_list()
                
    def edit_field(self):
        current_row = self.fields_list.currentRow()
        if current_row >= 0 and current_row < len(self.fields):
            dialog = FieldDialog(self.fields[current_row], self)
            if dialog.exec_() == QDialog.Accepted:
                field_data = dialog.get_field_data()
                if field_data["name"]:
                    self.fields[current_row] = field_data
                    self.update_fields_list()
                    
    def remove_field(self):
        current_row = self.fields_list.currentRow()
        if current_row >= 0:
            self.fields.pop(current_row)
            self.update_fields_list()
            
    def update_fields_list(self):
        self.fields_list.clear()
        for field in self.fields:
            desc = field.get('description', '')
            if desc:
                item_text = f"{field['name']} ({field['type']}) - {desc}"
            else:
                item_text = f"{field['name']} ({field['type']})"
            item = QListWidgetItem(item_text)
            self.fields_list.addItem(item)
        
        # Update group title
        self.fields_group.setTitle(f"Fields ({len(self.fields)})")
        self.on_module_name_changed(self.module_name.text())
        
    def add_relationship(self):
        dialog = RelationshipDialog(parent=self)
        if dialog.exec_() == QDialog.Accepted:
            rel_data = dialog.get_relationship_data()
            if rel_data["relatedModel"]:
                self.relationships.append(rel_data)
                self.update_relationships_list()
                
    def edit_relationship(self):
        current_row = self.relationships_list.currentRow()
        if current_row >= 0 and current_row < len(self.relationships):
            dialog = RelationshipDialog(self.relationships[current_row], self)
            if dialog.exec_() == QDialog.Accepted:
                rel_data = dialog.get_relationship_data()
                if rel_data["relatedModel"]:
                    self.relationships[current_row] = rel_data
                    self.update_relationships_list()
                    
    def remove_relationship(self):
        current_row = self.relationships_list.currentRow()
        if current_row >= 0:
            self.relationships.pop(current_row)
            self.update_relationships_list()
            
    def update_relationships_list(self):
        self.relationships_list.clear()
        for rel in self.relationships:
            desc = rel.get('description', '')
            if desc:
                item_text = f"{rel['methodName']}: {rel['type']} -> {rel['relatedModel']} - {desc}"
            else:
                item_text = f"{rel['methodName']}: {rel['type']} -> {rel['relatedModel']}"
            item = QListWidgetItem(item_text)
            self.relationships_list.addItem(item)
        
        # Update group title
        self.rel_group.setTitle(f"Relationships ({len(self.relationships)})")
        
    def generate_module(self):
        """Start module generation"""
        if not self.module_name.text().strip():
            QMessageBox.warning(self, "Warning", "Please enter a module name!")
            return
            
        if not self.fields:
            QMessageBox.warning(self, "Warning", "Please add at least one field!")
            return
            
        # Get main window
        main_window = self.window()
        if hasattr(main_window, 'start_generation'):
            main_window.start_generation(
                task_type="create_module",
                module_name=self.module_name.text(),
                fields=self.fields,
                relationships=self.relationships,
                backend_path=self.backend_path.text(),
                frontend_path=self.frontend_path.text(),
                gen_backend=self.gen_backend.isChecked(),
                gen_frontend=self.gen_frontend.isChecked()
            )

class BatchModeTab(QWidget):
    """Tab for batch mode using JSON configuration"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
        
    def init_ui(self):
        layout = QVBoxLayout()
        
        # Paths
        paths_group = QGroupBox("Paths")
        paths_layout = QGridLayout()
        
        paths_layout.addWidget(QLabel("Backend Path:"), 0, 0)
        self.backend_path = QLineEdit()
        self.backend_path.setText("../Backend")
        paths_layout.addWidget(self.backend_path, 0, 1)
        btn_backend = QPushButton("Browse...")
        btn_backend.clicked.connect(self.browse_backend)
        paths_layout.addWidget(btn_backend, 0, 2)
        
        paths_layout.addWidget(QLabel("Frontend Path:"), 1, 0)
        self.frontend_path = QLineEdit()
        self.frontend_path.setText("../Frontend")
        paths_layout.addWidget(self.frontend_path, 1, 1)
        btn_frontend = QPushButton("Browse...")
        btn_frontend.clicked.connect(self.browse_frontend)
        paths_layout.addWidget(btn_frontend, 1, 2)
        
        # Generation options
        paths_layout.addWidget(QLabel("Generate:"), 2, 0)
        self.gen_backend = QCheckBox("Backend")
        self.gen_backend.setChecked(True)
        paths_layout.addWidget(self.gen_backend, 2, 1)
        
        self.gen_frontend = QCheckBox("Frontend")
        self.gen_frontend.setChecked(True)
        paths_layout.addWidget(self.gen_frontend, 2, 2)
        
        paths_group.setLayout(paths_layout)
        layout.addWidget(paths_group)
        
        # JSON configuration
        config_group = QGroupBox("JSON Configuration")
        config_layout = QVBoxLayout()
        
        self.json_editor = QTextEdit()
        self.json_editor.setPlaceholderText("Paste your JSON configuration here or load from file...")
        config_layout.addWidget(self.json_editor)
        
        json_buttons = QHBoxLayout()
        btn_load = QPushButton("📂 Load JSON File...")
        btn_load.clicked.connect(self.load_json)
        json_buttons.addWidget(btn_load)
        
        btn_validate = QPushButton("✓ Validate JSON")
        btn_validate.clicked.connect(self.validate_json)
        json_buttons.addWidget(btn_validate)
        
        btn_example = QPushButton("📋 Load Example")
        btn_example.clicked.connect(self.load_example)
        json_buttons.addWidget(btn_example)
        
        btn_save = QPushButton("💾 Save JSON...")
        btn_save.clicked.connect(self.save_json)
        json_buttons.addWidget(btn_save)
        
        config_layout.addLayout(json_buttons)
        config_group.setLayout(config_layout)
        layout.addWidget(config_group)
        
        # Stats label
        self.stats_label = QLabel("No configuration loaded")
        self.stats_label.setStyleSheet("font-style: italic; color: #666;")
        layout.addWidget(self.stats_label)
        
        # Generate button
        self.btn_generate = QPushButton("🚀 Generate Batch")
        self.btn_generate.clicked.connect(self.generate_batch)
        self.btn_generate.setEnabled(False)
        self.btn_generate.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                font-weight: bold;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
            QPushButton:hover:!disabled {
                background-color: #1976D2;
            }
        """)
        layout.addWidget(self.btn_generate)
        
        self.setLayout(layout)
        
    def browse_backend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Backend Directory")
        if path:
            self.backend_path.setText(path)
            
    def browse_frontend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Frontend Directory")
        if path:
            self.frontend_path.setText(path)
            
    def load_json(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Open JSON File", "", 
            "JSON Files (*.json);;All Files (*)"
        )
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    self.json_editor.setText(content)
                    self.update_stats()
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to load file:\n{str(e)}")
                
    def save_json(self):
        if not self.json_editor.toPlainText().strip():
            QMessageBox.warning(self, "Warning", "No JSON content to save!")
            return
            
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Save JSON File", "batch-config.json",
            "JSON Files (*.json);;All Files (*)"
        )
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(self.json_editor.toPlainText())
                QMessageBox.information(self, "Success", f"Configuration saved to:\n{file_path}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save file:\n{str(e)}")
                
    def validate_json(self):
        try:
            config = json.loads(self.json_editor.toPlainText())
            validation = fullstack_generator.validate_batch_config(config)
            
            if validation["isValid"]:
                self.update_stats()
                QMessageBox.information(self, "Validation", "✅ JSON configuration is valid!")
                self.btn_generate.setEnabled(True)
            else:
                errors = "\n".join(validation["errors"])
                QMessageBox.warning(self, "Validation Errors", f"❌ Found errors:\n{errors}")
                self.btn_generate.setEnabled(False)
        except json.JSONDecodeError as e:
            QMessageBox.critical(self, "Invalid JSON", f"❌ JSON parsing error:\n{str(e)}")
            self.btn_generate.setEnabled(False)
        except Exception as e:
            QMessageBox.critical(self, "Error", f"❌ Validation error:\n{str(e)}")
            self.btn_generate.setEnabled(False)
            
    def load_example(self):
        example_config = {
            "modules": [
                {
                    "name": "Product",
                    "fields": [
                        {
                            "name": "title",
                            "type": "string",
                            "description": "Product title",
                            "showInTable": True
                        },
                        {
                            "name": "description",
                            "type": "textarea",
                            "description": "Product description",
                            "showInTable": False
                        },
                        {
                            "name": "price",
                            "type": "decimal",
                            "description": "Product price",
                            "showInTable": True
                        },
                        {
                            "name": "stock",
                            "type": "integer",
                            "description": "Stock quantity",
                            "showInTable": True
                        },
                        {
                            "name": "isActive",
                            "type": "boolean",
                            "description": "Is product active",
                            "showInTable": True
                        }
                    ],
                    "relationships": [
                        {
                            "type": "belongsTo",
                            "relatedModel": "Category",
                            "methodName": "category",
                            "foreignKey": "category_id",
                            "inverseMethod": "products",
                            "inverseType": "hasMany"
                        }
                    ]
                },
                {
                    "name": "Category",
                    "fields": [
                        {
                            "name": "name",
                            "type": "string",
                            "description": "Category name",
                            "showInTable": True
                        },
                        {
                            "name": "slug",
                            "type": "string",
                            "description": "URL slug",
                            "showInTable": True
                        }
                    ]
                }
            ]
        }
        
        self.json_editor.setText(json.dumps(example_config, indent=2))
        self.update_stats()
        
    def update_stats(self):
        """Update statistics label based on JSON content"""
        try:
            config = json.loads(self.json_editor.toPlainText())
            modules = config.get("modules", [])
            total_fields = sum(len(m.get("fields", [])) for m in modules)
            total_relationships = sum(len(m.get("relationships", [])) for m in modules)
            
            self.stats_label.setText(
                f"📊 Statistics: {len(modules)} modules, "
                f"{total_fields} fields, "
                f"{total_relationships} relationships"
            )
            self.btn_generate.setEnabled(len(modules) > 0)
        except:
            self.stats_label.setText("Invalid JSON configuration")
            self.btn_generate.setEnabled(False)
            
    def generate_batch(self):
        """Start batch generation"""
        if not self.json_editor.toPlainText().strip():
            QMessageBox.warning(self, "Warning", "Please provide JSON configuration!")
            return
            
        # Get main window
        main_window = self.window()
        if hasattr(main_window, 'start_generation'):
            main_window.start_generation(
                task_type="batch",
                config_json=self.json_editor.toPlainText(),
                backend_path=self.backend_path.text(),
                frontend_path=self.frontend_path.text(),
                gen_backend=self.gen_backend.isChecked(),
                gen_frontend=self.gen_frontend.isChecked()
            )

class AIClickUpTab(QWidget):
    """Tab for AI & ClickUp mode"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
        
    def init_ui(self):
        layout = QVBoxLayout()
        
        # Status indicators
        status_layout = QHBoxLayout()
        
        self.clickup_status = QLabel("❌ ClickUp: Not available")
        if CLICKUP_AVAILABLE:
            self.clickup_status.setText("✅ ClickUp: Available")
            self.clickup_status.setStyleSheet("color: green;")
        status_layout.addWidget(self.clickup_status)
        
        self.llm_status = QLabel("❌ AI: Not available")
        if LLM_AVAILABLE:
            self.llm_status.setText("✅ AI: Available")
            self.llm_status.setStyleSheet("color: green;")
        status_layout.addWidget(self.llm_status)
        
        layout.addLayout(status_layout)
        
        # Paths
        paths_group = QGroupBox("Paths")
        paths_layout = QGridLayout()
        
        paths_layout.addWidget(QLabel("Backend Path:"), 0, 0)
        self.backend_path = QLineEdit()
        self.backend_path.setText("../Backend")
        paths_layout.addWidget(self.backend_path, 0, 1)
        btn_backend = QPushButton("Browse...")
        btn_backend.clicked.connect(self.browse_backend)
        paths_layout.addWidget(btn_backend, 0, 2)
        
        paths_layout.addWidget(QLabel("Frontend Path:"), 1, 0)
        self.frontend_path = QLineEdit()
        self.frontend_path.setText("../Frontend")
        paths_layout.addWidget(self.frontend_path, 1, 1)
        btn_frontend = QPushButton("Browse...")
        btn_frontend.clicked.connect(self.browse_frontend)
        paths_layout.addWidget(btn_frontend, 1, 2)
        
        paths_group.setLayout(paths_layout)
        layout.addWidget(paths_group)
        
        # ClickUp Task
        task_group = QGroupBox("ClickUp Task")
        task_layout = QVBoxLayout()
        
        task_layout.addWidget(QLabel("ClickUp Task ID:"))
        self.task_id = QLineEdit()
        self.task_id.setPlaceholderText("Enter ClickUp Task ID (e.g., 123abc)")
        task_layout.addWidget(self.task_id)
        
        task_buttons = QHBoxLayout()
        self.btn_fetch = QPushButton("🔍 Fetch Task")
        self.btn_fetch.clicked.connect(self.fetch_task)
        self.btn_fetch.setEnabled(CLICKUP_AVAILABLE)
        task_buttons.addWidget(self.btn_fetch)
        
        task_layout.addLayout(task_buttons)
        
        # Task preview
        task_layout.addWidget(QLabel("Task Preview:"))
        self.task_preview = QTextEdit()
        self.task_preview.setMaximumHeight(100)
        self.task_preview.setReadOnly(True)
        task_layout.addWidget(self.task_preview)
        
        task_group.setLayout(task_layout)
        layout.addWidget(task_group)
        
        # AI Configuration Preview
        config_group = QGroupBox("AI Configuration Preview")
        config_layout = QVBoxLayout()
        
        self.config_preview = QTextEdit()
        self.config_preview.setReadOnly(True)
        config_layout.addWidget(self.config_preview)
        
        config_buttons = QHBoxLayout()
        self.btn_generate_config = QPushButton("🤖 Generate with AI")
        self.btn_generate_config.clicked.connect(self.generate_ai_config)
        self.btn_generate_config.setEnabled(LLM_AVAILABLE and CLICKUP_AVAILABLE)
        config_buttons.addWidget(self.btn_generate_config)
        
        btn_save_config = QPushButton("💾 Save Config...")
        btn_save_config.clicked.connect(self.save_config)
        config_buttons.addWidget(btn_save_config)
        
        config_layout.addLayout(config_buttons)
        config_group.setLayout(config_layout)
        layout.addWidget(config_group)
        
        # Generate button
        self.btn_generate = QPushButton("🚀 Generate from AI Configuration")
        self.btn_generate.clicked.connect(self.generate_from_ai)
        self.btn_generate.setEnabled(False)
        self.btn_generate.setStyleSheet("""
            QPushButton {
                background-color: #9C27B0;
                color: white;
                font-weight: bold;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
            QPushButton:hover:!disabled {
                background-color: #7B1FA2;
            }
        """)
        layout.addWidget(self.btn_generate)
        
        self.setLayout(layout)
        
    def browse_backend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Backend Directory")
        if path:
            self.backend_path.setText(path)
            
    def browse_frontend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Frontend Directory")
        if path:
            self.frontend_path.setText(path)
            
    def fetch_task(self):
        """Fetch task from ClickUp"""
        task_id = self.task_id.text().strip()
        if not task_id:
            QMessageBox.warning(self, "Warning", "Please enter a ClickUp Task ID!")
            return
            
        # Get main window to log
        main_window = self.window()
        if hasattr(main_window, 'log_output'):
            main_window.log_output.append(f"Fetching ClickUp task: {task_id}")
        
        try:
            task_data = get_task(task_id)
            self.task_preview.setText(str(task_data))
            self.btn_generate_config.setEnabled(True)
            
            if hasattr(main_window, 'log_output'):
                main_window.log_output.append(f"✅ Task fetched successfully")
                
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to fetch task:\n{str(e)}")
            if hasattr(main_window, 'log_output'):
                main_window.log_output.append(f"❌ Failed to fetch task: {str(e)}")
                
    def generate_ai_config(self):
        """Generate configuration using AI"""
        task_data = self.task_preview.toPlainText()
        if not task_data:
            QMessageBox.warning(self, "Warning", "No task data to process!")
            return
            
        # Get main window to log
        main_window = self.window()
        if hasattr(main_window, 'log_output'):
            main_window.log_output.append("🤖 Generating configuration with AI...")
        
        try:
            generated_config = generate_schema(task_data)
            
            # Pretty print the JSON
            parsed = json.loads(generated_config)
            pretty_config = json.dumps(parsed, indent=2)
            self.config_preview.setText(pretty_config)
            self.btn_generate.setEnabled(True)
            
            if hasattr(main_window, 'log_output'):
                main_window.log_output.append("✅ AI configuration generated successfully")
                
        except Exception as e:
            QMessageBox.critical(self, "Error", f"AI generation failed:\n{str(e)}")
            if hasattr(main_window, 'log_output'):
                main_window.log_output.append(f"❌ AI generation failed: {str(e)}")
                
    def save_config(self):
        """Save AI-generated configuration to file"""
        config_text = self.config_preview.toPlainText()
        if not config_text.strip():
            QMessageBox.warning(self, "Warning", "No configuration to save!")
            return
            
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Save AI Configuration", "ai-config.json",
            "JSON Files (*.json);;All Files (*)"
        )
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(config_text)
                QMessageBox.information(self, "Success", f"Configuration saved to:\n{file_path}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save file:\n{str(e)}")
                
    def generate_from_ai(self):
        """Start generation from AI configuration"""
        config_text = self.config_preview.toPlainText()
        if not config_text.strip():
            QMessageBox.warning(self, "Warning", "No AI configuration available!")
            return
            
        # Get main window
        main_window = self.window()
        if hasattr(main_window, 'start_generation'):
            main_window.start_generation(
                task_type="ai_clickup",
                task_id=self.task_id.text(),
                backend_path=self.backend_path.text(),
                frontend_path=self.frontend_path.text()
            )

class DeleteModuleTab(QWidget):
    """Tab for deleting modules"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
        
    def init_ui(self):
        layout = QVBoxLayout()
        
        # Paths
        paths_group = QGroupBox("Paths")
        paths_layout = QGridLayout()
        
        paths_layout.addWidget(QLabel("Backend Path:"), 0, 0)
        self.backend_path = QLineEdit()
        self.backend_path.setText("../Backend")
        paths_layout.addWidget(self.backend_path, 0, 1)
        btn_backend = QPushButton("Browse...")
        btn_backend.clicked.connect(self.browse_backend)
        paths_layout.addWidget(btn_backend, 0, 2)
        
        paths_layout.addWidget(QLabel("Frontend Path:"), 1, 0)
        self.frontend_path = QLineEdit()
        self.frontend_path.setText("../Frontend")
        paths_layout.addWidget(self.frontend_path, 1, 1)
        btn_frontend = QPushButton("Browse...")
        btn_frontend.clicked.connect(self.browse_frontend)
        paths_layout.addWidget(btn_frontend, 1, 2)
        
        paths_group.setLayout(paths_layout)
        layout.addWidget(paths_group)
        
        # Module to delete
        module_group = QGroupBox("Module Selection")
        module_layout = QVBoxLayout()
        
        module_layout.addWidget(QLabel("Module Name to Delete:"))
        self.module_name = QLineEdit()
        module_layout.addWidget(self.module_name)
        
        # Options
        options_layout = QHBoxLayout()
        self.delete_backend = QCheckBox("Delete Backend Files")
        self.delete_backend.setChecked(True)
        options_layout.addWidget(self.delete_backend)
        
        self.delete_frontend = QCheckBox("Delete Frontend Files")
        self.delete_frontend.setChecked(True)
        options_layout.addWidget(self.delete_frontend)
        
        module_layout.addLayout(options_layout)
        module_group.setLayout(module_layout)
        layout.addWidget(module_group)
        
        # Warning
        warning_label = QLabel("⚠️  WARNING: This action is permanent and cannot be undone!")
        warning_label.setStyleSheet("color: red; font-weight: bold; padding: 10px; border: 2px solid red; border-radius: 5px;")
        warning_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(warning_label)
        
        # Delete button
        self.btn_delete = QPushButton("🗑️  Delete Module")
        self.btn_delete.clicked.connect(self.delete_module)
        self.btn_delete.setEnabled(False)
        self.btn_delete.setStyleSheet("""
            QPushButton {
                background-color: #f44336;
                color: white;
                font-weight: bold;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
            }
            QPushButton:disabled {
                background-color: #cccccc;
            }
            QPushButton:hover:!disabled {
                background-color: #d32f2f;
            }
        """)
        layout.addWidget(self.btn_delete)
        
        # Connect module name change to enable/disable button
        self.module_name.textChanged.connect(self.on_module_name_changed)
        
        self.setLayout(layout)
        
    def on_module_name_changed(self, text):
        """Enable/disable delete button based on module name"""
        self.btn_delete.setEnabled(bool(text.strip()))
        
    def browse_backend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Backend Directory")
        if path:
            self.backend_path.setText(path)
            
    def browse_frontend(self):
        path = QFileDialog.getExistingDirectory(self, "Select Frontend Directory")
        if path:
            self.frontend_path.setText(path)
            
    def delete_module(self):
        """Confirm and start module deletion"""
        module_name = self.module_name.text().strip()
        if not module_name:
            QMessageBox.warning(self, "Warning", "Please enter a module name!")
            return
            
        # Confirmation dialog
        reply = QMessageBox.question(
            self, 
            "Confirm Deletion",
            f"Are you ABSOLUTELY sure you want to delete module '{module_name}'?\n\n"
            f"This will permanently delete:\n"
            f"• Backend files: {'YES' if self.delete_backend.isChecked() else 'NO'}\n"
            f"• Frontend files: {'YES' if self.delete_frontend.isChecked() else 'NO'}\n\n"
            f"This action cannot be undone!",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            # Get main window
            main_window = self.window()
            if hasattr(main_window, 'start_generation'):
                main_window.start_generation(
                    task_type="delete",
                    module_name=module_name,
                    backend_path=self.backend_path.text(),
                    frontend_path=self.frontend_path.text(),
                    delete_backend=self.delete_backend.isChecked(),
                    delete_frontend=self.delete_frontend.isChecked()
                )

class MainWindow(QMainWindow):
    """Main application window"""
    def __init__(self):
        super().__init__()
        self.generation_thread = None
        self.init_ui()
        
    def init_ui(self):
        self.setWindowTitle("🚀 Full Stack Module Generator GUI")
        self.setGeometry(100, 100, 1000, 700)  # Reduced size to avoid geometry warning
        
        # Create central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        main_layout = QVBoxLayout(central_widget)
        
        # Header
        header = QLabel("🚀 Full Stack Module Generator")
        header.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: white;
                padding: 15px;
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #2196F3, stop:1 #9C27B0);
                border-radius: 8px;
                margin-bottom: 10px;
            }
        """)
        header.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(header)
        
        # Create tab widget
        self.tabs = QTabWidget()
        
        # Add tabs
        self.tabs.addTab(ModuleCreationTab(), "✨ Create Module")
        self.tabs.addTab(BatchModeTab(), "📦 Batch Mode")
        self.tabs.addTab(AIClickUpTab(), "🤖 AI & ClickUp")
        self.tabs.addTab(DeleteModuleTab(), "🗑️ Delete Module")
        
        main_layout.addWidget(self.tabs)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        main_layout.addWidget(self.progress_bar)
        
        # Log output area
        log_group = QGroupBox("Log Output")
        log_layout = QVBoxLayout()
        
        self.log_output = QTextEdit()
        self.log_output.setReadOnly(True)
        self.log_output.setMaximumHeight(200)
        self.log_output.setStyleSheet("""
            QTextEdit {
                background-color: #f5f5f5;
                font-family: 'Courier New', monospace;
                font-size: 11px;
            }
        """)
        log_layout.addWidget(self.log_output)
        
        log_buttons = QHBoxLayout()
        btn_clear_log = QPushButton("🗑️ Clear Log")
        btn_clear_log.clicked.connect(lambda: self.log_output.clear())
        log_buttons.addWidget(btn_clear_log)
        
        btn_copy_log = QPushButton("📋 Copy Log")
        btn_copy_log.clicked.connect(self.copy_log)
        log_buttons.addWidget(btn_copy_log)
        
        btn_save_log = QPushButton("💾 Save Log...")
        btn_save_log.clicked.connect(self.save_log)
        log_buttons.addWidget(btn_save_log)
        
        log_layout.addLayout(log_buttons)
        log_group.setLayout(log_layout)
        main_layout.addWidget(log_group)
        
        # Status bar
        self.statusBar().showMessage("Ready")
        
        # Add some styling
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f0f0f0;
            }
            QGroupBox {
                font-weight: bold;
                border: 2px solid #cccccc;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
                background-color: white;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 10px 0 10px;
                color: #555;
            }
            QTabWidget::pane {
                border: 1px solid #cccccc;
                border-radius: 4px;
                background-color: white;
            }
            QTabBar::tab {
                padding: 8px 16px;
                margin-right: 2px;
                background-color: #e0e0e0;
                border: 1px solid #cccccc;
                border-bottom: none;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            QTabBar::tab:selected {
                background-color: white;
                border-bottom: 2px solid #2196F3;
            }
            QTabBar::tab:hover {
                background-color: #f0f0f0;
            }
            QListWidget, QTextEdit, QLineEdit, QTableWidget {
                border: 1px solid #cccccc;
                border-radius: 4px;
                padding: 4px;
                background-color: white;
            }
            QPushButton {
                padding: 6px 12px;
                border-radius: 4px;
                border: 1px solid #cccccc;
                background-color: #f5f5f5;
            }
            QPushButton:hover {
                background-color: #e0e0e0;
            }
        """)
        
    def log_message(self, message):
        """Add a message to the log"""
        self.log_output.append(message)
        self.log_output.moveCursor(QTextCursor.End)
        QApplication.processEvents()  # Update GUI
        
    def copy_log(self):
        """Copy log contents to clipboard"""
        clipboard = QApplication.clipboard()
        clipboard.setText(self.log_output.toPlainText())
        self.statusBar().showMessage("Log copied to clipboard", 3000)
        
    def save_log(self):
        """Save log to file"""
        log_text = self.log_output.toPlainText()
        if not log_text.strip():
            QMessageBox.warning(self, "Warning", "No log content to save!")
            return
            
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Save Log File", "generator-log.txt",
            "Text Files (*.txt);;All Files (*)"
        )
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(log_text)
                QMessageBox.information(self, "Success", f"Log saved to:\n{file_path}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save log:\n{str(e)}")
    
    def start_generation(self, task_type, **kwargs):
        """Start a generation task in a separate thread"""
        # Disable UI elements
        self.tabs.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.progress_bar.setValue(0)
        
        # Clear log
        self.log_output.clear()
        self.log_message(f"🚀 Starting {task_type.replace('_', ' ')}...")
        
        # Create and start thread
        self.generation_thread = GenerationThread(task_type, **kwargs)
        self.generation_thread.log_signal.connect(self.log_message)
        self.generation_thread.progress_signal.connect(self.progress_bar.setValue)
        self.generation_thread.finished_signal.connect(self.generation_finished)
        self.generation_thread.start()
        
    def generation_finished(self, success, message):
        """Handle generation completion"""
        # Re-enable UI
        self.tabs.setEnabled(True)
        self.progress_bar.setVisible(False)
        
        # Show completion message
        if success:
            self.log_message(f"✅ {message}")
            self.statusBar().showMessage("Generation completed successfully", 5000)
        else:
            self.log_message(f"❌ {message}")
            self.statusBar().showMessage("Generation failed", 5000)
            
        # Clean up thread
        self.generation_thread = None

def main():
    app = QApplication(sys.argv)
    
    # Set application style
    app.setStyle('Fusion')
    
    # Set application font
    font = QFont("Segoe UI", 10)
    app.setFont(font)
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()