function makePostsArray() {
  return [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Test content for Post 1. Lorem ipsum, etc.',
      date_published: '2029-01-22T16:28:32.615Z'
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'Test content for Post 2. We are thinking of lorem ipsum again.',
      date_published: '2100-05-22T16:28:32.615Z'
    },
    {
      id: 3,
      title: 'Test Post 3',
      content: 'Test content for Post 3. Any more lorem ipsum available?',
      date_published: '1919-12-22T16:28:32.615Z'
    },
  ];
};

function makeMaliciousPost() {
  const maliciousPost = {
    id: 911,
    date_published: new Date().toISOString(),
    title: `Beware this malicious thing &lt;script&gt;alert("xss");&lt;/script&gt;`,
    content: `Pure evil vile image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  const expectedPost = {
    ...maliciousPost,
    title: `Beware this malicious thing &lt;script&gt;alert("xss");&lt;/script&gt;`,
    content: `Pure evil vile image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }

  return {
    maliciousPost,
    expectedPost,
  }
}

module.exports = {
  makePostsArray,
  makeMaliciousPost,
}