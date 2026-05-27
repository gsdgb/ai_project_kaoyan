from duckduckgo_search import DDGS


def search_web(query: str):
    results = []

    with DDGS() as ddgs:
        response = ddgs.text(
            query,
            max_results=5,
        )

        for item in response:
            results.append({
                "title": item["title"],
                "body": item["body"],
                "link": item["href"],
            })

    return results