import axiosClient from './axiosClient'

export const generateQuestions = (applicationId) =>
  axiosClient.post(`/applications/${applicationId}/questions/generate`).then((res) => res.data)

export const getQuestions = (applicationId) =>
  axiosClient.get(`/applications/${applicationId}/questions`).then((res) => res.data)

export const updateQuestion = (applicationId, questionId, practiced) =>
  axiosClient
    .put(`/applications/${applicationId}/questions/${questionId}`, { practiced })
    .then((res) => res.data)
