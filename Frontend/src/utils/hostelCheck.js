// src/services/hostelService.js
import api from "./axiosRequest";

export const checkHostelAssignment = async () => {
  try {
    const response = await api.get("/api/student/check-hostel-assignment");
    // Return the response data so that the consumer can handle redirection if needed.
    return response.data;
  } catch (error) {
    // Propagate error for the caller to handle.
    throw error;
  }
};

export default { checkHostelAssignment };
