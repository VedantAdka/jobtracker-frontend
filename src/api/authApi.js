import axiosClient from './axiosClient'

export const registerUser = (data) =>
  axiosClient.post('/auth/register', data).then((res) => res.data)

export const loginUser = (data) =>
  axiosClient.post('/auth/login', data).then((res) => res.data)

export const getCurrentUser = () =>
  axiosClient.get('/auth/me').then((res) => res.data)
