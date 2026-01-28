Here's a sample README file for the "BackEndStarterKit" project based on the information provided. Feel free to customize it further based on your specific needs.

---

# BackEndStarterKit Project - Laravel Backend

This project provides the backend services for handling CRUD operations, file uploads, and other business logic. It is built using the Laravel framework and uses MongoDB as the database. The project is structured using a service-repository-controller pattern to ensure clean and maintainable code.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [Services](#services)
5. [Controllers](#controllers)
6. [CRUD Operations](#crud-operations)
7. [File Upload](#file-upload)
8. [Error Handling](#error-handling)
9. [License](#license)

## Project Overview

This project provides a set of APIs to perform CRUD operations on records stored in a MongoDB database. It includes various features like:
- CRUD functionality
- File uploads
- Response formatting
- Soft and force deletion of records

The project follows the **service-repository-controller** pattern to separate the concerns of business logic, data persistence, and presentation. The `BaseController` and `BaseService` classes ensure that all common operations are reused across different models and controllers.

## Installation

To get started with the project, follow these steps:

### Prerequisites

1. PHP >= 8.0
2. Composer
3. MongoDB
4. Laravel 10.x

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/PKKSA/BackEndStarterKit.git
   ```

2. Install dependencies:
   ```bash
   cd BackEndStarterKit
   composer install
   ```

3. Set up your environment variables:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Configure your MongoDB connection in the `.env` file:
   ```ini
   DB_CONNECTION=mongodb
   DB_HOST=localhost
   DB_PORT=27017
   DB_DATABASE=your_database_name
   ```

5. Generate the application key:
   ```bash
   php artisan key:generate
   ```
   
6. Generate the JWT Secret:
   ```bash
   php artisan jwt:secret
   ```
   
7. Run migrations (if applicable):
   ```bash
   php artisan migrate
   ```

8. Start the development server:
   ```bash
   php artisan serve
   ```

Now, your project should be up and running!

## Project Structure

Here’s an overview of the project structure:

```
app/
│
├── Http/
│   ├── Controllers/
|   |   └── [Your Controller]
│   │   └── Utils/
│   │       └── BaseController.php
│   ├── Requests/
│   └── Middleware/
│
├── Services/
|   |── Eloquent/
|   |   └── [Your Servic]
│   └── BaseService.php
│
├── Repositories/
|   |── Eloquent/
|   |   └── [Your Repository]
│   └── BaseRepository.php
│
├── Models/
│   └── [Your models]
|
├── Routes/
│       └── API
|            └──Modules/
│               └── [Your Route]
 
```

- **Controllers**: Handle HTTP requests and return responses.
- **Services**: Encapsulate the business logic and interact with repositories.
- **Repositories**: Interact directly with the database to retrieve or persist data.
- **Models**: Represent the database structure.
- **Middleware**: Handle additional tasks such as authentication and validation.

## Services

### BaseService

The `BaseService` class contains the business logic for handling records. It is used by the `BaseController` for creating, updating, and deleting records, as well as handling file uploads.

### Methods:
- `get(Request $request, $with = [], $withCount = [])`: Retrieve a list of items.
- `show($id, $with = [])`: Retrieve a single item by its ID.
- `create(Request $request)`: Create a new record.
- `update($id, Request $request)`: Update an existing record.
- `delete($id)`: Delete a record (soft delete).
- `forceDelete($id)`: Permanently delete a record.

## Controllers

### BaseController

The `BaseController` class is responsible for handling HTTP requests and responding with appropriate data.

### Methods:
- `index(Request $request)`: Retrieve a list of records.
- `show($id)`: Retrieve a single record by its ID.
- `store(Request $request)`: Create a new record.
- `update($id, Request $request)`: Update an existing record.
- `destroy($id)`: Delete a record.

## CRUD Operations

The project supports basic CRUD operations:

1. **Create**: Use the `store` method in the controller to create new records.
2. **Read**: Use the `index` and `show` methods in the controller to retrieve records.
3. **Update**: Use the `update` method in the controller to modify existing records.
4. **Delete**: Use the `destroy` method in the controller to delete records. Soft delete is supported by default, and force delete can be achieved by passing `forceDelete=true` in the request.

## File Upload

The `BaseService` handles file uploads. The `uploadFiles` method stores files in the `public/uploads` directory and returns the updated data with file paths.

### Supported File Storage
- Files are stored in the `storage/app/public/uploads/{model}/{field}` directory.
- The file path is returned in the response for use in your application.

## Error Handling

All methods in the controllers are wrapped in `try-catch` blocks to handle any exceptions. Standardized error responses are returned using the `error` method from the `ResponseController`.

### Command Line Tool Description

The provided script is a Node.js-based command-line tool designed to automate the creation of application components such as Models, Repositories, Services, Controllers, Routes, and Controller Tests for a PHP/Laravel application. It also updates route files with the newly generated module's routes. Below is a detailed explanation of its functionality:

---

### **Usage**
```bash
node add.js <ComponentName> <fillable_fields...>
```

- **`<ComponentName>`**: The name of the component/module you want to create (e.g., `User`, `Order`, etc.).
- **`<fillable_fields...>`**: (Optional) A list of field names for the model's `$fillable` property.

---

### **How It Works**
1. **Component Creation**:
   - The script generates the following components for the given `<ComponentName>`:
     - **Model**: Stored in `app/Models/`
     - **Repository**: Stored in `app/Repositories/Eloquent/`
     - **Service**: Stored in `app/Services/Eloquent/`
     - **Controller**: Stored in `app/Http/Controllers/`
     - **Routes**: Stored in `routes/API/Modules/`
     - **Controller Test**: Stored in `tests/Unit/`

  

2. **Dynamic Directory and File Creation**:
   - Creates a directory under the appropriate path (e.g., `app/Models/<ComponentName>`).
     
3. **Route File Update**:
   - Appends an `@include` statement to the main route file (`routes/API/index.php`) to include the generated module's routes.

---


### **Example**
#### Command:
```bash
node add.js User name email password
```

#### Output:
- **Directories Created**:
  - `app/Models/User/`
  - `app/Repositories/Eloquent/User/`
  - `app/Services/Eloquent/User/`
  - `app/Http/Controllers/User/`
  - `routes/API/Modules/User/`
  - `tests/Unit/User/`

- **Files Generated**:
  - `app/Models/User/User.php` (Model)
  - `app/Repositories/Eloquent/User/UserRepository.php`
  - `app/Services/Eloquent/User/UserService.php`
  - `app/Http/Controllers/User/UserController.php`
  - `routes/API/Modules/User/UserRoutes.php`
  - `tests/Unit/User/UserControllerTest.php`

- **Route File Update**:
  - Adds the following line to `routes/API/index.php`:
    ```php
    @include('Modules/User/UserRoutes.php');
    ```

---

### **Error Handling**
- Throws an error if:
  - A file or template cannot be read.
  - A directory cannot be created.
  - An error occurs while writing the output file.

---
 

 

### **1. Date Filtering (`filterDate`)**

**Description**: Filter records by a specific date or with a date comparison operator (e.g., `>=`, `<=`).

**Parameter**:  
`filterDate` – A string in the format `fieldName|dateValue|operator` (operator is optional; defaults to `=`).

**Example HTTP Request**:
```http
GET /api/items?filterDate=created_at|2025-01-01|>=
```

---

### **2. Date Range Filtering (`filterDateBetween`)**

**Description**: Filter records within a date range.

**Parameter**:  
`filterDateBetween` – A string in the format `fieldName|startDate|endDate`.

**Example HTTP Request**:
```http
GET /api/items?filterDateBetween=created_at|2025-01-01|2025-01-10
```

---

### **3. General Filtering (`filter`)**

**Description**: Apply single or multiple filters with conditions joined by `&&`.

**Parameter**:  
`filter` – A string in the format `fieldName|value|operator` (multiple filters separated by `&&`).

**Example HTTP Request**:
```http
GET /api/items?filter=status|active|=
```
```http
GET /api/items?filter=status|active|=&&price|100|>=
```

---

### **4. "In" Filtering (`filterIn`)**

**Description**: Filter records where a field matches any of the specified values.

**Parameter**:  
`filterIn` – A string in the format `fieldName|value1,value2,value3`.

**Example HTTP Request**:
```http
GET /api/items?filterIn=status|active,inactive
```

---

### **5. Regex Filtering (`regex`)**

**Description**: Apply a regex filter to match field values.

**Parameter**:  
`regex` – A string in the format `fieldName|regexPattern`.

**Example HTTP Request**:
```http
GET /api/items?regex=name|^A.*$
```

---

### **6. Sorting (`sort`)**

**Description**: Sort results by a field in ascending or descending order.

**Parameter**:  
`sort` – A string in the format `fieldName|direction` (direction is either `asc` or `desc`).

**Example HTTP Request**:
```http
GET /api/items?sort=price|asc
```

---

### **7. Pagination**

**Description**: Paginate the results with a specified page number and items per page.

**Parameters**:  
- `page` – The current page number.  
- `perPage` – The number of items per page.

**Example HTTP Request**:
```http
GET /api/items?page=2&perPage=10
```

---

### **8. Searching (`search`)**

**Description**: Perform a search across specific fields in the model.

**Parameters**:  
- `search` – The search keyword.  
- `columns` – (Optional) A list of columns to search, defaulting to the model's `fillable` fields.

**Example HTTP Request**:
```http
GET /api/items?search=example
```

---

### **9. Column Selection (`select`)**

**Description**: Return only the specified columns in the response.

**Parameter**:  
`select` – A string of column names separated by `|`.

**Example HTTP Request**:
```http
GET /api/items?select=id|name|price
```

---

### **10. Count (`count`)**

**Description**: Return the total count of results without applying pagination.

**Parameter**:  
`count` – Any truthy value (e.g., `1`, `true`).

**Example HTTP Request**:
```http
GET /api/items?count=1
```

---

### **Complete HTTP Request Example**

```http
GET /api/items
?filter=status|active|=
&filterDate=created_at|2025-01-01|>=
&filterIn=category|electronics,appliances
&search=laptop
&sort=price|asc
&page=1
&perPage=15
&select=id|name|price|created_at
```

**Explanation**:
- Filters items with `status = active`, `created_at >= 2025-01-01`, and `category` in `electronics` or `appliances`.
- Searches for `laptop`.
- Sorts by `price` in ascending order.
- Paginates the results (15 items per page, page 1).
- Returns only the `id`, `name`, `price`, and `created_at` fields.

 
 

