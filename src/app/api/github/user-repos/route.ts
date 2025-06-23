// app/api/github/user-repos/route.ts

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
  
    if (!username) {
      return new Response(JSON.stringify({ error: "Username is required" }), {
        status: 400,
      });
    }
  
    const response = await fetch(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`, // optional
        Accept: "application/vnd.github+json",
      },
    });
  
    const data = await response.json();
  
    return new Response(JSON.stringify(data), {
      status: response.status,
    });
  }
  