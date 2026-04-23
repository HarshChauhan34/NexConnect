import API from "./api";

export const getEvents = ({ search = "", category = "All", page = 1, limit = 4 }) =>
  API.get("/events", {
    params: { search, category, page, limit },
  });

export const createEvent = (payload) => API.post("/events", payload);

export const deleteEvent = (id) => API.delete(`/events/${id}`);
