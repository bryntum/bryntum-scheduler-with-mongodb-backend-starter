import { MongoClient } from "mongodb";
import "./loadEnvironment.js";

// Replace the following with your Atlas connection string
const connectionString = process.env.ATLAS_URI || "";
const client = new MongoClient(connectionString);

const resources = [
  { id: 1, name: "Peter" },
  { id: 2, name: "Kate" },
  { id: 3, name: "Winston" },
  { id: 4, name: "Joshua" },
  { id: 5, name: "James" },
  { id: 6, name: "Leanne" },
];

const events = [
  {
    id: 1,
    startDate: "2024-02-19T09:00",
    endDate: "2024-02-19T10:30",
    name: "Conference call",
  },
  {
    id: 2,
    startDate: "2024-02-19T11:30",
    endDate: "2024-02-19T13:00",
    name: "Sprint planning",
  },
  {
    id: 3,
    startDate: "2024-02-19T12:00",
    endDate: "2024-02-19T13:30",
    name: "Team meeting",
  },
  {
    id: 4,
    startDate: "2024-02-19T14:00",
    endDate: "2024-02-19T15:45",
    name: "Client presentation",
  },
  {
    id: 5,
    startDate: "2024-02-19T15:30",
    endDate: "2024-02-19T16:45",
    name: "Project review",
  },
  {
    id: 6,
    startDate: "2024-02-19T17:00",
    endDate: "2024-02-19T18:30",
    name: "Marketing discussion",
  },
  {
    id: 7,
    startDate: "2024-02-19T08:00",
    endDate: "2024-02-19T09:00",
    name: "Breakfast Briefing",
  },
  {
    id: 8,
    startDate: "2024-02-19T16:00",
    endDate: "2024-02-19T17:45",
    name: "Technology Update",
  },
  {
    id: 9,
    startDate: "2024-02-19T14:15",
    endDate: "2024-02-19T15:15",
    name: "HR Update",
  },
  {
    id: 10,
    startDate: "2024-02-19T11:00",
    endDate: "2024-02-19T12:45",
    name: "Financial Planning",
  },
];

const assignments = [
  {
    id: 1,
    eventId: 1,
    resourceId: 1,
  },
  {
    id: 2,
    eventId: 2,
    resourceId: 1,
  },
  {
    id: 3,
    eventId: 3,
    resourceId: 3,
  },

  {
    id: 5,
    eventId: 4,
    resourceId: 3,
  },
  {
    id: 6,
    eventId: 5,
    resourceId: 6,
  },
  {
    id: 7,
    eventId: 6,
    resourceId: 2,
  },
  {
    id: 8,
    eventId: 7,
    resourceId: 4,
  },
  {
    id: 9,
    eventId: 8,
    resourceId: 4,
  },
  {
    id: 10,
    eventId: 9,
    resourceId: 5,
  },
  {
    id: 11,
    eventId: 10,
    resourceId: 5,
  },
];

const dependencies = [
  {
    id: 1,
    from: 1,
    to: 2,
  },
  {
    id: 2,
    from: 3,
    to: 4,
  },
];

const schedulerData = {
  events: {
    rows: events,
  },
  resources: {
    rows: resources,
  },
  assignments: {
    rows: assignments,
  },
  dependencies: {
    rows: dependencies,
  },
};

async function run() {
  try {
    // Connect to the Atlas cluster
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    // Reference the "data" collection in the specified database
    const col = db.collection("data");

    const result = await col.insertOne(schedulerData);
    console.log("Data inserted successfully, document ID:", result.insertedId);
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
