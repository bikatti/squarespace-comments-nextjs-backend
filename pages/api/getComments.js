import fetch from 'node-fetch';

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function fetchComments(itemId, page) {
  const commentsUrl = `https://ek-staging.squarespace.com/api/comment/GetComments?targetId=${itemId}&targetType=1&page=1`;
  const data = await fetchJSON(commentsUrl);
  return data.comments;
}

async function fetchAllPages() {
  let pageNumber = 1;
  let allPagesData = [];

  while (true) {
    const url = `https://ek-staging.squarespace.com/home?format=json&page=${pageNumber}`;
    const data = await fetchJSON(url);

    if (!data.pagination) {
      break;
    }

    const pageData = {
      pageNumber,
      items: data.items.filter(item => item.commentCount).map(item => ({
        fullUrl: item.fullUrl,
        itemId: item.id,
        itemTitle: item.title,
      })),
    };

    allPagesData.push(pageData);

    pageNumber++;
  }

  return allPagesData;
}

async function fetchAndSortAllComments(allPagesData) {
  let allComments = [];

  for (let pageData of allPagesData) {
    const pageCommentsPromises = pageData.items.map(item => fetchComments(item.itemId, pageData.pageNumber));
    const pageComments = await Promise.all(pageCommentsPromises);
    allComments = allComments.concat(...pageComments);
  }

  allComments.sort((a, b) => b.addedOn - a.addedOn);

  return allComments
}

// Export the API route
export default async (req, res) => {
  if (req.method === 'GET') {
    try {
      const allPagesData = await fetchAllPages();
      console.log({ len: allPagesData.length, len2: allPagesData.map(e => e.items.length) })
      const allCommentsSortedByDate = await fetchAndSortAllComments(allPagesData);
      //console.log({ allCommentsSortedByDate })
      res.status(200).json(allCommentsSortedByDate);
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
