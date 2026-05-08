# HOW TO RUN THE APPLICATION

To run the RecipeNest application locally, follow the steps below.

---

## 1. Required Applications

Ensure the following software is installed:

* Visual Studio Code (Frontend development)
* Visual Studio (Backend development)
* SQL Server Express
* Node.js and npm

---

## 2. Download the Repository

* Download or clone the repository to your local machine.
* Extract the project files to a preferred location if downloaded as a ZIP file.

---

## 3. Database Setup

* Open SQL Server Express or SQL Server Management Studio (SSMS).
* Locate and copy your SQL Server instance name (e.g. `Aisha\SQLExpress`).

---

## 4. Backend Setup and Launching

* Open Visual Studio.
* Navigate to:

```text
RecipeNestBackend > RecipeNest > RecipeNest.slnx
```

* Open the solution file.

### Configure Connection String

Update the connection string in:

```text
appsettings.json
```

Example:

```json
"ConnectionStrings": {
  "RecipeNestDatabase": "Data Source=Aisha\\SQLExpress;Initial Catalog=RecipeNestDB;Integrated Security=True;MultipleActiveResultSets=True;TrustServerCertificate=True"
}
```

### Configure Email Settings

Update the connection string in:

```text
appsettings.json
```

Update the `EmailSettings` section with your preferred sender email and password credentials.

### Configure JWT Secret key

Update the connection string in:

```text
appsettings.json
```

Update the `JWT` section by updating the secret key variable as chosen

### Apply Database Migration

Open the Package Manager Console and run:

```powershell
Update-Database
```

This creates the database tables from the existing migrations.

### Run Backend Server

* Navigate to:

```text
Properties > launchSettings.json
```

* Copy the HTTPS application URL, for example:

```text
https://localhost:7223
```

---

## 5. Frontend Setup and Launching

* Open the `RecipeNestFrontend` folder in Visual Studio Code.
* Open the terminal in the frontend directory.

### Install Dependencies

```bash
npm install
```

### Configure Environment Variable

Create and update the `.env` file with your backend URL:

```env
VITE_API_URL=https://localhost:7223/api
```

### Start Frontend Server

```bash
npm run dev
```

The frontend application should now run locally, for example:

```text
http://localhost:5173
```

---

## 6. Configure CORS and Routing

### Update Frontend URL in `Program.cs`

Ensure the frontend URL matches your local frontend server URL:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
```

### Update Password Reset URL

In `AuthController.cs`, update the reset link URL:

```csharp
var resetLink = $"http://localhost:5173/reset-password?email={dto.Email}&token={Uri.EscapeDataString(token)}";
```

### Configure JWT Secret Key

Ensure the JWT secret key configured in:

```text
Program.cs
```

matches the secret key set in:

```text
appsettings.json
```

* Run the application using the HTTPS profile.

The backend API should now be running.

---

## 7. Running the Application

* Open the frontend URL in the browser.
* Register a new account or log in using existing credentials.
* The frontend and backend should now communicate successfully.

---

## 8. Final Notes

* Ensure both frontend and backend servers are running simultaneously.
* Ensure frontend and backend URLs are configured correctly.
* Ensure SQL Server Express services are running before launching the backend.
