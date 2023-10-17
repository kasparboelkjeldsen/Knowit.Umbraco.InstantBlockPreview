export async function GetContent(href) {
  try {
    const response = await fetch(`/umbraco/delivery/api/v1/content/item/${href}`);
    if (!response.ok) {
      // Check if the response status is not in the 200-299 range
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error: ', error);
    return null;
  }
}
