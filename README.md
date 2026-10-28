# Community Property Management System

A full-stack web application designed to simplify residential society management. The system provides role-based access for administrators, residents, and staff to manage community activities through a centralized platform.

## Features

- **Authentication & Authorization:** Login, JWT-based authentication, and role-based access.
- **Dashboard:** Community overview and activity summaries.
- **Announcements:** Create, view, and manage society announcements.
- **Community Posts:** Create posts, add comments, edit posts, and delete posts.
- **Maintenance Management:** Submit maintenance requests and manage their statuses.
- **Facility Bookings:** Create bookings, view booking details, approve or reject requests, and cancel eligible bookings.
- **Payment Records:** View and manage payment records through a demo payment module.
- **User Management:** Manage community users according to permissions.
- **Auto-Refresh:** Selected pages periodically refresh their displayed data.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| API Communication | Axios, REST APIs |
| Backend | Java, Spring Boot |
| Security | Spring Security, JWT |
| Persistence | Spring Data JPA, Hibernate |
| Database | MySQL |
| Build Tool | Maven |
| Development Tools | IntelliJ IDEA, Visual Studio Code |

## Project Architecture

The application follows a client-server architecture.

1. The React frontend provides the user interface.
2. Axios communicates with the backend REST APIs.
3. Spring Boot handles business logic and API requests.
4. Spring Security and JWT support authentication and authorization.
5. Spring Data JPA and Hibernate connect the backend to MySQL.

## Project Structure

```text
community-property-management-main/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/
│           └── resources/
│               └── application.yml
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
└── README.md
```

## Prerequisites

Install the following software before running the application:

- Java JDK compatible with the project configuration
- Maven
- MySQL Server
- Node.js and npm
- IntelliJ IDEA or another Java IDE
- Visual Studio Code or another frontend editor

## Setup and Installation

### 1. Clone the Repository

After publishing this project to GitHub, clone it using:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd community-property-management-main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Configure the Database

Create the MySQL database:

```sql
CREATE DATABASE community_db;
```

Update the database connection settings in:

`backend/src/main/resources/application.yml`

Use your own MySQL username and password. Never publish database passwords or JWT secrets in a public repository.

### 3. Run the Backend

Open the `backend` folder in IntelliJ IDEA and run the Spring Boot application.

The backend is configured to use:

```text
http://localhost:8081
```

The API base URL is:

```text
http://localhost:8081/api
```

Ensure that MySQL is running and the backend configuration matches your local database setup.

### 4. Run the Frontend

Open the `frontend` folder in Visual Studio Code and run:

```bash
npm install
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

Make sure the frontend API configuration points to the running backend.

## User Roles

| Role | Responsibilities |
|---|---|
| Admin | Manage announcements, users, bookings, and relevant community operations |
| Resident | View announcements, create posts, submit maintenance requests, book facilities, and access available payment records |
| Staff | Access and manage assigned maintenance operations according to permissions |

Available operations depend on the application's configured authorization rules.

## Security

- JWT-based authentication.
- Role-based access control.
- Protected backend endpoints.
- Credential and secret management should be configured before public deployment.

## Future Enhancements

- Integration with a real payment gateway.
- Email and notification services.
- Cloud deployment.
- Automated unit and integration testing.
- Enhanced reports and analytics.

## Screenshots

Screenshots of the Dashboard, Announcements, Bookings, Maintenance, Posts, and Payments pages can be added here.

## Author

**Samruddhi Karale**

BE — Artificial Intelligence and Data Science

## License

This project was developed for educational and academic purposes.
