import express from "express";
import Resource from "../models/resource.js";
import Event from "../models/event.js";
import Assignment from "../models/assignment.js";
import Dependency from "../models/dependency.js";

const router = express.Router();

router.get("/load", async (req, res) => {
  try {
    const resourcesPromise = Resource.find();
    const eventsPromise = Event.find();
    const assignmentsPromise = Assignment.find();
    const dependenciesPromise = Dependency.find();
    const [resources, events, assignments, dependencies] = await Promise.all([
      resourcesPromise,
      eventsPromise,
      assignmentsPromise,
      dependenciesPromise,
    ]);
    res
      .send({
        resources: { rows: resources },
        events: { rows: events },
        assignments: { rows: assignments },
        dependencies: { rows: dependencies },
      })
      .status(200);
  } catch (error) {
    console.error({ error });
    res.send({
      success: false,
      message: "There was an error loading the resources and events data.",
    });
  }
});

router.post("/sync", async (req, res) => {
  const { requestId, resources, events, assignments, dependencies } = req.body;

  let eventMapping = {};

  try {
    const response = { requestId, success: true };

    if (resources) {
      const rows = await applyCollectionChanges("resources", resources);
      // if new data to update client
      if (rows) {
        response.resources = { rows };
      }
    }

    if (events) {
      const rows = await applyCollectionChanges("events", events);
      if (rows) {
        if (events?.added) {
          rows.forEach((row) => {
            eventMapping[row.$PhantomId] = row.id;
          });
        }
        response.events = { rows };
      }
    }

    if (assignments) {
      if (events && events?.added) {
        assignments.added.forEach((assignment) => {
          assignment.eventId = eventMapping[assignment.eventId];
        });
      }
      const rows = await applyCollectionChanges("assignments", assignments);
      if (rows) {
        response.assignments = { rows };
      }
    }

    if (dependencies) {
      const rows = await applyCollectionChanges("dependencies", dependencies);
      if (rows) {
        response.dependencies = { rows };
      }
    }
    res.send(response);
  } catch (error) {
    console.error({ error });
    res.send({
      requestId,
      success: false,
      message: "There was an error syncing the data.",
    });
  }
});

async function applyCollectionChanges(store, changes) {
  let rows;
  if (changes.added) {
    rows = await createOperation(changes.added, store);
  }
  if (changes.removed) {
    await deleteOperation(changes.removed, store);
  }
  if (changes.updated) {
    await updateOperation(changes.updated, store);
  }
  // if got some new data to update client
  return rows;
}

function createOperation(added, store) {
  return Promise.all(
    added.map(async (record) => {
      const { $PhantomId, ...data } = record;
      let id;
      // Insert record into the store.rows array
      if (store === "resources") {
        const resource = await Resource.create(data);
        id = resource.id;
      }
      if (store === "events") {
        const event = await Event.create(data);
        id = event.id;
      }
      if (store === "assignments") {
        const assignment = await Assignment.create(data);
        id = assignment.id;
      }
      if (store === "dependencies") {
        const dependency = await Dependency.create(data);
        id = dependency.id;
      }
      // report to the client that we changed the record identifier
      return { $PhantomId, id };
    })
  );
}

function deleteOperation(deleted, store) {
  return Promise.all(
    deleted.map(async ({ id }) => {
      if (store === "resources") {
        await Resource.findByIdAndDelete(id);
      }
      if (store === "events") {
        await Event.findByIdAndDelete(id);
      }
      if (store === "assignments") {
        await Assignment.findByIdAndDelete(id);
      }
      if (store === "dependencies") {
        await Dependency.findByIdAndDelete(id);
      }
    })
  );
}

function updateOperation(updated, store) {
  return Promise.all(
    updated.map(async ({ id, ...data }) => {
      if (store === "resources") {
        await Resource.findByIdAndUpdate(id, data);
      }
      if (store === "events") {
        await Event.findByIdAndUpdate(id, data);
      }
      if (store === "assignments") {
        await Assignment.findByIdAndUpdate(id, data);
      }
      if (store === "dependencies") {
        await Dependency.findByIdAndUpdate(id, data);
      }
    })
  );
}

export default router;
