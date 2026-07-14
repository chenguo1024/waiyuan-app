import api from './client'

export async function getCarpoolRides() {
  return api.get('/carpool')
}

export async function createCarpoolRide(data: any) {
  return api.post('/carpool', data)
}

export async function joinCarpool(rideId: string) {
  return api.post(`/carpool/${rideId}/join`, {})
}
