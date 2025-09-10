import axios from "axios";

const API_BASE_URL = "http://localhost:9000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const productService = {
  async getProducts(page = 1, limit = 10, search = "") {
    const response = await api.get(
      `/products?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
  },

  async getProduct(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(product) {
    const response = await api.post("/products", product);
    return response.data;
  },

  async updateProduct(id, product) {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id) {
    await api.delete(`/products/${id}`);
  },
};
