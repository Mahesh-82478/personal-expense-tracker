# Personal Expense Tracker – Full Stack Java Application

A complete, persistent **Personal Expense Tracker** application built for the **EMA3151 Full Stack Development using Java** external laboratory examination.

---

## 1. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (JavaScript ES6+, Hooks) | Interactive Single-Page Application (SPA) UI |
| **Frontend Styling**| Custom CSS3 | Clean, modern, responsive styling without external UI libraries |
| **Backend** | Java 17/21/25 & Spring Boot 3.3.4 | Robust RESTful Web API service |
| **ORM / Persistence** | Spring Data JPA / Hibernate | Object-Relational Mapping and automated schema generation |
| **Database** | H2 Database Engine | File-based persistent relational database (`./data/expensedb.mv.db`) |
| **Validation** | Jakarta Bean Validation (Hibernate Validator) | Server-side payload validation |
| **Build Tools** | Apache Maven (Backend), npm / Vite (Frontend) | Dependency management and build automation |
| **Communication** | Native JavaScript `fetch()` API | Asynchronous HTTP JSON requests with CORS enabled |

---

## 2. Project Directory Structure

```text
personal-expense-tracker/
├── backend/
│   ├── data/
│   │   └── expensedb.mv.db             # H2 file-based persistent database file
│   ├── pom.xml                         # Maven dependencies & build configuration
│   └── src/
│       └── main/
│           ├── java/com/expensetracker/
│           │   ├── ExpenseTrackerApplication.java  # Main Spring Boot entry point
│           │   ├── config/
│           │   │   └── CorsConfig.java             # Global CORS configuration
│           │   ├── controller/
│           │   │   └── ExpenseController.java      # REST API endpoints (/api/expenses)
│           │   ├── entity/
│           │   │   └── Expense.java                # JPA Entity mapped to table 'expenses'
│           │   ├── exception/
│           │   │   ├── ErrorResponse.java          # Structured JSON error DTO
│           │   ├── exception/
│           │   │   ├── GlobalExceptionHandler.java # Centralized exception handling
│           │   │   └── ResourceNotFoundException.java # HTTP 404 custom exception
│           │   ├── repository/
│           │   │   └── ExpenseRepository.java      # Spring Data JPA repository
│           │   └── service/
│           │       └── ExpenseService.java         # Business logic layer
│           └── resources/
│               └── application.properties          # Port, H2 datasource, JPA settings
└── frontend/
    ├── index.html                      # HTML5 root template
    ├── package.json                    # Frontend dependencies & scripts
    ├── vite.config.js                  # Vite configuration
    └── src/
        ├── App.css                     # Custom CSS styles (cards, badges, table, forms)
        ├── App.jsx                     # Complete React component with state & fetch API
        ├── index.css                   # Global reset styles
        └── main.jsx                    # React root DOM mounting point
```

---

## 3. Quick Start Guide for Windows

### Prerequisites
Make sure the following are installed on your Windows machine:
- **Java JDK** (version 17, 21, or 25)
- **Apache Maven** (version 3.8+)
- **Node.js** (version 18+) & **npm**

Verify in PowerShell or Command Prompt:
```powershell
java -version
mvn -version
node -v
npm -v
```

---

### Step 1: Start the Backend (Spring Boot)

Open a terminal window and navigate to the `backend` folder:
```powershell
cd "c:\Expense Tracker 1\personal-expense-tracker\backend"
mvn spring-boot:run
```
> The backend server will start on: **`http://localhost:8080`**  
> H2 Database Web Console will be available at: **`http://localhost:8080/h2-console`**

---

### Step 2: Start the Frontend (React)

Open a **separate** terminal window and navigate to the `frontend` folder:
```powershell
cd "c:\Expense Tracker 1\personal-expense-tracker\frontend"
npm install
npm run dev
```
> The React development server will start on: **`http://localhost:5173`** (or `http://127.0.0.1:5173`)

Open your web browser and visit: **`http://localhost:5173`**

---

## 4. REST API Endpoint Reference

Base URL: `http://localhost:8080/api/expenses`

| HTTP Method | Endpoint URL | Request Body | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/expenses` | None | `200 OK` | Retrieves all saved expenses. |
| **GET** | `/api/expenses/{id}` | None | `200 OK` / `404 Not Found` | Retrieves a single expense by ID. |
| **POST** | `/api/expenses` | JSON (Expense object) | `201 Created` / `400 Bad Request` | Adds a new expense record after validation. |
| **PUT** | `/api/expenses/{id}` | JSON (Expense object) | `200 OK` / `400 Bad Request` / `404 Not Found` | Updates an existing expense record. |
| **DELETE** | `/api/expenses/{id}` | None | `200 OK` / `404 Not Found` | Deletes the expense record matching ID. |

### Sample JSON Request Body (POST / PUT)
```json
{
  "title": "Textbook Purchase",
  "amount": 750.50,
  "category": "Shopping",
  "date": "2026-10-18"
}
```

### Validation Rules
- **title**: Not blank (`@NotBlank`)
- **amount**: Required (`@NotNull`), minimum `0.01` (`@DecimalMin`)
- **category**: Must be one of `Food`, `Travel`, `Shopping`, `Other` (`@NotBlank`)
- **date**: Required valid `YYYY-MM-DD` date (`@NotNull`)

---

## 5. H2 Database & Web Console

The database is configured in **file-based persistent mode** (`jdbc:h2:file:./data/expensedb`).  
All records are saved permanently on disk in `backend/data/expensedb.mv.db` and persist across application and system restarts.

To inspect the database directly in your browser:
1. Open: **`http://localhost:8080/h2-console`**
2. Enter the JDBC parameters:
   - **Driver Class:** `org.h2.Driver`
   - **JDBC URL:** `jdbc:h2:file:./data/expensedb`
   - **User Name:** `sa`
   - **Password:** *(leave blank)*
3. Click **Connect**.
4. Run standard SQL queries, e.g.:
   ```sql
   SELECT * FROM EXPENSES;
   ```

---

## 6. How to Demonstrate in the Lab Examination

Follow this 5-minute script to demonstrate all requirements to the examiner:

1. **Overview**: Show the running React UI on `http://localhost:5173` with the "Personal Expense Tracker" heading and summary cards.
2. **Add Expense**:
   - Fill in Title (`"Dinner with Friends"`), Amount (`450.00`), Category (`Food`), Date.
   - Click **Add Expense**.
   - Point out the green success notification, table row addition, and automatic recalculation of **Total Expenses**.
3. **Form Validation**:
   - Try submitting with empty Title or Amount = 0 or negative.
   - Show the instant error notification preventing invalid entries.
4. **Category Filtering**:
   - Select `"Food"` from the Category filter dropdown.
   - Show that only food expenses appear, and the Category Total card reflects the filtered total.
   - Select `"All Categories"` to return to the full list.
5. **Edit Expense**:
   - Click the **Edit** button next to any item.
   - Show how the form is populated with the selected item's data and the button changes to "Update Expense".
   - Change the title or amount and click **Update Expense**.
   - Show the updated values in the table and recalculated total.
6. **Delete Expense with Confirmation**:
   - Click the **Delete** button next to an item.
   - Show the browser confirmation dialog box asking for confirmation.
   - Confirm deletion and observe the success notification and updated total.
7. **Database Persistence**:
   - Stop the backend server in terminal (`Ctrl + C`).
   - Restart the backend (`mvn spring-boot:run`).
   - Refresh the React page in the browser (`F5`).
   - Demonstrate that all records are still present and intact from the H2 database file.
