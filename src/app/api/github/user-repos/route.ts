import { Octokit } from "octokit"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // console.log(`[GitHub API] Fetching repos for user: ${username}`, {
  //   hasToken: !!process.env.GITHUB_PAT
  // })

  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_PAT,
    })

    const response = await octokit.request("GET /users/{username}/repos", {
      username,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        "accept": "application/vnd.github+json",
      },
    })

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to fetch repositories" }), {
      status: error.status || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
