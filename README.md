# Startup Team Builder Platform Backend

The Startup Team Builder Platform Backend is a RESTful API built with Express.js and MongoDB. It serves as the core service layer for the Startup Ecosystem Platform, handling data management, business logic, authentication workflows, startup operations, opportunity management, application processing, and administrative functionality.

The backend is responsible for managing interactions between users, founders, startups, opportunities, subscriptions, and platform administrators. It provides secure endpoints for creating, updating, retrieving, and deleting data while maintaining a structured and scalable architecture.

MongoDB is used as the primary database for storing user information, startup profiles, opportunities, applications, subscriptions, and platform-related data. Express.js is used to create API endpoints and manage server-side operations. Environment variables are utilized to secure sensitive configuration values such as database credentials and API keys.

The API supports advanced features including search functionality, filtering, pagination, role-based data access, startup opportunity management, user application tracking, and administrative controls. The backend is designed to work seamlessly with the Next.js frontend application and provides structured JSON responses for all client requests.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- dotenv
- CORS

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd programming-hero-a-10-server-side
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node index.js
```

For development:

```bash
nodemon index.js
```

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5000

DB_USER=your_database_user
DB_PASS=your_database_password

MONGODB_URI=your_mongodb_connection_string
```

## API Responsibilities

The backend manages the following functionalities:

- User management
- Startup management
- Opportunity creation and retrieval
- Opportunity application processing
- Subscription management
- Search and filtering
- Pagination
- Dashboard statistics
- Administrative operations
- Database interactions

## Database Collections

The application uses multiple MongoDB collections to organize platform data efficiently.

### Users Collection

Stores user account information, roles, profile details, and access-related data.

### Startups Collection

Stores startup profiles, founder information, business details, and platform visibility data.

### Opportunities Collection

Stores startup opportunities, role descriptions, requirements, work types, ecosystem segments, and publishing information.

### Applications Collection

Stores user applications submitted for opportunities and tracks application status.

### Subscriptions Collection

Stores payment and subscription-related information.

## Search, Filtering and Pagination

The API supports searching opportunities by keywords and filtering them by ecosystem segment and work type. Pagination is implemented to improve performance and reduce unnecessary data transfer when working with large datasets.

Example query parameters:

```text
/api/all-opportunities?search=developer&page=1&workType=Remote&ecosystemSegment=Fintech
```

## API Response Structure

Successful API responses are returned in JSON format.

Example:

```json
{
  "data": [],
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 30
}
```

## Project Structure

```text
programming-hero-a-10-server-side
│
├── index.js
├── .env
├── package.json
└── node_modules
```

As the application grows, routes, middleware, utilities, and controllers can be separated into dedicated directories to improve maintainability and scalability.

## Security Considerations

Sensitive information should never be hardcoded into the application. Environment variables should be used for database credentials and API configuration. Proper validation and authorization mechanisms should be implemented before exposing the application to production environments.

## Future Improvements

Potential future enhancements include JWT authentication, role-based authorization middleware, request validation, centralized error handling, logging systems, rate limiting, payment webhooks, caching, and real-time notifications.

## License

This project was developed for educational and portfolio purposes.