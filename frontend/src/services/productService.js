import API from "./api";

export const getProducts = ({ search = "", page = 1, limit = 4 }) =>
  API.get("/products", {
    params: { search, page, limit },
  });

export const createProduct = (payload) => API.post("/products", payload);

export const deleteProduct = (id) => API.delete(`/products/${id}`);
