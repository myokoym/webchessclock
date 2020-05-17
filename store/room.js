export const state = () => ({
  id: undefined,
})

export const mutations = {
  setId(state, payload) {
    // debug: console.log("setRoomId: " + payload.roomId)
    state.id = payload.id
  },
}
