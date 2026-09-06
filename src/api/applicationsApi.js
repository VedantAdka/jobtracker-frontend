import axiosClient from './axiosClient'

export const getApplications = () =>
  axiosClient.get('/applications').then((res) => res.data)

export const createApplication = (data) =>
  axiosClient.post('/applications', data).then((res) => res.data)

export const updateApplication = (id, data) =>
  axiosClient.put(`/applications/${id}`, data).then((res) => res.data)

export const deleteApplication = (id) =>
  axiosClient.delete(`/applications/${id}`)

export const analyzeApplication = (id, jobDescription) =>
  axiosClient.post(`/applications/${id}/analyze`, { jobDescription }).then((res) => res.data)
