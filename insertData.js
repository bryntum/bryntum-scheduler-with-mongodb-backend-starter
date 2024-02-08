import "./loadEnvironment.js";
import mongoose from "mongoose";
import { resourceSchema } from "./models/resource.js";
import { eventSchema } from "./models/event.js";
import { assignmentSchema } from "./models/assignment.js";
import { dependencySchema } from "./models/dependency.js";

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

// Create new ObjectIds for resources and events
const resourceMap = new Map();
resources.forEach((r) => {
  resourceMap.set(r.id, new mongoose.Types.ObjectId());
  r._id = resourceMap.get(r.id);
});

const eventMap = new Map();
events.forEach((e) => {
  eventMap.set(e.id, new mongoose.Types.ObjectId());
  e._id = eventMap.get(e.id);
});

// Update assignments and dependencies with the new ObjectIds
assignments.forEach((a) => {
  a._id = new mongoose.Types.ObjectId();
  a.eventId = eventMap.get(a.eventId);
  a.resourceId = resourceMap.get(a.resourceId);
});

dependencies.forEach((d) => {
  d._id = new mongoose.Types.ObjectId();
  d.from = eventMap.get(d.from);
  d.to = eventMap.get(d.to);
});

async function run() {
  let session;
  try {
    // Append the database name before the query parameters in the connection string
    const mongoDB = `${process.env.ATLAS_URI.split("?")[0]}${
      process.env.DB_NAME
    }?${process.env.ATLAS_URI.split("?")[1]}`;
    await mongoose.connect(mongoDB);
    // Define models after establishing the connection
    const DbResource = mongoose.model("Resource", resourceSchema);
    const DbEvent = mongoose.model("Event", eventSchema);
    const DbAssignment = mongoose.model("Assignment", assignmentSchema);
    const DbDependency = mongoose.model("Dependency", dependencySchema);

    const session = await mongoose.startSession();
    session.startTransaction();
    await Promise.all([
      DbResource.insertMany(resources, { session }),
      DbEvent.insertMany(events, { session }),
      DbAssignment.insertMany(assignments, { session }),
      DbDependency.insertMany(dependencies, { session }),
    ]);

    await session.commitTransaction();

    console.log("Data inserted successfully");
  } catch (err) {
    console.error(err.stack);
    if (session) {
      await session.abortTransaction();
    }
  } finally {
    if (session) {
      session.endSession();
    }
    mongoose.connection.close();
  }
}

run().catch(console.dir);
