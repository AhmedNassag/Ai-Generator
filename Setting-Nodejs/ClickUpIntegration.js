import axios from "axios";
const clickup = axios.create({
  baseURL: "https://api.clickup.com/api/v2/",
  headers: {
    Authorization: "pk_87820491_Q0NXPOSEKO8SXIQKO10ZY7ZQZJDMJV4M",
  },
});

export async function getTask(taskId) {
  const res = await clickup.get(`/task/${taskId}`);
  return `Title: ${res.data.name}\nDescription: ${res.data.description}`;
}
