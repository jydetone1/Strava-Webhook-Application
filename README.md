Strava Webhook Application
A NestJS application that processes Strava webhook events, stores activities in a PostgreSQL database, and provides an API to retrieve activity details.

Features
. Handles Strava webhook events to save activities.

. Retrieves activities by ID via REST API.

. Uses TypeORM for PostgreSQL and ConfigModule for environment variables.

. Comprehensive unit tests with Jest

Prerequisites
. Node.js 18.x+

. npm 9.x+

. Docker (for PostgreSQL)

. Strava API credentials (Client ID, Client Secret, Verify Token)

Setup
. Clone the Repository
git clone <repository-url>
cd <repository-directory>

. Install Dependencies
npm install

. Configure Environment Variables
Create a .env file:
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=your db username
DB_PASSWORD=your db password
DB_NAME=your db name db
STRAVA_CLIENT_ID=<your-client-id>
STRAVA_CLIENT_SECRET=<your-client-secret>
STRAVA_VERIFY_TOKEN=<your-verify-token>

.Run PostgreSQL with Docker
Use docker-compose.yml:
services:
postgres:
image: postgres:16
environment:
POSTGRES_USER: your db username
POSTGRES_PASSWORD: your db password
POSTGRES_DB: your db name db
ports: - '5433:5432'
volumes: - postgres_data:/var/lib/postgresql/data
networks: - strava_network

volumes:
postgres_data:

networks:
strava_network:
driver: bridge

Start Docker:
docker-compose up -d

Running the Application

.Development Mode
npm run start:dev
Runs on http://localhost:3000.

.Production Mode
npm run build
npm run start:prod

Testing
.Run Tests
npm run test

.Check Coverage
npm run test -- --coverage

API Endpoints
.POST /webhook: Process Strava webhook events.
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{"object_type":"activity","object_id":123,"aspect_type":"create","updates":{},"owner_id":456,"subscription_id":789,"event_time":1234567890}'

.GET /webhook: Verify webhook subscriptions.
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=<your-verify-token>&hub.challenge=challenge123"

.GET /activities/:id: Retrieve an activity by ID
curl http://localhost:3000/activities/123

.GET /auth/login: Redirect to Strava OAuth authorization.
curl http://localhost:3000/auth/login

.GET /auth/callback: Handle Strava OAuth callback.
curl "http://localhost:3000/auth/callback?code=<strava-auth-code>"

Notes
.Database: TypeORM’s synchronize: true creates tables automatically. Set to false in production and use migrations:

npm run typeorm migration:generate -- -n <MigrationName>
npm run typeorm migration:run

.Strava Setup: Configure webhooks in Strava to point to http://<your-domain>:3000/webhook.
