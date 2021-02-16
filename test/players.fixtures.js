function makePlayersArray() {
  return [
    {
      id: 1,
      first_name: 'Test First Name 1',
      last_name: 'Test Last Name 1',
      team: 'Test Team 1',
      position: 'Test Position 1',
      user_id: 1
    },
    {
      id: 2,
      first_name: 'Test First Name 2',
      last_name: 'Test Last Name 2',
      team: 'Test Team 2',
      position: 'Test Position 2',
      user_id: 1
    },
    {
      id: 3,
      first_name: 'Test First Name 3',
      last_name: 'Test Last Name 3',
      team: 'Test Team 3',
      position: 'Test Position 3',
      user_id: 1
    },
  ];
};

module.exports = {
    makePlayersArray,
}