import axiosClient from './axiosClient'

export const getResumeStatus = () =>
  axiosClient.get('/resume').then((res) => res.data)

export const uploadResume = (file) => {
  const formData = new FormData()
  formData.append('file', file) // field name must match @RequestParam("file") on the backend

  return axiosClient
    .post('/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
}
